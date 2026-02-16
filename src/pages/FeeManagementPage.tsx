import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon, SearchIcon, CurrencyDollarIcon, UserIcon, CheckIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon, EditIcon, SaveIcon, TrashIcon, PlusIcon, XIcon } from '../components/Icons';
import { Student, Grade, StudentStatus, FeePayments, User, FeeStructure, FeeSet, NotificationType, FeeHead } from '../types';
import { calculateDues, formatStudentId, getFeeDetails, getDuesSummary } from '../utils';
import { TERMINAL_EXAMS, academicMonths, FEE_SET_GRADES, GRADES_LIST } from '../constants';

const { Link, useLocation } = ReactRouterDOM as any;

interface FeeManagementPageProps {
  students: Student[];
  academicYear: string;
  onUpdateFeePayments: (studentId: string, payments: FeePayments) => void;
  user: User;
  feeStructure: FeeStructure;
  onUpdateFeeStructure: (newStructure: FeeStructure) => Promise<boolean>;
  addNotification: (message: string, type: NotificationType, title?: string) => void;
  schoolConfig: { paymentQRCodeUrl?: string; upiId?: string };
}

const ReadonlyField: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-bold text-slate-800">{label}</label>
        <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 font-semibold min-h-[42px] flex items-center">
            {value || 'N/A'}
        </div>
    </div>
);

const FeeDetailItem: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
    <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
        <span className="font-bold text-slate-800">{label}</span>
        <span className="font-bold text-lg text-emerald-700">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)}
        </span>
    </div>
);

const PaymentInfoModal: React.FC<{ isOpen: boolean, onClose: () => void, qrCodeUrl?: string, upiId?: string, amount: number }> = ({ isOpen, onClose, qrCodeUrl, upiId, amount }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-800">Pay Using UPI</h3>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 mx-auto mt-4 border p-1" />}
                    <p className="font-semibold text-slate-700 mt-4">UPI ID: <span className="font-bold text-sky-700">{upiId || 'Not available'}</span></p>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-2">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</p>
                    <p className="text-xs text-slate-500 mt-4">After payment, please contact the office to confirm and update your records.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
};

const FeeManagementPage: React.FC<FeeManagementPageProps> = ({ students, academicYear, onUpdateFeePayments, user, feeStructure, onUpdateFeeStructure, addNotification, schoolConfig }) => {
  const location = useLocation();
  const [studentIdInput, setStudentIdInput] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState('');
  const [paymentData, setPaymentData] = useState<FeePayments | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingStructure, setIsEditingStructure] = useState(false);
  const [editableStructure, setEditableStructure] = useState<FeeStructure>(feeStructure);
  const [isSavingStructure, setIsSavingStructure] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [addingGradeToSet, setAddingGradeToSet] = useState<string | null>(null); 

  const duesSummary = useMemo(() => {
    if (!foundStudent || !feeStructure) return null;
    return getDuesSummary(foundStudent, feeStructure);
  }, [foundStudent, feeStructure]);

  useEffect(() => {
    if (!isEditingStructure && !isSavingStructure && feeStructure && feeStructure.set1) {
        setEditableStructure(feeStructure);
    }
  }, [feeStructure, isEditingStructure, isSavingStructure]);

  const getDefaultPayments = (): FeePayments => ({
    admissionFeePaid: false,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
  });

  useEffect(() => {
      const stateStudentId = location.state?.studentId;
      if (stateStudentId && students.length > 0) {
          const student = students.find(s => s.id === stateStudentId);
          if (student) {
              setFoundStudent(student);
              setPaymentData(student.feePayments || getDefaultPayments());
          }
      }
  }, [location.state, students]);

  const handleHeadChange = (setKey: 'set1' | 'set2' | 'set3', index: number, field: keyof FeeHead, value: any) => {
    setEditableStructure(prev => {
        const set = prev[setKey] || { heads: [] };
        const newHeads = [...(set.heads || [])];
        newHeads[index] = { ...newHeads[index], [field]: value };
        return {
            ...prev,
            [setKey]: { ...set, heads: newHeads }
        };
    });
  };

  const handleAddHead = (setKey: 'set1' | 'set2' | 'set3') => {
      setEditableStructure(prev => {
          const set = prev[setKey] || { heads: [] };
          return {
            ...prev,
            [setKey]: {
                ...set,
                heads: [...(set.heads || []), { id: `fee-${Date.now()}`, name: 'New Fee', amount: 0, type: 'one-time' }]
            }
          };
      });
  };

  const handleRemoveHead = (setKey: 'set1' | 'set2' | 'set3', index: number) => {
    setEditableStructure(prev => {
        const set = prev[setKey] || { heads: [] };
        const newHeads = (set.heads || []).filter((_, i) => i !== index);
        return {
            ...prev,
            [setKey]: { ...set, heads: newHeads }
        };
    });
  };
  
  const handleRemoveGrade = (gradeToRemove: Grade) => {
      setEditableStructure(prev => {
          const map = { ...(prev.gradeMap || FEE_SET_GRADES) };
          Object.keys(map).forEach(key => {
              map[key] = (map[key] || []).filter(g => g !== gradeToRemove);
          });
          return { ...prev, gradeMap: map };
      });
  };

  const handleAddGradeToSet = (setKey: string, gradeToAdd: Grade) => {
      setEditableStructure(prev => {
          const map = { ...(prev.gradeMap || FEE_SET_GRADES) };
          Object.keys(map).forEach(key => {
              map[key] = (map[key] || []).filter(g => g !== gradeToAdd);
          });
          if (!map[setKey]) map[setKey] = [];
          map[setKey].push(gradeToAdd);
          map[setKey].sort((a, b) => GRADES_LIST.indexOf(a) - GRADES_LIST.indexOf(b));
          return { ...prev, gradeMap: map };
      });
      setAddingGradeToSet(null);
  };

  const handleSaveStructure = async () => {
    setIsSavingStructure(true);
    try {
        const success = await onUpdateFeeStructure(editableStructure);
        if (success) {
            setIsEditingStructure(false);
            addNotification('Fee structure updated successfully!', 'success');
        }
    } catch (e) {
        console.error("handleSaveStructure failed:", e);
        addNotification('Failed to save fee structure. Please try again.', 'error');
    } finally {
        setIsSavingStructure(false);
    }
  };

  const handleCancelEditStructure = () => {
    setEditableStructure(feeStructure);
    setIsEditingStructure(false);
  };

  const handleStudentSearch = () => {
    setFoundStudent(null);
    setSearchError('');
    setPaymentData(null);
    setIsSaved(false);

    if (!studentIdInput) {
        setSearchError('Please enter a Student ID.');
        return;
    }

    const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);
    const student = activeStudents.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

    if (student) {
        setFoundStudent(student);
        setPaymentData(student.feePayments || getDefaultPayments());
    } else {
        setSearchError('Active student with this ID not found. Please check and try again.');
    }
  };
  
  const handleParentChildSelect = (childId: string) => {
      setSearchError('');
      setIsSaved(false);
      const student = students.find(s => s.id === childId);
      if (student) {
          setFoundStudent(student);
          setPaymentData(student.feePayments || getDefaultPayments());
      }
  };

  const handlePaymentChange = (type: 'admission' | 'tuition' | 'exam', key: string, value: boolean) => {
    if (!paymentData) return;
    setIsSaved(false);
    
    setPaymentData(prev => {
        const newData = JSON.parse(JSON.stringify(prev!)); 
        if (type === 'admission') {
            newData.admissionFeePaid = value;
        } else if (type === 'tuition') {
            newData.tuitionFeesPaid[key] = value;
        } else if (type === 'exam') {
            newData.examFeesPaid[key] = value;
        }
        return newData;
    });
  };

  const handleToggleAllTuition = () => {
    if(!paymentData) return;
    const allPaid = academicMonths.every(m => paymentData.tuitionFeesPaid[m]);
    const newTuitionStatus: Record<string, boolean> = {};
    academicMonths.forEach(m => newTuitionStatus[m] = !allPaid);

    setPaymentData(prev => ({ ...prev!, tuitionFeesPaid: newTuitionStatus }));
    setIsSaved(false);
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (foundStudent && paymentData) {
        onUpdateFeePayments(foundStudent.id, paymentData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const feeSet = foundStudent ? getFeeDetails(foundStudent.grade, feeStructure) : null;
  const allTuitionPaid = paymentData ? academicMonths.every(m => paymentData.tuitionFeesPaid[m]) : false;

  const tempStudentForDues: Student | null = foundStudent && paymentData ? { ...foundStudent, feePayments: paymentData } : null;
  const dues = tempStudentForDues ? calculateDues(tempStudentForDues, feeStructure) : [];

  const isReadOnly = user.role !== 'admin';
  const isParent = user.role === 'parent';

  return (
    <div className="space-y-8">
      {user.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fee Structure Management</h2>
                    <p className="text-slate-600">Update fee names, amounts, and types used for calculations.</p>
                </div>
                {!isEditingStructure ? (
                    <button onClick={() => setIsEditingStructure(true)} className="btn btn-secondary flex items-center gap-2">
                        <EditIcon className="w-5 h-5"/> Edit Structure
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleCancelEditStructure} disabled={isSavingStructure} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSaveStructure} disabled={isSavingStructure} className="btn btn-primary flex items-center gap-2">
                            {isSavingStructure ? <SpinnerIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5"/>}
                            {isSavingStructure ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(Object.keys(editableStructure || {}).filter(k => k.startsWith('set')) as Array<'set1' | 'set2' | 'set3'>).map(setKey => {
                    const currentGrades = (editableStructure.gradeMap || FEE_SET_GRADES)[setKey as string] || [];
                    const gradesAvailableToAdd = GRADES_LIST.filter(g => !currentGrades.includes(g));

                    return (
                    <div key={setKey} className={`p-4 rounded-lg border flex flex-col h-full ${isEditingStructure ? 'bg-sky-50 border-sky-300 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 capitalize mb-1">{setKey.replace('set', 'Set ')}</h3>
                                <div className="text-xs text-slate-600 mb-2">
                                    <span className="font-semibold">Applies to:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {currentGrades.map(g => (
                                            <span key={g} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 flex items-center gap-1">
                                                {g}
                                                {isEditingStructure && (
                                                    <button onClick={() => handleRemoveGrade(g)} className="text-red-500 hover:text-red-700">
                                                        <XIcon className="w-3 h-3"/>
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                        {currentGrades.length === 0 && <span className="italic text-slate-400">No grades assigned</span>}
                                    </div>
                                </div>
                                {isEditingStructure && (
                                    <div className="mt-2 relative">
                                        {!addingGradeToSet ? (
                                            <button onClick={() => setAddingGradeToSet(setKey)} className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                                                <PlusIcon className="w-3 h-3"/> Add Grade
                                            </button>
                                        ) : addingGradeToSet === setKey ? (
                                            <select 
                                                className="form-select text-xs w-full" 
                                                autoFocus 
                                                onChange={(e) => {
                                                    if(e.target.value) handleAddGradeToSet(setKey, e.target.value as Grade);
                                                }}
                                                onBlur={() => setAddingGradeToSet(null)}
                                                value=""
                                            >
                                                <option value="">Select Grade...</option>
                                                {gradesAvailableToAdd.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                            {isEditingStructure && (
                                <button onClick={() => handleAddHead(setKey)} className="text-xs btn btn-secondary px-2 py-1 flex items-center gap-1 ml-2">
                                    <PlusIcon className="w-3 h-3"/> Add Fee
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-3 flex-grow border-t pt-3">
                            {(editableStructure[setKey]?.heads || []).map((head, index) => (
                                <div key={head.id} className={`p-2 rounded ${isEditingStructure ? 'bg-white border' : ''}`}>
                                    {isEditingStructure ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={head.name}
                                                onChange={e => handleHeadChange(setKey, index, 'name', e.target.value)}
                                                className="w-full text-sm font-bold border-slate-300 rounded focus:ring-sky-500"
                                                placeholder="Fee Name"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={head.amount}
                                                    onChange={e => handleHeadChange(setKey, index, 'amount', parseInt(e.target.value) || 0)}
                                                    className="w-1/2 text-sm border-slate-300 rounded focus:ring-sky-500"
                                                    placeholder="Amount"
                                                />
                                                <select
                                                    value={head.type}
                                                    onChange={e => handleHeadChange(setKey, index, 'type', e.target.value)}
                                                    className="w-1/2 text-xs border-slate-300 rounded focus:ring-sky-500"
                                                >
                                                    <option value="one-time">One-time</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="term">Term</option>
                                                </select>
                                                <button onClick={() => handleRemoveHead(setKey, index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="block text-xs font-bold text-slate-700">{head.name}</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-wide">{head.type}</span>
                                            </div>
                                            <span className="font-semibold text-slate-800 text-lg">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(head.amount)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(editableStructure[setKey]?.heads || []).length === 0 && <p className="text-sm italic text-slate-500">No fee heads defined.</p>}
                        </div>
                    </div>
                )})}
            </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
            <BackIcon className="w-5 h-5" /> Back
            </button>
            <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
            <HomeIcon className="w-5 h-5" /> <span>Home</span>
            </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Student Fee Payment</h1>
        <p className="text-slate-700 mb-8">View applicable fee structure and update payment status.</p>

        {isParent ? (
             <div className="mb-8 max-w-lg">
                <label htmlFor="child-select" className="block text-sm font-bold text-slate-800 mb-2">Select Child</label>
                <select
                    id="child-select"
                    className="form-select w-full"
                    value={foundStudent?.id || ''}
                    onChange={(e) => handleParentChildSelect(e.target.value)}
                >
                    <option value="" disabled>-- Select a Student --</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                </select>
            </div>
        ) : (
            <div className="mb-8 max-w-lg">
                <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID</label>
                <div className="flex gap-2 items-start">
                    <div className="flex-grow">
                        <input id="student-id-input" type="text" placeholder="e.g., BMS250501" value={studentIdInput} onChange={e => setStudentIdInput(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStudentSearch(); }}} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition" />
                        {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                    </div>
                    <button type="button" onClick={handleStudentSearch} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px] flex items-center justify-center gap-2">
                        <SearchIcon className="w-5 h-5" /> Find
                    </button>
                </div>
            </div>
        )}
        
        {foundStudent && feeSet && paymentData && (
            <form onSubmit={handleSave} className="mt-8 space-y-6 animate-fade-in">
                <fieldset className="border p-4 rounded-lg bg-slate-50">
                    <legend className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2"><UserIcon className="w-5 h-5" /> Student Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <ReadonlyField label="Name" value={foundStudent.name} />
                        <ReadonlyField label="Grade" value={foundStudent.grade} />
                        <ReadonlyField label="Student ID" value={formatStudentId(foundStudent, academicYear)} />
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5" /> Fee Structure Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {(feeSet.heads || []).map(head => (
                            <FeeDetailItem key={head.id} label={head.name} amount={head.amount} />
                        ))}
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                        Dues Summary
                    </legend>
                    <div className="mt-2">
                        {dues.length === 0 ? (
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
                                <CheckCircleIcon className="w-6 h-6" />
                                <span className="font-semibold text-lg">All dues are cleared.</span>
                            </div>
                        ) : (
                            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <XCircleIcon className="w-6 h-6 text-amber-600" />
                                    <span className="font-semibold text-lg">Pending Dues Found</span>
                                </div>
                                <ul className="list-disc pl-10 space-y-1 text-md">
                                    {dues.map((due, index) => <li key={index} className="font-semibold">{due}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </fieldset>

                <fieldset disabled={isReadOnly}>
                    <div className="border p-4 rounded-lg">
                        <legend className="text-lg font-bold text-slate-800 px-2">Payment Status</legend>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 border-b pb-2">One-Time & Term Fees</h4>
                                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                <input type="checkbox" checked={paymentData.admissionFeePaid} onChange={e => handlePaymentChange('admission', 'admissionFeePaid', e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" disabled={isReadOnly} />
                                <span className="text-slate-800 font-semibold">One-Time Fees</span>
                                </label>
                                {TERMINAL_EXAMS.map((exam, i) => (
                                    <label key={exam.id} className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                        <input type="checkbox" checked={paymentData.examFeesPaid[`terminal${i + 1}` as keyof typeof paymentData.examFeesPaid]} onChange={e => handlePaymentChange('exam', `terminal${i + 1}`, e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" disabled={isReadOnly} />
                                        <span className="text-slate-800 font-semibold">{exam.name} Fee Paid</span>
                                    </label>
                                ))}
                            </div>
                            <div>
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h4 className="font-bold text-slate-800">Monthly Tuition Fees</h4>
                                    {!isReadOnly && <button type="button" onClick={handleToggleAllTuition} className="text-xs font-semibold text-sky-600 hover:underline">{allTuitionPaid ? 'Unmark All' : 'Mark All'}</button>}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {academicMonths.map(month => (
                                        <label key={month} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-100">
                                            <input type="checkbox" checked={!!paymentData.tuitionFeesPaid[month]} onChange={e => handlePaymentChange('tuition', month, e.target.checked)} className="form-checkbox h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" disabled={isReadOnly} />
                                            <span className="text-slate-800">{month}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div className="mt-8 flex flex-wrap justify-end items-center gap-4">
                    {isSaved && (
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold animate-fade-in">
                            <CheckIcon className="w-5 h-5" />
                            <span>Saved!</span>
                        </div>
                    )}
                     {duesSummary && duesSummary.total > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setIsQrModalOpen(true)} 
                            className="btn bg-sky-600 text-white hover:bg-sky-700"
                        >
                            <CurrencyDollarIcon className="w-5 h-5" />
                            <span>Show Payment Info</span>
                        </button>
                     )}
                    {!isReadOnly && (
                        <button type="submit" className="btn btn-primary flex items-center gap-2">
                            <CheckIcon className="w-5 h-5"/>
                            Save Payment Status
                        </button>
                    )}
                </div>
            </form>
        )}
      </div>
      {duesSummary && (
        <PaymentInfoModal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
            qrCodeUrl={schoolConfig.paymentQRCodeUrl}
            upiId={schoolConfig.upiId}
            amount={duesSummary.total}
        />
      )}
    </div>
  );
};

export default FeeManagementPage;