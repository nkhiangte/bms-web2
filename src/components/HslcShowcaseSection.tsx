import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight, Award, GraduationCap, Medal } from 'lucide-react';
import { db } from '@/firebaseConfig';
import { HSLCResultSummary } from '@/types';

const { Link } = ReactRouterDOM as any;

const STATIC_HSLC_RESULTS: HSLCResultSummary[] = [
    { id: 'static-2025', year: 2025, appeared: 41, passed: 38, passPercentage: '92.68%', distinction: 9, firstDivision: 15, secondDivision: 13, thirdDivision: 1 },
    { id: 'static-2024', year: 2024, appeared: 37, passed: 36, passPercentage: '97.30%', distinction: 17, firstDivision: 18, secondDivision: 1, thirdDivision: 0 },
    { id: 'static-2023', year: 2023, appeared: 46, passed: 43, passPercentage: '93.48%', distinction: 11, firstDivision: 14, secondDivision: 16, thirdDivision: 2 },
    { id: 'static-2022', year: 2022, appeared: 42, passed: 42, passPercentage: '100%', distinction: 17, firstDivision: 18, secondDivision: 6, thirdDivision: 1 },
    { id: 'static-2021', year: 2021, appeared: 34, passed: 34, passPercentage: '100%', distinction: 21, firstDivision: 13, secondDivision: 0, thirdDivision: 0 },
    { id: 'static-2020', year: 2020, appeared: 38, passed: 37, passPercentage: '97.37%', distinction: 8, firstDivision: 17, secondDivision: 9, thirdDivision: 3 },
    { id: 'static-2019', year: 2019, appeared: 30, passed: 30, passPercentage: '100%', distinction: 14, firstDivision: 11, secondDivision: 5, thirdDivision: 0 },
    { id: 'static-2018', year: 2018, appeared: 33, passed: 33, passPercentage: '100%', distinction: 25, firstDivision: 7, secondDivision: 1, thirdDivision: 0 },
    { id: 'static-2017', year: 2017, appeared: 45, passed: 44, passPercentage: '97.78%', distinction: 17, firstDivision: 22, secondDivision: 5, thirdDivision: 0 },
    { id: 'static-2016', year: 2016, appeared: 21, passed: 21, passPercentage: '100%', distinction: 6, firstDivision: 13, secondDivision: 1, thirdDivision: 1 },
    { id: 'static-2015', year: 2015, appeared: 28, passed: 28, passPercentage: '100%', distinction: 8, firstDivision: 16, secondDivision: 3, thirdDivision: 1 },
    { id: 'static-2014', year: 2014, appeared: 30, passed: 30, passPercentage: '100%', distinction: 3, firstDivision: 15, secondDivision: 6, thirdDivision: 6 },
    { id: 'static-2013', year: 2013, appeared: 20, passed: 20, passPercentage: '100%', distinction: 4, firstDivision: 9, secondDivision: 3, thirdDivision: 4 },
    { id: 'static-2012', year: 2012, appeared: 11, passed: 11, passPercentage: '100%', distinction: 6, firstDivision: 3, secondDivision: 2, thirdDivision: 0 },
    { id: 'static-2011', year: 2011, appeared: 11, passed: 11, passPercentage: '100%', distinction: 0, firstDivision: 4, secondDivision: 4, thirdDivision: 3 },
    { id: 'static-2010', year: 2010, appeared: 10, passed: 10, passPercentage: '100%', distinction: 3, firstDivision: 5, secondDivision: 2, thirdDivision: 0 },
    { id: 'static-2009', year: 2009, appeared: 14, passed: 14, passPercentage: '100%', distinction: 4, firstDivision: 7, secondDivision: 2, thirdDivision: 1 },
    { id: 'static-2008', year: 2008, appeared: 6, passed: 6, passPercentage: '100%', distinction: 2, firstDivision: 3, secondDivision: 1, thirdDivision: 0 },
];

const FEATURED_TOP_RANKERS = [
    {
        name: 'Esther Tingbiakmuani',
        rank: '4th Rank · MBSE State Merit List',
        year: 2023,
        imgSrc: '/assets/school/esther.jpg',
    },
    {
        name: 'Manngaihsangi',
        rank: '10th Rank · MBSE State Merit List',
        year: 2020,
        imgSrc: '/assets/school/manngaih.jpg',
    },
];

const ADDITIONAL_TOP_RANKERS = [
    { name: 'C.L. Kimteii', rank: '10th Rank', year: 2019 },
    { name: 'R. Lalrinmawii', rank: '10th Rank', year: 2019 },
];

interface HslcShowcaseSectionProps {
    embedded?: boolean;
}

const HslcShowcaseSection: React.FC<HslcShowcaseSectionProps> = ({ embedded = false }) => {
    const [hslcResults, setHslcResults] = useState<HSLCResultSummary[]>(STATIC_HSLC_RESULTS);

    useEffect(() => {
        const unsub = db
            .collection('hslc_results')
            .orderBy('year', 'desc')
            .onSnapshot(
                snap => {
                    const live = snap.docs.map(d => ({ id: d.id, ...d.data() } as HSLCResultSummary));
                    const merged = [...live];
                    STATIC_HSLC_RESULTS.forEach(sr => {
                        if (!merged.some(m => m.year === sr.year)) {
                            merged.push(sr);
                        }
                    });
                    setHslcResults(merged.sort((a, b) => b.year - a.year));
                },
                () => {
                    setHslcResults(STATIC_HSLC_RESULTS);
                }
            );
        return () => unsub();
    }, []);

    const metrics = useMemo(() => {
        const totalAppeared = hslcResults.reduce((acc, r) => acc + (Number(r.appeared) || 0), 0);
        const totalPassed = hslcResults.reduce((acc, r) => acc + (Number(r.passed) || 0), 0);
        const totalDistinctions = hslcResults.reduce((acc, r) => acc + (Number(r.distinction) || 0), 0);
        const hundredPercentYears = hslcResults.filter(
            r => r.passPercentage === '100%' || (r.appeared > 0 && r.passed >= r.appeared)
        ).length;
        const overallPassRate =
            totalAppeared > 0 ? `${((totalPassed / totalAppeared) * 100).toFixed(1)}%` : '98.2%';
        const latestYear = hslcResults[0]?.year || 2025;
        const earliestYear = hslcResults[hslcResults.length - 1]?.year || 2008;
        const latestDistinctionResult = hslcResults.find(r => (Number(r.distinction) || 0) > 0);

        return {
            totalAppeared,
            totalPassed,
            totalDistinctions,
            hundredPercentYears,
            totalBatches: hslcResults.length,
            overallPassRate,
            latestYear,
            earliestYear,
            latestDistinctionYear: latestDistinctionResult?.year || 2025,
        };
    }, [hslcResults]);

    const recentResults = useMemo(() => hslcResults.slice(0, 6), [hslcResults]);

    const innerContent = (
        <>
            {/* Editorial Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#DFC06B]">
                        MBSE Board Track Record &middot; {metrics.earliestYear}&ndash;{metrics.latestYear}
                    </p>
                    <h3
                        id="academic-hslc-heading"
                        className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15]"
                    >
                        Academic Record &amp; HSLC Distinctions
                    </h3>
                    <div className="mt-4 h-1 w-20 bg-[#C9A33B]" />
                    <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed">
                        Consistent board excellence in the Mizoram Board of School Education (MBSE) HSLC examinations, anchored by State Top-10 rank holders and subject distinction scholars across {metrics.totalBatches} consecutive graduating batches.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                    <Link
                        to="/achievements/academic"
                        className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[#C9A33B] hover:bg-[#DFC06B] text-[#10233F] font-extrabold text-sm rounded-lg transition-colors shadow-md whitespace-nowrap"
                    >
                        <span>Explore Full HSLC Record</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        to={`/achievements/academic/distinction-holders/${metrics.latestDistinctionYear}`}
                        className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 bg-white/10 hover:bg-white/15 border border-[#C9A33B]/50 text-white font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
                    >
                        <span>{metrics.latestDistinctionYear} Distinctions</span>
                    </Link>
                </div>
            </div>

                {/* 4-Metric Headline Record Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-12">
                    <div className="bg-[#0B192E] border border-[#C9A33B]/45 rounded-xl p-5 sm:p-6">
                        <div className="flex items-center justify-between text-[#DFC06B] mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">HSLC Distinctions</span>
                            <Award className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <p className="font-tabular text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            {metrics.totalDistinctions}
                        </p>
                        <p className="mt-1.5 text-xs text-white/70 font-tabular">
                            Honours earned since {metrics.earliestYear}
                        </p>
                    </div>

                    <div className="bg-[#0B192E] border border-[#C9A33B]/45 rounded-xl p-5 sm:p-6">
                        <div className="flex items-center justify-between text-[#DFC06B] mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">100% Pass Years</span>
                            <GraduationCap className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <p className="font-tabular text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            {metrics.hundredPercentYears}
                        </p>
                        <p className="mt-1.5 text-xs text-white/70 font-tabular">
                            Of {metrics.totalBatches} board examinations
                        </p>
                    </div>

                    <div className="bg-[#0B192E] border border-[#C9A33B]/45 rounded-xl p-5 sm:p-6">
                        <div className="flex items-center justify-between text-[#DFC06B] mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Cumulative Pass Rate</span>
                            <Medal className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <p className="font-tabular text-3xl sm:text-4xl font-extrabold text-[#DFC06B] tracking-tight">
                            {metrics.overallPassRate}
                        </p>
                        <p className="mt-1.5 text-xs text-white/70 font-tabular">
                            {metrics.totalPassed} passed of {metrics.totalAppeared} appeared
                        </p>
                    </div>

                    <div className="bg-[#0B192E] border border-[#C9A33B]/45 rounded-xl p-5 sm:p-6">
                        <div className="flex items-center justify-between text-[#DFC06B] mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">State Top-10 Ranks</span>
                            <Award className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <p className="font-tabular text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            4
                        </p>
                        <p className="mt-1.5 text-xs text-white/70 font-tabular">
                            Highest: 4th State Rank (2023)
                        </p>
                    </div>
                </div>

                {/* Split Showcase: Top State Rank Holders + Recent Board Results & Distinctions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
                    {/* Left: MBSE State Top Rank Holders */}
                    <div className="lg:col-span-5 bg-[#0B192E] border border-white/15 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#DFC06B]">
                                        Mizoram State Merit List
                                    </p>
                                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                                        MBSE Top-10 Rank Holders
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-5">
                                {FEATURED_TOP_RANKERS.map(ranker => (
                                    <div
                                        key={ranker.name}
                                        className="bg-[#10233F] border border-[#C9A33B]/35 rounded-xl overflow-hidden flex flex-col"
                                    >
                                        <div className="aspect-[4/5] w-full bg-[#07162B] overflow-hidden">
                                            <img
                                                src={ranker.imgSrc}
                                                alt={`${ranker.name} — ${ranker.rank} (${ranker.year})`}
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                                onError={e => {
                                                    (e.currentTarget as HTMLImageElement).src =
                                                        '/assets/school/bms-logo-color.png';
                                                }}
                                                className="w-full h-full object-cover object-top"
                                            />
                                        </div>
                                        <div className="p-3.5 border-t border-[#C9A33B]/30">
                                            <p className="font-tabular text-xs font-extrabold text-[#DFC06B]">
                                                {ranker.year} &middot; {ranker.rank.split(' · ')[0]}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-white leading-snug">
                                                {ranker.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ADDITIONAL_TOP_RANKERS.map(ranker => (
                                    <div
                                        key={ranker.name}
                                        className="bg-[#10233F]/80 border border-white/10 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{ranker.name}</p>
                                            <p className="text-xs font-semibold text-[#DFC06B]">{ranker.rank}</p>
                                        </div>
                                        <span className="font-tabular text-xs font-bold text-white/65 flex-shrink-0">
                                            {ranker.year}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/75">
                            <span>Distinguished HSLC Scholars</span>
                            <Link
                                to="/achievements/academic"
                                className="inline-flex items-center gap-1 font-bold text-[#DFC06B] hover:text-white transition-colors"
                            >
                                <span>Full Honour Roll</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Recent Board Examination Results & Distinction Holders */}
                    <div className="lg:col-span-7 bg-[#F8F7F3] text-[#10233F] rounded-2xl border border-[#C9A33B]/50 p-6 sm:p-7 flex flex-col justify-between shadow-lg">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#10233F]/10">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E6D1B]">
                                        Recent Board Performance
                                    </p>
                                    <h3 className="text-xl font-extrabold text-[#10233F] mt-0.5">
                                        HSLC Results &amp; Distinction Holders
                                    </h3>
                                </div>
                                <Link
                                    to="/achievements/academic"
                                    className="text-xs font-bold text-[#10233F] hover:text-[#8E6D1B] inline-flex items-center gap-1 transition-colors"
                                >
                                    <span>All {metrics.totalBatches} Years</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#10233F]/15 text-[11px] font-bold uppercase tracking-wider text-[#10233F]/65">
                                            <th className="py-2.5 pr-3">Batch</th>
                                            <th className="py-2.5 px-2 text-center">Appeared</th>
                                            <th className="py-2.5 px-2 text-center">Passed</th>
                                            <th className="py-2.5 px-2 text-center">Pass %</th>
                                            <th className="py-2.5 px-2 text-center">Distinctions</th>
                                            <th className="py-2.5 pl-2 text-right">Honours List</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#10233F]/10 text-sm">
                                        {recentResults.map(row => (
                                            <tr
                                                key={row.year}
                                                className="hover:bg-white/80 transition-colors"
                                            >
                                                <td className="py-3 pr-3 font-tabular font-extrabold text-[#10233F]">
                                                    {row.year}
                                                </td>
                                                <td className="py-3 px-2 text-center font-tabular text-[#10233F]/80">
                                                    {row.appeared}
                                                </td>
                                                <td className="py-3 px-2 text-center font-tabular text-[#10233F]/80">
                                                    {row.passed}
                                                </td>
                                                <td className="py-3 px-2 text-center font-tabular font-bold text-[#10233F]">
                                                    {row.passPercentage}
                                                </td>
                                                <td className="py-3 px-2 text-center font-tabular font-extrabold text-[#8E6D1B]">
                                                    {row.distinction}
                                                </td>
                                                <td className="py-3 pl-2 text-right">
                                                    {row.distinction > 0 ? (
                                                        <Link
                                                            to={`/achievements/academic/distinction-holders/${row.year}`}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#10233F] hover:text-[#8E6D1B] transition-colors whitespace-nowrap"
                                                        >
                                                            <span>View Names</span>
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-[#10233F]/45">&mdash;</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#10233F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-[#10233F]/75">
                                Click any year above to inspect individual distinction holder records and MBSE division breakdowns.
                            </p>
                            <Link
                                to="/academics#achievements"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#10233F] hover:bg-[#163056] text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                <span>Detailed Division Chart</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
        </>
    );

    if (embedded) {
        return (
            <div
                aria-labelledby="academic-hslc-heading"
                className="rounded-2xl bg-[#10233F] text-white border-2 border-[#C9A33B] p-5 sm:p-8 lg:p-10 shadow-xl"
            >
                {innerContent}
            </div>
        );
    }

    return (
        <section
            aria-labelledby="academic-hslc-heading"
            className="py-16 sm:py-24 bg-[#10233F] text-white border-y-2 border-[#C9A33B]"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                {innerContent}
            </div>
        </section>
    );
};

export default HslcShowcaseSection;
