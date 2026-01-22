import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, StudentAttendanceRecord, StudentAttendanceStatus, Grade } from '../types';
import { BackIcon, HomeIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, SpinnerIcon } from '../components/Icons';
import { exportAttendanceToCsv } from '../utils';
import { db } from '../firebaseConfig';
import DateRangeExportModal from '../components/DateRangeExportModal';

const { Link, useNavigate, useParams } = ReactRouterDOM as any;

interface StudentAttendanceLogPageProps {
  students: Student[];
  fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
  user: User;
}

const StudentAttendanceLogPage: React.FC<StudentAttendanceLogPageProps> = ({ students, fetchStudentAttendanceForMonth, user }) => {
  const { studentId } = useParams() as { studentId: string };
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyAttendance, setMonthlyAttendance] = useState<Record<string, StudentAttendanceStatus | undefined>>({});
  const [isLoading, setIsLoading] = useState(true);

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

  const canView = useMemo(() => {
    if (!student) return false;
    if (user.role === 'admin' || user.role === 'user' || user.role === 'warden') return true;
    if (user.role === 'parent' && user.studentIds?.includes(student.id)) return true;
    return false;
  }, [user, student]);

  useEffect(() => {
    if (user.role === 'parent') {
        setIsLoading(false);
        return;
    }
    const fetchAttendance = async () => {
      if (!student) return;
      
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      try {
        const fullMonthData = await fetchStudentAttendanceForMonth(student.grade, year, month);
        const studentMonthData: Record<string, StudentAttendanceStatus | undefined> = {};
        
        Object.entries(fullMonthData).forEach(([date, gradeRecords]) => {
            if (gradeRecords[student.id]) {
                studentMonthData[date] = gradeRecords[student.id];
            }
        });
        setMonthlyAttendance(studentMonthData);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
        setMonthlyAttendance({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [currentDate, student, fetchStudentAttendanceForMonth, user.role]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };
  
  const attendanceSummary = useMemo(() => {
    const summary = {
        [StudentAttendanceStatus.PRESENT]: 0,
        [StudentAttendanceStatus.ABSENT]: 0,
        [StudentAttendanceStatus.LEAVE]: 0,
        totalWorkingDays: 0,
    };
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() !== 0) { // Sunday is 0, not a working day
            const dateStr = date.toISOString().split('T')[0];
            const status = monthlyAttendance[dateStr];
            if(status) {
                summary.totalWorkingDays++;
                summary[status]++;
            }
        }
    }
    
    return summary;
  }, [monthlyAttendance, currentDate]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Sunday is 0

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`pad-${i}`} className="border bg-slate-50"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0; // Sunday

        const status = monthlyAttendance[dateStr];
        let statusClass = 'bg-white';
        let statusText = isWeekend ? 'Holiday' : 'Not Marked';

        if (isWeekend) {
            statusClass = 'bg-slate-100';
        } else if (status) {
            switch(status) {
                case StudentAttendanceStatus.PRESENT: statusClass = 'bg-emerald-100 text-emerald-800'; statusText = 'Present'; break;
                case StudentAttendanceStatus.ABSENT: statusClass = 'bg-rose-100 text-rose-800'; statusText = 'Absent'; break;
                case StudentAttendanceStatus.LEAVE: statusClass = 'bg-amber-100 text-amber-800'; statusText = 'On Leave'; break;
            }
        }

        calendarDays.push(
            <div key={day} className={`p-2 border h-24 flex flex-col ${statusClass}`}>
                <span className={`font-bold ${isWeekend ? 'text-slate-400' : 'text-slate-800'}`}>{day}</span>
                {!isWeekend && status && <span className="text-xs font-semibold mt-auto">{statusText}</span>}
            </div>
        );
    }
    return calendarDays;
  };

  if (!student) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
            <p className="text-slate-700 mt-2">The requested student profile could not be loaded.</p>
            <button onClick={() => navigate(-1)} className="mt-6 btn btn-primary">Go Back</button>
        </div>
      );
  }
  
  if (!canView) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-slate-700 mt-2">You do not have permission to view this page.</p>
            <button onClick={() => navigate('/portal/dashboard')} className="mt-6 btn btn-primary">Go to Dashboard</button>
        </div>
      );
  }
  
  if (user.role === 'parent') {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Attendance Log</h1>
            <p className="mt-4 text-slate-600">
                The detailed attendance calendar view for parents is currently undergoing a security upgrade.
            </p>
            <p className="mt-2 text-slate-500">
                For attendance information, please contact the school office. We apologize for any inconvenience.
            </p>
            <button onClick={() => window.history.back()} className="mt-6 btn btn-secondary">Go Back</button>
        </div>
    );
  }


  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5"/> Back</button>
        <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home"><HomeIcon className="w-5 h-5"/> Home</Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <CalendarDaysIcon className="w-10 h-10 text-teal-600"/>
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Attendance Log</h1>
            <p className="text-slate-600 mt-1">Viewing records for: <span className="font-bold text-sky-700">{student.name}</span></p>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="btn btn-secondary !p-2"><ChevronLeftIcon className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold text-slate-800 text-center w-48">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => changeMonth(1)} className="btn btn-secondary !p-2"><ChevronRightIcon className="w-5 h-5"/></button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <span>Present: <span className="font-bold text-emerald-600">{attendanceSummary[StudentAttendanceStatus.PRESENT]}</span></span>
            <span>Absent: <span className="font-bold text-rose-600">{attendanceSummary[StudentAttendanceStatus.ABSENT]}</span></span>
            <span>Leave: <span className="font-bold text-amber-600">{attendanceSummary[StudentAttendanceStatus.LEAVE]}</span></span>
            <span>Working Days: <span className="font-bold text-slate-800">{attendanceSummary.totalWorkingDays}</span></span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 flex items-center justify-center gap-3"><SpinnerIcon className="w-8 h-8 text-sky-600"/></div>
      ) : (
        <div className="mt-6 border-t border-l">
            <div className="grid grid-cols-7 text-center font-bold text-slate-800 bg-slate-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2 border-r border-b">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {renderCalendar()}
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceLogPage;
