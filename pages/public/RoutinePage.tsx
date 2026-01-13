
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, EditIcon, PlusIcon, TrashIcon } from '../../components/Icons';
import { ROUTINE_DAYS, PERIOD_LABELS, PERIOD_TIMES } from '../../constants';
import { ExamRoutine, DailyRoutine, User, ClassRoutine } from '../../types';
import ExamRoutineModal from '../../components/ExamRoutineModal';
import ClassRoutineModal from '../../components/ClassRoutineModal';

const days = ROUTINE_DAYS;
const periods = PERIOD_LABELS;
const periodTimes = PERIOD_TIMES;

const teacherColors: Record<string, string> = {
    'Isaac': 'bg-gray-800 text-white',
    'Lynda': 'bg-red-500 text-white',
    'Lalremruati': 'bg-yellow-800 text-white', // Brownish
    'Judith': 'bg-pink-400 text-white',
    'Sharon': 'bg-purple-500 text-white',
    'Nelson': 'bg-blue-600 text-white',
    'Lalhruaimawii': 'bg-orange-500 text-white',
    'PS Lala': 'bg-yellow-400 text-black',
    'Lalchhuanawma': 'bg-teal-500 text-white',
    'Saichhingpuii': 'bg-lime-500 text-black',
    'Malsawmi': 'bg-indigo-500 text-white',
    'default': 'bg-slate-100 text-slate-800',
};

const getTeacherColor = (teacher: string | null) => {
    if (!teacher) return teacherColors.default;
    // Simple includes check for teacher name match
    const key = Object.keys(teacherColors).find(k => teacher.includes(k));
    return key ? teacherColors[key] : teacherColors.default;
};

const parseSubject = (subjectString: string) => {
    if (!subjectString) return { subject: '', teacher: null };
    const match = subjectString.match(/(.+?)\s*\((.+?)\)/);
    if (match) {
        return { subject: match[1].trim(), teacher: match[2].trim() };
    }
    return { subject: subjectString.trim(), teacher: null };
};

interface RoutinePageProps {
    examSchedules?: ExamRoutine[];
    classSchedules?: Record<string, DailyRoutine>;
    user?: User | null;
    onSaveExamRoutine?: (routine: Omit<ExamRoutine, 'id'>, id?: string) => Promise<boolean>;
    onDeleteExamRoutine?: (routine: ExamRoutine) => void;
    onUpdateClassRoutine?: (day: string, routine: DailyRoutine) => void;
}

const RoutinePage: React.FC<RoutinePageProps> = ({ 
    examSchedules = [], 
    classSchedules = {}, 
    user,
    onSaveExamRoutine,
    onDeleteExamRoutine,
    onUpdateClassRoutine
}) => {
    const navigate = useNavigate();
    const [activeDay, setActiveDay] = useState(days[0]);
    const [activeTab, setActiveTab] = useState('exam');
    
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [editingExamRoutine, setEditingExamRoutine] = useState<ExamRoutine | null>(null);
    
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);

    useEffect(() => {
        const today = new Date().getDay(); // 0=Sun, 1=Mon,... 6=Sat
        const todayKey = days[today - 1]; // Our `days` array is Mon-Fri
        if (todayKey) {
            setActiveDay(todayKey);
        }
    }, []);

    const routineForDay: DailyRoutine = classSchedules[activeDay] || [];
    const isAdmin = user?.role === 'admin';

    const allTeachers = useMemo(() => {
        const teacherSet = new Set<string>();
        Object.values(classSchedules).forEach((dailyRoutine: any) => {
            if (Array.isArray(dailyRoutine)) {
                dailyRoutine.forEach((classRoutine: ClassRoutine) => {
                    classRoutine.periods.forEach(period => {
                        const { teacher } = parseSubject(period.subject);
                        if (teacher) {
                            teacherSet.add(teacher);
                        }
                    });
                });
            }
        });
        return Array.from(teacherSet).sort();
    }, [classSchedules]);

    const offTeachersByPeriod = useMemo(() => {
        if (!routineForDay || routineForDay.length === 0) return [];
        const offTeachers: string[][] = [];
        for (let i = 0; i < periods.length; i++) {
            const busyTeachers = new Set<string>();
            routineForDay.forEach(classRoutine => {
                const period = classRoutine.periods[i];
                if (period) {
                    const { teacher } = parseSubject(period.subject);
                    if (teacher) {
                        busyTeachers.add(teacher);
                    }
                }
            });
            offTeachers.push(allTeachers.filter(t => !busyTeachers.has(t)));
        }
        return offTeachers;
    }, [allTeachers, routineForDay]);

    const handleAddExamRoutine = () => {
        setEditingExamRoutine(null);
        setIsExamModalOpen(true);
    };

    const handleEditExamRoutine = (routine: ExamRoutine) => {
        setEditingExamRoutine(routine);
        setIsExamModalOpen(true);
    };

    const ExamRoutineSection = () => (
        <div className="space-y-12">
            {isAdmin && onSaveExamRoutine && (
                <div className="flex justify-center">
                    <button onClick={handleAddExamRoutine} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" /> Add New Exam Routine
                    </button>
                </div>
            )}
            
            {examSchedules.length === 0 ? (
                <p className="text-center text-slate-500 italic py-8">No exam schedules available at the moment.</p>
            ) : (
                examSchedules.map((routine) => (
                    <div key={routine.id} className="relative group">
                        <div className="flex justify-center items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-slate-800 text-center">{routine.title}</h2>
                            {isAdmin && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditExamRoutine(routine)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" title="Edit">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    {onDeleteExamRoutine && (
                                        <button onClick={() => onDeleteExamRoutine(routine)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-md">
                            <table className="min-w-full divide-y divide-slate-300">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-bold text-slate-700 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-sm font-bold text-slate-700 uppercase">Day</th>
                                        <th className="px-4 py-2 text-left text-sm font-bold text-slate-700 uppercase">Morning</th>
                                        <th className="px-4 py-2 text-left text-sm font-bold text-slate-700 uppercase">Afternoon</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {routine.exams.map((exam, examIndex) => (
                                        <tr key={examIndex} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 whitespace-nowrap">{exam.date}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{exam.day}</td>
                                            <td className="px-4 py-2 whitespace-nowrap font-semibold">{exam.morning || '—'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap font-semibold">{exam.afternoon || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const ClassRoutineSection = () => (
        <>
             <div className="mb-8 flex flex-wrap justify-center gap-2 items-center">
                {days.map(day => (
                    <button 
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${activeDay === day ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
                    </button>
                ))}
                {isAdmin && onUpdateClassRoutine && (
                    <button onClick={() => setIsClassModalOpen(true)} className="ml-4 btn btn-secondary text-xs">
                        <EditIcon className="w-4 h-4" /> Edit {activeDay}
                    </button>
                )}
            </div>

             <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-md mt-8">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="sticky left-0 bg-slate-100 z-10 px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider align-middle">Class</th>
                            {periodTimes.slice(0, 4).map((time, index) => (
                                <th key={`head-${index}`} className="px-3 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider align-middle">
                                    <div className="font-extrabold text-sm">{periods[index]}</div>
                                    <div className="font-medium text-slate-600">{time.label}</div>
                                </th>
                            ))}
                            <th className="px-1 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-200 align-middle">
                               LUNCH
                            </th>
                            {periodTimes.slice(4, 7).map((time, index) => (
                                 <th key={`head-${index+4}`} className="px-3 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider align-middle">
                                    <div className="font-extrabold text-sm">{periods[index+4]}</div>
                                    <div className="font-medium text-slate-600">{time.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {routineForDay.length > 0 ? (
                            routineForDay.map((classRoutine, rowIndex) => (
                                <tr key={classRoutine.class} className="hover:bg-slate-50">
                                    <td className="sticky left-0 bg-white hover:bg-slate-50 px-4 py-2 font-bold text-slate-800 text-center whitespace-nowrap border-r">{classRoutine.class.startsWith('Class') ? classRoutine.class : `Class ${classRoutine.class}`}</td>
                                    {classRoutine.periods.slice(0, 4).map((period, index) => {
                                        const { subject, teacher } = parseSubject(period.subject);
                                        return (
                                            <td key={index} className={`p-2 text-center align-top border-l ${getTeacherColor(teacher)}`}>
                                                <div className="font-bold text-sm">{subject || '-'}</div>
                                                <div className="text-xs font-medium opacity-90">{teacher}</div>
                                            </td>
                                        );
                                    })}

                                    {rowIndex === 0 && (
                                        <td rowSpan={routineForDay.length + 1} className="px-1 text-center font-bold text-white uppercase tracking-wider bg-slate-400 align-middle border-l border-r w-8 p-0">
                                            <div className="h-full flex items-center justify-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                                LUNCH (12:00 - 01:00 PM)
                                            </div>
                                        </td>
                                    )}

                                    {classRoutine.periods.slice(4, 7).map((period, index) => {
                                         const { subject, teacher } = parseSubject(period.subject);
                                        return (
                                            <td key={index+4} className={`p-2 text-center align-top border-l ${getTeacherColor(teacher)}`}>
                                                <div className="font-bold text-sm">{subject || '-'}</div>
                                                <div className="text-xs font-medium opacity-90">{teacher}</div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="text-center py-8 text-slate-500">No schedule available for this day.</td>
                            </tr>
                        )}
                        <tr className="bg-slate-100">
                            <td className="sticky left-0 bg-slate-200 px-4 py-2 font-bold text-slate-800 text-center align-middle border-r">Off Teachers</td>
                            {offTeachersByPeriod.slice(0, 4).map((teachers, index) => (
                                <td key={`off-${index}`} className="p-2 text-center align-middle border-l text-sm text-slate-600">
                                    {teachers.length > 0 ? teachers.join(', ') : 'None'}
                                </td>
                            ))}
                            {/* Lunch TD spans */}
                            {offTeachersByPeriod.slice(4, 7).map((teachers, index) => (
                                 <td key={`off-${index+4}`} className="p-2 text-center align-middle border-l text-sm text-slate-600">
                                    {teachers.length > 0 ? teachers.join(', ') : 'None'}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );


    return (
        <>
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
                    to="/"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    title="Go to Home/Dashboard"
                    >
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                    </Link>
                </div>
                    
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Schedules & Routines</h1>
                </div>
                
                <div className="mb-8 flex justify-center border-b">
                    <button 
                        onClick={() => setActiveTab('exam')}
                        className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'exam' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Exam Routine
                    </button>
                     <button 
                        onClick={() => setActiveTab('class')}
                        className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'class' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Class Routine
                    </button>
                </div>

                {activeTab === 'exam' ? <ExamRoutineSection /> : <ClassRoutineSection />}
            </div>

            {/* Modals */}
            {isAdmin && onSaveExamRoutine && (
                <ExamRoutineModal 
                    isOpen={isExamModalOpen}
                    onClose={() => setIsExamModalOpen(false)}
                    onSave={onSaveExamRoutine}
                    initialData={editingExamRoutine}
                />
            )}
            
            {isAdmin && onUpdateClassRoutine && (
                <ClassRoutineModal 
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    onSave={async (day, routine) => {
                        await onUpdateClassRoutine(day, routine);
                        setIsClassModalOpen(false);
                    }}
                    day={activeDay}
                    currentRoutine={routineForDay}
                />
            )}
        </>
    );
};

export default RoutinePage;
