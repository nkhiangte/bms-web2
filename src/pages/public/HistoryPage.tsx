import React from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface HistoryPageProps { user: User | null; }

const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
    return (
        <div className="relative py-12 sm:py-16 bg-[#0B1F3A]">
            <div className="absolute inset-0">
                <EditableContent id="history_bg" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#07162B]/85 pointer-events-none" />
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-[#132D52]/95 border border-[#C9A84C]/35 p-6 sm:p-10 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Since 1996 &middot; Champhai, Mizoram</p>
                        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                            <EditableContent id="history_title" defaultContent="History of Bethel Mission School" type="text" user={user} />
                        </h1>
                    </div>
                    <div className="mt-10 space-y-6 text-white/85 leading-relaxed text-sm sm:text-base">
                        <section>
                            <EditableContent id="history_intro" defaultContent="Bethel Mission School, situated in Bethel Veng, Champhai, Mizoram, is a private unaided co-educational institution that has grown from humble beginnings into a recognized high school with a strong legacy of nurturing young learners." type="textarea" user={user} />
                            <h3 className="text-xl font-bold text-[#DFC06B] mt-6 mb-2">
                                <EditableContent id="history_foundation_title" defaultContent="Foundation and Recognition (1996)" type="text" user={user} />
                            </h3>
                            <EditableContent id="history_foundation_content" defaultContent="The school was established in 1996 by (L) R. Vanhnuaithanga near the PWD complex in Bethel Veng, Champhai. From its inception, it functioned as a private unaided co-educational school." type="textarea" user={user} />
                            <h3 className="text-xl font-bold text-[#DFC06B] mt-6 mb-2">
                                <EditableContent id="history_leadership_title" defaultContent="Change in Leadership (2001)" type="text" user={user} />
                            </h3>
                            <EditableContent id="history_leadership_content" defaultContent="In 2001, the proprietorship of the school changed hands, and Mrs. K. Malsawmdawngi became the new principal and owner." type="textarea" user={user} />
                            <h3 className="text-xl font-bold text-[#DFC06B] mt-6 mb-2">
                                <EditableContent id="history_expansion_title" defaultContent="Expansion to High School and Relocation (2005–2008)" type="text" user={user} />
                            </h3>
                            <EditableContent id="history_expansion_content" defaultContent="The year 2005 brought a major milestone with the introduction of Class VIII, laying the foundation for the school's high school section." type="textarea" user={user} />
                            <h3 className="text-xl font-bold text-[#DFC06B] mt-6 mb-2">
                                <EditableContent id="history_growth_title" defaultContent="Infrastructure Growth (2015–Present)" type="text" user={user} />
                            </h3>
                            <EditableContent id="history_growth_content" defaultContent="With student numbers steadily increasing, the administration took active steps to expand infrastructure. In March 2015, construction began to extend the school building." type="textarea" user={user} />
                            <h3 className="text-xl font-bold text-[#DFC06B] mt-6 mb-2">
                                <EditableContent id="history_legacy_title" defaultContent="Legacy" type="text" user={user} />
                            </h3>
                            <EditableContent id="history_legacy_content" defaultContent="From its modest beginnings near the PWD complex to its present standing as a recognized private unaided high school, Bethel Mission School has been a cornerstone of education in Champhai for nearly three decades." type="textarea" user={user} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HistoryPage;
