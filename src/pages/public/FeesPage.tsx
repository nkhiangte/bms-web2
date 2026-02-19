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
            theme: {
                color: "#0ea5e9"
            },
            modal: {
                ondismiss: () => {
                    setIsProcessingPayment(false);
                }
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any){
            addNotification(response.error.description, 'error', 'Payment Failed');
            setIsProcessingPayment(false);
        });
        paymentObject.open();
    };

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 relative">
                    <h1 className="text-4xl font-extrabold text-slate-800">
                         <EditableContent id="fees_title" defaultContent="Fee Structure & Online Payment" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600">
                         <EditableContent id="fees_subtitle" defaultContent="Review the fee structure and pay outstanding dues online." type="text" user={user} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <TuitionFeeCard title="Primary Section" grades={FEE_SET_GRADES.set1} fees={feeStructure?.set1} />
                    <TuitionFeeCard title="Middle School" grades={FEE_SET_GRADES.set2} fees={feeStructure?.set2} />
                    <TuitionFeeCard title="High School" grades={FEE_SET_GRADES.set3} fees={feeStructure?.set3} />
                </div>

                <div id="payment-portal" className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-slate-200">
                    <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Online Fee Payment</h2>
                    <p className="text-center text-slate-600 mb-8">Quick and secure tuition fee collection.</p>
                    
                    <form onSubmit={handleFindStudent} className="mb-10">
                        <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID</label>
                        <div className="flex gap-2 items-start">
                            <div className="flex-grow">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input 
                                        id="student-id-input" 
                                        type="text" 
                                        placeholder="e.g., BMS240101" 
                                        value={studentIdInput} 
                                        onChange={e => setStudentIdInput(e.target.value.toUpperCase())} 
                                        className="w-full pl-10 form-input h-[48px] text-lg font-mono tracking-wider"
                                    />
                                </div>
                                {searchError && <p className="text-red-600 text-sm mt-1 font-medium">{searchError}</p>}
                            </div>
                            <button type="submit" className="btn btn-primary h-[48px] px-8 text-base">Find Record</button>
                        </div>
                    </form>

                    {foundStudent && feeSet && (
                        <div className="mt-8 animate-fade-in space-y-8">
                             {/* Student Profile Info */}
                             <div className="p-5 bg-sky-50 border border-sky-100 rounded-xl flex flex-col md:flex-row items-center gap-6">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border shadow-sm flex-shrink-0 overflow-hidden">
                                    {foundStudent.photographUrl ? <img src={foundStudent.photographUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-slate-300" />}
                                </div>
                                <div className="text-center md:text-left flex-grow">
                                    <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Student Profile</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{foundStudent.name}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 text-sm text-slate-600 mt-1">
                                        <span>Class: <strong>{foundStudent.grade}</strong></span>
                                        <span>Roll No: <strong>{foundStudent.rollNo}</strong></span>
                                        <span>Parent: <strong>{foundStudent.fatherName}</strong></span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-mono">{formatStudentId(foundStudent, academicYear)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Tuition Months Selection */}
                                <div>
                                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                                        <h4 className="font-bold text-slate-800">Select Months to Pay</h4>
                                        <div className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">TUITION</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {academicMonths.map(month => {
                                            const isPaid = foundStudent.feePayments?.tuitionFeesPaid?.[month];
                                            return (
                                                <label 
                                                    key={month} 
                                                    className={`
                                                        flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer text-sm
                                                        ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                                          selectedMonths[month] ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-100' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!!selectedMonths[month] || !!isPaid} 
                                                        disabled={!!isPaid}
                                                        onChange={e => setSelectedMonths(prev => ({ ...prev, [month]: e.target.checked }))}
                                                        className="form-checkbox h-4 w-4 text-sky-600 rounded border-slate-300 disabled:bg-emerald-200"
                                                    />
                                                    <span className="font-medium">{month}</span>
                                                    {isPaid && <CheckCircleIcon className="w-4 h-4 ml-auto text-emerald-500" />}
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Term & Admission Fees */}
                                <div className="space-y-6">
                                    {/* Exam Selection */}
                                    <div>
                                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                                            <h4 className="font-bold text-slate-800">Examination Fees</h4>
                                            <div className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">TERM</div>
                                        </div>
                                        <div className="space-y-2">
                                            {TERMINAL_EXAMS.map(exam => {
                                                const isPaid = foundStudent.feePayments?.examFeesPaid?.[exam.id as keyof FeePayments['examFeesPaid']];
                                                return (
                                                    <label 
                                                        key={exam.id} 
                                                        className={`
                                                            flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                                            ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                                              selectedExams[exam.id] ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-100' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                        `}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!selectedExams[exam.id] || !!isPaid} 
                                                            disabled={!!isPaid}
                                                            onChange={e => setSelectedExams(prev => ({ ...prev, [exam.id]: e.target.checked }))}
                                                            className="form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300"
                                                        />
                                                        <span className="font-bold text-sm">{exam.name}</span>
                                                        {isPaid && <CheckCircleIcon className="w-5 h-5 ml-auto text-emerald-500" />}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* One-time Fee Selection (Admission/Annual etc) */}
                                    {feeSet.heads.some(h => h.type === 'one-time') && (
                                        <div>
                                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                                <h4 className="font-bold text-slate-800">Other One-Time Fees</h4>
                                                <div className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">ANNUAL</div>
                                            </div>
                                            {(() => {
                                                const isPaid = foundStudent.feePayments?.admissionFeePaid;
                                                return (
                                                    <label 
                                                        className={`
                                                            flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                                            ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                                                              payAdmission ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-100' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                        `}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={payAdmission || !!isPaid} 
                                                            disabled={!!isPaid}
                                                            onChange={e => setPayAdmission(e.target.checked)}
                                                            className="form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">Admission & Misc Charges</span>
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Includes all one-time set fees</span>
                                                        </div>
                                                        {isPaid && <CheckCircleIcon className="w-5 h-5 ml-auto text-emerald-500" />}
                                                    </label>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary & Payment Button */}
                            <div className="mt-10 border-t pt-8">
                                {currentDuesTotal > 0 ? (
                                    <div className="max-w-md ml-auto space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                            <span className="text-lg font-bold text-slate-700">Total Payable Amount</span>
                                            <span className="text-3xl font-extrabold text-emerald-700">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(currentDuesTotal)}</span>
                                        </div>
                                        <button 
                                            onClick={displayRazorpay} 
                                            disabled={isProcessingPayment}
                                            className="w-full btn btn-primary bg-emerald-600 hover:bg-emerald-700 !py-4 !text-xl shadow-xl hover:shadow-emerald-200 transition-all disabled:bg-slate-400 disabled:shadow-none"
                                        >
                                            {isProcessingPayment ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : <CurrencyDollarIcon className="w-6 h-6"/>}
                                            <span>{isProcessingPayment ? 'Processing...' : 'Pay Online Now'}</span>
                                        </button>
                                        <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
                                            <CheckCircleIcon className="w-3 h-3"/> Payments processed securely via Razorpay
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                        <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4"/>
                                        <h3 className="text-2xl font-bold text-emerald-900">All Selected Items Clear</h3>
                                        <p className="text-emerald-700 mt-1">Please select the months or terms you wish to pay for.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!foundStudent && (
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t pt-10">
                            <div className="text-slate-600">
                                <h3 className="text-xl font-bold text-slate-800 mb-3">Why pay online?</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500"/> Instant receipt generation</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500"/> Secure transaction via UPI, Cards, Netbanking</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500"/> No need to visit the school counter</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500"/> Automatic record updates</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-xl border flex flex-col items-center">
                                <CurrencyDollarIcon className="w-12 h-12 text-sky-600 mb-4"/>
                                <h4 className="font-bold text-slate-800">Support & Inquiries</h4>
                                <p className="text-center text-sm text-slate-600 mt-1">Having trouble with your student ID or the payment portal?</p>
                                <Link to="/contact" className="mt-4 text-sky-600 font-bold hover:underline">Contact Office &rarr;</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default FeesPage;