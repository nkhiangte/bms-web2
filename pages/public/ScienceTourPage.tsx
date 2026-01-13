import React from 'react';
import { Link } from 'react-router-dom';
import { BackIcon } from '../../components/Icons';

const ScienceTourPage: React.FC = () => {
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
                        Science Tour
                    </h1>
                     <div className="space-y-6 text-slate-700 leading-relaxed">
                        <p>At Bethel Mission School, the pursuit of excellence in Science has always been a proud hallmark of our academic journey. Thanks to our students’ consistent achievements and active participation in science-related programs, our school has been selected multiple times for Science Tours organized by the <a href="https://scert.mizoram.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">SCERT, Mizoram</a> and occasionally by <a href="https://mistic.mizoram.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">MISTIC, Mizoram</a>. These tours offer our students unique opportunities to learn beyond the classroom, interact with young scientists across the country, and experience the latest innovations in Science and Technology.</p>
                        
                        <h3 className="text-xl font-semibold text-slate-800 my-4">Science Tour Highlights</h3>
                        <ul className="list-disc list-inside mt-4 space-y-4">
                            <li><strong>2024 – Indian International Science Festival, IIT Guwahati</strong><br />A group of 20 Class IX students accompanied by 3 teachers proudly represented our school at the prestigious Indian International Science Festival held at IIT Guwahati.</li>
                            <li><strong>2023 – Indian International Science Festival, Faridabad</strong><br />Our school was represented by one teacher and student Pausawmdawngzela, who actively participated in this national-level event, gaining valuable exposure and insights.</li>
                            <li><strong>2021 – North East Science Tour, Guwahati</strong><br />Two students, Chingliansangi and Lalhmangaihi, were selected for this enriching NE tour, where they explored scientific centers and interacted with peers from across the region.</li>
                            <li><strong>2017 – North East Science Tour, Guwahati</strong><br />Students Lalzikpuii Hrahsel and Lalruatlawmi joined the NE tour organized by SCERT, Mizoram, marking one of our earliest participations in such educational journeys.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-800 my-4">Inspiring Young Minds</h3>
                        <p>These tours are not just trips—they are life-changing experiences that broaden horizons, spark curiosity, and encourage our students to dream big. By stepping into India’s hubs of scientific progress, our students return inspired to contribute meaningfully to the fields of Science and Technology.</p>
                        <p className="mt-4">At Bethel Mission School, we continue to celebrate these milestones with pride, confident that the seeds planted during these journeys will grow into the innovations of tomorrow.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ScienceTourPage;