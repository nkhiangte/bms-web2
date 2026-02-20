import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade } from '@/types';
import { formatStudentId } from '@/utils';
import { BackIcon, HomeIcon, SearchIcon, DocumentReportIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, ChevronDownIcon, PrinterIcon } from '@/components/Icons';
import { GRADES_LIST, TERMINAL_EXAMS } from '@/constants';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ReportSearchPageProps {
  students: Student[];
  academicYear: string;
}

const ReportSearchPage: React.FC<ReportSearchPageProps> = ({ students, academicYear }) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [error, setError] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  
  const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleIndividualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundStudent(null);
    setIsReportDropdownOpen(false);

    if (!studentIdInput) {
      setError('Please enter a Student ID.');
      return;
    }

    const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

    if (student) {
      setFoundStudent(student);
    } else {
      setError('No active student found with this ID. Please check and try again.');
    }
  };

  const handleClassReportView = () => {
    if (selectedGrade && selectedExam) {
      navigate(`/portal/reports/class/${encodeURIComponent(selectedGrade)}/${selectedExam}`);
    }
  };
  
  const handleResetSearch = () => {
    setStudentIdInput('');
    setFoundStudent(null);
    setError('');
    setIsReportDropdownOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
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

      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Academics & Reports</h1>
        <p className="text-slate-600 mt-2">Enter marks, view class mark statements, or search for individual student reports.</p>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Class Mark Statement Section */}
        <div className="bg-slate-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ClipboardDocumentCheckIcon className="w-6 h-6 text-sky-600"/> View Class Mark Statement</h2>
            <p className="text-sm text-slate-600 mt-1 mb-4">Select a class and term to view, edit, or import marks for the entire class.</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700">Select Class</label>
                    <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)} className="mt-1 w-full form-select">
                        <option value="">-- Choose Class --</option>
                        {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700">Select Term</label>
                    <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="mt-1 w-full form-select">
                        <option value="">-- Choose Term --</option>
                        {TERMINAL_EXAMS.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleClassReportView}
                        disabled={!selectedGrade || !selectedExam}
                        className="w-full btn btn-primary disabled:bg-slate-400"
                    >
                        View Mark Statement
                    </button>
                    <Link
                        to={selectedGrade && selectedExam ? `/portal/reports/bulk-print/${encodeURIComponent(selectedGrade)}/${selectedExam}` : '#'}
                        target={selectedGrade && selectedExam ? "_blank" : undefined}
                        className={`w-full btn btn-secondary flex items-center justify-center gap-2 ${(!selectedGrade || !selectedExam) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                        <PrinterIcon className="w-5 h-5"/>
                        Bulk Print All Reports
                    </Link>
                </div>
            </div>
        </div>

        {/* Individual Student Report Section */}
        <div className="bg-slate-50 p-6 rounded-lg border">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><AcademicCapIcon className="w-6 h-6 text-sky-600"/> Find Individual Student Report</h2>
             <p className="text-sm text-slate-600 mt-1 mb-4">Quickly find a student to view their detailed progress report or enter their marks individually.</p>
            {!foundStudent ? (
            <form onSubmit={handleIndividualSearch}>
                <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-700 mb-1">Search by Student ID</label>
                <div className="flex gap-2 items-start">
                    <div className="flex-grow">
                        <input
                            id="student-id-input"
                            type="text"
                            placeholder="e.g., BMS250501"
                            value={studentIdInput}
                            onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px] flex items-center"
                    >
                       <SearchIcon className="w-5 h-5"/>
                    </button>
                </div>
            </form>
            ) : (
                <div className="animate-fade-in">
                    <div className="p-4 bg-sky-100 border border-sky-200 rounded-lg">
                        <p className="font-semibold text-sky-800">Student Found:</p>
                        <p className="text-xl font-bold text-slate-900">{foundStudent.name}</p>
                        <p className="text-slate-700">{foundStudent.grade} - {formatStudentId(foundStudent, academicYear)}</p>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <Link to={`/portal/student/${foundStudent.id}/academics`} className="w-full btn btn-secondary">
                            Enter/Edit Marks
                        </Link>
                        <div className="relative w-full">
                            <button
                                onClick={() => setIsReportDropdownOpen(prev => !prev)}
                                className="w-full btn btn-secondary"
                            >
                                <span>View Progress Report</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isReportDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isReportDropdownOpen && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10" onMouseLeave={() => setIsReportDropdownOpen(false)}>
                                    <div className="py-1">
                                        {TERMINAL_EXAMS.map(exam => (
                                            <Link
                                                key={exam.id}
                                                to={`/progress-report/${foundStudent.id}/${exam.id}`}
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
                    <button onClick={handleResetSearch} className="mt-4 text-sm font-semibold text-sky-600 hover:underline">
                        Search for another student
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportSearchPage;