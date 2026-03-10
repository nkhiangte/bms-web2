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

    if (!decodedGrade) return <div className="bg-black min-h-screen text-white p-8">Invalid Grade.</div>;

    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <button onClick={()=>window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                            <BackIcon className="w-5 h-5"/> Back
                        </button>
                        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                            <HomeIcon className="w-5 h-5"/> Home
                        </Link>
                    </div>
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-white">Syllabus for {decodedGrade}</h1>
                        <p className="mt-2 text-lg text-slate-400">Track the curriculum progress for each subject.</p>
                    </div>
                    <div className="space-y-8">
                        {Object.entries(syllabusBySubject).map(([subject, data]) => {
                            const { topics, statusCounts } = data as SyllabusData;
                            const totalTopics = topics.length;
                            const completed = statusCounts['Completed'] || 0;
                            const progress = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
                            return (
                                <div key={subject} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-md">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <BookOpenIcon className="w-7 h-7 text-sky-400"/>
                                        {subject}
                                    </h2>
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                            <span className="text-slate-400">Progress</span>
                                            <span className="text-sky-400">{progress}% Complete</span>
                                        </div>
                                        <div className="w-full bg-zinc-700 rounded-full h-2.5">
                                            <div className="bg-sky-500 h-2.5 rounded-full transition-all" style={{width:`${progress}%`}}></div>
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1 text-right">{completed} of {totalTopics} topics completed</div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {topics.length > 0 ? topics.map((topic, index) => {
                                            let statusColor = '';
                                            if (topic.status === 'Completed') statusColor = 'text-emerald-400';
                                            else if (topic.status === 'In Progress') statusColor = 'text-amber-400';
                                            else statusColor = 'text-zinc-500';
                                            const dotColor = statusColor.replace('text-','bg-');
                                            return (
                                                <div key={index} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
                                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></div>
                                                    <span className="flex-grow text-slate-300">{topic.name}</span>
                                                    <span className={`text-xs font-semibold ${statusColor}`}>{topic.status}</span>
                                                </div>
                                            );
                                        }) : <p className="text-zinc-500 italic text-sm">No topics added for this subject.</p>}
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
