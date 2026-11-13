import React from 'react';
import EditableContent from '@/components/EditableContent';
import DynamicImageGrid from '@/components/DynamicImageGrid';
import { User } from '@/types';

interface ArtsCulturePageProps { user: User | null; }

const ArtsCulturePage: React.FC<ArtsCulturePageProps> = ({ user }) => {
    return (
        <div className="relative py-12 md:py-16 bg-[#0B1F3A]">
            <div className="absolute inset-0">
                <EditableContent id="arts_hero_bg" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#07162B]/85 pointer-events-none"></div>
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white border-t-4 border-[#C9A84C] p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-10">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C]/50 px-3 py-1 rounded-full mb-3">
                            Culture &amp; Heritage
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                            <EditableContent id="arts_title" defaultContent="Arts & Culture" type="text" user={user} />
                        </h1>
                        <div className="mt-3 text-lg text-[#132D52]/80">
                            <EditableContent id="arts_subtitle" defaultContent="Celebrating Creativity and Heritage" type="text" user={user} />
                        </div>
                    </div>
                    <div className="space-y-8 text-[#132D52] leading-relaxed">
                        <section>
                            <EditableContent id="arts_intro" defaultContent="At Bethel Mission School, Bethel Veng, Champhai, we believe that education extends beyond academics into the nurturing of cultural identity and artistic expression." type="textarea" user={user} />
                        </section>
                        <section className="p-6 bg-[#F4F7FB] border-l-4 border-[#C9A84C] rounded-r-xl">
                            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-3">
                                <EditableContent id="arts_dance_title" defaultContent="The Dance Club: A Legacy of Excellence" type="text" user={user} />
                            </h2>
                            <EditableContent id="arts_dance_desc" defaultContent="The Dance Club of our school has been one of the most active and successful groups in showcasing this spirit." type="textarea" user={user} />
                            <div className="mt-4">
                                <EditableContent id="arts_achievements_list" defaultContent="Notable achievements include:
- 1st Prize in the Vengthlang YMA Cheerleading Competition (2014)
- 3rd Prize in the CCN Dance Competition (2015)
- 1st Prize in the Junior Category of Praise Dance (2016)
- 1st Prize in the Mizo Hnamlam Intihsiak (H/S category) in 2024" type="textarea" user={user} />
                            </div>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-3">
                                <EditableContent id="arts_event_title" defaultContent="Annual Cultural Event" type="text" user={user} />
                            </h2>
                            <EditableContent id="arts_event_desc" defaultContent="To further encourage cultural awareness and unity, the school organizes an Annual Cultural Event at the end of every calendar year." type="textarea" user={user} />
                        </section>
                    </div>
                    <div className="mt-12 pt-8 border-t border-[#C9A84C]/40">
                        <h2 className="text-2xl font-bold text-center text-[#0B1F3A] mb-8">
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
