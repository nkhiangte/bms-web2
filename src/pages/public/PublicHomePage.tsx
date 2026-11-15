import React, { useMemo, useEffect, useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
    Award,
    BookOpen,
    ShieldCheck,
    Trophy,
    ArrowRight,
    Download,
    ChevronDown,
    Phone,
    Check,
} from 'lucide-react';
import { db } from '@/firebaseConfig';
import { WhatsappIcon, UserIcon } from '@/components/Icons';
import { NewsItem, User, Staff, Grade, GradeDefinition } from '@/types';
import HomeResultPopup from '@/components/HomeResultPopup';
import { isPublishedNewsItem } from '@/components/LatestNewsBannerSection';
import { formatDateForNews } from '@/utils';

const { Link } = ReactRouterDOM as any;

const CAMPUS_PHOTO_LOCAL = '/assets/school/campus.jpg';
const CREST_LOGO_LOCAL = '/assets/school/bms-logo-color.png';
const WHATSAPP_ADMISSION_URL =
    'https://wa.me/919862148342?text=' +
    encodeURIComponent('Hello, I want admission for Class ___ at Bethel Mission School');

interface PhotoTile {
    id: string;
    src: string;
    title: string;
    category: string;
}

const RANK_HOLDERS = [
    {
        name: 'Esther Tingbiakmuani',
        rank: '4th Rank · MBSE HSLC',
        year: '2023',
        imgSrc: '/assets/school/esther.jpg',
        fallbackSrc: CREST_LOGO_LOCAL,
    },
    {
        name: 'Manngaihsangi',
        rank: '10th Rank · MBSE HSLC',
        year: '2020',
        imgSrc: '/assets/school/manngaih.jpg',
        fallbackSrc: CREST_LOGO_LOCAL,
    },
    {
        name: 'C.L. Kimteii',
        rank: '10th Rank · MBSE HSLC',
        year: '2019',
        imgSrc: 'https://i.ibb.co/ks8prn9Z/cl-kim.jpg',
        fallbackSrc: CREST_LOGO_LOCAL,
    },
    {
        name: 'R. Lalrinmawii',
        rank: '10th Rank · MBSE HSLC',
        year: '2019',
        imgSrc: 'https://i.ibb.co/1fYFM37C/r-rinmawii.jpg',
        fallbackSrc: CREST_LOGO_LOCAL,
    },
];

const FEATURED_HONOURS = [
    {
        title: 'INSPIRE MANAK',
        subtitle: 'National Exhibition Selection, New Delhi',
        description:
            'State 1st & 2nd Prize winners (2012, 2015, 2021, 2024) representing Mizoram with original student scientific innovations.',
        imageSrc: 'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-4900955725830066556-n.jpg',
        link: '/achievements/science/inspire-award',
    },
    {
        title: "National Children's Science Congress",
        subtitle: 'District & State Qualifiers to Nationals',
        description:
            'Student researchers representing Mizoram at national congresses across Bengaluru, Chandigarh, Pune, and Bhubaneswar.',
        imageSrc: 'https://i.ibb.co/gbZSsDzP/515223941-24291994003758307-393621482748103493-n.jpg',
        link: '/achievements/science/ncsc',
    },
    {
        title: 'State Maths Competition',
        subtitle: 'Mizoram Mathematics Society Winners',
        description:
            'State-Level 1st Prize laureates in 2022 and 2023 organised by the Mizoram Mathematics Society & MISTIC.',
        imageSrc: 'https://i.ibb.co/wNdTrN1Y/514321355-24293614526929588-1390587138641001551-n.jpg',
        link: '/achievements/science/mathematics-competition',
    },
    {
        title: 'SLSMEE Honours',
        subtitle: 'State Science, Maths & Environment Exhibition',
        description:
            'State-level prize winners advancing to the Eastern India Science Fair in Kolkata and national JNSMEE in Bhopal.',
        imageSrc: 'https://i.ibb.co/FkGDQzSQ/scf.jpg',
        link: '/achievements/science/slsmee',
    },
];

const FALLBACK_LIFE_TILES: PhotoTile[] = [
    {
        id: 'life-campus',
        src: CAMPUS_PHOTO_LOCAL,
        title: 'Morning Assembly & Classroom Learning',
        category: 'Classroom Learning',
    },
    {
        id: 'life-science',
        src: 'https://i.ibb.co/PZQWjnSw/513908221-24296131616677879-6351230232773483387-n.jpg',
        title: 'Science Exhibitions & Discovery',
        category: 'Science Exhibitions',
    },
    {
        id: 'life-sports',
        src: 'https://i.ibb.co/5XTrLbwh/basketball.jpg',
        title: 'District Basketball Champions (2024)',
        category: 'Sports & Athletics',
    },
    {
        id: 'life-ncc',
        src: 'https://i.ibb.co/rR7Bx14K/515246164-10162776949751928-1985770073446807228-n.jpg',
        title: 'NCC Cadets & Discipline',
        category: 'NCC Activities',
    },
    {
        id: 'life-culture',
        src: 'https://i.ibb.co/n8fnmNhH/72697182-2681155108602175-1363499533471842304-n.jpg',
        title: 'Youth Sports & Cultural Programs',
        category: 'Cultural Activities',
    },
    {
        id: 'life-hostel',
        src: 'https://i.ibb.co/XfxCBgmf/472918646-1015291717296871-2380144409877056095-n.jpg',
        title: 'Residential Hostel & Athletics',
        category: 'Hostel Life',
    },
];

interface RevealProps {
    children: React.ReactNode;
    className?: string;
}

const RevealSection: React.FC<RevealProps> = ({ children, className = '' }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') return true;
        return (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            !('IntersectionObserver' in window)
        );
    });

    useEffect(() => {
        if (visible || !ref.current) return;
        const observer = new IntersectionObserver(
            entries => {
                if (entries.some(e => e.isIntersecting)) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div ref={ref} className={`bms-reveal ${visible ? 'is-visible' : ''} ${className}`}>
            {children}
        </div>
    );
};

interface PublicHomePageProps {
    news: NewsItem[];
    user: User | null;
    staff?: Staff[];
    gradeDefinitions?: Record<Grade, GradeDefinition>;
}

const PublicHomePage: React.FC<PublicHomePageProps> = ({ news, user, staff = [] }) => {
    const [lifeTiles, setLifeTiles] = useState<PhotoTile[]>(FALLBACK_LIFE_TILES);
    const [lightboxPhoto, setLightboxPhoto] = useState<PhotoTile | null>(null);
    const [principalImgError, setPrincipalImgError] = useState(false);
    const [prospectusUrl, setProspectusUrl] = useState<string | null>(null);

    const latestPublishedNotice = useMemo(() => {
        const published = (news || []).filter(isPublishedNewsItem);
        if (published.length === 0) return null;
        return [...published].sort((a, b) => {
            const da = Date.parse(String(a.date || '')) || 0;
            const dbTime = Date.parse(String(b.date || '')) || 0;
            return dbTime - da;
        })[0];
    }, [news]);

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

        // Fetch optional uploaded prospectus PDF from Firestore
        db.collection('website_content')
            .doc('about_documents')
            .get()
            .then(doc => {
                if (!cancelled && doc.exists && Array.isArray(doc.data()?.items)) {
                    const items = doc.data()!.items as Array<{
                        category?: string;
                        title?: string;
                        url?: string;
                    }>;
                    const found = items.find(
                        item =>
                            item.url &&
                            (item.category === 'School Prospectus' ||
                                (item.title || '').toLowerCase().includes('prospectus'))
                    );
                    if (found?.url) setProspectusUrl(found.url);
                }
            })
            .catch(() => {});

        // Load dynamic gallery photos from Firestore folders with authentic fallbacks
        const loadGalleryTiles = async () => {
            try {
                const candidateDocs: Array<{ docId: string; category: string }> = [
                    { docId: 'gallery_by_category_classrooms', category: 'Classroom Learning' },
                    { docId: 'gallery_by_event_occasion_science_fair_science_exhibition', category: 'Science Exhibitions' },
                    { docId: 'gallery_by_event_occasion_sports_day', category: 'Sports & Athletics' },
                    { docId: 'gallery_by_category_activities', category: 'NCC Activities' },
                    { docId: 'gallery_by_event_occasion_cultural_programs', category: 'Cultural Activities' },
                    { docId: 'hostel_life_gallery', category: 'Hostel Life' },
                ];

                const fetchedByCategory: Record<string, PhotoTile> = {};
                await Promise.all(
                    candidateDocs.map(async entry => {
                        try {
                            const snap = await db.collection('website_content').doc(entry.docId).get();
                            if (snap.exists && Array.isArray(snap.data()?.items)) {
                                const firstImage = (snap.data()!.items as Array<{
                                    id?: string;
                                    title?: string;
                                    imageSrc?: string;
                                    type?: string;
                                }>).find(item => item.type !== 'video' && item.imageSrc);
                                if (firstImage?.imageSrc) {
                                    fetchedByCategory[entry.category] = {
                                        id: firstImage.id || entry.docId,
                                        src: firstImage.imageSrc,
                                        title: firstImage.title || entry.category,
                                        category: entry.category,
                                    };
                                }
                            }
                        } catch {
                            // Keep authentic fallback for this category
                        }
                    })
                );

                if (!cancelled && Object.keys(fetchedByCategory).length > 0) {
                    setLifeTiles(
                        FALLBACK_LIFE_TILES.map(fallback => fetchedByCategory[fallback.category] || fallback)
                    );
                }
            } catch {
                // Keep authentic fallback gallery tiles
            }
        };

        loadGalleryTiles();
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

    const handleDownloadProspectus = () => {
        if (prospectusUrl) {
            const link = document.createElement('a');
            link.href = prospectusUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.download = 'BMS_Champhai_Prospectus_2027.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const prospectusHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Bethel Mission School, Champhai - Admission Prospectus 2027</title>
<style>
  body { font-family: Arial, sans-serif; color: #142B49; max-width: 780px; margin: 32px auto; padding: 24px; line-height: 1.6; }
  .header { background: #142B49; color: #FFFFFF; padding: 24px; border-bottom: 4px solid #C5A46D; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; }
  .motto { color: #C5A46D; font-style: italic; margin: 6px 0 0; }
  h2 { color: #142B49; border-bottom: 2px solid #C5A46D; padding-bottom: 4px; margin-top: 24px; font-size: 18px; }
  ul { padding-left: 20px; }
  .box { background: #F8F6F0; border: 1px solid #C5A46D; padding: 14px; border-radius: 6px; margin-top: 12px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Bethel Mission School, Champhai</h1>
    <p>Nursery to Class X | English Medium | Est. 1996 | MBSE Affiliated</p>
    <p class="motto">"Service to God &amp; Men"</p>
  </div>
  <h2>Classes Offered</h2>
  <p>Nursery, Kindergarten, and Class I to Class X under the Mizoram Board of School Education (MBSE).</p>
  <h2>Documents Required</h2>
  <ul>
    <li>Birth Certificate (mandatory for Nursery &amp; Primary)</li>
    <li>Transfer Certificate &amp; Last Report Card (Class II onwards)</li>
    <li>Passport-Size Photographs (3 copies)</li>
    <li>Aadhaar Card Copy (Student &amp; Parent/Guardian)</li>
  </ul>
  <div class="box">
    <strong>Admissions Contact:</strong><br/>
    Bethel Veng, Champhai, Mizoram - 796321<br/>
    Phone / WhatsApp: +91 9862148342 | Email: bms@bms04.com
  </div>
</body>
</html>`;
        const blob = new Blob([prospectusHtml], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'BMS_Champhai_Prospectus_2027.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    };

    const scrollToIntro = () => {
        const el = document.getElementById('school-introduction');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const schoolHighlights = [
        { label: 'Established', value: '1996' },
        { label: 'Classes Offered', value: 'Nursery to Class X' },
        { label: 'Medium', value: 'English Medium' },
        { label: 'Residential Care', value: 'Hostel Available' },
        { label: 'Board Affiliation', value: 'MBSE Affiliated' },
    ];

    const whyChooseItems = [
        {
            title: 'Experienced Teachers',
            description: 'Dedicated MBSE mentors guiding students from Nursery to Class X.',
            icon: Award,
            photo: CAMPUS_PHOTO_LOCAL,
            photoAlt: 'Bethel Mission School campus and teaching community',
        },
        {
            title: 'Hostel & Discipline',
            description: 'Structured residential hostel with supervised study hours.',
            icon: ShieldCheck,
            photo: lifeTiles[5]?.src || CAMPUS_PHOTO_LOCAL,
            photoAlt: 'Residential hostel discipline and student life',
        },
        {
            title: 'Christian Values',
            description: 'Character formation rooted in the school’s motto, "Service to God & Men".',
            icon: BookOpen,
            photo: CAMPUS_PHOTO_LOCAL,
            photoAlt: 'Morning assembly and values at Bethel Mission School',
        },
        {
            title: 'Sports & Activities',
            description: 'NCC, science exhibitions, quizzes, Eco Club and athletics.',
            icon: Trophy,
            photo: 'https://i.ibb.co/5XTrLbwh/basketball.jpg',
            photoAlt: 'District basketball champions and student sports activities',
        },
    ];

    return (
        <div className="bg-white text-[#252A32] overflow-x-hidden">
            <HomeResultPopup user={user} />

            {/* Lightbox Modal for Campus Gallery */}
            {lightboxPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-[#142B49]/95 flex items-center justify-center p-4"
                    onClick={() => setLightboxPhoto(null)}
                >
                    <div
                        className="relative max-w-4xl w-full bg-[#142B49] border border-[#C5A46D]/60 rounded-lg overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxPhoto(null)}
                            aria-label="Close photo"
                            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-md bg-[#142B49]/90 text-white hover:text-[#C5A46D] text-2xl flex items-center justify-center border border-[#C5A46D]/50 cursor-pointer"
                        >
                            &times;
                        </button>
                        <img
                            src={lightboxPhoto.src}
                            alt={lightboxPhoto.title}
                            referrerPolicy="no-referrer"
                            className="w-full max-h-[76vh] object-contain bg-[#0E2038]"
                            onError={e => {
                                (e.currentTarget as HTMLImageElement).src = CAMPUS_PHOTO_LOCAL;
                            }}
                        />
                        <div className="p-4 sm:p-5 border-t border-[#C5A46D]/30 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#C5A46D]">
                                    {lightboxPhoto.category}
                                </p>
                                <p className="text-base font-bold text-white mt-0.5">{lightboxPhoto.title}</p>
                            </div>
                            <Link
                                to="/gallery"
                                className="text-xs font-bold text-[#F8F6F0] hover:text-[#C5A46D] transition-colors"
                            >
                                Open Full Gallery &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Slim Announcement Ribbon (only renders when live published news exists, preserving Hero above the fold) */}
            {latestPublishedNotice && (
                <div className="bg-[#142B49] text-[#F8F6F0] border-b border-[#C5A46D]/35">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-bold uppercase tracking-[0.14em] text-[#C5A46D] flex-shrink-0">
                                Notice
                            </span>
                            <span className="text-white/30 flex-shrink-0">|</span>
                            <Link
                                to={`/news/${latestPublishedNotice.id}`}
                                className="truncate font-medium text-[#F8F6F0] hover:text-[#C5A46D] transition-colors"
                            >
                                {latestPublishedNotice.date && (
                                    <span className="font-tabular text-[#C5A46D] mr-2">
                                        {formatDateForNews(String(latestPublishedNotice.date))}
                                    </span>
                                )}
                                {latestPublishedNotice.title}
                            </Link>
                        </div>
                        <Link
                            to="/news"
                            className="inline-flex items-center gap-1 font-bold text-[#C5A46D] hover:text-white whitespace-nowrap flex-shrink-0 transition-colors"
                        >
                            <span>All Notices</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* ── B. HERO SECTION ── */}
            <section
                aria-label="Bethel Mission School Hero"
                className="relative min-h-[78vh] sm:min-h-[84vh] flex items-center bg-[#142B49] text-white overflow-hidden"
            >
                <img
                    src={CAMPUS_PHOTO_LOCAL}
                    alt="Bethel Mission School campus in Bethel Veng, Champhai, Mizoram"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    fetchPriority="high"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-[#142B49]/95 via-[#142B49]/80 to-[#142B49]/50"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#142B49]/85 via-transparent to-[#142B49]/35"
                />

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 sm:py-28">
                    <div className="max-w-3xl animate-fade-in-up">
                        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#C5A46D]">
                            Nursery to Class X &nbsp;|&nbsp; English Medium &nbsp;|&nbsp; Established 1996
                        </p>

                        <h1 className="font-serif-editorial mt-5 text-3xl sm:text-5xl lg:text-[58px] font-bold text-white leading-[1.1] tracking-tight">
                            Building Knowledge. Shaping Character. Inspiring Futures.
                        </h1>

                        <div className="mt-6 h-[2px] w-20 bg-[#C5A46D]" />

                        <p className="mt-6 text-base sm:text-xl text-[#F8F6F0]/90 leading-relaxed max-w-2xl font-normal">
                            Welcome to Bethel Mission School, Champhai &mdash; nurturing confident, disciplined and compassionate learners through quality English-medium education.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                onClick={scrollToIntro}
                                className="inline-flex items-center justify-center gap-2 min-h-[50px] px-7 py-3 bg-[#C5A46D] hover:bg-[#D3B683] text-[#142B49] font-bold text-sm sm:text-base rounded-md transition-colors shadow-lg cursor-pointer"
                            >
                                <span>Explore Our School</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <Link
                                to="/admissions"
                                className="inline-flex items-center justify-center gap-2 min-h-[50px] px-7 py-3 bg-white/10 hover:bg-white text-white hover:text-[#142B49] font-bold text-sm sm:text-base rounded-md border border-[#F8F6F0]/60 transition-colors backdrop-blur-sm"
                            >
                                <span>Admissions 2027</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Subtle Scroll Indicator */}
                <button
                    type="button"
                    onClick={scrollToIntro}
                    aria-label="Scroll to School Introduction"
                    className="hidden sm:flex flex-col items-center gap-1.5 absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F8F6F0]/75 hover:text-[#C5A46D] transition-colors cursor-pointer"
                >
                    <span>Scroll</span>
                    <ChevronDown className="w-4 h-4 text-[#C5A46D]" />
                </button>
            </section>

            {/* ── C. SCHOOL INTRODUCTION ── */}
            <section
                id="school-introduction"
                className="py-20 sm:py-28 bg-[#F8F6F0] scroll-mt-20"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <RevealSection>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                            {/* Asymmetrical Framed Photography */}
                            <div className="lg:col-span-6 relative">
                                <div className="relative overflow-hidden rounded-md shadow-xl border border-[#142B49]/12 bg-[#142B49]">
                                    <img
                                        src={CAMPUS_PHOTO_LOCAL}
                                        alt="Students and teachers at Bethel Mission School, Bethel Veng, Champhai"
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full aspect-[4/3] object-cover hover:scale-[1.03] transition-transform duration-700"
                                    />
                                </div>
                                <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:right-6 bg-[#142B49] text-[#F8F6F0] px-6 py-4 rounded-md border-l-4 border-[#C5A46D] shadow-xl max-w-xs">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5A46D]">
                                        School Motto
                                    </p>
                                    <p className="font-serif-editorial text-lg sm:text-xl italic font-semibold text-white mt-0.5">
                                        &ldquo;Service to God &amp; Men&rdquo;
                                    </p>
                                </div>
                            </div>

                            {/* Editorial Copy */}
                            <div className="lg:col-span-6 lg:pl-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6D3B]">
                                    Bethel Veng, Champhai &middot; Mizoram
                                </p>
                                <h2 className="font-serif-editorial mt-3 text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#142B49] leading-[1.18]">
                                    More Than Education. A Foundation for Life.
                                </h2>
                                <div className="mt-5 h-[2px] w-16 bg-[#C5A46D]" />

                                <div className="mt-6 space-y-4 text-base text-[#252A32]/85 leading-relaxed">
                                    <p>
                                        Established in 1996 in Bethel Veng, Champhai, Bethel Mission School has dedicated nearly three decades to shaping young minds through disciplined, value-anchored English-medium education from Nursery to Class X.
                                    </p>
                                    <p>
                                        Guided by our enduring motto, <strong className="text-[#142B49] font-semibold">&ldquo;Service to God &amp; Men&rdquo;</strong>, we blend rigorous Mizoram Board of School Education (MBSE) academics with Christian character formation, structured hostel care, and vibrant co-curricular life.
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[#142B49]/12 flex flex-wrap items-center gap-6">
                                    <Link
                                        to="/about"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-[#142B49] hover:text-[#8C6D3B] transition-colors"
                                    >
                                        <span>Read About Our Heritage</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to="/academics"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-[#142B49]/75 hover:text-[#142B49] transition-colors"
                                    >
                                        <span>Explore Academics</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── D. SCHOOL HIGHLIGHTS (VERIFIED INSTITUTIONAL FACTS ONLY) ── */}
            <section
                aria-label="School Highlights"
                className="bg-white border-y border-[#142B49]/12 py-12 sm:py-16"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <RevealSection>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 lg:divide-x divide-[#142B49]/12">
                            {schoolHighlights.map(item => (
                                <div
                                    key={item.label}
                                    className="py-4 sm:py-3 lg:px-6 first:lg:pl-0 last:lg:pr-0 text-center lg:text-left"
                                >
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8C6D3B]">
                                        {item.label}
                                    </p>
                                    <p className="font-serif-editorial mt-1.5 text-xl sm:text-2xl font-bold text-[#142B49]">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── E. WHY CHOOSE BETHEL MISSION SCHOOL? ── */}
            <section className="py-20 sm:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <RevealSection>
                        <div className="max-w-2xl mb-12 sm:mb-14">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6D3B]">
                                Core Educational Pillars
                            </p>
                            <h2 className="font-serif-editorial mt-2.5 text-3xl sm:text-4xl font-bold text-[#142B49] leading-tight">
                                Why Choose Bethel Mission School?
                            </h2>
                            <div className="mt-4 h-[2px] w-16 bg-[#C5A46D]" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
                            {whyChooseItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <article
                                        key={item.title}
                                        className="group bg-[#F8F6F0] rounded-md border border-[#142B49]/12 border-t-2 border-t-[#C5A46D] overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
                                    >
                                        <div className="aspect-[16/10] w-full overflow-hidden bg-[#142B49]">
                                            <img
                                                src={item.photo}
                                                alt={item.photoAlt}
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                                onError={e => {
                                                    (e.currentTarget as HTMLImageElement).src =
                                                        CAMPUS_PHOTO_LOCAL;
                                                }}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <Icon className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                                                <span className="h-px flex-1 bg-[#142B49]/12" />
                                            </div>
                                            <h3 className="font-serif-editorial text-xl font-bold text-[#142B49]">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2.5 text-sm text-[#252A32]/80 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── F. ACADEMIC ACHIEVEMENTS — EXCELLENCE THAT INSPIRES ── */}
            <section
                aria-labelledby="achievements-heading"
                className="py-20 sm:py-28 bg-[#142B49] text-[#F8F6F0]"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <RevealSection>
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A46D]">
                                    Proven Legacy of Distinction
                                </p>
                                <h2
                                    id="achievements-heading"
                                    className="font-serif-editorial mt-2.5 text-3xl sm:text-5xl font-bold text-white leading-tight"
                                >
                                    Excellence That Inspires
                                </h2>
                                <div className="mt-4 h-[2px] w-20 bg-[#C5A46D]" />
                                <p className="mt-4 text-sm sm:text-base text-[#F8F6F0]/80 leading-relaxed">
                                    Honouring our MBSE HSLC Top-Ten State Merit Rankers alongside national and state winners across INSPIRE MANAK, National Children&apos;s Science Congress, State Maths Competition, and SLSMEE.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 flex-shrink-0">
                                <Link
                                    to="/achievements/academic"
                                    className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 bg-[#C5A46D] hover:bg-[#D3B683] text-[#142B49] font-bold text-sm rounded-md transition-colors whitespace-nowrap"
                                >
                                    <span>View MBSE HSLC Records</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/achievements"
                                    className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 bg-transparent hover:bg-white/10 text-[#F8F6F0] font-bold text-sm rounded-md border border-[#C5A46D]/60 transition-colors whitespace-nowrap"
                                >
                                    <span>All Achievements</span>
                                </Link>
                            </div>
                        </div>

                        {/* Part 1: Prominent MBSE HSLC Top-Ten Rank Holders Portrait Gallery */}
                        <div className="mb-14">
                            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15 mb-6">
                                <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-white">
                                    MBSE HSLC Top-Ten State Rank Holders
                                </h3>
                                <Link
                                    to="/achievements/academic"
                                    className="text-xs font-bold uppercase tracking-wider text-[#C5A46D] hover:text-white transition-colors whitespace-nowrap"
                                >
                                    Distinction Holders &rarr;
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                                {RANK_HOLDERS.map(ranker => (
                                    <figure
                                        key={ranker.name}
                                        className="group bg-[#0E2038] border border-[#C5A46D]/35 hover:border-[#C5A46D] rounded-md overflow-hidden transition-all"
                                    >
                                        <div className="aspect-[4/5] w-full overflow-hidden bg-[#0A182B]">
                                            <img
                                                src={ranker.imgSrc}
                                                alt={`${ranker.name} — ${ranker.rank} (${ranker.year})`}
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                                onError={e => {
                                                    (e.currentTarget as HTMLImageElement).src =
                                                        ranker.fallbackSrc;
                                                }}
                                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <figcaption className="p-4 sm:p-5 border-t border-[#C5A46D]/30">
                                            <p className="font-tabular text-xs font-bold uppercase tracking-wider text-[#C5A46D]">
                                                {ranker.year} &middot; {ranker.rank}
                                            </p>
                                            <p className="font-serif-editorial mt-1 text-base sm:text-lg font-bold text-white leading-snug">
                                                {ranker.name}
                                            </p>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        </div>

                        {/* Part 2: Verified Science, Innovation & Mathematics Recognition */}
                        <div>
                            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15 mb-6">
                                <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-white">
                                    State &amp; National Science and Mathematics Honours
                                </h3>
                                <Link
                                    to="/achievements/science"
                                    className="text-xs font-bold uppercase tracking-wider text-[#C5A46D] hover:text-white transition-colors whitespace-nowrap"
                                >
                                    Explore STEM Records &rarr;
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                                {FEATURED_HONOURS.map(honour => (
                                    <Link
                                        key={honour.title}
                                        to={honour.link}
                                        className="group bg-[#F8F6F0] text-[#252A32] rounded-md overflow-hidden border border-[#C5A46D]/40 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-md"
                                    >
                                        <div>
                                            <div className="aspect-[16/10] w-full overflow-hidden bg-[#0E2038]">
                                                <img
                                                    src={honour.imageSrc}
                                                    alt={honour.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    referrerPolicy="no-referrer"
                                                    onError={e => {
                                                        (e.currentTarget as HTMLImageElement).src =
                                                            CAMPUS_PHOTO_LOCAL;
                                                    }}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-5">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D3B]">
                                                    {honour.subtitle}
                                                </p>
                                                <h4 className="font-serif-editorial mt-1.5 text-lg font-bold text-[#142B49] group-hover:text-[#8C6D3B] transition-colors leading-snug">
                                                    {honour.title}
                                                </h4>
                                                <p className="mt-2 text-xs sm:text-sm text-[#252A32]/80 leading-relaxed">
                                                    {honour.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-5 pb-4 pt-2 flex items-center gap-1.5 text-xs font-bold text-[#142B49]">
                                            <span>View Program History</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#8C6D3B]" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── G. LIFE AT BETHEL (EDITORIAL ASYMMETRICAL GALLERY) ── */}
            <section className="py-20 sm:py-28 bg-[#F8F6F0]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <RevealSection>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6D3B]">
                                    Campus &amp; Co-Curricular Spirit
                                </p>
                                <h2 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-bold text-[#142B49]">
                                    Life at Bethel
                                </h2>
                                <div className="mt-4 h-[2px] w-16 bg-[#C5A46D]" />
                                <p className="mt-3 text-sm sm:text-base text-[#252A32]/80">
                                    Moments across classrooms, science exhibitions, NCC, sports arenas, cultural celebrations, and residential hostel life.
                                </p>
                            </div>

                            <Link
                                to="/gallery"
                                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#142B49] text-[#142B49] hover:text-white font-bold text-sm rounded-md border border-[#142B49]/30 transition-colors whitespace-nowrap self-start sm:self-auto"
                            >
                                <span>View All Gallery</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Editorial Asymmetrical Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
                            {lifeTiles.map((tile, index) => {
                                const gridPlacement =
                                    index === 0
                                        ? 'lg:col-span-6 lg:row-span-2 aspect-[4/3] lg:aspect-auto lg:min-h-[420px]'
                                        : index === 1 || index === 2
                                        ? 'lg:col-span-3 aspect-[4/3] lg:min-h-[200px]'
                                        : index === 3
                                        ? 'lg:col-span-3 aspect-[4/3] lg:min-h-[200px]'
                                        : index === 4
                                        ? 'lg:col-span-3 aspect-[4/3] lg:min-h-[200px]'
                                        : 'lg:col-span-6 aspect-[16/9] lg:aspect-[16/7]';

                                return (
                                    <button
                                        key={tile.id}
                                        type="button"
                                        onClick={() => setLightboxPhoto(tile)}
                                        className={`group relative overflow-hidden rounded-md border border-[#142B49]/15 bg-[#142B49] text-left cursor-pointer ${gridPlacement}`}
                                    >
                                        <img
                                            src={tile.src}
                                            alt={tile.title}
                                            loading="lazy"
                                            decoding="async"
                                            referrerPolicy="no-referrer"
                                            onError={e => {
                                                (e.currentTarget as HTMLImageElement).src =
                                                    CAMPUS_PHOTO_LOCAL;
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-0 bg-gradient-to-t from-[#142B49]/90 via-[#142B49]/20 to-transparent"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C5A46D]">
                                                {tile.category}
                                            </p>
                                            <p className="mt-0.5 text-sm sm:text-base font-bold text-white leading-snug">
                                                {tile.title}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── H. ADMISSIONS 2027 BANNER ── */}
            <section
                aria-labelledby="admissions-banner-heading"
                className="py-16 sm:py-24 bg-[#142B49] text-white border-y border-[#C5A46D]/60"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <RevealSection>
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C5A46D]">
                                Academic Session 2027
                            </p>
                            <h2
                                id="admissions-banner-heading"
                                className="font-serif-editorial mt-3 text-3xl sm:text-5xl font-bold text-white leading-tight"
                            >
                                Your Child&apos;s Journey Begins Here.
                            </h2>
                            <p className="mt-4 text-base sm:text-xl text-[#F8F6F0]/90">
                                Admissions Open for Nursery to Class X &ndash; Academic Session 2027.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-[#F8F6F0]/85">
                                {['English Medium', 'Hostel Available', 'Online Enquiries'].map(item => (
                                    <span key={item} className="inline-flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#C5A46D]" />
                                        <span>{item}</span>
                                    </span>
                                ))}
                            </div>

                            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
                                <Link
                                    to="/admissions"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[50px] px-7 py-3.5 bg-[#C5A46D] hover:bg-[#D3B683] text-[#142B49] font-extrabold text-sm sm:text-base rounded-md transition-colors shadow-lg whitespace-nowrap"
                                >
                                    <span>Apply for Admission 2027</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleDownloadProspectus}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3.5 bg-white hover:bg-[#F8F6F0] text-[#142B49] font-bold text-sm sm:text-base rounded-md transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Prospectus</span>
                                </button>

                                <a
                                    href={WHATSAPP_ADMISSION_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-bold text-sm sm:text-base rounded-md border border-[#C5A46D]/70 transition-colors whitespace-nowrap"
                                >
                                    <WhatsappIcon className="w-4 h-4 text-[#C5A46D]" />
                                    <span>Contact via WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── I. PRINCIPAL'S MESSAGE ── */}
            <section className="py-20 sm:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <RevealSection>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
                            {/* Principal Portrait */}
                            <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-start">
                                <div className="w-64 sm:w-72 md:w-full max-w-xs bg-[#F8F6F0] border border-[#142B49]/15 border-b-4 border-b-[#C5A46D] rounded-md overflow-hidden shadow-md">
                                    {principalMember?.photographUrl && !principalImgError ? (
                                        <img
                                            src={principalMember.photographUrl}
                                            alt="K. Malsawmdawngi, Principal of Bethel Mission School"
                                            loading="lazy"
                                            decoding="async"
                                            onError={() => setPrincipalImgError(true)}
                                            className="w-full aspect-[4/5] object-cover object-top"
                                        />
                                    ) : !principalImgError ? (
                                        <div className="w-full aspect-[4/5] bg-[#142B49] flex flex-col items-center justify-center p-8 text-center">
                                            <img
                                                src={CREST_LOGO_LOCAL}
                                                alt="Principal, Bethel Mission School"
                                                loading="lazy"
                                                decoding="async"
                                                onError={() => setPrincipalImgError(true)}
                                                className="w-28 h-28 object-contain"
                                            />
                                            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#C5A46D] font-bold">
                                                Office of the Principal
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-[4/5] bg-[#142B49] flex items-center justify-center">
                                            <UserIcon className="w-16 h-16 text-[#C5A46D]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Principal Editorial Message */}
                            <div className="md:col-span-7 lg:col-span-8">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6D3B]">
                                    School Leadership
                                </p>
                                <h2 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-bold text-[#142B49]">
                                    Principal&apos;s Message
                                </h2>
                                <div className="mt-4 h-[2px] w-16 bg-[#C5A46D]" />

                                <blockquote className="mt-6 space-y-4 text-base sm:text-lg text-[#252A32]/85 leading-relaxed">
                                    <p>
                                        Since 1996, Bethel Mission School has nurtured young minds in Champhai with strong discipline, academic curiosity, and faith-anchored learning.
                                    </p>
                                    <p>
                                        Our dedicated teachers partner closely with parents so every child grows in wisdom, moral character, and readiness for board examinations and life beyond school.
                                    </p>
                                    <p>
                                        Guided by our motto, &ldquo;Service to God &amp; Men,&rdquo; we welcome your family into a warm, focused, and supportive school community.
                                    </p>
                                </blockquote>

                                <div className="mt-7 pt-5 border-t border-[#142B49]/12">
                                    <p className="font-serif-editorial text-xl font-bold text-[#142B49]">
                                        K. Malsawmdawngi
                                    </p>
                                    <p className="text-sm font-semibold text-[#8C6D3B] mt-0.5">
                                        Principal, Bethel Mission School, Champhai
                                    </p>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── J. FINAL CALL TO ACTION ── */}
            <section className="py-16 sm:py-20 bg-[#F8F6F0] border-t border-[#142B49]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <RevealSection>
                        <div className="bg-white rounded-md border border-[#142B49]/12 border-t-2 border-t-[#C5A46D] p-8 sm:p-12 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="max-w-xl">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8C6D3B]">
                                    Plan a Campus Visit
                                </p>
                                <h2 className="font-serif-editorial mt-2 text-2xl sm:text-3xl font-bold text-[#142B49]">
                                    Experience Bethel Mission School in Person
                                </h2>
                                <p className="mt-3 text-sm sm:text-base text-[#252A32]/80 leading-relaxed">
                                    Meet our school administration at Bethel Veng, Champhai, tour the campus and residential hostel, or speak directly with our admissions desk.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3.5 flex-shrink-0">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[#142B49] hover:bg-[#1C3B63] text-white font-bold text-sm rounded-md transition-colors whitespace-nowrap"
                                >
                                    <Phone className="w-4 h-4 text-[#C5A46D]" />
                                    <span>Contact Administration</span>
                                </Link>
                                <Link
                                    to="/admissions"
                                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[#F8F6F0] hover:bg-[#EFECE2] text-[#142B49] font-bold text-sm rounded-md border border-[#C5A46D] transition-colors whitespace-nowrap"
                                >
                                    <span>Admissions Guide</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>
        </div>
    );
};

export default PublicHomePage;
