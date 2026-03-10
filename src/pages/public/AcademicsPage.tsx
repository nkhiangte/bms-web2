import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

const { Link } = ReactRouterDOM as any;

interface AcademicsPageProps { user: User | null; }

const SubPageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string }> = ({ icon, title, description, link }) => (
    <Link
        to={link}
        className="group block public-feature-card"
    >
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

const AcademicsPage: React.FC<AcademicsPageProps> = ({ user }) => (
    <div className="py-20" style={{ background: 'var(--bg-base)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="section-label mb-3">Explore</div>
                <h1 className="section-heading">
                    <EditableContent id="academics_title" defaultContent="Academics" type="text" user={user} />
                </h1>
                <div className="gold-rule mt-4 mb-5" />
                <p className="section-subtext max-w-xl mx-auto">
                    <EditableContent id="academics_subtitle" defaultContent="Explore our academic achievements and detailed curriculum." type="text" user={user} />
                </p>
            </div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Academic Achievements" description="View our students' outstanding performance in the MBSE HSLC Board Examinations over the years." link="/achievements/academic" />
                <SubPageCard icon={<BookOpenIcon className="w-6 h-6" />} title="Our Curriculum" description="Discover the comprehensive list of subjects offered for each class, from Nursery to Class X." link="/academics/curriculum" />
            </div>
        </div>
    </div>
);

export default AcademicsPage;
