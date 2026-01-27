
import React, { useState, FormEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OnlineAdmission, Grade, Gender, BloodGroup } from '../../types';
import { GRADES_LIST, BLOOD_GROUP_LIST, GENDER_LIST } from '../../constants';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, UploadIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id' | 'submissionDate' | 'status'>) => Promise<string | null>;
}

type FileUploads = {
    transferCertificate: File | null;
    birthCertificate: File | null;
    reportCard: File | null;
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type UploadProgress = Record<keyof FileUploads, UploadStatus>;

const FileUploadField: React.FC<{
    label: string;
    id: keyof FileUploads;
    file: File | null;
    status: UploadStatus;
    onFileChange: (id: keyof FileUploads, file: File | null) => void;
    required?: boolean;
}> = ({ label, id, file, status, onFileChange, required }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-sm font-bold text-slate-800">{label} {required && <span className="text-red-600">*</span>}</label>
            <div className="mt-1 flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary whitespace-nowrap">
                    <UploadIcon className="w-5 h-5"/> Choose File
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => onFileChange(id, e.target.files?.[0] || null)} accept="image/jpeg,image/png,image/webp" className="hidden"/>
                {file && <span className="text-sm text-slate-700 truncate">{file.name}</span>}
                {status === 'uploading' && <SpinnerIcon className="w-5 h-5 text-sky-600"/>}
                {status === 'success' && <CheckCircleIcon className="w-5 h-5 text-emerald-600"/>}
                {status === 'error' && <XCircleIcon className="w-5 h-5 text-red-600"/>}
            </div>
        </div>
    );
};


const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    // FUTURE TODO: Fetch this from config if needed
    const academicYearLabel = "2026-27"; 

    const initialFormState = {
        admissionGrade: Grade.NURSERY, academicYear: academicYearLabel, studentName: '', dateOfBirth: '', gender: Gender.MALE,
        studentAadhaar: '', fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '', parentAadhaar: '',
        guardianName: '', guardianRelationship: '', permanentAddress: '', presentAddress: '', contactNumber: '',
        penNumber: '', motherTongue: 'Mizo', isCWSN: 'No' as 'Yes' | 'No', bloodGroup: undefined, email: '', lastSchoolAttended: '', lastDivision: '',
        generalBehaviour: 'Normal' as 'Mild' | 'Normal' | 'Hyperactive', siblingsInSchool: 0, achievements: '', healthIssues: '',
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [fileUploads, setFileUploads] = useState<FileUploads>({ transferCertificate: null, birthCertificate: null, reportCard: null });
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ transferCertificate: 'idle', birthCertificate: 'idle', reportCard: 'idle' });
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submittedAdmissionId, setSubmittedAdmissionId] = useState<string | null>(null);
    
    // State for Last School Attended logic
    const [isOtherSchool, setIsOtherSchool] = useState(false);
    const [customSchoolInput, setCustomSchoolInput] = useState('');

    const isNursery = formData.admissionGrade === Grade.NURSERY;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
    };
    
    const handleSchoolSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Others') {
            setIsOtherSchool(true);
            setFormData(prev => ({ ...prev, lastSchoolAttended: customSchoolInput }));
        } else {
            setIsOtherSchool(false);
            setFormData(prev => ({ ...prev, lastSchoolAttended: val }));
        }
    };

    const handleCustomSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomSchoolInput(val);
        setFormData(prev => ({ ...prev, lastSchoolAttended: val }));
    };
    
    const handleFileChange = (id: keyof FileUploads, file: File | null) => {
        setFileUploads(prev => ({ ...prev, [id]: file }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            alert("You must agree to the School Rules & Regulations before submitting.");
            return;
        }
        
        if (isNursery) {
            if (!fileUploads.birthCertificate) {
                alert("Please upload the Birth Certificate.");
                return;
            }
        } else {
            if (!fileUploads.birthCertificate || !fileUploads.transferCertificate || !fileUploads.reportCard) {
                alert("Please upload all required documents: Birth Certificate, Transfer Certificate, and Report Card.");
                return;
            }
        }

        setIsSubmitting(true);
        setSubmissionError(null);

        const uploadedFileUrls: Partial<Record<keyof FileUploads, string>> = {};

        try {
            for (const key of Object.keys(fileUploads) as Array<keyof FileUploads>) {
                const file = fileUploads[key];
                if (file) {
                    setUploadProgress(prev => ({ ...prev, [key]: 'uploading' }));
                    const resized = await resizeImage(file, 1024, 1024, 0.8);
                    const url = await uploadToImgBB(resized);
                    uploadedFileUrls[key] = url;
                    setUploadProgress(prev => ({ ...prev, [key]: 'success' }));
                }
            }

            const submissionData = {
                ...formData,
                transferCertificateUrl: uploadedFileUrls.transferCertificate,
                birthCertificateUrl: uploadedFileUrls.birthCertificate,
                reportCardUrl: uploadedFileUrls.reportCard,
            };

            const newAdmissionId = await onOnlineAdmissionSubmit(submissionData);
            if (newAdmissionId) {
                setSubmittedAdmissionId(newAdmissionId);
                setSubmissionSuccess(true);
                window.scrollTo(0, 0);
            } else {
                throw new Error("Failed to get admission ID from the server.");
            }

        } catch (error) {
            console.error("Submission failed:", error);
            setSubmissionError("An error occurred during submission. Please check your connection and try again.");
            setUploadProgress(prev => {
                const newProgress = {...prev};
                for (const key in newProgress) {
                    if (newProgress[key as keyof UploadProgress] === 'uploading') {
                        newProgress[key as keyof UploadProgress] = 'error';
                    }
                }
                return newProgress;
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg text-center">
                         <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4"/>
                         <h1 className="text-3xl font-extrabold text-slate-800">Application Submitted!</h1>
                         <p className="mt-4 text-lg text-slate-600">
                             Thank you for applying to {formData.admissionGrade} at Bethel Mission School.
                         </p>
                         
                         {submittedAdmissionId && (
                            <div className="mt-6 text-center">
                                <p className="text-slate-600">Your Application Reference ID is:</p>
                                <p className="font-mono text-lg font-bold bg-slate-100 inline-block px-4 py-2 rounded-lg mt-1 border">{submittedAdmissionId}</p>
                                <p className="text-sm text-red-600 font-semibold mt-1">Please save this ID to check your application status later.</p>
                            </div>
                         )}

                         <div className="mt-8 bg-sky-50 p-6 rounded-lg border border-sky-100 text-left">
                             <h3 className="font-bold text-sky-800 mb-3 text-lg">Next Steps:</h3>
                             {formData.admissionGrade === Grade.IX ? (
                                <div className="text-sky-800 leading-relaxed space-y-2">
                                    <p>Admission to {formData.admissionGrade} is on a <strong>merit basis</strong>. Your application is now <strong className="bg-amber-200 text-amber-900 px-2 py-1 rounded">Under Review</strong>.</p>
                                    <ul className="list-disc list-inside pl-4 text-sm">
                                         <li>Our administration will review your academic records and submitted documents.</li>
                                         <li>If your application is approved, you will be notified via SMS or call.</li>
                                         <li>You can check your status anytime using your Application Reference ID.</li>
                                    </ul>
                                </div>
                             ) : (
                                 <div className="text-sky-800 leading-relaxed space-y-2">
                                     <p>Your application has been received. To complete your registration for {formData.admissionGrade}, please proceed to the payment page.</p>
                                     <ul className="list-disc list-inside pl-4 text-sm">
                                         <li>On the next page, you can select uniforms and other required items.</li>
                                         <li>Complete the online payment as instructed to finalize your admission.</li>
                                     </ul>
                                 </div>
                             )}
                         </div>
                         <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/admissions/status" className="btn btn-secondary">Check Status Now</Link>
                            {formData.admissionGrade !== Grade.IX && (
                                <button onClick={() => navigate(`/admissions/payment/${submittedAdmissionId}`, { state: { grade: formData.admissionGrade, studentName: formData.studentName, fatherName: formData.fatherName, contact: formData.contactNumber } })} className="btn btn-primary">
                                    Proceed to Payment
                                </button>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Logo" className="h-24 mx-auto mb-4" />
                        <h1 className="text-3xl font-extrabold text-slate-800">Online Admission Form</h1>
                        <p className="mt-2 text-lg text-slate-600">Academic Year: {academicYearLabel}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Student's Particulars */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Student's Particulars</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold">Applying for Class <span className="text-red-600">*</span></label><select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required><option value="" disabled>-- Select Class --</option>{GRADES_LIST.filter(g => g !== Grade.X).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                <div><label className="block text-sm font-bold">Name (in CAPITAL) <span className="text-red-600">*</span></label><input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input w-full mt-1 uppercase" required/></div>
                                <div><label className="block text-sm font-bold">Date of Birth <span className="text-red-600">*</span></label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Gender <span className="text-red-600">*</span></label><select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1" required>{GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                <div><label className="block text-sm font-bold">Aadhaar No. <span className="text-red-600">*</span></label><input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">PEN No.</label><input type="text" name="penNumber" value={formData.penNumber} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Mother Tongue</label><input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">CWSN?</label><select name="isCWSN" value={formData.isCWSN} onChange={handleChange} className="form-select w-full mt-1"><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                <div><label className="block text-sm font-bold">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="form-select w-full mt-1"><option value="">-- Select --</option>{BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                            </div>
                        </fieldset>

                        {/* Parent/Guardian Details */}
                         <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Parent's/Guardian's Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold">Father's Name <span className="text-red-600">*</span></label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Mother's Name <span className="text-red-600">*</span></label><input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Father's Occupation</label><input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Mother's Occupation</label><input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Parent's Aadhaar No.</label><input type="text" name="parentAadhaar" value={formData.parentAadhaar} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Guardian's Name</label><input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Relationship with Guardian</label><input type="text" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Permanent Address <span className="text-red-600">*</span></label><textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Present Address <span className="text-red-600">*</span></label><textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea></div>
                                <div><label className="block text-sm font-bold">Contact No. <span className="text-red-600">*</span></label><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full mt-1" /></div>
                            </div>
                         </fieldset>
                         
                         {/* Academic Details */}
                         <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Academic & Other Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold">Last School Attended <span className="text-red-600">*</span></label>
                                    <select 
                                        value={isOtherSchool ? 'Others' : (formData.lastSchoolAttended === 'Bethel Mission School' ? 'Bethel Mission School' : '')} 
                                        onChange={handleSchoolSelectChange} 
                                        className="form-select w-full mt-1"
                                        required
                                    >
                                        <option value="" disabled>-- Select School --</option>
                                        <option value="Bethel Mission School">Bethel Mission School</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {isOtherSchool && (
                                        <input 
                                            type="text" 
                                            name="lastSchoolAttended"
                                            placeholder="Enter Name of School" 
                                            value={customSchoolInput} 
                                            onChange={handleCustomSchoolChange} 
                                            className="form-input w-full mt-2" 
                                            required 
                                        />
                                    )}
                                </div>
                                <div><label className="block text-sm font-bold">Division in which he/she passed</label><input type="text" name="lastDivision" value={formData.lastDivision} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">General Behaviour</label><select name="generalBehaviour" value={formData.generalBehaviour} onChange={handleChange} className="form-select w-full mt-1"><option>Mild</option><option>Normal</option><option>Hyperactive</option></select></div>
                                <div><label className="block text-sm font-bold">Siblings in this school</label><input type="number" name="siblingsInSchool" value={formData.siblingsInSchool} onChange={handleChange} className="form-input w-full mt-1" min="0"/></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Achievements (Academics/Extra-curricular)</label><textarea name="achievements" value={formData.achievements} onChange={handleChange} className="form-textarea w-full mt-1" rows={2}></textarea></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Health issues the school should be aware of</label><textarea name="healthIssues" value={formData.healthIssues} onChange={handleChange} className="form-textarea w-full mt-1" rows={2}></textarea></div>
                            </div>
                        </fieldset>
                        
                        {/* Document Upload */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                             <legend className="text-xl font-bold text-slate-800 px-2">Document Upload</legend>
                             <p className="text-sm text-slate-600">
                                Please upload clear images (JPG, PNG) of the following documents.
                                {isNursery && <span className="block text-sky-700 font-semibold">For Nursery admission, only the Birth Certificate is required.</span>}
                             </p>
                             <FileUploadField label="Birth Certificate" id="birthCertificate" file={fileUploads.birthCertificate} status={uploadProgress.birthCertificate} onFileChange={handleFileChange} required />
                             <FileUploadField label="Transfer Certificate" id="transferCertificate" file={fileUploads.transferCertificate} status={uploadProgress.transferCertificate} onFileChange={handleFileChange} required={!isNursery} />
                             <FileUploadField label="Previous Progress Report Card" id="reportCard" file={fileUploads.reportCard} status={uploadProgress.reportCard} onFileChange={handleFileChange} required={!isNursery} />
                        </fieldset>

                        {/* Declaration */}
                         <div className="space-y-4">
                            <div className="h-48 overflow-y-auto p-4 border border-slate-300 rounded bg-white text-sm text-slate-700 space-y-4 mb-4 shadow-inner">
                                <h3 className="font-bold text-center text-lg text-slate-800">School Rules & Regulations</h3>
                                <p>By submitting this form, you agree to abide by all the rules, regulations, and decisions of the school authorities.</p>
                                <p>This includes policies on academic integrity, attendance, uniform & grooming, discipline, fees, and safety. Misrepresentation of information in this form may lead to cancellation of admission.</p>
                                <p>Full rules can be viewed on the school website.</p>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"/>
                                <span className="font-semibold text-slate-800">I have read, understood, and agree to abide by the School Rules & Regulations.</span>
                            </label>
                        </div>
                        
                        {submissionError && (
                             <p className="text-red-600 font-bold text-center">{submissionError}</p>
                        )}
                        
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={!agreed || isSubmitting} className="btn btn-primary !text-lg !font-bold !px-8 !py-3 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {isSubmitting ? <SpinnerIcon className="w-6 h-6"/> : null}
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default OnlineAdmissionPage;
