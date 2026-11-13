import React from 'react';
import { Grade, GradeDefinition } from '@/types';
import { GRADES_LIST } from '@/constants';

interface CurriculumPageProps {
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

const CurriculumPage: React.FC<CurriculumPageProps> = ({ gradeDefinitions }) => {
    return (
        <div className="relative py-12 sm:py-16 overflow-hidden bg-[#0B1F3A] min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Nursery to Class X &middot; MBSE Syllabus</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Our Curriculum</h1>
                    <p className="mt-4 text-base sm:text-lg text-white/80 max-w-3xl mx-auto">
                        A comprehensive list of subjects offered from Nursery to Class X, following the syllabus prescribed by the Mizoram Board of School Education (MBSE).
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {GRADES_LIST.map(grade => {
                        const gradeDef = gradeDefinitions[grade];
                        return (
                            <div key={grade} className="bg-[#132D52] border border-[#C9A84C]/35 rounded-xl shadow-lg p-6 transition-all hover:-translate-y-1 hover:border-[#C9A84C]">
                                <h3 className="text-2xl font-extrabold text-[#DFC06B] mb-4">{grade}</h3>
                                {Array.isArray(gradeDef?.subjects) && gradeDef.subjects.length > 0 ? (
                                    <ul className="space-y-2">
                                        {gradeDef.subjects.map(subject => (
                                            <li key={subject.name} className="flex items-center text-white/90 text-sm sm:text-base">
                                                <span className="w-2 h-2 bg-[#C9A84C] rounded-full mr-3 flex-shrink-0" />
                                                {subject.name}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-white/55 italic text-sm">Curriculum details coming soon.</p>
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
