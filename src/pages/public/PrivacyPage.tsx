import React from 'react';
import { MailIcon, PhoneIcon } from '@/components/Icons';

const PrivacyPage: React.FC = () => {
    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                    <div className="text-center mb-12 border-b border-zinc-800 pb-8">
                        <span className="text-sky-500 font-semibold tracking-wider text-xs uppercase px-3 py-1 bg-sky-950/40 border border-sky-800 rounded-full inline-block mb-3">
                            LEGAL & COMPLIANCE
                        </span>
                        <h1 id="privacy-title" className="text-3xl sm:text-4xl font-extrabold text-white">
                            Privacy Policy
                        </h1>
                        <p className="mt-4 text-sm text-slate-400 font-mono">
                            Last Updated: June 18, 2026
                        </p>
                    </div>

                    <div className="space-y-8 text-slate-300 leading-relaxed">
                        
                        {/* Section 1 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-sky-900/50 pb-2 flex items-center gap-2">
                                <span className="text-sky-500">1.</span> Introduction
                            </h2>
                            <p>
                                Bethel Mission School ("BMS", "we", "us", or "our"), located in Champhai, Mizoram, India, operates the BMS School portal website (available at <a href="https://www.bms04.com/" className="text-sky-400 hover:underline">https://www.bms04.com/</a>) and the BMS Mobile Application ("Services"). Our Services are designed to coordinate academic planning, manage student/parent portals, facilitate admissions, track grades, and streamline school communications.
                            </p>
                            <p>
                                We respect your privacy and are committed to protecting the personal data of our students, parents/guardians, faculty, and administrative staff through compliance with this policy. This Privacy Policy details how we collect, store, utilize, and protect your information.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-sky-900/50 pb-2 flex items-center gap-2">
                                <span className="text-sky-500">2.</span> Information We Collect
                            </h2>
                            <p>
                                We only collect personal information that is relevant and necessary to provide you with secure portal access, legal academic tracking, and clear institutional communications.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                    <h3 className="font-bold text-white mb-2 text-sm text-sky-400">Student & Parent Information</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1 text-slate-400">
                                        <li>Contact details (names, emails, active phone numbers)</li>
                                        <li>Student enrollment status, grade levels, and academic records</li>
                                        <li>Fees payment details and history logs</li>
                                        <li>Voluntary profile pictures for student identification</li>
                                        <li>Hostel occupancy and residential room records</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                    <h3 className="font-bold text-white mb-2 text-sm text-sky-400">Admission Applications</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1 text-slate-400">
                                        <li>Details submitted through our Online Admission forms</li>
                                        <li>Birth certificated records, family profile particulars, previous school documents</li>
                                        <li>Upi / QR-based payment verification reference IDs</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-sky-900/50 pb-2 flex items-center gap-2">
                                <span className="text-sky-500">3.</span> How We Use Your Information
                            </h2>
                            <p>
                                All collected personal and academic information is strictly processed for the educational administration of Bethel Mission School. Specifically, we use it to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
                                <li>Authenticate logins and protect user accounts (Student, Parent, and Faculty portals)</li>
                                <li>Report and track student grades, test performance, and exam routine listings</li>
                                <li>Record and monitor daily classroom or hostel attendance parameters</li>
                                <li>Notify parents regarding homework details, emergency alerts, or general notices</li>
                                <li>Assess, verify, and complete submitted online admission application processes</li>
                                <li>Store necessary historical student TC (Transfer Certificate) and service records</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-sky-900/50 pb-2 flex items-center gap-2">
                                <span className="text-sky-500">4.</span> Data Security & Storage
                            </h2>
                            <p>
                                Building a secure environment for student information is our upmost concern.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
                                <li>
                                    <strong className="text-white">Cloud Architecture:</strong> All data is securely stored on secure Google Firebase Firestore database infrastructure. Every critical database query is guarded by rigid end-to-end firestore rules to prevent unintended, unauthorized client access.
                                </li>
                                <li>
                                    <strong className="text-white">Authentication Security:</strong> Accounts and passwords are managed through Google Firebase Auth, securing logins under military-grade backend encryption protocols.
                                </li>
                                <li>
                                    <strong className="text-white">No Commerical Sharing:</strong> Bethel Mission School does NOT sell, rent, license, or share personal user details, contact logs, or student records to/with any third-party marketing companies, advertisers, or programmatic aggregators.
                                </li>
                            </ul>
                        </section>

                        {/* Section 5 - Data Deletion */}
                        <section className="p-6 bg-amber-950/25 border-l-4 border-amber-500 rounded-r-lg space-y-3">
                            <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
                                <span>5.</span> Account & Data Deletion Rights
                            </h2>
                            <p className="text-slate-300">
                                In full compliance with Google Play Store policies and regional digital data privacy acts, students, parents, and former staff members have direct control over their stored data assets and accounts. 
                            </p>
                            <p className="text-slate-300 font-semibold">
                                To completely delete your account, portal access, and all associated personal information from Bethel Mission School databases:
                            </p>
                            <div className="bg-zinc-950 p-4 rounded-lg border border-amber-900/40 text-sm space-y-2 text-slate-400">
                                <p className="text-white font-medium">Please contact the administration by sending an email request:</p>
                                <p className="flex items-center gap-2"><strong className="text-amber-400">Recipient:</strong> <a href="mailto:nkhiangte@gmail.com" className="text-sky-400 hover:underline">nkhiangte@gmail.com</a> or <a href="mailto:bms@bms04.com" className="text-sky-400 hover:underline">bms@bms04.com</a></p>
                                <p><strong className="text-amber-400">Subject:</strong> Account and Data Deletion Request</p>
                                <p><strong className="text-amber-400">Body details:</strong> Provide the student's name, registered class, and the school portal login email ID.</p>
                            </div>
                            <p className="text-sm text-slate-300 italic pt-1">
                                Upon verifying ownership, our IT administration will permanently purge all matching account credentials, registration documents, contact numbers, and profile assets from our Firebase systems within <strong>seven (7) business days</strong>.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-sky-900/50 pb-2 flex items-center gap-2">
                                <span className="text-sky-500">6.</span> Policy Updates
                            </h2>
                            <p>
                                We reserve the right to revise this Privacy Policy periodically to reflect shifts in compliance, legislative adjustments, or updates to educational portal software. Changes will be posted explicitly to this page with an adjusted revised date.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="pt-6 border-t border-zinc-800 space-y-4">
                            <h2 className="text-xl font-bold text-white">
                                Contact Information
                            </h2>
                            <p className="text-slate-400 text-sm">
                                If you have questions, feedback, or need data deletion support regarding this privacy policy, please reach out to us:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 text-sm">
                                <span className="flex items-center gap-2">
                                    <PhoneIcon className="w-5 h-5 text-sky-500" />
                                    <span>Phone: +91 9862148342</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <MailIcon className="w-5 h-5 text-sky-500" />
                                    <span>Email: <a href="mailto:bms@bms04.com" className="text-sky-400 hover:underline">bms@bms04.com</a></span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">
                                Bethel Mission School, Vengthlang, Champhai, Mizoram, India - 796321
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
