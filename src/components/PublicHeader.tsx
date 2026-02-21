
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ChevronDownIcon, UserIcon } from '@/components/Icons';
import { User } from '@/types';

const { Link, NavLink, useLocation } = ReactRouterDOM as any;

interface NavLinkItem {
    name: string;
    path?: string;
    children?: NavLinkItem[];
}

const NavLinks: NavLinkItem[] = [
    { name: 'Home', path: '/' },
    {
        name: 'About Us',
        children: [
            { name: 'About The School', path: '/about' },
            { name: 'History', path: '/history' },
            { name: 'Faculty', path: '/faculty' },
            { name: 'Rules & Regulations', path: '/rules' },
        ],
    },
    {
        name: 'Admissions',
        children: [
            { name: 'Admission Guidelines', path: '/admissions' },
            { name: 'Online Admission Form', path: '/admissions/online' },
            { name: 'Check Admission Status', path: '/admissions/status' },
            { name: 'Fee Structure', path: '/fees' },
            { name: 'Online Fee Payment', path: '/fees#payment-portal' },
            { name: 'School Supplies', path: '/supplies' },
        ],
    },
    {
        name: 'Student Life',
        children: [
            { name: 'Student Life Overview', path: '/student-life' },
            { name: 'NCC', path: '/ncc' },
            { name: 'Arts & Culture', path: '/arts-culture' },
            { name: 'Eco Club', path: '/eco-club' },
        ],
    },
    { name: 'Academics', path: '/academics' },
    {
        name: 'Campus',
        children: [
            { name: 'Facilities', path: '/facilities' },
            { name: 'Infrastructure', path: '/infrastructure' },
            { name: 'Hostel', path: '/hostel' },
            { name: 'Gallery', path: '/gallery' },
        ],
    },
    { name: 'Routine', path: '/routine' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
];

interface PublicHeaderProps {
    user: User | null;
    navigation: NavMenuItem[];
}

// Around line 60
const PublicHeader: React.FC<PublicHeaderProps> = ({ user, navigation }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const location = useLocation();

    // Filter for top-level items and sort them by 'order'
    const menuItems = navigation
        .filter(item => item.isActive && !item.parent)
        .sort((a, b) => a.order - b.order);

    // Function to get children for a specific parent
    const getChildren = (parentId: string) => {
        return navigation
            .filter(item => item.isActive && item.parent === parentId)
            .sort((a, b) => a.order - b.order);
    };

    const activeLinkStyle = { color: 'var(--primary)' };
    // ... rest of your existing logic
    
    // Determine dashboard link based on user role
    const dashboardLink = user?.role === 'parent' ? '/portal/parent-dashboard' : '/portal/dashboard';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
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
                             <Link to={dashboardLink} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 font-semibold rounded-lg hover:bg-sky-100 transition-colors border border-sky-200">
                                <UserIcon className="w-5 h-5"/>
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary hidden sm:inline-flex">
                                Portal Login
                            </Link>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Bar */}
<nav className="hidden lg:block border-t border-slate-200">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center flex-wrap">
        {menuItems.map(link => {
            const children = getChildren(link.id);
            const hasChildren = children.length > 0;
            const isDropdownActive = children.some(child => location.pathname === child.path);
            
            return hasChildren ? (
                <div key={link.id} className="relative dropdown">
                    <button className={`px-4 py-3 flex items-center gap-1 text-base font-semibold transition-colors uppercase ${isDropdownActive ? 'text-sky-600' : 'text-slate-700 hover:text-sky-600'}`}>
                        {link.label}
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    <div className="dropdown-content">
                        {children.map(child => (
                            <NavLink key={child.id} to={child.path} end className="block">
                                {({ isActive }: any) => (
                                    <span className={`block px-4 py-2 text-sm transition-colors uppercase ${isActive ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-600'}`}>
                                        {child.label}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            ) : (
                <NavLink
                    key={link.id}
                    to={link.path}
                    end
                    className="px-4 py-3 text-base font-semibold text-slate-700 hover:text-sky-600 transition-colors uppercase"
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
    <div className="lg:hidden bg-white border-t">
        <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map(link => {
                const children = getChildren(link.id);
                const hasChildren = children.length > 0;

                return hasChildren ? (
                    <div key={link.id}>
                        <button
                            onClick={() => handleMobileDropdown(link.id)}
                            className="w-full flex justify-between items-center px-3 py-2 rounded-md text-lg font-medium text-slate-700 hover:bg-slate-100 hover:text-sky-600 uppercase"
                        >
                            <span>{link.label}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${openDropdown === link.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openDropdown === link.id && (
                            <div className="pl-6 pt-1 pb-2 space-y-1 bg-slate-50 rounded-b-md">
                                {children.map(child => (
                                    <NavLink
                                        key={child.id}
                                        to={child.path}
                                        end
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-200 hover:text-sky-600 uppercase"
                                        style={({ isActive }: any) => isActive ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)' } : undefined}
                                    >
                                        {child.label}
                                    </NavLink>
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
                        className="block px-3 py-2 rounded-md text-lg font-medium text-slate-700 hover:bg-slate-100 hover:text-sky-600 uppercase"
                        style={({ isActive }: any) => isActive ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)' } : undefined}
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
                    <UserIcon className="w-5 h-5"/> Dashboard
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
