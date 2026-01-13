
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const GeneralActivityCard: React.FC<{ title: string; description: string; link?: string }> = ({ title, description, link }) => (
    <div className="p-6 bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-sky-700">{title}</h3>
        <p className="mt-3 text-slate-700 flex-grow">{description}</p>
        {link && (
            <Link to={link} className="mt-4 inline-block font-semibold text-sky-600 hover:text-sky-800 self-start">
                Learn More &rarr;
            </Link>
        )}
    </div>
);

const ClubSection: React.FC<{ icon: string; title: string; children: React.ReactNode; link?: string }> = ({ icon, title, children, link }) => (
    <section className="p-6 bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 transition-shadow hover:shadow-md">
        <h3 className="text-2xl font-bold text-sky-700 flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            {title}
        </h3>
        <div className="mt-3 text-slate-700 space-y-3 leading-relaxed">
            {children}
        </div>
        {link && (
            <Link to={link} className="mt-4 inline-block font-semibold text-sky-600 hover:text-sky-800 self-start">
                Learn More &rarr;
            </Link>
        )}
    </section>
);


const StudentLifePage: React.FC = () => {
    const generalActivities = [
        { name: 'Sports', description: 'Football, Basketball, Volleyball, and Athletics programs to promote physical fitness and teamwork.', link: '/achievements/sports' },
        { name: 'Arts & Culture', description: 'Clubs for music, dance, drama, and visual arts to nurture creativity.', link: '/arts-culture' },
    ];
    
    return (
        <div className="relative py-16">
            <div 
                className="absolute inset-0 bg-cover bg-center bg-fixed" 
                style={{ backgroundImage: "url('https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png')" }}
            ></div>
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Student Life</h1>
                        <p className="mt-4 text-lg text-slate-600">Learning Beyond the Classroom</p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {generalActivities.map(activity => (
                                <GeneralActivityCard key={activity.name} title={activity.name} description={activity.description} link={activity.link} />
                            ))}
                        </div>
                        <div className="mt-8">
                            <GeneralActivityCard title="Community Service" description="Instilling a sense of social responsibility through various outreach programs." />
                        </div>
                    </div>

                    <div className="mt-16">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
                                <span className="text-4xl">🌱</span>
                                Clubs & Societies
                            </h2>
                        </div>
                        <div className="space-y-8">
                            <ClubSection icon="🌿" title="Eco Club" link="/eco-club">
                                <p>Our Eco Club inspires students to care for the planet through tree plantation drives, clean-up campaigns, waste-reduction projects, and awareness rallies. Students actively engage in both school and community projects to promote sustainable living.</p>
                            </ClubSection>
                            
                            <ClubSection icon="🎖️" title="NCC (National Cadet Corps)" link="/ncc">
                                <p>The NCC program instills discipline, leadership, and a spirit of national service in our students. Cadets participate in training camps, drills, and community activities, building character and patriotism. Our unit has a proud tradition of excellence, with cadets winning accolades at district and state levels.</p>
                            </ClubSection>
                            
                            <ClubSection icon="🔬" title="Science Club" link="/achievements/science">
                                <p>Our Science Club nurtures curiosity, creativity, and innovation. Over the years, it has built a proud record of achievements at district, state, and national platforms.</p>
                                <h4 className="font-semibold text-slate-700 mt-4">Highlights of Achievements:</h4>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Children’s Science Congress – District & State participation 14 times; represented Mizoram at the National level 5 times.</li>
                                    <li>State Science, Mathematics & Environment Exhibition – Won State Award 5 times; represented Mizoram at the JNSMEE, Bhopal (2017).</li>
                                    <li>INSPIRE Award – MANAK – Received incentive awards 5 times; represented at New Delhi 3 times, with one upcoming participation.</li>
                                </ul>
                            </ClubSection>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLifePage;
