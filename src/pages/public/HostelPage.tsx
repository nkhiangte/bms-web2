import React, { useState, FormEvent } from 'react';
import { ShieldCheckIcon, UsersIcon, BookOpenIcon, BuildingOfficeIcon, PhoneIcon, MailIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import DynamicImageGrid from '@/components/DynamicImageGrid';
import { User } from '@/types';

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

const InfoBadge: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <div className="flex items-center gap-2 bg-[#07162B]/85 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-[#C9A84C]/50">
        <span className="text-[#DFC06B]">{icon}</span><span>{text}</span>
    </div>
);

const FacilityCard: React.FC<{ title: string, description: string, id: string, user: User | null }> = ({ title, description, id, user }) => (
    <div className="bg-[#132D52] border border-[#C9A84C]/30 p-6 rounded-xl shadow-md hover:border-[#C9A84C] transition-all">
        <h3 className="text-xl font-bold text-[#DFC06B]">
            <EditableContent id={`${id}_title`} defaultContent={title} type="text" user={user} />
        </h3>
        <div className="mt-2 text-white/80 text-sm sm:text-base">
            <EditableContent id={`${id}_desc`} defaultContent={description} type="textarea" user={user} />
        </div>
    </div>
);

interface HostelPageProps { user: User | null; }

const HostelPage: React.FC<HostelPageProps> = ({ user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleContactSubmit = (e: FormEvent) => {
        e.preventDefault();
        const subject = "Hostel Inquiry";
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:bms@bms04.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setIsSubmitted(true);
    };

    return (
        <div className="bg-[#0B1F3A]">
            <section id="home" className="relative h-[460px] sm:h-[500px] w-full">
                <div className="absolute inset-0">
                    <EditableContent id="hostel_hero_bg" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#07162B]/80 pointer-events-none" />
                </div>
                <div className="relative container mx-auto text-center h-full flex flex-col justify-center items-center px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white">
                        <EditableContent id="hostel_hero_title" defaultContent="Bethel Mission School Hostel" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-base sm:text-lg md:text-xl text-white/85">
                        <EditableContent id="hostel_hero_subtitle" defaultContent="A safe, supportive, and disciplined home for our students." type="text" user={user} />
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <a href="#admissions" className="btn btn-primary !px-7 !py-3 !text-base">Apply Now</a>
                        <a href="#fees" className="min-h-[44px] inline-flex items-center justify-center px-7 py-3 rounded-lg bg-[#07162B] border border-[#C9A84C] text-white font-bold hover:bg-[#132D52] transition-colors">View Fees</a>
                    </div>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <InfoBadge icon={<ShieldCheckIcon className="w-4 h-4" />} text="24/7 Safety" />
                        <InfoBadge icon={<UsersIcon className="w-4 h-4" />} text="Experienced Wardens" />
                        <InfoBadge icon={<BookOpenIcon className="w-4 h-4" />} text="Supervised Study" />
                        <InfoBadge icon={<BuildingOfficeIcon className="w-4 h-4" />} text="Separate Blocks" />
                    </div>
                </div>
            </section>

            <section id="about" className="py-16 bg-[#07162B]">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">
                            <EditableContent id="hostel_about_title" defaultContent="A Nurturing Environment for Growth" type="text" user={user} />
                        </h2>
                        <div className="mt-4 text-white/80 leading-relaxed">
                            <EditableContent id="hostel_about_desc" defaultContent="Our hostel is an integral part of the Bethel Mission School experience, providing a disciplined and caring environment that supports academic focus and personal development." type="textarea" user={user} />
                        </div>
                    </div>
                    <div className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-[#DFC06B] mb-4">Key Facts</h3>
                        <ul className="space-y-3 text-white/85">
                            <li className="flex items-center gap-3"><MapPinIcon className="w-6 h-6 text-[#DFC06B]" /><div><strong className="text-white">Location:</strong> Bethel Veng, Champhai</div></li>
                            <li className="flex items-center gap-3"><UsersIcon className="w-6 h-6 text-[#DFC06B]" /><div><strong className="text-white">Capacity:</strong> Approx. 70 students (Boys &amp; Girls)</div></li>
                            <li className="flex items-center gap-3"><ClockIcon className="w-6 h-6 text-[#DFC06B]" /><div><strong className="text-white">Established:</strong> 1996</div></li>
                        </ul>
                    </div>
                </div>
            </section>

            <section id="facilities" className="py-16 bg-[#0B1F3A]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-white">Our Facilities</h2>
                        <p className="mt-2 text-white/75">Everything students need for a comfortable and productive stay.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FacilityCard id="hostel_fac_1" user={user} title="Dining Hall" description="Serving fresh, nutritious, and hygienic meals three times a day." />
                        <FacilityCard id="hostel_fac_2" user={user} title="Supervised Study" description="Dedicated, mandatory study hours every evening under the supervision of wardens." />
                        <FacilityCard id="hostel_fac_3" user={user} title="Clean Drinking Water" description="Purified and safe drinking water available 24/7 for all residents." />
                        <FacilityCard id="hostel_fac_4" user={user} title="Separate Buildings" description="Well-maintained and secure separate buildings for boys and girls." />
                        <FacilityCard id="hostel_fac_5" user={user} title="Safety & Security" description="Experienced wardens and staff ensure the safety and well-being of all students." />
                        <FacilityCard id="hostel_fac_6" user={user} title="Prime Location" description="Conveniently located near the school campus and playgrounds for easy access." />
                    </div>
                </div>
            </section>

            <section id="fees" className="py-16 bg-[#07162B]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10"><h2 className="text-3xl font-extrabold text-white">Rooms &amp; Fee Structure</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">Room Amenities</h3>
                            <div className="text-white/80 mb-4">
                                <EditableContent id="hostel_amenities_desc" defaultContent="Our hostel provides dormitory-style accommodation with separate buildings for boys and girls. Rooms are shared, typically accommodating 4-6 students." type="textarea" user={user} />
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-white/85">
                                <li>Dormitory-style shared rooms (4-6 beds)</li>
                                <li>Personal locker for belongings</li>
                                <li>Access to a common study hall</li>
                                <li>Prayer room for spiritual activities</li>
                                <li>Scheduled hot water facilities</li>
                            </ul>
                        </div>
                        <div className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl">
                            <h3 className="text-2xl font-bold text-white mb-2">Fee Details (Per Annum)</h3>
                            <p className="text-sm text-white/65 mb-4">Fees are subject to change. Please confirm with the hostel office.</p>
                            <table className="w-full text-left">
                                <tbody>
                                    <tr className="border-b border-white/15 text-white/85"><td className="py-2.5">Admission Fee</td><td className="py-2.5 font-tabular font-semibold text-right text-white">&#8377; 1,000</td></tr>
                                    <tr className="border-b border-white/15 text-white/85"><td className="py-2.5">Security Deposit (Refundable)</td><td className="py-2.5 font-tabular font-semibold text-right text-white">&#8377; 2,000</td></tr>
                                    <tr className="border-b border-white/15 text-white/85"><td className="py-2.5">Boarding &amp; Mess Charges</td><td className="py-2.5 font-tabular font-semibold text-right text-white">&#8377; 48,000</td></tr>
                                    <tr className="border-b border-white/15 text-white/85"><td className="py-2.5">Miscellaneous Charges</td><td className="py-2.5 font-tabular font-semibold text-right text-white">&#8377; 1,000</td></tr>
                                    <tr className="bg-[#07162B] text-[#DFC06B]"><td className="py-2.5 font-bold px-2">Total</td><td className="py-2.5 font-tabular font-bold text-right px-2">&#8377; 52,000</td></tr>
                                </tbody>
                            </table>
                            <a href="#contact" className="mt-6 btn btn-primary w-full block text-center">Inquire at Office</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="admissions" className="py-16 bg-[#0B1F3A]">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-extrabold text-white">Admission Process</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-white/75">Admission to the hostel is exclusively for students enrolled at Bethel Mission School.</p>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl">
                            <div className="font-tabular text-3xl font-extrabold text-[#DFC06B] mb-2">01</div>
                            <h3 className="text-xl font-bold text-white">Application</h3>
                            <p className="mt-2 text-white/75">Obtain the hostel application form from the school office during admission period.</p>
                        </div>
                        <div className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl">
                            <div className="font-tabular text-3xl font-extrabold text-[#DFC06B] mb-2">02</div>
                            <h3 className="text-xl font-bold text-white">Submission</h3>
                            <p className="mt-2 text-white/75">Submit the filled form along with required documents (Aadhaar, Photos) to the office.</p>
                        </div>
                        <div className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl">
                            <div className="font-tabular text-3xl font-extrabold text-[#DFC06B] mb-2">03</div>
                            <h3 className="text-xl font-bold text-white">Confirmation</h3>
                            <p className="mt-2 text-white/75">Once approved, pay the admission and security deposit fees to confirm your seat.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="hostel-life" className="py-16 bg-[#07162B]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10"><h2 className="text-3xl font-extrabold text-white">Life at the Hostel</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">A Day in the Life</h3>
                            <div className="text-white/75 mb-4">
                                <EditableContent id="hostel_routine_desc" defaultContent="Our daily routine is structured to balance academics, recreation, and personal growth." type="textarea" user={user} />
                            </div>
                            <ul className="space-y-2">
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">5:30 AM</strong><span>Wake Up &amp; Morning Chores</span></li>
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">7:00 AM</strong><span>Breakfast</span></li>
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">8:00 AM</strong><span>Prepare for School</span></li>
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">4:00 PM</strong><span>Return &amp; Recreation</span></li>
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">6:00 PM</strong><span>Supervised Study Hours</span></li>
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">8:00 PM</strong><span>Dinner</span></li>
                                <li className="flex gap-4 text-white/85"><strong className="w-28 text-[#DFC06B] font-tabular">10:00 PM</strong><span>Lights Out</span></li>
                            </ul>
                        </div>
                        <div><DynamicImageGrid id="hostel_life_gallery" user={user} displayType="grid" /></div>
                    </div>
                </div>
            </section>

            <section id="location" className="py-16 bg-[#0B1F3A]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10"><h2 className="text-3xl font-extrabold text-white">Our Location</h2></div>
                    <div className="rounded-xl overflow-hidden shadow-lg border border-[#C9A84C]/35">
                        <iframe src="https://maps.google.com/maps?q=23.4844106,93.3258673&z=17&amp;output=embed" width="100%" height="420" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Bethel Mission School Location" />
                    </div>
                </div>
            </section>

            <section id="contact" className="py-16 bg-[#07162B]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10"><h2 className="text-3xl font-extrabold text-white">Contact Us for Hostel Inquiries</h2></div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#132D52] border border-[#C9A84C]/35 p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-white">Hostel Office</h3>
                            <address className="not-italic mt-4 space-y-3 text-white/80">
                                <p className="flex items-center gap-3"><MapPinIcon className="w-5 h-5 text-[#DFC06B]" /><span>Bethel Veng, Champhai, Mizoram - 796321</span></p>
                                <p className="flex items-center gap-3"><PhoneIcon className="w-5 h-5 text-[#DFC06B]" /><a href="tel:+919862148342" className="hover:text-[#DFC06B] transition-colors font-tabular">+91 9862148342</a></p>
                                <p className="flex items-center gap-3"><MailIcon className="w-5 h-5 text-[#DFC06B]" /><a href="mailto:bms@bms04.com" className="hover:text-[#DFC06B] transition-colors">bms@bms04.com</a></p>
                            </address>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Send a Message</h3>
                            {isSubmitted ? (
                                <div className="p-6 bg-[#132D52] border border-[#C9A84C] text-[#DFC06B] rounded-xl text-center">
                                    <h4 className="font-bold">Thank You!</h4>
                                    <p className="text-white/85 text-sm mt-1">Your email client should open. If not, please email us directly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full min-h-[44px] bg-[#132D52] border border-white/25 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-[#C9A84C]" required />
                                    <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full min-h-[44px] bg-[#132D52] border border-white/25 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-[#C9A84C]" required />
                                    <textarea placeholder="Your Message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full bg-[#132D52] border border-white/25 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-[#C9A84C]" required />
                                    <button type="submit" className="btn btn-primary w-full">Send Inquiry</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default HostelPage;
