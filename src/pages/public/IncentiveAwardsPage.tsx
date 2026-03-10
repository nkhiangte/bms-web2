import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
const { Link } = ReactRouterDOM as any;

const IncentiveAwardsPage: React.FC = () => {
    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8">
                    <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        <BackIcon className="w-5 h-5" />Back to Science & Maths Achievements
                    </Link>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">Incentive Cash Awards</h1>
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <p>To foster a spirit of excellence, the Science Club initiated an Incentive Cash Award in 2007 for students who demonstrate outstanding proficiency in Science and Mathematics in the MBSE HSLC Examination. This award is funded through contributions from club members and patrons who believe in encouraging scientific talent.</p>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-700 border border-zinc-700">
                                <thead className="bg-zinc-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-white">Year</th>
                                        <th className="px-4 py-2 text-left font-semibold text-white">Student(s)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700">
                                    {[['2008','Pauzamuana'],['2012','R. Lalengkima'],['2013','R. Zosiamliana'],['2017','Runrempuia'],['2018','Lalengkima & Isaac Lalthangliana']].map(([y,s])=>(
                                        <tr key={y} className="hover:bg-zinc-800/50">
                                            <td className="px-4 py-2 font-medium text-slate-200">{y}</td>
                                            <td className="px-4 py-2 text-slate-300">{s}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                ['https://i.ibb.co/r22r1VfT/Gemini-Generated-Image-f4ew1wf4ew1wf4ew.png','Award recipients with their certificates.'],
                                ['https://i.ibb.co/Y4YHDc2b/44574692-2098266203557738-1647032795949694976-n.jpg','Students being presented with awards.'],
                                ['https://i.ibb.co/dwW1x30s/44571551-2098266250224400-5501968928559071232-n.jpg','Another moment from the award presentation.'],
                            ].map(([src,cap])=>(
                                <figure key={src}>
                                    <img src={src} alt="Award ceremony" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video border border-zinc-700" />
                                    <figcaption className="mt-2 text-center text-sm text-slate-500 italic">{cap}</figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default IncentiveAwardsPage;
