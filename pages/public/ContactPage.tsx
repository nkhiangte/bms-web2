

import React, { useState, FormEvent } from 'react';
import { MailIcon, PhoneIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from '/components/Icons';
import EditableContent from '/components/EditableContent';
import { User } from '/types';

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
        const mailtoLink = `mailto:bmschamphai@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
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
                                         <EditableContent id="contact_email" defaultContent="bmschamphai@gmail.com" type="text" user={user} />
// FIX: Added default export statement.
export default ContactPage;