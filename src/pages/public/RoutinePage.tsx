import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon, EditIcon, PlusIcon, TrashIcon, SyncIcon, SpinnerIcon } from '@/components/Icons';
import { ROUTINE_DAYS, PERIOD_LABELS, PERIOD_TIMES } from '@/constants';
import { ExamRoutine, DailyRoutine, User, ClassRoutine } from '@/types';
import ExamRoutineModal from '@/components/ExamRoutineModal';
import ClassRoutineModal from '@/components/ClassRoutineModal';
import { timetableData } from '@/timetableData';

const { Link, useLocation } = ReactRouterDOM as any;

const days = ROUTINE_DAYS;
const periods = PERIOD_LABELS;
const periodTimes = PERIOD_TIMES;

const teacherColors: Record<string, string> = {
    'Isaac': 'bg-[#07162B] text-white',
    'Lynda': 'bg-[#132D52] text-[#DFC06B]',
    'Lalremruati': 'bg-[#1C3D6E] text-white',
    'Judith': 'bg-[#FBF6E8] text-[#0B1F3A]',
    'Sharon': 'bg-[#0B1F3A] text-[#DFC06B]',
    'Nelson': 'bg-[#C9A84C]/25 text-white',
    'Lalhruaimawii': 'bg-white text-[#0B1F3A]',
    'PS Lala': 'bg-[#132D52] text-white',
    'Lala': 'bg-[#132D52] text-white',
    'Lalrinliani': 'bg-[#07162B] text-[#DFC06B]',
    'Lalchhuanawma': 'bg-[#1C3D6E] text-[#DFC06B]',
    'Saichhingpuii': 'bg-[#F4F7FB] text-[#0B1F3A]',
    'Malsawmi': 'bg-[#0B1F3A] text-white',
    'default': 'bg-[#132D52] text-white',
};

const getTeacherColor = (teacher: string | null) => {
    if (!teacher) return teacherColors.default;
    const key = Object.keys(teacherColors).find(k => teacher.includes(k));
    return key ? teacherColors[key] : teacherColors.default;
};

const parseSubject = (subjectString: string) => {
    if (!subjectString) return { subject: '', teacher: null };
    const match = subjectString.match(/(.+?)\s*\((.+?)\)/);
    if (match) return { subject: match[1].trim(), teacher: match[2].trim() };
    return { subject: subjectString.trim(), teacher: null };
};

interface RoutinePageProps {
    examSchedules?: ExamRoutine[];
    classSchedules?: Record<string, DailyRoutine>;
    user?: User | null;
    onSaveExamRoutine?: (routine: Omit<ExamRoutine, 'id'>, id?: string) => Promise<boolean>;
    onDeleteExamRoutine?: (routine: ExamRoutine) => void;
    onUpdateClassRoutine?: (day: string, routine: DailyRoutine) => Promise<void>;
}

const RoutinePage: React.FC<RoutinePageProps> = ({
    examSchedules = [],
    classSchedules = {},
    user,
    onSaveExamRoutine,
    onDeleteExamRoutine,
    onUpdateClassRoutine
}) => {
    const location = useLocation();
    const parentGradeFilter = location.state?.grade;

    const [activeDay, setActiveDay] = useState(days[0]);
    const [activeTab, setActiveTab] = useState('class');
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [editingExamRoutine, setEditingExamRoutine] = useState<ExamRoutine | null>(null);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => { if (parentGradeFilter) setActiveTab('class'); }, [parentGradeFilter]);

    useEffect(() => {
        const today = new Date().getDay();
        const todayKey = days[today - 1];
        if (todayKey) setActiveDay(todayKey);
    }, []);

    const routineForDay: DailyRoutine = useMemo(() => {
        const dailySchedule = (classSchedules[activeDay] && classSchedules[activeDay].length > 0)
            ? classSchedules[activeDay]
            : (timetableData[activeDay] || []);

        const cleaned = dailySchedule.filter((cr: ClassRoutine) => cr.class !== 'Class III' && cr.class !== 'III');

        if (user?.role === 'parent' && parentGradeFilter) {
            return cleaned.filter((cr: ClassRoutine) => cr.class === parentGradeFilter);
        }
        return cleaned;
    }, [classSchedules, activeDay, user, parentGradeFilter]);

    const isAdmin = user?.role === 'admin';

    const allTeachers = useMemo(() => {
        const s = new Set<string>();
        Object.values(classSchedules).forEach((dr: any) => {
            if (Array.isArray(dr)) dr.forEach((cr: ClassRoutine) => cr.periods.forEach(p => { const { teacher } = parseSubject(p.subject); if (teacher) s.add(teacher); }));
        });
        return Array.from(s).sort();
    }, [classSchedules]);

    const offTeachersByPeriod = useMemo(() => {
        if (!routineForDay || routineForDay.length === 0) return [];
        return Array.from({ length: periods.length }, (_, i) => {
            const busy = new Set<string>();
            routineForDay.forEach(cr => { const { teacher } = parseSubject(cr.periods[i]?.subject); if (teacher) busy.add(teacher); });
            return allTeachers.filter(t => !busy.has(t));
        });
    }, [allTeachers, routineForDay]);

    const handleInitializeDefaults = async () => {
        if (!onUpdateClassRoutine) return;
        if (!window.confirm("This will overwrite existing class routines with default data. Are you sure?")) return;
        setIsInitializing(true);
        try {
            await Promise.all(Object.entries(timetableData).map(([day, routine]) => onUpdateClassRoutine(day, routine)));
            alert("Class routines initialized successfully.");
        } catch (error) {
            console.error("Initialization failed:", error);
            alert("Failed to initialize routines.");
        } finally { setIsInitializing(false); }
    };

    const ExamRoutineSection = () => (
        <div className="space-y-8 sm:space-y-12">
            {isAdmin && onSaveExamRoutine && (
                <div className="flex justify-center">
                    <button onClick={() => { setEditingExamRoutine(null); setIsExamModalOpen(true); }} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" /> Add New Exam Routine
                    </button>
                </div>
            )}
            {examSchedules.length === 0 ? (
                <p className="text-center text-white/60 italic py-8">No exam schedules available at the moment.</p>
            ) : examSchedules.map(routine => (
                <div key={routine.id} className="relative group">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white text-center">{routine.title}</h2>
                        {isAdmin && (
                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingExamRoutine(routine); setIsExamModalOpen(true); }} className="p-2 text-white/75 hover:bg-[#07162B] rounded-full"><EditIcon className="w-5 h-5" /></button>
                                {onDeleteExamRoutine && <button onClick={() => onDeleteExamRoutine(routine)} className="p-2 text-[#DFC06B] hover:bg-[#07162B] rounded-full"><TrashIcon className="w-5 h-5" /></button>}
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto border border-[#C9A84C]/35 rounded-xl shadow-md -mx-4 sm:mx-0">
                        <table className="min-w-full divide-y divide-white/15">
                            <thead className="bg-[#07162B]">
                                <tr>
                                    {['Date', 'Day', 'Morning', 'Afternoon'].map(h => (
                                        <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-[#DFC06B] uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-[#0B1F3A] divide-y divide-white/10">
                                {routine.exams.map((exam, i) => (
                                    <tr key={i} className="hover:bg-[#132D52]">
                                        <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-white/85 font-tabular">{exam.date}</td>
                                        <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-white/85">{exam.day}</td>
                                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white whitespace-normal break-words max-w-[150px] sm:max-w-none">{exam.morning || '—'}</td>
                                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white whitespace-normal break-words max-w-[150px] sm:max-w-none">{exam.afternoon || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );

    const ClassRoutineSection = () => (
        <>
            <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 items-center">
                <div className="flex flex-wrap justify-center gap-2">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-3 sm:px-4 min-h-[40px] py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-colors ${activeDay === day ? 'bg-[#C9A84C] text-[#0B1F3A] shadow-md' : 'bg-[#07162B] text-white/80 border border-white/15 hover:border-[#C9A84C]'}`}
                        >
                            {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                {isAdmin && onUpdateClassRoutine && (
                    <div className="mt-2 sm:mt-0 ml-0 sm:ml-4 flex flex-wrap justify-center gap-2">
                        <button onClick={() => setIsClassModalOpen(true)} className="btn btn-secondary text-xs p-2">
                            <EditIcon className="w-4 h-4" /> Edit {activeDay}
                        </button>
                        <button onClick={handleInitializeDefaults} disabled={isInitializing} className="btn btn-secondary text-xs bg-[#07162B] text-[#DFC06B] border-[#C9A84C]/50 hover:bg-[#132D52] p-2">
                            {isInitializing ? <SpinnerIcon className="w-4 h-4" /> : <SyncIcon className="w-4 h-4" />} Reset to 2026-27 Schedule
                        </button>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto border border-[#C9A84C]/35 rounded-xl shadow-md mt-4 sm:mt-8 relative">
                <table className="min-w-full divide-y divide-white/15">
                    <thead className="bg-[#07162B]">
                        <tr>
                            <th className="sticky left-0 top-0 bg-[#07162B] z-20 px-4 py-3 text-left text-xs font-bold text-[#DFC06B] uppercase tracking-wider align-middle border-r border-white/15 min-w-[80px]">Class</th>
                            {periodTimes.slice(0, 4).map((time, i) => (
                                <th key={`h${i}`} className="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wider align-middle min-w-[100px]">
                                    <div className="font-extrabold text-sm">{periods[i]}</div>
                                    <div className="font-medium text-white/65 font-tabular">{time.label}</div>
                                </th>
                            ))}
                            <th className="px-1 py-3 text-center text-xs font-bold text-[#DFC06B] uppercase tracking-wider bg-[#132D52] align-middle">LUNCH</th>
                            {periodTimes.slice(4, 7).map((time, i) => (
                                <th key={`h${i + 4}`} className="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wider align-middle min-w-[100px]">
                                    <div className="font-extrabold text-sm">{periods[i + 4]}</div>
                                    <div className="font-medium text-white/65 font-tabular">{time.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-[#0B1F3A] divide-y divide-white/10">
                        {routineForDay.length > 0 ? routineForDay.map((cr, rowIndex) => (
                            <tr key={cr.class} className="hover:bg-[#132D52]/50">
                                <td className="sticky left-0 bg-[#07162B] px-4 py-2 font-bold text-[#DFC06B] text-center whitespace-nowrap border-r border-white/15">{cr.class}</td>
                                {cr.periods.slice(0, 4).map((period, i) => {
                                    const { subject, teacher } = parseSubject(period.subject);
                                    return <td key={i} className={`p-2 text-center align-top border-l border-white/10 ${getTeacherColor(teacher)}`}><div className="font-bold text-sm">{subject || '-'}</div><div className="text-xs font-medium opacity-80">{teacher}</div></td>;
                                })}
                                {rowIndex === 0 && (
                                    <td rowSpan={routineForDay.length + 1} className="px-1 text-center font-bold text-[#DFC06B] uppercase tracking-wider bg-[#132D52] align-middle border-l border-r border-white/15 w-8 p-0">
                                        <div className="h-full flex items-center justify-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>LUNCH (12:00 - 01:00 PM)</div>
                                    </td>
                                )}
                                {cr.periods.slice(4, 7).map((period, i) => {
                                    const { subject, teacher } = parseSubject(period.subject);
                                    return <td key={i + 4} className={`p-2 text-center align-top border-l border-white/10 ${getTeacherColor(teacher)}`}><div className="font-bold text-sm">{subject || '-'}</div><div className="text-xs font-medium opacity-80">{teacher}</div></td>;
                                })}
                            </tr>
                        )) : (
                            <tr><td colSpan={10} className="text-center py-8 text-white/60">{user ? "No schedule available for this day." : "No schedule available."}</td></tr>
                        )}
                        {user?.role !== 'parent' && (
                            <tr className="bg-[#07162B]">
                                <td className="sticky left-0 bg-[#132D52] px-4 py-2 font-bold text-[#DFC06B] text-center align-middle border-r border-white/15">Off Teachers</td>
                                {offTeachersByPeriod.slice(0, 4).map((t, i) => <td key={`off${i}`} className="p-2 text-center align-middle border-l border-white/10 text-xs text-white/75">{t.length > 0 ? t.join(', ') : 'None'}</td>)}
                                {offTeachersByPeriod.slice(4, 7).map((t, i) => <td key={`off${i + 4}`} className="p-2 text-center align-middle border-l border-white/10 text-xs text-white/75">{t.length > 0 ? t.join(', ') : 'None'}</td>)}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <div className="bg-[#0B1F3A] py-8 sm:py-12 min-h-screen px-2 sm:px-4">
            <div className="bg-[#132D52] border border-[#C9A84C]/35 rounded-xl shadow-lg p-4 sm:p-6 mx-auto w-full max-w-7xl overflow-hidden">
                <div className="mb-4 sm:mb-6 flex justify-between items-center">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#DFC06B] hover:text-white transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="flex items-center gap-2 min-h-[44px] text-sm font-semibold text-white/80 hover:text-white transition-colors">
                        <HomeIcon className="w-5 h-5" /><span>Home</span>
                    </Link>
                </div>
                <div className="text-center mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Academic Timetable</p>
                    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">Schedules &amp; Routines</h1>
                </div>
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-center border-b border-white/15">
                    <button onClick={() => setActiveTab('class')} className={`px-4 sm:px-6 py-3 font-bold text-base sm:text-lg transition-colors text-center ${activeTab === 'class' ? 'border-b-2 border-[#C9A84C] text-[#DFC06B]' : 'text-white/60 hover:text-white'}`}>Class Routine</button>
                    <button onClick={() => setActiveTab('exam')} className={`px-4 sm:px-6 py-3 font-bold text-base sm:text-lg transition-colors text-center ${activeTab === 'exam' ? 'border-b-2 border-[#C9A84C] text-[#DFC06B]' : 'text-white/60 hover:text-white'}`}>Exam Routine</button>
                </div>
                {activeTab === 'class' ? <ClassRoutineSection /> : <ExamRoutineSection />}
            </div>

            {isAdmin && onSaveExamRoutine && (
                <ExamRoutineModal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} onSave={onSaveExamRoutine} initialData={editingExamRoutine} />
            )}
            {isAdmin && onUpdateClassRoutine && (
                <ClassRoutineModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} onSave={async (day, routine) => { await onUpdateClassRoutine(day, routine); setIsClassModalOpen(false); }} day={activeDay} currentRoutine={routineForDay} />
            )}
        </div>
    );
};
export default RoutinePage;
