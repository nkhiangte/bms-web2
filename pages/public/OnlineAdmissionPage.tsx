
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grade, Gender, Category, BloodGroup } from '../../types';
import { SpinnerIcon, UploadIcon, CheckCircleIcon, XCircleIcon } from '../../components/Icons';
import { GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../../constants';
import { uploadToImgBB, resizeImage } from '../../utils';

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: any) => Promise<string>;
}

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    
    // Full form state
    const [formData, setFormData] = useState({
        admissionGrade: Grade.NURSERY,
        studentName: '',
        dateOfBirth: '',
        gender: 'Male',
        category: 'General',
        religion: '',
        bloodGroup: '',
        isCWSN: 'No',
        studentAadhaar: '',
        
        fatherName: '',
        fatherOccupation: '',
        fatherAadhaar: '',
        motherName: '',
        motherOccupation: '',
        motherAadhaar: '',
        guardianName: '',
        guardianRelationship: '',
        
        presentAddress: '',
        permanentAddress: '',
        contactNumber: '',
        email: '',
        
        lastSchoolAttended: '',
        studentType: 'Newcomer', // 'Newcomer' or 'Existing'

        // Documents
        photographUrl: '',
        birthCertificateUrl: '',
        transferCertificateUrl: '',
        reportCardUrl: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submittedAdmissionId, setSubmittedAdmissionId] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldName);
        try {
            // Resize image to reduce bandwidth (800x800 max, 80% quality)
            const resizedImage = await resizeImage(file, 800, 800, 0.8);
            const url = await uploadToImgBB(resizedImage);
            setFormData(prev => ({ ...prev, [fieldName]: url }));
        } catch (err: any) {
            console.error("Upload failed", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingField(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.studentName || !formData.fatherName || !formData.contactNumber || !formData.dateOfBirth) {
            setError("Please fill in all mandatory fields.");
            window.scrollTo(0, 0);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const submissionData = {
                ...formData,
                submissionDate: new Date().toISOString(),
                status: 'pending',
                paymentStatus: 'pending'
            };

            const newAdmissionId = await onOnlineAdmissionSubmit(submissionData);
            
            if (newAdmissionId) {
                // Special handling for Class IX (Entrance Test) vs others (Direct Payment)
                if (formData.admissionGrade === Grade.IX) {
                    setSubmittedAdmissionId(newAdmissionId);
                    setSubmissionSuccess(true);
                    window.scrollTo(0, 0);
                } else {
                    navigate(`/admissions/payment/${newAdmissionId}`, { 
                        state: { 
                            grade: formData.admissionGrade, 
                            studentName: formData.studentName, 
                            fatherName: formData.fatherName, 
                            contact: formData.contactNumber,
                            studentType: formData.studentType 
                        } 
                    });
                }
            } else {
                throw new Error("Failed to get admission ID from the server.");
            }
        } catch (err: any) {
            console.error("Submission error:", err);
            setError(err.message || "Failed to submit application.");
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md border-t-4 border-emerald-500">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
                    <p className="text-slate-600 mb-6">
                        Your application for <strong>{formData.admissionGrade}</strong> has been received successfully.
                    </p>
                    <div className="bg-slate-100 p-4 rounded-md mb-6">
                        <p className="text-xs text-slate-500 uppercase font-bold">Reference ID</p>
                        <p className="text-xl font-mono font-bold text-slate-800">{submittedAdmissionId}</p>
                    </div>
                    <p className="text-sm text-slate-500">
                        Please save your Reference ID. You will be contacted via the provided phone number regarding the entrance test/interview.
                    </p>
                    <button onClick={() => navigate('/')} className="mt-8 btn btn-primary w-full">Return to Home</button>
                </div>
            </div>
        );
    }

    const FileInput: React.FC<{ label: string, name: string, value: string }> = ({ label, name, value }) => (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
            {value ? (
                <div className="relative group">
                    <img src={value} alt="Preview" className="h-32 mx-auto object-contain rounded" />
                    <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({...prev, [name]: ''}))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XCircleIcon className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center justify-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" /> Uploaded
                    </p>
                </div>
            ) : (
                <label className="cursor-pointer block w-full h-full">
                    {uploadingField === name ? (
                        <div className="flex flex-col items-center justify-center h-24 text-sky-600">
                            <SpinnerIcon className="w-6 h-6 mb-2" />
                            <span className="text-xs">Uploading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-slate-500 hover:text-sky-600">
                            <UploadIcon className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">{label}</span>
                            <span className="text-xs mt-1 text-slate-400">Click to browse</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, name)} 
                        className="hidden" 
                        disabled={!!uploadingField}
                    />
                </label>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900">Online Admission</h1>
                    <p className="mt-2 text-lg text-slate-600">Application Form for Academic Session 2026-2027</p>
                </div>

                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
                    {/* Progress Header */}
                    <div className="bg-sky-600 p-4 text-white text-center">
                        <p className="text-sm opacity-90">Please fill in all details correctly. Fields marked with * are mandatory.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Section 1: Admission Details */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">1. Admission Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Admission for Class <span className="text-red-500">*</span></label>
                                    <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1">
                                        {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Student Type <span className="text-red-500">*</span></label>
                                    <select name="studentType" value={formData.studentType} onChange={handleChange} className="form-select w-full mt-1">
                                        <option value="Newcomer">Newcomer (New Admission)</option>
                                        <option value="Existing">Existing Student (Promotion)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Personal Details */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">2. Student Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="form-label">Student Full Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input w-full mt-1" placeholder="As per Birth Certificate" required />
                                </div>
                                <div>
                                    <label className="form-label">Date of Birth <span className="text-red-500">*</span></label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="form-label">Gender <span className="text-red-500">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1">
                                        {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="form-select w-full mt-1">
                                        {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Religion</label>
                                    <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="form-input w-full mt-1" placeholder="Christianity, etc." />
                                </div>
                                <div>
                                    <label className="form-label">Blood Group</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-select w-full mt-1">
                                        <option value="">Select...</option>
                                        {BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Child with Special Needs (CWSN)</label>
                                    <select name="isCWSN" value={formData.isCWSN} onChange={handleChange} className="form-select w-full mt-1">
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="form-label">Aadhaar Number</label>
                                    <input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} className="form-input w-full mt-1" placeholder="12-digit Aadhaar Number" />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Parent/Guardian Details */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">3. Parent / Guardian Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Father's Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="form-label">Father's Occupation</label>
                                    <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="form-label">Mother's Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="form-label">Mother's Occupation</label>
                                    <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="form-label">Guardian's Name (If applicable)</label>
                                    <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="form-label">Relationship with Guardian</label>
                                    <input type="text" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Contact & Address */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">4. Contact & Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Mobile Number (WhatsApp) <span className="text-red-500">*</span></label>
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-input w-full mt-1" required placeholder="+91..." />
                                </div>
                                <div>
                                    <label className="form-label">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full mt-1" placeholder="Optional" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="form-label">Present Address <span className="text-red-500">*</span></label>
                                    <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} rows={2} className="form-textarea w-full mt-1" required placeholder="House No, Veng, City"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="form-label">Permanent Address</label>
                                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows={2} className="form-textarea w-full mt-1" placeholder="Same as present address if empty"></textarea>
                                </div>
                            </div>
                        </section>

                        {/* Section 5: Academic History */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">5. Academic History</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="form-label">Last School Attended</label>
                                    <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                            </div>
                        </section>

                        {/* Section 6: Document Uploads */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">6. Document Uploads</h3>
                            <p className="text-sm text-slate-500 mb-4">Please upload clear images/scans. Max size 2MB per file.</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FileInput label="Passport Photo" name="photographUrl" value={formData.photographUrl} />
                                <FileInput label="Birth Certificate" name="birthCertificateUrl" value={formData.birthCertificateUrl} />
                                <FileInput label="Transfer Cert. (TC)" name="transferCertificateUrl" value={formData.transferCertificateUrl} />
                                <FileInput label="Last Report Card" name="reportCardUrl" value={formData.reportCardUrl} />
                            </div>
                        </section>

                        <div className="pt-6 border-t border-slate-200">
                             <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-sm text-amber-800">
                                <p className="font-bold mb-1">Declaration:</p>
                                <p>I hereby declare that the particulars entered in this form are true and correct to the best of my knowledge and belief.</p>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto md:min-w-[200px] flex justify-center items-center gap-2 py-4 px-8 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5">
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
