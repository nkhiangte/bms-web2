import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { UsersIcon, AcademicCapIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { Link } = ReactRouterDOM as any;

interface Achievement {
    id: string;
    title: string;
    description: string;
    year: string;
    category: 'Academic' | 'Sports' | 'Science & Maths' | 'Quiz' | 'Other';
    studentName: string;
    imageUrl?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Academic':      'bg-sky-100 text-sky-700 border-sky-200',
    'Sports':        'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Science & Maths': 'bg-violet-100 text-violet-700 border-violet-200',
    'Quiz':          'bg-amber-100 text-amber-700 border-amber-200',
    'Other':         'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_ORDER = ['Academic', 'Sports', 'Science & Maths', 'Quiz', 'Other'];

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

const AchievementCard: React.FC<{ item: Achievement }> = ({ item }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        {item.imageUrl && (
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
        )}
        <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other']}`}>
                    {item.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">{item.year}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-snug mb-1">{item.title}</h3>
            {item.studentName && (
                <p className="text-sm text-sky-600 font-medium mb-2">🎓 {item.studentName}</p>
            )}
            {item.description && (
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{item.description}</p>
            )}
        </div>
    </div>
);

const AchievementsPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        const unsub = db.collection('achievements')
            .orderBy('year', 'desc')
            .onSnapshot(
                snap => {
                    setAchievements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
                    setLoading(false);
                },
                err => {
                    console.error('Achievements load error:', err);
                    setLoading(false);
                }
            );
        return () => unsub();
    }, []);

    const categories = ['All', ...CATEGORY_ORDER.filter(cat =>
        achievements.some(a => a.category === cat)
    )];

    const filtered = activeCategory === 'All'
        ? achievements
        : achievements.filter(a => a.category === activeCategory);

    // Group by category for "All" view
    const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
        const items = achievements.filter(a => a.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {} as Record<string, Achievement[]>);

    return (
        <div className="py-20 min-h-[70vh]" style={{ background: 'var(--bg-base)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="section-label mb-3">Our Students</div>
                    <h1 className="section-heading">Achievements</h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext max-w-xl mx-auto">Explore our students' achievements in various fields.</p>
                </div>

                {/* Sub-page cards */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                    <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Academic Achievements" description="View our students' outstanding performance in the MBSE HSLC Board Examinations over the years." link="/achievements/academic" />
                    <SubPageCard icon={<UsersIcon className="w-6 h-6" />} title="Sports Achievements" description="Excellence in athletics, teamwork, and sportsmanship. View our victories in various competitions." link="/achievements/sports" />
                    <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Science & Maths" description="A hub of innovation and discovery. See our students' award-winning projects and participation." link="/achievements/science" />
                    <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Quiz" description="Excellence in knowledge, critical thinking, and quick decision-making skills in various quiz competitions." link="/achievements/quiz" />
                </div>

                {/* Hall of Fame */}
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="section-label mb-3">Recognition</div>
                        <h2 className="section-heading">Hall of Fame</h2>
                        <div className="gold-rule mt-4 mb-5" />
                        <p className="section-subtext max-w-xl mx-auto">Celebrating our students' individual and team accomplishments across all disciplines.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
                        </div>
                    ) : achievements.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <p className="text-lg">No achievements added yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Category filter tabs */}
                            <div className="flex flex-wrap justify-center gap-2 mb-10">
                                {categories.map(cat => (
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

                            {/* Filtered single-category grid */}
                            {activeCategory !== 'All' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filtered.map(item => (
                                        <AchievementCard key={item.id} item={item} />
                                    ))}
                                </div>
                            ) : (
                                /* Grouped by category */
                                <div className="space-y-14">
                                    {Object.entries(grouped).map(([cat, items]) => (
                                        <div key={cat}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <h3 className="text-xl font-bold text-slate-800">{cat}</h3>
                                                <div className="flex-1 h-px bg-slate-200" />
                                                <span className="text-sm text-slate-400">{items.length} record{items.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {items.map(item => (
                                                    <AchievementCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;
