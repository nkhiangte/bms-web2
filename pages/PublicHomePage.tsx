

import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, UsersIcon, BuildingOfficeIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from '../../components/Icons';
import { NewsItem } from '../../types';
import { formatDateForNews } from '../../utils';


const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string; }> = ({ icon, title, description, link }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
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
}


const PublicHomePage: React.FC<PublicHomePageProps> = ({ news }) => {
    const latestNews = news.slice(0, 2);

    return (
        <>
            <section className="relative bg-cover bg-center text-white py-40 px-4" style={{ backgroundImage: "url('https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg')" }}>
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div className="relative container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-fade-in" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        Welcome to Bethel Mission School
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        Service to God & Men
                    </p>
                </div>
            </section>

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Latest News & Announcements</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                            Stay updated with the latest happenings at Bethel Mission School.
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {latestNews.length > 0 ? (
                            latestNews.map(item => (
                                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                        <img src={item.imageUrls[0]} alt={item.title} className="w-full h-40 object-cover" />
                                    )}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <p className="text-sm font-semibold text-sky-700">{formatDateForNews(item.date)}</p>
                                        <h3 className="mt-2 text-xl font-bold text-slate-800">{item.title}</h3>
                                        <p className="mt-3 text-slate-600 whitespace-pre-wrap flex-grow">{item.content.substring(0, 150)}{item.content.length > 150 ? '...' : ''}</p>
                                        <Link to="/news" className="mt-4 font-semibold text-sky-600 hover:text-sky-800 self-start">Read More &rarr;</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="md:col-span-2 text-center py-16 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                                <p className="text-slate-700 text-lg font-semibold">No news articles found.</p>
                                <p className="text-slate-600 mt-2">Please check back later for updates.</p>
                            </div>
                        )}
                    </div>
                    {news.length > 2 && (
                        <div className="text-center mt-12">
                            <Link to="/news" className="btn btn-primary">
                                View All News
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-800">Why Choose Us?</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-slate-600">
                        At Bethel Mission School, we are dedicated to providing a nurturing yet challenging educational environment that fosters academic excellence, strong moral character, and a lifelong passion for learning.
                    </p>
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

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Connect With Us</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                            Follow us on social media to stay updated with our latest news, events, and student achievements.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left side: Social links */}
                        <div className="flex flex-col items-center md:items-start gap-8">
                            <a href="https://www.facebook.com/bethel.ms" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-600 hover:text-blue-600 transition-transform transform hover:scale-105">
                                <FacebookIcon className="w-16 h-16 text-blue-600" />
                                <div>
                                    <span className="text-xl font-bold">Facebook</span>
                                    <p>@bethel.ms</p>
                                </div>
                            </a>
                            <a href="https://www.instagram.com/bms_champhai/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-600 hover:text-rose-600 transition-transform transform hover:scale-105">
                                <InstagramIcon className="w-16 h-16" />
                                <div>
                                    <span className="text-xl font-bold">Instagram</span>
                                    <p>@bms_champhai</p>
                                </div>
                            </a>
                            <a href="https://www.youtube.com/@BethelMissionSchoolChamphai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-600 hover:text-red-600 transition-transform transform hover:scale-105">
                                <YouTubeIcon className="w-16 h-16" />
                                <div>
                                    <span className="text-xl font-bold">YouTube</span>
                                    <p>@BethelMissionSchoolChamphai</p>
                                </div>
                            </a>
                        </div>

                        {/* Right side: Facebook Plugin */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="fb-page" 
                                data-href="https://www.facebook.com/bethel.ms" 
                                data-tabs="timeline" 
                                data-width="380" 
                                data-height="500" 
                                data-small-header="false" 
                                data-adapt-container-width="true" 
                                data-hide-cover="false" 
                                data-show-facepile="true">
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
