import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { DistinctionHolder } from '@/types';

const { Link } = ReactRouterDOM as any;

const hslcResults = [
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
    { name: 'Esther Tingbiakmuani', rank: '4th Rank', year: 2023, imgSrc: 'https://i.ibb.co/v4zsJtrq/esther.jpg' },
    { name: 'Manngaihsangi', rank: '10th Rank', year: 2020, imgSrc: 'https://i.ibb.co/4wrY5r7B/manngaih.jpg' },
    { name: 'C.L. Kimteii', rank: '10th Rank', year: 2019, imgSrc: 'https://i.ibb.co/ks8prn9Z/cl-kim.jpg' },
    { name: 'R. Lalrinmawii', rank: '10th Rank', year: 2019, imgSrc: 'https://i.ibb.co/1fYFM37C/r-rinmawii.jpg' },
];

const DarkCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`rounded-xl p-8 mb-10 ${className}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        {children}
    </div>
);

const ResultChart: React.FC = () => {
    const reversedResults = [...hslcResults].reverse();
    return (
        <DarkCard>
            <h3 className="text-xl font-bold text-center mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>HSLC Results Analysis (2008–2025)</h3>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-8 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {[['bg-amber-400','Distinction'],['bg-sky-500','I Division'],['bg-emerald-500','II Division'],['bg-slate-500','III Division'],['bg-rose-500','Failed']].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded ${color}`}/><span>{label}</span></div>
                ))}
            </div>
            <div className="flex justify-start items-end gap-2 md:gap-3 overflow-x-auto pb-4 px-1">
                {reversedResults.map(result => {
                    const failed = result.appeared - result.passed;
                    const segments = [
                        { h: (result.thirdDivision / result.appeared) * 100, color: 'bg-slate-500' },
                        { h: (result.secondDivision / result.appeared) * 100, color: 'bg-emerald-500' },
                        { h: (result.firstDivision / result.appeared) * 100, color: 'bg-sky-500' },
                        { h: (result.distinction / result.appeared) * 100, color: 'bg-amber-400' },
                    ];
                    let offset = 0;
                    return (
                        <div key={result.year} className="flex flex-col items-center flex-shrink-0 text-center w-12">
                            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>{result.passPercentage}</div>
                            <div className="w-full h-56 rounded-t-lg relative group" style={{ background: 'var(--bg-elevated)' }}>
                                {segments.map((seg, i) => { const b = offset; offset += seg.h; return seg.h > 0 ? <div key={i} style={{ height: `${seg.h}%`, bottom: `${b}%` }} className={`absolute w-full ${seg.color}`} /> : null; })}
                                {failed > 0 && <div style={{ height: `${(failed/result.appeared)*100}%`, bottom: `${offset}%` }} className="absolute w-full bg-rose-500" />}
                                <div className="absolute bottom-full mb-2 w-40 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2 z-10 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', color: 'var(--text-secondary)' }}>
                                    <div className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{result.year}</div>
                                    <div>Appeared: {result.appeared}</div><div>Passed: {result.passed}</div>
                                    <hr className="my-1" style={{ borderColor: 'var(--border-subtle)' }} />
                                    <div style={{ color: '#fbbf24' }}>Dist: {result.distinction}</div>
                                    <div style={{ color: '#38bdf8' }}>I Div: {result.firstDivision}</div>
                                    <div style={{ color: '#34d399' }}>II Div: {result.secondDivision}</div>
                                    {failed > 0 && <div style={{ color: '#f87171' }}>Failed: {failed}</div>}
                                </div>
                            </div>
                            <div className="mt-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{result.year}</div>
                        </div>
                    );
                })}
            </div>
        </DarkCard>
    );
};

const AcademicAchievementsPage: React.FC = () => {
    const distinctionYears = hslcResults.filter(r => r.distinction > 0);
    return (
        <div className="py-20" style={{ background: 'var(--bg-base)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <div className="section-label mb-3">Excellence</div>
                    <h1 className="section-heading">Academic Achievements</h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext">A Legacy of Excellence</p>
                </div>
                <div className="max-w-5xl mx-auto">
                    {/* Top rankers */}
                    <DarkCard>
                        <h2 className="text-xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>MBSE Top Rank Holders</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topRankers.map(r => (
                                <div key={r.name} className="text-center">
                                    <img src={r.imgSrc} alt={r.name} className="rounded-lg w-full h-auto object-cover aspect-[4/5]" style={{ border: '1px solid var(--border-subtle)' }} />
                                    <p className="mt-3 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{r.rank}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.year}</p>
                                </div>
                            ))}
                        </div>
                    </DarkCard>

                    <ResultChart />

                    {/* Distinction year cards */}
                    <DarkCard>
                        <h2 className="text-xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Distinguished HSLC Graduates</h2>
                        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Students who achieved Distinction in the MBSE HSLC Board Examination</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {distinctionYears.map(result => (
                                <Link key={result.year} to={`/achievements/academic/distinction-holders/${result.year}`}
                                    className="group flex flex-col items-center justify-center rounded-xl p-4 transition-all"
                                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; }}
                                >
                                    <span className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{result.year}</span>
                                    <span className="mt-1 text-xs font-semibold" style={{ color: 'var(--gold)' }}>{result.distinction} students</span>
                                    <span className="mt-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>View →</span>
                                </Link>
                            ))}
                        </div>
                    </DarkCard>

                    {/* Table */}
                    <DarkCard>
                        <h2 className="text-xl font-bold text-center mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Detailed HSLC Results by Year</h2>
                        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>
                            <table className="min-w-full">
                                <thead style={{ background: 'var(--bg-elevated)' }}>
                                    <tr>
                                        {['Year','Appeared','Passed','Pass %','Distinction','I Div','II Div','III Div'].map(h => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', textAlign: h === 'Year' ? 'left' : 'center' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {hslcResults.map((result, i) => (
                                        <tr key={result.year} style={{ borderTop: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                            <td className="px-4 py-3 font-bold">
                                                {result.distinction > 0 ? (
                                                    <Link to={`/achievements/academic/distinction-holders/${result.year}`} className="hover:underline" style={{ color: 'var(--gold)' }}>{result.year}</Link>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)' }}>{result.year}</span>
                                                )}
                                            </td>
                                            {[result.appeared, result.passed, result.passPercentage, result.distinction, result.firstDivision, result.secondDivision, result.thirdDivision].map((v, j) => (
                                                <td key={j} className="px-4 py-3 text-center text-sm" style={{ color: j === 2 ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: j === 2 ? 600 : 400 }}>{v}</td>
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
