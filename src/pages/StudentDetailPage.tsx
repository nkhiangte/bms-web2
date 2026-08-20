
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, Grade, FeeStructure, ConductEntry, ConductEntryType, HostelDisciplineEntry, StudentStatus } from '@/types';
import { BackIcon, EditIcon, UserIcon, DocumentReportIcon, HomeIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, MessageIcon, WhatsappIcon, PlusIcon, SpinnerIcon, CheckIcon, TrashIcon, ChevronDownIcon, CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon } from '@/components/Icons';
import { formatStudentId, calculateDues, formatDateForDisplay, formatPhoneNumberForWhatsApp, getFeeDetails } from '@/utils';
import { MERIT_CATEGORIES, DEMERIT_CATEGORIES, TERMINAL_EXAMS, academicMonths } from '@/constants';
import ConfirmationModal from '@/components/ConfirmationModal';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import StudentFormModal from '@/components/StudentFormModal';
import TransferStudentModal from '@/components/TransferStudentModal';

const { Link, useNavigate, useParams } = ReactRouterDOM as any;

interface StudentDetailPageProps {
  students: Student[];
  onEdit: (student: Student) => Promise<void>;
  onTransferStudent: (studentId: string, newGrade: Grade) => Promise<void>; // Add this
  onDelete: (studentId: string) => Promise<void>;
  onReinstate?: (student: Student) => Promise<void>;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
  feeStructure: FeeStructure;
  conductLog: ConductEntry[];
  hostelDisciplineLog: HostelDisciplineEntry[];
  onAddConductEntry: (entry: Omit<ConductEntry, 'id'>) => Promise<boolean>;
  onDeleteConductEntry: (entryId: string) => Promise<void>;
}

const DetailItem: React.FC<{label: string, value?: string | number, className?: string}> = ({ label, value, className }) => {
    if (!value && value !== 0) return null;
    return (
         <div className={`bg-slate-50/90 px-2.5 py-1.5 rounded-md border border-slate-200 flex flex-col justify-center ${className || ''}`}>
            <dt className="text-[11px] font-medium text-slate-500 leading-tight">{label}</dt>
            <dd className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 leading-snug break-words">{value}</dd>
        </div>
    )
}

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children}) => (
    <div className="mb-3.5">
        <h2 className="text-sm sm:text-base font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">{title}</h2>
        <div className="w-full">
            {children}
        </div>
    </div>
)


const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ students, onEdit, onTransferStudent, onDelete, onReinstate, academicYear, user, assignedGrade, feeStructure, conductLog, hostelDisciplineLog, onAddConductEntry, onDeleteConductEntry }) => {
  const { studentId } = useParams() as { studentId: string };
  const navigate = useNavigate();
  
  const student = students.find(s => s.id === studentId);

  // Access Control
  const isOwner = user.role === 'parent' && user.studentIds?.includes(studentId || '');
  const isStaff = ['admin', 'user', 'warden'].includes(user.role);
  const canView = isStaff || isOwner;

  const [isAddingConduct, setIsAddingConduct] = useState(false);
  const [newEntryType, setNewEntryType] = useState<ConductEntryType>(ConductEntryType.MERIT);
  const [newEntryCategory, setNewEntryCategory] = useState(MERIT_CATEGORIES[0]);
  const [newEntryDescription, setNewEntryDescription] = useState('');
  const [isSavingConduct, setIsSavingConduct] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ConductEntry | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  
  const canEdit = ['admin', 'user'].includes(user.role);
  const isAdmin = user.role === 'admin';

  const studentConductLog = useMemo(() => {
    if (!student) return [];
    return conductLog.filter(entry => entry.studentId === student.id);
  }, [conductLog, student]);

  const studentHostelLog = useMemo(() => {
    if (!student) return [];
    return hostelDisciplineLog.filter(entry => entry.studentId === student.id);
  }, [hostelDisciplineLog, student]);


  const merits = useMemo(() => studentConductLog.filter(e => e.type === ConductEntryType.MERIT), [studentConductLog]);
  const demerits = useMemo(() => studentConductLog.filter(e => e.type === ConductEntryType.DEMERIT), [studentConductLog]);

  const handleAddEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newEntryCategory || !newEntryDescription) {
        alert("Please select a category and add a description.");
        return;
    }
    setIsSavingConduct(true);
    await onAddConductEntry({
        studentId: student.id,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        type: newEntryType,
        category: newEntryCategory,
        description: newEntryDescription,
        recordedBy: user.displayName || user.email || 'Unknown',
        recordedById: user.uid,
    });
    setIsSavingConduct(false);
    setIsAddingConduct(false);
    setNewEntryDescription('');
    setNewEntryCategory(newEntryType === ConductEntryType.MERIT ? MERIT_CATEGORIES[0] : DEMERIT_CATEGORIES[0]);
  };

  const handleConfirmDeleteEntry = () => {
      if (entryToDelete) {
          onDeleteConductEntry(entryToDelete.id);
      }
      setEntryToDelete(null);
  };

  const handleConfirmDeleteStudent = async () => {
    if (student && onDelete) {
      await onDelete(student.id);
      navigate('/portal/students');
    }
    setIsDeletingStudent(false);
  };

  const handleTransferSubmit = async (newGrade: Grade) => {
      if (!student) return;
      setIsTransferring(true);
      try {
          await onTransferStudent(student.id, newGrade);
          setIsTransferModalOpen(false);
      } catch (error) {
          console.error("Error transferring student:", error);
          alert("Failed to transfer student. Please try again.");
      } finally {
          setIsTransferring(false);
      }
  };

  const handleEditSubmit = async (data: Omit<Student, 'id'>) => {
    if (!student) return;
    setIsSaving(true);
    try {
      await onEdit({ ...data, id: student.id } as Student);
      setIsEditModalOpen(false);
    } catch (error) {
        console.error("Error updating student:", error);
        alert("Failed to update student profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReinstate = async () => {
    if (student && onReinstate) {
        if (window.confirm(`Are you sure you want to reinstate ${student.name}?`)) {
            await onReinstate(student);
        }
    }
  };


  if (!student) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
            <p className="text-slate-700 mt-2">The requested student profile does not exist.</p>
            <button
                onClick={() => navigate('/portal/dashboard')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to Dashboard
            </button>
        </div>
    );
  }

  if (!canView) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-slate-700 mt-2">You do not have permission to view this student's profile.</p>
            <button
                onClick={() => navigate(user.role === 'parent' ? '/portal/parent-dashboard' : '/portal/dashboard')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to Dashboard
            </button>
        </div>
    );
  }
  
  const formattedStudentId = formatStudentId(student, academicYear);
  const dues = calculateDues(student, feeStructure);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'Major': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Minor':
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <>
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6">
        <div className="mb-3 flex justify-between items-center">
             <button
                onClick={() => window.history.back()}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-4 h-4" />
                Back
            </button>
             <Link
                to="/portal/dashboard"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                title="Go to Home/Dashboard"
            >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
            </Link>
        </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start pb-4 mb-4 border-b border-slate-200">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-md border-2 border-white flex-shrink-0 mx-auto sm:mx-0 overflow-hidden">
            <PhotoWithFallback src={student.photographUrl} alt={`${student.name}'s photograph`} />
        </div>
        <div className="text-center sm:text-left flex-grow w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-0.5 justify-center sm:justify-start">
             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{student.name}</h1>
             {student.status !== StudentStatus.ACTIVE && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider self-center">
                    {student.status}
                </span>
             )}
          </div>
          <p className="text-slate-600 text-sm mt-0.5">{student.grade} - ID: <span className="font-semibold text-slate-800">{formattedStudentId}</span></p>
           <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
             {student.status === StudentStatus.DROPPED && isAdmin && onReinstate && (
                <button
                    onClick={handleReinstate}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-emerald-600 text-white font-medium rounded-lg shadow-sm hover:bg-emerald-700 transition"
                >
                    <CheckCircleIcon className="h-4 w-4" />
                    Reinstate Student
                </button>
             )}
             {canEdit && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-sky-600 text-white font-medium rounded-lg shadow-sm hover:bg-sky-700 transition"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit Profile
                </button>
             )}
             {canEdit && (
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-amber-600 text-white font-medium rounded-lg shadow-sm hover:bg-amber-700 transition"
                >
                  <EditIcon className="h-4 w-4" />
                  Transfer Class
                </button>
             )}
             {isAdmin && (
                <button
                  onClick={() => setIsDeletingStudent(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-rose-600 text-white font-medium rounded-lg shadow-sm hover:bg-rose-700 transition"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
             )}
            <Link
                to={`/portal/student/${student.id}/academics`}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition"
            >
                <DocumentReportIcon className="h-4 w-4" />
                Academics
            </Link>
            <Link
                to={`/portal/student/${student.id}/attendance-log`}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-teal-600 text-white font-medium rounded-lg shadow-sm hover:bg-teal-700 transition"
            >
                <CalendarDaysIcon className="h-4 w-4" />
                Attendance Log
            </Link>
             <div className="relative">
                <button
                    onClick={() => setIsReportDropdownOpen(prev => !prev)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-teal-600 text-white font-medium rounded-lg shadow-sm hover:bg-teal-700 transition"
                >
                    <DocumentReportIcon className="h-4 w-4" />
                    <span>Progress Report</span>
                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isReportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isReportDropdownOpen && (
                    <div className="absolute top-full mt-1.5 right-0 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10" onMouseLeave={() => setIsReportDropdownOpen(false)}>
                        <div className="py-1">
                            {TERMINAL_EXAMS.map(exam => (
                                <Link
                                    key={exam.id}
                                    to={`/portal/progress-report/${student.id}/${exam.id}`}
                                    target="_blank"
                                    className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                                    onClick={() => setIsReportDropdownOpen(false)}
                                >
                                    {exam.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
           </div>
        </div>
      </div>
      
      <div className="space-y-3.5">
            <DetailSection title="Personal Information">
                <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                    <DetailItem label="Student ID" value={formattedStudentId} />
                    <DetailItem label="Permanent Education Number (PEN)" value={student.pen} />
                    <DetailItem label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Aadhaar Number" value={student.aadhaarNumber} />
                    <div className="bg-slate-50/90 px-2.5 py-1.5 rounded-md border border-slate-200 flex flex-col justify-center">
                        <dt className="text-[11px] font-medium text-slate-500 leading-tight">Contact Number</dt>
                        <dd className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 leading-snug flex justify-between items-center">
                            <span>{student.contact || 'N/A'}</span>
                            {student.contact && (
                                <div className="flex items-center gap-1">
                                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(student.contact)}`} target="_blank" rel="noopener noreferrer" className="p-0.5 text-emerald-600 hover:text-emerald-700 transition-colors" title="Send WhatsApp Message">
                                        <WhatsappIcon className="w-3.5 h-3.5"/>
                                    </a>
                                    <a href={`sms:${student.contact}`} className="p-0.5 text-sky-600 hover:text-sky-700 transition-colors" title="Send SMS">
                                        <MessageIcon className="w-3.5 h-3.5"/>
                                    </a>
                                </div>
                            )}
                        </dd>
                    </div>
                    <DetailItem label="Blood Group" value={student.bloodGroup} />
                    <DetailItem label="CWSN" value={student.cwsn} />
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <DetailItem label="Address" value={student.address} />
                    </div>
                </dl>
            </DetailSection>

            <DetailSection title="Parent & Guardian Information">
                <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                    <DetailItem label="Father's Name" value={student.fatherName} />
                    <DetailItem label="Father's Occupation" value={student.fatherOccupation} />
                    <DetailItem label="Father's Aadhaar" value={student.fatherAadhaar} />
                    <DetailItem label="Mother's Name" value={student.motherName} />
                    <DetailItem label="Mother's Occupation" value={student.motherOccupation} />
                    <DetailItem label="Mother's Aadhaar" value={student.motherAadhaar} />
                    <DetailItem label="Guardian's Name" value={student.guardianName} />
                    <DetailItem label="Relationship with Guardian" value={student.guardianRelationship} />
                </dl>
            </DetailSection>

            {/* Fee Payment Status Section */}
            <DetailSection title="Fee Payment Status">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Payment Progress Summary */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="bg-slate-50 border rounded-xl p-3.5">
                            <h3 className="font-bold text-slate-800 mb-2.5 text-xs sm:text-sm flex items-center gap-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-emerald-600"/>
                                Monthly Tuition Fees ({academicYear})
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                                {academicMonths.map(month => {
                                    const isPaid = student.feePayments?.tuitionFeesPaid?.[month];
                                    return (
                                        <div 
                                            key={month} 
                                            className={`p-1 rounded border text-center transition-colors ${
                                                isPaid 
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                                : 'bg-white border-slate-200 text-slate-400'
                                            }`}
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-wider">{month.substring(0, 3)}</div>
                                            <div className="mt-0.5">
                                                {isPaid ? <CheckCircleIcon className="w-3.5 h-3.5 mx-auto"/> : <ClockIcon className="w-3.5 h-3.5 mx-auto opacity-30"/>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-50 border rounded-xl p-3">
                                <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wide">Examination Fees</h3>
                                <div className="space-y-1">
                                    {TERMINAL_EXAMS.map(exam => {
                                        const isPaid = student.feePayments?.examFeesPaid?.[exam.id as keyof typeof student.feePayments.examFeesPaid];
                                        return (
                                            <div key={exam.id} className="flex items-center justify-between px-2.5 py-1 bg-white rounded border">
                                                <span className="text-xs font-medium text-slate-700">{exam.name}</span>
                                                {isPaid ? (
                                                    <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5"/> PAID</span>
                                                ) : (
                                                    <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1"><XCircleIcon className="w-3.5 h-3.5"/> UNPAID</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-slate-50 border rounded-xl p-3">
                                <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wide">One-Time Charges</h3>
                                <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded border">
                                    <span className="text-xs font-medium text-slate-700">Admission / Annual Misc Fees</span>
                                    {student.feePayments?.admissionFeePaid ? (
                                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5"/> PAID</span>
                                    ) : (
                                        <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1"><XCircleIcon className="w-3.5 h-3.5"/> UNPAID</span>
                                    )}
                                </div>
                                {isAdmin && (
                                    <Link to="/portal/fees" state={{ studentId: student.id }} className="mt-2.5 w-full btn btn-secondary text-xs py-1">
                                        Update Payment Status
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Outstanding Dues Summary */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 h-fit shadow-sm">
                        <h3 className="text-sm sm:text-base font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600"/>
                            Outstanding Dues
                        </h3>
                        {dues.length > 0 ? (
                            <>
                                <ul className="space-y-1">
                                    {dues.map((due, idx) => (
                                        <li key={idx} className="flex gap-1.5 text-xs text-amber-800">
                                            <span className="font-bold text-amber-600">•</span>
                                            <span className="font-medium leading-tight">{due}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 pt-2.5 border-t border-amber-200">
                                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-0.5">Total Outstanding</p>
                                    <div className="text-lg font-bold text-amber-900">
                                        {dues.length} Pending Items
                                    </div>
                                    <Link to="/portal/fees" state={{ studentId: student.id }} className="mt-2.5 w-full btn btn-primary text-xs py-1.5 bg-amber-600 hover:bg-amber-700 border-none shadow-sm">
                                        Manage & Pay Fees
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-3">
                                <div className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5">
                                    <CheckCircleIcon className="w-5 h-5"/>
                                </div>
                                <h4 className="font-bold text-emerald-800 text-xs sm:text-sm">No Pending Dues</h4>
                                <p className="text-[11px] text-emerald-700 mt-0.5">All school fees for {academicYear} are currently clear.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DetailSection>

            
            
            <DetailSection title="School Conduct Log">
                {canEdit && (
                    <div className="mb-4 p-3 bg-slate-50 border rounded-lg">
                        {!isAddingConduct ? (
                            <button onClick={() => setIsAddingConduct(true)} className="btn btn-secondary text-xs py-1.5 px-3">
                                <PlusIcon className="w-4 h-4"/> Add New Log Entry
                            </button>
                        ) : (
                            <form onSubmit={handleAddEntrySubmit} className="space-y-3 animate-fade-in">
                                <h4 className="font-bold text-sm text-slate-800">New Conduct Entry</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700">Type</label>
                                        <select value={newEntryType} onChange={e => {
                                            const type = e.target.value as ConductEntryType;
                                            setNewEntryType(type);
                                            setNewEntryCategory(type === ConductEntryType.MERIT ? MERIT_CATEGORIES[0] : DEMERIT_CATEGORIES[0]);
                                        }} className="mt-0.5 block w-full text-xs border-slate-300 rounded-md shadow-sm">
                                            <option value={ConductEntryType.MERIT}>Merit</option>
                                            <option value={ConductEntryType.DEMERIT}>Demerit</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700">Category</label>
                                        <select value={newEntryCategory} onChange={e => setNewEntryCategory(e.target.value)} className="mt-0.5 block w-full text-xs border-slate-300 rounded-md shadow-sm">
                                            {(newEntryType === ConductEntryType.MERIT ? MERIT_CATEGORIES : DEMERIT_CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">Description</label>
                                    <textarea value={newEntryDescription} onChange={e => setNewEntryDescription(e.target.value)} rows={2} className="mt-0.5 block w-full text-xs border-slate-300 rounded-md shadow-sm" required placeholder="Provide specific details..."/>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsAddingConduct(false)} className="btn btn-secondary text-xs py-1 px-3" disabled={isSavingConduct}>Cancel</button>
                                    <button type="submit" className="btn btn-primary text-xs py-1 px-3" disabled={isSavingConduct}>
                                        {isSavingConduct ? <SpinnerIcon className="w-4 h-4"/> : <CheckIcon className="w-4 h-4" />}
                                        {isSavingConduct ? 'Saving...' : 'Save Entry'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-sm text-emerald-600 mb-2">Merits ({merits.length})</h4>
                        {merits.length > 0 ? (
                            <ul className="space-y-2">
                                {merits.map(entry => (
                                    <li key={entry.id} className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 group relative">
                                        <p className="font-semibold text-xs text-emerald-800">{entry.category}</p>
                                        <p className="text-xs text-slate-700 mt-0.5">{entry.description}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{formatDateForDisplay(entry.date)} - by {entry.recordedBy}</p>
                                        {canEdit && (
                                            <button onClick={() => setEntryToDelete(entry)} className="absolute top-1.5 right-1.5 p-1 text-red-500 hover:bg-red-100 rounded-full hidden group-hover:block">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-xs text-slate-500 italic">No merits recorded.</p>}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-rose-600 mb-2">Demerits ({demerits.length})</h4>
                        {demerits.length > 0 ? (
                            <ul className="space-y-2">
                                {demerits.map(entry => (
                                    <li key={entry.id} className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 group relative">
                                        <p className="font-semibold text-xs text-rose-800">{entry.category}</p>
                                        <p className="text-xs text-slate-700 mt-0.5">{entry.description}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{formatDateForDisplay(entry.date)} - by {entry.recordedBy}</p>
                                        {canEdit && (
                                            <button onClick={() => setEntryToDelete(entry)} className="absolute top-1.5 right-1.5 p-1 text-red-500 hover:bg-red-100 rounded-full hidden group-hover:block">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-xs text-slate-500 italic">No demerits recorded.</p>}
                    </div>
                </div>
            </DetailSection>

            <DetailSection title="Hostel Discipline Log">
                {studentHostelLog.length > 0 ? (
                    <ul className="space-y-2">
                        {studentHostelLog.map(entry => (
                             <li key={entry.id} className={`p-2.5 rounded-lg border ${getSeverityColor(entry.severity)}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-xs">{entry.category}</p>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">{entry.severity}</span>
                                    </div>
                                    <span className="text-xs font-semibold">{entry.status}</span>
                                </div>
                                <p className="text-xs text-slate-700 mt-1">{entry.description}</p>
                                {entry.actionTaken && <p className="text-xs text-slate-700 mt-1"><span className="font-semibold">Action Taken:</span> {entry.actionTaken}</p>}
                                <p className="text-[10px] text-slate-500 mt-1">{formatDateForDisplay(entry.date)} - by {entry.reportedBy}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-slate-500 italic">No hostel discipline entries recorded for this student.</p>
                )}
            </DetailSection>

            <DetailSection title="Academic & Health">
                <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <DetailItem label="Last School Attended" value={student.lastSchoolAttended} />
                    </div>
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <DetailItem label="Achievements" value={student.achievements} />
                    </div>
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <DetailItem label="Health Conditions" value={student.healthConditions} />
                    </div>
                </dl>
            </DetailSection>
      </div>
    </div>
    <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDeleteEntry}
        title="Confirm Deletion"
    >
        <p>Are you sure you want to delete this conduct log entry? This action cannot be undone.</p>
        <div className="mt-2 p-2 bg-slate-100 rounded-md text-sm">
            <p><span className="font-semibold">{entryToDelete?.category}:</span> {entryToDelete?.description}</p>
        </div>
    </ConfirmationModal>
    <ConfirmationModal
        isOpen={isDeletingStudent}
        onClose={() => setIsDeletingStudent(null as any)}
        onConfirm={handleConfirmDeleteStudent}
        title="Confirm Permanent Deletion"
    >
        <div className="space-y-3">
          <p className="text-slate-700">
            Are you sure you want to <span className="font-bold text-rose-600">permanently delete</span> the record for <span className="font-bold">{student?.name}</span>?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-sm">
            <p className="font-bold mb-1">Warning:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This action cannot be undone.</li>
              <li>All student data, including academic records and fee history, will be lost.</li>
              <li>If the student is just leaving, consider marking them as "Dropped" instead of deleting.</li>
            </ul>
          </div>
        </div>
    </ConfirmationModal>
    <StudentFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        student={student}
        academicYear={academicYear}
        isSaving={isSaving}
    />
    <TransferStudentModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleTransferSubmit}
        currentGrade={student.grade}
        isSaving={isTransferring}
    />
    </>
  );
};

export default StudentDetailPage;
