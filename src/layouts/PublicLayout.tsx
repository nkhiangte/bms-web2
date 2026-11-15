import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { WhatsappIcon } from '@/components/Icons';
import AdmissionAnnouncementPopup from '@/components/AdmissionAnnouncementPopup';
import { User, NavMenuItem, NewsItem, AdmissionSettings } from '@/types';

const { Outlet, useLocation } = ReactRouterDOM as any;

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
    '/': {
        title: 'Bethel Mission School, Champhai | Nursery to Class X · bms04.com',
        description:
            'Bethel Mission School, Champhai, Mizoram (bms04.com) — Service to God & Men since 1996. Admissions open Nursery to Class X (MBSE) with hostel & HSLC excellence.',
    },
    '/about': {
        title: 'About Us | Bethel Mission School, Champhai',
        description:
            'Founded in 1996 in Bethel Veng, Champhai, Mizoram. Learn about our Christian values, heritage, leadership, and mission: Service to God & Men.',
    },
    '/academics': {
        title: 'Academics, Curriculum & Syllabus | Bethel Mission School, Champhai',
        description:
            'Explore MBSE Nursery to Class X curriculum, class-wise syllabus, textbooks, and HSLC top-ten academic achievements at Bethel Mission School.',
    },
    '/admissions': {
        title: 'Admissions 2026-27 & Fee Structure | Bethel Mission School, Champhai',
        description:
            'Apply for Nursery to Class X admission at Bethel Mission School, Champhai. View transparent fee structure, required documents, prospectus, and WhatsApp inquiry.',
    },
    '/contact': {
        title: 'Contact Us | Bethel Mission School, Champhai',
        description:
            'Contact Bethel Mission School, Bethel Veng, Champhai, Mizoram 796321. Phone/WhatsApp +91 9862148342, Email bms@bms04.com, and school office hours.',
    },
    '/fees': {
        title: 'Fee Structure | Bethel Mission School, Champhai',
        description:
            'Official tuition, admission, and annual fee structure from Nursery to Class X at Bethel Mission School, Champhai.',
    },
    '/facilities': {
        title: 'Campus Facilities | Bethel Mission School, Champhai',
        description:
            'Explore science laboratories, library, computer lab, smart classrooms, and sports facilities at Bethel Mission School, Champhai.',
    },
    '/faculty': {
        title: 'Faculty & Staff | Bethel Mission School, Champhai',
        description:
            'Meet the dedicated and experienced teaching faculty and administration at Bethel Mission School, Champhai, Mizoram.',
    },
    '/gallery': {
        title: 'Photo Gallery | Bethel Mission School, Champhai',
        description:
            'Campus photos, annual day highlights, science exhibitions, sports, and student life at Bethel Mission School, Champhai.',
    },
    '/news': {
        title: 'Latest News & Notices | Bethel Mission School, Champhai',
        description:
            'Official school announcements, exam updates, holiday notices, and upcoming events at Bethel Mission School, Champhai.',
    },
    '/hostel': {
        title: 'Residential Hostel | Bethel Mission School, Champhai',
        description:
            'Safe, disciplined, and supportive residential hostel facilities for students in Champhai, Mizoram.',
    },
    '/achievements': {
        title: 'Academic & Science Achievements | Bethel Mission School, Champhai',
        description:
            'MBSE HSLC rank holders, INSPIRE MANAK awards, NCSC qualifiers, and State Maths winners from Bethel Mission School.',
    },
    '/achievements/science': {
        title: 'Science & Maths Achievements | Bethel Mission School, Champhai',
        description:
            'INSPIRE MANAK, National Children Science Congress (NCSC), State Maths Competition, and SLSMEE honors.',
    },
    '/disclosure': {
        title: 'Mandatory Public Disclosure | Bethel Mission School, Champhai',
        description:
            'Official school affiliation, safety certificates, infrastructure, and academic public disclosure for Bethel Mission School, Champhai.',
    },
};

function upsertMeta(selector: string, attrName: 'name' | 'property', attrValue: string, content: string) {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

interface PublicLayoutProps {
    user: User | null;
    navigation: NavMenuItem[];
    news?: NewsItem[];
    admissionSettings?: AdmissionSettings;
}

const FLOATING_WHATSAPP_URL =
    'https://wa.me/919862148342?text=' +
    encodeURIComponent('Hello, I want admission for Class ___ at Bethel Mission School');

const PublicLayout: React.FC<PublicLayoutProps> = ({ user, navigation, news = [], admissionSettings }) => {
    const location = useLocation();

    useEffect(() => {
        const cleanPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
        const meta = ROUTE_SEO[cleanPath] || {
            title: 'Bethel Mission School, Champhai | bms04.com',
            description:
                'Bethel Mission School, Champhai, Mizoram (Est. 1996) — Service to God & Men. MBSE English Medium School from Nursery to Class X.',
        };

        document.title = meta.title;
        const canonicalUrl = `https://www.bms04.com${cleanPath === '/' ? '/' : cleanPath}`;

        let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        upsertMeta('meta[name="description"]', 'name', 'description', meta.description);
        upsertMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
        upsertMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
        upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
        upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
        upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);
        upsertMeta('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);
    }, [location.pathname]);

    return (
        <div className="bms-public-site min-h-screen flex flex-col bg-white text-[#252A32]">
            <PublicHeader user={user} navigation={navigation} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <PublicFooter />

            {/* Dismissible Admission Announcement Popup (once per session, 1.5s delay) */}
            <AdmissionAnnouncementPopup news={news} admissionSettings={admissionSettings} />

            {/* Persistent Floating WhatsApp Admission Button on Every Public Page */}
            <a
                href={FLOATING_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp for Admission"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 min-h-[46px] px-4 py-2.5 rounded-full bg-[#142B49] hover:bg-[#1C3B63] text-[#F8F6F0] font-bold text-xs sm:text-sm border border-[#C5A46D] shadow-lg transition-transform hover:scale-105"
            >
                <WhatsappIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#C5A46D]" />
                <span>WhatsApp Admission</span>
            </a>
        </div>
    );
};

export default PublicLayout;
