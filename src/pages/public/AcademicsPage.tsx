
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

const { Link } = ReactRouterDOM as any;

interface AcademicsPageProps {
    user: User | null;
}

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


const AcademicsPage: React.FC<AcademicsPageProps> = ({ user }) => {
    return (
        <div className="relative py-16 overflow-hidden bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-800">
                        <EditableContent id="academics_title" defaultContent="Academics" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600">
                        <EditableContent id="academics_subtitle" defaultContent="Explore our academic achievements and detailed curriculum." type="text" user={user} />
                    </div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SubPageCard
                        icon={<AcademicCapIcon className="w-12 h-12" />}
                        title="Academic Achievements"
                        description="View our students' outstanding performance in the MBSE HSLC Board Examinations over the years."
                        link="/achievements/academic"
                    />
                    <SubPageCard
                        icon={<BookOpenIcon className="w-12 h-12" />}
                        title="Our Curriculum"
                        description="Discover the comprehensive list of subjects offered for each class, from Nursery to Class X."
                        link="/academics/curriculum"
                    />
                </div>
            </div>
        </div>
    );
};
export default AcademicsPage;
