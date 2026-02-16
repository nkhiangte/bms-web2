




import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Student, StudentStatus, StudentClaim, Grade, DailyStudentAttendance, NewsItem, Staff, GradeDefinition, Homework, Syllabus, StudentAttendanceRecord, FeeStructure } from '../types';
import PhotoWithFallback from '../components/PhotoWithFallback';
import { BookOpenIcon, CalendarDaysIcon, CurrencyDollarIcon, AcademicCapIcon, PlusIcon, SparklesIcon, ChevronDownIcon, MessageIcon, ArrowRightIcon, SpinnerIcon } from '../components/Icons';
import LinkChildModal from '../components/LinkChildModal';
import { getDuesSummary } from '../utils';
import AttendanceCalendarModal from '../components/AttendanceCalendarModal';

const { Link } = ReactRouterDOM as any;

const ActionCard: React.FC<{ title: string; link?: string; onClick?: () => void; icon: React.ReactNode; children?: React.ReactNode; state?: any; }> = ({ title, link, onClick, icon, children, state }) => {
    const content = (
        <div className="group block p-4 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:bg-white/80 hover:shadow-xl transition-all duration-300 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-md font-bold text-slate-900">{title}</h3>
                </div>
                {link && <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />}
            </div>
            {children && <div className="mt-3 text-sm text-slate-700">{children}</div>}
        </div>
    );
    return link ? <Link to={link} state={state} className="h-full block">{content}</Link> : <button onClick={onClick} className="w-full text-left h-full">{content}</button>;
};


interface ParentDashboardPageProps {
    user: User;
    allStudents: Student[];
    onLinkChild: (claim: StudentClaim) => Promise<void>;
    currentAttendance?: DailyStudentAttendance | null;
    news?: NewsItem[];
    staff?: Staff[];
    gradeDefinitions?: Record<Grade, GradeDefinition>;
    homework?: Homework[];
    syllabus?: Syllabus[];
    onSendMessage: (message: any) => Promise<boolean>;
    fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
    feeStructure: FeeStructure;
}

const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ user, allStudents, onLinkChild, currentAttendance, news = [], staff = [], gradeDefinitions = {} as any, homework = [], syllabus = [], onSendMessage, fetchStudentAttendanceForMonth, feeStructure }) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [expandedChild, setExpandedChild] = useState<string | null>(null);
    const [viewingAttendanceFor, setViewingAttendanceFor] = useState<Student | null>(null);

    const linkedStudents = useMemo(() => {
        if (!user.studentIds || user.studentIds.length === 0) return [];
        return allStudents
            .filter(s => user.studentIds!.includes(s.id) && s.status === StudentStatus.ACTIVE)
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [user, allStudents]);

    useEffect(() => {
        if (linkedStudents.length === 1 && !expandedChild) {
            setExpandedChild(linkedStudents[0].id);
        }
    }, [linkedStudents, expandedChild]);

    const ChildSection: React.FC<{ student: Student }> = ({ student }) => {
        const isExpanded = expandedChild === student.id;
        
        const attendanceStatus = currentAttendance?.[student.grade]?.[student.id];
        const dues = getDuesSummary(student, feeStructure);
        
        const childHomework = useMemo(() => {
            return homework.filter(h => h.grade === student.grade).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
        }, [homework, student.grade]);

        const teachers = useMemo(() => {
            const classTeacherId = gradeDefinitions[student.grade]?.classTeacherId;
            const classTeacher = staff.find(s => s.id === classTeacherId);
            
            const teacherList: { id: string; name: string }[] = [];
            if(classTeacher) teacherList.push({ id: classTeacher.id, name: `${classTeacher.firstName} ${classTeacher.lastName} (Class Teacher)` });

            (student.academicPerformance || []).flatMap(e => e.results).forEach(res => {
                const subjDef = gradeDefinitions[student.grade]?.subjects.find(s => s.name === res.subject);
                if(subjDef) {
                    // This is a simplified assumption. Real-world would need a direct teacher-subject link.
                }
            });

            return teacherList;
        }, [staff, gradeDefinitions, student.grade, student.academicPerformance]);

        const [message, setMessage] = useState('');
        const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]?.id || '');
        const [isSending, setIsSending] = useState(false);

        const handleSendMessage = async () => {
            if(!message || !selectedTeacher) return;
            setIsSending(true);
            const teacher = staff.find(s => s.id === selectedTeacher);
            const success = await onSendMessage({
                fromParentId: user.uid,
                fromParentName: user.displayName,
                toTeacherId: selectedTeacher,
                toTeacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
                childId: student.id,
                childName: student.name,
                message: message
            });
            if(success) setMessage('');
            setIsSending(false);
        };

        return (
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl transition-all duration-300">
                <button onClick={() => setExpandedChild(isExpanded ? null : student.id)} className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full shadow-lg border-2 border-white/50">
                            <PhotoWithFallback src={student.photographUrl} alt={student.name} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{student.name}</h3>
                            {/* FIX: Corrected typo from `student.roll No` to `student.rollNo` to match the Student interface. */}
                            <p className="text-slate-700 font-semibold">{student.grade} - Roll No: {student.rollNo}</p>
                        </div>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                    <div className="p-4 border-t border-white/30 space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ActionCard title="Today's Attendance" onClick={() => setViewingAttendanceFor(student)} icon={<CalendarDaysIcon className="w-6 h-6 text-sky-600"/>}>
                                {attendanceStatus ? (<span className={`font-bold ${(attendanceStatus as unknown as string) === 'Present' ? 'text-emerald-700' : 'text-red-700'}`}>{(attendanceStatus as unknown as string)}</span>) : (<span className="text-slate-600">Not Marked</span>)}
                            </ActionCard>
                            <ActionCard title="Class Timetable" link="/portal/routine" state={{ grade: student.grade }} icon={<BookOpenIcon className="w-6 h-6 text-indigo-600"/>} />
                            <ActionCard title="Academic Calendar" link="/portal/calendar" icon={<CalendarDaysIcon className="w-6 h-6 text-teal-600"/>} />
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Digital Diary (Recent Homework)</h4>
                            {childHomework.length > 0 ? (
                                <div className="space-y-2">{childHomework.map(hw => (<div key={hw.id} className="p-3 bg-white/80 border border-white/40 rounded-md text-sm"><p className="font-semibold text-slate-800">{hw.subject} <span className="text-xs text-slate-600 font-normal ml-2">({hw.date})</span></p><p className="text-slate-700">{hw.assignmentDetails}</p></div>))}</div>
                            ) : <p className="text-sm text-slate-600 italic">No recent homework posted.</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ActionCard title="Academic Progress" link={`/portal/student/${student.id}/academics`} icon={<AcademicCapIcon className="w-6 h-6 text-rose-600"/>} />
                            <ActionCard title="Syllabus Tracker" link={`/portal/syllabus/${student.grade}`} icon={<SparklesIcon className="w-6 h-6 text-violet-600"/>} />
                        </div>
                        
                        <div>
                             <h4 className="font-bold text-slate-900 mb-2">Contact Teacher</h4>
                             <div className="p-4 bg-white/80 border border-white/40 rounded-md space-y-3">
                                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="form-select w-full" disabled={teachers.length === 0}>
                                    {teachers.length > 0 ? teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>) : <option>No teachers assigned</option>}
                                </select>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Write your message..." className="form-textarea w-full"></textarea>
                                <div className="text-right">
                                    <button onClick={handleSendMessage} disabled={isSending || !message || teachers.length === 0} className="btn btn-primary text-sm">
                                        {isSending ? <SpinnerIcon className="w-4 h-4" /> : null}
                                        {isSending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Parent Dashboard</h1>
                        <p className="text-slate-700 text-lg mt-1">Welcome, <span className="font-semibold text-sky-700">{user.displayName}</span>!</p>
                    </div>
                    <button onClick={() => setIsLinkModalOpen(true)} className="btn btn-secondary flex-shrink-0 !bg-white/80 !border-white/40 backdrop-blur-sm hover:!bg-white"><PlusIcon className="w-5 h-5"/> Link a Child</button>
                </div>
                
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-3">Notice Board</h2>
                    {news.slice(0, 3).map(item => (<div key={item.id} className="border-b border-white/30 last:border-b-0 py-2"><p className="text-sm text-slate-600">{item.date}</p><p className="font-semibold text-slate-800">{item.title}</p></div>))}
                    <Link to="/news" className="text-sm font-semibold text-sky-700 hover:underline mt-3 inline-block">View All News &rarr;</Link>
                </div>

                {linkedStudents.length > 0 ? (
                    <div className="space-y-6">{linkedStudents.map(student => (<ChildSection key={student.id} student={student} />))}</div>
                ) : (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl"><p className="text-slate-800 text-lg font-semibold">No Students Linked</p><p className="text-slate-700 mt-2 max-w-md mx-auto">Your account is active. Click 'Link a Child' to connect your account to your student's profile. Your request will be sent to the school for approval.</p></div>
                )}
            </div>
            
            <LinkChildModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} onSubmit={onLinkChild} parentRelationship={user.registrationDetails?.relationship || 'Parent'}/>

            {viewingAttendanceFor && (<AttendanceCalendarModal student={viewingAttendanceFor} onClose={() => setViewingAttendanceFor(null)} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} />)}
        </>
    );
};

export default ParentDashboardPage;
