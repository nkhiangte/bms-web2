import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '../../components/Icons';

const { Link } = ReactRouterDOM as any;

const IncentiveAwardsPage: React.FC = () => {
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
                        Incentive Cash Awards
                    </h1>
                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <p>To foster a spirit of excellence, the Science Club initiated an Incentive Cash Award in 2007 for students who demonstrate outstanding proficiency in Science and Mathematics in the MBSE HSLC Examination. This award is funded through contributions from club members and patrons who believe in encouraging scientific talent. It is our way of recognizing and rewarding the hard work and dedication of our top-performing students.</p>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-800">Year</th>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-800">Student(s)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    <tr><td className="px-4 py-2 font-medium">2008</td><td className="px-4 py-2">Pauzamuana</td></tr>
                                    <tr><td className="px-4 py-2 font-medium">2012</td><td className="px-4 py-2">R. Lalengkima</td></tr>
                                    <tr><td className="px-4 py-2 font-medium">2013</td><td className="px-4 py-2">R. Zosiamliana</td></tr>
                                    <tr><td className="px-4 py-2 font-medium">2017</td><td className="px-4 py-2">Runrempuia</td></tr>
                                    <tr><td className="px-4 py-2 font-medium">2018</td><td className="px-4 py-2">Lalengkima & Isaac Lalthangliana</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <figure>
                                <img src="https://i.ibb.co/r22r1VfT/Gemini-Generated-Image-f4ew1wf4ew1wf4ew.png" alt="Award ceremony" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video" />
                                <figcaption className="mt-2 text-center text-sm text-slate-600 italic">Award recipients with their certificates.</figcaption>
                            </figure>
                            <figure>
                                <img src="https://i.ibb.co/Y4YHDc2b/44574692-2098266203557738-1647032795949694976-n.jpg" alt="Award ceremony" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video" />
                                <figcaption className="mt-2 text-center text-sm text-slate-600 italic">Students being presented with awards.</figcaption>
                            </figure>
                            <figure>
                                <img src="https://i.ibb.co/dwW1x30s/44571551-2098266250224400-5501968928559071232-n.jpg" alt="Award ceremony" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video" />
                                <figcaption className="mt-2 text-center text-sm text-slate-600 italic">Another moment from the award presentation.</figcaption>
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default IncentiveAwardsPage;