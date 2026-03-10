import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
const { Link } = ReactRouterDOM as any;

const MathematicsCompetitionPage: React.FC = () => {
    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8">
                    <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        <BackIcon className="w-5 h-5" />Back to Science & Maths Achievements
                    </Link>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">State-Level Mathematics Competition</h1>
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <p>At Bethel Mission School, we take great pride in the achievements of our students in state-wide competitions. The State-Level Mathematics Competition is organized annually by the Mizoram Mathematics Society (MMS) in collaboration with the Mizoram Science, Technology & Innovation Council (MISTIC).</p>
                        <p>This competition gives students from Classes V, VIII, X, and XII the opportunity to showcase their mathematical skills. Over the years, our students have consistently brought honor to the school.</p>
                        <h3 className="text-xl font-semibold text-white pt-4 border-t border-zinc-700 mt-6">Our Achievements</h3>
                        <div className="space-y-4">
                            {[
                                ['2023','Paumuansanga (S/o B. Zamtinkhupa) – 1st Prize'],
                                ['2022','Esther Tingbiakmuani (D/o Z. L. Thanga) – 1st Prize\nC. Lalrosanga – Consolation Prize'],
                                ['2019','Thangbiakmuani (D/o K. Langkapa) – Centre Prize'],
                                ['2016','Runrempuia (S/o P. Lalhmingthanga) – Consolation Prize'],
                            ].map(([year,result])=>(
                                <div key={year} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                                    <h4 className="font-bold text-lg text-white">{year} – State-Level Mathematics Competition</h4>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                                        {result.split('\n').map((r,i)=><li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <h3 className="text-xl font-semibold text-white pt-4 border-t border-zinc-700 mt-6">Inspiring Excellence</h3>
                        <p>These achievements reflect the hard work, discipline, and passion of our students, as well as the dedication of our teachers in nurturing mathematical talents.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MathematicsCompetitionPage;
