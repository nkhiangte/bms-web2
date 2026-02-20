
import React from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface SuppliesPageProps {
    user: User | null;
}

const SuppliesPage: React.FC<SuppliesPageProps> = ({ user }) => {
    return (
        <div className="relative py-16 min-h-screen">
             <div className="absolute inset-0">
                <EditableContent
                    id="supplies_bg"
                    defaultContent="https://i.ibb.co/hZ8bQ2y/school-supplies-background.jpg"
                    type="image"
                    user={user}
                    className="w-full h-full object-cover bg-fixed"
                />
                 <div className="absolute inset-0 bg-black/25 pointer-events-none"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-slate-800">
                            <EditableContent id="supplies_title" defaultContent="School Supplies" type="text" user={user} />
                        </h1>
                        <div className="mt-4 text-lg text-slate-600">
                             <EditableContent id="supplies_subtitle" defaultContent="Information on uniforms, books, and stationery." type="text" user={user} />
                        </div>
                    </div>

                    <div className="mt-12 space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">
                                <EditableContent id="supplies_uniform_title" defaultContent="School Uniform" type="text" user={user} />
                            </h2>
                             <EditableContent 
                                id="supplies_uniform_content" 
                                defaultContent="All students are required to wear the prescribed school uniform on all working days. The uniform policy is strictly enforced to promote a sense of discipline and belonging. Uniforms are available at the designated school store." 
                                type="textarea" 
                                user={user} 
                            />
                        </section>
                        
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">
                                 <EditableContent id="supplies_books_title" defaultContent="Textbooks & Stationery" type="text" user={user} />
                            </h2>
                             <EditableContent 
                                id="supplies_books_content" 
                                defaultContent="A list of prescribed textbooks for each class will be provided at the beginning of the academic session. Parents are requested to procure the books and necessary stationery items before the classes commence. Some items may be available at the school supply store." 
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
export default SuppliesPage;
