import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
const { Link } = ReactRouterDOM as any;

const IncentiveAwardsPage: React.FC = () => {
    return (
        <div className="bg-[#F4F7FB] py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-6">
                    <Link to="/achievements/science" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors">
                        <BackIcon className="w-5 h-5" />Back to Science &amp; Maths Achievements
                    </Link>
                </div>
                <div className="bg-white border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-8 md:p-12 rounded-2xl shadow-lg">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mb-6">Incentive Cash Awards</h1>
                    <div className="space-y-6 text-[#132D52] leading-relaxed">
                        <p>To foster a spirit of excellence, the Science Club initiated an Incentive Cash Award in <span className="font-tabular">2007</span> for students who demonstrate outstanding proficiency in Science and Mathematics in the MBSE HSLC Examination. This award is funded through contributions from club members and patrons who believe in encouraging scientific talent.</p>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-[#0B1F3A]/15">
                            <table className="min-w-full divide-y divide-[#0B1F3A]/10">
                                <thead className="bg-[#0B1F3A]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#DFC06B]">Year</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Student(s)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#0B1F3A]/10 bg-white">
                                    {[['2008','Pauzamuana'],['2012','R. Lalengkima'],['2013','R. Zosiamliana'],['2017','Runrempuia'],['2018','Lalengkima & Isaac Lalthangliana']].map(([y,s])=>(
                                        <tr key={y} className="hover:bg-[#F4F7FB]">
                                            <td className="px-4 py-3 font-bold text-[#0B1F3A] font-tabular">{y}</td>
                                            <td className="px-4 py-3 text-[#132D52]">{s}</td>
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
                                    <img
                                        src={src}
                                        alt="Award ceremony"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
                                        className="rounded-xl shadow-md w-full h-auto object-cover aspect-video border border-[#0B1F3A]/15"
                                    />
                                    <figcaption className="mt-2 text-center text-sm text-[#132D52]/75 italic">{cap}</figcaption>
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
