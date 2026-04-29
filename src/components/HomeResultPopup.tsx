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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-[110] bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/30 group"
                        >
                            <XIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="overflow-y-auto w-full h-full bg-slate-900 flex items-center justify-center">
                            {/* The content can be an image or editable content for admin */}
                            <div className="relative w-full h-full">
                                <EditableContent 
                                    id="home_popup_image" 
                                    defaultContent="https://placehold.co/1200x1600/0f172a/white?text=HSLC+2026+Results\nUpload+Image+Here" 
                                    type="image" 
                                    user={user}
                                    className="w-full h-auto object-contain"
                                    imgAlt="HSLC 2026 Distinction Results"
                                />
                                
                                {user?.role === 'admin' && (
                                    <div className="absolute bottom-4 left-4 z-[110] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-[10px] text-white/70 uppercase tracking-widest font-bold pointer-events-none">
                                        Admin Interface: Popup Status
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin toggle for enabling/disabling the popup */}
                        {user?.role === 'admin' && (
                            <div className="p-4 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">Visitor Popup Status</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Only admins can see this bar</span>
                                    </div>
                                    <button 
                                        onClick={handleTogglePopup}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                            isEnabled ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                        }`}
                                    >
                                        {isEnabled ? 'Active (Click to Disable)' : 'Inactive (Click to Enable)'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                     <p className="text-[10px] text-slate-400 italic max-w-[200px] text-right leading-tight">
                                         Click the edit icon on the image to upload the HSLC Distinction List.
                                     </p>
                                     <button
                                         onClick={handleClose}
                                         className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors shrink-0"
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
