import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { ChevronDownIcon, LogoutIcon, KeyIcon, SyncIcon, UserIcon } from './Icons';
import PhotoWithFallback from './PhotoWithFallback';

const { Link } = ReactRouterDOM as any;

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onToggleSidebar: () => void;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar, className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClearCache = () => {
    setIsMenuOpen(false);
    if (!window.confirm("This will clear all application caches and force a reload. This can help fix display issues. Are you sure you want to proceed?")) {
        return;
    }

    let unregistering: Promise<any> = Promise.resolve();
    if ('serviceWorker' in navigator) {
        unregistering = navigator.serviceWorker.getRegistrations().then(function(registrations) {
            return Promise.all(registrations.map(r => r.unregister()));
        });
    }

    unregistering.then(() => {
        return caches.keys();
    }).then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                return caches.delete(cacheName);
            })
        );
    }).then(() => {
        alert("Cache and service workers cleared. The application will now perform a hard reload.");
        window.location.reload();
    }).catch(error => {
        console.error("Cache clearing failed:", error);
        alert("Could not clear cache. Please try clearing your browser's data manually.");
    });
  };

  return (
    <header className={`bg-white sticky top-0 z-20 shadow-sm border-b border-slate-200 ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
            {/* Mobile sidebar toggle */}
            <button
                type="button"
                className="mr-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 lg:hidden"
                onClick={onToggleSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <Link to="/portal/dashboard" title="Go to Dashboard" className="flex items-center gap-3">
                <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="h-10 sm:h-12" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 hidden md:block uppercase">
                    Bethel Mission School
                  </h1>
                  <p className="text-xs text-slate-500 hidden md:block">Student Management Portal</p>
                </div>
            </Link>
        </div>

        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
                <div className="w-8 h-8">
                    <PhotoWithFallback src={user.photoURL || undefined} alt="User avatar" />
                </div>
                <span className="font-semibold text-slate-700 hidden sm:inline">Welcome, {user.displayName || user.email}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-600 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMenuOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-fade-in"
                    onMouseLeave={() => setIsMenuOpen(false)}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <Link
                            to="/portal/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <UserIcon className="w-5 h-5"/>
                            My Profile
                        </Link>
                        <Link
                            to="/portal/change-password"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <KeyIcon className="w-5 h-5"/>
                            Change Password
                        </Link>
                        <button
                            onClick={() => { onLogout(); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            role="menuitem"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            Logout
                        </button>
                         {user.role === 'admin' && (
                            <>
                                <div className="my-1 border-t border-slate-200"></div>
                                <button
                                    onClick={handleClearCache}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                                    role="menuitem"
                                >
                                    <SyncIcon className="w-5 h-5"/>
                                    Clear Cache & Reload
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;