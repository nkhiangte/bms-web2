import React from 'react';

const QuizClubPage: React.FC = () => {
    return (
        <div className="relative py-16">
            <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{backgroundImage:"url('https://i.ibb.co/Fm821pQ/quiz-hero.jpg')"}}></div>
            <div className="absolute inset-0 bg-black/75"></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-white">Quiz Club</h1>
                        <p className="mt-4 text-lg text-slate-400">Igniting Minds, Fostering Curiosity</p>
                    </div>
                    <div className="space-y-8 text-slate-300 leading-relaxed">
                        <section>
                            <p>The Quiz Club at Bethel Mission School is a vibrant hub for students who have a thirst for knowledge and a competitive spirit. Our mission is to encourage students to look beyond their textbooks, explore the world of general knowledge, and develop critical thinking and quick recall skills.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Our Activities</h2>
                            <p>We believe in learning through engagement. The club organizes a variety of activities throughout the year:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong className="text-white">Weekly Quizzes:</strong> Regular informal quizzes on current affairs, science, history, and literature.</li>
                                <li><strong className="text-white">Inter-House Competitions:</strong> An annual quiz competition where students represent their houses.</li>
                                <li><strong className="text-white">Specialized Workshops:</strong> Sessions on effective quizzing techniques and memory skills.</li>
                                <li><strong className="text-white">External Competitions:</strong> We actively train students for inter-school, district, and state-level quiz competitions.</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong className="text-white">Winners</strong> of the District Level Inter-School Quiz Competition (2023).</li>
                                <li><strong className="text-white">Runners-up</strong> at the State Level General Knowledge Olympiad (2022).</li>
                                <li>Consistent participation and commendable performance in various regional quiz events.</li>
                            </ul>
                        </section>
                    </div>
                    <div className="mt-12 pt-8 border-t border-zinc-700">
                        <h2 className="text-2xl font-bold text-center text-white mb-8">Club Moments</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <figure>
                                <img src="https://i.ibb.co/3zd8xXQ/quiz-1.jpg" alt="A student concentrating during a quiz" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video border border-zinc-700" />
                                <figcaption className="mt-2 text-center text-sm text-slate-500 italic">Deep in thought during a challenging round.</figcaption>
                            </figure>
                            <figure>
                                <img src="https://i.ibb.co/N7B2S8M/quiz-2.jpg" alt="Students celebrating a quiz victory" className="rounded-lg shadow-md w-full h-auto object-cover aspect-video border border-zinc-700" />
                                <figcaption className="mt-2 text-center text-sm text-slate-500 italic">The thrill of victory after a successful answer.</figcaption>
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default QuizClubPage;
