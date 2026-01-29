

import React, { useState, FormEvent, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, OnlineAdmission, Gender, Category, BloodGroup } from '../../types';
import { GRADES_LIST, GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../../constants';
import { UploadIcon, SpinnerIcon, CheckIcon } from '../../components/Icons';
import { uploadToImgBB, resizeImage } from '../../utils';
import CustomDatePicker from '../../components/CustomDatePicker';

const { useNavigate } = ReactRouterDOM as any;

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id'>) => Promise<string>;
}

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});

    const [formData, setFormData] = useState<Omit<OnlineAdmission, 'id' | 'submissionDate' | 'status'>>({
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
        paymentScreenshotUrl: '', // Not used in initial submission, handled in payment page
    });

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.studentName || !formData.admissionGrade || !formData.dateOfBirth || !formData.fatherName || !formData.contactNumber) {
            alert("Please fill in all mandatory fields marked with *.");
            return;
        }

        if (formData.admissionGrade !== Grade.NURSERY && !formData.transferCertificateUrl) {
            alert("Transfer Certificate is required for classes above Nursery.");
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionId = await onOnlineAdmissionSubmit({
                ...formData,
                submissionDate: new Date().toISOString(),
                status: 'pending'
            } as any);

            // Redirect to status page or payment page if immediate payment logic is added later
            navigate('/admissions/status', { state: { submissionId } });
            alert(`Application Submitted Successfully! Your Reference ID is: ${submissionId}`);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-800">Online Admission Form</h1>
                        <p className="text-slate-600 mt-2">Academic Session 2026-2027</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Student's Particulars */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Student's Particulars</legend>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Admission Type</label>
                                    <select name="studentType" value={formData.studentType} onChange={handleChange} className="form-select w-full mt-1">
                                        <option value="Newcomer">New Admission</option>
                                        <option value="Existing">Existing Student (Re-admission)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Applying for Class <span className="text-red-600">*</span></label>
                                    <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required>
                                        <option value="" disabled>-- Select Class --</option>
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
                                        value={formData.dateOfBirth}
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
                                    {formData.admissionGrade !== Grade.NURSERY && !formData.transferCertificateUrl && (
                                        <p className="text-xs text-amber-600 mt-1">Required for classes above Nursery.</p>
                                    )}
                                </div>
                            </div>
                        </fieldset>
                        
                        <div className="flex justify-end pt-6 border-t border-slate-200">
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
                                    "Submit Application"
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