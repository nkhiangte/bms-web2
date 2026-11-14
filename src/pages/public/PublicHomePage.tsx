import React, { useMemo, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Award, ShieldCheck, BookOpen, Trophy, ArrowRight, Atom, Calculator, Sparkles } from 'lucide-react';
import { db } from '@/firebaseConfig';
import { WhatsappIcon, UserIcon } from '@/components/Icons';
import { NewsItem, User, Staff, Grade, GradeDefinition } from '@/types';
import HomeResultPopup from '@/components/HomeResultPopup';
import LatestNewsBannerSection from '@/components/LatestNewsBannerSection';
import HslcShowcaseSection from '@/components/HslcShowcaseSection';

const { Link } = ReactRouterDOM as any;

const CAMPUS_PHOTO_LOCAL = '/assets/school/campus.jpg';
const WHATSAPP_ADMISSION_URL =
    'https://wa.me/919862148342?text=' +
    encodeURIComponent('Hello, I want admission for Class ___ at Bethel Mission School');

interface GalleryPhoto {
    id: string;
    src: string;
    title: string;
    caption?: string;
}

const FALLBACK_GALLERY_PHOTOS: GalleryPhoto[] = [
    {
        id: 'campus-1',
        src: '/assets/school/campus.jpg',
        title: 'Champhai Campus & Assembly',
        caption: 'Bethel Veng, Champhai',
    },
    {
        id: 'ranker-esther',
        src: '/assets/school/esther.jpg',
        title: 'MBSE HSLC 4th Rank Holder',
        caption: 'Esther Tingbiakmuani (2023)',
    },
    {
        id: 'ranker-manngaih',
        src: '/assets/school/manngaih.jpg',
        title: 'MBSE HSLC 10th Rank Holder',
        caption: 'Manngaihsangi (2020)',
    },
];

interface PublicHomePageProps {
    news: NewsItem[];
    user: User | null;
    staff?: Staff[];
    gradeDefinitions?: Record<Grade, GradeDefinition>;
}

const PublicHomePage: React.FC<PublicHomePageProps> = ({
    news,
    user,
    staff = [],
}) => {
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(FALLBACK_GALLERY_PHOTOS);
    const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
    const [principalImgError, setPrincipalImgError] = useState(false);

    const principalMember = useMemo(() => {
        return (staff || []).find(
            s =>
                s &&
                (s.designation?.toLowerCase().includes('principal') ||
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes('malsawmdawngi'))
        );
    }, [staff]);

    useEffect(() => {
        let cancelled = false;
        const loadGalleryPhotos = async () => {
            try {
                const candidateDocIds = [
                    'gallery_by_event_occasion_annual_day',
                    'gallery_by_event_occasion_sports_day',
                    'gallery_by_category_campus___infrastructure',
                    'gallery_by_category_classrooms',
                    'gallery_by_category_achievements',
                    'gallery_by_category_activities',
                ];
                const collected: GalleryPhoto[] = [];

                for (const docId of candidateDocIds) {
                    if (collected.length >= 3) break;
                    try {
                        const snap = await db.collection('website_content').doc(docId).get();
                        if (snap.exists && Array.isArray(snap.data()?.items)) {
                            const items = snap.data()!.items as Array<{
                                id?: string;
                                title?: string;
                                caption?: string;
                                imageSrc?: string;
                                type?: string;
                            }>;
                            for (const item of items) {
                                if (item.type !== 'video' && item.imageSrc && collected.length < 3) {
                                    collected.push({
                                        id: item.id || `${docId}-${collected.length}`,
                                        src: item.imageSrc,
                                        title: item.title || 'School Memory',
                                        caption: item.caption || '',
                                    });
                                }
                            }
                        }
                    } catch {
                        // Skip individual doc errors on slow networks
                    }
                }

                if (!cancelled && collected.length > 0) {
                    const merged = [...collected];
                    for (const fb of FALLBACK_GALLERY_PHOTOS) {
                        if (merged.length >= 3) break;
                        if (!merged.some(p => p.src === fb.src)) merged.push(fb);
                    }
                    setGalleryPhotos(merged.slice(0, 3));
                }
            } catch {
                // Keep real local fallback photos
            }
        };

        loadGalleryPhotos();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundAttachment = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundColor = '#FFFFFF';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    const whyBethelItems = [
        {
            title: 'Experienced Teachers',
            description: 'Dedicated MBSE-trained educators giving individual care from Nursery to Class X.',
            icon: Award,
        },
        {
            title: 'Hostel & Discipline',
            description: 'Safe supervised hostel routines nurturing strong study habits and self-discipline.',
            icon: ShieldCheck,
        },
        {
            title: 'Christian Values',
            description: 'Character formation anchored in faith, integrity, and service to God and neighbours.',
            icon: BookOpen,
        },
        {
            title: 'Sports & Activities',
            description: 'Basketball, volleyball, NCC, science fairs, and cultural programs for all-round growth.',
            icon: Trophy,
        },
    ];

    return (
        <div className="bg-white text-[#0B1F3A]">
            <HomeResultPopup user={user} />

            {/* Lightbox Modal for Gallery */}
            {lightboxPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-[#07162B]/95 flex items-center justify-center p-4"
                    onClick={() => setLightboxPhoto(null)}
                >
                    <div
                        className="relative max-w-3xl w-full bg-[#0B1F3A] border border-[#C9A84C] rounded-2xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxPhoto(null)}
                            aria-label="Close photo"
                            className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-[#07162B]/90 text-white hover:text-[#DFC06B] text-2xl flex items-center justify-center border border-[#C9A84C]/50 cursor-pointer"
                        >
                            &times;
                        </button>
                        <img
                            src={lightboxPhoto.src}
                            alt={lightboxPhoto.title}
                            className="w-full max-h-[75vh] object-contain bg-[#07162B]"
                            onError={e => {
                                (e.currentTarget as HTMLImageElement).src = CAMPUS_PHOTO_LOCAL;
                            }}
                        />
                        <div className="p-4 text-center border-t border-[#C9A84C]/30">
                            <p className="text-base font-bold text-white">{lightboxPhoto.title}</p>
                            {lightboxPhoto.caption && (
                                <p className="text-xs text-[#DFC06B] mt-1">{lightboxPhoto.caption}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <h1 className="sr-only">Bethel Mission School, Champhai</h1>

            {/* ── TOP: LATEST NEWS & ANNOUNCEMENTS ── */}
            <LatestNewsBannerSection news={news} />

            {/* ── WHY BETHEL MISSION SCHOOL — Academic Record First, Then 4 Core Pillars ── */}
            <section className="py-12 sm:py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Trusted Since 1996
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                            Why Bethel Mission School
                        </h2>
                        <div className="gold-rule mt-4" />
                    </div>

                    {/* 1. Academic Record & HSLC Distinctions — First under Why Bethel Mission School */}
                    <div className="mb-8 sm:mb-10">
                        <HslcShowcaseSection embedded />
                    </div>

                    {/* 2. Core School Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {whyBethelItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="bg-[#F4F7FB] rounded-xl border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 flex flex-col items-start shadow-sm"
                                >
                                    <div className="w-11 h-11 rounded-lg bg-[#0B1F3A] text-[#DFC06B] flex items-center justify-center mb-4 flex-shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-[#0B1F3A]">{item.title}</h3>
                                    <p className="mt-2 text-sm text-[#0B1F3A]/75 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 2C. SCIENCE & MATHS ACHIEVEMENTS (COMPACT SECONDARY) ── */}
            <section className="py-10 sm:py-14 bg-[#F8F7F3] border-b border-[#10233F]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B]">
                                STEM &amp; Olympiad Recognition
                            </p>
                            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#10233F]">
                                Science &amp; Maths Achievements
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-[#10233F]/75 max-w-2xl">
                                Complementary state and national recognition in Science Congresses, INSPIRE MANAK, and Mizoram Mathematics Society contests.
                            </p>
                        </div>
                        <Link
                            to="/achievements/science"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#10233F] hover:text-[#8E6D1B] transition-colors whitespace-nowrap flex-shrink-0"
                        >
                            <span>View All STEM Honours</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                title: 'INSPIRE Award MANAK',
                                highlight: 'New Delhi Nationals',
                                detail: 'State 1st & 2nd Prize winners (2012, 2015, 2021, 2024).',
                                link: '/achievements/science/inspire-award',
                                icon: Sparkles,
                            },
                            {
                                title: "Children's Science Congress",
                                highlight: 'National Level Selection',
                                detail: 'District & State winners presenting across major Indian cities.',
                                link: '/achievements/science/ncsc',
                                icon: Atom,
                            },
                            {
                                title: 'State Mathematics Contest',
                                highlight: '1st Prize (2022 & 2023)',
                                detail: 'MMS State 1st Prize winners Paumuansanga & Esther Tingbiakmuani.',
                                link: '/achievements/science/mathematics-competition',
                                icon: Calculator,
                            },
                            {
                                title: 'SLSMEE & Incentive Awards',
                                highlight: 'State Board Honours',
                                detail: 'Recognised in State Level Science Exhibitions since 2007.',
                                link: '/achievements/science',
                                icon: Award,
                            },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.title}
                                    to={item.link}
                                    className="group bg-white rounded-xl border border-[#10233F]/12 hover:border-[#C9A33B] p-4 flex flex-col justify-between transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-[#10233F]/5 text-[#10233F] flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[11px] font-bold text-[#8E6D1B] uppercase tracking-wide font-tabular truncate">
                                                {item.highlight}
                                            </span>
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-[#10233F] group-hover:text-[#8E6D1B] transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1.5 text-xs text-[#10233F]/75 leading-relaxed">
                                            {item.detail}
                                        </p>
                                    </div>
                                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#10233F] group-hover:text-[#8E6D1B] transition-colors">
                                        <span>Details</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 3. ADMISSIONS OPEN BANNER — With WhatsApp Apply Button ── */}
            <section className="py-12 sm:py-16 bg-[#0B1F3A] text-white border-y-2 border-[#C9A84C]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#DFC06B]">
                                Enrollment Open
                            </p>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
                                Admissions Open Nursery - Class XI, Session 2026-27. Limited Seats.
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
                            <a
                                href={WHATSAPP_ADMISSION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3.5 bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold rounded-lg transition-colors shadow-lg text-sm sm:text-base whitespace-nowrap"
                            >
                                <WhatsappIcon className="w-5 h-5 flex-shrink-0" />
                                <span>WhatsApp Apply</span>
                            </a>
                            <Link
                                to="/admissions/online"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3.5 bg-white hover:bg-[#F4F7FB] text-[#0B1F3A] font-bold rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
                            >
                                <span>Online Form</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. GALLERY — 3 Real Photos ── */}
            <section className="py-16 sm:py-24 bg-[#F4F7FB]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Campus Life
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                            Gallery
                        </h2>
                        <div className="gold-rule mt-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {galleryPhotos.map(photo => (
                            <button
                                key={photo.id}
                                type="button"
                                onClick={() => setLightboxPhoto(photo)}
                                className="group text-left bg-white rounded-xl overflow-hidden border border-[#0B1F3A]/15 hover:border-[#C9A84C] shadow-sm transition-all cursor-pointer"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-[#07162B]">
                                    <img
                                        src={photo.src}
                                        alt={photo.title}
                                        loading="lazy"
                                        decoding="async"
                                        onError={e => {
                                            (e.currentTarget as HTMLImageElement).src = CAMPUS_PHOTO_LOCAL;
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-[#0B1F3A] text-sm sm:text-base truncate">
                                        {photo.title}
                                    </h3>
                                    {photo.caption && (
                                        <p className="text-xs text-[#8E6D1B] font-semibold mt-0.5 truncate">
                                            {photo.caption}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            to="/gallery"
                            className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white font-bold text-sm rounded-lg transition-colors bg-white"
                        >
                            <span>View Full Gallery</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 5. PRINCIPAL'S MESSAGE — Photo + 3 Lines ── */}
            <section className="py-16 sm:py-24 bg-white border-t border-[#0B1F3A]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-[#F4F7FB] rounded-2xl border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-10 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-[#C9A84C] bg-[#0B1F3A] flex-shrink-0 flex items-center justify-center shadow-md">
                                {principalMember?.photographUrl && !principalImgError ? (
                                    <img
                                        src={principalMember.photographUrl}
                                        alt="K. Malsawmdawngi, Principal"
                                        loading="lazy"
                                        decoding="async"
                                        onError={() => setPrincipalImgError(true)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : !principalImgError ? (
                                    <img
                                        src="/assets/school/bms-logo-color.png"
                                        alt="Principal, Bethel Mission School"
                                        loading="lazy"
                                        decoding="async"
                                        onError={() => setPrincipalImgError(true)}
                                        className="w-24 h-24 object-contain p-2"
                                    />
                                ) : (
                                    <UserIcon className="w-16 h-16 text-[#DFC06B]" />
                                )}
                            </div>

                            <div className="text-center sm:text-left">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B]">
                                    Leadership Desk
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1">
                                    Principal&apos;s Message
                                </h2>
                                <div className="mt-4 space-y-1.5 text-sm sm:text-base text-[#0B1F3A]/85 leading-relaxed">
                                    <p>Since 1996, Bethel Mission School has nurtured young minds in Champhai with strong discipline and faith-anchored learning.</p>
                                    <p>Our dedicated teachers partner closely with parents so every child grows in wisdom, confidence, and board readiness.</p>
                                    <p>Guided by &ldquo;Service to God &amp; Men,&rdquo; we welcome your family into a caring and focused school community.</p>
                                </div>
                                <div className="mt-5 pt-4 border-t border-[#0B1F3A]/10">
                                    <p className="font-extrabold text-[#0B1F3A]">K. Malsawmdawngi</p>
                                    <p className="text-xs font-semibold text-[#8E6D1B]">
                                        Principal, Bethel Mission School, Champhai
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicHomePage;
