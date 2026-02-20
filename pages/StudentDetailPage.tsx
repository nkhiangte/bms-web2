
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, Grade, FeeStructure, ConductEntry, ConductEntryType, HostelDisciplineEntry, StudentStatus } from '@/types';
import { BackIcon, EditIcon, UserIcon, DocumentReportIcon, HomeIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, MessageIcon, WhatsappIcon, PlusIcon, SpinnerIcon, CheckIcon, TrashIcon, ChevronDownIcon, CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon } from '@/components/Icons';
import { formatStudentId, calculateDues, formatDateForDisplay, formatPhoneNumberForWhatsApp, getFeeDetails } from '../utils';
import { MERIT_CATEGORIES, DEMERIT_CATEGORIES, TERMINAL_EXAMS, academicMonths } from '../constants';
import ConfirmationModal from '@/components/ConfirmationModal';
import PhotoWithFallback from '@/components/PhotoWithFallback';

const { Link, useNavigate, useParams } = ReactRouterDOM as any;

interface StudentDetailPageProps {
  students: Student[];
  onEdit: (student: Student) => Promise<void>;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
  feeStructure: FeeStructure;
  conductLog: ConductEntry[];
  hostelDisciplineLog: HostelDisciplineEntry[];
  onAddConductEntry: (entry: Omit<ConductEntry, 'id'>) => Promise<boolean>;
  onDeleteConductEntry: (entryId: string) => Promise<void>;
}

const DetailItem: React.FC<{label: string, value?: string | number}> = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
         <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className="mt-1 text-md font-semibold text-slate-900">{value}</dd>
        </div>
    )
}

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children}) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">{title}</h2>
        <div className="w-full">
            {children}
        </div>
    </div>
)


const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ students, onEdit, academicYear, user, assignedGrade, feeStructure, conductLog, hostelDisciplineLog, onAddConductEntry, onDeleteConductEntry }) => {
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
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  
  const canEdit = user.role === 'admin' || (user.role === 'user' && student && student.grade === assignedGrade);
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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
             <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                Back
            </button>
             <Link
                to="/portal/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                title="Go to Home/Dashboard"
            >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
            </Link>
        </div>
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 mb-6 border-b border-slate-200">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto md:mx-0">
            <PhotoWithFallback src={student.photographUrl} alt={`${student.name}'s photograph`} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-700 text-lg mt-1">{student.grade} - ID: <span className="font-semibold">{formattedStudentId}</span></p>
           <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
             {canEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition hover:-translate-y-0.5"
                >
                  <EditIcon className="h-5 h-5" />
                  Edit Profile
                </button>
             )}
            <Link
                to={`/portal/student/${student.id}/academics`}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition hover:-translate-y-0.5"
            >
                <DocumentReportIcon className="h-5 h-5" />
                Academic Records
            </Link>
            <Link
                to={`/portal/student/${student.id}/attendance-log`}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition hover:-translate-y-0.5"
            >
                <CalendarDaysIcon className="h-5 h-5" />
                Attendance Log
            </Link>
             <div className="relative flex-grow sm:flex-grow-0">
                <button
                    onClick={() => setIsReportDropdownOpen(prev => !prev)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition hover:-translate-y-0.5"
                >
                    <DocumentReportIcon className="h-5 h-5" />
                    <span>View Progress Report</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isReportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isReportDropdownOpen && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10" onMouseLeave={() => setIsReportDropdownOpen(false)}>
                        <div className="py-1">
                            {TERMINAL_EXAMS.map(exam => (
                                <Link
                                    key={exam.id}
                                    to={`/progress-report/${student.id}/${exam.id}`}
                                    target="_blank"
                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
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
      
      <div className="space-y-12">
            <DetailSection title="Personal Information">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Student ID" value={formattedStudentId} />
                    <DetailItem label="Permanent Education Number (PEN)" value={student.pen} />
                    <DetailItem label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Aadhaar Number" value={student.aadhaarNumber} />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <dt className="text-sm font-medium text-slate-600">Contact Number</dt>
                        <dd className="mt-1 text-md font-semibold text-slate-900 flex justify-between items-center">
                            <span>{student.contact || 'N/A'}</span>
                            {student.contact && (
                                <div className="flex items-center gap-2">
                                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(student.contact)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors" title="Send WhatsApp Message">
                                        <WhatsappIcon className="w-5 h-5"/>
                                    </a>
                                    <a href={`sms:${student.contact}`} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full transition-colors" title="Send SMS">
                                        <MessageIcon className="w-5 h-5"/>
                                    </a>
                                </div>
                            )}
                        </dd>
                    </div>
                    <DetailItem label="Blood Group" value={student.bloodGroup} />
                    <DetailItem label="CWSN" value={student.cwsn} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Address" value={student.address} />
                    </div>
                </dl>
            </DetailSection>

            {/* Fee Payment Status Section */}
            <DetailSection title="Fee Payment Status">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Progress Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-50 border rounded-xl p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600"/>
                                Monthly Tuition Fees ({academicYear})
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {academicMonths.map(month => {
                                    const isPaid = student.feePayments?.tuitionFeesPaid?.[month];
                                    return (
                                        <div 
                                            key={month} 
                                            className={`p-2 rounded-lg border text-center transition-colors ${
                                                isPaid 
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                                : 'bg-white border-slate-200 text-slate-400'
                                            }`}
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-wider">{month.substring(0, 3)}</div>
                                            <div className="mt-1">
                                                {isPaid ? <CheckCircleIcon className="w-5 h-5 mx-auto"/> : <ClockIcon className="w-5 h-5 mx-auto opacity-30"/>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 border rounded-xl p-4">
                                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Examination Fees</h3>
                                <div className="space-y-2">
                                    {TERMINAL_EXAMS.map(exam => {
                                        const isPaid = student.feePayments?.examFeesPaid?.[exam.id as keyof typeof student.feePayments.examFeesPaid];
                                        return (
                                            <div key={exam.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                <span className="text-sm font-medium text-slate-700">{exam.name}</span>
                                                {isPaid ? (
                                                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> PAID</span>
                                                ) : (
                                                    <span className="text-rose-600 font-bold text-xs flex items-center gap-1"><XCircleIcon className="w-4 h-4"/> UNPAID</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-slate-50 border rounded-xl p-4">
                                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">One-Time Charges</h3>
                                <div className="flex items-center justify-between p-3 bg-white rounded border h-[42px]">
                                    <span className="text-sm font-medium text-slate-700">Admission / Annual Misc Fees</span>
                                    {student.feePayments?.admissionFeePaid ? (
                                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> PAID</span>
                                    ) : (
                                        <span className="text-rose-600 font-bold text-xs flex items-center gap-1"><XCircleIcon className="w-4 h-4"/> UNPAID</span>
                                    )}
                                </div>
                                {isAdmin && (
                                    <Link to="/portal/fees" state={{ studentId: student.id }} className="mt-4 w-full btn btn-secondary text-xs py-2">
                                        Update Payment Status
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Outstanding Dues Summary */}
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 h-fit shadow-sm">
                        <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600"/>
                            Outstanding Dues
                        </h3>
                        {dues.length > 0 ? (
                            <>
                                <ul className="space-y-3">
                                    {dues.map((due, idx) => (
                                        <li key={idx} className="flex gap-2 text-sm text-amber-800">
                                            <span className="font-bold mt-1 text-amber-600">•</span>
                                            <span className="font-medium leading-tight">{due}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 pt-4 border-t border-amber-200">
                                    <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">Total Outstanding (Est.)</p>
                                    <div className="text-3xl font-black text-amber-900">
                                        {/* Dynamic calculation is visible on fee page, here we just show count or summary */}
                                        {dues.length} Pending Items
                                    </div>
                                    <Link to="/portal/fees" state={{ studentId: student.id }} className="mt-4 w-full btn btn-primary bg-amber-600 hover:bg-amber-700 border-none shadow-amber-200 shadow-lg">
                                        Manage & Pay Fees
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircleIcon className="w-10 h-10"/>
                                </div>
                                <h4 className="font-bold text-emerald-800 text-lg">No Pending Dues</h4>
                                <p className="text-sm text-emerald-700 mt-2">All school fees for {academicYear} are currently clear.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DetailSection>

            <DetailSection title="Parent & Guardian Information">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
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

            
            
            <DetailSection title="School Conduct Log">
                {canEdit && (
                    <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                        {!isAddingConduct ? (
                            <button onClick={() => setIsAddingConduct(true)} className="btn btn-secondary">
                                <PlusIcon className="w-5 h-5"/> Add New Log Entry
                            </button>
                        ) : (
                            <form onSubmit={handleAddEntrySubmit} className="space-y-4 animate-fade-in">
                                <h4 className="font-bold text-lg text-slate-800">New Conduct Entry</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800">Type</label>
                                        <select value={newEntryType} onChange={e => {
                                            const type = e.target.value as ConductEntryType;
                                            setNewEntryType(type);
                                            setNewEntryCategory(type === ConductEntryType.MERIT ? MERIT_CATEGORIES[0] : DEMERIT_CATEGORIES[0]);
                                        }} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                            <option value={ConductEntryType.MERIT}>Merit</option>
                                            <option value={ConductEntryType.DEMERIT}>Demerit</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-800">Category</label>
                                        <select value={newEntryCategory} onChange={e => setNewEntryCategory(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                            {(newEntryType === ConductEntryType.MERIT ? MERIT_CATEGORIES : DEMERIT_CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800">Description</label>
                                    <textarea value={newEntryDescription} onChange={e => setNewEntryDescription(e.target.value)} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required placeholder="Provide specific details..."/>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddingConduct(false)} className="btn btn-secondary" disabled={isSavingConduct}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSavingConduct}>
                                        {isSavingConduct ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5" />}
                                        {isSavingConduct ? 'Saving...' : 'Save Entry'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-lg text-emerald-600 mb-3">Merits ({merits.length})</h4>
                        {merits.length > 0 ? (
                            <ul className="space-y-3">
                                {merits.map(entry => (
                                    <li key={entry.id} className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 group relative">
                                        <p className="font-semibold text-emerald-800">{entry.category}</p>
                                        <p className="text-sm text-slate-700">{entry.description}</p>
                                        <p className="text-xs text-slate-500 mt-2">{formatDateForDisplay(entry.date)} - by {entry.recordedBy}</p>
                                        {canEdit && (
                                            <button onClick={() => setEntryToDelete(entry)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full hidden group-hover:block">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-600 italic">No merits recorded.</p>}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-rose-600 mb-3">Demerits ({demerits.length})</h4>
                        {demerits.length > 0 ? (
                            <ul className="space-y-3">
                                {demerits.map(entry => (
                                    <li key={entry.id} className="bg-rose-50 p-3 rounded-lg border border-rose-200 group relative">
                                        <p className="font-semibold text-rose-800">{entry.category}</p>
                                        <p className="text-sm text-slate-700">{entry.description}</p>
                                        <p className="text-xs text-slate-500 mt-2">{formatDateForDisplay(entry.date)} - by {entry.recordedBy}</p>
                                        {canEdit && (
                                            <button onClick={() => setEntryToDelete(entry)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full hidden group-hover:block">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-600 italic">No demerits recorded.</p>}
                    </div>
                </div>
            </DetailSection>

            <DetailSection title="Hostel Discipline Log">
                {studentHostelLog.length > 0 ? (
                    <ul className="space-y-3">
                        {studentHostelLog.map(entry => (
                             <li key={entry.id} className={`p-3 rounded-lg border ${getSeverityColor(entry.severity)}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{entry.category}</p>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">{entry.severity}</span>
                                    </div>
                                    <span className="text-sm font-semibold">{entry.status}</span>
                                </div>
                                <p className="text-sm text-slate-700 mt-2">{entry.description}</p>
                                {entry.actionTaken && <p className="text-sm text-slate-700 mt-2"><span className="font-semibold">Action Taken:</span> {entry.actionTaken}</p>}
                                <p className="text-xs text-slate-500 mt-2">{formatDateForDisplay(entry.date)} - by {entry.reportedBy}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-600 italic">No hostel discipline entries recorded for this student.</p>
                )}
            </DetailSection>

            <DetailSection title="Academic & Health">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Last School Attended" value={student.lastSchoolAttended} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Achievements" value={student.achievements} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
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
    </>
  );
};

export default StudentDetailPage;
