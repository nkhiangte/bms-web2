



import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '../types';
// FIX: Added 'AcademicCapIcon' and 'CalendarDaysIcon' to the import list to resolve a 'Cannot find name' error.
import { HomeIcon, UsersIcon, BookOpenIcon, BriefcaseIcon, CurrencyDollarIcon, DocumentReportIcon, ArchiveBoxIcon, BuildingOfficeIcon, UserGroupIcon, CalendarDaysIcon, MegaphoneIcon, XIcon, ClipboardDocumentListIcon, CogIcon, SparklesIcon, AcademicCapIcon, TransferIcon, UserIcon } from './Icons';

const { NavLink } = ReactRouterDOM as any;

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User;
}

const portalNavLinks = [
    { name: 'Portal Home', path: '/portal/dashboard', parentPath: '/portal/parent-dashboard', icon: <HomeIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent', 'pending', 'warden', 'pending_parent'] },
    { name: 'Admin Panel', path: '/portal/admin', icon: <CogIcon className="w-5 h-5" />, roles: ['admin'] },
    { name: 'My Profile', path: '/portal/profile', icon: <UserIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent', 'warden'] },
    { name: 'Students', path: '/portal/students', icon: <UsersIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Classes', path: '/portal/classes', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Academics & Reports', path: '/portal/reports/academics', icon: <AcademicCapIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'AI Insights', path: '/portal/insights', icon: <SparklesIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Homework Scanner', path: '/portal/homework-scanner', icon: <SparklesIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Activity Log', path: '/portal/activity-log', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Manage Homework', path: '/portal/manage-homework', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Manage Syllabus', path: '/portal/manage-syllabus', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Class Routine', path: '/portal/routine', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent', 'pending', 'warden'] },
    { name: 'Attendance Log', path: '/portal/student/:studentId/attendance-log', icon: <CalendarDaysIcon className="w-5 h-5"/>, roles: ['parent'] },
    { name: 'Staff', path: '/portal/staff', icon: <BriefcaseIcon className="w-5 h-5" />, roles: ['user'] },
    { name: 'Teacher Attendance', path: '/portal/staff/attendance-logs', icon: <CalendarDaysIcon className="w-5 h-5"/>, roles: ['admin', 'user'] },
    { name: 'Fees', path: '/portal/fees', icon: <CurrencyDollarIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent'] },
    { name: 'Transfers', path: '/portal/transfers', icon: <TransferIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Inventory', path: '/portal/inventory', icon: <ArchiveBoxIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Hostel', path: '/portal/hostel-dashboard', icon: <BuildingOfficeIcon className="w-5 h-5" />, roles: ['admin', 'user', 'warden'] },
    { name: 'Chore Roster', path: '/portal/hostel/chores', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, roles: ['admin', 'warden'] },
    { name: 'Communication', path: '/portal/communication', icon: <MegaphoneIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Calendar', path: '/portal/calendar', icon: <CalendarDaysIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent'] },
];

const publicNavLinks = [
    { name: 'Website Home', path: '/' },
    { name: 'Latest News & Announcements', path: '/news' },
    { name: 'About Us', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Fees', path: '/fees' },
    { name: 'Student Life', path: '/student-life' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Supplies', path: '/supplies' },
    { name: 'Contact Us', path: '/contact' },
];

const NavItem: React.FC<{ to: string, children: React.ReactNode, end?: boolean }> = ({ to, children, end = false }) => {
    const activeClass = "bg-sky-100 text-sky-700";
    const inactiveClass = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";
    return (
        <NavLink to={to} end={end} className={({ isActive }: any) => `${isActive ? activeClass : inactiveClass} group flex items-center px-3 py-2 text-sm font-semibold rounded-md`}>
            {children}
        </NavLink>
    );
};

const SidebarContent: React.FC<{user: User, onLinkClick?: () => void}> = ({ user, onLinkClick }) => (
    <div className="flex flex-col flex-grow bg-slate-50 border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
             <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="h-10" />
              <span className="ml-3 text-lg font-bold text-slate-800">BMS Portal</span>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1" aria-label="Sidebar">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal Menu</h3>
                {portalNavLinks
                    .filter(link => link.roles.includes(user.role))
                    .map(item => {
                        let path = item.path;

                        // Handle parent-specific paths
                        if (user.role === 'parent') {
                            if ((item as any).parentPath) {
                                path = (item as any).parentPath;
                            } else if (item.name === 'Attendance Log') {
                                // Only show this link if the parent has exactly ONE child.
                                if (user.studentIds && user.studentIds.length === 1) {
                                    path = `/portal/student/${user.studentIds[0]}/attendance-log`;
                                } else {
                                    // If 0 or >1 children, don't render this sidebar item.
                                    // They can access logs from the parent dashboard.
                                    return null;
                                }
                            }
                        } 
                        // Handle warden-specific path
                        else if (user.role === 'warden' && item.name === 'Portal Home') {
                            path = '/portal/hostel-dashboard';
                        }
                        
                        return (
                            <div key={item.name} onClick={onLinkClick}>
                                <NavItem to={path} end={path.endsWith('dashboard') || item.path.includes(':studentId/attendance-log') || item.path.endsWith('/profile') || path.endsWith('/admin')}>
                                    {item.icon}
                                    <span className="ml-3">{item.name}</span>
                                </NavItem>
                            </div>
                        );
                    })}
            </nav>
            <nav className="mt-6 flex-1 px-2 space-y-1">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Website Info</h3>
                {publicNavLinks.map(item => (
                    <a key={item.name} href={item.path} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-semibold rounded-md">
                        <span className="truncate">{item.name}</span>
                    </a>
                ))}
            </nav>
        </div>
    </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user }) => {
    return (
        <>
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0 print-hidden">
                <div className="flex flex-col w-64">
                    <SidebarContent user={user} />
                </div>
            </div>

            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 lg:hidden print-hidden transition-opacity ease-linear duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true">
                {/* Overlay */}
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsOpen(false)}></div>
                
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-slate-50 transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsOpen(false)}>
                            <span className="sr-only">Close sidebar</span>
                            <XIcon className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <SidebarContent user={user} onLinkClick={() => setIsOpen(false)}/>
                </div>
                <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
            </div>
        </>
    );
};

export default Sidebar;