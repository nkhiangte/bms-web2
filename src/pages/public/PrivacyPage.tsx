import React from 'react';
import { MailIcon, PhoneIcon } from '@/components/Icons';

const PrivacyPage: React.FC = () => {
    return (
        <div className="bg-[#0B1F3A] py-12 sm:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-[#132D52] border border-[#C9A84C]/35 p-6 sm:p-10 md:p-12 rounded-2xl shadow-2xl">
                    <div className="text-center mb-10 border-b border-white/15 pb-8">
                        <span className="text-[#0B1F3A] font-extrabold tracking-wider text-xs uppercase px-3 py-1 bg-[#C9A84C] rounded-full inline-block mb-3">
                            LEGAL &amp; COMPLIANCE
                        </span>
                        <h1 id="privacy-title" className="text-3xl sm:text-4xl font-extrabold text-white">
                            Privacy Policy
                        </h1>
                        <p className="mt-3 text-sm text-[#DFC06B] font-tabular font-semibold">
                            Last Updated: June 18, 2026
                        </p>
                    </div>

                    <div className="space-y-8 text-white/85 leading-relaxed">

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-[#C9A84C]/35 pb-2 flex items-center gap-2">
                                <span className="text-[#DFC06B]">1.</span> Introduction
                            </h2>
                            <p>
                                Bethel Mission School (&ldquo;BMS&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), located in Champhai, Mizoram, India, operates the BMS School portal website (available at <a href="https://www.bms04.com/" className="text-[#DFC06B] hover:underline">https://www.bms04.com/</a>) and the BMS Mobile Application (&ldquo;Services&rdquo;). Our Services are designed to coordinate academic planning, manage student/parent portals, facilitate admissions, track grades, and streamline school communications.
                            </p>
                            <p>
                                We respect your privacy and are committed to protecting the personal data of our students, parents/guardians, faculty, and administrative staff through compliance with this policy. This Privacy Policy details how we collect, store, utilize, and protect your information.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-[#C9A84C]/35 pb-2 flex items-center gap-2">
                                <span className="text-[#DFC06B]">2.</span> Information We Collect
                            </h2>
                            <p>
                                We only collect personal information that is relevant and necessary to provide you with secure portal access, legal academic tracking, and clear institutional communications.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="p-4 bg-[#07162B] border border-white/15 rounded-xl">
                                    <h3 className="font-bold mb-2 text-sm text-[#DFC06B]">Student &amp; Parent Information</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1 text-white/80">
                                        <li>Contact details (names, emails, active phone numbers)</li>
                                        <li>Student enrollment status, grade levels, and academic records</li>
                                        <li>Fees payment details and history logs</li>
                                        <li>Voluntary profile pictures for student identification</li>
                                        <li>Hostel occupancy and residential room records</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-[#07162B] border border-white/15 rounded-xl">
                                    <h3 className="font-bold mb-2 text-sm text-[#DFC06B]">Admission Applications</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1 text-white/80">
                                        <li>Details submitted through our Online Admission forms</li>
                                        <li>Birth certificate records, family profile particulars, previous school documents</li>
                                        <li>UPI / QR-based payment verification reference IDs</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-[#C9A84C]/35 pb-2 flex items-center gap-2">
                                <span className="text-[#DFC06B]">3.</span> How We Use Your Information
                            </h2>
                            <p>
                                All collected personal and academic information is strictly processed for the educational administration of Bethel Mission School. Specifically, we use it to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-white/80">
                                <li>Authenticate logins and protect user accounts (Student, Parent, and Faculty portals)</li>
                                <li>Report and track student grades, test performance, and exam routine listings</li>
                                <li>Record and monitor daily classroom or hostel attendance parameters</li>
                                <li>Notify parents regarding homework details, emergency alerts, or general notices</li>
                                <li>Assess, verify, and complete submitted online admission application processes</li>
                                <li>Store necessary historical student TC (Transfer Certificate) and service records</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-[#C9A84C]/35 pb-2 flex items-center gap-2">
                                <span className="text-[#DFC06B]">4.</span> Data Security &amp; Storage
                            </h2>
                            <p>
                                Building a secure environment for student information is our utmost concern.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-white/80">
                                <li>
                                    <strong className="text-white">Cloud Architecture:</strong> All data is securely stored on Google Firebase Firestore database infrastructure. Every critical database query is guarded by rigid end-to-end firestore rules to prevent unintended, unauthorized client access.
                                </li>
                                <li>
                                    <strong className="text-white">Authentication Security:</strong> Accounts and passwords are managed through Google Firebase Auth, securing logins under backend encryption protocols.
                                </li>
                                <li>
                                    <strong className="text-white">No Commercial Sharing:</strong> Bethel Mission School does NOT sell, rent, license, or share personal user details, contact logs, or student records to/with any third-party marketing companies, advertisers, or programmatic aggregators.
                                </li>
                            </ul>
                        </section>

                        <section className="p-6 bg-[#07162B] border-l-4 border-[#C9A84C] rounded-r-xl space-y-3">
                            <h2 className="text-xl font-bold text-[#DFC06B] flex items-center gap-2">
                                <span>5.</span> Account &amp; Data Deletion Rights
                            </h2>
                            <p className="text-white/85">
                                In full compliance with Google Play Store policies and regional digital data privacy acts, students, parents, and former staff members have direct control over their stored data assets and accounts.
                            </p>
                            <p className="text-white font-semibold">
                                To completely delete your account, portal access, and all associated personal information from Bethel Mission School databases:
                            </p>
                            <div className="bg-[#132D52] p-4 rounded-xl border border-[#C9A84C]/35 text-sm space-y-2 text-white/80">
                                <p className="text-white font-bold">Please contact the administration by sending an email request:</p>
                                <p className="flex flex-wrap items-center gap-2"><strong className="text-[#DFC06B]">Recipient:</strong> <a href="mailto:nkhiangte@gmail.com" className="text-[#DFC06B] hover:underline">nkhiangte@gmail.com</a> or <a href="mailto:bms@bms04.com" className="text-[#DFC06B] hover:underline">bms@bms04.com</a></p>
                                <p><strong className="text-[#DFC06B]">Subject:</strong> Account and Data Deletion Request</p>
                                <p><strong className="text-[#DFC06B]">Body details:</strong> Provide the student&apos;s name, registered class, and the school portal login email ID.</p>
                            </div>
                            <p className="text-sm text-white/75 italic pt-1">
                                Upon verifying ownership, our IT administration will permanently purge all matching account credentials, registration documents, contact numbers, and profile assets from our Firebase systems within <strong>seven (7) business days</strong>.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-white border-b border-[#C9A84C]/35 pb-2 flex items-center gap-2">
                                <span className="text-[#DFC06B]">6.</span> Policy Updates
                            </h2>
                            <p>
                                We reserve the right to revise this Privacy Policy periodically to reflect shifts in compliance, legislative adjustments, or updates to educational portal software. Changes will be posted explicitly to this page with an adjusted revised date.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-white/15 space-y-4">
                            <h2 className="text-xl font-bold text-white">
                                Contact Information
                            </h2>
                            <p className="text-white/75 text-sm">
                                If you have questions, feedback, or need data deletion support regarding this privacy policy, please reach out to us:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 text-sm">
                                <span className="flex items-center gap-2 font-tabular">
                                    <PhoneIcon className="w-5 h-5 text-[#DFC06B]" />
                                    <span>Phone: +91 9862148342</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <MailIcon className="w-5 h-5 text-[#DFC06B]" />
                                    <span>Email: <a href="mailto:bms@bms04.com" className="text-[#DFC06B] hover:underline">bms@bms04.com</a></span>
                                </span>
                            </div>
                            <p className="text-xs text-white/60">
                                Bethel Mission School, Bethel Veng, Champhai, Mizoram, India - 796321
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
