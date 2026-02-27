import React, { useState, FormEvent, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, OnlineAdmission, Grade, Gender, Category, Student, BloodGroup } from '@/types';
import { GRADES_LIST, CATEGORY_LIST, GENDER_LIST, BLOOD_GROUP_LIST } from '@/constants';
import { UploadIcon, SpinnerIcon, CheckIcon, XIcon, PlusIcon, UserIcon, SearchIcon, ArrowRightIcon, SaveIcon, BackIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import CustomDatePicker from '@/components/CustomDatePicker';
import { resizeImage, uploadToImgBB, getNextGrade } from '@/utils';
import { db } from '@/firebaseConfig';

const { useNavigate, Link } = ReactRouterDOM as any;

interface OnlineAdmissionPageProps {
    user: User | null;
    onOnlineAdmissionSubmit: (data: Partial<OnlineAdmission>, id?: string) => Promise<string>;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex items-center mb-8">
        {[1, 2, 3].map(step => (
            <React.Fragment key={step}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                    currentStep >= step ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                    {currentStep > step ? <CheckIcon className="w-6 h-6"/> : step}
                </div>
                {step < 3 && <div className={`flex-grow h-1 transition-colors ${currentStep > step ? 'bg-sky-600' : 'bg-slate-200'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;


const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ user, onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // 'existing' | 'continue' | 'resubmit' | null
    const [showIdInput, setShowIdInput] = useState<'existing' | 'continue' | 'resubmit' | null>(null);
    const [existingId, setExistingId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [savedApplicationId, setSavedApplicationId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<OnlineAdmission>>({
        admissionGrade: GRADES_LIST[0],
        gender: 'Male',
        category: 'General',
        cwsn: 'No',
        email: user?.email || '',
        status: 'draft',
        generalBehaviour: 'Normal',
        siblingsInSchool: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof OnlineAdmission) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingDoc(String(field));
            try {
                const file = e.target.files[0];
                const resized = await resizeImage(file, 1024, 1024, 0.8);
                const url = await uploadToImgBB(resized);
                setFormData(prev => ({ ...prev, [field]: url }));
                if (errors[String(field)]) {
                    setErrors(prev => {
                        const next = { ...prev };
                        delete next[String(field)];
                        return next;
                    });
                }
            } catch (error) {
                console.error(`Error uploading ${String(field)}:`, error);
                alert("Failed to upload document. Please try again.");
            } finally {
                setUploadingDoc(null);
            }
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.studentName?.trim()) newErrors.studentName = "Student name is required.";
            if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
            if (!formData.gender) newErrors.gender = "Gender is required.";
            if (!formData.studentAadhaar?.trim()) newErrors.studentAadhaar = "Aadhaar number is required.";
            if (!formData.category) newErrors.category = "Category is required.";
            if (!formData.religion?.trim()) newErrors.religion = "Religion is required.";
        }
        if (currentStep === 2) {
            if (!formData.fatherName?.trim()) newErrors.fatherName = "Father's name is required.";
            if (!formData.motherName?.trim()) newErrors.motherName = "Mother's name is required.";
            if (!formData.contactNumber?.trim()) newErrors.contactNumber = "Contact number is required.";
            if (!formData.permanentAddress?.trim()) newErrors.permanentAddress = "Permanent address is required.";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorEl = document.querySelector('.field-error');
                if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
            return false;
        }
        return true;
    };

    const handleFetchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const idInput = existingId.trim().toUpperCase();
        if (!idInput) return;

        setIsFetching(true);
        setFetchError('');

        // Handle resubmit: just navigate to payment page
        if (showIdInput === 'resubmit') {
            try {
                const docRef = db.collection('online_admissions').doc(idInput);
                const doc = await docRef.get();
                if (doc.exists) {
                    navigate(`/admissions/payment/${idInput}`);
                } else {
                    setFetchError('Reference ID not found. Please check and try again.');
                }
            } catch (error) {
                setFetchError('An error occurred. Please try again.');
            } finally {
                setIsFetching(false);
            }
            return;
        }

        const fillFormWithStudent = (data: Student | OnlineAdmission, isAdmissionDraft = false) => {
            const studentData = data as Student;
            const admissionData = data as OnlineAdmission;
            const nextGrade = isAdmissionDraft ? admissionData.admissionGrade : getNextGrade(studentData.grade);
            setFormData(prev => ({
                ...(isAdmissionDraft ? admissionData : prev),
                studentType: 'Existing',
                previousStudentId: studentData.studentId || idInput,
                admissionGrade: nextGrade || studentData.grade,
                studentName: studentData.name || admissionData.studentName,
                dateOfBirth: studentData.dateOfBirth || admissionData.dateOfBirth,
                gender: studentData.gender || admissionData.gender,
                studentAadhaar: studentData.aadhaarNumber || admissionData.studentAadhaar,
                fatherName: studentData.fatherName || admissionData.fatherName,
                motherName: studentData.motherName || admissionData.motherName,
                fatherOccupation: studentData.fatherOccupation || admissionData.fatherOccupation,
                motherOccupation: studentData.motherOccupation || admissionData.motherOccupation,
                parentAadhaar: studentData.fatherAadhaar || admissionData.parentAadhaar,
                guardianName: studentData.guardianName || admissionData.guardianName,
                guardianRelationship: studentData.guardianRelationship || admissionData.guardianRelationship,
                permanentAddress: studentData.address || admissionData.permanentAddress,
                presentAddress: studentData.address || admissionData.presentAddress,
                contactNumber: studentData.contact || admissionData.contactNumber,
                religion: studentData.religion || admissionData.religion,
                category: (studentData.category as string) || (admissionData.category as string),
                cwsn: studentData.cwsn || admissionData.cwsn,
                bloodGroup: studentData.bloodGroup || admissionData.bloodGroup,
                penNumber: studentData.pen || admissionData.penNumber,
                achievements: studentData.achievements || admissionData.achievements,
                healthIssues: studentData.healthConditions || admissionData.healthIssues,
                lastSchoolAttended: isAdmissionDraft ? admissionData.lastSchoolAttended : 'Bethel Mission School',
            }));
            setStep(1);
        };

        try {
            if (showIdInput === 'continue') {
                const docRef = db.collection('online_admissions').doc(idInput);
                const doc = await docRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data?.status === 'rejected') {
                        setFetchError('This application has been rejected and cannot be edited.');
                        return;
                    }
                    fillFormWithStudent({ id: doc.id, ...data } as OnlineAdmission, true);
                } else {
                    setFetchError('Application not found. Please check the ID.');
                }
                return;
            }

            let snapshot = await db.collection('students').where('studentId', '==', idInput).limit(1).get();
            if (!snapshot.empty) {
                fillFormWithStudent(snapshot.docs[0].data() as Student);
                return;
            }

            const idPattern = /^BMS(\d{2})([A-Z0-9]{2})(\d+)$/;
            const match = idInput.match(idPattern);
            if (match) {
                const [_, yearShort, gradeCode, rollStr] = match;
                const rollNo = parseInt(rollStr, 10);
                const targetYearStart = `20${yearShort}`;
                const gradeMap: Record<string, string> = { 'NU': 'Nursery', 'KG': 'Kindergarten', '01': 'Class I', '02': 'Class II', '03': 'Class III', '04': 'Class IV', '05': 'Class V', '06': 'Class VI', '07': 'Class VII', '08': 'Class VIII', '09': 'Class IX', '10': 'Class X' };
                const grade = gradeMap[gradeCode];
                if (grade) {
                    const fallbackSnapshot = await db.collection('students').where('grade', '==', grade).where('rollNo', '==', rollNo).get();
                    const foundDoc = fallbackSnapshot.docs.find(doc => {
                        const s = doc.data() as Student;
                        return s.academicYear && s.academicYear.startsWith(targetYearStart);
                    });
                    if (foundDoc) {
                        fillFormWithStudent(foundDoc.data() as Student);
                        return;
                    }
                }
            }
            setFetchError('Student ID not found. Please check the ID or choose "Skip" to fill manually.');
        } catch (error) {
            console.error("Error fetching student/application:", error);
            setFetchError('An error occurred while fetching details.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSaveForLater = async () => {
        setIsSaving(true);
        try {
            const draftData = {
                ...formData,
                status: 'draft' as const,
                submissionDate: formData.submissionDate || new Date().toISOString(),
            };
            const id = await onOnlineAdmissionSubmit(draftData, formData.id);
            setFormData(prev => ({ ...prev, id }));
            setSavedApplicationId(id);
        } catch (error) {
            console.error("Save for later failed:", error);
            alert("Failed to save application draft.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const isNewStudent = formData.studentType === 'Newcomer';
        const isNursery = formData.admissionGrade === Grade.NURSERY;
        const docErrors: Record<string, string> = {};
        if (isNewStudent && !formData.birthCertificateUrl) {
            docErrors.birthCertificateUrl = "Birth Certificate is mandatory for new students.";
        }
        if (isNewStudent && !isNursery && !formData.reportCardUrl) {
            docErrors.reportCardUrl = "Last Report Card is mandatory for new students (except Nursery).";
        }
        if (Object.keys(docErrors).length > 0) {
            setErrors(docErrors);
            setTimeout(() => {
                const firstErrorEl = document.querySelector('.field-error');
                if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
            return;
        }
        setIsSubmitting(true);
        try {
            const admissionData = {
                ...formData,
                submissionDate: new Date().toISOString(),
                status: 'pending' as const
            };
            const id = await onOnlineAdmissionSubmit(admissionData, formData.id);
            navigate(`/admissions/payment/${id}`, { state: { grade: formData.admissionGrade, studentName: formData.studentName, fatherName: formData.fatherName, contact: formData.contactNumber, studentType: formData.studentType } });
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isNewStudent = formData.studentType === 'Newcomer';
    const isNursery = formData.admissionGrade === Grade.NURSERY;

    // ─── STEP 0: Selection screen ────────────────────────────────────────────
    if (step === 0) {
        return (
            <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <div className="mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                            >
                                <BackIcon className="w-5 h-5" />
                                Back to Admission Guidelines
                            </button>
                        </div>

                        {!showIdInput ? (
                            <>
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
                                        Online Admission Portal
                                    </h1>
                                    <p className="text-lg text-slate-600">Please select an option to begin.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                    <button
                                        onClick={() => { setFormData(prev => ({ ...prev, studentType: 'Newcomer' })); setStep(1); }}
                                        className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-sky-500 hover:shadow-2xl transition-all group text-left"
                                    >
                                        <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mb-6"><PlusIcon className="w-8 h-8 text-sky-600" /></div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">New Student</h3>
                                        <p className="text-slate-600">For children seeking admission for the first time.</p>
                                    </button>
                                    <button
                                        onClick={() => setShowIdInput('existing')}
                                        className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-emerald-500 hover:shadow-2xl transition-all group text-left"
                                    >
                                        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6"><UserIcon className="w-8 h-8 text-emerald-600" /></div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Existing Student</h3>
                                        <p className="text-slate-600">For current students applying for re-admission or promotion.</p>
                                    </button>
                                </div>

                                {/* Bottom links */}
                                <div className="text-center mt-10 flex flex-col items-center gap-3">
                                    <button onClick={() => setShowIdInput('continue')} className="font-semibold text-sky-700 hover:underline">
                                        Continue a Saved Application &rarr;
                                    </button>
                                    <button onClick={() => setShowIdInput('resubmit')} className="font-semibold text-amber-600 hover:underline">
                                        Resubmit Payment Screenshot &rarr;
                                    </button>
                                    <Link to="/admissions/status" className="font-semibold text-emerald-700 hover:underline">
                                        Check Application Status &rarr;
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="max-w-lg mx-auto">
                                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                                    {showIdInput === 'existing' ? 'Existing Student'
                                    : showIdInput === 'resubmit' ? 'Resubmit Payment'
                                    : 'Continue Application'}
                                </h2>
                                <p className="text-slate-600 text-center mb-6">
                                    {showIdInput === 'existing'
                                        ? 'Enter your Student ID to auto-fill the form.'
                                        : showIdInput === 'resubmit'
                                        ? 'Enter your Reference ID to go back to the payment page and upload a new screenshot.'
                                        : 'Enter your Application ID to resume or edit your submission.'}
                                </p>

                                <form onSubmit={handleFetchStudent}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            {showIdInput === 'existing' ? 'Student ID' : 'Reference / Application ID'}
                                        </label>
                                        <input
                                            type="text"
                                            value={existingId}
onChange={(e) => setExistingId(e.target.value.toUpperCase().replace(/O/g, '0'))}                                            className="form-input w-full uppercase"
                                            placeholder={showIdInput === 'existing' ? "e.g. BMS240101" : "e.g. BMSAPP..."}
                                            autoFocus
                                        />
                                        {fetchError && <p className="text-red-500 text-sm mt-2">{fetchError}</p>}
                                        <p className="text-xs text-slate-400 mt-1">Tip: The ID uses the number 0, not the letter O.</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isFetching || !existingId}
                                        className="w-full btn btn-primary flex items-center justify-center gap-2 mb-4"
                                    >
                                        {isFetching ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                                        {isFetching ? 'Fetching...' : showIdInput === 'resubmit' ? 'Go to Payment Page' : 'Continue'}
                                    </button>
                                </form>

                                {showIdInput === 'existing' && (
                                    <>
                                        <hr className="my-4"/>
                                        <button
                                            onClick={() => { setFormData(prev => ({ ...prev, studentType: 'Existing', lastSchoolAttended: 'Bethel Mission School' })); setStep(1); }}
                                            className="w-full btn btn-secondary"
                                        >
                                            Skip & Fill Manually
                                        </button>
                                    </>
                                )}
                                <button onClick={() => { setShowIdInput(null); setFetchError(''); setExistingId(''); }} className="w-full mt-4 text-slate-500 hover:text-slate-800 text-sm">
                                    &larr; Back to Selection
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEPS 1-3: Form ─────────────────────────────────────────────────────
    return (
        <div className="bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 relative">
                    {savedApplicationId && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                            <div className="bg-white p-8 rounded-lg shadow-xl text-center border animate-fade-in">
                                <h3 className="text-2xl font-bold text-emerald-600">Application Saved!</h3>
                                <p className="mt-2 text-slate-600">Please save this ID to continue your application later:</p>
                                <div className="my-4 p-3 bg-slate-100 border-2 border-dashed rounded font-mono text-xl font-bold text-slate-800">
                                    {savedApplicationId}
                                </div>
                                <button onClick={() => navigator.clipboard.writeText(savedApplicationId)} className="btn btn-secondary w-full">Copy ID</button>
                                <button onClick={() => setSavedApplicationId(null)} className="mt-4 text-sm text-slate-500 hover:underline">Close and Continue Editing</button>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <button
                            onClick={() => { setErrors({}); step > 1 ? setStep(step - 1) : setStep(0); }}
                            className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            Back
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">Online Admission Form</h1>
                        <p className="text-slate-600 mt-2">Academic Session 2026-27</p>
                    </div>
                    <ProgressBar currentStep={step} />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Step 1: Student Information */}
                        {step === 1 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">1. Student Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold">Class Applying For*</label>
                                        <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required>
                                            {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Full Name*</label>
                                        <input type="text" name="studentName" value={formData.studentName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.studentName ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                        <FieldError message={errors.studentName} />
                                        {errors.studentName && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <CustomDatePicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} required={false} minYear={1960} maxYear={new Date().getFullYear()} />
                                        <FieldError message={errors.dateOfBirth} />
                                        {errors.dateOfBirth && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Gender*</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1">
                                            {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Aadhaar No.*</label>
                                        <input type="text" name="studentAadhaar" value={formData.studentAadhaar || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.studentAadhaar ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                        <FieldError message={errors.studentAadhaar} />
                                        {errors.studentAadhaar && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">PEN No. (Optional)</label>
                                        <input type="text" name="penNumber" value={formData.penNumber || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Mother Tongue (Optional)</label>
                                        <input type="text" name="motherTongue" value={formData.motherTongue || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Blood Group (Optional)</label>
                                        <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="form-select w-full mt-1">
                                            <option value="">-- Select --</option>
                                            {BLOOD_GROUP_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">CWSN*</label>
                                        <select name="cwsn" value={formData.cwsn} onChange={handleChange} className="form-select w-full mt-1">
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Category*</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className={`form-select w-full mt-1 ${errors.category ? 'border-red-400' : ''}`}>
                                            {CATEGORY_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <FieldError message={errors.category} />
                                        {errors.category && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Religion*</label>
                                        <input type="text" name="religion" value={formData.religion || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.religion ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                        <FieldError message={errors.religion} />
                                        {errors.religion && <span className="field-error" />}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Step 2: Parent/Guardian Information */}
                        {step === 2 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">2. Parent/Guardian Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold">Father's Name*</label>
                                        <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.fatherName ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                        <FieldError message={errors.fatherName} />
                                        {errors.fatherName && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Mother's Name*</label>
                                        <input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.motherName ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                        <FieldError message={errors.motherName} />
                                        {errors.motherName && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Father's Occupation</label>
                                        <input type="text" name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Mother's Occupation</label>
                                        <input type="text" name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold">Father's/Mother's Aadhaar No.</label>
                                        <input type="text" name="parentAadhaar" value={formData.parentAadhaar || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Guardian's Name (if any)</label>
                                        <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Relationship with Guardian</label>
                                        <input type="text" name="guardianRelationship" value={formData.guardianRelationship || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Contact No.*</label>
                                        <input type="tel" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.contactNumber ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                        <FieldError message={errors.contactNumber} />
                                        {errors.contactNumber && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Email</label>
                                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold">Permanent Address*</label>
                                        <textarea name="permanentAddress" value={formData.permanentAddress || ''} onChange={handleChange} className={`form-textarea w-full mt-1 ${errors.permanentAddress ? 'border-red-400 focus:ring-red-300' : ''}`} rows={2}></textarea>
                                        <FieldError message={errors.permanentAddress} />
                                        {errors.permanentAddress && <span className="field-error" />}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Step 3: Documents Upload */}
                        {step === 3 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">3. Documents & Other Info</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold">Last School Attended</label>
                                        <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Division in which he/she passed</label>
                                        <input type="text" name="lastDivision" value={formData.lastDivision || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">General Behaviour</label>
                                        <select name="generalBehaviour" value={formData.generalBehaviour || 'Normal'} onChange={handleChange} className="form-select w-full mt-1">
                                            <option value="Mild">Mild</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Hyperactive">Hyperactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Siblings in this school</label>
                                        <input type="number" name="siblingsInSchool" value={formData.siblingsInSchool || 0} onChange={handleChange} className="form-input w-full mt-1" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold">Achievements (Academics/Extra-curricular)</label>
                                        <textarea name="achievements" value={formData.achievements || ''} onChange={handleChange} className="form-textarea w-full mt-1" rows={3}></textarea>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold">Health Issues (if any)</label>
                                        <textarea name="healthIssues" value={formData.healthIssues || ''} onChange={handleChange} className="form-textarea w-full mt-1" rows={3}></textarea>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-700 border-t pt-4 mt-6">Documents Upload</h3>
                                {isNewStudent && (
                                    <p className="text-sm text-slate-600 my-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <span className="font-bold">Important:</span> For new students, the Birth Certificate is mandatory.
                                        {!isNursery && " The Last Report Card is also mandatory."}
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold">Birth Certificate{isNewStudent && <span className="text-red-500">*</span>}</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <label className="btn btn-secondary cursor-pointer">
                                                {uploadingDoc === 'birthCertificateUrl' ? <SpinnerIcon className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                                                <input type="file" onChange={(e) => handleFileChange(e, 'birthCertificateUrl')} className="hidden" accept="image/*" />
                                                Upload
                                            </label>
                                            {formData.birthCertificateUrl && <CheckIcon className="w-5 h-5 text-emerald-600"/>}
                                        </div>
                                        <FieldError message={errors.birthCertificateUrl} />
                                        {errors.birthCertificateUrl && <span className="field-error" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Transfer Certificate (if applicable)</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <label className="btn btn-secondary cursor-pointer">
                                                {uploadingDoc === 'transferCertificateUrl' ? <SpinnerIcon className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                                                <input type="file" onChange={(e) => handleFileChange(e, 'transferCertificateUrl')} className="hidden" accept="image/*" />
                                                Upload
                                            </label>
                                            {formData.transferCertificateUrl && <CheckIcon className="w-5 h-5 text-emerald-600"/>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold">Last Report Card{isNewStudent && !isNursery && <span className="text-red-500">*</span>}</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <label className="btn btn-secondary cursor-pointer">
                                                {uploadingDoc === 'reportCardUrl' ? <SpinnerIcon className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                                                <input type="file" onChange={(e) => handleFileChange(e, 'reportCardUrl')} className="hidden" accept="image/*" />
                                                Upload
                                            </label>
                                            {formData.reportCardUrl && <CheckIcon className="w-5 h-5 text-emerald-600"/>}
                                        </div>
                                        <FieldError message={errors.reportCardUrl} />
                                        {errors.reportCardUrl && <span className="field-error" />}
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="flex justify-between items-center pt-6 border-t">
                            {step > 1 ? (
                                <button type="button" onClick={() => { setErrors({}); setStep(s => s - 1); }} className="btn btn-secondary">Back</button>
                            ) : <div></div>}

                            <div className="flex items-center gap-4">
                                <button type="button" onClick={handleSaveForLater} disabled={isSubmitting || isSaving} className="btn btn-secondary">
                                    {isSaving ? <><SpinnerIcon className="w-5 h-5"/> Saving...</> : <><SaveIcon className="w-5 h-5"/> Save for Later</>}
                                </button>
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => { if (validateStep(step)) setStep(s => s + 1); }}
                                        className="btn btn-primary"
                                    >
                                        Next <ArrowRightIcon className="w-5 h-5"/>
                                    </button>
                                ) : (
                                    <button type="submit" disabled={isSubmitting || isSaving} className="btn btn-primary px-8 py-3 text-lg">
                                        {isSubmitting ? <><SpinnerIcon className="w-6 h-6"/> Submitting...</> : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnlineAdmissionPage;
