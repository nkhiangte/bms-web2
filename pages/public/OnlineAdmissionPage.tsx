
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, OnlineAdmission, Gender, Category, BloodGroup, Student, User } from '../../types';
import { GRADES_LIST, GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../../constants';
import { UploadIcon, SpinnerIcon, CheckIcon, UserIcon, SearchIcon, ArrowRightIcon, BackIcon, SaveIcon, DocumentReportIcon, CheckCircleIcon, HomeIcon } from '../../components/Icons';
import { uploadToImgBB, resizeImage, getNextGrade } from '../../utils';
import CustomDatePicker from '../../components/CustomDatePicker';
import { db } from '../../firebaseConfig';
import EditableContent from '../../components/EditableContent';

const { useNavigate, useLocation, Link } = ReactRouterDOM as any;

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id'>) => Promise<string>;
    user: User | null;
}

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit, user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState<1 | 2>(1); // 1: Selection, 2: Form
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [searchId, setSearchId] = useState('');
    
    // Retrieval State
    const [retrieveAppId, setRetrieveAppId] = useState('');
    const [retrieveDob, setRetrieveDob] = useState('');
    const [retrievalError, setRetrievalError] = useState('');

    // Success State
    const [submittedApplication, setSubmittedApplication] = useState<{ id: string, contact: string, grade: string } | null>(null);

    const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});

    // Added 'id' field to track if we are editing an existing draft
    const [formData, setFormData] = useState<Partial<OnlineAdmission> & Omit<OnlineAdmission, 'id' | 'submissionDate' | 'status'>>({
        studentType: 'Newcomer',
        admissionGrade: '',
        studentName: '',
        dateOfBirth: '',
        gender: Gender.MALE,
        studentAadhaar: '',
        fatherName: '',
        motherName: '',
        fatherOccupation: '',
        motherOccupation: '',
        parentAadhaar: '',
        guardianName: '',
        guardianRelationship: '',
        permanentAddress: '',
        presentAddress: '',
        contactNumber: '',
        email: '',
        penNumber: '',
        motherTongue: '',
        isCWSN: 'No',
        bloodGroup: '',
        lastSchoolAttended: '',
        lastDivision: '',
        generalBehaviour: '',
        siblingsInSchool: 0,
        achievements: '',
        healthIssues: '',
        birthCertificateUrl: '',
        transferCertificateUrl: '',
        reportCardUrl: '',
        paymentScreenshotUrl: '', 
    });

    useEffect(() => {
        // Check if we are editing an existing admission passed via state (Admin action)
        if (location.state && location.state.editingAdmission) {
            const admission = location.state.editingAdmission as OnlineAdmission;
            setFormData(admission);
            setStep(2);
        }
    }, [location.state]);

    const handleNewcomerSelect = () => {
        setFormData(prev => ({ ...prev, studentType: 'Newcomer', lastSchoolAttended: '' }));
        setStep(2);
    };

    const handleRetrieveApplication = async (e: FormEvent) => {
        e.preventDefault();
        if (!retrieveAppId || !retrieveDob) {
            setRetrievalError("Please enter both Application ID and Date of Birth.");
            return;
        }

        setIsFetching(true);
        setRetrievalError('');

        try {
            const docRef = db.collection('online_admissions').doc(retrieveAppId.trim());
            const doc = await docRef.get();

            if (doc.exists) {
                const data = doc.data() as OnlineAdmission;
                // Normalize dates for comparison (assuming storage is YYYY-MM-DD or ISO)
                const storedDob = data.dateOfBirth;
                
                if (storedDob === retrieveDob) {
                    if (data.isEnrolled) {
                         setRetrievalError("This student is already enrolled. Please contact the office.");
                    } else {
                        setFormData({ ...data, id: doc.id }); // Set ID to enable update mode
                        setStep(2);
                    }
                } else {
                    setRetrievalError("Date of Birth does not match the application record.");
                }
            } else {
                setRetrievalError("No application found with this ID.");
            }
        } catch (error) {
            console.error("Error retrieving application:", error);
            setRetrievalError("Failed to retrieve application. Please try again.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleFetchStudent = async (e: FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) {
            setFetchError("Please enter a Student ID.");
            return;
        }

        setIsFetching(true);
        setFetchError('');
        
        const idToSearch = searchId.trim().toUpperCase();

        try {
            let foundStudent: Student | null = null;

            // Strategy 1: Direct lookup by studentId field
            const querySnapshot = await db.collection('students')
                .where('studentId', '==', idToSearch)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                foundStudent = querySnapshot.docs[0].data() as Student;
            } 
            
            // Strategy 2: If not found and ID format is valid (BMS + Year + Grade + Roll), search by Grade + Roll
            if (!foundStudent && idToSearch.startsWith('BMS') && idToSearch.length >= 9) {
                // Parse ID: BMS(3) + YY(2) + GG(2) + RR(2+)
                const yearSuffix = idToSearch.substring(3, 5); // e.g., '25'
                const gradeCode = idToSearch.substring(5, 7); // e.g., '09'
                const rollNoStr = idToSearch.substring(7); // e.g., '02'
                const rollNo = parseInt(rollNoStr, 10);

                const gradeMap: Record<string, Grade> = {
                    'NU': Grade.NURSERY, 'KG': Grade.KINDERGARTEN,
                    '01': Grade.I, '02': Grade.II, '03': Grade.III, '04': Grade.IV, '05': Grade.V,
                    '06': Grade.VI, '07': Grade.VII, '08': Grade.VIII, '09': Grade.IX, '10': Grade.X
                };
                const grade = gradeMap[gradeCode];

                if (grade && !isNaN(rollNo)) {
                    // Try to find active student with this Grade and Roll. 
                    // Note: Removing 'status' filter from query to handle potential casing issues or manual data entry errors.
                    const fallbackSnapshot = await db.collection('students')
                        .where('grade', '==', grade)
                        .where('rollNo', '==', rollNo)
                        .get();
                    
                    if (!fallbackSnapshot.empty) {
                        const targetStartYear = `20${yearSuffix}`; // e.g., '2025'
                        
                        // Find best match in memory
                        const match = fallbackSnapshot.docs.find(doc => {
                            const s = doc.data() as Student;
                            
                            // Check status (case-insensitive)
                            const status = s.status ? s.status.toLowerCase() : '';
                            if (status !== 'active') return false;

                            // Check Academic Year if present
                            if (s.academicYear) {
                                return s.academicYear.startsWith(targetStartYear);
                            }
                            // If academic year is missing but they are active, assume it's the correct student (legacy data support)
                            return true;
                        });
                        
                        if (match) {
                            foundStudent = match.data() as Student;
                            // Ensure studentId is set if it was missing in the doc
                            if (!foundStudent.studentId) foundStudent.studentId = idToSearch;
                        }
                    }
                }
            }

            if (foundStudent) {
                const nextGrade = getNextGrade(foundStudent.grade);

                setFormData(prev => ({
                    ...prev,
                    studentType: 'Existing',
                    previousStudentId: foundStudent!.studentId || idToSearch,
                    admissionGrade: nextGrade || '',
                    studentName: foundStudent!.name,
                    dateOfBirth: foundStudent!.dateOfBirth,
                    gender: foundStudent!.gender,
                    studentAadhaar: foundStudent!.aadhaarNumber,
                    fatherName: foundStudent!.fatherName,
                    motherName: foundStudent!.motherName,
                    fatherOccupation: foundStudent!.fatherOccupation,
                    motherOccupation: foundStudent!.motherOccupation,
                    parentAadhaar: foundStudent!.fatherAadhaar || foundStudent!.motherAadhaar,
                    guardianName: foundStudent!.guardianName,
                    guardianRelationship: foundStudent!.guardianRelationship,
                    permanentAddress: foundStudent!.address,
                    presentAddress: foundStudent!.address,
                    contactNumber: foundStudent!.contact,
                    penNumber: foundStudent!.pen,
                    religion: foundStudent!.religion,
                    category: foundStudent!.category,
                    isCWSN: foundStudent!.cwsn?.toLowerCase() === 'yes' ? 'Yes' : 'No',
                    bloodGroup: foundStudent!.bloodGroup,
                    lastSchoolAttended: 'Bethel Mission School',
                    healthIssues: foundStudent!.healthConditions,
                    achievements: foundStudent!.achievements,
                }));
                setStep(2);
            } else {
                setFetchError("No student found with this ID. Please check the ID and try again.");
            }
        } catch (error: any) {
            console.error("Error fetching student:", error);
            if (error.code === 'permission-denied') {
                 setFetchError("System Error: Permission denied. Please contact the administrator.");
            } else {
                 setFetchError("An error occurred while fetching details. Please check your internet connection.");
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: any, type?: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof OnlineAdmission) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus(prev => ({ ...prev, [fieldName]: 'uploading' }));
        try {
            const compressed = await resizeImage(file, 800, 800, 0.8);
            const url = await uploadToImgBB(compressed);
            setFormData(prev => ({ ...prev, [fieldName]: url }));
            setUploadStatus(prev => ({ ...prev, [fieldName]: 'success' }));
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadStatus(prev => ({ ...prev, [fieldName]: 'error' }));
            alert("Failed to upload image. Please try again.");
        }
    };

    const generateTempId = () => {
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random
        return `BMS26${randomNum}`;
    };

    // Placeholder for SMS integration
    const sendAdmissionConfirmationSMS = async (phoneNumber: string, refId: string, studentName: string) => {
        // In a real application, you would call your backend API here (e.g., Firebase Cloud Function).
        // Example: await fetch('/api/send-sms', { method: 'POST', body: JSON.stringify({ to: phoneNumber, ... }) });
        
        console.log(`[SMS SIMULATION] Sending to ${phoneNumber}: "Dear ${studentName}, your admission application for BMS has been received. Your Reference ID is ${refId}. Please save this for future tracking."`);
        
        // Return true to simulate success
        return true;
    };

    const handleSaveDraft = async () => {
        if (!formData.studentName || !formData.dateOfBirth) {
            alert("Please provide at least Name and Date of Birth to save a draft.");
            return;
        }

        setIsSubmitting(true);
        try {
            let draftId = formData.id;
            
            // If no ID, generate one
            if (!draftId) {
                draftId = generateTempId();
            }

            const draftData = {
                ...formData,
                id: draftId,
                submissionDate: formData.submissionDate || new Date().toISOString(),
                status: 'draft',
            };

            await db.collection('online_admissions').doc(draftId).set(draftData, { merge: true });
            
            setFormData(prev => ({ ...prev, id: draftId })); // Update local state
            
            alert(`Application Saved as Draft! \n\nYour Temporary ID is: ${draftId} \n\nPlease save this ID to resume your application later.`);
        } catch (error) {
            console.error("Error saving draft:", error);
            alert("Failed to save draft. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.studentName || !formData.admissionGrade || !formData.dateOfBirth || !formData.fatherName || !formData.contactNumber) {
            alert("Please fill in all mandatory fields marked with *.");
            return;
        }

        if (formData.admissionGrade !== Grade.NURSERY && !formData.transferCertificateUrl && formData.studentType === 'Newcomer') {
            alert("Transfer Certificate is required for newcomers in classes above Nursery.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Determine if direct approval is allowed (Excluding IX and X)
            const requiresReview = formData.admissionGrade === Grade.IX || formData.admissionGrade === Grade.X;
            const initialStatus = requiresReview ? 'pending' : 'approved';
            
            let submissionId = formData.id;
            if (!submissionId) {
                submissionId = generateTempId();
            }
            
            const submissionData = {
                ...formData,
                id: submissionId,
                submissionDate: formData.submissionDate || new Date().toISOString(),
                status: initialStatus
            };

            // Use .set with merge to update existing draft or create new with specific ID
            await db.collection('online_admissions').doc(submissionId).set(submissionData, { merge: true });

            if (requiresReview) {
                // Send SMS for review-required classes (e.g. Class IX)
                await sendAdmissionConfirmationSMS(formData.contactNumber, submissionId, formData.studentName || 'Applicant');

                // Instead of navigating, show success state on this page so they can note the ID
                setSubmittedApplication({
                    id: submissionId,
                    contact: formData.contactNumber,
                    grade: formData.admissionGrade || 'Class IX'
                });
            } else {
                // Direct to payment for auto-approved grades
                navigate(`/admissions/payment/${submissionId}`, { 
                    state: { 
                        grade: formData.admissionGrade, 
                        studentName: formData.studentName, 
                        fatherName: formData.fatherName, 
                        contact: formData.contactNumber, 
                        studentType: formData.studentType
                    } 
                });
                alert(`Application Submitted & Approved! Redirecting to payment...`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedApplication) {
        return (
            <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl text-center border-t-8 border-emerald-500">
                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                            <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Application Submitted!</h1>
                        <p className="text-slate-600 text-lg">Thank you for applying to Bethel Mission School.</p>
                        
                        <div className="my-8 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                            <p className="text-sm uppercase font-bold text-slate-500 mb-2">Your Temporary Reference ID</p>
                            <div className="text-4xl font-mono font-bold text-sky-700 tracking-wider select-all">
                                {submittedApplication.id}
                            </div>
                            <p className="text-sm text-red-600 font-semibold mt-4 bg-red-50 p-2 rounded inline-block">
                                ⚠️ Please write this ID down immediately!
                            </p>
                        </div>

                        <div className="text-left bg-sky-50 p-4 rounded-md border border-sky-100 mb-8 text-sm text-sky-800">
                            <p className="font-semibold mb-2">What happens next?</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>An SMS has been sent to <strong>{submittedApplication.contact}</strong> with this ID.</li>
                                <li>Your application for <strong>{submittedApplication.grade}</strong> is now under review.</li>
                                <li>You can use this ID to check your status or pay fees later.</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => window.print()}
                                className="btn btn-secondary flex items-center justify-center gap-2"
                            >
                                Print Page
                            </button>
                            <Link to="/admissions/status" className="btn btn-primary bg-sky-600 hover:bg-sky-700">
                                Check Status / Login
                            </Link>
                            <Link to="/" className="btn btn-secondary flex items-center justify-center gap-2">
                                <HomeIcon className="w-5 h-5"/> Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                             <EditableContent id="online_adm_title" defaultContent="Online Admission 2026-27" type="text" user={user} />
                        </h1>
                        <div className="text-slate-600 mt-2 text-lg">
                             <EditableContent id="online_adm_subtitle" defaultContent="Please select your admission type to proceed." type="text" user={user} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Newcomer Option */}
                        <div 
                            onClick={handleNewcomerSelect}
                            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-sky-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center h-full"
                        >
                            <div className="bg-sky-100 p-4 rounded-full mb-6 group-hover:bg-sky-200 transition-colors">
                                <UserIcon className="w-12 h-12 text-sky-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                <EditableContent id="online_adm_new_title" defaultContent="New Admission" type="text" user={user} />
                            </h2>
                            <div className="text-slate-600 mb-6">
                                <EditableContent id="online_adm_new_desc" defaultContent="For students applying to Bethel Mission School for the first time." type="textarea" user={user} />
                            </div>
                            <button className="btn btn-primary mt-auto w-full group-hover:-translate-y-1 transition-transform">
                                Apply as Newcomer
                            </button>
                        </div>

                        {/* Existing Student Option */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col h-full">
                             <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-indigo-100 p-4 rounded-full mb-6">
                                    <SearchIcon className="w-12 h-12 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    <EditableContent id="online_adm_exist_title" defaultContent="Existing Student" type="text" user={user} />
                                </h2>
                                <div className="text-slate-600">
                                    <EditableContent id="online_adm_exist_desc" defaultContent="Re-admission for current students promoting to the next class." type="textarea" user={user} />
                                </div>
                            </div>
                            
                            <form onSubmit={handleFetchStudent} className="mt-auto space-y-4">
                                <div>
                                    <label htmlFor="searchId" className="sr-only">Student ID</label>
                                    <input 
                                        type="text" 
                                        id="searchId"
                                        placeholder="Enter Student ID (e.g. BMS24...)" 
                                        value={searchId}
                                        onChange={e => setSearchId(e.target.value)}
                                        className="form-input w-full text-center font-mono uppercase placeholder:normal-case"
                                    />
                                </div>
                                {fetchError && <p className="text-red-500 text-sm text-center">{fetchError}</p>}
                                <button 
                                    type="submit" 
                                    disabled={isFetching || !searchId}
                                    className="btn btn-secondary w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 disabled:opacity-50"
                                >
                                    {isFetching ? <SpinnerIcon className="w-5 h-5" /> : "Fetch Details & Proceed"}
                                </button>
                            </form>
                        </div>
                        
                        {/* Resume Application Option */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col h-full">
                             <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-emerald-100 p-4 rounded-full mb-6">
                                    <DocumentReportIcon className="w-12 h-12 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                     <EditableContent id="online_adm_resume_title" defaultContent="Resume Application" type="text" user={user} />
                                </h2>
                                <div className="text-slate-600">
                                     <EditableContent id="online_adm_resume_desc" defaultContent="Continue an existing or saved application." type="textarea" user={user} />
                                </div>
                            </div>
                            
                            <form onSubmit={handleRetrieveApplication} className="mt-auto space-y-4">
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Application ID (e.g. BMS26...)" 
                                        value={retrieveAppId}
                                        onChange={e => setRetrieveAppId(e.target.value)}
                                        className="form-input w-full text-center mb-2"
                                    />
                                     <input 
                                        type="date" 
                                        placeholder="Date of Birth" 
                                        value={retrieveDob}
                                        onChange={e => setRetrieveDob(e.target.value)}
                                        className="form-input w-full text-center"
                                        required
                                    />
                                </div>
                                {retrievalError && <p className="text-red-500 text-sm text-center">{retrievalError}</p>}
                                <button 
                                    type="submit" 
                                    disabled={isFetching || !retrieveAppId || !retrieveDob}
                                    className="btn btn-secondary w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 disabled:opacity-50"
                                >
                                    {isFetching ? <SpinnerIcon className="w-5 h-5" /> : "Resume Application"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                            <BackIcon className="w-5 h-5"/>
                            <span className="text-sm font-semibold">Change Type</span>
                        </button>
                        <div className="text-right">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${formData.studentType === 'Existing' ? 'bg-indigo-100 text-indigo-800' : 'bg-sky-100 text-sky-800'}`}>
                                {formData.studentType} Application
                            </span>
                            {formData.id && <div className="text-xs text-emerald-600 mt-1 font-semibold">ID: {formData.id}</div>}
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-800">
                             <EditableContent id="online_adm_form_title" defaultContent="Online Admission Form" type="text" user={user} />
                        </h1>
                        <p className="text-slate-600 mt-2">Academic Session 2026-2027</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Student's Particulars */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Student's Particulars</legend>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Admission Type</label>
                                    <input type="text" value={formData.studentType} disabled className="form-input w-full mt-1 bg-slate-100 text-slate-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Applying for Class <span className="text-red-600">*</span></label>
                                    <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required>
                                        <option value="" disabled>-- Select Class --</option>
                                        {/* Logic: Show Grade X only if studentType is 'Existing' */}
                                        {GRADES_LIST.filter(g => formData.studentType === 'Existing' || g !== Grade.X).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Name (in CAPITAL) <span className="text-red-600">*</span></label>
                                    <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input w-full mt-1 uppercase" required />
                                </div>
                                <div>
                                    <CustomDatePicker 
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Gender <span className="text-red-600">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1">
                                        {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Blood Group</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-select w-full mt-1">
                                        <option value="">-- Select --</option>
                                        {BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Aadhaar No.</label>
                                    <input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">PEN (if available)</label>
                                    <input type="text" name="penNumber" value={formData.penNumber} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Religion</label>
                                    <input type="text" name="religion" value={(formData as any).religion || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Category</label>
                                    <select name="category" value={(formData as any).category || Category.GENERAL} onChange={handleChange} className="form-select w-full mt-1">
                                        {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">CWSN (Child with Special Needs)</label>
                                    <select name="isCWSN" value={formData.isCWSN} onChange={handleChange} className="form-select w-full mt-1">
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother Tongue</label>
                                    <input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Parent/Guardian Details */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Parent / Guardian Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Father's Name <span className="text-red-600">*</span></label>
                                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother's Name <span className="text-red-600">*</span></label>
                                    <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Father's Occupation</label>
                                    <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother's Occupation</label>
                                    <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Parent's Aadhaar No.</label>
                                    <input type="text" name="parentAadhaar" value={formData.parentAadhaar} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Contact Number (WhatsApp) <span className="text-red-600">*</span></label>
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700">Permanent Address <span className="text-red-600">*</span></label>
                                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows={2} className="form-textarea w-full mt-1" required></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700">Present Address (if different)</label>
                                    <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} rows={2} className="form-textarea w-full mt-1"></textarea>
                                </div>
                            </div>
                        </fieldset>

                        {/* Previous School Details */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Previous Academic Record</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Last School Attended</label>
                                    <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Result/Division</label>
                                    <input type="text" name="lastDivision" value={formData.lastDivision} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Documents Upload */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Document Uploads</legend>
                            <p className="text-sm text-slate-600 mb-4">Please upload clear images (JPG/PNG). Max size 5MB.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Birth Certificate */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Birth Certificate <span className="text-red-600">*</span></label>
                                    <div className="flex items-center gap-2">
                                        <label className={`flex-grow flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer hover:bg-slate-50 ${uploadStatus.birthCertificateUrl === 'error' ? 'border-red-300' : 'border-slate-300'}`}>
                                            <UploadIcon className="w-5 h-5 mr-2 text-slate-500" />
                                            <span className="text-sm text-slate-600">Choose File</span>
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'birthCertificateUrl')} className="hidden" accept="image/*" />
                                        </label>
                                        {uploadStatus.birthCertificateUrl === 'uploading' && <SpinnerIcon className="w-5 h-5 text-sky-600" />}
                                        {uploadStatus.birthCertificateUrl === 'success' && <CheckIcon className="w-5 h-5 text-emerald-600" />}
                                    </div>
                                    {formData.birthCertificateUrl && <p className="text-xs text-emerald-600 mt-1">Uploaded successfully.</p>}
                                </div>

                                {/* Marksheet */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Previous Marksheet/Report Card</label>
                                    <div className="flex items-center gap-2">
                                        <label className="flex-grow flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50">
                                            <UploadIcon className="w-5 h-5 mr-2 text-slate-500" />
                                            <span className="text-sm text-slate-600">Choose File</span>
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'reportCardUrl')} className="hidden" accept="image/*" />
                                        </label>
                                        {uploadStatus.reportCardUrl === 'uploading' && <SpinnerIcon className="w-5 h-5 text-sky-600" />}
                                        {uploadStatus.reportCardUrl === 'success' && <CheckIcon className="w-5 h-5 text-emerald-600" />}
                                    </div>
                                </div>

                                {/* Transfer Certificate */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Transfer Certificate (if applicable)</label>
                                    <div className="flex items-center gap-2">
                                        <label className="flex-grow flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50">
                                            <UploadIcon className="w-5 h-5 mr-2 text-slate-500" />
                                            <span className="text-sm text-slate-600">Choose File</span>
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'transferCertificateUrl')} className="hidden" accept="image/*" />
                                        </label>
                                        {uploadStatus.transferCertificateUrl === 'uploading' && <SpinnerIcon className="w-5 h-5 text-sky-600" />}
                                        {uploadStatus.transferCertificateUrl === 'success' && <CheckIcon className="w-5 h-5 text-emerald-600" />}
                                    </div>
                                    {formData.admissionGrade !== Grade.NURSERY && !formData.transferCertificateUrl && formData.studentType === 'Newcomer' && (
                                        <p className="text-xs text-amber-600 mt-1">Required for classes above Nursery.</p>
                                    )}
                                </div>
                            </div>
                        </fieldset>
                        
                        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                             <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold px-4 py-2 rounded transition-colors"
                             >
                                 <SaveIcon className="w-5 h-5" />
                                 Save as Draft
                             </button>
                             <button 
                                type="submit" 
                                disabled={isSubmitting || Object.values(uploadStatus).includes('uploading')}
                                className="btn btn-primary !text-lg !px-8 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <SpinnerIcon className="w-6 h-6 mr-2" /> Submitting...
                                    </>
                                ) : (
                                    formData.id ? "Update & Proceed" : "Submit Application"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnlineAdmissionPage;
