import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

interface StudentLifePageProps { user: User | null; }

const GeneralActivityCard: React.FC<{id:string;title:string;description:string;link?:string;user:User|null}> = ({id,title,description,link,user}) => (
    <div className="p-6 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg flex flex-col h-full">
        <h3 className="text-2xl font-bold text-sky-400">
            <EditableContent id={`${id}_title`} defaultContent={title} type="text" user={user} />
        </h3>
        <div className="mt-3 text-slate-300 flex-grow">
            <EditableContent id={`${id}_desc`} defaultContent={description} type="textarea" user={user} />
        </div>
        {link && <Link to={link} className="mt-4 inline-block font-semibold text-sky-400 hover:text-sky-300 self-start">Learn More &rarr;</Link>}
    </div>
);

const ClubSection: React.FC<{id:string;icon:string;title:string;defaultContent:string;link?:string;user:User|null}> = ({id,icon,title,defaultContent,link,user}) => (
    <section className="p-6 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors">
        <h3 className="text-2xl font-bold text-sky-400 flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <EditableContent id={`${id}_title`} defaultContent={title} type="text" user={user} />
        </h3>
        <div className="mt-3 text-slate-300 space-y-3 leading-relaxed">
            <EditableContent id={`${id}_content`} defaultContent={defaultContent} type="textarea" user={user} />
        </div>
        {link && <Link to={link} className="mt-4 inline-block font-semibold text-sky-400 hover:text-sky-300">Learn More &rarr;</Link>}
    </section>
);

const StudentLifePage: React.FC<StudentLifePageProps> = ({ user }) => {
    return (
        <div className="relative py-16">
            <div className="absolute inset-0">
                <EditableContent id="student_life_bg" defaultContent="https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png" type="image" user={user} className="w-full h-full object-cover bg-fixed" />
                <div className="absolute inset-0 bg-black/75 pointer-events-none"></div>
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            <EditableContent id="student_life_title" defaultContent="Student Life" type="text" user={user} />
                        </h1>
                        <div className="mt-4 text-lg text-slate-400">
                            <EditableContent id="student_life_subtitle" defaultContent="Learning Beyond the Classroom" type="text" user={user} />
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <GeneralActivityCard id="sl_sports" title="Sports" description="Football, Basketball, Volleyball, and Athletics programs to promote physical fitness and teamwork." link="/achievements/sports" user={user} />
                            <GeneralActivityCard id="sl_arts" title="Arts & Culture" description="Clubs for music, dance, drama, and visual arts to nurture creativity." link="/arts-culture" user={user} />
                        </div>
                        <div className="mt-8">
                            <GeneralActivityCard id="sl_community" title="Community Service" description="Instilling a sense of social responsibility through various outreach programs." user={user} />
                        </div>
                    </div>
                    <div className="mt-16">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                                <span className="text-4xl">🌱</span>
                                <EditableContent id="sl_clubs_heading" defaultContent="Clubs & Societies" type="text" user={user} />
                            </h2>
                        </div>
                        <div className="space-y-8">
                            <ClubSection id="club_eco" icon="🌿" title="Eco Club" link="/eco-club" user={user} defaultContent="Our Eco Club inspires students to care for the planet through tree plantation drives, clean-up campaigns, waste-reduction projects, and awareness rallies." />
                            <ClubSection id="club_ncc" icon="🎖️" title="NCC (National Cadet Corps)" link="/ncc" user={user} defaultContent="The NCC program instills discipline, leadership, and a spirit of national service in our students. Cadets participate in training camps, drills, and community activities." />
                            <ClubSection id="club_science" icon="🔬" title="Science Club" link="/achievements/science" user={user} defaultContent="Our Science Club nurtures curiosity, creativity, and innovation. Over the years, it has built a proud record of achievements at district, state, and national platforms." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentLifePage;
