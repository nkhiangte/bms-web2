
import React from 'react';
import { User } from '@/types';
import EditableContent from '@/components/EditableContent';

interface AboutPageProps {
    user: User | null;
}

const AboutPage: React.FC<AboutPageProps> = ({ user }) => {
    return (
        <div className="relative py-16">
             <div className="absolute inset-0 w-full h-full">
                <EditableContent
                    id="about_hero_bg"
                    defaultContent="https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg"
                    type="image"
                    user={user}
                    className="w-full h-full object-cover bg-fixed"
                    style={{ position: 'absolute', inset: 0 }}
                    imgAlt="About Us Background"
                />
                 <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                             <EditableContent
                                id="about_title"
                                defaultContent="About Bethel Mission School, Champhai"
                                type="text"
                                user={user}
                            />
                        </h1>
                    </div>

                    <div className="mt-12 space-y-10 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Introduction</h2>
                             <EditableContent
                                id="about_intro"
                                defaultContent="Established in 1996, Bethel Mission School has a proud legacy of academic excellence under the Mizoram Board of School Education (MBSE). Guided by our motto, 'Service to God & Men,' we consistently achieve high pass percentages and distinctions in board exams, reflecting our commitment to quality education from Nursery to Class X."
                                type="textarea"
                                user={user}
                            />
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Notable Achievements</h2>
                            <p>Our students consistently excel in the MBSE HSLC Board Examinations, with several achieving top ranks in the state. We proudly celebrate the accomplishments of:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong>2023:</strong> Esther Tingbiakmuani secured the 4th Rank.</li>
                                <li><strong>2020:</strong> Manngaihsangi achieved the 10th Rank.</li>
                                <li><strong>2019:</strong> C.L. Kimteii and R. Lalrinmawii both secured the 10th Rank.</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Vision</h2>
                             <EditableContent
                                id="about_vision"
                                defaultContent="To form young people of character and competence who honor God, serve others, and excel in learning and life."
                                type="textarea"
                                user={user}
                            />
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Mission</h2>
                             <EditableContent
                                id="about_mission"
                                defaultContent="Bethel Mission School, Champhai educates the whole child — mind, heart, and character — so each learner grows in faith-inspired values, academic excellence, and joyful service to God and fellow human beings."
                                type="textarea"
                                user={user}
                            />
                            <p className="mt-4 font-semibold">We commit to:</p>
                            <ul className="list-disc list-inside mt-2 space-y-2">
                                <li><strong>Christ-centered values & character</strong> – cultivating integrity, humility, compassion, respect, and responsibility.</li>
                                <li><strong>Academic excellence</strong> – delivering a rigorous, student-focused curriculum.</li>
                                <li><strong>Whole-child formation</strong> – encouraging growth through sports, arts, and co-curricular activities.</li>
                                <li><strong>Service & community engagement</strong> – promoting meaningful outreach and stewardship.</li>
                                <li><strong>Inclusive & safe environment</strong> – ensuring a supportive campus where every learner can flourish.</li>
                                <li><strong>Future readiness</strong> – preparing students with technology, guidance, and life skills for higher studies and purposeful careers.</li>
                            </ul>
                        </section>

                        <section className="mt-12 p-8 bg-sky-50/80 border-l-4 border-sky-500 rounded-r-lg">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Principal’s Message</h2>
                            <div className="space-y-4 italic text-slate-800">
                                 <EditableContent
                                    id="about_principal_msg"
                                    defaultContent="Welcome to Bethel Mission School, Champhai. Since our founding in 1996, our vision has been to provide quality education rooted in Christian values and dedicated to our motto, 'Service to God & Men.' It is my joy and privilege to serve as Principal and to partner with families in nurturing the next generation. At Bethel Mission School, we believe that true education goes beyond textbooks — it shapes character, builds resilience, and instills a heart for service. Our teachers are committed to providing excellent academic instruction while also fostering compassion, discipline, and leadership in our students. We aim to prepare learners not only for examinations, but for life itself — equipping them to honor God, serve their community, and contribute positively to society. I warmly invite you to visit our campus and experience the vibrant learning environment that makes Bethel Mission School unique."
                                    type="textarea"
                                    user={user}
                                />
                            </div>
                            <div className="mt-6 text-right not-italic">
                                <p className="font-bold text-slate-900">— K. Malsawmdawngi</p>
                                <p className="text-sm text-slate-700">Principal, Bethel Mission School, Champhai</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AboutPage;
