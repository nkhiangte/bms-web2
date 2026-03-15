import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { UsersIcon, AcademicCapIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { Link } = ReactRouterDOM as any;

export interface Achievement {
    id: string;
    title: string;
    description: string;
    year: string;
    category: 'Academic' | 'Sports' | 'Science & Maths' | 'Quiz' | 'Other';
    studentName: string;
    imageUrl?: string;
}

const CATEGORIES = ['All', 'Academic', 'Sports', 'Science & Maths', 'Quiz', 'Other'] as const;

const CATEGORY_COLORS: Record<string, string> = {
    Academic:        'bg-sky-100 text-sky-700 border-sky-200',
    Sports:          'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Science & Maths': 'bg-violet-100 text-violet-700 border-violet-200',
    Quiz:            'bg-amber-100 text-amber-700 border-amber-200',
    Other:           'bg-slate-100 text-slate-600 border-slate-200',
};

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

const AchievementsPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        const unsub = db.collection('achievements')
            .orderBy('year', 'desc')
            .onSnapshot(
                snap => { setAchievements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement))); setLoading(false); },
                () => setLoading(false)
            );
        return () => unsub();
    }, []);

    const filtered = activeCategory === 'All'
        ? achievements
        : achievements.filter(a => a.category === activeCategory);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
            {/* Hero */}
            <div className="py-20" style={{ background: 'var(--bg-base)' }}>
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

            {/* Dynamic Achievements Section */}
            <div className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-800">Hall of Fame</h2>
                        <p className="mt-2 text-slate-500">Celebrating our students' accomplishments</p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                                    activeCategory === cat
                                        ? 'bg-sky-600 text-white border-sky-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                            <p className="text-slate-500 text-lg">No achievements found in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {filtered.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                                    )}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}>
                                                {item.category}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">{item.year}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{item.title}</h3>
                                        {item.studentName && (
                                            <p className="text-sm font-semibold text-sky-600 mb-2">🎓 {item.studentName}</p>
                                        )}
                                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;
