import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon, SpinnerIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';
import { User } from '@/types';
import EditableContent from '@/components/EditableContent';

interface HomeResultPopupProps {
    user: User | null;
}

const HomeResultPopup: React.FC<HomeResultPopupProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnabled, setIsEnabled] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        // Check if we already showed it in this session
        const hasShown = sessionStorage.getItem('hasShownHomePopup');
        const isAdmin = user?.role === 'admin';
        
        // 1. Fetch the image URL from its dedicated document
        const unsubImage = db.collection('website_content').doc('home_popup_image').onSnapshot((doc) => {
            if (doc.exists) {
                setImageUrl(doc.data()?.value || '');
            }
        });

        // 2. Fetch the popup config (enabled status)
        const unsubConfig = db.collection('website_content').doc('home_popup_config').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data) {
                    setIsEnabled(data.enabled ?? false);
                    if ((data.enabled || isAdmin)) {
                        if (!hasShown || isAdmin) {
                            setTimeout(() => setIsOpen(true), 1000);
                        }
                    }
                }
            } else if (isAdmin) {
                // If config doesn't exist and user is admin, show it to allow setup
                setIsOpen(true);
                setIsEnabled(false);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching popup config:", error);
            setIsLoading(false);
        });

        return () => {
            unsubImage();
            unsubConfig();
        };
    }, [user]);

    const handleTogglePopup = async () => {
        if (!user || user.role !== 'admin') return;
        
        try {
            await db.collection('website_content').doc('home_popup_config').set({
                enabled: !isEnabled,
                updatedAt: new Date().toISOString(),
                updatedBy: user.email
            }, { merge: true });
        } catch (error) {
            console.error("Failed to toggle popup:", error);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasShownHomePopup', 'true');
    };

    if (isLoading) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-[94vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-800"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={handleClose}
                            aria-label="Close popup"
                            className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-[130] bg-black/70 hover:bg-black/90 text-white p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-xl group focus:outline-none"
                        >
                            <XIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="flex-grow overflow-y-auto overflow-x-hidden w-full bg-slate-950 flex flex-col items-center">
                            <div className="relative w-full flex justify-center items-start overflow-x-hidden">
                                <EditableContent 
                                    id="home_popup_image" 
                                    defaultContent="https://placehold.jp/24/0f172a/ffffff/1200x1600.png?text=HSLC+2026+Distinction+List\n(Click+the+blue+pencil+on+top+left+to+upload)" 
                                    type="image" 
                                    user={user}
                                    className="w-full max-w-full flex justify-center items-start overflow-hidden"
                                    imgClassName="w-full h-auto max-w-full object-contain block mx-auto select-none"
                                    buttonClassName="top-4 left-4"
                                    alwaysShowButton={true}
                                    imgAlt="HSLC 2026 Distinction Results"
                                />
                                
                                {user?.role === 'admin' && (
                                    <div className="absolute bottom-4 left-4 z-[110] bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[11px] text-white/90 uppercase tracking-widest font-black pointer-events-none flex flex-col gap-0.5 shadow-lg">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                                            Admin Edit Mode
                                        </div>
                                        <div className="text-[9px] text-slate-300 font-normal">Popup will only show to visitors if Active</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin toggle for enabling/disabling the popup */}
                        {user?.role === 'admin' && (
                            <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-bold text-slate-200">Visitor Popup Status</span>
                                        <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-tight">Admin control</span>
                                    </div>
                                    <button 
                                        onClick={handleTogglePopup}
                                        className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                            isEnabled ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                        }`}
                                    >
                                        {isEnabled ? 'Active (Live for visitors)' : 'Inactive (Hidden from visitors)'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                     <p className="hidden md:block text-[10px] text-slate-400 italic max-w-[200px] text-right leading-tight">
                                         Click the blue pencil button on top-left of image to upload a new banner.
                                     </p>
                                     <button
                                         onClick={handleClose}
                                         className="w-full sm:w-auto px-4 sm:px-5 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs sm:text-sm transition-colors shrink-0 border border-slate-700"
                                     >
                                         Close Preview
                                     </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HomeResultPopup;
