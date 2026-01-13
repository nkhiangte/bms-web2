import React, { useState, FormEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { OnlineAdmission, Grade, Gender, BloodGroup } from '../../types';
// FIX: Added GENDER_LIST to the import to resolve 'Cannot find name' error.
import { GRADES_LIST, BLOOD_GROUP_LIST, GENDER_LIST } from '../../constants';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, UploadIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id' | 'submissionDate' | 'status'>) => Promise<boolean>;
}

type FileUploads = {
    transferCertificate: File | null;
    birthCertificate: File | null;
    reportCard: File | null;
    paymentScreenshot: File | null;
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
    const initialFormState = {
        admissionGrade: Grade.NURSERY, academicYear: '2026-27', studentName: '', dateOfBirth: '', gender: Gender.MALE,
        studentAadhaar: '', fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '', parentAadhaar: '',
        guardianName: '', guardianRelationship: '', permanentAddress: '', presentAddress: '', contactNumber: '',
        penNumber: '', motherTongue: 'Mizo', isCWSN: 'No' as 'Yes' | 'No', bloodGroup: undefined, email: '', lastSchoolAttended: '', lastDivision: '',
        generalBehaviour: 'Normal' as 'Mild' | 'Normal' | 'Hyperactive', siblingsInSchool: 0, achievements: '', healthIssues: '',
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [fileUploads, setFileUploads] = useState<FileUploads>({ transferCertificate: null, birthCertificate: null, reportCard: null, paymentScreenshot: null });
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ transferCertificate: 'idle', birthCertificate: 'idle', reportCard: 'idle', paymentScreenshot: 'idle' });
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
    };
    
    const handleFileChange = (id: keyof FileUploads, file: File | null) => {
        setFileUploads(prev => ({ ...prev, [id]: file }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            alert("You must agree to the declaration before submitting.");
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus('idle');

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
                paymentScreenshotUrl: uploadedFileUrls.paymentScreenshot!,
            };

            const success = await onOnlineAdmissionSubmit(submissionData);
            if (success) {
                setSubmissionStatus('success');
            } else {
                throw new Error("Failed to save data to the server.");
            }

        } catch (error) {
            console.error("Submission failed:", error);
            setSubmissionStatus('error');
            // Reset status for failed uploads
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
    
    if (submissionStatus === 'success') {
        return (
            <div className="bg-white py-16">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4"/>
                    <h1 className="text-3xl font-bold text-slate-800">Application Submitted!</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Thank you for your interest in Bethel Mission School. Your application has been received successfully.
                        The school office will review your application and contact you shortly regarding the next steps.
                    </p>
                    <Link to="/" className="mt-8 btn btn-primary">Return to Homepage</Link>
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
                        <p className="mt-2 text-lg text-slate-600">Academic Year: 2026–27</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Student's Particulars */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Student's Particulars</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold">Applying for Class <span className="text-red-600">*</span></label><select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required><option value="" disabled>-- Select Class --</option>{GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
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
                                <div><label className="block text-sm font-bold">Last School Attended</label><input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended} onChange={handleChange} className="form-input w-full mt-1" /></div>
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
                             <p className="text-sm text-slate-600">Please upload clear images (JPG, PNG) of the following documents.</p>
                             <FileUploadField label="Birth Certificate" id="birthCertificate" file={fileUploads.birthCertificate} status={uploadProgress.birthCertificate} onFileChange={handleFileChange} />
                             <FileUploadField label="Transfer Certificate (if applicable)" id="transferCertificate" file={fileUploads.transferCertificate} status={uploadProgress.transferCertificate} onFileChange={handleFileChange} />
                             <FileUploadField label="Previous Progress Report Card (if applicable)" id="reportCard" file={fileUploads.reportCard} status={uploadProgress.reportCard} onFileChange={handleFileChange} />
                        </fieldset>

                        {/* Payment Section */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                             <legend className="text-xl font-bold text-slate-800 px-2">Admission Fee Payment</legend>
                             <p className="text-sm text-slate-600">Please pay the admission fee of <strong className="text-slate-800">₹1,000</strong> using the UPI QR code below and upload a screenshot of the successful payment.</p>
                             <div className="flex justify-center">
                                {/* Placeholder QR code */}
                                <img src="https://i.ibb.co/L8mC9gW/qr-code-placeholder.png" alt="UPI QR Code Placeholder" className="w-48 h-48 border p-1"/>
                             </div>
                             <FileUploadField label="Upload Payment Screenshot" id="paymentScreenshot" file={fileUploads.paymentScreenshot} status={uploadProgress.paymentScreenshot} onFileChange={handleFileChange} required/>
                        </fieldset>

                        {/* Declaration */}
                         <div className="space-y-4">
                            <p className="text-xs text-slate-600 italic">I hereby solemnly affirm & declare that I have read the contents of School Diary clearly and have understood the points mentioned in the undertaking. I shall abide by the rules and regulations of the school as mentioned in the said diary and also the changes which may be notified from time to time. I further confirm that the information given in the application form is correct and true to the best of my knowledge & belief.</p>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"/>
                                <span className="font-semibold text-slate-800">I agree to the declaration.</span>
                            </label>
                        </div>
                        
                        {submissionStatus === 'error' && (
                             <p className="text-red-600 font-bold text-center">Submission failed. Please check your internet connection, ensure all required fields are filled, and try again.</p>
                        )}
                        
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={!agreed || isSubmitting} className="btn btn-primary !text-lg !font-bold !px-8 !py-3 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {isSubmitting ? <SpinnerIcon className="w-6 h-6"/> : null}
                                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default OnlineAdmissionPage;