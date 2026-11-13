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
    'Academic': 'bg-[#0B1F3A] text-[#DFC06B] border-[#C9A84C]',
    'Sports': 'bg-[#FBF6E8] text-[#8E6D1B] border-[#C9A84C]',
    'Science & Maths': 'bg-[#0B1F3A] text-white border-[#0B1F3A]',
    'Quiz': 'bg-[#FBF6E8] text-[#0B1F3A] border-[#C9A84C]',
    'Other': 'bg-[#F4F7FB] text-[#0B1F3A] border-[#0B1F3A]/20',
};

const CATEGORY_ORDER = ['Academic', 'Sports', 'Science & Maths', 'Quiz', 'Other'];

const SubPageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string }> = ({ icon, title, description, link }) => (
    <Link to={link} className="group block public-feature-card">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 bg-[#07162B] border border-[#C9A84C]/40 text-[#DFC06B]">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-white/75">{description}</p>
        <div className="mt-4 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all text-[#DFC06B]">
            View Details &rarr;
        </div>
    </Link>
);

const AchievementCard: React.FC<{ item: Achievement }> = ({ item }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const hasValidImage = Boolean(
        item.imageUrl &&
        !imgFailed &&
        !item.imageUrl.includes('placeholder')
    );

    return (
        <div className="bg-white rounded-xl border border-[#C9A84C]/35 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {hasValidImage && (
                <div className="aspect-[4/3] overflow-hidden bg-[#07162B] relative">
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed(true)}
                    />
                </div>
            )}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other']}`}>
                        {item.category}
                    </span>
                    <span className="font-tabular text-xs text-[#0B1F3A]/60 font-bold">{item.year}</span>
                </div>
                <h3 className="font-extrabold text-[#0B1F3A] text-base leading-snug mb-1">{item.title}</h3>
                {item.studentName && (
                    <p className="text-sm text-[#8E6D1B] font-bold mb-2">{item.studentName}</p>
                )}
                {item.description && (
                    <p className="text-sm text-[#0B1F3A]/75 leading-relaxed flex-1">{item.description}</p>
                )}
            </div>
        </div>
    );
};

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

    const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
        const items = achievements.filter(a => a.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {} as Record<string, Achievement[]>);

    return (
        <div className="py-16 min-h-[70vh] bg-[#0B1F3A]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-14">
                    <div className="section-label mb-3">Our Students</div>
                    <h1 className="section-heading">Achievements</h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext max-w-xl mx-auto">Explore our students&apos; achievements across academics, sports, and competitions.</p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                    <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Academic Achievements" description="View our students' outstanding performance in the MBSE HSLC Board Examinations over the years." link="/achievements/academic" />
                    <SubPageCard icon={<UsersIcon className="w-6 h-6" />} title="Sports Achievements" description="Excellence in athletics, teamwork, and sportsmanship. View our victories in various competitions." link="/achievements/sports" />
                    <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Science & Maths" description="A hub of innovation and discovery. See our students' award-winning projects and participation." link="/achievements/science" />
                    <SubPageCard icon={<AcademicCapIcon className="w-6 h-6" />} title="Quiz" description="Excellence in knowledge, critical thinking, and quick decision-making skills in various quiz competitions." link="/achievements/quiz" />
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="section-label mb-3">Recognition</div>
                        <h2 className="section-heading">Hall of Fame</h2>
                        <div className="gold-rule mt-4 mb-5" />
                        <p className="section-subtext max-w-xl mx-auto">Celebrating our students&apos; individual and team accomplishments across all disciplines.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-white/20 border-t-[#C9A84C] rounded-full animate-spin" />
                        </div>
                    ) : achievements.length === 0 ? (
                        <div className="text-center py-16 text-white/60">
                            <p className="text-lg">No achievements added yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap justify-center gap-2 mb-10">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 min-h-[40px] rounded-full text-sm font-bold border transition-all ${
                                            activeCategory === cat
                                                ? 'bg-[#C9A84C] text-[#0B1F3A] border-[#C9A84C]'
                                                : 'bg-[#132D52] text-white border-white/20 hover:border-[#C9A84C]'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {activeCategory !== 'All' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filtered.map(item => (
                                        <AchievementCard key={item.id} item={item} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-14">
                                    {Object.entries(grouped).map(([cat, items]) => (
                                        <div key={cat}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <h3 className="text-xl font-extrabold text-white">{cat}</h3>
                                                <div className="flex-1 h-px bg-[#C9A84C]/30" />
                                                <span className="font-tabular text-sm text-[#DFC06B]">{items.length} record{items.length !== 1 ? 's' : ''}</span>
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
