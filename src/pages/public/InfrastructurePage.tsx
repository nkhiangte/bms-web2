import React from 'react';
import { User } from '@/types';
import EditableContent from '@/components/EditableContent';
import DynamicImageGrid, { GridItem } from '@/components/DynamicImageGrid';

interface InfrastructurePageProps { user: User | null; }

const defaultInfraItems: GridItem[] = [
    { id: 'infra_1', title: 'Classrooms', caption: 'Well-ventilated and spacious classrooms designed for an optimal learning environment.', imageSrc: '/assets/school/campus.jpg' },
    { id: 'infra_2', title: 'Science Laboratories', caption: 'Fully equipped labs for Physics, Chemistry, and Biology to foster practical learning.', imageSrc: '/assets/school/campus.jpg' },
    { id: 'infra_3', title: 'Library', caption: 'A well-stocked library with a vast collection of books and learning resources.', imageSrc: '/assets/school/campus.jpg' },
    { id: 'infra_4', title: 'Playground', caption: 'Basketball and volleyball courts, and ample space for morning assembly and sports.', imageSrc: '/assets/school/campus.jpg' },
    { id: 'infra_5', title: 'School Campus', caption: 'A serene and safe environment located in Bethel Veng, Champhai.', imageSrc: '/assets/school/campus.jpg' },
    { id: 'infra_6', title: 'Activities & Events', caption: 'Dedicated spaces for art, culture, and various co-curricular activities.', imageSrc: '/assets/school/campus.jpg' },
];

const InfrastructurePage: React.FC<InfrastructurePageProps> = ({ user }) => {
    return (
        <>
            <section className="relative h-80 sm:h-96 w-full bg-[#07162B]">
                <EditableContent id="infra_hero_bg" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="absolute inset-0 w-full h-full object-cover" imgAlt="Infrastructure Hero" />
                <div className="absolute inset-0 bg-[#07162B]/80 pointer-events-none" />
                <div className="relative container mx-auto text-center h-full flex flex-col justify-center items-center px-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Campus &amp; Facilities</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                        <EditableContent id="infra_hero_title" defaultContent="Our Infrastructure" type="text" user={user} />
                    </h1>
                    <div className="mt-3 text-base sm:text-lg md:text-xl text-white/85">
                        <EditableContent id="infra_hero_subtitle" defaultContent="Building a Strong Foundation for Future Leaders" type="text" user={user} />
                    </div>
                </div>
            </section>
            <div className="bg-[#0B1F3A] py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="max-w-3xl mx-auto text-base sm:text-lg text-white/80">
                            <EditableContent id="infra_intro_desc" defaultContent="Our campus is thoughtfully designed to provide a safe, stimulating, and resource-rich environment that supports academic learning, creative exploration, and physical well-being." type="textarea" user={user} />
                        </div>
                    </div>
                    <DynamicImageGrid id="infrastructure_grid" user={user} defaultItems={defaultInfraItems} />
                </div>
            </div>
        </>
    );
};
export default InfrastructurePage;
