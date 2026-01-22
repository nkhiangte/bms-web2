import React, { useState, useEffect, useMemo } from 'react';
import { Student, StudentAttendanceRecord, StudentAttendanceStatus, Grade } from '../types';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, SpinnerIcon } from './Icons';

interface AttendanceCalendarModalProps {
    student: Student;
    onClose: () => void;
    fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
}

const AttendanceCalendarModal: React.FC<AttendanceCalendarModalProps> = ({ student, onClose, fetchStudentAttendanceForMonth }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthlyData, setMonthlyData] = useState<Record<string, StudentAttendanceStatus | undefined>>({});
    const [isLoading, setIsLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!student) return;
            setIsLoading(true);
            try {
                const fullMonthData = await fetchStudentAttendanceForMonth(student.grade, year, month + 1);
                const studentMonthData: Record<string, StudentAttendanceStatus | undefined> = {};
                Object.entries(fullMonthData).forEach(([date, gradeRecords]) => {
                    if (gradeRecords[student.id]) {
                        studentMonthData[date] = gradeRecords[student.id];
                    }
                });
                setMonthlyData(studentMonthData);
            } catch (error) {
                console.error("Failed to fetch monthly attendance:", error);
                setMonthlyData({});
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, [currentDate, student, fetchStudentAttendanceForMonth, year, month]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Avoid month-end issues
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const renderCalendar = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon
        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`pad-${i}`} className="border bg-slate-50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0; // Only Sunday is a holiday

            const status = monthlyData[dateStr];
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
                    <span className="text-xs font-semibold mt-auto">{statusText}</span>
                </div>
            );
        }
        return calendarDays;
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Attendance for {student.name}</h3>
                        <p className="text-sm text-slate-600">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="btn btn-secondary !p-2"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary text-sm">Today</button>
                        <button onClick={() => changeMonth(1)} className="btn btn-secondary !p-2"><ChevronRightIcon className="w-5 h-5"/></button>
                    </div>
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center"><SpinnerIcon className="w-8 h-8 text-sky-600"/></div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-7 text-center font-bold text-slate-600 text-sm">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2">{day}</div>)}
                            </div>
                            <div className="grid grid-cols-7 border-t border-l">
                                {renderCalendar()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendarModal;
