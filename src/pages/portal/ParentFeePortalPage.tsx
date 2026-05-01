
import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, FeeStructure, FeePayments, PaymentRecord, NotificationType } from '@/types';
import { 
    BackIcon, 
    HomeIcon, 
    CurrencyDollarIcon, 
    CalendarDaysIcon, 
    HistoryIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    SpinnerIcon,
    ArrowRightIcon,
    CreditCardIcon,
    QrCodeIcon
} from '@/components/Icons';
import { calculateDues, getFeeDetails, getDuesSummary } from '@/utils';
import { academicMonths } from '@/constants';
import { QRCodeSVG } from 'qrcode.react';

const { useParams, Link } = ReactRouterDOM as any;

interface ParentFeePortalPageProps {
    user: User;
    students: Student[];
    feeStructure: FeeStructure;
    paymentRecords: PaymentRecord[];
    schoolConfig: { upiId?: string; schoolName?: string };
}

const ParentFeePortalPage: React.FC<ParentFeePortalPageProps> = ({ user, students, feeStructure, paymentRecords, schoolConfig }) => {
    const { studentId } = useParams() as { studentId: string };
    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
    const [isPaying, setIsPaying] = useState(false);

    const studentPayments = useMemo(() => {
        return paymentRecords.filter(r => r.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
    }, [paymentRecords, studentId]);

    const duesSummary = useMemo(() => {
        if (!student || !feeStructure) return null;
        return getDuesSummary(student, feeStructure);
    }, [student, feeStructure]);

    const fees = useMemo(() => {
        if (!student) return null;
        return getFeeDetails(student.grade, feeStructure);
    }, [student, feeStructure]);

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <SpinnerIcon className="w-12 h-12 mb-4 animate-spin" />
                <p className="text-lg font-semibold">Loading student data...</p>
            </div>
        );
    }

    const upiDeepLink = schoolConfig.upiId 
        ? `upi://pay?pa=${schoolConfig.upiId}&pn=${encodeURIComponent(schoolConfig.schoolName || 'Bethel Mission School')}&am=${duesSummary?.total || 0}&cu=INR&tn=${encodeURIComponent(`Fees for ${student.name} - ${student.studentId}`)}`
        : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header Navigation */}
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <Link to="/portal/parent-dashboard" className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/portal/dashboard" className="text-slate-500 hover:text-slate-700"><HomeIcon className="w-5 h-5"/></Link>
                </div>
            </div>

            {/* Main Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Due Amount Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-sky-500/20 transition-all duration-700"></div>
                    <div className="relative z-10">
                        <p className="text-sky-300 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Outstanding Balance</p>
                        <h2 className="text-5xl font-black text-white mb-6">
                            ₹{(duesSummary?.total || 0).toLocaleString('en-IN')}
                        </h2>
                        
                        <div className="flex flex-wrap gap-4">
                            {!isPaying ? (
                                <button 
                                    onClick={() => setIsPaying(true)}
                                    disabled={duesSummary?.total === 0}
                                    className="px-8 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <CreditCardIcon className="w-5 h-5"/> Pay Online
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsPaying(false)}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl border border-white/20 transition-all"
                                >
                                    Cancel Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* mini status card */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                {duesSummary?.total === 0 ? (
                                    <>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-emerald-700 font-black">FULLY PAID</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                        <span className="text-amber-700 font-black">DUES PENDING</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Next Payment Reminder</p>
                            <p className="text-slate-900 font-black">10th of Next Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* UPI Payment Section (Expandable) */}
            {isPaying && upiDeepLink && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-sky-400/30 animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">Fast UPI Payment</h3>
                            <p className="text-slate-600 font-semibold">
                                Scan the QR code with any UPI app (GPAY, PhonePe, Paytm) to pay the exact outstanding amount.
                            </p>
                            <div className="flex flex-col gap-3">
                                <a 
                                    href={upiDeepLink} 
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold md:hidden"
                                >
                                    <QrCodeIcon className="w-5 h-5"/> Pay via UPI App
                                </a>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
                                        <HistoryIcon className="w-4 h-4"/>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                        After making the payment, please <span className="text-sky-700">upload the screenshot</span> in the dashboard or message the school office for instant confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-inner">
                            <QRCodeSVG 
                                value={upiDeepLink} 
                                size={220} 
                                level="H" 
                                includeMargin={true}
                                imageSettings={{
                                    src: "https://bmschool.in/logo.png", // Attempt to use school logo if available
                                    height: 30,
                                    width: 30,
                                    excavate: true,
                                }}
                            />
                            <p className="mt-4 font-black text-slate-400 text-xs tracking-widest uppercase">Scan to Pay ₹{(duesSummary?.total || 0)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Details and History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Breakdown */}
                <section className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
                        <CalendarDaysIcon className="w-5 h-5 text-indigo-600"/> Fee Status Breakdown
                    </h3>
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month / Fee</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-semibold text-sm">
                                {/* Tuition Fees */}
                                {academicMonths.map(month => (
                                    <tr key={month} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-700">{month} Tuition Fee</td>
                                        <td className="p-4 text-right">
                                            {student.feePayments.tuitionFeesPaid[month] ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-100">
                                                    <CheckCircleIcon className="w-3 h-3"/> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-bold border border-rose-100">
                                                    <XCircleIcon className="w-3 h-3"/> Due
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {/* Admission Fee */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-slate-700">Admission / One-Time Fees</td>
                                    <td className="p-4 text-right">
                                        {student.feePayments.admissionFeePaid ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-100">
                                                <CheckCircleIcon className="w-3 h-3"/> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-bold border border-rose-100">
                                                <XCircleIcon className="w-3 h-3"/> Due
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Payment History */}
                <section className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
                        <HistoryIcon className="w-5 h-5 text-emerald-600"/> Payment History
                    </h3>
                    <div className="space-y-3">
                        {studentPayments.length > 0 ? (
                            studentPayments.map((record) => (
                                <div key={record.id} className="bg-white/70 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-lg flex items-center justify-between group hover:border-emerald-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold shadow-inner">
                                            {record.feeType[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">{record.month || record.feeType}</p>
                                            <p className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                                                {record.paymentMethod} • {record.date} 
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-700 text-lg">₹{record.amount}</p>
                                        <p className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${record.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {record.status.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <HistoryIcon className="w-8 h-8 mb-2 opacity-30"/>
                                <p className="text-sm font-bold">No digital records found</p>
                                <p className="text-[10px] text-center px-4">Contact office if you've paid via cash and don't see it here.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ParentFeePortalPage;
