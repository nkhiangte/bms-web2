
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { OnlineAdmission } from '../../types';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, ArrowRightIcon } from '../../components/Icons';

const AdmissionStatusPage: React.FC = () => {
    const [admissionId, setAdmissionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [admissionData, setAdmissionData] = useState<OnlineAdmission | null>(null);
    const navigate = useNavigate();

    const handleCheckStatus = async (e: FormEvent) => {
        e.preventDefault();
        if (!admissionId.trim()) {
            setError("Please enter a valid Application Reference ID.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAdmissionData(null);

        try {
            const docRef = db.collection('online_admissions').doc(admissionId.trim());
            const doc = await docRef.get();
            if (doc.exists) {
                setAdmissionData({ id: doc.id, ...doc.data() } as OnlineAdmission);
            } else {
                setError("No application found with this ID. Please check the ID and try again.");
            }
        } catch (err) {
            console.error("Error fetching admission status:", err);
            setError("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const StatusCard: React.FC<{ status: OnlineAdmission['status'], title: string, message: string, children?: React.ReactNode }> = ({ status, title, message, children }) => {
        const styles = {
            pending: { icon: <InformationCircleIcon className="w-12 h-12 text-amber-500"/>, color: 'border-amber-400 bg-amber-50' },
            reviewed: { icon: <InformationCircleIcon className="w-12 h-12 text-sky-500"/>, color: 'border-sky-400 bg-sky-50' },
            approved: { icon: <CheckCircleIcon className="w-12 h-12 text-emerald-500"/>, color: 'border-emerald-400 bg-emerald-50' },
            rejected: { icon: <XCircleIcon className="w-12 h-12 text-red-500"/>, color: 'border-red-400 bg-red-50' },
        };
        const selectedStyle = styles[status] || styles.pending;

        return (
            <div className={`mt-6 p-6 border-l-4 rounded-r-lg text-left ${selectedStyle.color}`}>
                <div className="flex items-start gap-4">
                    {selectedStyle.icon}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                        <p className="mt-2 text-slate-700">{message}</p>
                    </div>
                </div>
                {children && <div className="mt-4 pt-4 border-t border-slate-200/50">{children}</div>}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg text-center">
                    <h1 className="text-3xl font-extrabold text-slate-800">Check Admission Status</h1>
                    <p className="mt-2 text-lg text-slate-600">Enter your Application Reference ID to see the current status of your application.</p>
                    
                    <form onSubmit={handleCheckStatus} className="mt-8">
                        <label htmlFor="admission-id" className="sr-only">Application Reference ID</label>
                        <div className="flex gap-2">
                            <input
                                id="admission-id"
                                type="text"
                                value={admissionId}
                                onChange={e => setAdmissionId(e.target.value)}
                                className="form-input flex-grow"
                                placeholder="Enter your Application ID"
                                required
                            />
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : "Check Status"}
                            </button>
                        </div>
                        {error && <p className="text-red-600 text-sm mt-2 text-left">{error}</p>}
                    </form>
                    
                    {admissionData && (
                        <div className="animate-fade-in">
                            {admissionData.status === 'pending' || admissionData.status === 'reviewed' ? (
                                <StatusCard status={admissionData.status} title="Application Under Review" message="Your application for Bethel Mission School is currently being reviewed by our administration. Please check back later for updates." />
                            ) : admissionData.status === 'approved' ? (
                                <StatusCard status="approved" title="Congratulations! Your Application is Approved." message={`You are now eligible to complete the admission process for ${admissionData.admissionGrade}. Please proceed to the payment page to finalize your admission.`}>
                                    <button onClick={() => navigate(`/admissions/payment/${admissionData.id}`, { state: { grade: admissionData.admissionGrade, studentName: admissionData.studentName, fatherName: admissionData.fatherName, contact: admissionData.contactNumber } })} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 w-full mt-2 !py-3 !text-base">
                                        Proceed to Payment <ArrowRightIcon className="w-5 h-5"/>
                                    </button>
                                </StatusCard>
                            ) : admissionData.status === 'rejected' ? (
                                <StatusCard status="rejected" title="Application Update" message="We regret to inform you that we are unable to offer a place at this time. Please contact the school office for more details." />
                            ) : null}

                            {/* Additional case for already paid */}
                            {admissionData.paymentStatus === 'paid' && admissionData.status === 'approved' && (
                                <StatusCard status="approved" title="Admission Complete" message="Your admission process is complete, and payment has been received. You can re-download your receipt from the admissions page.">
                                     <Link to="/admissions/payment" state={{ admissionId: admissionData.id, grade: admissionData.admissionGrade, studentName: admissionData.studentName }} className="btn btn-secondary w-full mt-2">
                                        View/Download Receipt
                                     </Link>
                                </StatusCard>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-sm">
                        <Link to="/admissions" className="text-sky-600 hover:underline">&larr; Back to Admission Guidelines</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionStatusPage;
