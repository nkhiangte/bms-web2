import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, Grade, Gender } from '@/types';
import { GRADES_LIST } from '@/constants';
import StudentTable from '@/components/StudentTable';
import { PlusIcon, SearchIcon, HomeIcon, BackIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { formatStudentId } from '@/utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface StudentListPageProps {
  students: Student[];
  onAdd: () => void;
  onEdit: (student: Student) => void;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
}

const StudentListPage: React.FC<StudentListPageProps> = ({ students, onAdd, onEdit, academicYear, user, assignedGrade }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'pen' | 'fatherName' | 'studentId'>('name');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const navigate = useNavigate();

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        // Strict check for academic year. If student has no year, fallback to 2025-2026 legacy.
        const studentYear = student.academicYear || '2025-2026';
        return studentYear === academicYear;
      })
      .filter(student => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        switch (searchType) {
          case 'pen':
            return typeof student.pen === 'string' && student.pen.toLowerCase().includes(term);
          case 'fatherName':
            return typeof student.fatherName === 'string' && student.fatherName.toLowerCase().includes(term);
          case 'studentId':
            // Check against both stored ID and currently generated ID
            const storedId = (student.studentId || '').toLowerCase();
            const generatedId = formatStudentId({ ...student, studentId: undefined }, academicYear).toLowerCase();
            return storedId.includes(term) || generatedId.includes(term);
          case 'name':
          default:
            return typeof student.name === 'string' && student.name.toLowerCase().includes(term);
        }
      })
      .filter(student => (gradeFilter ? student.grade === gradeFilter : true));
  }, [students, searchTerm, searchType, gradeFilter, academicYear]);

  const statsByGrade = useMemo(() => {
    const gradeStats = GRADES_LIST.map(grade => {
        const classStudents = filteredStudents.filter(s => s.grade === grade);
        const maleCount = classStudents.filter(s => s.gender === Gender.MALE).length;
        const femaleCount = classStudents.filter(s => s.gender === Gender.FEMALE).length;
        const totalCount = classStudents.length;
        return { grade, maleCount, femaleCount, totalCount };
    });

    const totalMales = gradeStats.reduce((sum, s) => sum + s.maleCount, 0);
    const totalFemales = gradeStats.reduce((sum, s) => sum + s.femaleCount, 0);
    const grandTotal = gradeStats.reduce((sum, s) => sum + s.totalCount, 0);

    return { gradeStats, totals: { males: totalMales, females: totalFemales, total: grandTotal } };
  }, [filteredStudents]);

  const searchPlaceholders = {
    name: 'Search by name...',
    pen: 'Search by PEN...',
    fatherName: "Search by father's name...",
    studentId: 'Search by student ID (e.g., BMS250101)...',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
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

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <h2 className="text-2xl font-bold text-slate-800 md:flex-grow">
          Active Students ({filteredStudents.length}) <span className="text-sm font-normal text-slate-500">for {academicYear}</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Type Selector */}
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition"
            aria-label="Select search type"
          >
            <option value="name">Search by Name</option>
            <option value="pen">Search by PEN</option>
            <option value="fatherName">Search by Father's Name</option>
            <option value="studentId">Search by Student ID</option>
          </select>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholders[searchType]}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-500"
              aria-label="Search students"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition"
            aria-label="Filter students by grade"
          >
            <option value="">All Grades</option>
            {GRADES_LIST.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>

          {/* Add Student Button */}
          <button
            onClick={onAdd}
            disabled={user.role !== 'admin'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
            title={user.role !== 'admin' ? "Admin access required" : "Add a new student"}
          >
            <PlusIcon className="h-5 w-5" />
            Add Student
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <StudentTable
          students={filteredStudents}
          onEdit={onEdit}
          academicYear={academicYear}
          user={user}
          assignedGrade={assignedGrade}
        />
      </div>

      <div className="bg-slate-50 border rounded-lg">
          <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className="w-full flex justify-between items-center p-4 focus:outline-none"
              aria-expanded={isStatsOpen}
              aria-controls="student-stats-table"
          >
              <h3 className="text-lg font-bold text-slate-800">Student Statistics ({academicYear})</h3>
              {isStatsOpen ? <ChevronUpIcon className="w-6 h-6 text-slate-700" /> : <ChevronDownIcon className="w-6 h-6 text-slate-700" />}
          </button>
          {isStatsOpen && (
              <div id="student-stats-table" className="p-4 border-t animate-fade-in">
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-100">
                              <tr>
                                  <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Class</th>
                                  <th className="px-4 py-2 text-center text-xs font-bold text-slate-600 uppercase">Male</th>
                                  <th className="px-4 py-2 text-center text-xs font-bold text-slate-600 uppercase">Female</th>
                                  <th className="px-4 py-2 text-center text-xs font-bold text-slate-600 uppercase">Total</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                              {statsByGrade.gradeStats.map(({ grade, maleCount, femaleCount, totalCount }) => (
                                  <tr key={grade}>
                                      <td className="px-4 py-2 font-semibold text-slate-800">{grade}</td>
                                      <td className="px-4 py-2 text-center text-slate-700">{maleCount}</td>
                                      <td className="px-4 py-2 text-center text-slate-700">{femaleCount}</td>
                                      <td className="px-4 py-2 text-center font-bold text-slate-800">{totalCount}</td>
                                  </tr>
                              ))}
                          </tbody>
                          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                              <tr>
                                  <th className="px-4 py-2 text-left font-bold text-slate-800">Total</th>
                                  <th className="px-4 py-2 text-center font-bold text-slate-800">{statsByGrade.totals.males}</th>
                                  <th className="px-4 py-2 text-center font-bold text-slate-800">{statsByGrade.totals.females}</th>
                                  <th className="px-4 py-2 text-center font-bold text-slate-800">{statsByGrade.totals.total}</th>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default StudentListPage;