
import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADES_LIST, GENDER_LIST, BLOOD_GROUP_LIST, CATEGORY_LIST } from '../../constants';
import { Grade, Gender, BloodGroup, Category, OnlineAdmission } from '../../types';
import CustomDatePicker from '../../components/CustomDatePicker';
import { UploadIcon, SpinnerIcon, CheckCircleIcon } from '../../components/Icons';
import { uploadToImgBB, resizeImage } from '../../utils';

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id' | 'status' | 'submissionDate'>) => Promise<string>;
}

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Partial<OnlineAdmission>>({
        studentName: '',
        admissionGrade: '',
        dateOfBirth: '',
        gender: Gender.MALE,
        studentAadhaar: '',
        fatherName: '',
        motherName: '',
        fatherOccupation: '',
        motherOccupation: '',
        parentAadhaar: '',
        permanentAddress: '',
        presentAddress: '',
        contactNumber: '',
        category: Category.GENERAL,
        religion: '',
        bloodGroup: '',
        lastSchoolAttended: '',
        cwsn: 'No',
        birthCertificateUrl: '',
        transferCertificateUrl: '',
        reportCardUrl: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: any) => {
        setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingField(fieldName);
            try {
                const file = e.target.files[0];
                const resizedImage = await resizeImage(file, 800, 800, 0.8);
                const url = await uploadToImgBB(resizedImage);
                setFormData(prev => ({ ...prev, [fieldName]: url }));
            } catch (error) {
                console.error("Upload failed", error);
                alert("Image upload failed. Please try again.");
            } finally {
                setUploadingField(null);
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.studentName || !formData.admissionGrade || !formData.dateOfBirth || !formData.contactNumber) {
            alert("Please fill in all required fields marked with *");
            return;
        }

        setIsSubmitting(true);
        try {
            const id = await onOnlineAdmissionSubmit(formData as any);
            navigate('/admissions/status'); // Redirect to status check or success page
            alert(`Application Submitted Successfully! Your Reference ID is: ${id}`);
        } catch (error) {
            console.error("Submission error", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 py-12 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-800">Online Admission Form</h1>
                        <p className="mt-2 text-slate-600">Session 2026-2027</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Student Details */}
                        <fieldset className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                            <legend className="text-lg font-bold text-slate-800 px-2">Student Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Admission to Class <span className="text-red-500">*</span></label>
                                    <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required>
                                        <option value="">-- Select Class --</option>
                                        {GRADES_LIST.filter(g => g !== Grade.X).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input w-full mt-1 uppercase" placeholder="IN CAPITAL LETTERS" required />
                                </div>
                                <div>
                                    <CustomDatePicker 
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth || ''}
                                        onChange={handleDateChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Gender <span className="text-red-500">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1" required>
                                        {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="form-select w-full mt-1">
                                        {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
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
                                    <label className="block text-sm font-bold text-slate-700">Religion</label>
                                    <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Aadhaar Number</label>
                                    <input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Parent Details */}
                        <fieldset className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                            <legend className="text-lg font-bold text-slate-800 px-2">Parent / Guardian Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Father's Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Father's Occupation</label>
                                    <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother's Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Mother's Occupation</label>
                                    <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="form-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Primary Contact Number <span className="text-red-500">*</span></label>
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-input w-full mt-1" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700">Present Address <span className="text-red-500">*</span></label>
                                    <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700">Permanent Address</label>
                                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2}></textarea>
                                </div>
                            </div>
                        </fieldset>

                        {/* Documents */}
                        <fieldset className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                            <legend className="text-lg font-bold text-slate-800 px-2">Document Uploads</legend>
                            <p className="text-sm text-slate-600 mb-2">Supported formats: JPG, PNG. Max size: 2MB.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Birth Cert */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Birth Certificate</label>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-white transition-colors">
                                        {formData.birthCertificateUrl ? (
                                            <div className="relative">
                                                <img src={formData.birthCertificateUrl} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold opacity-0 hover:opacity-100 transition-opacity rounded cursor-pointer" onClick={() => document.getElementById('birthCert')?.click()}>Change</div>
                                            </div>
                                        ) : (
                                            <div onClick={() => document.getElementById('birthCert')?.click()} className="cursor-pointer">
                                                {uploadingField === 'birthCertificateUrl' ? <SpinnerIcon className="w-8 h-8 mx-auto text-sky-600"/> : <UploadIcon className="w-8 h-8 mx-auto text-slate-400"/>}
                                                <span className="block text-xs mt-1 text-slate-500">Click to Upload</span>
                                            </div>
                                        )}
                                        <input type="file" id="birthCert" onChange={(e) => handleFileUpload(e, 'birthCertificateUrl')} className="hidden" accept="image/*" />
                                    </div>
                                </div>

                                {/* TC */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Transfer Certificate (if applicable)</label>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-white transition-colors">
                                        {formData.transferCertificateUrl ? (
                                            <div className="relative">
                                                <img src={formData.transferCertificateUrl} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold opacity-0 hover:opacity-100 transition-opacity rounded cursor-pointer" onClick={() => document.getElementById('tc')?.click()}>Change</div>
                                            </div>
                                        ) : (
                                            <div onClick={() => document.getElementById('tc')?.click()} className="cursor-pointer">
                                                {uploadingField === 'transferCertificateUrl' ? <SpinnerIcon className="w-8 h-8 mx-auto text-sky-600"/> : <UploadIcon className="w-8 h-8 mx-auto text-slate-400"/>}
                                                <span className="block text-xs mt-1 text-slate-500">Click to Upload</span>
                                            </div>
                                        )}
                                        <input type="file" id="tc" onChange={(e) => handleFileUpload(e, 'transferCertificateUrl')} className="hidden" accept="image/*" />
                                    </div>
                                </div>

                                {/* Report Card */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Previous Report Card</label>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-white transition-colors">
                                        {formData.reportCardUrl ? (
                                            <div className="relative">
                                                <img src={formData.reportCardUrl} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold opacity-0 hover:opacity-100 transition-opacity rounded cursor-pointer" onClick={() => document.getElementById('reportCard')?.click()}>Change</div>
                                            </div>
                                        ) : (
                                            <div onClick={() => document.getElementById('reportCard')?.click()} className="cursor-pointer">
                                                {uploadingField === 'reportCardUrl' ? <SpinnerIcon className="w-8 h-8 mx-auto text-sky-600"/> : <UploadIcon className="w-8 h-8 mx-auto text-slate-400"/>}
                                                <span className="block text-xs mt-1 text-slate-500">Click to Upload</span>
                                            </div>
                                        )}
                                        <input type="file" id="reportCard" onChange={(e) => handleFileUpload(e, 'reportCardUrl')} className="hidden" accept="image/*" />
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex justify-end">
                            <button type="submit" disabled={isSubmitting || !!uploadingField} className="btn btn-primary w-full sm:w-auto !px-8 !py-3 !text-lg">
                                {isSubmitting ? (
                                    <>
                                        <SpinnerIcon className="w-6 h-6 mr-2" />
                                        Submitting...
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
