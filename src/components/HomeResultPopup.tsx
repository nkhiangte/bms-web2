import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    if (isLoading || !mounted) return null;

    const popupContent = (
        <AnimatePresence>
            {isOpen && (
                <div
                    data-home-result-popup="open"
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 w-full h-[100dvh] min-h-screen overflow-x-hidden overflow-y-auto"
                >
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 w-full h-full bg-[#07162B]/90 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        className="relative z-10 m-auto w-full max-w-[90vw] sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[85vh] sm:max-h-[88vh] bg-[#0B1F3A] rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-[#C9A84C] self-center origin-center"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={handleClose}
                            aria-label="Close popup"
                            className="absolute top-3 right-3 z-[130] bg-[#0B1F3A] hover:bg-[#132D52] text-white w-10 h-10 flex items-center justify-center rounded-full transition-all border border-[#C9A84C] shadow-xl group focus:outline-none"
                        >
                            <XIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="flex-grow overflow-y-auto overflow-x-hidden w-full bg-[#07162B] flex flex-col items-center justify-start">
                            <div className="relative w-full flex justify-center items-center overflow-x-hidden p-0">
                                <EditableContent 
                                    id="home_popup_image" 
                                    defaultContent="/assets/school/campus.jpg" 
                                    type="image" 
                                    user={user}
                                    className="w-full max-w-full flex justify-center items-center overflow-hidden"
                                    imgClassName="w-full h-auto max-w-full object-contain block mx-auto select-none"
                                    buttonClassName="top-4 left-4"
                                    alwaysShowButton={true}
                                    imgAlt="Bethel Mission School Announcement"
                                />
                                
                                {user?.role === 'admin' && (
                                    <div className="absolute bottom-4 left-4 z-[110] bg-[#0B1F3A]/90 px-3 py-1.5 rounded-lg border border-[#C9A84C]/60 text-[11px] text-[#DFC06B] uppercase tracking-wider font-bold pointer-events-none flex flex-col gap-0.5 shadow-lg">
                                        <div>Admin Edit Mode</div>
                                        <div className="text-[10px] text-white/80 font-normal">Popup shows to visitors only when Active</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin toggle for enabling/disabling the popup */}
                        {user?.role === 'admin' && (
                            <div className="p-3 sm:p-4 bg-[#0B1F3A] border-t border-[#C9A84C]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-bold text-white">Visitor Popup Status</span>
                                        <span className="text-[10px] text-[#DFC06B] uppercase font-bold tracking-tight">Admin control</span>
                                    </div>
                                    <button 
                                        onClick={handleTogglePopup}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                            isEnabled
                                                ? 'bg-[#C9A84C] text-[#0B1F3A] hover:bg-[#DFC06B]'
                                                : 'bg-[#132D52] text-white border border-[#C9A84C]/50 hover:bg-[#1C3D6E]'
                                        }`}
                                    >
                                        {isEnabled ? 'Active (Live for visitors)' : 'Inactive (Hidden from visitors)'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                     <p className="hidden md:block text-[10px] text-white/75 italic max-w-[200px] text-right leading-tight">
                                         Click the edit button on top-left of image to upload a new banner.
                                     </p>
                                     <button
                                         onClick={handleClose}
                                         className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-white hover:bg-[#F4F7FB] text-[#0B1F3A] font-bold rounded-lg text-xs sm:text-sm transition-colors shrink-0"
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

    return typeof document !== 'undefined' ? createPortal(popupContent, document.body) : null;
};

export default HomeResultPopup;
