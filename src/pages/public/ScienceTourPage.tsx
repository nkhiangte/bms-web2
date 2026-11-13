import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

const ScienceTourPage: React.FC = () => {
    return (
        <div className="bg-[#F4F7FB] py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-6">
                    <Link to="/achievements/science" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors">
                        <BackIcon className="w-5 h-5" /> Back to Science &amp; Maths Achievements
                    </Link>
                </div>
                <div className="bg-white border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-8 md:p-12 rounded-2xl shadow-lg">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mb-6">Science Tour</h1>
                    <div className="space-y-6 text-[#132D52] leading-relaxed">
                        <p>At Bethel Mission School, the pursuit of excellence in Science has always been a proud hallmark of our academic journey. Thanks to our students&apos; consistent achievements, our school has been selected multiple times for Science Tours organized by <a href="https://scert.mizoram.gov.in/" target="_blank" rel="noopener noreferrer" className="text-[#8E6D1B] hover:text-[#0B1F3A] underline font-bold">SCERT, Mizoram</a> and <a href="https://mistic.mizoram.gov.in/" target="_blank" rel="noopener noreferrer" className="text-[#8E6D1B] hover:text-[#0B1F3A] underline font-bold">MISTIC, Mizoram</a>.</p>

                        <h3 className="text-xl font-bold text-[#0B1F3A] pt-4 border-t border-[#C9A84C]/40">Science Tour Highlights</h3>
                        <ul className="space-y-3">
                            <li className="p-4 bg-[#F4F7FB] rounded-xl border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2024 – Indian International Science Festival, IIT Guwahati</strong><br />A group of 20 Class IX students accompanied by 3 teachers proudly represented our school at IIT Guwahati.</li>
                            <li className="p-4 bg-[#F4F7FB] rounded-xl border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2023 – Indian International Science Festival, Faridabad</strong><br />Our school was represented by one teacher and student Pausawmdawngzela, gaining valuable exposure at national level.</li>
                            <li className="p-4 bg-[#F4F7FB] rounded-xl border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2021 – North East Science Tour, Guwahati</strong><br />Two students, Chingliansangi and Lalhmangaihi, were selected for this enriching NE tour.</li>
                            <li className="p-4 bg-[#F4F7FB] rounded-xl border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2017 – North East Science Tour, Guwahati</strong><br />Students Lalzikpuii Hrahsel and Lalruatlawmi joined the NE tour organized by SCERT, Mizoram.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-[#0B1F3A] pt-4 border-t border-[#C9A84C]/40">Inspiring Young Minds</h3>
                        <p>These tours are life-changing experiences that broaden horizons, spark curiosity, and encourage our students to dream big. Our students return inspired to contribute meaningfully to Science and Technology.</p>
                        <p>At Bethel Mission School, we continue to celebrate these milestones with pride, confident that the seeds planted during these journeys will grow into the innovations of tomorrow.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ScienceTourPage;
