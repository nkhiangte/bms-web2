import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, DailyStudentAttendance, StudentAttendanceRecord, StudentAttendanceStatus, User, StudentStatus, CalendarEvent, CalendarEventType } from '@/types';
import { BackIcon, HomeIcon, CheckIcon, SpinnerIcon, CheckCircleIcon, InboxArrowDownIcon, ChevronDownIcon, ChevronUpIcon, CalendarDaysIcon } from '@/components/Icons';
import { exportAttendanceToCsv, normalizeAcademicYear } from '@/utils';
import { db } from '@/firebaseConfig';
import DateRangeExportModal from '@/components/DateRangeExportModal';
import { SCHOOL_CALENDAR_2026_2027 } from '@/constants';

const { Link, useNavigate, useParams } = ReactRouterDOM as any;

interface StudentAttendancePageProps {
  students: Student[];
  allAttendance: DailyStudentAttendance | null;
  onUpdateAttendance: (grade: Grade, date: string, records: StudentAttendanceRecord) => Promise<void>;
  user: User;
  fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
  fetchStudentAttendanceForRange: (grade: Grade, startDate: string, endDate: string) => Promise<{ [date: string]: StudentAttendanceRecord }>;
  academicYear: string;
  assignedGrade: Grade | null;
  calendarEvents: CalendarEvent[];
}

const Toast: React.FC<{ message: string; onDismiss: () => void; }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    return (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white shadow-lg rounded-lg p-4 flex items-center gap-3 z-40 animate-fade-in max-w-sm pointer-events-auto">
            <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm font-semibold">{message}</p>
        </div>
    );
};

const AbsenteesList: React.FC<{ students: Student[], records: StudentAttendanceRecord }> = ({ students, records }) => {
    const absentees = useMemo(() => {
        return students.filter(student => records[student.id] === StudentAttendanceStatus.ABSENT);
    }, [students, records]);

    if (absentees.length === 0) {
        return (
            <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-md mt-6">
                <p>All students were present on this day.</p>
            </div>
        );
    }

    return (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg mt-6">
            <h3 className="font-bold text-rose-800 mb-2">Absent Students ({absentees.length})</h3>
            <ul className="list-decimal list-inside text-slate-800 columns-2">
                {absentees.map(student => (
                    <li key={student.id}>{student.name} (Roll No: {student.rollNo})</li>
                ))}
            </ul>
        </div>
    );
};


const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({ students, allAttendance, onUpdateAttendance, user, fetchStudentAttendanceForMonth, fetchStudentAttendanceForRange, academicYear, assignedGrade, calendarEvents }) => {
    const { grade: encodedGrade } = useParams() as { grade: string };
    const navigate = useNavigate();
    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
    
    const isClassTeacher = user.role === 'admin' || grade === assignedGrade;

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE && normalizeAcademicYear(s.academicYear) === normalizeAcademicYear(academicYear))
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade, academicYear]);

    const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
    const todayStr = useMemo(() => toYYYYMMDD(new Date()), []);
    
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [records, setRecords] = useState<StudentAttendanceRecord>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // State for recent absentees
    const [isRecentAbsenteesVisible, setIsRecentAbsenteesVisible] = useState(true);
    const [recentAbsentees, setRecentAbsentees] = useState<Record<string, { date: Date, absentees: Student[] }>>({});
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    const isToday = selectedDate === todayStr;

    const isDateHoliday = (dateStr: string) => {
        const date = new Date(`${dateStr}T00:00:00`);
        const dayOfWeek = date.getDay();
        
        // 1. Check Weekends (Saturday = 6, Sunday = 0)
        if (dayOfWeek === 0 || dayOfWeek === 6) return true;

        // 2. Check SCHOOL_CALENDAR_2026_2027 (Hardcoded holidays)
        const inSchoolCalendar = SCHOOL_CALENDAR_2026_2027.some(entry => {
            if (entry.type !== CalendarEventType.HOLIDAY) return false;
            const start = new Date(entry.date + 'T00:00:00');
            const end = entry.endDate ? new Date(entry.endDate + 'T00:00:00') : start;
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            const target = new Date(dateStr + 'T00:00:00');
            target.setHours(0,0,0,0);
            return target >= start && target <= end;
        });
        if (inSchoolCalendar) return true;

        // 3. Check calendarEvents (Dynamically added holidays)
        const inCalendarEvents = calendarEvents.some(ev => {
            if (ev.type !== CalendarEventType.HOLIDAY) return false;
            const start = new Date(ev.date);
            const end = ev.endDate ? new Date(ev.endDate) : start;
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            const target = new Date(dateStr + 'T00:00:00');
            target.setHours(0,0,0,0);
            return target >= start && target <= end;
        });

        return inCalendarEvents;
    };

    const isHoliday = useMemo(() => isDateHoliday(selectedDate), [selectedDate, calendarEvents]);

    useEffect(() => {
        const fetchDataForDate = async (dateStr: string) => {
            if (!grade) return;
            setIsLoading(true);

            let attendanceData: StudentAttendanceRecord = {};
            const isTargetHoliday = isDateHoliday(dateStr);

            if (isTargetHoliday) {
                // If it's a holiday, all students are marked as HOLIDAY status
                const holidayRecords: StudentAttendanceRecord = {};
                classStudents.forEach(s => { holidayRecords[s.id] = StudentAttendanceStatus.HOLIDAY; });
                attendanceData = holidayRecords;
            } else {
                const isFetchingToday = dateStr === todayStr;
                const todayDataFromProp = allAttendance?.[grade]?.[dateStr];

                if (isFetchingToday) {
                    if (todayDataFromProp) {
                        attendanceData = todayDataFromProp;
                    } else if (classStudents.length > 0) {
                        const defaultRecords: StudentAttendanceRecord = {};
                        classStudents.forEach(s => { defaultRecords[s.id] = StudentAttendanceStatus.PRESENT; });
                        attendanceData = defaultRecords;
                    }
                } else {
                    const [year, month] = dateStr.split('-').map(Number);
                    try {
                        const monthlyData = await fetchStudentAttendanceForMonth(grade, year, month);
                        attendanceData = (monthlyData[dateStr] as StudentAttendanceRecord) || {};
                    } catch (e) {
                        console.error("Error fetching historical attendance", e);
                    }
                }
            }
            
            setRecords(attendanceData);
            setIsLoading(false);
        };

        fetchDataForDate(selectedDate);
    }, [selectedDate, grade, classStudents, fetchStudentAttendanceForMonth, todayStr, allAttendance, calendarEvents]);

    useEffect(() => {
        const getPreviousWorkingDays = (count: number): Date[] => {
            const dates: Date[] = [];
            let currentDate = new Date();
            currentDate.setHours(0,0,0,0);
            
            let attempts = 0;
            while (dates.length < count && attempts < 30) { // Safety break
                attempts++;
                currentDate.setDate(currentDate.getDate() - 1);
                const ds = currentDate.toISOString().split('T')[0];
                if (!isDateHoliday(ds)) {
                    dates.push(new Date(currentDate));
                }
            }
            return dates;
        };

        const fetchRecentAbsentees = async () => {
            if (!grade || classStudents.length === 0) {
                setIsLoadingRecent(false);
                return;
            }

            setIsLoadingRecent(true);
            const prev5WorkingDaysDates = getPreviousWorkingDays(5);
            const absenteesByDate: Record<string, { date: Date, absentees: Student[] }> = {};
            const studentMap = new Map(classStudents.map(s => [s.id, s]));

            // NEW LOGIC: Fetch daily documents directly to read historical data
            for (const dateObj of prev5WorkingDaysDates) {
                const dateStr = toYYYYMMDD(dateObj);
                try {
                    const docRef = db.collection('studentAttendance').doc(dateStr);
                    const doc = await docRef.get();
                    
                    let dailyRecord: StudentAttendanceRecord | null = null;
                    if (doc.exists) {
                        const data = doc.data();
                        if(data && data[grade]) {
                            dailyRecord = data[grade];
                        }
                    }
                    
                    if (dailyRecord) {
                        const absentStudentIds = Object.keys(dailyRecord).filter(
                            studentId => dailyRecord![studentId] === StudentAttendanceStatus.ABSENT
                        );
                        absenteesByDate[dateStr] = {
                            date: dateObj,
                            absentees: absentStudentIds
                                .map(id => studentMap.get(id))
                                .filter((s): s is Student => !!s)
                                .sort((a,b) => a.rollNo - b.rollNo)
                        };
                    } else {
                        // If no doc or no grade data in doc, assume all present
                        absenteesByDate[dateStr] = { date: dateObj, absentees: [] };
                    }
                } catch (error) {
                    console.error(`Failed to fetch attendance for ${dateStr}`, error);
                    absenteesByDate[dateStr] = { date: dateObj, absentees: [] };
                }
            }
            
            setRecentAbsentees(absenteesByDate);
            setIsLoadingRecent(false);
        };

        fetchRecentAbsentees();
    }, [grade, classStudents]);


    const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
        if (!isToday || isHoliday) return;
        setRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status: StudentAttendanceStatus) => {
        if (!isToday || isHoliday) return;
        const newRecords: StudentAttendanceRecord = {};
        classStudents.forEach(student => {
            newRecords[student.id] = status;
        });
        setRecords(newRecords);
    };

    const [toastKey, setToastKey] = useState<number>(0);

    const handleSave = async () => {
    if (!grade || !isToday || isHoliday) return;
    setShowSuccessToast(false); // Add this line to reset any existing toast
    setIsSaving(true);
    await onUpdateAttendance(grade, selectedDate, records);
    setIsSaving(false);
    setToastKey(prev => prev + 1);
    setShowSuccessToast(true);
};

    const handleRangeExport = async (startDate: string, endDate: string) => {
        if (!grade) return;
        try {
            const rangeData = await fetchStudentAttendanceForRange(grade, startDate, endDate);
            exportAttendanceToCsv({
                people: classStudents,
                attendanceData: rangeData,
                startDate,
                endDate,
                entityName: grade,
                entityType: 'Student',
                academicYear,
            });
        } catch (error) {
            console.error("Failed to export student attendance:", error);
            alert("An error occurred while exporting data. Please check the console.");
        }
    };
    
    const formattedSelectedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const StatusButton: React.FC<{ studentId: string, status: StudentAttendanceStatus, label: string }> = ({ studentId, status, label }) => {
        const currentStatus = records[studentId];
        const isActive = currentStatus === status;
        
        const colors = {
            [StudentAttendanceStatus.PRESENT]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            [StudentAttendanceStatus.ABSENT]: 'bg-rose-100 text-rose-800 border-rose-300',
            [StudentAttendanceStatus.LEAVE]: 'bg-amber-100 text-amber-800 border-amber-300',
            [StudentAttendanceStatus.HOLIDAY]: 'bg-red-100 text-red-800 border-red-300',
        };
        const activeColors = {
            [StudentAttendanceStatus.PRESENT]: 'bg-emerald-500 text-white',
            [StudentAttendanceStatus.ABSENT]: 'bg-rose-500 text-white',
            [StudentAttendanceStatus.LEAVE]: 'bg-amber-500 text-white',
            [StudentAttendanceStatus.HOLIDAY]: 'bg-red-500 text-white',
        }

        return (
            <button
                onClick={() => handleStatusChange(studentId, status)}
                disabled={!isClassTeacher || !isToday || isHoliday}
                className={`px-3 py-1.5 text-sm font-bold rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isActive ? activeColors[status] : `hover:bg-slate-200 ${colors[status]}`}`}
            >
                {label}
            </button>
        );
    };

    if (!grade) {
        return <div>Invalid class specified.</div>;
    }

    return (
        <>
            {showSuccessToast && <Toast key={`toast-${toastKey}`} message="Attendance saved successfully!" onDismiss={() => setShowSuccessToast(false)} />}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(`/portal/classes/${encodedGrade}`)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                        <BackIcon className="w-5 h-5" /> Back to Class
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Student Attendance - {grade}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-600">{formattedSelectedDate}</p>
                            {isHoliday && <span className="px-3 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 uppercase tracking-wider">Holiday</span>}
                        </div>
                    </div>
                </div>

                {isHoliday && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <CalendarDaysIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800">Today is a Holiday / Weekend</h3>
                            <p className="text-sm text-red-700">Attendance marking is not required for school holidays and weekends.</p>
                        </div>
                    </div>
                )}

                <div className="my-6 p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-slate-800">Select Date</h3>
                        <div className="flex items-center gap-3 mt-2">
                           <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={todayStr}
                                className="form-input px-3 py-2 border-slate-300 rounded-md shadow-sm"
                            />
                            {!isToday && <button onClick={() => setSelectedDate(todayStr)} className="btn btn-secondary">Go to Today</button>}
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="btn btn-secondary"
                        >
                            <InboxArrowDownIcon className="w-5 h-5" />
                            <span>Export Range</span>
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <button
                        onClick={() => setIsRecentAbsenteesVisible(prev => !prev)}
                        className="w-full flex justify-between items-center p-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-800 transition-colors"
                    >
                        <span>Absentees From Previous 5 Working Days</span>
                        {isRecentAbsenteesVisible ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                    </button>
                    {isRecentAbsenteesVisible && (
                        <div className="mt-2 p-4 border rounded-b-lg animate-fade-in">
                            {isLoadingRecent ? (
                                <p className="text-slate-600">Loading recent absentee data...</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.values(recentAbsentees).sort((a: { date: Date }, b: { date: Date }) => b.date.getTime() - a.date.getTime()).map(({ date, absentees }: { date: Date, absentees: Student[] }) => (
                                        <div key={date.toISOString()}>
                                            <h4 className="font-semibold text-slate-700">{date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                                            {absentees.length > 0 ? (
                                                <ul className="list-disc list-inside text-slate-600 pl-4 columns-1 sm:columns-2 md:columns-3">
                                                    {absentees.map(s => <li key={s.id}>{s.name} (Roll {s.rollNo})</li>)}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-emerald-700 pl-4 italic">All students were present.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isClassTeacher && isToday && !isHoliday && (
                     <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => handleMarkAll(StudentAttendanceStatus.PRESENT)} className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 hover:bg-emerald-200">Mark All Present</button>
                        <button onClick={() => handleMarkAll(StudentAttendanceStatus.ABSENT)} className="text-xs font-semibold text-rose-700 bg-rose-100 rounded-full px-3 py-1 hover:bg-rose-200">Mark All Absent</button>
                    </div>
                )}
                
                {isLoading ? (
                    <div className="text-center py-20 flex items-center justify-center gap-3">
                        <SpinnerIcon className="w-8 h-8 text-sky-600"/>
                        <span className="text-slate-600 font-semibold">Loading Attendance...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto border rounded-lg">
                             <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase w-16">Roll No</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student Name</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {classStudents.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-3 text-sm font-semibold text-slate-800">{student.rollNo}</td>
                                            <td className="px-6 py-3 text-sm font-medium text-slate-900">{student.name}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {!records[student.id] ? (
                                                        <span className="px-3 py-1.5 text-sm font-bold rounded-full border bg-slate-100 text-slate-500">Not Marked</span>
                                                    ) : (
                                                        <>
                                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.PRESENT} label="Present"/>
                                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.ABSENT} label="Absent"/>
                                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.LEAVE} label="Leave"/>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                             {classStudents.length === 0 && (
                                <p className="text-center py-8 text-slate-600">No active students found in this class.</p>
                             )}
                        </div>
                        
                        {!isToday && <AbsenteesList students={classStudents} records={records} />}

                         {isClassTeacher && isToday && (
                            <div className="mt-6 flex justify-end">
                                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary text-base px-6 py-3 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                    {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5" />}
                                    <span>{isSaving ? 'Saving...' : 'Save Today\'s Attendance'}</span>
                                </button>
                            </div>
                         )}
                    </>
                )}
            </div>
            <DateRangeExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleRangeExport}
                title={`Export Attendance - ${grade}`}
            />
        </>
    );
};

export default StudentAttendancePage;
