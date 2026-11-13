import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { db } from '@/firebaseConfig';
import { HSLCResultSummary } from '@/types';

const { Link } = ReactRouterDOM as any;

const STATIC_HSLC_RESULTS = [
  { year: 2025, appeared: 41, passed: 38, passPercentage: '92.68%', distinction: 9, firstDivision: 15, secondDivision: 13, thirdDivision: 1 },
  { year: 2024, appeared: 37, passed: 36, passPercentage: '97.30%', distinction: 17, firstDivision: 18, secondDivision: 1, thirdDivision: 0 },
  { year: 2023, appeared: 46, passed: 43, passPercentage: '93.48%', distinction: 11, firstDivision: 14, secondDivision: 16, thirdDivision: 2 },
  { year: 2022, appeared: 42, passed: 42, passPercentage: '100%', distinction: 17, firstDivision: 18, secondDivision: 6, thirdDivision: 1 },
  { year: 2021, appeared: 34, passed: 34, passPercentage: '100%', distinction: 21, firstDivision: 13, secondDivision: 0, thirdDivision: 0 },
  { year: 2020, appeared: 38, passed: 37, passPercentage: '97.37%', distinction: 8, firstDivision: 17, secondDivision: 9, thirdDivision: 3 },
  { year: 2019, appeared: 30, passed: 30, passPercentage: '100%', distinction: 14, firstDivision: 11, secondDivision: 5, thirdDivision: 0 },
  { year: 2018, appeared: 33, passed: 33, passPercentage: '100%', distinction: 25, firstDivision: 7, secondDivision: 1, thirdDivision: 0 },
  { year: 2017, appeared: 45, passed: 44, passPercentage: '97.78%', distinction: 17, firstDivision: 22, secondDivision: 5, thirdDivision: 0 },
  { year: 2016, appeared: 21, passed: 21, passPercentage: '100%', distinction: 6, firstDivision: 13, secondDivision: 1, thirdDivision: 1 },
  { year: 2015, appeared: 28, passed: 28, passPercentage: '100%', distinction: 8, firstDivision: 16, secondDivision: 3, thirdDivision: 1 },
  { year: 2014, appeared: 30, passed: 30, passPercentage: '100%', distinction: 3, firstDivision: 15, secondDivision: 6, thirdDivision: 6 },
  { year: 2013, appeared: 20, passed: 20, passPercentage: '100%', distinction: 4, firstDivision: 9, secondDivision: 3, thirdDivision: 4 },
  { year: 2012, appeared: 11, passed: 11, passPercentage: '100%', distinction: 6, firstDivision: 3, secondDivision: 2, thirdDivision: 0 },
  { year: 2011, appeared: 11, passed: 11, passPercentage: '100%', distinction: 0, firstDivision: 4, secondDivision: 4, thirdDivision: 3 },
  { year: 2010, appeared: 10, passed: 10, passPercentage: '100%', distinction: 3, firstDivision: 5, secondDivision: 2, thirdDivision: 0 },
  { year: 2009, appeared: 14, passed: 14, passPercentage: '100%', distinction: 4, firstDivision: 7, secondDivision: 2, thirdDivision: 1 },
  { year: 2008, appeared: 6, passed: 6, passPercentage: '100%', distinction: 2, firstDivision: 3, secondDivision: 1, thirdDivision: 0 },
];

const topRankers = [
    { name: 'Esther Tingbiakmuani', rank: '4th Rank', year: 2023, imgSrc: '/assets/school/esther.jpg' },
    { name: 'Manngaihsangi', rank: '10th Rank', year: 2020, imgSrc: '/assets/school/manngaih.jpg' },
    { name: 'C.L. Kimteii', rank: '10th Rank', year: 2019, imgSrc: '/assets/school/bms-logo-color.png' },
    { name: 'R. Lalrinmawii', rank: '10th Rank', year: 2019, imgSrc: '/assets/school/bms-logo-color.png' },
];

const DarkCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`rounded-xl p-6 sm:p-8 mb-10 bg-[#132D52] border border-[#C9A84C]/30 ${className}`}>
        {children}
    </div>
);

const ResultChart: React.FC<{ results: HSLCResultSummary[] }> = ({ results }) => {
    const reversedResults = [...results].reverse();
    return (
        <DarkCard>
            <h3 className="text-xl font-extrabold text-center mb-6 text-white">HSLC Results Analysis (2008&ndash;{results[0]?.year || 'Present'})</h3>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-8 text-xs text-white/85">
                {[
                    ['bg-[#C9A84C]', 'Distinction'],
                    ['bg-white', 'I Division'],
                    ['bg-[#DFC06B]/70', 'II Division'],
                    ['bg-[#2C528A]', 'III Division'],
                    ['bg-[#8E6D1B]', 'Failed'],
                ].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded ${color}`} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-start items-end gap-2 md:gap-3 overflow-x-auto pb-4 px-1">
                {reversedResults.map(result => {
                    const failed = result.appeared - result.passed;
                    const segments = [
                        { h: (result.thirdDivision / result.appeared) * 100, color: 'bg-[#2C528A]' },
                        { h: (result.secondDivision / result.appeared) * 100, color: 'bg-[#DFC06B]/70' },
                        { h: (result.firstDivision / result.appeared) * 100, color: 'bg-white' },
                        { h: (result.distinction / result.appeared) * 100, color: 'bg-[#C9A84C]' },
                    ];
                    let offset = 0;
                    return (
                        <div key={result.year} className="flex flex-col items-center flex-shrink-0 text-center w-12 text-white">
                            <div className="font-tabular font-bold mb-1 text-[#DFC06B]" style={{ fontSize: '0.6rem' }}>{result.passPercentage}</div>
                            <div className="w-full h-56 rounded-t-lg relative group bg-[#07162B] border border-white/10">
                                {segments.map((seg, i) => {
                                    const b = offset;
                                    offset += seg.h;
                                    return seg.h > 0 ? <div key={i} style={{ height: `${seg.h}%`, bottom: `${b}%` }} className={`absolute w-full ${seg.color}`} /> : null;
                                })}
                                {failed > 0 && <div style={{ height: `${(failed / result.appeared) * 100}%`, bottom: `${offset}%` }} className="absolute w-full bg-[#8E6D1B]" />}
                                <div className="absolute bottom-full mb-2 w-40 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2 z-10 shadow-2xl bg-[#07162B] border border-[#C9A84C] text-white/85">
                                    <div className="font-bold mb-1 text-white font-tabular">{result.year}</div>
                                    <div className="font-tabular">Appeared: {result.appeared}</div>
                                    <div className="font-tabular">Passed: {result.passed}</div>
                                    <hr className="my-1 border-white/15" />
                                    <div className="font-tabular text-[#DFC06B]">Dist: {result.distinction}</div>
                                    <div className="font-tabular text-white">I Div: {result.firstDivision}</div>
                                    <div className="font-tabular text-white/80">II Div: {result.secondDivision}</div>
                                    {failed > 0 && <div className="font-tabular text-[#C9A84C]">Failed: {failed}</div>}
                                </div>
                            </div>
                            <div className="mt-1.5 font-tabular font-bold text-white/80" style={{ fontSize: '0.65rem' }}>{result.year}</div>
                        </div>
                    );
                })}
            </div>
        </DarkCard>
    );
};

const AcademicAchievementsPage: React.FC = () => {
    const [hslcResults, setHslcResults] = useState<HSLCResultSummary[]>([]);

    useEffect(() => {
        const unsub = db.collection('hslc_results')
            .orderBy('year', 'desc')
            .onSnapshot(snap => {
                const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as HSLCResultSummary));
                const merged = [...results];
                STATIC_HSLC_RESULTS.forEach(sr => {
                    if (!merged.find(m => m.year === sr.year)) {
                        merged.push({ id: `static-${sr.year}`, ...sr } as HSLCResultSummary);
                    }
                });
                setHslcResults(merged.sort((a, b) => b.year - a.year));
            });
        return () => unsub();
    }, []);

    const distinctionYears = hslcResults.filter(r => r.distinction > 0);

    return (
        <div className="py-12 sm:py-16 bg-[#0B1F3A] min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="section-label mb-3">Excellence</div>
                    <h1 className="section-heading">Academic Achievements</h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext">A Legacy of MBSE HSLC Board Excellence</p>
                </div>
                <div className="max-w-5xl mx-auto">
                    <DarkCard>
                        <h2 className="text-xl font-extrabold text-center mb-8 text-white">MBSE Top Rank Holders</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topRankers.map(r => (
                                <div key={r.name} className="text-center">
                                    <img
                                        src={r.imgSrc}
                                        alt={r.name}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/bms-logo-color.png'; }}
                                        className="rounded-lg w-full h-auto object-cover aspect-[4/5] border border-[#C9A84C]/35 bg-[#07162B]"
                                    />
                                    <p className="mt-3 font-bold text-sm text-white">{r.name}</p>
                                    <p className="text-sm font-bold text-[#DFC06B]">{r.rank}</p>
                                    <p className="font-tabular text-xs mt-0.5 text-white/60">{r.year}</p>
                                </div>
                            ))}
                        </div>
                    </DarkCard>

                    <ResultChart results={hslcResults} />

                    <DarkCard>
                        <h2 className="text-xl font-extrabold text-center mb-2 text-white">Distinguished HSLC Graduates</h2>
                        <p className="text-center text-sm mb-8 text-white/70">Students who achieved Distinction in the MBSE HSLC Board Examination</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {distinctionYears.map(result => (
                                <Link
                                    key={result.year}
                                    to={`/achievements/academic/distinction-holders/${result.year}`}
                                    className="group flex flex-col items-center justify-center rounded-xl p-4 transition-all bg-[#07162B] border border-white/15 hover:border-[#C9A84C]"
                                >
                                    <span className="font-tabular text-xl font-extrabold text-white">{result.year}</span>
                                    <span className="mt-1 text-xs font-bold text-[#DFC06B]">{result.distinction} students</span>
                                    <span className="mt-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-white/70">View &rarr;</span>
                                </Link>
                            ))}
                        </div>
                    </DarkCard>

                    <DarkCard>
                        <h2 className="text-xl font-extrabold text-center mb-6 text-white">Detailed HSLC Results by Year</h2>
                        <div className="overflow-x-auto rounded-lg border border-white/15">
                            <table className="min-w-full">
                                <thead className="bg-[#07162B]">
                                    <tr>
                                        {['Year', 'Appeared', 'Passed', 'Pass %', 'Distinction', 'I Div', 'II Div', 'III Div'].map(h => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#DFC06B]" style={{ textAlign: h === 'Year' ? 'left' : 'center' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {hslcResults.map((result, i) => (
                                        <tr key={result.year} className={`border-t border-white/10 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                            <td className="px-4 py-3 font-tabular font-bold">
                                                {result.distinction > 0 ? (
                                                    <Link to={`/achievements/academic/distinction-holders/${result.year}`} className="hover:underline text-[#DFC06B]">{result.year}</Link>
                                                ) : (
                                                    <span className="text-white/80">{result.year}</span>
                                                )}
                                            </td>
                                            {[result.appeared, result.passed, result.passPercentage, result.distinction, result.firstDivision, result.secondDivision, result.thirdDivision].map((v, j) => (
                                                <td key={j} className={`px-4 py-3 text-center text-sm font-tabular ${j === 2 ? 'text-[#DFC06B] font-bold' : 'text-white/80'}`}>{v}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DarkCard>
                </div>
            </div>
        </div>
    );
};

export default AcademicAchievementsPage;
