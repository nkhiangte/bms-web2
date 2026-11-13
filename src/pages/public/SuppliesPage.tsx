import React from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface SuppliesPageProps { user: User | null; }

const SuppliesPage: React.FC<SuppliesPageProps> = ({ user }) => {
    return (
        <div className="relative py-12 sm:py-16 min-h-screen bg-[#0B1F3A]">
            <div className="absolute inset-0">
                <EditableContent id="supplies_bg" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#07162B]/85 pointer-events-none" />
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-[#132D52]/95 border border-[#C9A84C]/35 p-6 sm:p-10 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Student Requirements</p>
                        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
                            <EditableContent id="supplies_title" defaultContent="School Supplies" type="text" user={user} />
                        </h1>
                        <div className="mt-3 text-base sm:text-lg text-white/80">
                            <EditableContent id="supplies_subtitle" defaultContent="Information on uniforms, books, and stationery." type="text" user={user} />
                        </div>
                    </div>
                    <div className="mt-10 space-y-8 text-white/85 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-[#DFC06B] mb-3 border-b border-[#C9A84C]/35 pb-2">
                                <EditableContent id="supplies_uniform_title" defaultContent="School Uniform" type="text" user={user} />
                            </h2>
                            <EditableContent id="supplies_uniform_content" defaultContent="All students are required to wear the prescribed school uniform on all working days. The uniform policy is strictly enforced to promote a sense of discipline and belonging. Uniforms are available at the designated school store." type="textarea" user={user} />
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-[#DFC06B] mb-3 border-b border-[#C9A84C]/35 pb-2">
                                <EditableContent id="supplies_books_title" defaultContent="Textbooks & Stationery" type="text" user={user} />
                            </h2>
                            <EditableContent id="supplies_books_content" defaultContent="A list of prescribed textbooks for each class will be provided at the beginning of the academic session. Parents are requested to procure the books and necessary stationery items before the classes commence. Some items may be available at the school supply store." type="textarea" user={user} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SuppliesPage;
