import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

const ScienceTourPage: React.FC = () => {
    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8">
                    <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back to Science & Maths Achievements
                    </Link>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">Science Tour</h1>
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <p>At Bethel Mission School, the pursuit of excellence in Science has always been a proud hallmark of our academic journey. Thanks to our students' consistent achievements, our school has been selected multiple times for Science Tours organized by <a href="https://scert.mizoram.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-semibold">SCERT, Mizoram</a> and <a href="https://mistic.mizoram.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-semibold">MISTIC, Mizoram</a>.</p>

                        <h3 className="text-xl font-semibold text-white my-4">Science Tour Highlights</h3>
                        <ul className="list-disc list-inside mt-4 space-y-4">
                            <li><strong className="text-white">2024 – Indian International Science Festival, IIT Guwahati</strong><br />A group of 20 Class IX students accompanied by 3 teachers proudly represented our school at IIT Guwahati.</li>
                            <li><strong className="text-white">2023 – Indian International Science Festival, Faridabad</strong><br />Our school was represented by one teacher and student Pausawmdawngzela, gaining valuable exposure at national level.</li>
                            <li><strong className="text-white">2021 – North East Science Tour, Guwahati</strong><br />Two students, Chingliansangi and Lalhmangaihi, were selected for this enriching NE tour.</li>
                            <li><strong className="text-white">2017 – North East Science Tour, Guwahati</strong><br />Students Lalzikpuii Hrahsel and Lalruatlawmi joined the NE tour organized by SCERT, Mizoram.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white my-4">Inspiring Young Minds</h3>
                        <p>These tours are life-changing experiences that broaden horizons, spark curiosity, and encourage our students to dream big. Our students return inspired to contribute meaningfully to Science and Technology.</p>
                        <p className="mt-4">At Bethel Mission School, we continue to celebrate these milestones with pride, confident that the seeds planted during these journeys will grow into the innovations of tomorrow.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ScienceTourPage;
