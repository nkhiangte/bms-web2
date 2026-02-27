import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ChevronDownIcon, UserIcon } from '@/components/Icons';
import { User } from '@/types';

const { Link, NavLink, useLocation } = ReactRouterDOM as any;

interface PublicHeaderProps {
    user: User | null;
}

// ─── Hardcoded Menu Structure ─────────────────────────────────────────────────
// To add/remove/reorder items: edit this array only.
// Sub-menu items go inside the `children` array of a parent item.
// External links: set path to full URL (https://...)

interface MenuItem {
    label: string;
    path: string;
    children?: MenuItem[];
}

const MENU: MenuItem[] = [
    {
        label: 'Home',
        path: '/',
    },
    {
        label: 'About',
        path: '/about',
        children: [
            { label: 'About Us',    path: '/about' },
            { label: 'History',     path: '/history' },
            { label: 'Faculty',     path: '/faculty' },
            { label: 'Rules',       path: '/rules' },
        ],
    },
    {
        label: 'Academics',
        path: '/academics',
        children: [
            { label: 'Overview',    path: '/academics' },
            { label: 'Curriculum',  path: '/academics/curriculum' },
            { label: 'Syllabus',    path: '/portal/syllabus' },
            { label: 'Routine',     path: '/routine' },
        ],
    },
    {
        label: 'Admissions',
        path: '/admissions',
        children: [
            { label: 'Guidelines',          path: '/admissions' },
            { label: 'Apply Online',         path: '/admissions/online' },
            { label: 'Check Status',         path: '/admissions/status' },
            { label: 'Fee Structure',        path: '/fees' },
            { label: 'Supplies & Books',     path: '/supplies' },
        ],
    },
    {
        label: 'Student Life',
        path: '/student-life',
        children: [
            { label: 'Overview',        path: '/student-life' },
            { label: 'NCC',             path: '/ncc' },
            { label: 'Arts & Culture',  path: '/arts-culture' },
            { label: 'Eco Club',        path: '/eco-club' },
            { label: 'Sports',          path: '/achievements/sports' },
        ],
    },
    {
        label: 'Achievements',
        path: '/achievements',
        children: [
            { label: 'Overview',        path: '/achievements' },
            { label: 'Academic',        path: '/achievements/academic' },
            { label: 'Science',         path: '/achievements/science' },
            { label: 'Sports',          path: '/achievements/sports' },
            { label: 'Quiz',            path: '/achievements/quiz' },
        ],
    },
    {
        label: 'Facilities',
        path: '/facilities',
        children: [
            { label: 'Overview',        path: '/facilities' },
            { label: 'Infrastructure',  path: '/infrastructure' },
            { label: 'Hostel',          path: '/hostel' },
            { label: 'Gallery',         path: '/gallery' },
        ],
    },
    {
        label: 'News',
        path: '/news',
    },
    {
        label: 'Contact',
        path: '/contact',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isExternal = (path: string) =>
    path?.startsWith('http') || path?.endsWith('.pdf');

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────
const DesktopDropdown: React.FC<{
    item: MenuItem;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
}> = ({ item, open, onOpen, onClose }) => {
    const location = useLocation();
    const ref = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => onClose(), 150);
    };

    const cancelClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const isAnyChildActive = item.children?.some(c =>
        location.pathname === c.path || location.pathname.startsWith(c.path + '/')
    );

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
        >
            <button
                onClick={onOpen}
                className={`px-4 py-3.5 flex items-center gap-1 text-sm font-semibold transition-colors uppercase tracking-wide
                    ${isAnyChildActive ? 'text-sky-600' : 'text-slate-700 hover:text-sky-600'}`}
            >
                {item.label}
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-0 bg-white border border-slate-100 rounded-xl shadow-xl min-w-[220px] py-2 z-50 animate-fade-in">
                   {item.children?.map(child =>
                        isExternal(child.path) ? (
                            <a
                                key={child.path}
                                href={child.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onClose}
                                className="block px-5 py-3.5 text-base text-slate-700 hover:bg-sky-50 hover:text-sky-700 uppercase tracking-wide font-medium"
                            >
                                {child.label}
                            </a>
                        ) : (
                            <NavLink
                                key={child.path}
                                to={child.path}
                                end
                                onClick={onClose}
                                className={({ isActive }: any) =>
                                    `block px-5 py-3.5 text-base uppercase tracking-wide font-medium transition-colors
                                    ${isActive ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-600'}`
                                }
                            >
                                {child.label}
                            </NavLink>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PublicHeader: React.FC<PublicHeaderProps> = ({ user }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const location = useLocation();

    // Close all menus on route change
    useEffect(() => {
        setMobileOpen(false);
        setMobileDropdown(null);
        setOpenDropdown(null);
    }, [location.pathname]);

    const dashboardLink = user?.role === 'parent' ? '/portal/parent-dashboard' : '/portal/dashboard';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">

            {/* ── Top Row ─────────────────────────────────────────────────────── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24 sm:h-32">

                    {/* Logo */}
                    <Link to="/" className="flex items-center flex-shrink-0">
                        <img
                            src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png"
                            alt="Bethel Mission School Logo"
                            className="h-20 sm:h-24"
                        />
                    </Link>

                    {/* Right side: login + mobile toggle */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <Link
                                to={dashboardLink}
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 font-semibold rounded-lg hover:bg-sky-100 transition-colors border border-sky-200"
                            >
                                <UserIcon className="w-5 h-5" />
                                Dashboard
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary hidden sm:inline-flex">
                                Portal Login
                            </Link>
                        )}

                        {/* Hamburger */}
                        <button
                            onClick={() => setMobileOpen(o => !o)}
                            aria-label="Toggle mobile menu"
                            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Desktop Nav ─────────────────────────────────────────────────── */}
            <nav className="hidden lg:block border-t border-slate-100 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center flex-wrap">
                    {MENU.map(item =>
                        item.children?.length ? (
                            <DesktopDropdown
                                key={item.path}
                                item={item}
                                open={openDropdown === item.path}
                                onOpen={() => setOpenDropdown(item.path)}
                                onClose={() => setOpenDropdown(null)}
                            />
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }: any) =>
                                    `px-4 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors
                                    ${isActive ? 'text-sky-600' : 'text-slate-700 hover:text-sky-600'}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        )
                    )}
                </div>
            </nav>

            {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
                    <nav className="px-3 pt-2 pb-4 space-y-1">
                        {MENU.map(item => {
                            const hasChildren = !!item.children?.length;
                            const isExpanded = mobileDropdown === item.path;

                            return hasChildren ? (
                                <div key={item.path}>
                                    <button
                                        onClick={() => setMobileDropdown(prev => prev === item.path ? null : item.path)}
                                        className="w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 uppercase tracking-wide"
                                    >
                                        <span>{item.label}</span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-1 ml-4 pl-3 border-l-2 border-sky-100 space-y-1">
                                            {item.children?.map(child =>
                                                isExternal(child.path) ? (
                                                    <a
                                                        key={child.path}
                                                        href={child.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 uppercase"
                                                    >
                                                        {child.label}
                                                    </a>
                                                ) : (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        end
                                                        className={({ isActive }: any) =>
                                                            `block px-3 py-2 rounded-lg text-sm font-medium uppercase transition-colors
                                                            ${isActive ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-600'}`
                                                        }
                                                    >
                                                        {child.label}
                                                    </NavLink>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }: any) =>
                                        `block px-3 py-2.5 rounded-lg text-base font-semibold uppercase tracking-wide transition-colors
                                        ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50 hover:text-sky-600'}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            );
                        })}

                        {/* Dashboard / Login on mobile */}
                        <div className="pt-3 border-t border-slate-100 sm:hidden">
                            {user ? (
                                <Link to={dashboardLink} className="flex items-center justify-center gap-2 btn btn-secondary w-full">
                                    <UserIcon className="w-5 h-5" /> Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="btn btn-primary w-full text-center">
                                    Portal Login
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;
