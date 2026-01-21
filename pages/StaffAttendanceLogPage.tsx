import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, StaffAttendanceRecord, AttendanceStatus, User, Student, GradeDefinition, Grade } from '../types';
import { BackIcon, HomeIcon, SpinnerIcon, InboxArrowDownIcon, DocumentReportIcon } from '../components/Icons';
import { exportAttendanceToCsv } from '../utils';
import DateRangeExportModal from '../components/DateRangeExportModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface StaffAttendanceLogPageProps {
  staff: Staff[];
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  fetchStaffAttendanceForMonth: (year: number, month: number) => Promise<{ [date: string]: StaffAttendanceRecord }>;
  fetchStaffAttendanceForRange: (startDate: string, endDate: string) => Promise<{ [date: string]: StaffAttendanceRecord }>;
  academicYear: string;
  user: User;
}

const StaffAttendanceLogPage: React.FC<StaffAttendanceLogPageProps> = ({ staff, students, gradeDefinitions, fetchStaffAttendanceForMonth, fetchStaffAttendanceForRange, academicYear, user }) => {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [attendanceData, setAttendanceData] = useState<Record<string, StaffAttendanceRecord>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const staffToDisplay = useMemo(() => {
        if (user.role === 'admin' || user.role === 'user') {
            return staff.sort((a,b) => a.firstName.localeCompare(b.firstName));
        }
        if (user.role === 'parent') {
            const children = students.filter(s => user.studentIds?.includes(s.id));
            if (children.length === 0) return [];

            const childGrades = [...new Set(children.map(c => c.grade))];
            const teacherIds = new Set<string>();

            childGrades.forEach(grade => {
                const classTeacherId = gradeDefinitions[grade as Grade]?.classTeacherId;
                if (classTeacherId) teacherIds.add(classTeacherId);
            });

            staff.forEach(staffMember => {
                staffMember.assignedSubjects?.forEach(assignment => {
                    if (childGrades.includes(assignment.grade)) {
                        teacherIds.add(staffMember.id);
                    }
                });
            });
            return staff.filter(s => teacherIds.has(s.id)).sort((a,b) => a.firstName.localeCompare(b.firstName));
        }
        return [];
    }, [user, staff, students, gradeDefinitions]);

    const { year, month, daysInMonth } = useMemo(() => {
        const [y, m] = selectedMonth.split('-').map(Number);
        return {
            year: y,
            month: m,
            daysInMonth: new Date(y, m, 0).getDate(),
        };
    }, [selectedMonth]);

    useEffect(() => {
        if (user.role === 'parent') {
            setIsLoading(false);
            return;
        }
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchStaffAttendanceForMonth(year, month);
                setAttendanceData(data);
            } catch (error) {
                console.error("Failed to fetch attendance logs:", error);
                setAttendanceData({});
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [year, month, fetchStaffAttendanceForMonth, user.role]);

    const handleRangeExport = async (startDate: string, endDate: string) => {
        try {
            const rangeData = await fetchStaffAttendanceForRange(startDate, endDate);
            exportAttendanceToCsv({
                people: staffToDisplay,
                attendanceData: rangeData,
                startDate,
                endDate,
                entityName: 'All_Staff',
                entityType: 'Staff',
                academicYear,
            });
        } catch (error) {
            console.error("Failed to export attendance range:", error);
            alert("Failed to export attendance range. Please try again.");
        }
    };
    
    const getStatusIndicator = (status?: AttendanceStatus) => {
        if (!status) return <span className="text-slate-400">-</span>;
        const styles = {
            [AttendanceStatus.PRESENT]: { text: 'P', color: 'bg-emerald-400 text-white' },
            [AttendanceStatus.ABSENT]: { text: 'A', color: 'bg-rose-500 text-white' },
            [AttendanceStatus.LATE]: { text: 'L', color: 'bg-amber-400 text-black' },
            [AttendanceStatus.LEAVE]: { text: 'LV', color: 'bg-slate-300 text-slate-800' },
        };
        const style = styles[status];
        return <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${style.color}`}>{style.text}</span>;
    };

    const attendanceSummary = useMemo(() => {
        return staffToDisplay.map(member => {
            const summary = { P: 0, A: 0, L: 0, LV: 0 };
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const status = attendanceData[dateStr]?.[member.id];
                if (status === AttendanceStatus.PRESENT) summary.P++;
                else if (status === AttendanceStatus.ABSENT) summary.A++;
                else if (status === AttendanceStatus.LATE) summary.L++;
                else if (status === AttendanceStatus.LEAVE) summary.LV++;
            }
            return { staffId: member.id, summary };
        });
    }, [staffToDisplay, attendanceData, daysInMonth, year, month]);
    
    if (user.role === 'parent') {
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Teacher Attendance Log</h1>
            <p className="mt-4 text-slate-600">
              This feature is currently unavailable for parents due to a security upgrade.
            </p>
            <p className="mt-2 text-slate-500">
              Please contact the school office for any inquiries.
            </p>
            <button onClick={() => navigate(-1)} className="mt-6 btn btn-secondary">Go Back</button>
          </div>
        );
    }

    return (
        <>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Staff Attendance Logs</h1>
                    <p className="text-slate-600 mt-1">View monthly attendance records for all staff members.</p>
                </div>
                 <div className="flex items-center gap-3">
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="form-input px-3 py-2 border-slate-300 rounded-md shadow-sm"
                    />
                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="btn btn-secondary"
                    >
                        <InboxArrowDownIcon className="w-5 h-5" />
                        <span>Export Range</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 flex items-center justify-center gap-3">
                    <SpinnerIcon className="w-8 h-8 text-sky-600"/>
                    <span className="text-slate-600 font-semibold">Loading Attendance Data...</span>
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-xs">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="sticky left-0 bg-slate-100 p-2 text-left font-bold text-slate-800 border-r z-10 w-48">Staff Name</th>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                    <th key={day} className="p-2 font-semibold text-slate-700 border-l w-8">{day}</th>
                                ))}
                                <th className="p-2 font-bold text-emerald-700 border-l w-12">Present</th>
                                <th className="p-2 font-bold text-rose-700 border-l w-12">Absent</th>
                                <th className="p-2 font-bold text-amber-700 border-l w-12">Late</th>
                                <th className="p-2 font-bold text-slate-700 border-l w-12">Leave</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {staffToDisplay.map(member => {
                                const summary = attendanceSummary.find(s => s.staffId === member.id)?.summary;
                                return (
                                    <tr key={member.id} className="hover:bg-slate-50">
                                        <td className="sticky left-0 bg-white hover:bg-slate-50 p-2 font-medium text-slate-800 border-r">{member.firstName} {member.lastName}</td>
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const status = attendanceData[dateStr]?.[member.id];
                                            return <td key={day} className="p-1 border-l text-center">{getStatusIndicator(status)}</td>;
                                        })}
                                        <td className="p-2 border-l text-center font-bold text-emerald-700">{summary?.P || 0}</td>
                                        <td className="p-2 border-l text-center font-bold text-rose-700">{summary?.A || 0}</td>
                                        <td className="p-2 border-l text-center font-bold text-amber-700">{summary?.L || 0}</td>
                                        <td className="p-2 border-l text-center font-bold text-slate-700">{summary?.LV || 0}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        <DateRangeExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExport={handleRangeExport}
            title="Export Staff Attendance"
        />
        </>
    );
};

export default StaffAttendanceLogPage;