import React, { useMemo, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Download, Award, ShieldCheck, BookOpen, Trophy, ArrowRight, Calendar, Atom, Calculator, Sparkles } from 'lucide-react';
import { db } from '@/firebaseConfig';
import { WhatsappIcon, UserIcon } from '@/components/Icons';
import { NewsItem, User, Staff, Grade, GradeDefinition } from '@/types';
import { formatDateForNews, stripHtml } from '@/utils';
import HomeResultPopup from '@/components/HomeResultPopup';

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
    const [prospectusUrl, setProspectusUrl] = useState<string | null>(null);
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(FALLBACK_GALLERY_PHOTOS);
    const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
    const [principalImgError, setPrincipalImgError] = useState(false);

    const latestNews = useMemo(
        () => [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
        [news]
    );

    const principalMember = useMemo(() => {
        return (staff || []).find(
            s =>
                s &&
                (s.designation?.toLowerCase().includes('principal') ||
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes('malsawmdawngi'))
        );
    }, [staff]);

    useEffect(() => {
        db.collection('website_content')
            .doc('about_documents')
            .get()
            .then(doc => {
                if (doc.exists && Array.isArray(doc.data()?.items)) {
                    const items = doc.data()!.items as Array<{ category?: string; title?: string; url?: string }>;
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
    }, []);

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
<title>Bethel Mission School, Champhai - Prospectus 2027</title>
<style>
  body { font-family: Arial, sans-serif; color: #0B1F3A; max-width: 780px; margin: 32px auto; padding: 24px; line-height: 1.6; }
  .header { background: #0B1F3A; color: #FFFFFF; padding: 24px; border-bottom: 4px solid #C9A84C; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; }
  .motto { color: #DFC06B; font-style: italic; margin: 6px 0 0; }
  h2 { color: #0B1F3A; border-bottom: 2px solid #C9A84C; padding-bottom: 4px; margin-top: 24px; font-size: 18px; }
  ul { padding-left: 20px; }
  .box { background: #F4F7FB; border: 1px solid #C9A84C; padding: 14px; border-radius: 6px; margin-top: 12px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Bethel Mission School, Champhai</h1>
    <p>Nursery to Class X | English Medium | Est. 1996 | MBSE Affiliated</p>
    <p class="motto">"Service to God &amp; Men"</p>
  </div>
  <h2>About Our School</h2>
  <p>Established in 1996 in Bethel Veng, Champhai, Mizoram, Bethel Mission School is an MBSE-affiliated co-educational English medium school committed to academic excellence, discipline, and Christian character formation.</p>
  <h2>Academic Programs</h2>
  <ul>
    <li><strong>Pre-Primary:</strong> Nursery &amp; Kindergarten</li>
    <li><strong>Primary:</strong> Class I to Class V</li>
    <li><strong>Middle School:</strong> Class VI to Class VIII</li>
    <li><strong>High School:</strong> Class IX &amp; Class X (MBSE HSLC)</li>
  </ul>
  <h2>Campus &amp; Facilities</h2>
  <ul>
    <li>29 Years of Educational Service in Champhai</li>
    <li>Residential Hostel Facility Available</li>
    <li>Spacious Classrooms, Science Labs, Library &amp; Sports Courts</li>
  </ul>
  <h2>Documents Required for Admission</h2>
  <ul>
    <li>Birth Certificate (mandatory for Nursery &amp; Primary)</li>
    <li>Transfer Certificate &amp; Last Report Card (Class II onwards)</li>
    <li>3 Passport-Size Photographs &amp; Aadhaar Copy (Student &amp; Parent)</li>
  </ul>
  <div class="box">
    <strong>Admissions &amp; Office Contact:</strong><br/>
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

            {/* ── 1. HERO — Compressed Campus Photo + High-Contrast Dark Blue Overlay ── */}
            <section className="relative w-full overflow-hidden bg-[#07162B] min-h-[500px] sm:min-h-[560px] flex items-center">
                <div className="absolute inset-0">
                    <picture className="block w-full h-full">
                        <source srcSet="/assets/school/campus.webp" type="image/webp" />
                        <img
                            src={CAMPUS_PHOTO_LOCAL}
                            alt="Bethel Mission School Campus, Champhai, Mizoram"
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-cover object-center"
                        />
                    </picture>
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(180deg, rgba(7,22,43,0.84) 0%, rgba(11,31,58,0.74) 50%, rgba(7,22,43,0.92) 100%)',
                        }}
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-4">
                            <img
                                src="/assets/school/bms-logo-color.png"
                                alt="Bethel Mission School Crest"
                                className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg"
                            />
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight drop-shadow-sm">
                            Bethel Mission School, Champhai
                        </h1>

                        <p className="mt-3 text-sm sm:text-lg font-bold text-[#DFC06B] tracking-wide">
                            Nursery to Class X | English Medium | Est. 1996
                        </p>

                        <div className="w-20 h-1 bg-[#C9A84C] mx-auto my-4 rounded-full" />

                        <p className="text-lg sm:text-2xl text-white font-semibold italic">
                            &ldquo;Service to God &amp; Men&rdquo;
                        </p>

                        {/* 2 CTAs: Stacked Full-Width on Mobile, Side-by-Side on Desktop */}
                        <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto sm:justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
                            <Link
                                to="/admissions/online"
                                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[50px] px-7 py-3.5 bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold rounded-lg transition-colors shadow-lg text-sm sm:text-base"
                            >
                                Apply for Admission 2027
                            </Link>
                            <button
                                type="button"
                                onClick={handleDownloadProspectus}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[50px] px-7 py-3.5 bg-white hover:bg-[#F4F7FB] text-[#0B1F3A] font-bold rounded-lg transition-colors shadow-lg text-sm sm:text-base cursor-pointer"
                            >
                                <Download className="w-4 h-4 flex-shrink-0" />
                                <span>Download Prospectus</span>
                            </button>
                        </div>

                        {/* 3 Key Highlights */}
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-white">
                            <span className="inline-flex items-center px-3.5 py-2 rounded-md bg-[#07162B]/85 border border-[#C9A84C]/60 font-tabular">
                                29 Years in Champhai
                            </span>
                            <span className="hidden sm:inline text-[#C9A84C]" aria-hidden="true">|</span>
                            <span className="inline-flex items-center px-3.5 py-2 rounded-md bg-[#07162B]/85 border border-[#C9A84C]/60">
                                Hostel Available
                            </span>
                            <span className="hidden sm:inline text-[#C9A84C]" aria-hidden="true">|</span>
                            <span className="inline-flex items-center px-3.5 py-2 rounded-md bg-[#07162B]/85 border border-[#C9A84C]/60 font-bold text-[#DFC06B]">
                                MBSE
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. LATEST NEWS — Moved to Top (Latest 3 with Date) ── */}
            <section className="py-14 sm:py-20 bg-[#F4F7FB] border-b border-[#0B1F3A]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Announcements
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                            Latest News
                        </h2>
                        <div className="gold-rule mt-4" />
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestNews.length > 0 ? (
                            latestNews.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white p-6 rounded-xl border border-[#0B1F3A]/15 hover:border-[#C9A84C] shadow-sm transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E6D1B] uppercase tracking-wider font-tabular">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formatDateForNews(item.date)}</span>
                                        </div>
                                        <h3 className="mt-2.5 text-lg font-extrabold text-[#0B1F3A] leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2.5 text-[#0B1F3A]/75 text-sm leading-relaxed">
                                            {stripHtml(item.content).substring(0, 120)}
                                            {stripHtml(item.content).length > 120 ? '...' : ''}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/news/${item.id}`}
                                        className="mt-5 inline-flex items-center gap-1.5 min-h-[40px] font-bold text-[#0B1F3A] hover:text-[#8E6D1B] text-sm self-start transition-colors"
                                    >
                                        <span>Read Notice</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="md:col-span-3 text-center py-12 border border-dashed border-[#0B1F3A]/25 rounded-xl bg-white">
                                <p className="text-[#0B1F3A]/75 text-sm sm:text-base font-medium">
                                    No news notices posted yet. Check back soon.
                                </p>
                            </div>
                        )}
                    </div>

                    {news.length > 3 && (
                        <div className="text-center mt-10">
                            <Link
                                to="/news"
                                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 bg-[#0B1F3A] hover:bg-[#132D52] text-white font-bold rounded-lg transition-colors text-sm"
                            >
                                <span>View All News</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── 3. WHY BETHEL MISSION SCHOOL — 4 Clean Boxes with Icons & Short Text ── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Trusted Since 1996
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                            Why Bethel Mission School
                        </h2>
                        <div className="gold-rule mt-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {whyBethelItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="bg-[#F4F7FB] rounded-xl border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-7 flex flex-col items-start shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-[#0B1F3A] text-[#DFC06B] flex items-center justify-center mb-5 flex-shrink-0">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-[#0B1F3A]">{item.title}</h3>
                                    <p className="mt-2.5 text-sm text-[#0B1F3A]/75 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 2B. SCIENCE & MATHS ACHIEVEMENTS ── */}
            <section className="py-16 sm:py-24 bg-[#F4F7FB] border-t border-[#0B1F3A]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            STEM &amp; Olympiad Honours
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                            Science &amp; Maths Achievements
                        </h2>
                        <div className="gold-rule mt-4 mb-4" />
                        <p className="text-sm sm:text-base text-[#0B1F3A]/75">
                            Consistent state and national recognition across Science Congresses, INSPIRE MANAK, and Mizoram Mathematics Society competitions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                title: 'INSPIRE Award MANAK',
                                highlight: 'National Exhibition, New Delhi',
                                detail: 'State 1st & 2nd Prize winners (2012, 2015, 2021, 2024) representing Mizoram nationally.',
                                link: '/achievements/science/inspire-award',
                                icon: Sparkles,
                            },
                            {
                                title: "National Children's Science Congress",
                                highlight: 'National Level Selection',
                                detail: 'District 1st Prize & State winners presenting in Bengaluru, Chandigarh, Pune, and Bhubaneswar.',
                                link: '/achievements/science/ncsc',
                                icon: Atom,
                            },
                            {
                                title: 'State Mathematics Competition',
                                highlight: '1st Prize Winners (2022 & 2023)',
                                detail: 'Paumuansanga (2023) and Esther Tingbiakmuani (2022) won 1st Prize in the MMS State Contest.',
                                link: '/achievements/science/mathematics-competition',
                                icon: Calculator,
                            },
                            {
                                title: 'SLSMEE & Incentive Awards',
                                highlight: 'Board Science & Maths Honours',
                                detail: 'Recognised in State Level Science & Maths Exhibitions plus annual Incentive Awards since 2007.',
                                link: '/achievements/science',
                                icon: Award,
                            },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.title}
                                    to={item.link}
                                    className="group bg-white rounded-xl border border-[#0B1F3A]/15 hover:border-[#C9A84C] p-6 flex flex-col justify-between shadow-sm transition-all"
                                >
                                    <div>
                                        <div className="w-11 h-11 rounded-lg bg-[#0B1F3A] text-[#DFC06B] flex items-center justify-center mb-4">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-[#8E6D1B] uppercase tracking-wide font-tabular">
                                            {item.highlight}
                                        </p>
                                        <h3 className="mt-1.5 text-lg font-extrabold text-[#0B1F3A] group-hover:text-[#8E6D1B] transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2.5 text-sm text-[#0B1F3A]/75 leading-relaxed">
                                            {item.detail}
                                        </p>
                                    </div>
                                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] group-hover:text-[#8E6D1B] transition-colors">
                                        <span>Explore Details</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            to="/achievements/science"
                            className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 bg-[#0B1F3A] hover:bg-[#132D52] text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            <span>View All Science &amp; Maths Achievements</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
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
