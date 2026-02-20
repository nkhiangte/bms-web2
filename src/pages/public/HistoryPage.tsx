
import React from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface HistoryPageProps {
    user: User | null;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
    return (
        <div className="relative py-16">
            <div className="absolute inset-0">
                 <EditableContent 
                    id="history_bg"
                    defaultContent="https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg"
                    type="image"
                    user={user}
                    className="w-full h-full object-cover bg-fixed"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                             <EditableContent id="history_title" defaultContent="History of Bethel Mission School" type="text" user={user} />
                        </h1>
                    </div>

                    <div className="mt-12 space-y-10 text-slate-700 leading-relaxed">
                        <section>
                             <EditableContent 
                                id="history_intro" 
                                defaultContent="Bethel Mission School, situated in Bethel Veng, Champhai, Mizoram, is a private unaided co-educational institution that has grown from humble beginnings into a recognized high school with a strong legacy of nurturing young learners." 
                                type="textarea" 
                                user={user} 
                            />
                            
                            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">
                                <EditableContent id="history_foundation_title" defaultContent="Foundation and Recognition (1996)" type="text" user={user} />
                            </h3>
                             <EditableContent 
                                id="history_foundation_content" 
                                defaultContent="The school was established in 1996 by (L) R. Vanhnuaithanga near the Public Works Department complex in Bethel Veng, Champhai. From its inception, it functioned as a private unaided co-educational school, offering classes from Nursery to Class VII. In the same year, it was affiliated to the Mizoram Board of School Education (MBSE) and officially recognized by the Government of Mizoram, marking the beginning of its educational mission." 
                                type="textarea" 
                                user={user} 
                            />
                            
                            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">
                                <EditableContent id="history_leadership_title" defaultContent="Change in Leadership (2001)" type="text" user={user} />
                            </h3>
                             <EditableContent 
                                id="history_leadership_content" 
                                defaultContent="In 2001, the proprietorship of the school changed hands, and Mrs. K. Malsawmdawngi became the new principal and owner. Under her leadership, the institution continued as a privately managed unaided school, entering a new phase of consistent progress and development." 
                                type="textarea" 
                                user={user} 
                            />
                            
                            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">
                                <EditableContent id="history_expansion_title" defaultContent="Expansion to High School and Relocation (2005–2008)" type="text" user={user} />
                            </h3>
                             <EditableContent 
                                id="history_expansion_content" 
                                defaultContent="The year 2005 brought a major milestone with the introduction of Class VIII, laying the foundation for the school’s high school section. That same year, the school shifted to its present site at the northernmost part of Champhai town, offering a more spacious and permanent location.
In 2007, the first batch of Class X students graduated, though they had to appear under another school’s name since the high school section had not yet been recognized. A separate school office was also constructed and utilized in the same year.
The following year, in 2008, the High School section was officially recognized, enabling students to appear in the HSLC examinations under the school’s own name." 
                                type="textarea" 
                                user={user} 
                            />
                            
                            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">
                                 <EditableContent id="history_growth_title" defaultContent="Infrastructure Growth (2015–Present)" type="text" user={user} />
                            </h3>
                             <EditableContent 
                                id="history_growth_content" 
                                defaultContent="With student numbers steadily increasing, the administration took active steps to expand infrastructure. In March 2015, construction began to extend the school building, and by April 2015, the original two-storey building had been upgraded into a three-storey structure.
Continuing to strengthen its facilities, in 2022, the construction of a new and separate RCC building was initiated to meet the growing academic and extracurricular needs. This project is still ongoing, reflecting the school’s commitment to progress." 
                                type="textarea" 
                                user={user} 
                            />

                            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">
                                 <EditableContent id="history_legacy_title" defaultContent="Legacy" type="text" user={user} />
                            </h3>
                             <EditableContent 
                                id="history_legacy_content" 
                                defaultContent="From its modest beginnings near the PWD complex to its present standing as a recognized private unaided high school, Bethel Mission School has been a cornerstone of education in Champhai for nearly three decades. Guided by strong leadership, dedicated staff, and the trust of the community, the school continues to grow while upholding its mission to provide quality education and shape the future of young learners in Mizoram." 
                                type="textarea" 
                                user={user} 
                            />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HistoryPage;
