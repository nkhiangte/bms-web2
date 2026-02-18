import React, { useState, FormEvent, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FeeStructure, Student, FeePayments, NotificationType, User, FeeSet, AdmissionSettings, FeeHead } from '../../types';
import { FEE_SET_GRADES, academicMonths, TERMINAL_EXAMS } from '../../constants';
import { getFeeDetails, formatStudentId } from '../../utils';
import { SpinnerIcon, SearchIcon, UserIcon, CurrencyDollarIcon, CheckCircleIcon } from '../../components/Icons';
import EditableContent from '../../components/EditableContent';

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
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col border border-slate-200 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-sky-600 font-semibold mb-4 text-xs uppercase tracking-wider">{grades.join(', ')}</p>
        <div className="space-y-2 flex-grow">
            {(fees?.heads || []).map(head => (
                 <div key={head.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <span className="text-slate-700 font-bold text-sm block leading-tight">{head.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{head.type}</span>
                    </div>
                    <span className="font-mono font-bold text-lg text-slate-900">₹{head.amount}</span>
                </div>
            ))}
            {(!fees?.heads || fees.heads.length === 0) && <p className="text-slate-500 italic text-sm">No ongoing fees defined.</p>}
        </div>
    </div>
);

const AdmissionFeeCard: React.FC<{ title: string; oneTime: FeeHead[]; annual: FeeHead[]; colorClass: string }> = ({ title, oneTime, annual, colorClass }) => {
    const totalOneTime = oneTime.reduce((sum, h) => sum + h.amount, 0);
    const totalAnnual = annual.reduce((sum, h) => sum + h.amount, 0);

    return (
        <div className={`bg-white p-6 rounded-2xl border-t-4 ${colorClass} shadow-xl flex flex-col h-full`}>
            <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">{title}</h3>
            
            <div className="space-y-6 flex-grow">
                {/* One Time Charges Section */}
                <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        One-Time Admission & Registration
                    </h4>
                    <div className="space-y-2">
                        {oneTime.map(h => (
                            <div key={h.id} className="flex justify-between text-sm items-center">
                                <span className="text-slate-600 font-medium">{h.name}</span>
                                <span className="font-bold text-slate-900">₹{h.amount}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-800 text-xs italic">
                            <span>One-Time Subtotal</span>
                            <span>₹{totalOneTime}</span>
                        </div>
                    </div>
                </div>

                {/* Annual Periodic Charges Section */}
                <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        Annual / Session Charges
                    </h4>
                    <div className="space-y-2">
                        {annual.map(h => (
                            <div key={h.id} className="flex justify-between text-sm items-center">
                                <span className="text-slate-600 font-medium">{h.name}</span>
                                <span className="font-bold text-slate-900">₹{h.amount}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-800 text-xs italic">
                            <span>Annual Subtotal</span>
                            <span>₹{totalAnnual}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Footer */}
            <div className="mt-8 pt-4 border-t-2 border-slate-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase">Total Admission Cost</span>
                    <span className="text-3xl font-black text-slate-900">₹{totalOneTime + totalAnnual}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic text-center">Excluding books, uniforms, and monthly tuition.</p>
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

    const feeSet = useMemo(() => {
        if (!foundStudent) return null;
        return getFeeDetails(foundStudent.grade, feeStructure);
    }, [foundStudent, feeStructure]);

    const handleFindStudent = (e: FormEvent) => {
        e.preventDefault();
        setFoundStudent(null);
        setSearchError('');
        setSelectedMonths({});
        setSelectedExams({});
        setPayAdmission(false);

        if (!studentIdInput) {
            setSearchError("Please enter a Student ID.");
            return;
        }

        const student = (students || []).find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());
        
        if (student) {
            setFoundStudent(student);
        } else {
            setSearchError("No active student found with that ID. Please check and try again.");
        }
    };

    const currentDuesTotal = useMemo(() => {
        if (!foundStudent || !feeSet) return 0;
        
        let total = 0;
        const heads = feeSet.heads || [];
        
        if (payAdmission) {
            total += heads.filter(h => h.type === 'one-time').reduce((sum, h) => sum + h.amount, 0);
        }

        const monthlyAmount = heads.filter(h => h.type === 'monthly').reduce((sum, h) => sum + h.amount, 0);
        const monthsCount = Object.values(selectedMonths).filter(Boolean).length;
        total += monthlyAmount * monthsCount;

        const termAmount = heads.filter(h => h.type === 'term').reduce((sum, h) => sum + h.amount, 0);
        const termsCount = Object.values(selectedExams).filter(Boolean).length;
        total += termAmount * termsCount;

        return total;
    }, [foundStudent, feeSet, selectedMonths, selectedExams, payAdmission]);

    const displayRazorpay = () => {
        if (!foundStudent || currentDuesTotal <= 0) return;

        setIsProcessingPayment(true);
        
        const razorpayKey = process.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey === 'undefined' || !razorpayKey.startsWith('rzp_')) {
            addNotification('Online payment gateway is not configured correctly. Please contact the school administrator.', 'error', 'Configuration Error');
            setIsProcessingPayment(false);
            return;
        }

        const options = {
            key: razorpayKey,
            amount: currentDuesTotal * 100, 
            currency: "INR",
            name: "Bethel Mission School",
            description: `Fee Payment for ${foundStudent.name}`,
            image: "https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png",
            handler: async (response: any) => {
                const existingPayments: FeePayments = foundStudent.feePayments || {
                    admissionFeePaid: false,
                    tuitionFeesPaid: {},
                    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false }
                };

                const newPayments: FeePayments = JSON.parse(JSON.stringify(existingPayments));

                if (payAdmission) newPayments.admissionFeePaid = true;
                
                Object.keys(selectedMonths).forEach(month => {
                    if (selectedMonths[month]) newPayments.tuitionFeesPaid[month] = true;
                });

                if (selectedExams.terminal1) newPayments.examFeesPaid.terminal1 = true;
                if (selectedExams.terminal2) newPayments.examFeesPaid.terminal2 = true;
                if (selectedExams.terminal3) newPayments.examFeesPaid.terminal3 = true;
                
                try {
                    await onUpdateFeePayments(foundStudent.id, newPayments);
                    addNotification('Payment successful! Your records have been updated.', 'success', 'Payment Received');
                    setFoundStudent(null);
                    setStudentIdInput('');
                } catch (err) {
                     addNotification('Payment was successful but failed to update records. Please contact support.', 'error', 'Update Failed');
                } finally {
                    setIsProcessingPayment(false);
                }
            },
            prefill: {
                name: foundStudent.fatherName,
                contact: foundStudent.contact,
            },
            notes: {
                student_name: foundStudent.name,
                student_id: formatStudentId(foundStudent, academicYear),
            },
            theme: { color: "#0ea5e9" },
            modal: { ondismiss: () => setIsProcessingPayment(false) }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', (response: any) => {
            addNotification(response.error.description, 'error', 'Payment Failed');
            setIsProcessingPayment(false);
        });
        paymentObject.open();
    };

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 1. Page Header */}
                <div className="text-center mb-16 relative">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                         <EditableContent id="fees_title" defaultContent="Fee Structure & Payments" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                         <EditableContent id="fees_subtitle" defaultContent="Transparent fee schedules for admissions and ongoing academic sessions. Manage your school dues securely through our portal." type="text" user={user} />
                    </div>
                </div>

                {/* 2. Admission Fees Breakdown */}
                <div className="mb-24">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <div className="h-0.5 bg-slate-200 flex-grow max-w-[100px]"></div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                            Admission Fees <span className="text-sky-600">{admissionSettings?.academicYearLabel || '2026-27'}</span>
                        </h2>
                        <div className="h-0.5 bg-slate-200 flex-grow max-w-[100px]"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                        <AdmissionFeeCard 
                            title="New Student Admission" 
                            oneTime={admissionSettings?.feeStructure?.newStudent?.oneTime || []} 
                            annual={admissionSettings?.feeStructure?.newStudent?.annual || []} 
                            colorClass="border-sky-500"
                        />
                        <AdmissionFeeCard 
                            title="Existing Student Re-Admission" 
                            oneTime={admissionSettings?.feeStructure?.existingStudent?.oneTime || []} 
                            annual={admissionSettings?.feeStructure?.existingStudent?.annual || []} 
                            colorClass="border-emerald-500"
                        />
                    </div>
                </div>

                {/* 3. Ongoing Academic & Tuition Fees */}
                <div className="mb-24">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <div className="h-0.5 bg-slate-200 flex-grow max-w-[100px]"></div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Academic & Tuition Fees</h2>
                        <div className="h-0.5 bg-slate-200 flex-grow max-w-[100px]"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TuitionFeeCard title="Primary Section" grades={FEE_SET_GRADES.set1} fees={feeStructure?.set1} />
                        <TuitionFeeCard title="Middle School" grades={FEE_SET_GRADES.set2} fees={feeStructure?.set2} />
                        <TuitionFeeCard title="High School" grades={FEE_SET_GRADES.set3} fees={feeStructure?.set3} />
                    </div>
                </div>

                {/* 4. Online Payment Tool */}
                <div id="payment-portal" className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-200 ring-8 ring-slate-100">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
                            <CurrencyDollarIcon className="w-8 h-8 text-sky-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Online Payment Portal</h2>
                        <p className="text-slate-500 mt-2">Pay tuition fees, exam fees, and admission charges instantly.</p>
                    </div>
                    
                    <form onSubmit={handleFindStudent} className="mb-10 max-w-xl mx-auto">
                        <label htmlFor="student-id-input" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Identify Student</label>
                        <div className="flex gap-2 items-start">
                            <div className="flex-grow">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <input 
                                        id="student-id-input" 
                                        type="text" 
                                        placeholder="STUDENT ID (e.g. BMS240101)" 
                                        value={studentIdInput} 
                                        onChange={e => setStudentIdInput(e.target.value.toUpperCase())} 
                                        className="w-full pl-11 form-input h-[56px] text-lg font-mono tracking-tighter bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                                {searchError && <p className="text-rose-600 text-xs mt-2 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> {searchError}</p>}
                            </div>
                            <button type="submit" className="btn btn-primary h-[56px] px-8 text-base shadow-sky-200 shadow-xl">Locate</button>
                        </div>
                    </form>

                    {foundStudent && feeSet && (
                        <div className="mt-8 animate-fade-in space-y-10">
                             {/* Mini Profile */}
                             <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-center gap-8 shadow-inner">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0 overflow-hidden backdrop-blur-md">
                                    {foundStudent.photographUrl ? <img src={foundStudent.photographUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-white/50" />}
                                </div>
                                <div className="text-center md:text-left flex-grow space-y-1">
                                    <h3 className="text-2xl font-black">{foundStudent.name}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                        <span>Grade: <strong className="text-sky-400">{foundStudent.grade}</strong></span>
                                        <span>Roll: <strong className="text-sky-400">{foundStudent.rollNo}</strong></span>
                                        <span>Parent: <strong className="text-sky-400">{foundStudent.fatherName}</strong></span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{formatStudentId(foundStudent, academicYear)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Monthly Tuition */}
                                <div>
                                    <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-5">
                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Tuition Fees</h4>
                                        <div className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-black tracking-widest uppercase">Select Months</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {academicMonths.map(month => {
                                            const isPaid = foundStudent.feePayments?.tuitionFeesPaid?.[month];
                                            return (
                                                <label 
                                                    key={month} 
                                                    className={`
                                                        flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-xs font-bold
                                                        ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                                          selectedMonths[month] ? 'bg-sky-50 border-sky-400 text-sky-900 ring-4 ring-sky-100' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!!selectedMonths[month] || !!isPaid} 
                                                        disabled={!!isPaid}
                                                        onChange={e => setSelectedMonths(prev => ({ ...prev, [month]: e.target.checked }))}
                                                        className="form-checkbox h-4 w-4 text-sky-600 rounded-full border-slate-300"
                                                    />
                                                    <span className="flex-grow">{month}</span>
                                                    {isPaid && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Others */}
                                <div className="space-y-8">
                                    {/* Term Selection */}
                                    <div>
                                        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-5">
                                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Term Fees</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {TERMINAL_EXAMS.map(exam => {
                                                const isPaid = foundStudent.feePayments?.examFeesPaid?.[exam.id as keyof FeePayments['examFeesPaid']];
                                                return (
                                                    <label 
                                                        key={exam.id} 
                                                        className={`
                                                            flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer text-sm font-bold
                                                            ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                                              selectedExams[exam.id] ? 'bg-sky-50 border-sky-400 text-sky-900 ring-4 ring-sky-100' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                        `}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!selectedExams[exam.id] || !!isPaid} 
                                                            disabled={!!isPaid}
                                                            onChange={e => setSelectedExams(prev => ({ ...prev, [exam.id]: e.target.checked }))}
                                                            className="form-checkbox h-5 w-5 text-sky-600 rounded-full border-slate-300"
                                                        />
                                                        <span className="flex-grow">{exam.name}</span>
                                                        {isPaid && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Admission One-time */}
                                    {feeSet.heads.some(h => h.type === 'one-time') && (
                                        <div>
                                            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-5">
                                                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Annual & Admission</h4>
                                            </div>
                                            {(() => {
                                                const isPaid = foundStudent.feePayments?.admissionFeePaid;
                                                return (
                                                    <label 
                                                        className={`
                                                            flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer font-bold
                                                            ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                                              payAdmission ? 'bg-sky-50 border-sky-400 text-sky-900 ring-4 ring-sky-100' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                        `}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={payAdmission || !!isPaid} 
                                                            disabled={!!isPaid}
                                                            onChange={e => setPayAdmission(e.target.checked)}
                                                            className="form-checkbox h-5 w-5 text-sky-600 rounded-full border-slate-300"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">Admission & Misc Session Fees</span>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">All One-Time Heads</span>
                                                        </div>
                                                        {isPaid && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                                                    </label>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="mt-12 pt-10 border-t-2 border-slate-100 flex flex-col md:flex-row items-center gap-8">
                                <div className="text-center md:text-left flex-grow">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable Now</h4>
                                    <p className="text-5xl font-black text-slate-900 tracking-tighter">₹{currentDuesTotal}</p>
                                </div>
                                <button 
                                    onClick={displayRazorpay} 
                                    disabled={isProcessingPayment || currentDuesTotal <= 0}
                                    className="w-full md:w-auto btn btn-primary bg-emerald-600 hover:bg-emerald-700 !py-5 !px-12 !text-2xl shadow-emerald-200 shadow-2xl rounded-2xl transition-all disabled:bg-slate-300 disabled:shadow-none"
                                >
                                    {isProcessingPayment ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : <CurrencyDollarIcon className="w-6 h-6"/>}
                                    <span>{isProcessingPayment ? 'Processing...' : 'Pay Securely'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default FeesPage;