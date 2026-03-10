import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { UsersIcon, AcademicCapIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

const SubPageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string }> = ({ icon, title, description, link }) => (
    <Link to={link} className="group block public-feature-card">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--gold)' }}>
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        <div className="mt-4 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: 'var(--gold)' }}>
            View Details →
        </div>
    </Link>
);

const AchievementsPage: React.FC = () => (
    <div className="py-20 min-h-[70vh]" style={{ background: 'var(--bg-base)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="section-label mb-3">Our Students</div>
                <h1 className="section-heading">Achievements</h1>
                <div className="gold-rule mt-4 mb-5" />
                <p className="section-subtext max-w-xl mx-auto">Explore our students' achievements in various fields.</p>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Academic Achievements" description="View our students' outstanding performance in the MBSE HSLC Board Examinations over the years." link="/achievements/academic" />
                <SubPageCard icon={<UsersIcon className="w-6 h-6" />} title="Sports Achievements" description="Excellence in athletics, teamwork, and sportsmanship. View our victories in various competitions." link="/achievements/sports" />
                <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Science & Maths" description="A hub of innovation and discovery. See our students' award-winning projects and participation." link="/achievements/science" />
                <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Quiz" description="Excellence in knowledge, critical thinking, and quick decision-making skills in various quiz competitions." link="/achievements/quiz" />
            </div>
        </div>
    </div>
);

export default AchievementsPage;
