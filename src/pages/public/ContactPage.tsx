import React, { useState, FormEvent } from 'react';
import { MailIcon, PhoneIcon, InstagramIcon, YouTubeIcon, FacebookIcon, CheckCircleIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface ContactPageProps { user: User | null; }

const ContactPage: React.FC<ContactPageProps> = ({ user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:bms@bms04.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setIsSubmitted(true);
    };

    const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em' };
    const inputStyle = { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-mid)' };

    return (
        <div className="py-20" style={{ background: 'var(--bg-base)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <div className="section-label mb-3">Reach Out</div>
                    <h1 className="section-heading">
                        <EditableContent id="contact_title" defaultContent="Contact Us" type="text" user={user} />
                    </h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext max-w-xl mx-auto">
                        <EditableContent id="contact_subtitle" defaultContent="We would love to hear from you. Please get in touch with us." type="text" user={user} />
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
                    {/* Details */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>School Address</h3>
                            <address className="not-italic text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                <EditableContent id="contact_address" defaultContent={`Bethel Mission School\nChamphai, Mizoram - 796321\nIndia`} type="textarea" user={user} />
                            </address>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>Get in Touch</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <PhoneIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <EditableContent id="contact_phone" defaultContent="+91 9862148342" type="text" user={user} />
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MailIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <EditableContent id="contact_email" defaultContent="bms@bms04.com" type="text" user={user} />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>Social Media</h3>
                            <div className="flex gap-3">
                                {[
                                    { href: 'https://www.facebook.com/bethel.ms', icon: <FacebookIcon className="w-5 h-5" /> },
                                    { href: 'https://www.instagram.com/bms_champhai/', icon: <InstagramIcon className="w-5 h-5" /> },
                                    { href: 'https://www.youtube.com/@BethelMissionSchoolChamphai', icon: <YouTubeIcon className="w-5 h-5" /> },
                                ].map(({ href, icon }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                        style={{ border: '1px solid var(--border-mid)', color: 'var(--text-secondary)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                                    >
                                        {icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--gold)' }}>Send a Message</h3>
                        {isSubmitted ? (
                            <div className="text-center py-8 animate-fade-in">
                                <CheckCircleIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--gold)' }} />
                                <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Message Sent!</h4>
                                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Thank you for reaching out. We will get back to you shortly.</p>
                                <button onClick={() => setIsSubmitted(false)} className="mt-5 text-sm font-semibold hover:underline" style={{ color: 'var(--gold)' }}>Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {[
                                    { label: 'Your Name', type: 'text', value: name, onChange: setName },
                                    { label: 'Your Email', type: 'email', value: email, onChange: setEmail },
                                    { label: 'Subject', type: 'text', value: subject, onChange: setSubject },
                                ].map(({ label, type, value, onChange }) => (
                                    <div key={label}>
                                        <label className="block mb-1.5" style={labelStyle}>{label}</label>
                                        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} required />
                                    </div>
                                ))}
                                <div>
                                    <label className="block mb-1.5" style={labelStyle}>Message</label>
                                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} required />
                                </div>
                                <button type="submit" className="w-full btn btn-primary py-3 text-sm">Send via Email</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
