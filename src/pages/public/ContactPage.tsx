
import React, { useState, FormEvent } from 'react';
import { MailIcon, PhoneIcon, InstagramIcon, YouTubeIcon, FacebookIcon, CheckCircleIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface ContactPageProps {
    user: User | null;
}

const ContactPage: React.FC<ContactPageProps> = ({ user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        const mailtoLink = `mailto:bms@bms04.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // This will attempt to open the user's default email client
        window.location.href = mailtoLink;
        
        setIsSubmitted(true);
    };

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                         <EditableContent id="contact_title" defaultContent="Contact Us" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600">
                         <EditableContent id="contact_subtitle" defaultContent="We would love to hear from you. Please get in touch with us." type="text" user={user} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Contact Details */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">School Address</h3>
                            <address className="not-italic mt-2 text-slate-600">
                                 <EditableContent 
                                    id="contact_address" 
                                    defaultContent={`Bethel Mission School\nChamphai, Mizoram - 796321\nIndia`} 
                                    type="textarea" 
                                    user={user} 
                                />
                            </address>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-slate-800">Get in Touch</h3>
                             <div className="mt-4 space-y-4 text-slate-600">
                                <div className="flex items-center gap-4 group">
                                    <PhoneIcon className="w-7 h-7 text-slate-400 group-hover:text-sky-600 transition-colors"/>
                                    <span className="font-semibold">
                                         <EditableContent id="contact_phone" defaultContent="+91 9862148342" type="text" user={user} />
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <MailIcon className="w-7 h-7 text-slate-400 group-hover:text-sky-600 transition-colors"/>
                                    <span className="font-semibold">
                                         <EditableContent id="contact_email" defaultContent="bms@bms04.com" type="text" user={user} />
                                    </span>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-slate-800">Social Media</h3>
                            <div className="flex gap-4 mt-4">
                                <a href="https://www.facebook.com/bethel.ms" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                    <FacebookIcon className="w-6 h-6" />
                                </a>
                                <a href="https://www.instagram.com/bms_champhai/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-full text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                    <InstagramIcon className="w-6 h-6" />
                                </a>
                                <a href="https://www.youtube.com/@BethelMissionSchoolChamphai" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                    <YouTubeIcon className="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-slate-50 p-8 rounded-2xl shadow-inner border">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Send us a Message</h3>
                        {isSubmitted ? (
                            <div className="bg-emerald-100 text-emerald-800 p-6 rounded-lg text-center animate-fade-in">
                                <CheckCircleIcon className="w-12 h-12 mx-auto mb-4" />
                                <h4 className="font-bold text-lg">Message Sent!</h4>
                                <p className="mt-2">Thank you for reaching out. We will get back to you shortly.</p>
                                <button onClick={() => setIsSubmitted(false)} className="mt-4 text-emerald-700 font-semibold hover:underline">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Your Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Your Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full border-slate-300 rounded-md shadow-sm" required></textarea>
                                </div>
                                <button type="submit" className="w-full btn btn-primary !py-3">Send via Email</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
