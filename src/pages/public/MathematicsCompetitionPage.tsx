
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

const MathematicsCompetitionPage: React.FC = () => {
    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8">
                    <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" />
                        Back to Science & Maths Achievements
                    </Link>
                </div>
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">
                        State-Level Mathematics Competition
                    </h1>
                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <p>At Bethel Mission School, we take great pride in the achievements of our students, not only in academics but also in state-wide competitions that celebrate learning and excellence. One such platform is the State-Level Mathematics Competition, organized annually by the Mizoram Mathematics Society (MMS) in collaboration with the Mizoram Science, Technology & Innovation Council (MISTIC).</p>
                        
                        <p>This competition is held across different centers of Mizoram and gives students from Classes V, VIII, X, and XII the opportunity to showcase their mathematical skills. Over the years, our students have consistently brought honor to the school through their outstanding performances.</p>

                        <h3 className="text-xl font-semibold text-slate-800 pt-4 border-t mt-6">Our Achievements</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-lg text-slate-800">2023 – State-Level Mathematics Competition</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Paumuansanga (S/o B. Zamtinkhupa) – 1st Prize</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-800">2022 – State-Level Mathematics Competition</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Esther Tingbiakmuani (D/o Z. L. Thanga) – 1st Prize</li>
                                    <li>C. Lalrosanga (S/o C. Lalrammawia) – Consolation Prize</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-800">2019 – State-Level Mathematics Competition</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Thangbiakmuani (D/o K. Langkapa) – Centre Prize</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-800">2016 – State-Level Mathematics Competition</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Runrempuia (S/o P. Lalhmingthanga) – Consolation Prize</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-slate-800 pt-4 border-t mt-6">Inspiring Excellence</h3>
                        <p>These achievements reflect the hard work, discipline, and passion of our students, as well as the dedication of our teachers in nurturing mathematical talents. The State-Level Mathematics Competition has not only provided our students with recognition and awards, but also the confidence to pursue excellence in higher studies and beyond.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MathematicsCompetitionPage;
