import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import EditableContent from '@/components/EditableContent';
import { db } from '@/firebaseConfig';

interface AboutPageProps { user: User | null; }

interface PdfDocument { id: string; title: string; description?: string; url: string; category: string; addedAt: string; }

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const AboutPage: React.FC<AboutPageProps> = ({ user }) => {
    const [documents, setDocuments] = useState<PdfDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(true);

    useEffect(() => {
        db.collection('website_content').doc('about_documents').get()
            .then(doc => { setDocuments(doc.exists ? (doc.data()?.items || []) : []); setDocsLoading(false); })
            .catch(() => setDocsLoading(false));
    }, []);

    const grouped = documents.reduce((acc, doc) => {
        const cat = doc.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
    }, {} as Record<string, PdfDocument[]>);

    const sectionHeading = { fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' };

    return (
        <div className="relative py-16">
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <EditableContent id="about_hero_bg" defaultContent="https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg" type="image" user={user} className="w-full h-full object-cover" style={{ position: 'absolute', inset: 0 }} imgAlt="About Us Background" />
                <div className="absolute inset-0" style={{ background: 'rgba(8,8,8,0.75)' }} />
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl p-8 md:p-12" style={{ background: 'rgba(15,15,15,0.92)', border: '1px solid var(--border-mid)', backdropFilter: 'blur(12px)' }}>
                    <div className="text-center mb-10">
                        <div className="section-label mb-3">Who We Are</div>
                        <h1 className="section-heading">
                            <EditableContent id="about_title" defaultContent="About Bethel Mission School, Champhai" type="text" user={user} />
                        </h1>
                        <div className="gold-rule mt-4" />
                    </div>

                    <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <section>
                            <h2 style={sectionHeading}>Introduction</h2>
                            <EditableContent id="about_intro" defaultContent="Established in 1996, Bethel Mission School has a proud legacy of academic excellence under the Mizoram Board of School Education (MBSE)." type="textarea" user={user} />
                        </section>

                        <section>
                            <h2 style={sectionHeading}>Notable Achievements</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Our students consistently excel in the MBSE HSLC Board Examinations:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                                <li><span style={{ color: 'var(--gold)' }}>2023:</span> Esther Tingbiakmuani secured the 4th Rank.</li>
                                <li><span style={{ color: 'var(--gold)' }}>2020:</span> Manngaihsangi achieved the 10th Rank.</li>
                                <li><span style={{ color: 'var(--gold)' }}>2019:</span> C.L. Kimteii and R. Lalrinmawii both secured the 10th Rank.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 style={sectionHeading}>Vision</h2>
                            <EditableContent id="about_vision" defaultContent="To form young people of character and competence who honor God, serve others, and excel in learning and life." type="textarea" user={user} />
                        </section>

                        <section>
                            <h2 style={sectionHeading}>Mission</h2>
                            <EditableContent id="about_mission" defaultContent="Bethel Mission School educates the whole child — mind, heart, and character — so each learner grows in faith-inspired values, academic excellence, and joyful service." type="textarea" user={user} />
                            <p className="mt-4 font-semibold" style={{ color: 'var(--text-primary)' }}>We commit to:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1.5">
                                <li><strong style={{ color: 'var(--text-primary)' }}>Christ-centered values</strong> – cultivating integrity, humility, compassion, and responsibility.</li>
                                <li><strong style={{ color: 'var(--text-primary)' }}>Academic excellence</strong> – delivering a rigorous, student-focused curriculum.</li>
                                <li><strong style={{ color: 'var(--text-primary)' }}>Whole-child formation</strong> – encouraging growth through sports, arts, and activities.</li>
                                <li><strong style={{ color: 'var(--text-primary)' }}>Service & community</strong> – promoting meaningful outreach and stewardship.</li>
                                <li><strong style={{ color: 'var(--text-primary)' }}>Inclusive environment</strong> – ensuring every learner can flourish.</li>
                                <li><strong style={{ color: 'var(--text-primary)' }}>Future readiness</strong> – preparing students with technology and life skills.</li>
                            </ul>
                        </section>

                        {/* Principal's message */}
                        <section className="rounded-xl p-6" style={{ background: 'var(--bg-elevated)', borderLeft: '3px solid var(--gold)' }}>
                            <h2 style={sectionHeading}>Principal's Message</h2>
                            <div className="italic" style={{ color: 'var(--text-secondary)' }}>
                                <EditableContent id="about_principal_msg" defaultContent="Welcome to Bethel Mission School, Champhai. Since our founding in 1996, our vision has been to provide quality education rooted in Christian values and dedicated to our motto, 'Service to God & Men.'" type="textarea" user={user} />
                            </div>
                            <div className="mt-5 text-right not-italic">
                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>— K. Malsawmdawngi</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Principal, Bethel Mission School, Champhai</p>
                            </div>
                        </section>

                        {/* Documents */}
                        {(documents.length > 0 || docsLoading) && (
                            <section className="pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <h2 style={sectionHeading}>Documents & Downloads</h2>
                                {docsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {Object.entries(grouped).map(([category, docs]) => (
                                            <div key={category}>
                                                {Object.keys(grouped).length > 1 && (
                                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{category}</h3>
                                                )}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {docs.map(doc => (
                                                        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-4 rounded-xl transition-all group"
                                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)'}
                                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'}
                                                        >
                                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#ef4444' }}>
                                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
                                                                {doc.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{doc.description}</p>}
                                                            </div>
                                                            <div style={{ color: 'var(--text-muted)' }} className="flex-shrink-0 group-hover:text-gold">
                                                                <DownloadIcon />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
