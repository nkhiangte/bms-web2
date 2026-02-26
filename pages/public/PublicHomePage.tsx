import React, { useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, UsersIcon, BuildingOfficeIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/Icons';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string; }> = ({ icon, title, description, link }) => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2 border border-white/50">
        <div className="text-sky-500 mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
        <Link to={link} className="mt-4 inline-block font-semibold text-sky-600 hover:text-sky-800">
            Learn More &rarr;
        </Link>
    </div>
);

interface PublicHomePageProps {
    news: NewsItem[];
    user: User | null;
}

const PublicHomePage: React.FC<PublicHomePageProps> = ({ news, user }) => {
    const latestNews = useMemo(() => {
        return [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
    }, [news]);

    // Set fixed background on body when this page mounts, remove on unmount
    useEffect(() => {
        const prev = document.body.style.cssText;
        document.body.style.backgroundImage = "url('https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg')";
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        return () => {
            // Restore original body styles on page leave
            document.body.style.backgroundImage = '';
            document.body.style.backgroundAttachment = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundRepeat = '';
        };
    }, []);

    return (
        <>
            {/* Admission Banner — fixed at bottom */}
            <Link
                to="/admissions/online"
                className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-500 to-sky-700 text-white p-4 text-center shadow-lg animate-pulse hover:animate-none hover:from-sky-400 hover:to-sky-600 transition-all duration-300"
            >
                <span className="font-bold text-xl tracking-wider uppercase">
                    ADMISSION OPEN, Click Here
                </span>
            </Link>

            {/* ── HERO SECTION ── Full viewport, text centered over background */}
            <section
                className="relative w-full flex items-center justify-center"
                style={{ height: 'calc(100vh - 128px)' }}
            >
                {/* Dark overlay only on hero */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

                {/* Centered welcome text */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-8 md:p-12 rounded-2xl shadow-2xl">
                        <h1
                            className="text-5xl md:text-7xl font-extrabold leading-tight text-white tracking-tight"
                            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
                        >
                            <EditableContent
                                id="home_hero_title"
                                defaultContent="Welcome to Bethel Mission School"
                                type="text"
                                user={user}
                            />
                        </h1>
                        <div className="w-24 h-1 bg-sky-400 mx-auto my-6 rounded-full"></div>
                        <p
                            className="text-xl md:text-3xl text-white font-medium tracking-wide"
                            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
                        >
                            <EditableContent
                                id="home_hero_subtitle"
                                defaultContent="Service to God & Men"
                                type="text"
                                user={user}
                            />
                        </p>
                    </div>
                </div>

                {/* Scroll-down arrow */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ── LATEST NEWS ── Semi-transparent so background shows through */}
            <section className="py-20 bg-slate-900/70 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Latest News &amp; Announcements</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-300">
                            Stay updated with the latest happenings at Bethel Mission School.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {latestNews.length > 0 ? (
                            latestNews.map(item => (
                                <div key={item.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2 overflow-hidden flex flex-col">
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                        <img src={item.imageUrls[0]} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                                    )}
                                    <div className="flex flex-col flex-grow">
                                        <p className="text-sm font-semibold text-sky-700">{formatDateForNews(item.date)}</p>
                                        <h3 className="mt-2 text-xl font-bold text-slate-800">{item.title}</h3>
                                        <p className="mt-3 text-slate-600 whitespace-pre-wrap flex-grow">
                                            {item.content.substring(0, 150)}{item.content.length > 150 ? '...' : ''}
                                        </p>
                                        <Link to="/news" className="mt-4 font-semibold text-sky-600 hover:text-sky-800 self-start">
                                            Read More &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="md:col-span-2 text-center py-16 border-2 border-dashed border-white/20 rounded-lg bg-white/10">
                                <p className="text-white text-lg font-semibold">No news articles found.</p>
                                <p className="text-slate-300 mt-2">Please check back later for updates.</p>
                            </div>
                        )}
                    </div>
                    {news.length > 2 && (
                        <div className="text-center mt-12">
                            <Link to="/news" className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors">
                                View All News
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="py-20 bg-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
                        <EditableContent
                            id="home_choose_title"
                            defaultContent="Why Choose Us?"
                            type="text"
                            user={user}
                        />
                    </h2>
                    <div className="mt-4 max-w-3xl mx-auto text-slate-200">
                        <EditableContent
                            id="home_choose_desc"
                            defaultContent="At Bethel Mission School, we are dedicated to providing a nurturing yet challenging educational environment that fosters academic excellence, strong moral character, and a lifelong passion for learning."
                            type="textarea"
                            user={user}
                        />
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <FeatureCard
                            icon={<AcademicCapIcon className="w-12 h-12" />}
                            title="Academic Excellence"
                            description="A comprehensive curriculum that challenges students and promotes critical thinking, preparing them for future success."
                            link="/academics"
                        />
                        <FeatureCard
                            icon={<UsersIcon className="w-12 h-12" />}
                            title="Holistic Development"
                            description="Emphasis on extracurricular activities, sports, and arts to ensure the all-round development of every child."
                            link="/student-life"
                        />
                        <FeatureCard
                            icon={<BuildingOfficeIcon className="w-12 h-12" />}
                            title="Modern Facilities"
                            description="State-of-the-art classrooms, labs, and library to provide a conducive environment for learning and growth."
                            link="/facilities"
                        />
                    </div>
                </div>
            </section>

            {/* ── CONNECT WITH US ── */}
            <section className="py-20 bg-slate-900/70 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Connect With Us</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-300">
                            Follow us on social media to stay updated with our latest news, events, and student achievements.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">

                        {/* Social links — white card */}
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Find Us On</h3>
                            <div className="flex flex-col gap-5">
                                <a href="https://www.facebook.com/bethel.ms" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-slate-600 hover:text-blue-600 transition-transform transform hover:scale-105">
                                    <FacebookIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <span className="text-base font-bold text-slate-800">Facebook</span>
                                        <p className="text-sm text-slate-500">@bethel.ms</p>
                                    </div>
                                </a>
                                <a href="https://www.instagram.com/bms_champhai/" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-slate-600 hover:text-rose-600 transition-transform transform hover:scale-105">
                                    <InstagramIcon className="w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <span className="text-base font-bold text-slate-800">Instagram</span>
                                        <p className="text-sm text-slate-500">@bms_champhai</p>
                                    </div>
                                </a>
                                <a href="https://www.youtube.com/@BethelMissionSchoolChamphai" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-slate-600 hover:text-red-600 transition-transform transform hover:scale-105">
                                    <YouTubeIcon className="w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <span className="text-base font-bold text-slate-800">YouTube</span>
                                        <p className="text-sm text-slate-500">@BethelMissionSchoolChamphai</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Facebook Plugin — white card */}
                        <div className="bg-white p-4 rounded-xl shadow-lg flex justify-center overflow-hidden">
                            <div className="fb-page"
                                data-href="https://www.facebook.com/bethel.ms"
                                data-tabs="timeline"
                                data-width="320"
                                data-height="400"
                                data-small-header="true"
                                data-adapt-container-width="true"
                                data-hide-cover="false"
                                data-show-facepile="false">
                                <blockquote cite="https://www.facebook.com/bethel.ms" className="fb-xfbml-parse-ignore">
                                    <a href="https://www.facebook.com/bethel.ms">Bethel Mission School, Champhai</a>
                                </blockquote>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default PublicHomePage;
