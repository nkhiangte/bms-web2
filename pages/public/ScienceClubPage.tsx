import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon } from '../../components/Icons';

const { Link } = ReactRouterDOM as any;

const SubPageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string; }> = ({ icon, title, description, link }) => (
    <Link to={link} className="group block bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
        <div className="text-sky-500 mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-4 inline-block font-semibold text-sky-600 group-hover:text-sky-800">
            Learn More &rarr;
        </div>
    </Link>
);

const ScienceClubPage: React.FC = () => {
    const achievements = [
        {
            title: "SLSMEE",
            description: "State Level Science, Mathematics & Environment Exhibition achievements.",
            link: "/achievements/science/slsmee",
            icon: <AcademicCapIcon className="w-12 h-12" />
        },
        {
            title: "INSPIRE Award MANAK",
            description: "Recognitions from the national programme for inspiring scientific talent.",
            link: "/achievements/science/inspire-award",
            icon: <AcademicCapIcon className="w-12 h-12" />
        },
        {
            title: "National Children’s Science Congress",
            description: "Success stories from the NCSC platform for young scientists.",
            link: "/achievements/science/ncsc",
            icon: <AcademicCapIcon className="w-12 h-12" />
        },
        {
            title: "Science Tours",
            description: "Educational tours and participation in national science festivals.",
            link: "/achievements/science/science-tour",
            icon: <BookOpenIcon className="w-12 h-12" />
        },
        {
            title: "Incentive Awards",
            description: "Awards for proficiency in Science & Maths in board exams.",
            link: "/achievements/science/incentive-awards",
            icon: <AcademicCapIcon className="w-12 h-12" />
        },
        {
            title: "Mathematics Competition",
            description: "Success in the State-Level Mathematics Competition organized by MMS.",
            link: "/achievements/science/mathematics-competition",
            icon: <AcademicCapIcon className="w-12 h-12" />
        }
    ];

    return (
        <div className="relative py-16 overflow-hidden bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Achievements in Science & Mathematics</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Explore our students' remarkable achievements in various science and mathematics competitions and programs.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievements.map(ach => (
                        <SubPageCard
                            key={ach.title}
                            icon={ach.icon}
                            title={ach.title}
                            description={ach.description}
                            link={ach.link}
                        />
                    ))}
                </div>
                 <div className="mt-12 text-center pt-8 border-t border-slate-200">
                    <Link
                        to="/gallery"
                        state={{ initialPath: ['By Event/Occasion', 'Science Fair'] }}
                        className="inline-block px-8 py-3 bg-sky-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-sky-700 transition-transform transform hover:-translate-y-1"
                    >
                        View Science Gallery
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ScienceClubPage;