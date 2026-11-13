import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { InstagramIcon, YouTubeIcon, MailIcon, PhoneIcon, FacebookIcon, WhatsappIcon } from '@/components/Icons';
import SiteVisitorCounter from '@/components/SiteVisitorCounter';

const { Link } = ReactRouterDOM as any;

const GOOGLE_MAPS_LINK = 'https://maps.google.com/?q=Bethel+Mission+School,+Bethel+Veng,+Champhai,+Mizoram+796321';
const GOOGLE_MAPS_EMBED = 'https://maps.google.com/maps?q=Bethel%20Mission%20School%20Champhai%20Mizoram&t=&z=15&ie=UTF8&iwloc=&output=embed';
const WHATSAPP_URL = 'https://wa.me/919862148342';

const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-[#07162B] text-white border-t-4 border-[#C9A84C]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                    {/* School Brand & Timings */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src="/assets/school/bms-logo-color.png"
                                alt="Bethel Mission School Logo"
                                loading="lazy"
                                className="h-12 w-auto flex-shrink-0"
                            />
                            <div>
                                <h4 className="font-extrabold text-white text-lg leading-tight">
                                    Bethel Mission School
                                </h4>
                                <p className="text-xs font-semibold text-[#DFC06B] italic">
                                    &ldquo;Service to God &amp; Men&rdquo;
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed mb-5">
                            Champhai, Mizoram &middot; Est. 1996. MBSE-affiliated English medium school from Nursery to Class X.
                        </p>

                        {/* School Timings */}
                        <div className="p-3.5 rounded-xl bg-[#0B1F3A] border border-[#C9A84C]/35 text-xs sm:text-sm space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-[#DFC06B]">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>School Timings</span>
                            </div>
                            <p className="text-white/85 font-tabular">Classes: Mon &ndash; Fri, 9:20 AM &ndash; 3:00 PM</p>
                            <p className="text-white/75 font-tabular">Office: Mon &ndash; Sat, 9:00 AM &ndash; 4:00 PM</p>
                        </div>
                    </div>

                    {/* Contact Details: Phone, WhatsApp, Email, Address */}
                    <div>
                        <h4 className="font-bold text-[#DFC06B] text-sm uppercase tracking-wider mb-4">
                            Contact &amp; Address
                        </h4>
                        <div className="space-y-3 text-sm text-white/85">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 flex-shrink-0 text-[#C9A84C] mt-1" />
                                <address className="not-italic leading-relaxed">
                                    Bethel Veng, Champhai,<br />
                                    Mizoram &ndash; 796321
                                </address>
                            </div>
                            <div className="flex items-center gap-3">
                                <PhoneIcon className="w-4 h-4 flex-shrink-0 text-[#C9A84C]" />
                                <a href="tel:+919862148342" className="font-semibold text-white hover:text-[#DFC06B] transition-colors font-tabular">
                                    +91 9862148342
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <WhatsappIcon className="w-4 h-4 flex-shrink-0 text-[#C9A84C]" />
                                <a
                                    href={WHATSAPP_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-white hover:text-[#DFC06B] transition-colors font-tabular"
                                >
                                    WhatsApp: +91 9862148342
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <MailIcon className="w-4 h-4 flex-shrink-0 text-[#C9A84C]" />
                                <a href="mailto:bms@bms04.com" className="hover:text-[#DFC06B] transition-colors">
                                    bms@bms04.com
                                </a>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2.5">
                            <a
                                href="https://www.facebook.com/bethel.ms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-[#0B1F3A] border border-[#C9A84C]/35 flex items-center justify-center text-white hover:text-[#DFC06B] hover:border-[#C9A84C] transition-colors"
                                title="Facebook"
                            >
                                <span className="sr-only">Facebook</span>
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.instagram.com/bms_champhai/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-[#0B1F3A] border border-[#C9A84C]/35 flex items-center justify-center text-white hover:text-[#DFC06B] hover:border-[#C9A84C] transition-colors"
                                title="Instagram"
                            >
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.youtube.com/@BethelMissionSchoolChamphai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-[#0B1F3A] border border-[#C9A84C]/35 flex items-center justify-center text-white hover:text-[#DFC06B] hover:border-[#C9A84C] transition-colors"
                                title="YouTube"
                            >
                                <span className="sr-only">YouTube</span>
                                <YouTubeIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-[#DFC06B] text-sm uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/admissions/online" className="text-white/90 hover:text-[#DFC06B] font-semibold transition-colors">Apply Online</Link></li>
                            <li><Link to="/admissions" className="text-white/80 hover:text-[#DFC06B] transition-colors">Admission Guidelines</Link></li>
                            <li><Link to="/academics" className="text-white/80 hover:text-[#DFC06B] transition-colors">Academics &amp; Syllabus</Link></li>
                            <li><Link to="/fees" className="text-white/80 hover:text-[#DFC06B] transition-colors">Fee Structure</Link></li>
                            <li><Link to="/faculty" className="text-white/80 hover:text-[#DFC06B] transition-colors">Faculty Directory</Link></li>
                            <li><Link to="/gallery" className="text-white/80 hover:text-[#DFC06B] transition-colors">School Gallery</Link></li>
                            <li><Link to="/disclosure" className="text-white/90 hover:text-[#DFC06B] font-semibold transition-colors">Mandatory Public Disclosure</Link></li>
                        </ul>
                    </div>

                    {/* Google Map (Lazy-Loaded for Jio Speed) */}
                    <div>
                        <h4 className="font-bold text-[#DFC06B] text-sm uppercase tracking-wider mb-4">
                            Location Map
                        </h4>
                        <div className="rounded-xl overflow-hidden border border-[#C9A84C]/40 bg-[#0B1F3A]">
                            <iframe
                                title="Bethel Mission School Champhai Map"
                                src={GOOGLE_MAPS_EMBED}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-36 border-0"
                            />
                        </div>
                        <a
                            href={GOOGLE_MAPS_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#DFC06B] hover:text-white transition-colors"
                        >
                            <span>Open in Google Maps &rarr;</span>
                        </a>
                    </div>
                </div>

                <div className="mt-10 border-t border-[#C9A84C]/25 pt-6 text-center text-xs sm:text-sm text-white/75 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} Bethel Mission School, Champhai. All Rights Reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <SiteVisitorCounter variant="compact" />
                        <Link to="/disclosure" className="hover:text-[#DFC06B] transition-colors">Mandatory Public Disclosure</Link>
                        <Link to="/contact" className="hover:text-[#DFC06B] transition-colors">Contact</Link>
                        <Link to="/privacy" className="hover:text-[#DFC06B] transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
