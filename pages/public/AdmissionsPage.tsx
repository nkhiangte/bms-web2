
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const AdmissionsPage: React.FC = () => {
    return (
        <div className="relative py-16 min-h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center bg-fixed"
                style={{ backgroundImage: "url('https://i.ibb.co/7x428VJ1/IMG-4967-1.jpg')" }}
                aria-hidden="true"
            ></div>
            <div className="absolute inset-0 bg-black/25" aria-hidden="true"></div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-slate-800">Admission Guidelines</h1>
                        <p className="mt-2 text-lg text-slate-600">Bethel Mission School, Champhai</p>
                        <p className="mt-1 text-md italic text-slate-500">“Service to God &amp; Men”</p>
                    </div>

                    <div className="mt-12 space-y-8 text-slate-700 leading-relaxed">
                        <p>Admissions are open from Nursery to Class X.</p>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">Eligibility</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li><strong>Nursery:</strong> Child must be 5 years old by 1st April.</li>
                                <li><strong>Higher classes:</strong> Based on entrance test/interview and past records.</li>
                            </ul>
                        </section>
                        
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">How to Apply</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Collect and fill the admission form from the school office or <Link to="/contact" className="text-sky-600 hover:underline font-semibold">inquire online here</Link>.</li>
                                <li>Submit the form with required documents.</li>
                                <li>Appear for entrance test/interview for Class IX. (No new admission to Class - X)</li>
                                <li>Admission is confirmed after selection &amp; fee payment.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3 border-b pb-2">Documents Needed</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Birth Certificate (Nursery &amp; Primary)</li>
                                <li>Transfer Certificate &amp; last report card (Class II onwards)</li>
                                <li>Passport size photos (3)</li>
                                <li>Aadhaar copy (student &amp; parent/guardian)</li>
                            </ul>
                        </section>

                        <div className="mt-12 p-6 bg-slate-50/80 rounded-lg border-l-4 border-sky-500">
                             <p>Admission is subject to availability of seats and school rules.</p>
                             <p className="font-semibold">The school reserves the right to grant or refuse admission.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdmissionsPage;
