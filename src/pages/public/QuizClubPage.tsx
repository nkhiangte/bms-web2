import React from 'react';

const QuizClubPage: React.FC = () => {
    return (
        <div className="relative py-12 md:py-16 bg-[#0B1F3A]">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"url('/assets/school/campus.jpg')"}}></div>
            <div className="absolute inset-0 bg-[#07162B]/85"></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white border-t-4 border-[#C9A84C] p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-10">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C]/50 px-3 py-1 rounded-full mb-3">
                            Knowledge &amp; Inquiry
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">Quiz Club</h1>
                        <p className="mt-3 text-lg text-[#132D52]/80">Igniting Minds, Fostering Curiosity</p>
                    </div>
                    <div className="space-y-8 text-[#132D52] leading-relaxed">
                        <section>
                            <p>The Quiz Club at Bethel Mission School is a vibrant hub for students who have a thirst for knowledge and a competitive spirit. Our mission is to encourage students to look beyond their textbooks, explore the world of general knowledge, and develop critical thinking and quick recall skills.</p>
                        </section>
                        <section className="p-6 bg-[#F4F7FB] rounded-xl border-l-4 border-[#C9A84C]">
                            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-3">Our Activities</h2>
                            <p>We believe in learning through engagement. The club organizes a variety of activities throughout the year:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong className="text-[#0B1F3A]">Weekly Quizzes:</strong> Regular informal quizzes on current affairs, science, history, and literature.</li>
                                <li><strong className="text-[#0B1F3A]">Inter-House Competitions:</strong> An annual quiz competition where students represent their houses.</li>
                                <li><strong className="text-[#0B1F3A]">Specialized Workshops:</strong> Sessions on effective quizzing techniques and memory skills.</li>
                                <li><strong className="text-[#0B1F3A]">External Competitions:</strong> We actively train students for inter-school, district, and state-level quiz competitions.</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-3">Achievements</h2>
                            <ul className="list-disc list-inside mt-3 space-y-2">
                                <li><strong className="text-[#0B1F3A]">Winners</strong> of the District Level Inter-School Quiz Competition (<span className="font-tabular">2023</span>).</li>
                                <li><strong className="text-[#0B1F3A]">Runners-up</strong> at the State Level General Knowledge Olympiad (<span className="font-tabular">2022</span>).</li>
                                <li>Consistent participation and commendable performance in various regional quiz events.</li>
                            </ul>
                        </section>
                    </div>
                    <div className="mt-12 pt-8 border-t border-[#C9A84C]/40">
                        <h2 className="text-2xl font-bold text-center text-[#0B1F3A] mb-8">Club Moments</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <figure>
                                <img
                                    src="https://i.ibb.co/3zd8xXQ/quiz-1.jpg"
                                    alt="A student concentrating during a quiz"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
                                    className="rounded-xl shadow-md w-full h-auto object-cover aspect-video border border-[#0B1F3A]/15"
                                />
                                <figcaption className="mt-2 text-center text-sm text-[#132D52]/75 italic">Deep in thought during a challenging round.</figcaption>
                            </figure>
                            <figure>
                                <img
                                    src="https://i.ibb.co/N7B2S8M/quiz-2.jpg"
                                    alt="Students celebrating a quiz victory"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
                                    className="rounded-xl shadow-md w-full h-auto object-cover aspect-video border border-[#0B1F3A]/15"
                                />
                                <figcaption className="mt-2 text-center text-sm text-[#132D52]/75 italic">The thrill of victory after a successful answer.</figcaption>
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default QuizClubPage;
