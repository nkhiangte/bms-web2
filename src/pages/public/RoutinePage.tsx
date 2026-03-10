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
    'Isaac': 'bg-gray-700 text-white',
    'Lynda': 'bg-red-800 text-white',
    'Lalremruati': 'bg-yellow-900 text-white',
    'Judith': 'bg-pink-800 text-white',
    'Sharon': 'bg-purple-800 text-white',
    'Nelson': 'bg-blue-800 text-white',
    'Lalhruaimawii': 'bg-orange-800 text-white',
    'PS Lala': 'bg-yellow-700 text-black',
    'Lalchhuanawma': 'bg-teal-800 text-white',
    'Saichhingpuii': 'bg-lime-800 text-white',
    'Malsawmi': 'bg-indigo-800 text-white',
    'default': 'bg-zinc-800 text-slate-200',
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
    onSaveExamRoutine?: (routine: Omit<ExamRoutine,'id'>, id?: string) => Promise<boolean>;
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
    const [activeTab, setActiveTab] = useState('exam');
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [editingExamRoutine, setEditingExamRoutine] = useState<ExamRoutine|null>(null);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => { if (parentGradeFilter) setActiveTab('class'); }, [parentGradeFilter]);

    useEffect(() => {
        const today = new Date().getDay();
        const todayKey = days[today-1];
        if (todayKey) setActiveDay(todayKey);
    }, []);

    const routineForDay: DailyRoutine = useMemo(() => {
        const dailySchedule = classSchedules[activeDay] || [];
        if (user?.role === 'parent' && parentGradeFilter) {
            return dailySchedule.filter((cr: ClassRoutine) => cr.class === parentGradeFilter);
        }
        return dailySchedule;
    }, [classSchedules, activeDay, user, parentGradeFilter]);

    const isAdmin = user?.role === 'admin';
    const hasClassData = Object.keys(classSchedules).length > 0;

    const allTeachers = useMemo(() => {
        const s = new Set<string>();
        Object.values(classSchedules).forEach((dr: any) => {
            if (Array.isArray(dr)) dr.forEach((cr: ClassRoutine) => cr.periods.forEach(p => { const {teacher} = parseSubject(p.subject); if (teacher) s.add(teacher); }));
        });
        return Array.from(s).sort();
    }, [classSchedules]);

    const offTeachersByPeriod = useMemo(() => {
        if (!routineForDay || routineForDay.length === 0) return [];
        return Array.from({length: periods.length}, (_, i) => {
            const busy = new Set<string>();
            routineForDay.forEach(cr => { const {teacher} = parseSubject(cr.periods[i]?.subject); if (teacher) busy.add(teacher); });
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
        <div className="space-y-12">
            {isAdmin && onSaveExamRoutine && (
                <div className="flex justify-center">
                    <button onClick={()=>{setEditingExamRoutine(null);setIsExamModalOpen(true);}} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" /> Add New Exam Routine
                    </button>
                </div>
            )}
            {examSchedules.length === 0 ? (
                <p className="text-center text-zinc-500 italic py-8">No exam schedules available at the moment.</p>
            ) : examSchedules.map(routine => (
                <div key={routine.id} className="relative group">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <h2 className="text-2xl font-bold text-white text-center">{routine.title}</h2>
                        {isAdmin && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=>{setEditingExamRoutine(routine);setIsExamModalOpen(true);}} className="p-2 text-slate-400 hover:bg-zinc-700 rounded-full"><EditIcon className="w-5 h-5" /></button>
                                {onDeleteExamRoutine && <button onClick={()=>onDeleteExamRoutine(routine)} className="p-2 text-red-400 hover:bg-red-950/40 rounded-full"><TrashIcon className="w-5 h-5" /></button>}
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto border border-zinc-700 rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-zinc-700">
                            <thead className="bg-zinc-800">
                                <tr>
                                    {['Date','Day','Morning','Afternoon'].map(h => (
                                        <th key={h} className="px-4 py-2 text-left text-sm font-bold text-slate-300 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-zinc-900 divide-y divide-zinc-700">
                                {routine.exams.map((exam,i) => (
                                    <tr key={i} className="hover:bg-zinc-800/50">
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-300">{exam.date}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-300">{exam.day}</td>
                                        <td className="px-4 py-2 whitespace-nowrap font-semibold text-white">{exam.morning||'—'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap font-semibold text-white">{exam.afternoon||'—'}</td>
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
            <div className="mb-8 flex flex-wrap justify-center gap-2 items-center">
                {days.map(day => (
                    <button key={day} onClick={()=>setActiveDay(day)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${activeDay===day?'bg-sky-600 text-white shadow-md':'bg-zinc-800 text-slate-300 hover:bg-zinc-700'}`}>
                        {day.charAt(0).toUpperCase()+day.slice(1).toLowerCase()}
                    </button>
                ))}
                {isAdmin && onUpdateClassRoutine && (
                    <div className="ml-4 flex gap-2">
                        <button onClick={()=>setIsClassModalOpen(true)} className="btn btn-secondary text-xs">
                            <EditIcon className="w-4 h-4" /> Edit {activeDay}
                        </button>
                        {!hasClassData && (
                            <button onClick={handleInitializeDefaults} disabled={isInitializing} className="btn btn-secondary text-xs bg-amber-950/30 text-amber-400 border-amber-700 hover:bg-amber-950/50">
                                {isInitializing?<SpinnerIcon className="w-4 h-4" />:<SyncIcon className="w-4 h-4" />} Initialize Defaults
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="overflow-x-auto border border-zinc-700 rounded-lg shadow-md mt-8">
                <table className="min-w-full divide-y divide-zinc-700">
                    <thead className="bg-zinc-800">
                        <tr>
                            <th className="sticky left-0 bg-zinc-800 z-10 px-4 py-3 text-left text-xs font-bold text-slate-200 uppercase tracking-wider align-middle">Class</th>
                            {periodTimes.slice(0,4).map((time,i) => (
                                <th key={`h${i}`} className="px-3 py-3 text-center text-xs font-bold text-slate-200 uppercase tracking-wider align-middle">
                                    <div className="font-extrabold text-sm">{periods[i]}</div>
                                    <div className="font-medium text-slate-400">{time.label}</div>
                                </th>
                            ))}
                            <th className="px-1 py-3 text-center text-xs font-bold text-slate-200 uppercase tracking-wider bg-zinc-700 align-middle">LUNCH</th>
                            {periodTimes.slice(4,7).map((time,i) => (
                                <th key={`h${i+4}`} className="px-3 py-3 text-center text-xs font-bold text-slate-200 uppercase tracking-wider align-middle">
                                    <div className="font-extrabold text-sm">{periods[i+4]}</div>
                                    <div className="font-medium text-slate-400">{time.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-zinc-900 divide-y divide-zinc-700">
                        {routineForDay.length > 0 ? routineForDay.map((cr, rowIndex) => (
                            <tr key={cr.class} className="hover:bg-zinc-800/30">
                                <td className="sticky left-0 bg-zinc-900 hover:bg-zinc-800/30 px-4 py-2 font-bold text-white text-center whitespace-nowrap border-r border-zinc-700">{cr.class}</td>
                                {cr.periods.slice(0,4).map((period,i) => {
                                    const {subject,teacher} = parseSubject(period.subject);
                                    return <td key={i} className={`p-2 text-center align-top border-l border-zinc-700 ${getTeacherColor(teacher)}`}><div className="font-bold text-sm">{subject||'-'}</div><div className="text-xs font-medium opacity-80">{teacher}</div></td>;
                                })}
                                {rowIndex===0 && (
                                    <td rowSpan={routineForDay.length+1} className="px-1 text-center font-bold text-slate-300 uppercase tracking-wider bg-zinc-700 align-middle border-l border-r border-zinc-600 w-8 p-0">
                                        <div className="h-full flex items-center justify-center" style={{writingMode:'vertical-rl',textOrientation:'mixed'}}>LUNCH (12:00 - 01:00 PM)</div>
                                    </td>
                                )}
                                {cr.periods.slice(4,7).map((period,i) => {
                                    const {subject,teacher} = parseSubject(period.subject);
                                    return <td key={i+4} className={`p-2 text-center align-top border-l border-zinc-700 ${getTeacherColor(teacher)}`}><div className="font-bold text-sm">{subject||'-'}</div><div className="text-xs font-medium opacity-80">{teacher}</div></td>;
                                })}
                            </tr>
                        )) : (
                            <tr><td colSpan={10} className="text-center py-8 text-zinc-500">{user?"No schedule available for this day.":"No schedule available."}</td></tr>
                        )}
                        {user?.role !== 'parent' && (
                            <tr className="bg-zinc-800">
                                <td className="sticky left-0 bg-zinc-700 px-4 py-2 font-bold text-slate-200 text-center align-middle border-r border-zinc-600">Off Teachers</td>
                                {offTeachersByPeriod.slice(0,4).map((t,i) => <td key={`off${i}`} className="p-2 text-center align-middle border-l border-zinc-700 text-sm text-slate-400">{t.length>0?t.join(', '):'None'}</td>)}
                                {offTeachersByPeriod.slice(4,7).map((t,i) => <td key={`off${i+4}`} className="p-2 text-center align-middle border-l border-zinc-700 text-sm text-slate-400">{t.length>0?t.join(', '):'None'}</td>)}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={()=>window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                        <HomeIcon className="w-5 h-5" /><span>Home</span>
                    </Link>
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Schedules & Routines</h1>
                </div>
                <div className="mb-8 flex justify-center border-b border-zinc-700">
                    <button onClick={()=>setActiveTab('exam')} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab==='exam'?'border-b-2 border-sky-500 text-sky-400':'text-slate-500 hover:text-slate-200'}`}>Exam Routine</button>
                    <button onClick={()=>setActiveTab('class')} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab==='class'?'border-b-2 border-sky-500 text-sky-400':'text-slate-500 hover:text-slate-200'}`}>Class Routine</button>
                </div>
                {activeTab==='exam'?<ExamRoutineSection />:<ClassRoutineSection />}
            </div>

            {isAdmin && onSaveExamRoutine && (
                <ExamRoutineModal isOpen={isExamModalOpen} onClose={()=>setIsExamModalOpen(false)} onSave={onSaveExamRoutine} initialData={editingExamRoutine} />
            )}
            {isAdmin && onUpdateClassRoutine && (
                <ClassRoutineModal isOpen={isClassModalOpen} onClose={()=>setIsClassModalOpen(false)} onSave={async(day,routine)=>{await onUpdateClassRoutine(day,routine);setIsClassModalOpen(false);}} day={activeDay} currentRoutine={routineForDay} />
            )}
        </>
    );
};
export default RoutinePage;
