
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { InstagramIcon, YouTubeIcon, MailIcon, PhoneIcon, FacebookIcon } from './Icons';

const { Link } = ReactRouterDOM as any;

const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-slate-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-4">Bethel Mission School</h4>
                        <p className="text-sm">"Service to God & Men" since 1996. We are committed to academic excellence and holistic development.</p>
                    </div>
                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
                            <li><Link to="/rules" className="hover:text-white transition-colors">Rules & Regulations</Link></li>
                            <li><Link to="/faculty" className="hover:text-white transition-colors">Our Faculty</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-4">Contact Us</h4>
                        <address className="not-italic text-sm space-y-2">
                            <p>Bethel Mission School, Champhai</p>
                            <p>Mizoram - 796321</p>
                            <div className="flex items-center gap-3 pt-2">
                                <PhoneIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                                <a href="tel:+919862148342" className="hover:text-white">+91 9862148342</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <MailIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                                <a href="mailto:bmschamphai@gmail.com" className="hover:text-white">bmschamphai@gmail.com</a>
                            </div>
                        </address>
                        <div className="mt-4 flex space-x-4">
                            <a href="https://www.facebook.com/bethel.ms" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Facebook">
                                <span className="sr-only">Facebook</span>
                                <FacebookIcon className="w-6 h-6" />
                            </a>
                            <a href="https://www.instagram.com/bms_champhai/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Instagram">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon className="w-6 h-6" />
                            </a>
                            <a href="https://www.youtube.com/@BethelMissionSchoolChamphai" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="YouTube">
                                <span className="sr-only">YouTube</span>
                                <YouTubeIcon className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                     {/* School Portal */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-4">School Portal</h4>
                        <p className="text-sm mb-4">Access student records, grades, and fee information through our secure portal.</p>
                        <Link to="/login" className="btn btn-primary">
                            Login to Portal
                        </Link>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Bethel Mission School. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};
export default PublicFooter;
