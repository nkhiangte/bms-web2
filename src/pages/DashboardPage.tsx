
import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { UsersIcon, PlusIcon, DocumentReportIcon, BookOpenIcon, BriefcaseIcon, CurrencyDollarIcon, AcademicCapIcon, ArchiveBoxIcon, BuildingOfficeIcon, UserGroupIcon, CalendarDaysIcon, MegaphoneIcon, SyncIcon, ClipboardDocumentListIcon, SparklesIcon, TransferIcon, InboxArrowDownIcon, SpinnerIcon, CogIcon, XIcon } from '@/components/Icons';
import AcademicYearForm from '@/components/AcademicYearForm';
import { User, Grade, SubjectAssignment, CalendarEvent, CalendarEventType, HostelDisciplineEntry, Staff, StaffAttendanceRecord, AttendanceStatus } from '@/types';
import { getDistanceFromLatLonInM } from '@/utils';
import { SCHOOL_CALENDAR_2026_2027 } from '@/constants';

const { Link, useNavigate } = ReactRouterDOM as any;

interface DashboardPageProps {
  user: User;
  staff: Staff[];
  todayStaffAttendance?: StaffAttendanceRecord;
  onMarkStaffAttendance?: (staffId: string, status: AttendanceStatus) => void;
  studentCount: number;
  academicYear: string;
  assignedGrade: Grade | null;
  assignedSubjects: SubjectAssignment[];
  calendarEvents: CalendarEvent[];
  pendingAdmissionsCount: number;
  pendingParentCount: number;
  pendingStaffCount: number;
  onUpdateAcademicYear: (year: string) => Promise<void>;
  disciplineLog: HostelDisciplineEntry[]; // FIX: Add disciplineLog prop
}

const DashboardCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  action: React.ReactElement;
  count?: number;
  color?: 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'violet' | 'teal';
}> = ({ title, description, icon, action, count, color = 'sky' }) => {
    const colors = {
        sky: { gradient: 'from-sky-400 to-sky-600', button: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 disabled:bg-sky-400', count: 'text-sky-600' },
        emerald: { gradient: 'from-emerald-400 to-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400', count: 'text-emerald-600' },
        indigo: { gradient: 'from-indigo-400 to-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400', count: 'text-indigo-600' },
        amber: { gradient: 'from-amber-400 to-amber-600', button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-400', count: 'text-amber-600' },
        rose: { gradient: 'from-rose-400 to-rose-600', button: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-400', count: 'text-rose-600' },
        violet: { gradient: 'from-violet-400 to-violet-600', button: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500 disabled:bg-violet-400', count: 'text-violet-600' },
        teal: { gradient: 'from-teal-400 to-teal-600', button: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-400', count: 'text-teal-600' },
    };
    const selectedColor = colors[color] || colors.sky;

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col group hover:-translate-y-1.5">
            <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${selectedColor.gradient} text-white p-3 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow`}>
                    {icon}
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{description}</p>
                </div>
                {count !== undefined && (
                    <div className={`ml-auto text-4xl font-bold ${selectedColor.count}`}>{count}</div>
                )}
            </div>
            <div className="mt-auto pt-6">
                {React.cloneElement<any>(action, {
                    className: `w-full text-center block px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${selectedColor.button} group-hover:-translate-y-0.5 transform-gpu disabled:cursor-not-allowed`
                })}
            </div>
        </div>
    )
};

const getEventTypeStyles = (type: CalendarEventType) => {
    switch (type) {
        case 'Holiday': return { icon: '🌴', color: 'bg-red-100 text-red-700' };
        case 'Exam Schedule': return { icon: '📝', color: 'bg-amber-100 text-amber-700' };
        case 'School Event': return { icon: '🎉', color: 'bg-sky-100 text-sky-700' };
        case 'Staff Meeting': return { icon: '👥', color: 'bg-indigo-100 text-indigo-700' };
        default: return { icon: '🗓️', color: 'bg-slate-100 text-slate-700' };
    }
};

const UpcomingEventsCard: React.FC<{ events: CalendarEvent[]; isAdmin: boolean; }> = ({ events, isAdmin }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDaysIcon className="w-7 h-7 text-sky-600" />
                    Upcoming Events
                </h2>
                {isAdmin && (
                    <Link to="/portal/calendar" className="btn btn-secondary text-sm">
                        Manage Events
                    </Link>
                )}
            </div>
            {events.length > 0 ? (
                <div className="space-y-3">
                    {events.map(event => {
                        const { icon, color } = getEventTypeStyles(event.type);
                        const eventDate = new Date(event.date + 'T00:00:00');
                        const day = eventDate.getDate();
                        const month = eventDate.toLocaleString('default', { month: 'short' });

                        return (
                            <div key={event.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm border">
                                    <span className="text-sm font-bold text-sky-700">{month}</span>
                                    <span className="text-xl font-extrabold text-slate-800">{day}</span>
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold text-slate-800">{event.title}</p>
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                                        <span>{icon}</span>
                                        <span>{event.type}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-slate-600 text-center py-4">No upcoming events scheduled.</p>
            )}
            <div className="text-right mt-4">
                <Link to="/portal/calendar" className="text-sm font-semibold text-sky-600 hover:underline">
                    View Full Calendar &rarr;
                </Link>
            </div>
        </div>
    );
};


const SCHOOL_COORDS = { lat: 23.484294, lon: 93.3257024 };
const MAX_DISTANCE_METERS = 50;

const StaffAttendanceWidget: React.FC<{ 
    staffProfile?: Staff, 
    isHoliday: boolean, 
    todayAttendance?: AttendanceStatus,
    onMarkAttendance: (staffId: string, status: AttendanceStatus) => void 
}> = ({ staffProfile, isHoliday, todayAttendance, onMarkAttendance }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

    if (!staffProfile) return null;

    const handleMarkAttendance = () => {
        if (isHoliday) {
            setMessage({ text: 'Today is a holiday/weekend.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const distance = getDistanceFromLatLonInM(latitude, longitude, SCHOOL_COORDS.lat, SCHOOL_COORDS.lon);

                if (distance <= MAX_DISTANCE_METERS) {
                    const now = new Date();
                    const cutOff = new Date();
                    cutOff.setHours(9, 0, 0, 0);

                    const status = now > cutOff ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
                    onMarkAttendance(staffProfile.id, status);

                    setMessage({ 
                        text: status === AttendanceStatus.LATE 
                            ? `Marked as LATE. You are ${distance.toFixed(0)}m away.`
                            : `Marked successfully! You are ${distance.toFixed(0)}m away.`, 
                        type: 'success' 
                    });
                } else {
                    setMessage({ text: `Failed: You are ${distance.toFixed(0)}m away. Must be within ${MAX_DISTANCE_METERS}m.`, type: 'error' });
                }
                setIsLoading(false);
            },
            (error) => {
                let err = 'Could not get location.';
                if (error.code === 1) err = 'Location access denied. Please allow it.';
                setMessage({ text: err, type: 'error' });
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDaysIcon className="w-6 h-6 text-emerald-600" />
                    Daily Attendance
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                    {isHoliday ? "No attendance required today." : "You must be within 50m of the school."}
                </p>
                {message && (
                    <p className={`text-sm mt-2 font-semibold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
            </div>
            <button
                onClick={handleMarkAttendance}
                disabled={isLoading || !!todayAttendance || isHoliday}
                className="btn btn-primary whitespace-nowrap disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
                {isLoading ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                <span>{isHoliday ? "Holiday" : (todayAttendance ? `Status: ${todayAttendance}` : "Mark Attendance")}</span>
            </button>
        </div>
    );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ user, staff, todayStaffAttendance, onMarkStaffAttendance, studentCount, academicYear, assignedGrade, assignedSubjects, calendarEvents, pendingAdmissionsCount, pendingParentCount, pendingStaffCount, onUpdateAcademicYear, disciplineLog }) => {
  const navigate = useNavigate();
  const [isChangingYear, setIsChangingYear] = useState(false);
  
  useEffect(() => {
    // If a parent user lands on this page, redirect them to their specific dashboard.
    if (user.role === 'parent') {
      navigate('/portal/parent-dashboard', { replace: true });
    }
  }, [user, navigate]);

  const isAdmin = user.role === 'admin';
  const totalPending = pendingAdmissionsCount + pendingParentCount + pendingStaffCount;
  
  const upcomingEvents = useMemo(() => {
    if (!calendarEvents) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return calendarEvents
        .filter(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            return eventDate >= today;
        })
        .slice(0, 5); // Show up to 5 upcoming events
    }, [calendarEvents]);

  const currentUserStaffProfile = useMemo(() => staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase()), [staff, user.email]);
  
  const isDateHoliday = (date: Date) => {
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      if (dayOfWeek === 0 || dayOfWeek === 6) return true;
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
      return calendarEvents.some(ev => {
          if (ev.type !== CalendarEventType.HOLIDAY) return false;
          const start = new Date(ev.date);
          const end = ev.endDate ? new Date(ev.endDate) : start;
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          const target = new Date(dateStr + 'T00:00:00');
          target.setHours(0,0,0,0);
          return target >= start && target <= end;
      });
  };
  const isHoliday = useMemo(() => isDateHoliday(new Date()), [calendarEvents]);

  // Handle pending user state early return - This is safe because useMemo is called above
  if (user.role === 'pending' || user.role === 'pending_parent') {
      return (
          <div className="text-center bg-white p-10 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-amber-600">Account Pending Approval</h2>
              <p className="text-slate-700 mt-2">Your account has been registered successfully and is awaiting approval from a school administrator.</p>
              {user.role === 'pending_parent' && user.claimedStudentId && (
                  <p className="text-slate-600 mt-1">You will be notified once your account is linked to student ID: <strong>{user.claimedStudentId}</strong>.</p>
              )}
          </div>
      );
  }
  
  // Render a loading state for parents while redirecting to avoid flashing the admin content.
  if (user.role === 'parent') {
    return (
        <div className="flex items-center justify-center" style={{ height: '60vh' }}>
            <SpinnerIcon className="w-10 h-10 text-sky-600" />
        </div>
    );
  }

  return (
    <div>
        {/* Academic Year Modal */}
        {(!academicYear || isChangingYear) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
                     {academicYear && (
                        <button 
                            onClick={() => setIsChangingYear(false)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    )}
                    <AcademicYearForm onSetAcademicYear={async (year) => {
                        await onUpdateAcademicYear(year);
                        setIsChangingYear(false);
                    }} />
                </div>
            </div>
        )}

        <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Welcome, {user.displayName || user.email}!</h1>
            <p className="text-slate-600 text-lg mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>Academic Year: <span className="font-semibold text-sky-600">{academicYear}</span></span>
                 {user.role === 'user' && assignedGrade && (
                    <span>Class Teacher of: <span className="font-semibold text-indigo-600">{assignedGrade}</span></span>
                )}
                {(isAdmin || user.role === 'user' || user.role === 'warden') && (
                    <button 
                        onClick={() => setIsChangingYear(true)} 
                        className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-full shadow-sm hover:bg-slate-50 transition"
                        title={isAdmin ? "Change the currently active global academic year" : "Change academic year for your current session"}
                    >
                        <SyncIcon className="w-4 h-4"/>
                        {isAdmin ? 'Change Global Year' : 'Change session Year'}
                    </button>
                )}
            </p>
        </div>

        {currentUserStaffProfile && onMarkStaffAttendance && (
            <StaffAttendanceWidget 
                staffProfile={currentUserStaffProfile} 
                isHoliday={isHoliday} 
                todayAttendance={todayStaffAttendance ? todayStaffAttendance[currentUserStaffProfile.id] : undefined} 
                onMarkAttendance={onMarkStaffAttendance} 
            />
        )}
        
        {(isAdmin || user.role === 'user' || user.role === 'warden') &&
            <UpcomingEventsCard events={upcomingEvents} isAdmin={isAdmin} />
        }

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdmin && (
                <DashboardCard
                    title="Admin Panel"
                    description="Access all administrative functions."
                    icon={<CogIcon className="w-7 h-7" />}
                    count={totalPending > 0 ? totalPending : undefined}
                    color="rose"
                    action={<Link to="/portal/admin">Go to Admin Panel</Link>}
                />
            )}
             <DashboardCard
                title={isAdmin ? "Manage Students" : "View Students"}
                description={isAdmin ? `View, edit, or delete student records for ${academicYear}.` : `Browse all active students in ${academicYear}.`}
                icon={<UsersIcon className="w-7 h-7" />}
                count={studentCount}
                color="sky"
                action={<Link to="/portal/students">View Active Students</Link>}
            />
            {user.role === 'user' && assignedGrade && (
                 <DashboardCard
                    title="My Class"
                    description={`Manage students and details for ${assignedGrade}.`}
                    icon={<BookOpenIcon className="w-7 h-7" />}
                    color="indigo"
                    action={<Link to={`/portal/classes/${encodeURIComponent(assignedGrade)}`}>Go to My Class</Link>}
                />
            )}
             <DashboardCard
                title="Academics & Reports"
                description="Enter marks and view academic reports."
                icon={<AcademicCapIcon className="w-7 h-7" />}
                color="rose"
                action={<Link to="/portal/reports/academics">Manage Academics</Link>}
            />
            <DashboardCard
                title="AI Student Insights"
                description="Identify students at academic risk and analyze performance trends using AI."
                icon={<SparklesIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/portal/insights">Analyze Students</Link>}
            />
             <DashboardCard
                title="Homework Scanner"
                description="AI-powered checks for grammar, spelling, math steps, and handwriting."
                icon={<SparklesIcon className="w-7 h-7" />}
                color="violet"
                action={<Link to="/portal/homework-scanner">Scan Homework</Link>}
            />
             <DashboardCard
                title="Activity Log"
                description="Enter and manage CCE activity marks."
                icon={<ClipboardDocumentListIcon className="w-7 h-7" />}
                color="amber"
                action={<Link to="/portal/activity-log">Manage Activities</Link>}
            />
            {user.role === 'user' && assignedGrade && (
                 <DashboardCard
                    title="Mark Student Attendance"
                    description={`Take daily attendance for ${assignedGrade}.`}
                    icon={<CalendarDaysIcon className="w-7 h-7" />}
                    color="amber"
                    action={<Link to={`/portal/classes/${encodeURIComponent(assignedGrade)}/attendance`}>Take Attendance</Link>}
                />
            )}

            <DashboardCard
                title="Staff Attendance"
                description="Mark and view daily staff attendance."
                icon={<CalendarDaysIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/portal/staff/attendance">Mark Attendance</Link>}
            />
            
            <DashboardCard
                title="Register New Student"
                description={`Add a new student to the ${academicYear} database.`}
                icon={<PlusIcon className="w-7 h-7" />}
                color="emerald"
                action={<button onClick={() => navigate('/portal/students')} disabled={!isAdmin}>Add New Student</button>}
            />
            <DashboardCard
                title="Manage Classes"
                description="Browse students by their class."
                icon={<BookOpenIcon className="w-7 h-7" />}
                color="indigo"
                action={<Link to="/portal/classes">Browse Classes</Link>}
            />
             <DashboardCard
                title="Class Routine"
                description="View the daily class timetable."
                icon={<BookOpenIcon className="w-7 h-7" />}
                color="indigo"
                action={<Link to="/portal/routine">View Routine</Link>}
            />
                <DashboardCard
                title="Communication"
                description="Send bulk SMS or WhatsApp to parents."
                icon={<MegaphoneIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/portal/communication">{isAdmin ? 'Send Messages' : 'View Communication'}</Link>}
            />
            <DashboardCard
                title="Transfer Management"
                description="Generate and manage Transfer Certificates."
                icon={<TransferIcon className="w-7 h-7" />}
                color="amber"
                action={<Link to="/portal/transfers">{isAdmin ? 'Manage Transfers' : 'View Records'}</Link>}
            />
            
            <DashboardCard
                title="Inventory"
                description="Track and manage all school assets."
                icon={<ArchiveBoxIcon className="w-7 h-7" />}
                color="violet"
                action={<Link to="/portal/inventory">{isAdmin ? 'Manage Inventory' : 'View Inventory'}</Link>}
            />

            <DashboardCard
                title="Hostel Management"
                description="Manage hostel rooms, students, and staff."
                icon={<BuildingOfficeIcon className="w-7 h-7" />}
                color="rose"
                action={<Link to="/portal/hostel-dashboard">{isAdmin ? 'Manage Hostel' : 'View Hostel'}</Link>}
            />

            <DashboardCard
                title="School Calendar"
                description="View holidays, exams, and school events."
                icon={<CalendarDaysIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/portal/calendar">View Calendar</Link>}
            />
        
            {!isAdmin && <DashboardCard
                title={"View Staff"}
                description={"View all staff profiles."}
                icon={<BriefcaseIcon className="w-7 h-7" />}
                color="sky"
                action={<Link to="/portal/staff">{"View Staff"}</Link>}
            />}
        </div>
    </div>
  );
};

export default DashboardPage;