
import React from 'react';
import { User } from '../../types';
import EditableContent from '../../components/EditableContent';
import DynamicImageGrid from '../../components/DynamicImageGrid';

interface InfrastructurePageProps {
    user: User | null;
}

const InfrastructurePage: React.FC<InfrastructurePageProps> = ({ user }) => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative h-96 w-full">
                <EditableContent 
                    id="infra_hero_bg"
                    defaultContent="https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg"
                    type="image"
                    user={user}
                    className="absolute inset-0 w-full h-full object-cover"
                    imgAlt="Infrastructure Hero"
                />
                <div className="absolute inset-0 bg-black opacity-60 pointer-events-none"></div>
                <div className="relative container mx-auto text-center h-full flex flex-col justify-center items-center px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        <EditableContent 
                            id="infra_hero_title" 
                            defaultContent="Our Infrastructure" 
                            type="text" 
                            user={user} 
                        />
                    </h1>
                    <div className="mt-4 text-lg md:text-xl text-white font-light" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                         <EditableContent 
                            id="infra_hero_subtitle" 
                            defaultContent="Building a Strong Foundation for Future Leaders" 
                            type="text" 
                            user={user} 
                        />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="bg-slate-50 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="max-w-3xl mx-auto text-lg text-slate-600">
                             <EditableContent 
                                id="infra_intro_desc" 
                                defaultContent="Our campus is thoughtfully designed to provide a safe, stimulating, and resource-rich environment that supports academic learning, creative exploration, and physical well-being." 
                                type="textarea" 
                                user={user} 
                            />
                        </div>
                    </div>
                    
                    {/* Dynamic Grid for Infrastructure Items */}
                    <DynamicImageGrid id="infrastructure_grid" user={user} />
                </div>
            </div>
        </>
    );
};

export default InfrastructurePage;
