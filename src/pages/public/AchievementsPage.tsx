import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight, Award, GraduationCap, Medal } from 'lucide-react';
import { UsersIcon, AcademicCapIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';
import { HSLCResultSummary } from '@/types';

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

const STATIC_HSLC_SUMMARY: Pick<HSLCResultSummary, 'year' | 'appeared' | 'passed' | 'passPercentage' | 'distinction'>[] = [
    { year: 2025, appeared: 41, passed: 38, passPercentage: '92.68%', distinction: 9 },
    { year: 2024, appeared: 37, passed: 36, passPercentage: '97.30%', distinction: 17 },
    { year: 2023, appeared: 46, passed: 43, passPercentage: '93.48%', distinction: 11 },
    { year: 2022, appeared: 42, passed: 42, passPercentage: '100%', distinction: 17 },
    { year: 2021, appeared: 34, passed: 34, passPercentage: '100%', distinction: 21 },
    { year: 2020, appeared: 38, passed: 37, passPercentage: '97.37%', distinction: 8 },
    { year: 2019, appeared: 30, passed: 30, passPercentage: '100%', distinction: 14 },
    { year: 2018, appeared: 33, passed: 33, passPercentage: '100%', distinction: 25 },
    { year: 2017, appeared: 45, passed: 44, passPercentage: '97.78%', distinction: 17 },
    { year: 2016, appeared: 21, passed: 21, passPercentage: '100%', distinction: 6 },
    { year: 2015, appeared: 28, passed: 28, passPercentage: '100%', distinction: 8 },
    { year: 2014, appeared: 30, passed: 30, passPercentage: '100%', distinction: 3 },
    { year: 2013, appeared: 20, passed: 20, passPercentage: '100%', distinction: 4 },
    { year: 2012, appeared: 11, passed: 11, passPercentage: '100%', distinction: 6 },
    { year: 2011, appeared: 11, passed: 11, passPercentage: '100%', distinction: 0 },
    { year: 2010, appeared: 10, passed: 10, passPercentage: '100%', distinction: 3 },
    { year: 2009, appeared: 14, passed: 14, passPercentage: '100%', distinction: 4 },
    { year: 2008, appeared: 6, passed: 6, passPercentage: '100%', distinction: 2 },
];

const CATEGORY_ORDER = ['Academic', 'Science & Maths', 'Sports', 'Quiz', 'Other'];

const SecondarySubPageCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    link: string;
}> = ({ icon, title, description, link }) => (
    <Link
        to={link}
        className="group bg-[#10233F] hover:bg-[#132D52] border border-white/15 hover:border-[#C9A33B]/70 rounded-xl p-5 flex flex-col justify-between transition-colors"
    >
        <div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-[#07162B] border border-white/15 text-[#DFC06B]">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-1.5 text-white">{title}</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-white/70">{description}</p>
        </div>
        <div className="mt-4 text-xs font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all text-[#DFC06B]">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#8E6D1B]">
                        {item.category}
                    </span>
                    <span className="font-tabular text-[#0B1F3A]/65 font-bold">{item.year}</span>
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
    const [hslcResults, setHslcResults] = useState(STATIC_HSLC_SUMMARY);
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

    useEffect(() => {
        const unsub = db.collection('hslc_results')
            .orderBy('year', 'desc')
            .onSnapshot(
                snap => {
                    const live = snap.docs.map(d => d.data() as HSLCResultSummary);
                    const merged = [...live];
                    STATIC_HSLC_SUMMARY.forEach(sr => {
                        if (!merged.some(m => m.year === sr.year)) {
                            merged.push(sr as HSLCResultSummary);
                        }
                    });
                    setHslcResults(merged.sort((a, b) => b.year - a.year));
                },
                () => setHslcResults(STATIC_HSLC_SUMMARY)
            );
        return () => unsub();
    }, []);

    const hslcMetrics = useMemo(() => {
        const totalAppeared = hslcResults.reduce((acc, r) => acc + (Number(r.appeared) || 0), 0);
        const totalPassed = hslcResults.reduce((acc, r) => acc + (Number(r.passed) || 0), 0);
        const totalDistinctions = hslcResults.reduce((acc, r) => acc + (Number(r.distinction) || 0), 0);
        const hundredPercentYears = hslcResults.filter(
            r => r.passPercentage === '100%' || (r.appeared > 0 && r.passed >= r.appeared)
        ).length;
        const overallPassRate = totalAppeared > 0 ? `${((totalPassed / totalAppeared) * 100).toFixed(1)}%` : '98.2%';
        const latestDistinctionYear = hslcResults.find(r => (Number(r.distinction) || 0) > 0)?.year || 2025;

        return {
            totalDistinctions,
            hundredPercentYears,
            overallPassRate,
            latestDistinctionYear,
        };
    }, [hslcResults]);

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

                <div className="text-center mb-12">
                    <div className="section-label mb-3">Our Students</div>
                    <h1 className="section-heading">Achievements</h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext max-w-xl mx-auto">
                        Led by two decades of MBSE HSLC board excellence and State Merit Rank honours, alongside STEM, sports, and quiz achievements.
                    </p>
                </div>

                {/* Flagship Academic Showcase + Secondary Disciplines */}
                <div className="max-w-5xl mx-auto mb-20 space-y-6">
                    {/* Prominent Flagship Card: Academic Achievements & HSLC Distinctions */}
                    <div className="bg-gradient-to-br from-[#132D52] to-[#0C203D] border-2 border-[#C9A33B] rounded-2xl p-6 sm:p-8 shadow-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#DFC06B]">
                                    Flagship Record &middot; Mizoram Board of School Education
                                </p>
                                <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    Academic Achievements &amp; HSLC Distinctions
                                </h2>
                                <p className="mt-2.5 text-sm sm:text-base text-white/80 leading-relaxed">
                                    Explore complete year-by-year MBSE HSLC board performance (2008&ndash;Present), State Top-10 Merit Rankers, and subject distinction honour rolls.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 flex-shrink-0">
                                <Link
                                    to="/achievements/academic"
                                    className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 bg-[#C9A33B] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-sm rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <span>Full HSLC Record</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to={`/achievements/academic/distinction-holders/${hslcMetrics.latestDistinctionYear}`}
                                    className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-[#C9A33B]/50 text-white font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <span>{hslcMetrics.latestDistinctionYear} Distinctions</span>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                            <div className="bg-[#07162B]/80 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between text-[#DFC06B] text-[11px] font-bold uppercase tracking-wider">
                                    <span>Distinctions</span>
                                    <Award className="w-3.5 h-3.5" />
                                </div>
                                <p className="mt-1.5 font-tabular text-2xl sm:text-3xl font-extrabold text-white">
                                    {hslcMetrics.totalDistinctions}
                                </p>
                            </div>
                            <div className="bg-[#07162B]/80 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between text-[#DFC06B] text-[11px] font-bold uppercase tracking-wider">
                                    <span>100% Pass Years</span>
                                    <GraduationCap className="w-3.5 h-3.5" />
                                </div>
                                <p className="mt-1.5 font-tabular text-2xl sm:text-3xl font-extrabold text-white">
                                    {hslcMetrics.hundredPercentYears}
                                </p>
                            </div>
                            <div className="bg-[#07162B]/80 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between text-[#DFC06B] text-[11px] font-bold uppercase tracking-wider">
                                    <span>Cumulative Pass</span>
                                    <Medal className="w-3.5 h-3.5" />
                                </div>
                                <p className="mt-1.5 font-tabular text-2xl sm:text-3xl font-extrabold text-[#DFC06B]">
                                    {hslcMetrics.overallPassRate}
                                </p>
                            </div>
                            <div className="bg-[#07162B]/80 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between text-[#DFC06B] text-[11px] font-bold uppercase tracking-wider">
                                    <span>State Top-10</span>
                                    <Award className="w-3.5 h-3.5" />
                                </div>
                                <p className="mt-1.5 font-tabular text-2xl sm:text-3xl font-extrabold text-white">
                                    4 Ranks
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/75">
                            <span>
                                Featured Merit Rankers: <strong className="text-white">Esther Tingbiakmuani</strong> (4th Rank, 2023) &middot; <strong className="text-white">Manngaihsangi</strong> (10th Rank, 2020)
                            </span>
                            <Link
                                to="/academics#achievements"
                                className="font-bold text-[#DFC06B] hover:text-white transition-colors"
                            >
                                View MBSE Chart on Academics &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Secondary Disciplines Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <SecondarySubPageCard
                            icon={<AcademicCapIcon className="w-5 h-5" />}
                            title="Science & Maths"
                            description="Award-winning STEM projects across INSPIRE MANAK, Science Congresses, and State Mathematics Contests."
                            link="/achievements/science"
                        />
                        <SecondarySubPageCard
                            icon={<UsersIcon className="w-5 h-5" />}
                            title="Sports Achievements"
                            description="Excellence in athletics, basketball, volleyball, teamwork, and inter-school sportsmanship."
                            link="/achievements/sports"
                        />
                        <SecondarySubPageCard
                            icon={<AcademicCapIcon className="w-5 h-5" />}
                            title="Quiz"
                            description="Knowledge, analytical sharpness, and district/state honours in quiz competitions."
                            link="/achievements/quiz"
                        />
                    </div>
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
