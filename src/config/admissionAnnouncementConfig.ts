/**
 * Frontend configuration for the dismissible Admission Announcement Popup.
 * Administrators can easily edit the popup copy, image, delay, or target routes here
 * without adding extra Firestore collections or modifying security rules.
 */
export interface AdmissionAnnouncementConfig {
    /** Toggle popup visibility site-wide for first-time session visitors */
    enabled: boolean;
    /** Delay in milliseconds before displaying popup after page load (1000-2000ms) */
    delayMs: number;
    /** sessionStorage key used so dismissed popups do not reappear in the same session */
    sessionStorageKey: string;
    /** Small institutional label above the headline */
    eyebrow: string;
    /** Main popup heading */
    headline: string;
    /** Supporting invitation copy */
    description: string;
    /** Accurate summary from existing website details (no invented dates/classes) */
    highlights: string;
    /** Primary CTA label & existing online application route */
    applyLabel: string;
    applyRoute: string;
    /** Secondary CTA label & existing admissions overview route */
    learnMoreLabel: string;
    learnMoreRoute: string;
    /** Compact visual thumbnail & crest image paths */
    imageUrl: string;
    crestUrl: string;
}

export const ADMISSION_ANNOUNCEMENT_CONFIG: AdmissionAnnouncementConfig = {
    enabled: true,
    delayMs: 1500,
    sessionStorageKey: 'bms_admission_popup_dismissed_v1',
    eyebrow: 'ADMISSIONS OPEN 2027',
    headline: 'Give Your Child a Strong Foundation',
    description: 'Applications are invited for admission to Bethel Mission School, Champhai.',
    highlights: 'Nursery to Class X · English Medium · MBSE Affiliated',
    applyLabel: 'Apply Now',
    applyRoute: '/admissions/online',
    learnMoreLabel: 'Learn More',
    learnMoreRoute: '/admissions',
    imageUrl: '/assets/school/campus.jpg',
    crestUrl: '/assets/school/bms-logo-color.png',
};
