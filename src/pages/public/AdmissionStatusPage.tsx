import React, { useState, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { db } from '@/firebaseConfig';
import { OnlineAdmission, User } from '@/types';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, ArrowRightIcon, BackIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';

const { useNavigate, Link } = ReactRouterDOM as any;

interface AdmissionStatusPageProps { user: User | null; }

const AdmissionStatusPage: React.FC<AdmissionStatusPageProps> = ({ user }) => {
    const [admissionId, setAdmissionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [admissionData, setAdmissionData] = useState<OnlineAdmission | null>(null);
    const navigate = useNavigate();

    const handleCheckStatus = async (e: FormEvent) => {
        e.preventDefault();
        if (!admissionId.trim()) { setError("Please enter a valid Application Reference ID."); return; }
        setIsLoading(true); setError(null); setAdmissionData(null);
        try {
            const docRef = db.collection('online_admissions').doc(admissionId.trim());
            const doc = await docRef.get();
            if (doc.exists) { setAdmissionData({ id: doc.id, ...doc.data() } as OnlineAdmission); }
            else { setError("No application found with this ID. Please check the ID and try again."); }
        } catch (err) { setError("An error occurred. Please try again later."); }
        finally { setIsLoading(false); }
    };

    const StatusCard: React.FC<{ status: OnlineAdmission['status'], title: string, message: string, children?: React.ReactNode }> = ({ status, title, message, children }) => {
        const styles = {
            pending: {
                icon: <InformationCircleIcon className="w-11 h-11 text-[#DFC06B] flex-shrink-0" />,
                color: 'border-[#C9A84C] bg-[#0B1F3A]',
            },
            reviewed: {
                icon: <InformationCircleIcon className="w-11 h-11 text-white flex-shrink-0" />,
                color: 'border-white bg-[#132D52]',
            },
            approved: {
                icon: <CheckCircleIcon className="w-11 h-11 text-[#DFC06B] flex-shrink-0" />,
                color: 'border-[#C9A84C] bg-[#132D52]',
            },
            rejected: {
                icon: <XCircleIcon className="w-11 h-11 text-white/80 flex-shrink-0" />,
                color: 'border-white/50 bg-[#07162B]',
            },
        };
        const selectedStyle = styles[status] || styles.pending;
        return (
            <div className={`mt-6 p-6 border-l-4 border border-white/15 rounded-r-xl text-left ${selectedStyle.color}`}>
                <div className="flex items-start gap-4">
                    {selectedStyle.icon}
                    <div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="mt-2 text-white/80 text-sm sm:text-base">{message}</p>
                    </div>
                </div>
                {children && <div className="mt-4 pt-4 border-t border-white/15">{children}</div>}
            </div>
        );
    };

    return (
        <div className="bg-[#0B1F3A] py-12 sm:py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-[#132D52] border border-[#C9A84C]/35 p-6 sm:p-10 md:p-12 rounded-2xl shadow-2xl">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#DFC06B] hover:text-white transition-colors"
                        >
                            <BackIcon className="w-5 h-5" /> Back to Admissions
                        </button>
                    </div>
                    <div className="text-center mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Nursery – Class X</p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                            <EditableContent id="adm_status_title" defaultContent="Check Admission Status" type="text" user={user} />
                        </h1>
                        <div className="mt-2 text-base text-white/80">
                            <EditableContent id="adm_status_subtitle" defaultContent="Enter your Application Reference ID to see the current status of your application." type="text" user={user} />
                        </div>
                    </div>

                    <form onSubmit={handleCheckStatus} className="mt-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                id="admission-id"
                                type="text"
                                value={admissionId}
                                onChange={e => setAdmissionId(e.target.value)}
                                className="flex-grow min-h-[48px] px-4 rounded-lg bg-[#07162B] border border-white/25 text-white placeholder-white/50 focus:outline-none focus:border-[#C9A84C] text-base font-tabular"
                                placeholder="Enter Application Reference ID"
                                required
                            />
                            <button
                                type="submit"
                                className="min-h-[48px] px-6 rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-sm sm:text-base transition-colors inline-flex items-center justify-center"
                                disabled={isLoading}
                            >
                                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : "Check Status"}
                            </button>
                        </div>
                        {error && (
                            <p className="mt-3 p-3 rounded-lg bg-[#07162B] border border-[#C9A84C]/60 text-[#DFC06B] text-sm text-left font-medium">
                                {error}
                            </p>
                        )}
                    </form>

                    {admissionData && (
                        <div className="animate-fade-in">
                            {admissionData.paymentStatus === 'paid' ? (
                                <StatusCard status="approved" title="Admission Complete!" message={`Your admission process for ${admissionData.studentName} is complete, and payment has been received.`}>
                                    <Link
                                        to={`/admissions/payment/${admissionData.id}`}
                                        state={{ grade: admissionData.admissionGrade, studentName: admissionData.studentName }}
                                        className="w-full min-h-[48px] inline-flex items-center justify-center rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-sm mt-2 transition-colors"
                                    >
                                        View / Download Receipt
                                    </Link>
                                </StatusCard>
                            ) : admissionData.status === 'pending' || admissionData.status === 'reviewed' ? (
                                <StatusCard status={admissionData.status} title="Application Under Review" message="Your application is currently being reviewed by our administration. Please check back later." />
                            ) : admissionData.status === 'approved' ? (
                                <StatusCard status="approved" title="Congratulations! Your Application is Approved." message={`You are now eligible to complete the admission process for ${admissionData.admissionGrade}.`}>
                                    {admissionData.temporaryStudentId ? (
                                        <>
                                            <p className="font-semibold text-white/90 mt-2">Your Temporary Student ID is:</p>
                                            <p className="font-tabular text-lg font-bold text-[#DFC06B] bg-[#07162B] inline-block px-4 py-2 rounded-lg mt-1 border border-[#C9A84C]/50">
                                                {admissionData.temporaryStudentId}
                                            </p>
                                            <p className="text-sm text-white/75 mt-2">Please use this ID for future reference and proceed to the payment page.</p>
                                            <button
                                                onClick={() => navigate(`/admissions/payment/${admissionData.id}`, { state: { grade: admissionData.admissionGrade, studentName: admissionData.studentName } })}
                                                className="w-full min-h-[48px] mt-4 rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-base flex items-center justify-center gap-2 transition-colors"
                                            >
                                                Proceed to Payment <ArrowRightIcon className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-4 text-white/80">
                                            <SpinnerIcon className="w-5 h-5" />
                                            <span>Your Temporary Student ID is being generated. Please refresh in a moment.</span>
                                        </div>
                                    )}
                                </StatusCard>
                            ) : admissionData.status === 'rejected' ? (
                                <StatusCard status="rejected" title="Application Update" message="We regret to inform you that we are unable to offer a place at this time. Please contact the school office for more details." />
                            ) : null}
                        </div>
                    )}
                    <div className="mt-8 pt-5 border-t border-white/15 text-sm">
                        <Link to="/admissions" className="text-[#DFC06B] font-semibold hover:text-white transition-colors">
                            &larr; Back to Admission Guidelines
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionStatusPage;
