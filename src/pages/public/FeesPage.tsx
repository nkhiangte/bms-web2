import React, { useState, FormEvent, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FeeStructure, Student, FeePayments, NotificationType, User, FeeSet, AdmissionSettings, FeeHead } from '@/types';
import { FEE_SET_GRADES, academicMonths, TERMINAL_EXAMS } from '@/constants';
import { getFeeDetails, formatStudentId } from '@/utils';
import { SpinnerIcon, SearchIcon, UserIcon, CurrencyDollarIcon, CheckCircleIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

interface FeesPageProps {
    user: User | null;
    feeStructure: FeeStructure;
    admissionSettings: AdmissionSettings;
    students: Student[];
    academicYear: string;
    onUpdateFeePayments: (studentId: string, payments: FeePayments) => Promise<void>;
    addNotification: (message: string, type: NotificationType, title?: string) => void;
}

const TuitionFeeCard: React.FC<{ title: string; grades: string[]; fees: FeeSet }> = ({ title, grades, fees }) => (
    <div className="bg-[#132D52] border border-[#C9A84C]/30 rounded-xl shadow-md p-6 flex flex-col hover:border-[#C9A84C] transition-all">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-[#DFC06B] font-bold mb-4 text-xs uppercase tracking-wider">{grades.join(', ')}</p>
        <div className="space-y-2 flex-grow">
            {(fees?.heads || []).map(head => (
                <div key={head.id} className="flex justify-between items-center p-3 bg-[#0B1F3A] rounded-lg border border-white/10">
                    <div>
                        <span className="text-white font-bold text-sm block leading-tight">{head.name}</span>
                        <span className="text-[10px] text-white/60 uppercase font-bold">{head.type}</span>
                    </div>
                    <span className="font-tabular font-bold text-lg text-[#DFC06B]">&#8377;{head.amount}</span>
                </div>
            ))}
            {(!fees?.heads || fees.heads.length === 0) && <p className="text-white/55 italic text-sm">No ongoing fees defined.</p>}
        </div>
    </div>
);

const AdmissionFeeCard: React.FC<{ title: string; oneTime: FeeHead[]; annual: FeeHead[]; highlight?: boolean }> = ({ title, oneTime, annual, highlight = false }) => {
    const totalOneTime = oneTime.reduce((sum, h) => sum + h.amount, 0);
    const totalAnnual = annual.reduce((sum, h) => sum + h.amount, 0);
    return (
        <div className={`bg-[#132D52] p-6 rounded-2xl border-t-4 ${highlight ? 'border-t-white' : 'border-t-[#C9A84C]'} border-x border-b border-white/15 shadow-xl flex flex-col h-full`}>
            <h3 className="text-2xl font-extrabold text-white mb-6 text-center">{title}</h3>
            <div className="space-y-6 flex-grow">
                <div>
                    <h4 className="text-[11px] font-bold text-[#DFC06B] uppercase tracking-widest mb-3">One-Time Admission &amp; Registration</h4>
                    <div className="space-y-2">
                        {oneTime.map(h => (
                            <div key={h.id} className="flex justify-between text-sm items-center">
                                <span className="text-white/80 font-medium">{h.name}</span>
                                <span className="font-tabular font-bold text-white">&#8377;{h.amount}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-white/15 font-bold text-white/75 text-xs">
                            <span>One-Time Subtotal</span><span className="font-tabular">&#8377;{totalOneTime}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-[#DFC06B] uppercase tracking-widest mb-3">Annual / Session Charges</h4>
                    <div className="space-y-2">
                        {annual.map(h => (
                            <div key={h.id} className="flex justify-between text-sm items-center">
                                <span className="text-white/80 font-medium">{h.name}</span>
                                <span className="font-tabular font-bold text-white">&#8377;{h.amount}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-white/15 font-bold text-white/75 text-xs">
                            <span>Annual Subtotal</span><span className="font-tabular">&#8377;{totalAnnual}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/75 uppercase tracking-wider">Total Admission Cost</span>
                    <span className="font-tabular text-3xl font-extrabold text-[#DFC06B]">&#8377;{totalOneTime + totalAnnual}</span>
                </div>
                <p className="text-[11px] text-white/60 mt-2 italic text-center">Excluding books, uniforms, and monthly tuition.</p>
            </div>
        </div>
    );
};

const FeesPage: React.FC<FeesPageProps> = ({ user, feeStructure, admissionSettings, students, academicYear, onUpdateFeePayments, addNotification }) => {
    const [studentIdInput, setStudentIdInput] = useState('');
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [searchError, setSearchError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState<Record<string, boolean>>({});
    const [selectedExams, setSelectedExams] = useState<Record<string, boolean>>({});
    const [payAdmission, setPayAdmission] = useState(false);

    const feeSet = useMemo(() => { if (!foundStudent) return null; return getFeeDetails(foundStudent.grade, feeStructure); }, [foundStudent, feeStructure]);

    const handleFindStudent = (e: FormEvent) => {
        e.preventDefault();
        setFoundStudent(null); setSearchError(''); setSelectedMonths({}); setSelectedExams({}); setPayAdmission(false);
        if (!studentIdInput) { setSearchError("Please enter a Student ID."); return; }
        const student = (students || []).find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());
        if (student) { setFoundStudent(student); } else { setSearchError("No active student found with that ID. Please check and try again."); }
    };

    const currentDuesTotal = useMemo(() => {
        if (!foundStudent || !feeSet) return 0;
        let total = 0;
        const heads = feeSet.heads || [];
        if (payAdmission) total += heads.filter(h => h.type === 'one-time').reduce((sum, h) => sum + h.amount, 0);
        const monthlyAmount = heads.filter(h => h.type === 'monthly').reduce((sum, h) => sum + h.amount, 0);
        total += monthlyAmount * Object.values(selectedMonths).filter(Boolean).length;
        const termAmount = heads.filter(h => h.type === 'term').reduce((sum, h) => sum + h.amount, 0);
        total += termAmount * Object.values(selectedExams).filter(Boolean).length;
        return total;
    }, [foundStudent, feeSet, selectedMonths, selectedExams, payAdmission]);

    const displayRazorpay = () => {
        if (!foundStudent || currentDuesTotal <= 0) return;
        setIsProcessingPayment(true);
        const razorpayKey = process.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey === 'undefined' || !razorpayKey.startsWith('rzp_')) {
            addNotification('Online payment gateway is not configured correctly. Please contact the school administrator.', 'error', 'Configuration Error');
            setIsProcessingPayment(false); return;
        }
        const options = {
            key: razorpayKey, amount: currentDuesTotal * 100, currency: "INR",
            name: "Bethel Mission School", description: `Fee Payment for ${foundStudent.name}`,
            image: "/assets/school/bms-logo-color.png",
            handler: async () => {
                const existingPayments: FeePayments = foundStudent.feePayments || { admissionFeePaid: false, tuitionFeesPaid: {}, examFeesPaid: { terminal1: false, terminal2: false, terminal3: false } };
                const newPayments: FeePayments = JSON.parse(JSON.stringify(existingPayments));
                if (payAdmission) newPayments.admissionFeePaid = true;
                Object.keys(selectedMonths).forEach(month => { if (selectedMonths[month]) newPayments.tuitionFeesPaid[month] = true; });
                if (selectedExams.terminal1) newPayments.examFeesPaid.terminal1 = true;
                if (selectedExams.terminal2) newPayments.examFeesPaid.terminal2 = true;
                if (selectedExams.terminal3) newPayments.examFeesPaid.terminal3 = true;
                try {
                    await onUpdateFeePayments(foundStudent.id, newPayments);
                    addNotification('Payment successful! Your records have been updated.', 'success', 'Payment Received');
                    setFoundStudent(null); setStudentIdInput('');
                } catch (err) { addNotification('Payment was successful but failed to update records.', 'error', 'Update Failed'); }
                finally { setIsProcessingPayment(false); }
            },
            prefill: { name: foundStudent.fatherName, contact: foundStudent.contact },
            theme: { color: "#0B1F3A" },
            modal: { ondismiss: () => setIsProcessingPayment(false) }
        };
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', (response: any) => { addNotification(response.error.description, 'error', 'Payment Failed'); setIsProcessingPayment(false); });
        paymentObject.open();
    };

    return (
        <div className="bg-[#0B1F3A] py-12 sm:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Nursery to Class X &middot; Champhai</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                        <EditableContent id="fees_title" defaultContent="Fee Structure & Online Payment" type="text" user={user} />
                    </h1>
                    <div className="mt-3 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
                        <EditableContent id="fees_subtitle" defaultContent="Review the fee structure and pay outstanding dues online." type="text" user={user} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 max-w-5xl mx-auto">
                    <AdmissionFeeCard
                        title="New Student Admission"
                        oneTime={admissionSettings?.feeStructure?.newStudent?.oneTime || []}
                        annual={admissionSettings?.feeStructure?.newStudent?.annual || []}
                    />
                    <AdmissionFeeCard
                        title="Existing Student Re-Admission"
                        oneTime={admissionSettings?.feeStructure?.existingStudent?.oneTime || []}
                        annual={admissionSettings?.feeStructure?.existingStudent?.annual || []}
                        highlight
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 max-w-6xl mx-auto">
                    <TuitionFeeCard title="Primary Section" grades={FEE_SET_GRADES.set1} fees={feeStructure?.set1} />
                    <TuitionFeeCard title="Middle School" grades={FEE_SET_GRADES.set2} fees={feeStructure?.set2} />
                    <TuitionFeeCard title="High School" grades={FEE_SET_GRADES.set3} fees={feeStructure?.set3} />
                </div>

                <div id="payment-portal" className="max-w-4xl mx-auto bg-[#132D52] border border-[#C9A84C]/35 p-6 md:p-10 rounded-2xl shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2">Online Fee Payment</h2>
                    <p className="text-center text-white/75 mb-8 text-sm sm:text-base">Quick and secure tuition fee collection.</p>

                    <form onSubmit={handleFindStudent} className="mb-10">
                        <label htmlFor="student-id-input" className="block text-sm font-bold text-[#DFC06B] mb-2">Enter Student ID</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                            <div className="flex-grow">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-white/50" /></div>
                                    <input
                                        id="student-id-input"
                                        type="text"
                                        placeholder="e.g., BMS260101"
                                        value={studentIdInput}
                                        onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                                        className="w-full pl-10 h-[48px] text-lg font-tabular tracking-wider bg-[#07162B] border border-white/25 rounded-lg text-white placeholder-white/45 focus:outline-none focus:border-[#C9A84C]"
                                    />
                                </div>
                                {searchError && <p className="text-[#DFC06B] text-sm mt-2 font-semibold">{searchError}</p>}
                            </div>
                            <button type="submit" className="min-h-[48px] px-8 rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-base transition-colors">
                                Find Record
                            </button>
                        </div>
                    </form>

                    {foundStudent && feeSet && (
                        <div className="mt-8 animate-fade-in space-y-8">
                            <div className="p-5 bg-[#07162B] border border-[#C9A84C]/40 rounded-xl flex flex-col md:flex-row items-center gap-6">
                                <div className="w-20 h-20 bg-[#132D52] rounded-full flex items-center justify-center border border-[#C9A84C]/50 shadow-sm flex-shrink-0 overflow-hidden">
                                    {foundStudent.photographUrl ? <img src={foundStudent.photographUrl} alt={foundStudent.name} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-white/60" />}
                                </div>
                                <div className="text-center md:text-left flex-grow">
                                    <p className="text-xs font-bold text-[#DFC06B] uppercase tracking-widest">Student Profile</p>
                                    <h3 className="text-2xl font-bold text-white">{foundStudent.name}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 text-sm text-white/75 mt-1">
                                        <span>Class: <strong className="text-white">{foundStudent.grade}</strong></span>
                                        <span>Roll No: <strong className="text-white">{foundStudent.rollNo}</strong></span>
                                        <span>Parent: <strong className="text-white">{foundStudent.fatherName}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex justify-between items-center border-b border-white/15 pb-2 mb-4">
                                        <h4 className="font-bold text-white">Select Months to Pay</h4>
                                        <div className="text-xs bg-[#07162B] text-[#DFC06B] px-2.5 py-0.5 rounded-full font-bold border border-[#C9A84C]/40">TUITION</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {academicMonths.map(month => {
                                            const isPaid = foundStudent.feePayments?.tuitionFeesPaid?.[month];
                                            return (
                                                <label
                                                    key={month}
                                                    className={`flex items-center gap-2 p-2.5 min-h-[44px] rounded-lg border transition-all cursor-pointer text-sm ${
                                                        isPaid
                                                            ? 'bg-[#07162B] border-[#C9A84C] text-[#DFC06B]'
                                                            : selectedMonths[month]
                                                            ? 'bg-white text-[#0B1F3A] border-[#C9A84C] font-bold'
                                                            : 'bg-[#0B1F3A] border-white/15 text-white hover:border-[#C9A84C]/60'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedMonths[month] || !!isPaid}
                                                        disabled={!!isPaid}
                                                        onChange={e => setSelectedMonths(prev => ({ ...prev, [month]: e.target.checked }))}
                                                        className="form-checkbox h-4 w-4 text-[#C9A84C] rounded border-white/30"
                                                    />
                                                    <span className="font-medium">{month}</span>
                                                    {isPaid && <CheckCircleIcon className="w-4 h-4 ml-auto text-[#DFC06B]" />}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center border-b border-white/15 pb-2 mb-4">
                                            <h4 className="font-bold text-white">Examination Fees</h4>
                                            <div className="text-xs bg-[#07162B] text-[#DFC06B] px-2.5 py-0.5 rounded-full font-bold border border-[#C9A84C]/40">TERM</div>
                                        </div>
                                        <div className="space-y-2">
                                            {TERMINAL_EXAMS.map(exam => {
                                                const isPaid = foundStudent.feePayments?.examFeesPaid?.[exam.id as keyof FeePayments['examFeesPaid']];
                                                return (
                                                    <label
                                                        key={exam.id}
                                                        className={`flex items-center gap-3 p-3 min-h-[48px] rounded-lg border transition-all cursor-pointer ${
                                                            isPaid
                                                                ? 'bg-[#07162B] border-[#C9A84C] text-[#DFC06B]'
                                                                : selectedExams[exam.id]
                                                                ? 'bg-white text-[#0B1F3A] border-[#C9A84C]'
                                                                : 'bg-[#0B1F3A] border-white/15 text-white hover:border-[#C9A84C]/60'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedExams[exam.id] || !!isPaid}
                                                            disabled={!!isPaid}
                                                            onChange={e => setSelectedExams(prev => ({ ...prev, [exam.id]: e.target.checked }))}
                                                            className="form-checkbox h-5 w-5 text-[#C9A84C] rounded border-white/30"
                                                        />
                                                        <span className="font-bold text-sm">{exam.name}</span>
                                                        {isPaid && <CheckCircleIcon className="w-5 h-5 ml-auto text-[#DFC06B]" />}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {feeSet.heads.some(h => h.type === 'one-time') && (
                                        <div>
                                            <div className="flex justify-between items-center border-b border-white/15 pb-2 mb-4">
                                                <h4 className="font-bold text-white">Other One-Time Fees</h4>
                                                <div className="text-xs bg-[#07162B] text-[#DFC06B] px-2.5 py-0.5 rounded-full font-bold border border-[#C9A84C]/40">ANNUAL</div>
                                            </div>
                                            {(() => {
                                                const isPaid = foundStudent.feePayments?.admissionFeePaid;
                                                return (
                                                    <label
                                                        className={`flex items-center gap-3 p-3 min-h-[48px] rounded-lg border transition-all cursor-pointer ${
                                                            isPaid
                                                                ? 'bg-[#07162B] border-[#C9A84C] text-[#DFC06B]'
                                                                : payAdmission
                                                                ? 'bg-white text-[#0B1F3A] border-[#C9A84C]'
                                                                : 'bg-[#0B1F3A] border-white/15 text-white hover:border-[#C9A84C]/60'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={payAdmission || !!isPaid}
                                                            disabled={!!isPaid}
                                                            onChange={e => setPayAdmission(e.target.checked)}
                                                            className="form-checkbox h-5 w-5 text-[#C9A84C] rounded border-white/30"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">Admission &amp; Misc Charges</span>
                                                            <span className="text-[10px] opacity-70 uppercase tracking-wide">Includes all one-time set fees</span>
                                                        </div>
                                                        {isPaid && <CheckCircleIcon className="w-5 h-5 ml-auto text-[#DFC06B]" />}
                                                    </label>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 border-t border-white/15 pt-8">
                                {currentDuesTotal > 0 ? (
                                    <div className="max-w-md ml-auto space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-[#07162B] border border-[#C9A84C]/40 rounded-xl">
                                            <span className="text-lg font-bold text-white">Total Payable Amount</span>
                                            <span className="font-tabular text-3xl font-extrabold text-[#DFC06B]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(currentDuesTotal)}</span>
                                        </div>
                                        <button
                                            onClick={displayRazorpay}
                                            disabled={isProcessingPayment}
                                            className="w-full min-h-[52px] rounded-xl bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-lg shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isProcessingPayment ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <CurrencyDollarIcon className="w-6 h-6" />}
                                            <span>{isProcessingPayment ? 'Processing...' : 'Pay Online Now'}</span>
                                        </button>
                                        <p className="text-center text-xs text-white/65 mt-2 flex items-center justify-center gap-1">
                                            <CheckCircleIcon className="w-3.5 h-3.5 text-[#DFC06B]" /> Payments processed securely via Razorpay
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-[#07162B] border border-[#C9A84C]/35 rounded-2xl">
                                        <CheckCircleIcon className="w-16 h-16 text-[#DFC06B] mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-white">All Selected Items Clear</h3>
                                        <p className="text-white/75 mt-1">Please select the months or terms you wish to pay for.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!foundStudent && (
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/15 pt-10">
                            <div className="text-white/80">
                                <h3 className="text-xl font-bold text-white mb-3">Why pay online?</h3>
                                <ul className="space-y-2.5 text-sm sm:text-base">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-[#DFC06B] flex-shrink-0" /> Instant receipt generation</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-[#DFC06B] flex-shrink-0" /> Secure transaction via UPI, Cards, Netbanking</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-[#DFC06B] flex-shrink-0" /> No need to visit the school counter</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-[#DFC06B] flex-shrink-0" /> Automatic record updates</li>
                                </ul>
                            </div>
                            <div className="bg-[#07162B] border border-[#C9A84C]/35 p-6 rounded-xl flex flex-col items-center">
                                <CurrencyDollarIcon className="w-12 h-12 text-[#DFC06B] mb-4" />
                                <h4 className="font-bold text-white">Support &amp; Inquiries</h4>
                                <p className="text-center text-sm text-white/75 mt-1">Having trouble with your student ID or the payment portal?</p>
                                <Link to="/contact" className="mt-4 inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg bg-[#C9A84C] text-[#0B1F3A] font-bold text-sm hover:bg-[#DFC06B] transition-colors">
                                    Contact Office &rarr;
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default FeesPage;
