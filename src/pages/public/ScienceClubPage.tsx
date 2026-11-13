import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

const SubPageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string }> = ({ icon, title, description, link }) => (
    <Link to={link} className="group block bg-white border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#C9A84C] transition-all transform hover:-translate-y-1">
        <div className="text-[#0B1F3A] group-hover:text-[#8E6D1B] transition-colors mb-4">{icon}</div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] group-hover:text-[#8E6D1B] transition-colors">{title}</h3>
        <p className="mt-2 text-[#132D52]/80 text-sm sm:text-base">{description}</p>
        <div className="mt-4 inline-block font-bold text-[#8E6D1B] group-hover:text-[#0B1F3A] transition-colors">
            Learn More &rarr;
        </div>
    </Link>
);

const ScienceClubPage: React.FC = () => {
    const achievements = [
        { title:"SLSMEE", description:"State Level Science, Mathematics & Environment Exhibition achievements.", link:"/achievements/science/slsmee", icon:<AcademicCapIcon className="w-12 h-12" /> },
        { title:"INSPIRE Award MANAK", description:"Recognitions from the national programme for inspiring scientific talent.", link:"/achievements/science/inspire-award", icon:<AcademicCapIcon className="w-12 h-12" /> },
        { title:"National Children's Science Congress", description:"Success stories from the NCSC platform for young scientists.", link:"/achievements/science/ncsc", icon:<AcademicCapIcon className="w-12 h-12" /> },
        { title:"Science Tours", description:"Educational tours and participation in national science festivals.", link:"/achievements/science/science-tour", icon:<BookOpenIcon className="w-12 h-12" /> },
        { title:"Incentive Awards", description:"Awards for proficiency in Science & Maths in board exams.", link:"/achievements/science/incentive-awards", icon:<AcademicCapIcon className="w-12 h-12" /> },
        { title:"Mathematics Competition", description:"Success in the State-Level Mathematics Competition organized by MMS.", link:"/achievements/science/mathematics-competition", icon:<AcademicCapIcon className="w-12 h-12" /> },
    ];
    return (
        <div className="relative py-12 md:py-16 overflow-hidden bg-[#F4F7FB] min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C]/50 px-3 py-1 rounded-full mb-3">
                        STEM Excellence
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">Achievements in Science &amp; Mathematics</h1>
                    <p className="mt-3 text-base sm:text-lg text-[#132D52]/80 max-w-2xl mx-auto">Explore our students&apos; remarkable achievements in various science and mathematics competitions and programs.</p>
                </div>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {achievements.map(a => <SubPageCard key={a.title} icon={a.icon} title={a.title} description={a.description} link={a.link} />)}
                </div>
                <div className="mt-12 text-center pt-8 border-t border-[#0B1F3A]/15">
                    <Link to="/gallery" state={{initialPath:['By Event/Occasion','Science Fair']}} className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-[#0B1F3A] text-white font-bold text-base rounded-xl shadow-md hover:bg-[#132D52] border-b-2 border-[#C9A84C] transition-all">
                        View Science Gallery
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default ScienceClubPage;
