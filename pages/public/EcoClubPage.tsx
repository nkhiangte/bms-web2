
import React from 'react';
import EditableContent from '../../components/EditableContent';
import DynamicImageGrid from '../../components/DynamicImageGrid';
import { User } from '../../types';

interface EcoClubPageProps {
    user: User | null;
}

const EcoClubPage: React.FC<EcoClubPageProps> = ({ user }) => {

    return (
        <>
            <div className="relative py-16">
                <div className="absolute inset-0">
                    <EditableContent
                        id="eco_hero_bg"
                        defaultContent="https://i.ibb.co/kFcQMGS/eco.jpg"
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
                                <EditableContent id="eco_title" defaultContent="Eco Club – Growing Green Together" type="text" user={user} />
                            </h1>
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <EditableContent 
                                id="eco_intro" 
                                defaultContent="The story of the Eco Club at Bethel Mission School began in 2022, when the government introduced the idea to schools across Mizoram. Our school embraced it right away, and from that moment, a new journey started — a journey of planting, cleaning, learning, and caring for the world around us." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="eco_planting" 
                                defaultContent="Every year since then, the Eco Club has made it a tradition to plant trees and plants around our school. Watching those little saplings grow taller each year is like watching a new friend flourish beside us. It reminds us that small steps today can turn into big changes for tomorrow." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="eco_cleaning" 
                                defaultContent="But our efforts do not stop at the school gate. With brooms, gloves, and a lot of energy, the Eco Club students often step out into the Bethel Veng locality for cleaning drives. These community activities not only make our surroundings cleaner but also bring us closer to the people living around us." 
                                type="textarea" 
                                user={user} 
                            />
                             <EditableContent 
                                id="eco_trip" 
                                defaultContent="One of the highlights of our Eco Club adventure was the three-day trip to Murlen National Park by our Class IX students in December 2023. Surrounded by lush forests, rare plants, and the calls of birds, the students experienced nature like never before. It was a lesson no classroom could teach — one that left us in awe of how beautiful and fragile our environment is." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="eco_maa" 
                                defaultContent="In 2025, we took part in a very special programme called “Ek Ped Maa Ke Naam”. Together with our parents, we planted 10 trees. It was more than just planting; it was about honoring mothers and the nurturing role they play, just like trees do for the earth. That day, students and parents stood side by side, hands muddy but hearts proud." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="eco_conclusion" 
                                defaultContent="The Eco Club of Bethel Mission School is more than just a club — it is a family of young caretakers of the earth. With every plant we nurture and every space we clean, we are learning to live responsibly and lovingly with nature. And this is only the beginning of our story. 🌱" 
                                type="textarea" 
                                user={user} 
                            />
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                             <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                                <EditableContent id="eco_gallery_title" defaultContent="Club Activities in Pictures" type="text" user={user} />
                            </h2>
                            <DynamicImageGrid id="eco_club_gallery" user={user} displayType="grid" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EcoClubPage;
