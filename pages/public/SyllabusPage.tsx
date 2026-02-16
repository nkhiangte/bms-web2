

import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Syllabus, GradeDefinition, Grade, SyllabusTopic } from '../../types';
import { BookOpenIcon, BackIcon, HomeIcon } from '../../components/Icons';

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
    // FIX: Changed useParams generic call to a result cast to avoid "Untyped function calls may not accept type arguments" error.
    const { grade } = useParams() as { grade: string };
    const decodedGrade = grade ? decodeURIComponent(grade) as Grade : undefined;

    const subjectsForGrade = useMemo(() => {
        if (!decodedGrade) return [];
        return gradeDefinitions[decodedGrade]?.subjects || [];
    }, [decodedGrade, gradeDefinitions]);

    // FIX: Add explicit type to useMemo to ensure TypeScript correctly infers the shape of syllabusBySubject, resolving destructuring errors.
    const syllabusBySubject = useMemo<Record<string, SyllabusData>>(() => {
        const gradeSyllabus = syllabus.filter(s => s.grade === decodedGrade);
        
        const result: Record<string, SyllabusData> = {};

        subjectsForGrade.forEach(subjectDef => {
            const subjectSyllabus = gradeSyllabus.find(s => s.subject === subjectDef.name);
            const topics = subjectSyllabus?.topics || [];
            const statusCounts = topics.reduce((acc, topic) => {
                acc[topic.status] = (acc[topic.status] || 0) + 1;
                return acc;
            }, {} as Partial<Record<SyllabusTopic['status'], number>>);
            result[subjectDef.name] = { topics, statusCounts };
        });

        return result;
    }, [decodedGrade, syllabus, subjectsForGrade]);

    if (!decodedGrade) return <div>Invalid Grade.</div>;

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
                        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
                    </div>
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-slate-800">Syllabus for {decodedGrade}</h1>
                        <p className="mt-2 text-lg text-slate-600">Track the curriculum progress for each subject.</p>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(syllabusBySubject).map(([subject, data]) => {
                            const { topics, statusCounts } = data as SyllabusData;
                            const totalTopics = topics.length;
                            const completed = statusCounts['Completed'] || 0;
                            const progress = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
                            
                            return (
                                <div key={subject} className="bg-white p-6 rounded-lg shadow-md border">
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <BookOpenIcon className="w-7 h-7 text-sky-600"/>
                                        {subject}
                                    </h2>
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                            <span className="text-slate-600">Progress</span>
                                            <span className="text-sky-700">{progress}% Complete</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 text-right">{completed} of {totalTopics} topics completed</div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {topics.map((topic, index) => {
                                            let statusColor = '';
                                            if (topic.status === 'Completed') statusColor = 'text-emerald-500';
                                            else if (topic.status === 'In Progress') statusColor = 'text-amber-500';
                                            else statusColor = 'text-slate-400';
                                            
                                            return (
                                                <div key={index} className="flex items-center gap-3 p-2 bg-slate-50/50 rounded">
                                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor.replace('text-', 'bg-')}`}></div>
                                                    <span className="flex-grow text-slate-700">{topic.name}</span>
                                                    <span className={`text-xs font-semibold ${statusColor}`}>{topic.status}</span>
                                                </div>
                                            );
                                        })}
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