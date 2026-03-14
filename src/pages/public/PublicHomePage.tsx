import React, { useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, UsersIcon, BuildingOfficeIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/Icons';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string }> = ({ icon, title, description, link }) => (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100">
        <div className="text-sky-600 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">{description}</p>
        <Link to={link} className="mt-4 inline-block font-semibold text-sky-600 hover:text-sky-800 text-sm">
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

    // Clear any leftover body background from previous versions
    useEffect(() => {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundAttachment = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundColor = '#f8fafc';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <>
            {/* Admission Banner — fixed at bottom */}
            <Link
                to="/admissions/online"
                className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-600 to-sky-800 text-white p-3 text-center shadow-lg hover:from-sky-500 hover:to-sky-700 transition-all duration-300"
            >
                <span className="font-bold text-lg tracking-wider uppercase">
                    🎓 Admission Open 2026–27 — Click Here to Apply
                </span>
            </Link>

            {/* ── HERO SECTION ── Light theme with school image */}
            <section className="relative w-full overflow-hidden bg-white" style={{ minHeight: '70vh' }}>
                {/* Background image with light overlay */}
                <div className="absolute inset-0">
                    <EditableContent
                        id="home_hero_bg"
                        defaultContent="https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg"
                        type="image"
                        user={user}
                        className="w-full h-full object-cover"
                        style={{ position: 'absolute', inset: 0 }}
                        imgAlt="Bethel Mission School"
                    />
                    {/* Light overlay instead of dark */}
                    <div className="absolute inset-0 bg-white/60 pointer-events-none" />
                </div>

                {/* Hero content */}
                <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '70vh' }}>
                    <div className="text-center px-4 max-w-4xl mx-auto py-16">
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-8 md:p-14 rounded-2xl shadow-xl">
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900 tracking-tight">
                                <EditableContent
                                    id="home_hero_title"
                                    defaultContent="Welcome to Bethel Mission School"
                                    type="text"
                                    user={user}
                                />
                            </h1>
                            <div className="w-20 h-1 bg-sky-500 mx-auto my-6 rounded-full" />
                            <p className="text-lg md:text-2xl text-slate-700 font-medium tracking-wide">
                                <EditableContent
                                    id="home_hero_subtitle"
                                    defaultContent="Service to God & Men"
                                    type="text"
                                    user={user}
                                />
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                                <Link
                                    to="/about"
                                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors shadow"
                                >
                                    About Us
                                </Link>
                                <Link
                                    to="/admissions/online"
                                    className="px-6 py-3 bg-white hover:bg-slate-50 text-sky-700 font-bold rounded-lg transition-colors shadow border border-sky-200"
                                >
                                    Apply Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll arrow */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ── STATS STRIP ── */}
            <section className="bg-sky-700 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: '1996', label: 'Est. Year' },
                            { value: '450+', label: 'Students' },
                            { value: '30+', label: 'Faculty' },
                            { value: '100%', label: 'HSLC Pass Rate' },
                        ].map(stat => (
                            <div key={stat.label}>
                                <div className="text-3xl font-extrabold">{stat.value}</div>
                                <div className="text-sky-200 text-sm mt-1 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LATEST NEWS ── */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-800">Latest News &amp; Announcements</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-slate-500">
                            Stay updated with the latest happenings at Bethel Mission School.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {latestNews.length > 0 ? (
                            latestNews.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 flex flex-col">
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                        <img src={item.imageUrls[0]} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                                    )}
                                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">{formatDateForNews(item.date)}</p>
                                    <h3 className="mt-2 text-lg font-bold text-slate-800">{item.title}</h3>
                                    <p className="mt-2 text-slate-600 text-sm leading-relaxed flex-grow">
                                        {item.content.substring(0, 150)}{item.content.length > 150 ? '...' : ''}
                                    </p>
                                    <Link to="/news" className="mt-4 font-semibold text-sky-600 hover:text-sky-800 text-sm self-start">
                                        Read More &rarr;
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="md:col-span-2 text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                <p className="text-slate-500 text-base">No news articles yet. Check back soon.</p>
                            </div>
                        )}
                    </div>

                    {news.length > 2 && (
                        <div className="text-center mt-10">
                            <Link to="/news" className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors shadow">
                                View All News
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-800">
                            <EditableContent
                                id="home_choose_title"
                                defaultContent="Why Choose Us?"
                                type="text"
                                user={user}
                            />
                        </h2>
                        <div className="mt-3 max-w-3xl mx-auto text-slate-500">
                            <EditableContent
                                id="home_choose_desc"
                                defaultContent="At Bethel Mission School, we are dedicated to providing a nurturing yet challenging educational environment that fosters academic excellence, strong moral character, and a lifelong passion for learning."
                                type="textarea"
                                user={user}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-800">Connect With Us</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-slate-500">
                            Follow us on social media to stay updated with our latest news, events, and student achievements.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">

                        {/* Social links */}
                        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Find Us On</h3>
                            <div className="flex flex-col gap-5">
                                <a href="https://www.facebook.com/bethel.ms" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 hover:translate-x-1 transition-transform">
                                    <FacebookIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <span className="text-base font-bold text-slate-800">Facebook</span>
                                        <p className="text-sm text-slate-500">@bethel.ms</p>
                                    </div>
                                </a>
                                <a href="https://www.instagram.com/bms_champhai/" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 hover:translate-x-1 transition-transform">
                                    <InstagramIcon className="w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <span className="text-base font-bold text-slate-800">Instagram</span>
                                        <p className="text-sm text-slate-500">@bms_champhai</p>
                                    </div>
                                </a>
                                <a href="https://www.youtube.com/@BethelMissionSchoolChamphai" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 hover:translate-x-1 transition-transform">
                                    <YouTubeIcon className="w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <span className="text-base font-bold text-slate-800">YouTube</span>
                                        <p className="text-sm text-slate-500">@BethelMissionSchoolChamphai</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Facebook Plugin */}
                        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex justify-center overflow-hidden">
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
