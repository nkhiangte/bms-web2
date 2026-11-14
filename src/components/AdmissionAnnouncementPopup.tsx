import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { AdmissionSettings, NewsItem } from '@/types';
import { ADMISSION_ANNOUNCEMENT_CONFIG } from '@/config/admissionAnnouncementConfig';

const { Link } = ReactRouterDOM as any;

interface AdmissionAnnouncementPopupProps {
    news?: NewsItem[];
    admissionSettings?: AdmissionSettings;
}

const AdmissionAnnouncementPopup: React.FC<AdmissionAnnouncementPopupProps> = ({
    admissionSettings,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [imgHidden, setImgHidden] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        setMounted(true);

        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches);
        }

        if (!ADMISSION_ANNOUNCEMENT_CONFIG.enabled) return;

        try {
            if (sessionStorage.getItem(ADMISSION_ANNOUNCEMENT_CONFIG.sessionStorageKey) === 'true') {
                return;
            }
        } catch {
            // sessionStorage unavailable
        }

        const timer = window.setTimeout(() => {
            // Avoid overlapping if an admin enabled HomeResultPopup
            if (document.querySelector('[data-home-result-popup="open"]')) {
                return;
            }
            setIsOpen(true);
        }, ADMISSION_ANNOUNCEMENT_CONFIG.delayMs);

        return () => window.clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        try {
            sessionStorage.setItem(ADMISSION_ANNOUNCEMENT_CONFIG.sessionStorageKey, 'true');
        } catch {
            // Ignore storage errors
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleDismiss();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const sessionLabel = admissionSettings?.academicYearLabel
        ? `Session ${admissionSettings.academicYearLabel}`
        : null;

    const modalContent = (
        <div
            className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#10233F]/45 ${
                prefersReducedMotion ? '' : 'transition-opacity duration-200'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admission-popup-heading"
            onClick={handleDismiss}
        >
            <div
                onClick={event => event.stopPropagation()}
                className={`relative w-full max-w-[380px] sm:max-w-[430px] bg-[#F8F7F3] text-[#10233F] rounded-2xl border border-[#C9A33B]/70 shadow-2xl overflow-hidden ${
                    prefersReducedMotion ? '' : 'transition-transform duration-200 ease-out'
                }`}
            >
                {/* Gold accent rule */}
                <div className="h-1 w-full bg-[#C9A33B]" />

                {/* Visible Top-Right Close (x) Button */}
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Close admission announcement"
                    className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white hover:bg-[#10233F] text-[#10233F] hover:text-white border border-[#10233F]/15 flex items-center justify-center transition-colors shadow-sm cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A33B]"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-5 sm:p-6">
                    {/* Header Row: School Crest + Thumbnail + Eyebrow */}
                    <div className="flex items-center gap-3.5 pr-10">
                        <img
                            src={ADMISSION_ANNOUNCEMENT_CONFIG.crestUrl}
                            alt="Bethel Mission School Crest"
                            className="w-11 h-11 object-contain flex-shrink-0"
                        />
                        {!imgHidden && ADMISSION_ANNOUNCEMENT_CONFIG.imageUrl && (
                            <div className="w-16 h-11 rounded-lg overflow-hidden border border-[#10233F]/15 flex-shrink-0 bg-white">
                                <img
                                    src={ADMISSION_ANNOUNCEMENT_CONFIG.imageUrl}
                                    alt="Bethel Mission School, Champhai"
                                    referrerPolicy="no-referrer"
                                    onError={() => setImgHidden(true)}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8E6D1B]">
                                {ADMISSION_ANNOUNCEMENT_CONFIG.eyebrow}
                            </p>
                            {sessionLabel && (
                                <p className="text-xs font-semibold text-[#10233F]/75 tabular-nums">
                                    {sessionLabel}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Core Content */}
                    <h2
                        id="admission-popup-heading"
                        className="mt-4 text-lg sm:text-xl font-extrabold text-[#10233F] leading-snug"
                    >
                        {ADMISSION_ANNOUNCEMENT_CONFIG.headline}
                    </h2>

                    <p className="mt-1.5 text-sm text-[#10233F]/80 leading-relaxed">
                        {ADMISSION_ANNOUNCEMENT_CONFIG.description}
                    </p>

                    <p className="mt-2.5 text-xs font-semibold text-[#10233F]/70 border-t border-[#10233F]/10 pt-2.5">
                        {ADMISSION_ANNOUNCEMENT_CONFIG.highlights}
                    </p>

                    {/* Primary & Secondary Actions */}
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <Link
                            to={ADMISSION_ANNOUNCEMENT_CONFIG.applyRoute}
                            onClick={handleDismiss}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg bg-[#10233F] hover:bg-[#1A355E] text-white font-bold text-sm transition-colors whitespace-nowrap"
                        >
                            <span>{ADMISSION_ANNOUNCEMENT_CONFIG.applyLabel}</span>
                            <ArrowRight className="w-4 h-4 text-[#C9A33B]" />
                        </Link>

                        <Link
                            to={ADMISSION_ANNOUNCEMENT_CONFIG.learnMoreRoute}
                            onClick={handleDismiss}
                            className="flex-1 inline-flex items-center justify-center min-h-[42px] px-4 py-2 rounded-lg bg-white hover:bg-[#10233F]/5 text-[#10233F] font-bold text-sm border border-[#10233F]/20 transition-colors whitespace-nowrap"
                        >
                            {ADMISSION_ANNOUNCEMENT_CONFIG.learnMoreLabel}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default AdmissionAnnouncementPopup;
