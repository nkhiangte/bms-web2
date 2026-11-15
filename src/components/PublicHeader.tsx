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
    { id: 'admissions', label: 'Admissions', path: '/admissions', icon: FileText, highlighted: true },
    { id: 'contact', label: 'Contact', path: '/contact', icon: Phone },
];

const PublicHeader: React.FC<PublicHeaderProps> = ({ user }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dashboardLink = user?.role === 'parent' ? '/portal/parent-dashboard' : '/portal/dashboard';

    return (
        <header className="bg-white/95 backdrop-blur-md sticky top-0 z-30 border-t-2 border-t-[#C5A46D] border-b border-[#142B49]/12 shadow-sm">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
                    {/* Brand: Crest + School Name + Motto */}
                    <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-shrink"
                    >
                        <img
                            src="/assets/school/bms-logo-color.png"
                            alt="Bethel Mission School Logo"
                            className="h-10 sm:h-12 w-auto flex-shrink-0 object-contain"
                        />
                        <div className="min-w-0">
                            <span className="font-serif-editorial block font-bold text-[#142B49] text-base sm:text-xl leading-tight tracking-tight truncate">
                                Bethel Mission School
                            </span>
                            <span className="block text-[11px] sm:text-xs font-medium text-[#8C6D3B] tracking-wide truncate">
                                Service to God &amp; Men &middot; Est. 1996
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation with Highlighted Admissions */}
                    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                        {MAIN_MENU_ITEMS.map(item => {
                            const Icon = item.icon;
                            if (item.highlighted) {
                                return (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }: any) =>
                                            `inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap shrink-0 border transition-colors ${
                                                isActive
                                                    ? 'bg-[#142B49] text-[#F8F6F0] border-[#142B49]'
                                                    : 'bg-[#F8F6F0] text-[#142B49] border-[#C5A46D] hover:bg-[#142B49] hover:text-[#F8F6F0] hover:border-[#142B49]'
                                            }`
                                        }
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0 text-[#C5A46D]" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            }
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }: any) =>
                                        `inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                                            isActive
                                                ? 'text-[#142B49] bg-[#F8F6F0] border-b-2 border-[#C5A46D]'
                                                : 'text-[#252A32] hover:text-[#142B49] hover:bg-[#F8F6F0]/70'
                                        }`
                                    }
                                >
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Right Zone: Student / Staff Login CTA + Mobile Hamburger */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {user ? (
                            <Link
                                to={dashboardLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 min-h-[38px] sm:min-h-[40px] bg-white hover:bg-[#142B49] text-[#142B49] hover:text-white font-semibold text-xs sm:text-sm rounded-md border border-[#142B49]/35 transition-colors whitespace-nowrap shrink-0"
                            >
                                <LucideUser className="w-4 h-4 flex-shrink-0" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 min-h-[38px] sm:min-h-[40px] bg-white hover:bg-[#142B49] text-[#142B49] hover:text-white font-semibold text-xs sm:text-sm rounded-md border border-[#142B49]/35 transition-colors whitespace-nowrap shrink-0"
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
                            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md bg-[#142B49] text-white hover:bg-[#1C3B63] transition-colors flex-shrink-0"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Hamburger Drawer */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-[#142B49] text-white border-t border-[#C5A46D]/40">
                    <nav aria-label="Mobile navigation" className="container mx-auto px-3 py-3 space-y-1.5">
                        {MAIN_MENU_ITEMS.map(item => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    end={item.path === '/'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }: any) =>
                                        `flex items-center justify-between min-h-[48px] px-4 py-2.5 rounded-md text-base font-semibold transition-colors ${
                                            item.highlighted
                                                ? 'bg-[#C5A46D] text-[#142B49] font-bold'
                                                : isActive
                                                ? 'bg-[#1D3B62] text-[#F8F6F0] border-l-2 border-[#C5A46D]'
                                                : 'text-white hover:bg-[#1D3B62] hover:text-[#F8F6F0]'
                                        }`
                                    }
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${item.highlighted ? 'text-[#142B49]' : 'text-[#C5A46D]'}`} />
                                        <span>{item.label}</span>
                                    </span>
                                    {item.highlighted && (
                                        <span className="text-xs font-extrabold uppercase tracking-wider">2027</span>
                                    )}
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
