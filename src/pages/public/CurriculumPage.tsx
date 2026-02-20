
import React from 'react';
import { Grade, GradeDefinition } from '@/types';
import { GRADES_LIST } from '@/constants';

interface CurriculumPageProps {
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

const CurriculumPage: React.FC<CurriculumPageProps> = ({ gradeDefinitions }) => {
    return (
        <div className="relative py-16 overflow-hidden bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Our Curriculum</h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
                        A comprehensive list of subjects offered from Nursery to Class X, following the syllabus as prescribed by the Mizoram Board of School Education (MBSE).
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {GRADES_LIST.map(grade => {
                        const gradeDef = gradeDefinitions[grade];
                        return (
                            <div key={grade} className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:-translate-y-1 hover:shadow-xl">
                                <h3 className="text-2xl font-bold text-sky-700 mb-4">{grade}</h3>
                                {Array.isArray(gradeDef?.subjects) && gradeDef.subjects.length > 0 ? (
                                    <ul className="space-y-2">
                                        {gradeDef.subjects.map(subject => (
                                            <li key={subject.name} className="flex items-center text-slate-700">
                                                <span className="w-2 h-2 bg-sky-500 rounded-full mr-3 flex-shrink-0"></span>
                                                {subject.name}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-500 italic">Curriculum details coming soon.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default CurriculumPage;
