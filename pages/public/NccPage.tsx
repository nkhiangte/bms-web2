
import React, { useState } from 'react';
import EditableContent from '../../components/EditableContent';
import DynamicImageGrid from '../../components/DynamicImageGrid';
import { User } from '../../types';

interface NccPageProps {
    user: User | null;
}

const NccPage: React.FC<NccPageProps> = ({ user }) => {
    return (
        <>
            <div className="relative py-16">
                <div className="absolute inset-0">
                    <EditableContent
                        id="ncc_hero_bg"
                        defaultContent="https://i.ibb.co/Pv7Ywf08/481219402-1045908077568568-4366507493258612299-n.jpg"
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
                                <EditableContent id="ncc_title" defaultContent="National Cadet Corps (NCC)" type="text" user={user} />
                            </h1>
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <EditableContent 
                                id="ncc_content_p1" 
                                defaultContent="The National Cadet Corps (NCC) in our school serves as a platform for students who wish to cultivate discipline, leadership, and a spirit of service to the nation. Introduced in 2021, the NCC has become a preliminary training ground for young minds who aspire to contribute to society and the country with dedication and responsibility." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="ncc_content_p2" 
                                defaultContent="Since its establishment, the unit has successfully organized and participated in two training camps – in 2023 and 2025. These camps provided cadets with rigorous physical training, drills, and lessons in teamwork, all of which are essential qualities for shaping future leaders. Beyond the physical aspect, cadets also gained valuable exposure to values such as resilience, commitment, and patriotism." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="ncc_content_p3" 
                                defaultContent="Our cadets have consistently excelled and brought recognition to the school. In the 2023 training camp, Pausawmdawngzela was awarded the title of Best Junior Cadet, a proud achievement for both the individual and the institution. Continuing this tradition of excellence, in 2025, Thanglianzauva received the same honor, further highlighting the commitment and capabilities of our NCC students." 
                                type="textarea" 
                                user={user} 
                            />
                            <EditableContent 
                                id="ncc_content_p4" 
                                defaultContent="The school remains committed to supporting and strengthening the NCC program, seeing it not just as an extracurricular activity, but as a foundation for nurturing responsible citizens and inspiring future leaders. Through the NCC, our students are encouraged to embrace discipline, courage, and a lifelong passion for serving the nation." 
                                type="textarea" 
                                user={user} 
                            />
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                                <EditableContent id="ncc_gallery_title" defaultContent="NCC in Pictures" type="text" user={user} />
                            </h2>
                            <DynamicImageGrid id="ncc_gallery" user={user} displayType="grid" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NccPage;
