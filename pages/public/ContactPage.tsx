import React, { useState, FormEvent } from 'react';
import { MailIcon, PhoneIcon, InstagramIcon, YouTubeIcon } from '../../components/Icons';

const ContactPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        const mailtoLink = `mailto:bmschamphai@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // This will attempt to open the user's default email client
        window.location.href = mailtoLink;
        
        setIsSubmitted(true);
    };

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Contact Us</h1>
                    <p className="mt-4 text-lg text-slate-600">We would love to hear from you. Please get in touch with us.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Contact Details */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">School Address</h3>
                            <address className="not-italic mt-2 text-slate-600">
                                Bethel Mission School<br/>
                                Champhai, Mizoram - 796321<br/>
                                India
                            </address>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-slate-800">Get in Touch</h3>
                             <div className="mt-4 space-y-4 text-slate-600">
                                <a href="tel:+919862148342" className="flex items-center gap-4 hover:text-sky-600 group">
                                    <PhoneIcon className="w-7 h-7 text-slate-400 group-hover:text-sky-600 transition-colors"/>
                                    <span className="font-semibold">+91 9862148342</span>
                                </a>
                                <a href="mailto:bmschamphai@gmail.com" className="flex items-center gap-4 hover:text-sky-600 group">
                                    <MailIcon className="w-7 h-7 text-slate-400 group-hover:text-sky-600 transition-colors"/>
                                    <span className="font-semibold">bmschamphai@gmail.com</span>
                                </a>
                                <a href="https://www.instagram.com/bms_champhai/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-rose-600 group">
                                    <InstagramIcon className="w-7 h-7 text-slate-400 group-hover:text-rose-600 transition-colors"/>
                                    <span className="font-semibold">@bms_champhai</span>
                                </a>
                                <a href="https://www.youtube.com/@BethelMissionSchoolChamphai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-red-600 group">
                                    <YouTubeIcon className="w-7 h-7 text-slate-400 group-hover:text-red-600 transition-colors"/>
                                    <span className="font-semibold">@BethelMissionSchoolChamphai</span>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Office Hours</h3>
                            <p className="mt-2 text-slate-600">
                                Monday - Friday: 9:00 AM - 3:00 PM<br/>
                                Saturday & Sunday: Closed
                            </p>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-slate-50 p-8 rounded-lg shadow-lg border">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>
                        {isSubmitted ? (
                             <div className="text-center p-6 bg-emerald-100 text-emerald-800 rounded-lg">
                                <h3 className="font-bold text-lg">Thank you!</h3>
                                <p>Your email client should open shortly. If it doesn't, please send your message directly to <a href="mailto:bmschamphai@gmail.com" className="font-semibold underline">bmschamphai@gmail.com</a>.</p>
                             </div>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-slate-700">Your Name</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700">Your Email</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-bold text-slate-700">Subject</label>
                                <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-slate-700">Message</label>
                                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full btn btn-primary mt-2">
                                    Send Message
                                </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>

                 {/* Google Map Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Our Location</h2>
                    <div className="rounded-lg overflow-hidden shadow-lg border">
                        <iframe
                            src="https://maps.google.com/maps?q=23.4844106,93.3258673&z=17&amp;output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bethel Mission School Location"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;