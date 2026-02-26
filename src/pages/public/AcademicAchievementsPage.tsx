
import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
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

interface ResultChartProps {
    results: typeof hslcResults;
}

const ResultChart: React.FC<ResultChartProps> = ({ results }) => {
    const reversedResults = [...results].reverse();

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-12">
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">HSLC Results Analysis (2008 - 2025)</h3>
            
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-8 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-400"></div><span>Distinction</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-sky-500"></div><span>I Division</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500"></div><span>II Division</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-400"></div><span>III Division</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-rose-500"></div><span>Failed</span></div>
            </div>
            
            <div className="flex justify-start items-end gap-3 md:gap-4 overflow-x-auto pb-4 px-2">
                {reversedResults.map(result => {
                    const failed = result.appeared - result.passed;
                    
                    const segments = [
                        { height: (result.thirdDivision / result.appeared) * 100, color: 'bg-slate-400', value: result.thirdDivision, label: 'III Div' },
                        { height: (result.secondDivision / result.appeared) * 100, color: 'bg-emerald-500', value: result.secondDivision, label: 'II Div' },
                        { height: (result.firstDivision / result.appeared) * 100, color: 'bg-sky-500', value: result.firstDivision, label: 'I Div' },
                        { height: (result.distinction / result.appeared) * 100, color: 'bg-amber-400', value: result.distinction, label: 'Distinction' },
                    ];

                    let bottomOffset = 0;

                    return (
                        <div key={result.year} className="flex flex-col items-center flex-shrink-0 text-center w-14">
                            <div className="font-semibold text-sky-700 text-sm">{result.passPercentage}</div>
                            <div className="w-full h-64 bg-slate-100 rounded-t-lg relative group mt-1">
                                {segments.map(seg => {
                                    const currentBottom = bottomOffset;
                                    bottomOffset += seg.height;
                                    if (seg.height === 0) return null;
                                    return (
                                        <div key={seg.label}
                                             style={{ height: `${seg.height}%`, bottom: `${currentBottom}%` }}
                                             className={`absolute w-full transition-all duration-300 ${seg.color}`}>
                                        </div>
                                    );
                                })}
                                {failed > 0 && (
                                     <div style={{ height: `${(failed / result.appeared) * 100}%`, bottom: `${bottomOffset}%` }}
                                         className="absolute w-full transition-all duration-300 bg-rose-500">
                                    </div>
                                )}
                                <div className="absolute bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2 left-1/2 z-10 shadow-lg">
                                    <div className="font-bold text-base mb-1">{result.year}</div>
                                    <div>Appeared: {result.appeared}</div>
                                    <div>Passed: {result.passed}</div>
                                    <hr className="my-1 border-slate-600"/>
                                    <div className="text-amber-300">Distinction: {result.distinction}</div>
                                    <div className="text-sky-300">I Div: {result.firstDivision}</div>
                                    <div className="text-emerald-300">II Div: {result.secondDivision}</div>
                                    <div className="text-slate-300">III Div: {result.thirdDivision}</div>
                                    {failed > 0 && <div className="text-rose-300">Failed: {failed}</div>}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                                </div>
                            </div>
                            <div className="mt-2 text-sm font-bold text-slate-800">{result.year}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const AcademicAchievementsPage: React.FC = () => {
    // Only show years that have distinction holders (distinction > 0)
    const distinctionYears = hslcResults.filter(r => r.distinction > 0);

    return (
        <div className="relative py-16 overflow-hidden bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Academic Achievements</h1>
                    <p className="mt-4 text-lg text-slate-600">A Legacy of Excellence</p>
                </div>
                
                <div className="max-w-5xl mx-auto">
                    <section className="bg-white p-8 rounded-xl shadow-lg border mb-12">
                        <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">MBSE Top Rank Holders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {topRankers.map(ranker => (
                                <div key={ranker.name} className="text-center">
                                    <img src={ranker.imgSrc} alt={ranker.name} className="rounded-lg shadow-md w-full h-auto object-cover aspect-[4/5]"/>
                                    <div className="mt-4">
                                        <p className="font-bold text-lg text-slate-800">{ranker.name}</p>
                                        <p className="text-md text-sky-700 font-semibold">{ranker.rank}</p>
                                        <p className="text-sm text-slate-500">{ranker.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <ResultChart results={hslcResults} />

                    {/* ── DISTINGUISHED HSLC GRADUATES ── */}
                    <section className="bg-white p-8 rounded-xl shadow-lg border mb-12">
                        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Distinguished HSLC Graduates</h2>
                        <p className="text-center text-slate-500 mb-8">Students who achieved Distinction in the MBSE HSLC Board Examination</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {distinctionYears.map(result => (
                                <Link
                                    key={result.year}
                                    to="/gallery/by-category/achievements/distinguished-hslc-graduate"
                                    className="group flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 hover:from-sky-100 hover:to-sky-200 border border-slate-200 hover:border-sky-400 rounded-xl p-5 transition-all transform hover:-translate-y-1 hover:shadow-md text-center"
                                >
                                    <span className="text-2xl font-extrabold text-slate-800 group-hover:text-sky-700 transition-colors">
                                        {result.year}
                                    </span>
                                    <span className="mt-1 text-sm font-semibold text-amber-600">
                                        {result.distinction} {result.distinction === 1 ? 'student' : 'students'}
                                    </span>
                                    <span className="mt-2 text-xs text-sky-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        View →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <div className="bg-white p-8 rounded-xl shadow-lg border">
                        <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Detailed HSLC Results by Year</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Year</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Appeared</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Passed</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Pass %</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Distinction</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">I Div</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">II Div</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">III Div</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {hslcResults.map(result => (
                                        <tr key={result.year} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                {result.distinction > 0 ? (
                                                    <Link 
                                                        to="/gallery/by-category/achievements/distinguished-hslc-graduate"
                                                        className="font-bold text-sky-700 hover:underline"
                                                        title={`View distinction holders for ${result.year}`}
                                                    >
                                                        {result.year}
                                                    </Link>
                                                ) : (
                                                    <span className="font-bold text-slate-700">{result.year}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">{result.appeared}</td>
                                            <td className="px-6 py-4 text-center">{result.passed}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-sky-700">{result.passPercentage}</td>
                                            <td className="px-6 py-4 text-center">{result.distinction}</td>
                                            <td className="px-6 py-4 text-center">{result.firstDivision}</td>
                                            <td className="px-6 py-4 text-center">{result.secondDivision}</td>
                                            <td className="px-6 py-4 text-center">{result.thirdDivision}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicAchievementsPage;
