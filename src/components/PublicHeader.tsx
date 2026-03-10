import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ChevronDownIcon, UserIcon } from '@/components/Icons';
import { User, NavMenuItem } from '@/types';

const { Link, NavLink, useLocation } = ReactRouterDOM as any;

interface PublicHeaderProps {
    user: User | null;
    navigation: NavMenuItem[];
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ user, navigation }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const location = useLocation();

    const menuItems = (navigation || [])
        .filter(item => item.isActive && !item.parent)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const getChildren = (parentId: string) => {
        return (navigation || [])
            .filter(item => item.isActive && item.parent === parentId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    };

    const handleMobileDropdown = (id: string) => {
        setOpenDropdown(prev => prev === id ? null : id);
    };

    const isExternalLink = (path: string) => path?.startsWith('http') || path?.endsWith('.pdf');

    const activeLinkStyle = { color: '#38bdf8' }; // sky-400

    const dashboardLink = user?.role === 'parent' ? '/portal/parent-dashboard' : '/portal/dashboard';

    return (
        <header className="bg-zinc-950 shadow-md shadow-black/40 sticky top-0 z-30 border-b border-zinc-800">
            {/* Top Row: Logo and Login */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24 sm:h-32">
                    {/* Logo */}
                    <Link to="/" className="flex items-center flex-shrink-0">
                        <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="h-20 sm:h-24" />
                    </Link>

                    {/* Login Button & Mobile Menu Toggle */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <Link to={dashboardLink} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-sky-900/40 text-sky-400 font-semibold rounded-lg hover:bg-sky-900/60 transition-colors border border-sky-700">
                                <UserIcon className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary hidden sm:inline-flex">
                                Portal Login
                            </Link>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Bar */}
            <nav className="hidden lg:block border-t border-zinc-800 bg-zinc-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center flex-wrap">
                    {menuItems.map(link => {
                        const children = getChildren(link.id);
                        const hasChildren = children.length > 0;
                        const isDropdownActive = children.some(child => location.pathname === child.path);

                        return hasChildren ? (
                            <div key={link.id} className="relative dropdown">
                                <button className={`px-4 py-3 flex items-center gap-1 text-base font-semibold transition-colors uppercase ${isDropdownActive ? 'text-sky-400' : 'text-zinc-300 hover:text-sky-400'}`}>
                                    {link.label}
                                    <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                <div className="dropdown-content">
                                    {children.map(child => (
                                        isExternalLink(child.path) ? (
                                            <a
                                                key={child.id}
                                                href={child.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block px-4 py-2 text-sm transition-colors uppercase text-zinc-300 hover:bg-zinc-700 hover:text-sky-400 bg-zinc-800"
                                            >
                                                {child.label}
                                            </a>
                                        ) : (
                                            <NavLink key={child.id} to={child.path} end className="block">
                                                {({ isActive }: any) => (
                                                    <span className={`block px-4 py-2 text-sm transition-colors uppercase bg-zinc-800 ${isActive ? 'text-sky-400 font-semibold bg-zinc-700' : 'text-zinc-300 hover:bg-zinc-700 hover:text-sky-400'}`}>
                                                        {child.label}
                                                    </span>
                                                )}
                                            </NavLink>
                                        )
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <NavLink
                                key={link.id}
                                to={link.path}
                                end
                                className="px-4 py-3 text-base font-semibold text-zinc-300 hover:text-sky-400 transition-colors uppercase"
                                style={({ isActive }: any) => isActive ? activeLinkStyle : undefined}
                            >
                                {link.label}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-zinc-900 border-t border-zinc-800">
                    <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {menuItems.map(link => {
                            const children = getChildren(link.id);
                            const hasChildren = children.length > 0;

                            return hasChildren ? (
                                <div key={link.id}>
                                    <button
                                        onClick={() => handleMobileDropdown(link.id)}
                                        className="w-full flex justify-between items-center px-3 py-2 rounded-md text-lg font-medium text-zinc-300 hover:bg-zinc-800 hover:text-sky-400 uppercase transition-colors"
                                    >
                                        <span>{link.label}</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${openDropdown === link.id ? 'rotate-180' : ''}`} />
                                    </button>

                                    {openDropdown === link.id && (
                                        <div className="pl-6 pt-1 pb-2 space-y-1 bg-zinc-950 rounded-b-md">
                                            {children.map(child => (
                                                isExternalLink(child.path) ? (
                                                    <a
                                                        key={child.id}
                                                        href={child.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-sky-400 uppercase transition-colors"
                                                    >
                                                        {child.label}
                                                    </a>
                                                ) : (
                                                    <NavLink
                                                        key={child.id}
                                                        to={child.path}
                                                        end
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-sky-400 uppercase transition-colors"
                                                        style={({ isActive }: any) => isActive ? { backgroundColor: '#0c1a2e', color: '#38bdf8' } : undefined}
                                                    >
                                                        {child.label}
                                                    </NavLink>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={link.id}
                                    to={link.path}
                                    end
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-lg font-medium text-zinc-300 hover:bg-zinc-800 hover:text-sky-400 uppercase transition-colors"
                                    style={({ isActive }: any) => isActive ? { backgroundColor: '#0c1a2e', color: '#38bdf8' } : undefined}
                                >
                                    {link.label}
                                </NavLink>
                            );
                        })}

                        {/* Dashboard / Login Links */}
                        {user ? (
                            <Link
                                to={dashboardLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="sm:hidden mt-4 mx-3 btn btn-secondary w-auto flex items-center justify-center gap-2"
                            >
                                <UserIcon className="w-5 h-5" /> Dashboard
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="sm:hidden mt-4 mx-3 btn btn-primary w-auto"
                            >
                                Portal Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;
