import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import EditableContent from '../../components/EditableContent';
import { User } from '../../types';

const { Link } = ReactRouterDOM as any;

interface AdmissionsPageProps {
    user: User | null;
}

const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ user }) => {
    return (
        <div className="relative py-16 min-h-screen">
             <div className="absolute inset-0">
                <EditableContent
                    id="admissions_bg"
                    defaultContent="https://i.ibb.co/7x428VJ1/IMG-4967-1.jpg"
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
                             <EditableContent id="admissions_title" defaultContent="Admission Guidelines" type="text" user={user} />
                        </h1>
                        <div className="mt-2 text-lg text-slate-600">
                             <EditableContent id="admissions_subtitle" defaultContent="Bethel Mission School, Champhai" type="text" user={user} />
                        </div>
                        <p className="mt-1 text-md italic text-slate-500">“Service to God &amp; Men”</p>
                    </div>

                    <div className="text-center my-8">
                        <Link to="/admissions/online" className="btn btn-primary !text-lg !font-bold !px-8 !py-4 transition transform hover:scale-105">
                             <EditableContent id="admissions_apply_btn" defaultContent="Apply Online Now (2026-27)" type="text" user={user} />
                        </Link>
                    </div>

                    <div className="mt-12 space-y-8 text-slate-700 leading-relaxed">
                         <EditableContent 
                            id="admissions_intro" 
                            defaultContent="Admissions are open from Nursery to Class X." 
                            type="text" 
                            user={user} 
                        />

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">Eligibility</h2>
                            <EditableContent 
                                id="admissions_eligibility" 
                                defaultContent="• **Nursery:** Child must be 5 years old by 1st April.
• **Higher classes:** Based on entrance test/interview and past records." 
                                type="textarea" 
                                user={user} 
                            />
                        </section>
                        
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">How to Apply</h2>
                            <EditableContent 
                                id="admissions_process" 
                                defaultContent="• Click the 'Apply Online' button above to fill out the form digitally.
• Alternatively, collect and fill the admission form from the school office.
• Submit the form with required documents.
• Appear for entrance test/interview for Class IX. (No new admission to Class - X)
• Admission is confirmed after selection & fee payment." 
                                type="textarea" 
                                user={user} 
                            />
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">Documents Needed</h2>
                            <EditableContent 
                                id="admissions_documents" 
                                defaultContent="• Birth Certificate (Nursery & Primary)
• Transfer Certificate & last report card (Class II onwards)
• Passport size photos (3)
• Aadhaar copy (student & parent/guardian)" 
                                type="textarea" 
                                user={user} 
                            />
                        </section>

                        <div className="mt-12 p-6 bg-slate-50/80 rounded-lg border-l-4 border-sky-500">
                             <EditableContent 
                                id="admissions_disclaimer" 
                                defaultContent="Admission is subject to availability of seats and school rules. The school reserves the right to grant or refuse admission." 
                                type="textarea" 
                                user={user} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdmissionsPage;