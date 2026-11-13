import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Home, Info, GraduationCap, FileText, Phone, User as LucideUser, Menu, X } from 'lucide-react';
import { User, NavMenuItem } from '@/types';

const { Link, NavLink } = ReactRouterDOM as any;

interface PublicHeaderProps {
    user: User | null;
    navigation?: NavMenuItem[];
}

const MAIN_MENU_ITEMS = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'about', label: 'About Us', path: '/about', icon: Info },
    { id: 'academics', label: 'Academics', path: '/academics', icon: GraduationCap },
    { id: 'admissions', label: 'Admissions', path: '/admissions', icon: FileText },
    { id: 'contact', label: 'Contact', path: '/contact', icon: Phone },
];

const PublicHeader: React.FC<PublicHeaderProps> = ({ user }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dashboardLink = user?.role === 'parent' ? '/portal/parent-dashboard' : '/portal/dashboard';

    return (
        <header className="bg-white sticky top-0 z-30 border-b-2 border-[#C9A84C] shadow-sm">
            {/* Single-Line Top Bar: Brand | 5-Item Desktop Nav | Single Outline Login CTA + Mobile Hamburger */}
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
                    {/* Brand: Crest + School Name + Motto */}
                    <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink"
                    >
                        <img
                            src="/assets/school/bms-logo-color.png"
                            alt="Bethel Mission School Logo"
                            className="h-10 sm:h-12 w-auto flex-shrink-0 object-contain"
                        />
                        <div className="min-w-0">
                            <span className="block font-extrabold text-[#0B1F3A] text-sm sm:text-lg leading-tight tracking-tight truncate">
                                Bethel Mission School
                            </span>
                            <span className="block text-[11px] sm:text-xs font-semibold text-[#8E6D1B] tracking-wide truncate">
                                Service to God &amp; Men
                            </span>
                        </div>
                    </Link>

                    {/* Desktop 5-Item Navigation (Title Case + Small Icons) */}
                    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 flex-shrink-0">
                        {MAIN_MENU_ITEMS.map(item => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }: any) =>
                                        `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                            isActive
                                                ? 'bg-[#0B1F3A] text-[#DFC06B]'
                                                : 'text-[#0B1F3A] hover:bg-[#F4F7FB] hover:text-[#132D52]'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Right Zone: ONLY ONE Top-Right Outline Login Button + Mobile Hamburger */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {user ? (
                            <Link
                                to={dashboardLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 min-h-[38px] sm:min-h-[42px] bg-white hover:bg-[#0B1F3A] text-[#0B1F3A] hover:text-white font-semibold text-xs sm:text-sm rounded-lg border border-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
                            >
                                <LucideUser className="w-4 h-4 flex-shrink-0" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 min-h-[38px] sm:min-h-[42px] bg-white hover:bg-[#0B1F3A] text-[#0B1F3A] hover:text-white font-semibold text-xs sm:text-sm rounded-lg border border-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
                            >
                                <LucideUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span>Student / Staff Login</span>
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(prev => !prev)}
                            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={isMobileMenuOpen}
                            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#0B1F3A] text-white hover:bg-[#132D52] border border-[#0B1F3A] transition-colors flex-shrink-0"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Hamburger Drawer: ONLY the 5 Title Case Items with Small Icons (No Duplicate Login Button) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-[#0B1F3A] text-white border-t border-[#C9A84C]/40">
                    <nav aria-label="Mobile navigation" className="container mx-auto px-3 py-3 space-y-1">
                        {MAIN_MENU_ITEMS.map(item => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    end={item.path === '/'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }: any) =>
                                        `flex items-center gap-3 min-h-[48px] px-4 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-[#132D52] text-[#DFC06B]'
                                                : 'text-white hover:bg-[#132D52] hover:text-[#DFC06B]'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0 text-[#DFC06B]" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;
