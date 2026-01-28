
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grade } from '../../types';
import { SpinnerIcon } from '../../components/Icons';

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: any) => Promise<string>;
}

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentName: '',
        admissionGrade: Grade.NURSERY,
        fatherName: '',
        contactNumber: '',
        studentType: 'Newcomer'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submittedAdmissionId, setSubmittedAdmissionId] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Mocking a full submission data structure for now, based on minimal fields
            const submissionData = {
                ...formData,
                dateOfBirth: new Date().toISOString(), // Placeholder
                gender: 'Male', // Placeholder
                // ... other required fields would be collected in a real comprehensive form
            };

            const newAdmissionId = await onOnlineAdmissionSubmit(submissionData);
            
            if (newAdmissionId) {
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
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h2 className="text-2xl font-bold text-emerald-600 mb-4">Application Submitted!</h2>
                    <p className="text-slate-700 mb-4">
                        Your application for Class IX has been received. Your Reference ID is: <strong>{submittedAdmissionId}</strong>
                    </p>
                    <p className="text-slate-600">
                        Please wait for further instructions regarding the entrance test/interview. You will be contacted via the provided phone number.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Online Admission</h1>
                    <p className="mt-2 text-slate-600">Apply for the upcoming academic session</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Admission for Class</label>
                            <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500">
                                {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Student Name</label>
                            <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Father's Name</label>
                            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Contact Number</label>
                            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Student Type</label>
                            <select name="studentType" value={formData.studentType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500">
                                <option value="Newcomer">Newcomer</option>
                                <option value="Existing">Existing Student</option>
                            </select>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400">
                            {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Proceed to Payment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnlineAdmissionPage;
