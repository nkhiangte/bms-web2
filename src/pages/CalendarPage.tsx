import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, CalendarEvent, CalendarEventType } from '@/types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

interface CalendarPageProps {
    events: CalendarEvent[];
    user: User;
    onAdd: () => void;
    onEdit: (event: CalendarEvent) => void;
    onDelete: (event: CalendarEvent) => void;
    notificationDaysBefore: number;
    onUpdatePrefs: (days: number) => void;
}

// ─── 2026-2027 MIZORAM SCHOOL CALENDAR DATA ───────────────────────────────────

type SchoolLevel = 'all' | 'primary' | 'middle' | 'high';

interface SchoolCalendarEntry {
    id: string;
    date: string;
    endDate?: string;
    title: string;
    type: CalendarEventType;
    levels: SchoolLevel[]; // which school levels this applies to
    description?: string;
}

const SCHOOL_CALENDAR_2026_2027: SchoolCalendarEntry[] = [
    // ── SCHOOL RE-OPENS ──
    {
        id: 'sc-pm-reopen',
        date: '2026-03-23',
        title: 'School Re-opens (Primary & Middle)',
        type: CalendarEventType.EVENT,
        levels: ['primary', 'middle'],
        description: 'Academic session 2026-2027 begins for Primary and Middle Schools.',
    },
    {
        id: 'sc-hs-reopen',
        date: '2026-04-01',
        title: 'High School Re-opens',
        type: CalendarEventType.EVENT,
        levels: ['high'],
        description: 'Academic session 2026-2027 begins for High Schools.',
    },

    // ── SHARED HOLIDAYS (all levels) ──
    {
        id: 'h-ram-navami',
        date: '2026-03-26',
        title: 'Ram Navami',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
    },
    {
        id: 'h-mahavir',
        date: '2026-03-31',
        title: 'Mahavir Jayanti',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
    },
    {
        id: 'h-good-friday',
        date: '2026-04-03',
        title: 'Good Friday',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
        description: 'Public holiday.',
    },
    {
        id: 'h-buddha',
        date: '2026-05-01',
        title: 'Buddha Purnima',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-bakrid',
        date: '2026-05-27',
        title: 'Id-ul-Zuha (Bakrid)',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-yma',
        date: '2026-06-15',
        title: 'YMA Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-muharram',
        date: '2026-06-26',
        title: 'Muharram',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-remna-ni',
        date: '2026-06-30',
        title: 'Remna Ni',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-mhip',
        date: '2026-07-06',
        title: 'MHIP Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-independence',
        date: '2026-08-15',
        title: 'Independence Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-milad',
        date: '2026-08-26',
        title: "Milad-un-Nabi (Prophet Mohammad's Birthday)",
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-janmashtami',
        date: '2026-09-04',
        title: 'Janmashtami (Vaishnava)',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-teachers',
        date: '2026-09-05',
        title: "Teachers' Day",
        type: CalendarEventType.EVENT,
        levels: ['all'],
        description: "Teachers' Day. Celebration to be held on 03.09.2026 (Thursday).",
    },
    {
        id: 'h-gandhi',
        date: '2026-10-02',
        title: "Mahatma Gandhi's Birthday",
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-dussehra',
        date: '2026-10-20',
        title: 'Dussehra',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-zirlaite',
        date: '2026-10-27',
        title: 'Zirlaite Ni (not a holiday)',
        type: CalendarEventType.EVENT,
        levels: ['all'],
        description: 'Zirlaite Ni — observed but not a school holiday.',
    },
    {
        id: 'h-diwali',
        date: '2026-11-08',
        title: 'Diwali (Deepawali)',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-guru-nanak',
        date: '2026-11-24',
        title: "Guru Nanak's Birthday",
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-missionary',
        date: '2027-01-11',
        title: 'Missionary Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-republic',
        date: '2027-01-26',
        title: 'Republic Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-state-day',
        date: '2027-02-20',
        title: 'State Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
    },

    // ── PRIMARY SCHOOL SPORTS ──
    {
        id: 'sports-primary',
        date: '2026-04-08',
        endDate: '2026-04-10',
        title: 'Primary School Zonal Sports',
        type: CalendarEventType.EVENT,
        levels: ['primary'],
        description: 'Primary School Zonal Sports — 3 days.',
    },

    // ── MIDDLE SCHOOL SPORTS ──
    {
        id: 'sports-middle',
        date: '2026-04-15',
        endDate: '2026-04-17',
        title: 'Middle School Zonal Sports',
        type: CalendarEventType.EVENT,
        levels: ['middle'],
        description: 'Middle School Zonal Sports — 3 days.',
    },

    // ── HIGH SCHOOL SPORTS ──
    {
        id: 'sports-hs-district',
        date: '2026-09-29',
        endDate: '2026-10-01',
        title: 'District Secondary School Sports',
        type: CalendarEventType.EVENT,
        levels: ['high'],
        description: 'District Secondary School Sports — 3 days.',
    },
    {
        id: 'sports-hs-secondary',
        date: '2026-11-17',
        endDate: '2026-11-20',
        title: 'Secondary School Games',
        type: CalendarEventType.EVENT,
        levels: ['high'],
        description: 'Secondary School Games — 4 days.',
    },

    // ── HIGH SCHOOL TERM EXAMS ──
    {
        id: 'exam-hs-term1',
        date: '2026-07-07',
        endDate: '2026-07-17',
        title: 'HS First Term Exam & Result Publication',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'High School First Term Examination and Publication of Results. (07 Jul – 17 Jul 2026)',
    },
    {
        id: 'exam-hs-term2',
        date: '2026-10-19',
        endDate: '2026-10-30',
        title: 'HS Second Term Exam & Result Publication',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'High School Second Term Examination and Publication of Results. (19 Oct – 30 Oct 2026)',
    },
    {
        id: 'exam-hs-term3',
        date: '2027-01-18',
        endDate: '2027-01-29',
        title: 'HS Third Term Exam & Result Publication',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'High School Third Term Examination and Publication of Results. (18 Jan – 29 Jan 2027)',
    },
    {
        id: 'hslc-exam',
        date: '2027-02-01',
        title: 'HSLC Examination (approx.)',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'HSLC Examination may be conducted in the month of February 2027.',
    },

    // ── PRIMARY & MIDDLE SCHOOL TERM EXAMS (same dates) ──
    {
        id: 'exam-pm-term1',
        date: '2026-07-01',
        endDate: '2026-07-10',
        title: 'Primary/Middle First Term Exam & Result',
        type: CalendarEventType.EXAM,
        levels: ['primary', 'middle'],
        description: 'First Term Examination and Publication of Results for Primary and Middle Schools. (01 Jul – 10 Jul 2026)',
    },
    {
        id: 'exam-pm-term2',
        date: '2026-10-07',
        endDate: '2026-10-16',
        title: 'Primary/Middle Second Term Exam & Result',
        type: CalendarEventType.EXAM,
        levels: ['primary', 'middle'],
        description: 'Second Term Examination and Publication of Results for Primary and Middle Schools. (07 Oct – 16 Oct 2026)',
    },
    {
        id: 'exam-pm-term3',
        date: '2027-01-25',
        endDate: '2027-02-05',
        title: 'Primary/Middle Third Term Exam & Result',
        type: CalendarEventType.EXAM,
        levels: ['primary', 'middle'],
        description: 'Third Term Examination and Publication of Results for Primary and Middle Schools. (25 Jan – 05 Feb 2027)',
    },

    // ── HIGH SCHOOL TERM RE-OPENS ──
    {
        id: 'reopen-hs-2nd',
        date: '2026-07-21',
        title: 'HS School Re-opens for 2nd Term',
        type: CalendarEventType.EVENT,
        levels: ['high'],
    },
    {
        id: 'reopen-hs-3rd',
        date: '2026-11-03',
        title: 'HS School Re-opens for 3rd Term',
        type: CalendarEventType.EVENT,
        levels: ['high'],
    },

    // ── PRIMARY/MIDDLE TERM RE-OPENS ──
    {
        id: 'reopen-pm-2nd',
        date: '2026-07-13',
        title: 'Primary/Middle Re-opens for 2nd Term',
        type: CalendarEventType.EVENT,
        levels: ['primary', 'middle'],
    },
    {
        id: 'reopen-pm-3rd',
        date: '2026-10-21',
        title: 'Primary/Middle Re-opens for 3rd Term',
        type: CalendarEventType.EVENT,
        levels: ['primary', 'middle'],
    },

    // ── VACATIONS ──
    {
        id: 'vac-hs-1day-jul',
        date: '2026-07-20',
        title: 'Vacation (1 day) – High School',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
    },
    {
        id: 'vac-pm-1day-oct',
        date: '2026-10-19',
        title: 'Vacation (1 day) – Primary/Middle',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
    },
    {
        id: 'vac-hs-2nd-1day',
        date: '2026-11-02',
        title: 'Vacation (1 day) – High School',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
    },
    {
        id: 'vac-winter-hs',
        date: '2026-12-21',
        endDate: '2027-01-05',
        title: 'Winter Vacation – High School (14 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
        description: 'High School Winter Vacation: 21 Dec 2026 – 05 Jan 2027 (14 days).',
    },
    {
        id: 'vac-winter-pm',
        date: '2026-12-21',
        endDate: '2027-01-04',
        title: 'Winter Vacation – Primary/Middle (13 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
        description: 'Primary/Middle Winter Vacation: 21 Dec 2026 – 04 Jan 2027 (13 days).',
    },
    {
        id: 'reopen-winter-all',
        date: '2027-01-06',
        title: 'School Re-opens after Winter Vacation',
        type: CalendarEventType.EVENT,
        levels: ['all'],
    },
    {
        id: 'vac-yearend-hs',
        date: '2027-02-01',
        endDate: '2027-02-23',
        title: 'Year End Vacation – High School (23 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
        description: 'High School Year End Vacation: 01 Feb – 23 Feb 2027 (23 days).',
    },
    {
        id: 'vac-yearend-pm',
        date: '2027-02-08',
        endDate: '2027-02-23',
        title: 'Year End Vacation – Primary/Middle (16 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
        description: 'Primary/Middle Year End Vacation: 08 Feb – 23 Feb 2027 (16 days).',
    },
    {
        id: 'reopen-2027',
        date: '2027-02-24',
        title: 'School Opens for 2027 Academic Session',
        type: CalendarEventType.EVENT,
        levels: ['all'],
        description: 'All schools reopen for the 2027-2028 Academic Session.',
    },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const levelLabel: Record<SchoolLevel, string> = {
    all: 'All Schools',
    primary: 'Primary School',
    middle: 'Middle School',
    high: 'High School',
};

const levelColors: Record<SchoolLevel, string> = {
    all: 'bg-slate-100 text-slate-700',
    primary: 'bg-green-100 text-green-700',
    middle: 'bg-blue-100 text-blue-700',
    high: 'bg-purple-100 text-purple-700',
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const CalendarPage: React.FC<CalendarPageProps> = ({
    events,
    user,
    onAdd,
    onEdit,
    onDelete,
    notificationDaysBefore,
    onUpdatePrefs,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // Start Apr 2026
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [filterLevel, setFilterLevel] = useState<SchoolLevel>('all');

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();

    const getFirstDayOfMonth = (year: number, month: number) =>
        new Date(year, month, 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + offset);
            return d;
        });
        setSelectedDate(null);
    };

    const getEventColor = (type: CalendarEventType) => {
        switch (type) {
            case CalendarEventType.HOLIDAY: return 'bg-red-100 text-red-800 border-red-200';
            case CalendarEventType.EXAM:    return 'bg-amber-100 text-amber-800 border-amber-200';
            case CalendarEventType.EVENT:   return 'bg-sky-100 text-sky-800 border-sky-200';
            case CalendarEventType.MEETING: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default:                        return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getDotColor = (type: CalendarEventType) => {
        switch (type) {
            case CalendarEventType.HOLIDAY: return 'bg-red-500';
            case CalendarEventType.EXAM:    return 'bg-amber-500';
            case CalendarEventType.EVENT:   return 'bg-sky-500';
            case CalendarEventType.MEETING: return 'bg-indigo-500';
            default:                        return 'bg-slate-400';
        }
    };

    /** Returns all school-calendar entries applicable on a given dateStr */
    const getSchoolEntriesForDate = (dateStr: string): SchoolCalendarEntry[] => {
        const d = new Date(dateStr + 'T00:00:00');
        d.setHours(0, 0, 0, 0);
        return SCHOOL_CALENDAR_2026_2027.filter(entry => {
            const start = new Date(entry.date + 'T00:00:00');
            const end = entry.endDate
                ? new Date(entry.endDate + 'T00:00:00')
                : start;
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            if (d < start || d > end) return false;
            if (filterLevel === 'all') return true;
            return entry.levels.includes('all') || entry.levels.includes(filterLevel);
        });
    };

    /** Returns all user-created events applicable on a given dateStr */
    const getUserEventsForDate = (dateStr: string): CalendarEvent[] => {
        const d = new Date(dateStr + 'T00:00:00');
        d.setHours(0, 0, 0, 0);
        return events.filter(ev => {
            const start = new Date(ev.date);
            const end = ev.endDate ? new Date(ev.endDate) : start;
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return d >= start && d <= end;
        });
    };

    /** Combine school entries + user events for a date, deduplicated */
    const getAllEntriesForDate = (dateStr: string) => {
        const school = getSchoolEntriesForDate(dateStr);
        const userEvts = getUserEventsForDate(dateStr);
        return { school, userEvts };
    };

    const selectedDateEntries = selectedDate
        ? getAllEntriesForDate(selectedDate)
        : null;

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        // padding
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`pad-s-${i}`} className="border-r border-b bg-slate-50/60" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const { school, userEvts } = getAllEntriesForDate(dateStr);

            const isWeekend = new Date(dateStr + 'T00:00:00').getDay() === 0 || new Date(dateStr + 'T00:00:00').getDay() === 6;
            const hasHoliday = school.some(e => e.type === CalendarEventType.HOLIDAY) || isWeekend;
            const hasExam = school.some(e => e.type === CalendarEventType.EXAM);
            const hasEvent = school.some(e => e.type === CalendarEventType.EVENT) || userEvts.length > 0;

            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const isSelected = selectedDate === dateStr;

            // Collect unique dot types (max 3 dots shown)
            const dotTypes: CalendarEventType[] = [];
            if (hasHoliday) dotTypes.push(CalendarEventType.HOLIDAY);
            if (hasExam)    dotTypes.push(CalendarEventType.EXAM);
            if (hasEvent)   dotTypes.push(CalendarEventType.EVENT);

            cells.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                        border-r border-b p-1.5 min-h-[72px] flex flex-col cursor-pointer transition-all
                        ${isSelected ? 'bg-sky-50 ring-2 ring-inset ring-sky-400' : 'hover:bg-slate-50'}
                        ${isWeekend && !isSelected ? 'bg-red-50/40' : ''}
                    `}
                >
                    <span className={`
                        text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1
                        ${isToday ? 'bg-sky-600 text-white' : hasHoliday ? 'text-red-600' : 'text-slate-700'}
                    `}>
                        {day}
                    </span>

                    {/* Dots for mobile / compact view */}
                    {dotTypes.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-auto">
                            {dotTypes.map(type => (
                                <span key={type} className={`w-2 h-2 rounded-full ${getDotColor(type)}`} />
                            ))}
                        </div>
                    )}

                    {/* Event pills — shown on larger screens */}
                    <div className="hidden sm:flex flex-col gap-0.5 mt-1 overflow-hidden">
                        {school.slice(0, 2).map(entry => (
                            <span
                                key={entry.id}
                                className={`text-[10px] leading-tight px-1 py-0.5 rounded border truncate ${getEventColor(entry.type)}`}
                            >
                                {entry.title}
                            </span>
                        ))}
                        {userEvts.slice(0, 1).map(ev => (
                            <span
                                key={ev.id}
                                className={`text-[10px] leading-tight px-1 py-0.5 rounded border truncate ${getEventColor(ev.type)}`}
                            >
                                {ev.title}
                            </span>
                        ))}
                        {school.length + userEvts.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{school.length + userEvts.length - 3} more</span>
                        )}
                    </div>
                </div>
            );
        }

        const total = firstDay + daysInMonth;
        const tail = total % 7 === 0 ? 0 : 7 - (total % 7);
        for (let i = 0; i < tail; i++) {
            cells.push(<div key={`pad-e-${i}`} className="border-r border-b bg-slate-50/60" />);
        }
        return cells;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            {/* ── top nav ── */}
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"
                >
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link
                    to="/portal/dashboard"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                    title="Go to Home"
                >
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            {/* ── header row ── */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => changeMonth(-1)} className="btn btn-secondary">&lt; Prev</button>
                    <h1 className="text-2xl font-bold text-slate-800 text-center w-52">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                    <button onClick={() => changeMonth(1)} className="btn btn-secondary">Next &gt;</button>
                    <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(null); }} className="btn btn-secondary">
                        Today
                    </button>
                </div>
                {user.role === 'admin' && (
                    <button onClick={onAdd} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" /> Add Event
                    </button>
                )}
            </div>

            {/* ── filters & legend ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                {/* School level filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">School:</span>
                    {(['all', 'primary', 'middle', 'high'] as SchoolLevel[]).map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => { setFilterLevel(lvl); setSelectedDate(null); }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                filterLevel === lvl
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-sky-400'
                            }`}
                        >
                            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 ml-auto text-xs text-slate-600">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Holiday</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Exam</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />Event</span>
                </div>
            </div>

            {/* ── notification settings ── */}
            {user.role !== 'parent' && (
                <div className="my-4 p-4 bg-slate-50 rounded-lg border">
                    <h3 className="font-bold text-slate-800">Notification Settings</h3>
                    <p className="text-sm text-slate-600 mb-2">Get reminders for upcoming events.</p>
                    <div className="flex items-center gap-3">
                        <label htmlFor="notification-days" className="text-sm font-medium text-slate-700">Remind me:</label>
                        <select
                            id="notification-days"
                            value={notificationDaysBefore}
                            onChange={e => onUpdatePrefs(Number(e.target.value))}
                            className="form-select px-3 py-1.5 text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="-1">Disabled</option>
                            <option value="0">On the day</option>
                            <option value="1">1 Day Before</option>
                            <option value="3">3 Days Before</option>
                            <option value="7">1 Week Before</option>
                        </select>
                    </div>
                </div>
            )}

            {/* ── calendar grid ── */}
            <div className="border-t border-l border-slate-200 rounded-md overflow-hidden">
                <div className="grid grid-cols-7">
                    {daysOfWeek.map(d => (
                        <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide p-2 border-r border-b bg-slate-50">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {renderCalendar()}
                </div>
            </div>

            {/* ── date detail panel ── */}
            {selectedDate && selectedDateEntries && (
                <div className="mt-6 border rounded-xl p-5 bg-slate-50 shadow-inner">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                {formatDate(selectedDate)}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Showing for: <span className="font-semibold text-sky-600">{levelLabel[filterLevel]}</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {selectedDateEntries.school.length === 0 && selectedDateEntries.userEvts.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No events or holidays scheduled for this date.</p>
                    ) : (
                        <div className="space-y-3">
                            {/* School calendar entries */}
                            {selectedDateEntries.school.map(entry => (
                                <div
                                    key={entry.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(entry.type)}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{entry.title}</p>
                                        {entry.description && (
                                            <p className="text-xs mt-0.5 opacity-80">{entry.description}</p>
                                        )}
                                        <div className="flex gap-1 mt-1.5 flex-wrap">
                                            {entry.levels.map(lvl => (
                                                <span key={lvl} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelColors[lvl]}`}>
                                                    {levelLabel[lvl]}
                                                </span>
                                            ))}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/60 border`}>
                                                {entry.type}
                                            </span>
                                        </div>
                                        {entry.endDate && entry.endDate !== entry.date && (
                                            <p className="text-[10px] mt-1 opacity-70">
                                                Until {formatDate(entry.endDate)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* User-created events */}
                            {selectedDateEntries.userEvts.map(ev => (
                                <div
                                    key={ev.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(ev.type)}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{ev.title}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/60 border`}>
                                            {ev.type}
                                        </span>
                                    </div>
                                    {user.role === 'admin' && (
                                        <div className="flex gap-1 shrink-0">
                                            <button onClick={() => onEdit(ev)} className="p-1 rounded hover:bg-white/50">
                                                <EditIcon className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button onClick={() => onDelete(ev)} className="p-1 rounded hover:bg-white/50">
                                                <TrashIcon className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
