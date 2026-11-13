import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Syllabus, GradeDefinition, Grade, SyllabusTopic } from '@/types';
import { BookOpenIcon, BackIcon, HomeIcon } from '@/components/Icons';
import { normalizeSubjectName } from '@/utils';

const { useParams, Link } = ReactRouterDOM as any;

interface SyllabusPageProps {
    syllabus: Syllabus[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

type SyllabusData = {
    topics: SyllabusTopic[];
    statusCounts: Partial<Record<SyllabusTopic['status'], number>>;
};

const SyllabusPage: React.FC<SyllabusPageProps> = ({ syllabus, gradeDefinitions }) => {
    const { grade } = useParams() as { grade: string };
    const decodedGrade = grade ? decodeURIComponent(grade) as Grade : undefined;

    const subjectsForGrade = useMemo(() => {
        if (!decodedGrade) return [];
        return gradeDefinitions[decodedGrade]?.subjects || [];
    }, [decodedGrade, gradeDefinitions]);

    const syllabusBySubject = useMemo<Record<string, SyllabusData>>(() => {
        const gradeSyllabus = syllabus.filter(s => s.grade === decodedGrade);
        const result: Record<string, SyllabusData> = {};
        subjectsForGrade.forEach(subjectDef => {
            const normDefName = normalizeSubjectName(subjectDef.name);
            const subjectSyllabus = gradeSyllabus.find(s => normalizeSubjectName(s.subject) === normDefName);
            const topics = subjectSyllabus?.topics || [];
            const statusCounts = topics.reduce((acc, topic) => {
                acc[topic.status] = (acc[topic.status] || 0) + 1;
                return acc;
            }, {} as Partial<Record<SyllabusTopic['status'], number>>);
            result[subjectDef.name] = { topics, statusCounts };
        });
        return result;
    }, [decodedGrade, syllabus, subjectsForGrade]);

    if (!decodedGrade) return <div className="bg-[#0B1F3A] min-h-screen text-white p-8">Invalid Grade.</div>;

    return (
        <div className="bg-[#0B1F3A] py-12 sm:py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <button onClick={() => window.history.back()} className="flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#DFC06B] hover:text-white transition-colors">
                            <BackIcon className="w-5 h-5" /> Back
                        </button>
                        <Link to="/" className="flex items-center gap-2 min-h-[44px] text-sm font-semibold text-white/80 hover:text-white transition-colors">
                            <HomeIcon className="w-5 h-5" /> Home
                        </Link>
                    </div>
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Academic Session Syllabus</p>
                        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">Syllabus for {decodedGrade}</h1>
                        <p className="mt-2 text-base sm:text-lg text-white/80">Track the curriculum progress for each subject.</p>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(syllabusBySubject).map(([subject, data]) => {
                            const { topics, statusCounts } = data as SyllabusData;
                            const totalTopics = topics.length;
                            const completed = statusCounts['Completed'] || 0;
                            const progress = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
                            return (
                                <div key={subject} className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl shadow-md">
                                    <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                                        <BookOpenIcon className="w-7 h-7 text-[#DFC06B]" />
                                        {subject}
                                    </h2>
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                                            <span className="text-white/75">Progress</span>
                                            <span className="font-tabular text-[#DFC06B]">{progress}% Complete</span>
                                        </div>
                                        <div className="w-full bg-[#07162B] rounded-full h-2.5 border border-white/10">
                                            <div className="bg-[#C9A84C] h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="font-tabular text-xs text-white/60 mt-1 text-right">{completed} of {totalTopics} topics completed</div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {topics.length > 0 ? topics.map((topic, index) => {
                                            const isCompleted = topic.status === 'Completed';
                                            const isInProgress = topic.status === 'In Progress';
                                            const statusColor = isCompleted ? 'text-[#DFC06B]' : isInProgress ? 'text-white' : 'text-white/50';
                                            const dotColor = isCompleted ? 'bg-[#C9A84C]' : isInProgress ? 'bg-white' : 'bg-white/30';
                                            return (
                                                <div key={index} className="flex items-center gap-3 p-2.5 bg-[#0B1F3A] border border-white/10 rounded-lg">
                                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                                                    <span className="flex-grow text-white/90 text-sm">{topic.name}</span>
                                                    <span className={`text-xs font-bold ${statusColor}`}>{topic.status}</span>
                                                </div>
                                            );
                                        }) : <p className="text-white/55 italic text-sm">No topics added for this subject.</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SyllabusPage;
