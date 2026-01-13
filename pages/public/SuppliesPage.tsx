import React from 'react';

const SuppliesPage: React.FC = () => {
    return (
        <div className="relative py-16 min-h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center bg-fixed"
                style={{ backgroundImage: "url('https://i.ibb.co/hZ8bQ2y/school-supplies-background.jpg')" }}
                aria-hidden="true"
            ></div>
            <div className="absolute inset-0 bg-black/25" aria-hidden="true"></div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-slate-800">School Supplies</h1>
                        <p className="mt-4 text-lg text-slate-600">Information on uniforms, books, and stationery.</p>
                    </div>

                    <div className="mt-12 space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">School Uniform</h2>
                            <p>All students are required to wear the prescribed school uniform on all working days. The uniform policy is strictly enforced to promote a sense of discipline and belonging. Uniforms are available at the designated school store.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">Textbooks & Stationery</h2>
                            <p>A list of prescribed textbooks for each class will be provided at the beginning of the academic session. Parents are requested to procure the books and necessary stationery items before the classes commence. Some items may be available at the school supply store.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SuppliesPage;