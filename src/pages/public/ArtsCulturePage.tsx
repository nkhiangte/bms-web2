
import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import EditableContent from '../../components/EditableContent';
import DynamicImageGrid from '../../components/DynamicImageGrid';
import { User } from '../../types';

const { Link } = ReactRouterDOM as any;

interface ArtsCulturePageProps {
    user: User | null;
}

const ArtsCulturePage: React.FC<ArtsCulturePageProps> = ({ user }) => {
    return (
        <div className="relative py-16">
            <div className="absolute inset-0">
                <EditableContent
                    id="arts_hero_bg"
                    defaultContent="https://i.ibb.co/jPvswhZt/473249294-1015300233962686-4114946528800957864-n.jpg"
                    type="image"
                    user={user}
                    className="w-full h-full object-cover bg-fixed"
                />
                <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                            <EditableContent id="arts_title" defaultContent="Arts & Culture" type="text" user={user} />
                        </h1>
                        <div className="mt-4 text-lg text-slate-600">
                             <EditableContent id="arts_subtitle" defaultContent="Celebrating Creativity and Heritage" type="text" user={user} />
                        </div>
                    </div>

                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <EditableContent 
                                id="arts_intro" 
                                defaultContent="At Bethel Mission School, Bethel Veng, Champhai, we believe that education extends beyond academics into the nurturing of cultural identity and artistic expression. Our students are encouraged to celebrate creativity, embrace their heritage, and use art as a medium for awareness and unity. The school provides a vibrant platform for music, dance, drama, and cultural performances, ensuring that every student can discover and develop their talents." 
                                type="textarea" 
                                user={user} 
                            />
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">
                                <EditableContent id="arts_dance_title" defaultContent="The Dance Club: A Legacy of Excellence" type="text" user={user} />
                            </h2>
                            <EditableContent 
                                id="arts_dance_desc" 
                                defaultContent="The Dance Club of our school has been one of the most active and successful groups in showcasing this spirit. Over the years, our students have excelled in various cultural competitions, winning recognition both within and outside the district." 
                                type="textarea" 
                                user={user} 
                            />
                             <div className="mt-4">
                                <EditableContent 
                                    id="arts_achievements_list" 
                                    defaultContent="Notable achievements include:
- 1st Prize in the Vengthlang YMA Cheerleading Competition (2014)
- 3rd Prize in the CCN Dance Competition (2015)
- 1st Prize in the Junior Category of Praise Dance (2016)
- 1st Prize in the Mizo Hnamlam Intihsiak (H/S category) in 2024
- 3rd Prize in the Mob Dance on HIV Awareness (2024)" 
                                    type="textarea" 
                                    user={user} 
                                />
                            </div>
                        </section>

                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-4">
                                <EditableContent id="arts_event_title" defaultContent="Annual Cultural Event" type="text" user={user} />
                            </h2>
                             <EditableContent 
                                id="arts_event_desc" 
                                defaultContent="To further encourage cultural awareness and unity, the school organizes an Annual Cultural Event at the end of every calendar year. This celebration is a showcase of traditional and modern art forms, including dances, songs, dramas, and creative displays by students. It provides an opportunity for every learner to experience the richness of Mizo culture while also embracing diversity and new ideas. The event stands as a testimony to the school’s commitment to holistic education, where arts and culture are cherished as essential to shaping confident, well-rounded individuals." 
                                type="textarea" 
                                user={user} 
                            />
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                            <EditableContent id="arts_gallery_title" defaultContent="Glimpses of Our Culture" type="text" user={user} />
                        </h2>
                        <DynamicImageGrid id="arts_culture_gallery" user={user} displayType="grid" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtsCulturePage;
