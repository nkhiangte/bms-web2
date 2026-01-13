import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, UsersIcon, BookOpenIcon, BuildingOfficeIcon, PhoneIcon, MailIcon } from '../../components/Icons';

// Local Icon Components for this page
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


// Page-specific UI Components
const InfoBadge: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
        {icon}
        <span>{text}</span>
    </div>
);

const FacilityCard: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
    </div>
);

const HostelPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleContactSubmit = (e: FormEvent) => {
        e.preventDefault();
        const subject = "Hostel Inquiry";
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        const mailtoLink = `mailto:bmschamphai@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        setIsSubmitted(true);
    };

    return (
        <div className="bg-slate-50">
            {/* 1. Hero Section */}
            <section id="home" className="relative bg-cover bg-center text-white py-32 px-4" style={{ backgroundImage: "url('https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg')" }}>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        Bethel Mission School Hostel
                    </h1>
                    <p className="mt-4 text-lg md:text-xl font-light" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                        A safe, supportive, and disciplined home for our students.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <a href="#admissions" className="btn btn-primary !px-8 !py-3 !text-lg">Apply Now</a>
                        <a href="#fees" className="btn btn-secondary !px-8 !py-3 !text-lg !bg-white/90">View Fees</a>
                    </div>
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <InfoBadge icon={<ShieldCheckIcon className="w-5 h-5"/>} text="24/7 Safety" />
                        <InfoBadge icon={<UsersIcon className="w-5 h-5"/>} text="Experienced Wardens" />
                        <InfoBadge icon={<BookOpenIcon className="w-5 h-5"/>} text="Supervised Study" />
                        <InfoBadge icon={<BuildingOfficeIcon className="w-5 h-5"/>} text="Separate Blocks" />
                    </div>
                </div>
            </section>

            {/* 2. About Section */}
            <section id="about" className="py-20 bg-white">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">A Nurturing Environment for Growth</h2>
                        <p className="mt-4 text-slate-600 leading-relaxed">
                            Our hostel is an integral part of the Bethel Mission School experience, providing a disciplined and caring environment that supports academic focus and personal development. We aim to cultivate responsibility, respect, and a strong moral character in all our residents.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-lg border">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Key Facts</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3"><MapPinIcon className="w-6 h-6 text-sky-600"/><div><strong>Location:</strong> Bethel Veng, Champhai</div></li>
                            <li className="flex items-center gap-3"><UsersIcon className="w-6 h-6 text-sky-600"/><div><strong>Capacity:</strong> Approx. 70 students (Boys & Girls)</div></li>
                            <li className="flex items-center gap-3"><ClockIcon className="w-6 h-6 text-sky-600"/><div><strong>Established:</strong> 1996</div></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 3. Facilities Section */}
            <section id="facilities" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Our Facilities</h2>
                        <p className="mt-2 text-slate-600">Everything students need for a comfortable and productive stay.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FacilityCard icon="🍽️" title="Dining Hall" description="Serving fresh, nutritious, and hygienic meals three times a day."/>
                        <FacilityCard icon="📚" title="Supervised Study" description="Dedicated, mandatory study hours every evening under the supervision of wardens."/>
                        <FacilityCard icon="💧" title="Clean Drinking Water" description="Purified and safe drinking water available 24/7 for all residents."/>
                        <FacilityCard icon="🏠" title="Separate Buildings" description="Well-maintained and secure separate buildings for boys and girls to ensure privacy and safety."/>
                        <FacilityCard icon="🛡️" title="Safety & Security" description="Experienced wardens and staff ensure the safety and well-being of all students."/>
                        <FacilityCard icon="⚽" title="Prime Location" description="Conveniently located near the school campus and playgrounds for easy access."/>
                    </div>
                </div>
            </section>

            {/* 4. Rooms & Fees Section */}
            <section id="fees" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Rooms & Fee Structure</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div>
                             <h3 className="text-2xl font-bold text-slate-700 mb-4">Room Amenities</h3>
                             <p className="text-slate-600 mb-4">Our hostel provides dormitory-style accommodation with separate buildings for boys and girls. Rooms are shared, typically accommodating 4-6 students, and are designed for comfort and focus.</p>
                             <ul className="list-disc list-inside space-y-2 text-slate-700">
                                <li>Dormitory-style shared rooms (4-6 beds)</li>
                                <li>Personal locker for belongings</li>
                                <li>Access to a common study hall</li>
                                <li>Prayer room for spiritual activities</li>
                                <li>Scheduled hot water facilities</li>
                             </ul>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-lg border">
                            <h3 className="text-2xl font-bold text-slate-700 mb-4">Fee Details (Per Annum)</h3>
                            <p className="text-sm text-slate-600 mb-4">Fees are subject to change. Please confirm with the hostel office.</p>
                            <table className="w-full text-left">
                                <tbody>
                                    <tr className="border-b"><td className="py-2">Admission Fee</td><td className="py-2 font-semibold text-right">₹ 1,000</td></tr>
                                    <tr className="border-b"><td className="py-2">Security Deposit (Refundable)</td><td className="py-2 font-semibold text-right">₹ 2,000</td></tr>
                                    <tr className="border-b"><td className="py-2">Boarding & Mess Charges</td><td className="py-2 font-semibold text-right">₹ 48,000</td></tr>
                                    <tr className="border-b"><td className="py-2">Miscellaneous Charges</td><td className="py-2 font-semibold text-right">₹ 1,000</td></tr>
                                    <tr className="bg-slate-200"><td className="py-2 font-bold">Total</td><td className="py-2 font-bold text-right">₹ 52,000</td></tr>
                                </tbody>
                            </table>
                            <a href="#" className="mt-6 btn btn-secondary w-full">Download Prospectus (PDF)</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Admissions Section */}
            <section id="admissions" className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-800">Admission Process</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-600">Admission to the hostel is exclusively for students enrolled at Bethel Mission School. The process is simple and straightforward.</p>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-3xl font-bold text-sky-500 mb-2">01</div>
                            <h3 className="text-xl font-bold text-slate-800">Application</h3>
                            <p className="mt-2 text-slate-600">Obtain the hostel application form from the school office during admission period.</p>
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-3xl font-bold text-sky-500 mb-2">02</div>
                            <h3 className="text-xl font-bold text-slate-800">Submission</h3>
                            <p className="mt-2 text-slate-600">Submit the filled form along with required documents (Aadhaar, Photos) to the office.</p>
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-3xl font-bold text-sky-500 mb-2">03</div>
                            <h3 className="text-xl font-bold text-slate-800">Confirmation</h3>
                            <p className="mt-2 text-slate-600">Once approved, pay the admission and security deposit fees to confirm your seat.</p>
                        </div>
                    </div>
                    <a href="#" className="mt-12 btn btn-primary !px-8 !py-3">Download Application Form</a>
                </div>
            </section>
            
            {/* 6. Life @ Hostel */}
            <section id="hostel-life" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Life at the Hostel</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                             <h3 className="text-2xl font-bold text-slate-700 mb-4">A Day in the Life</h3>
                             <p className="text-slate-600 mb-4">Our daily routine is structured to balance academics, recreation, and personal growth, ensuring students thrive in a disciplined yet supportive setting.</p>
                             <ul className="space-y-2">
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">5:30 AM</strong><span>Wake Up & Morning Chores</span></li>
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">7:00 AM</strong><span>Breakfast</span></li>
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">8:00 AM</strong><span>Prepare for School</span></li>
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">4:00 PM</strong><span>Return & Recreation</span></li>
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">6:00 PM</strong><span>Supervised Study Hours</span></li>
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">8:00 PM</strong><span>Dinner</span></li>
                                <li className="flex gap-4"><strong className="w-28 text-sky-700">10:00 PM</strong><span>Lights Out</span></li>
                             </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <img src="https://i.ibb.co/yc3mzG5V/IMG-4859.jpg" alt="Hostel life 1" className="rounded-lg shadow-md aspect-square object-cover"/>
                            <img src="https://i.ibb.co/qY7bFZS/students-hands-up.jpg" alt="Hostel life 2" className="rounded-lg shadow-md aspect-square object-cover"/>
                            <img src="https://i.ibb.co/L5r89w8/classroom.jpg" alt="Hostel life 3" className="rounded-lg shadow-md aspect-square object-cover"/>
                            <img src="https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png" alt="Hostel life 4" className="rounded-lg shadow-md aspect-square object-cover"/>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Location Section */}
            <section id="location" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Our Location</h2>
                    </div>
                     <div className="rounded-lg overflow-hidden shadow-lg border">
                        <iframe
                            src="https://maps.google.com/maps?q=23.4844106,93.3258673&z=17&amp;output=embed"
                            width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade" title="Bethel Mission School Location"
                        ></iframe>
                    </div>
                </div>
            </section>
            
            {/* 9. Contact Section */}
            <section id="contact" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Contact Us for Hostel Inquiries</h2>
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 rounded-lg border">
                            <h3 className="text-xl font-bold text-slate-700">Hostel Office</h3>
                             <address className="not-italic mt-4 space-y-3 text-slate-600">
                                <p className="flex items-center gap-3"><MapPinIcon className="w-5 h-5 text-sky-600"/><span>Bethel Veng, Champhai, Mizoram - 796321</span></p>
                                <p className="flex items-center gap-3"><PhoneIcon className="w-5 h-5 text-sky-600"/><a href="tel:+919862148342" className="hover:text-sky-800">+91 9862148342</a></p>
                                <p className="flex items-center gap-3"><MailIcon className="w-5 h-5 text-sky-600"/><a href="mailto:bmschamphai@gmail.com" className="hover:text-sky-800">bmschamphai@gmail.com</a></p>
                            </address>
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-slate-700 mb-4">Send a Message</h3>
                            {isSubmitted ? (
                                <div className="p-6 bg-emerald-100 text-emerald-800 rounded-lg text-center">
                                    <h4 className="font-bold">Thank You!</h4>
                                    <p>Your email client should open. If not, please email us directly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-md" required />
                                    <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-slate-300 rounded-md" required />
                                    <textarea placeholder="Your Message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full border-slate-300 rounded-md" required></textarea>
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