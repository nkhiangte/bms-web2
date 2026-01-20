import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { UsersIcon, AcademicCapIcon } from '../../components/Icons';

const { Link } = ReactRouterDOM as any;

const SubPageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string; }> = ({ icon, title, description, link }) => (
    <Link to={link} className="group block bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
        <div className="text-sky-500 mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-4 inline-block font-semibold text-sky-600 group-hover:text-sky-800">
            View Details &rarr;
        </div>
    </Link>
);

const AchievementsPage: React.FC = () => {
    return (
        <div className="relative py-16 overflow-hidden bg-slate-50 min-h-[70vh]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Achievements</h1>
                    <p className="mt-4 text-lg text-slate-600">Explore our students' achievements in various fields.</p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SubPageCard
                        icon={<AcademicCapIcon className="w-12 h-12" />}
                        title="Academic Achievements"
                        description="View our students' outstanding performance in the MBSE HSLC Board Examinations over the years."
                        link="/achievements/academic"
                    />
                    <SubPageCard
                        icon={<UsersIcon className="w-12 h-12" />}
                        title="Sports Achievements"
                        description="Excellence in athletics, teamwork, and sportsmanship. View our victories in various competitions."
                        link="/achievements/sports"
                    />
                    <SubPageCard
                        icon={<AcademicCapIcon className="w-12 h-12" />}
                        title="Achievements in Science & Maths"
                        description="A hub of innovation and discovery. See our students' award-winning projects and participation."
                        link="/achievements/science"
                    />
                     <SubPageCard
                        icon={<AcademicCapIcon className="w-12 h-12" />}
                        title="Quiz"
                        description="Excellence in knowledge, critical thinking, and quick decision-making skills in various quiz competitions."
                        link="/achievements/quiz"
                    />
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;