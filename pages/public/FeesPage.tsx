
import React, { useState, FormEvent, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FeeStructure, Student, FeePayments, NotificationType } from '../../types';
import { FEE_SET_GRADES, academicMonths } from '../../constants';
import { getDuesSummary, formatStudentId } from '../../utils';
import { SpinnerIcon } from '../../components/Icons';

const { Link } = ReactRouterDOM as any;

interface FeesPageProps {
    feeStructure: FeeStructure;
    students: Student[];
    academicYear: string;
    onUpdateFeePayments: (studentId: string, payments: FeePayments) => void;
    addNotification: (message: string, type: NotificationType, title?: string) => void;
}

const FeeTable: React.FC<{ title: string; grades: string[]; fees: { admissionFee: number; tuitionFee: number; examFee: number; } }> = ({ title, grades, fees }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
        <p className="text-sky-700 font-semibold mb-4">{grades.join(', ')}</p>
        <div className="space-y-3 flex-grow">
            <div className="flex justify-between items-baseline p-3 bg-slate-50 rounded-md">
                <span className="text-slate-600">Admission Fee</span>
                <span className="font-bold text-lg text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fees.admissionFee)}</span>
            </div>
            <div className="flex justify-between items-baseline p-3 bg-slate-50 rounded-md">
                <span className="text-slate-600">Tuition Fee (Monthly)</span>
                <span className="font-bold text-lg text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fees.tuitionFee)}</span>
            </div>
            <div className="flex justify-between items-baseline p-3 bg-slate-50 rounded-md">
                <span className="text-slate-600">Exam Fee (Per Term)</span>
                <span className="font-bold text-lg text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fees.examFee)}</span>
            </div>
        </div>
    </div>
);

const FeesPage: React.FC<FeesPageProps> = ({ feeStructure, students, academicYear, onUpdateFeePayments, addNotification }) => {
    const [studentIdInput, setStudentIdInput] = useState('');
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [searchError, setSearchError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const duesSummary = useMemo(() => {
        if (!foundStudent) return null;
        return getDuesSummary(foundStudent, feeStructure);
    }, [foundStudent, feeStructure]);

    const handleFindStudent = (e: FormEvent) => {
        e.preventDefault();
        setFoundStudent(null);
        setSearchError('');
        if (!studentIdInput) {
            setSearchError("Please enter a Student ID.");
            return;
        }

        const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());
        
        if (student) {
            setFoundStudent(student);
        } else {
            setSearchError("No active student found with that ID. Please check and try again.");
        }
    };

    const getDefaultPayments = (): FeePayments => ({
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    });

    const displayRazorpay = () => {
        if (!foundStudent || !duesSummary || duesSummary.total <= 0) return;

        setIsProcessingPayment(true);
        
        // FIX: Use process.env as defined in vite.config.ts to access environment variables.
        const razorpayKey = process.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey === 'undefined' || !razorpayKey.startsWith('rzp_')) {
            addNotification('Online payment gateway is not configured correctly. Please contact the school administrator.', 'error', 'Configuration Error');
            setIsProcessingPayment(false);
            return;
        }

        // Capture the state of dues at the moment of payment initiation
        const paymentsBeforeTx = foundStudent.feePayments || getDefaultPayments();
        const duesToPay = {
            admissionFee: !paymentsBeforeTx.admissionFeePaid && duesSummary.items.some(item => item.description === 'Admission Fee'),
            tuitionMonths: academicMonths.filter(month => !paymentsBeforeTx.tuitionFeesPaid?.[month]),
            examFees: {
                terminal1: !paymentsBeforeTx.examFeesPaid?.terminal1 && duesSummary.items.some(item => item.description.includes('Term 1')),
                terminal2: !paymentsBeforeTx.examFeesPaid?.terminal2 && duesSummary.items.some(item => item.description.includes('Term 2')),
                terminal3: !paymentsBeforeTx.examFeesPaid?.terminal3 && duesSummary.items.some(item => item.description.includes('Term 3')),
            }
        };
        
        const options = {
            key: razorpayKey,
            amount: duesSummary.total * 100, // Amount is in currency subunits.
            currency: "INR",
            name: "Bethel Mission School",
            description: `Fee Payment for ${foundStudent.name}`,
            image: "https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png",
            handler: async (response: any) => {
                const newPayments: FeePayments = JSON.parse(JSON.stringify(paymentsBeforeTx));

                // CORRECTED: Only mark the fees as paid that were part of this transaction snapshot.
                if (duesToPay.admissionFee) {
                    newPayments.admissionFeePaid = true;
                }
                duesToPay.tuitionMonths.forEach(month => {
                    if(newPayments.tuitionFeesPaid) newPayments.tuitionFeesPaid[month] = true;
                });
                if (duesToPay.examFees.terminal1) {
                    newPayments.examFeesPaid.terminal1 = true;
                }
                if (duesToPay.examFees.terminal2) {
                    newPayments.examFeesPaid.terminal2 = true;
                }
                if (duesToPay.examFees.terminal3) {
                    newPayments.examFeesPaid.terminal3 = true;
                }
                
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
                name: foundStudent.fatherName, // Prefill with parent's name
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

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response: any){
            addNotification(response.error.description, 'error', 'Payment Failed');
            setIsProcessingPayment(false);
        });
        paymentObject.open();
    };


    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-800">Fee Structure & Online Payment</h1>
                    <p className="mt-4 text-lg text-slate-600">Review the fee structure and pay outstanding dues online.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <FeeTable title="Set 1" grades={FEE_SET_GRADES.set1} fees={feeStructure.set1} />
                    <FeeTable title="Set 2" grades={FEE_SET_GRADES.set2} fees={feeStructure.set2} />
                    <FeeTable title="Set 3" grades={FEE_SET_GRADES.set3} fees={feeStructure.set3} />
                </div>

                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl border">
                    <h2 className="text-3xl font-bold text-slate-800 text-center">Online Fee Payment</h2>
                    <form onSubmit={handleFindStudent} className="my-6">
                        <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID to view dues and pay online</label>
                        <div className="flex gap-2 items-start">
                            <div className="flex-grow">
                                <input id="student-id-input" type="text" placeholder="e.g., BMS240101" value={studentIdInput} onChange={e => setStudentIdInput(e.target.value.toUpperCase())} className="w-full form-input"/>
                                {searchError && <p className="text-red-600 text-sm mt-1">{searchError}</p>}
                            </div>
                            <button type="submit" className="btn btn-primary h-[42px]">Find Dues</button>
                        </div>
                    </form>

                    {foundStudent && duesSummary && (
                        <div className="mt-8 animate-fade-in">
                             <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg">
                                <p className="font-semibold text-slate-600">Showing dues for:</p>
                                <p className="text-xl font-bold text-slate-900">{foundStudent.name}</p>
                                <p className="text-slate-700">{foundStudent.grade} - {formatStudentId(foundStudent, academicYear)}</p>
                            </div>

                            {duesSummary.total > 0 ? (
                                <div className="mt-4">
                                    <h3 className="text-xl font-bold text-slate-800">Pending Dues</h3>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700">
                                        {duesSummary.items.map(item => (
                                            <li key={item.description}>
                                                {item.description}: <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.amount)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <span className="text-lg font-bold">Total Due</span>
                                        <span className="text-2xl font-extrabold text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(duesSummary.total)}</span>
                                    </div>
                                    <button 
                                        onClick={displayRazorpay} 
                                        disabled={isProcessingPayment}
                                        className="mt-6 w-full btn btn-primary bg-emerald-600 hover:bg-emerald-700 !py-3 !text-lg disabled:bg-slate-400"
                                    >
                                        {isProcessingPayment ? <SpinnerIcon className="w-6 h-6"/> : null}
                                        {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 text-center p-6 bg-emerald-50 text-emerald-800 rounded-lg">
                                    <h3 className="font-bold text-lg">All Dues Cleared!</h3>
                                    <p>Thank you for being up to date with your payments.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default FeesPage;
