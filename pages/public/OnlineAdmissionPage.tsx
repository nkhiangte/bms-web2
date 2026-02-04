
import React, { useState, FormEvent, useRef } from 'react';
import { User, OnlineAdmission, Grade, Gender, Category, Student } from '../../types';
import { GRADES_LIST, CATEGORY_LIST, GENDER_LIST } from '../../constants';
import { UploadIcon, SpinnerIcon, CheckIcon, XIcon, PlusIcon, UserIcon, SearchIcon, ArrowRightIcon } from '../../components/Icons';
import EditableContent from '../../components/EditableContent';
import { resizeImage, uploadToImgBB } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';

interface OnlineAdmissionPageProps {
    user: User | null;
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id'>) => Promise<string>;
}

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ user, onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    
    // Selection State
    const [hasSelectedType, setHasSelectedType] = useState(false);
    const [showIdInput, setShowIdInput] = useState(false);
    const [existingId, setExistingId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

    const [formData, setFormData] = useState<Partial<OnlineAdmission>>({
        admissionGrade: GRADES_LIST[0],
        studentName: '',
        dateOfBirth: '',
        gender: 'Male',
        studentAadhaar: '',
        fatherName: '',
        motherName: '',
        permanentAddress: '',
        presentAddress: '',
        contactNumber: '',
        email: user?.email || '',
        religion: '',
        category: 'General',
        cwsn: 'No',
        bloodGroup: '',
        motherTongue: '',
        studentType: 'Newcomer',
        lastSchoolAttended: '',
        status: 'pending'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof OnlineAdmission) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingDoc(field);
            try {
                const file = e.target.files[0];
                const resized = await resizeImage(file, 1024, 1024, 0.8);
                const url = await uploadToImgBB(resized);
                setFormData(prev => ({ ...prev, [field]: url }));
            } catch (error) {
                console.error(`Error uploading ${field}:`, error);
                alert("Failed to upload document. Please try again.");
            } finally {
                setUploadingDoc(null);
            }
        }
    };

    const handleFetchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!existingId) return;
        
        setIsFetching(true);
        setFetchError('');
        try {
             const snapshot = await db.collection('students')
                .where('studentId', '==', existingId.trim().toUpperCase())
                .limit(1)
                .get();

             if (snapshot.empty) {
                 setFetchError('Student ID not found. Please check the ID or choose "Skip" to fill manually.');
                 setIsFetching(false);
                 return;
             }

             const studentData = snapshot.docs[0].data() as Student;
             
             setFormData(prev => ({
                 ...prev,
                 studentType: 'Existing',
                 previousStudentId: studentData.studentId,
                 studentName: studentData.name || '',
                 dateOfBirth: studentData.dateOfBirth || '',
                 gender: studentData.gender || 'Male',
                 studentAadhaar: studentData.aadhaarNumber || '',
                 fatherName: studentData.fatherName || '',
                 motherName: studentData.motherName || '',
                 fatherOccupation: studentData.fatherOccupation || '',
                 motherOccupation: studentData.motherOccupation || '',
                 permanentAddress: studentData.address || '',
                 presentAddress: studentData.address || '', 
                 contactNumber: studentData.contact || '',
                 religion: studentData.religion || '',
                 category: (studentData.category as string) || 'General',
                 cwsn: studentData.cwsn || 'No',
                 bloodGroup: studentData.bloodGroup || '',
                 motherTongue: '', // Usually not in Student record, kept empty
                 lastSchoolAttended: 'Bethel Mission School',
             }));
             setHasSelectedType(true);
        } catch (error) {
            console.error("Error fetching student:", error);
            setFetchError('An error occurred while fetching details. Please check your connection.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const admissionData = {
                ...formData,
                submissionDate: new Date().toISOString(),
                status: 'pending' as const
            } as Omit<OnlineAdmission, 'id'>;

            const id = await onOnlineAdmissionSubmit(admissionData);
            
            // Navigate to payment or status page
            navigate(`/admissions/payment/${id}`, { 
                state: { 
                    grade: formData.admissionGrade, 
                    studentName: formData.studentName, 
                    fatherName: formData.fatherName, 
                    contact: formData.contactNumber,
                    studentType: formData.studentType
                } 
            });
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!hasSelectedType) {
        if (showIdInput) {
            return (
                <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-lg">
                         <div className="bg-white p-8 rounded-2xl shadow-xl">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Existing Student</h2>
                                <p className="text-slate-600 mt-2">Enter your Student ID to auto-fill the form.</p>
                            </div>

                            <form onSubmit={handleFetchStudent}>
                                <div className="mb-4">
                                    <label htmlFor="studentId" className="block text-sm font-bold text-slate-700 mb-2">Student ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <SearchIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            id="studentId"
                                            value={existingId}
                                            onChange={(e) => setExistingId(e.target.value.toUpperCase())}
                                            className="pl-10 form-input w-full uppercase" 
                                            placeholder="e.g. BMS240101"
                                            autoFocus
                                        />
                                    </div>
                                    {fetchError && <p className="text-red-500 text-sm mt-2 font-medium">{fetchError}</p>}
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={isFetching || !existingId}
                                    className="w-full btn btn-primary flex items-center justify-center gap-2 mb-4"
                                >
                                    {isFetching ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                                    {isFetching ? 'Fetching Details...' : 'Fetch Details & Continue'}
                                </button>
                            </form>

                            <div className="flex items-center gap-4 my-4">
                                <hr className="flex-grow border-slate-200" />
                                <span className="text-slate-400 text-sm">OR</span>
                                <hr className="flex-grow border-slate-200" />
                            </div>

                            <button 
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, studentType: 'Existing', lastSchoolAttended: 'Bethel Mission School' }));
                                    setHasSelectedType(true);
                                }}
                                className="w-full btn btn-secondary"
                            >
                                Skip & Fill Manually
                            </button>
                             <button onClick={() => setShowIdInput(false)} className="w-full mt-4 text-slate-500 hover:text-slate-800 text-sm">
                                &larr; Back to Selection
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
                            <EditableContent id="oa_welcome_title" defaultContent="Online Admission Portal" type="text" user={user} />
                        </h1>
                        <p className="text-lg text-slate-600">Please select the category that best describes the student.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* New Student Card */}
                        <button 
                            onClick={() => {
                                setFormData(prev => ({ ...prev, studentType: 'Newcomer', lastSchoolAttended: '' }));
                                setHasSelectedType(true);
                            }}
                            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-sky-500 hover:shadow-2xl transition-all duration-300 group text-left"
                        >
                            <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <PlusIcon className="w-8 h-8 text-sky-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">New Student</h3>
                            <p className="text-slate-600">For children seeking admission to Bethel Mission School for the first time.</p>
                        </button>

                        {/* Existing Student Card */}
                        <button 
                            onClick={() => {
                                setShowIdInput(true);
                            }}
                            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 group text-left"
                        >
                            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <UserIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Existing Student</h3>
                            <p className="text-slate-600">For current students of the school applying for re-admission or promotion to the next class.</p>
                        </button>
                    </div>
                    
                    <div className="mt-12 text-center">
                        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-2 mx-auto">
                            &larr; Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">
                             <EditableContent id="oa_page_title" defaultContent="Online Admission Form" type="text" user={user} />
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Academic Session 2026-27
                        </p>
                        <p className="text-sm text-red-500 mt-2 font-medium">* Indicates mandatory fields</p>
                        {formData.previousStudentId && (
                            <div className="mt-4 inline-block bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200">
                                Auto-filled from Student ID: {formData.previousStudentId}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 1. Admission Details */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Admission Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Class Applying For <span className="text-red-500">*</span></label>
                                    <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required>
                                        {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Student Type <span className="text-red-500">*</span></label>
                                    <select name="studentType" value={formData.studentType} onChange={handleChange} className="form-select w-full mt-1" required>
                                        <option value="Newcomer">New Student</option>
                                        <option value="Existing">Existing Student (Transfer/Promotion)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Student Information */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Student Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Gender <span className="text-red-500">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1" required>
                                        {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Aadhaar Number <span className="text-red-500">*</span></label>
                                    <input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother Tongue <span className="text-red-500">*</span></label>
                                    <input type="text" name="motherTongue" value={formData.motherTongue || ''} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Religion <span className="text-red-500">*</span></label>
                                    <select name="religion" value={(formData as any).religion || ''} onChange={handleChange} className="form-select w-full mt-1" required>
                                        <option value="">-- Select --</option>
                                        <option value="Christian">Christian</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Muslim">Muslim</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Category <span className="text-red-500">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="form-select w-full mt-1" required>
                                        {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Blood Group (Optional)</label>
                                    <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">CWSN (Children with Special Needs) <span className="text-red-500">*</span></label>
                                    <select name="cwsn" value={formData.cwsn} onChange={handleChange} className="form-select w-full mt-1" required>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-bold text-slate-700">
                                        Last School Attended 
                                        {formData.studentType === 'Newcomer' && <span className="text-red-500">*</span>}
                                    </label>
                                    <input 
                                        type="text" 
                                        name="lastSchoolAttended" 
                                        value={formData.lastSchoolAttended || ''} 
                                        onChange={handleChange} 
                                        className="form-input w-full mt-1" 
                                        required={formData.studentType === 'Newcomer'} 
                                        placeholder={formData.admissionGrade === 'Nursery' ? "Write 'None' if first school" : ""} 
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. Parent/Guardian Information */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Parent/Guardian Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Father's Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Father's Occupation</label>
                                    <input type="text" name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother's Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother's Occupation</label>
                                    <input type="text" name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Email (Optional)</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700">Permanent Address <span className="text-red-500">*</span></label>
                                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700">Present Address <span className="text-red-500">*</span></label>
                                    <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea>
                                </div>
                            </div>
                        </section>

                        {/* 4. Documents Upload */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Documents Upload</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Birth Certificate</label>
                                    <div className="flex items-center gap-2">
                                        <label className="btn btn-secondary cursor-pointer">
                                            {uploadingDoc === 'birthCertificateUrl' ? <SpinnerIcon className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                                            <input type="file" onChange={(e) => handleFileChange(e, 'birthCertificateUrl')} className="hidden" accept="image/*" />
                                            Upload
                                        </label>
                                        {formData.birthCertificateUrl && <span className="text-emerald-600 flex items-center text-sm"><CheckIcon className="w-4 h-4 mr-1"/> Uploaded</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Transfer Certificate (if applicable)</label>
                                    <div className="flex items-center gap-2">
                                        <label className="btn btn-secondary cursor-pointer">
                                            {uploadingDoc === 'transferCertificateUrl' ? <SpinnerIcon className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                                            <input type="file" onChange={(e) => handleFileChange(e, 'transferCertificateUrl')} className="hidden" accept="image/*" />
                                            Upload
                                        </label>
                                        {formData.transferCertificateUrl && <span className="text-emerald-600 flex items-center text-sm"><CheckIcon className="w-4 h-4 mr-1"/> Uploaded</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Last Report Card</label>
                                    <div className="flex items-center gap-2">
                                        <label className="btn btn-secondary cursor-pointer">
                                            {uploadingDoc === 'reportCardUrl' ? <SpinnerIcon className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                                            <input type="file" onChange={(e) => handleFileChange(e, 'reportCardUrl')} className="hidden" accept="image/*" />
                                            Upload
                                        </label>
                                        {formData.reportCardUrl && <span className="text-emerald-600 flex items-center text-sm"><CheckIcon className="w-4 h-4 mr-1"/> Uploaded</span>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-6 border-t">
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8 py-3 text-lg disabled:bg-slate-400">
                                {isSubmitting ? (
                                    <>
                                        <SpinnerIcon className="w-6 h-6 mr-2" /> Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
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
