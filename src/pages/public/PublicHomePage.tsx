
import React, { useMemo } from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, UsersIcon, BuildingOfficeIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/Icons';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

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
    user: User | null;
}


const PublicHomePage: React.FC<PublicHomePageProps> = ({ news, user }) => {
    const latestNews = useMemo(() => {
        return [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
    }, [news]);

    return (
        <>
            <Link 
                to="/admissions/online" 
                className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-500 to-sky-700 text-white p-4 text-center shadow-lg animate-pulse hover:animate-none hover:from-sky-400 hover:to-sky-600 transition-all duration-300"
            >
                <span className="font-bold text-xl tracking-wider uppercase">
                    ADMISSION OPEN, Click Here
                </span>
            </Link>

             <section className="relative h-[600px] w-full">
                <EditableContent
                    id="home_hero_bg"
                    defaultContent="https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg"
                    type="image"
                    user={user}
                    className="absolute inset-0 w-full h-full object-cover"
                    imgAlt="School Hero Background"
                />
                <div className="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>
                <div className="relative container mx-auto text-center h-full flex flex-col justify-center items-center px-4">
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-8 md:p-12 rounded-2xl shadow-2xl max-w-4xl animate-fade-in transform hover:scale-[1.01] transition-transform duration-500">
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                            <EditableContent
                                id="home_hero_title"
                                defaultContent="Welcome to Bethel Mission School"
                                type="text"
                                user={user}
                            />
                        </h1>
                        <div className="w-24 h-1 bg-sky-500 mx-auto my-6 rounded-full"></div>
                        <p className="text-xl md:text-3xl text-sky-50 font-medium tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                            <EditableContent
                                id="home_hero_subtitle"
                                defaultContent="Service to God & Men"
                                type="text"
                                user={user}
                            />
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-800">Latest News & Announcements</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                            Stay updated with the latest happenings at Bethel Mission School.
                        </p>
                    </div>

                    {/* Requested Banner */}
                    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl mb-12 group max-w-5xl mx-auto">
                        <div className="absolute inset-0">
                            <img 
                                src="https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg" 
                                alt="School Building" 
                                className="w-full h-full object-cover blur-[2px] scale-105 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-slate-900/40"></div>
                        </div>
                        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-xl" style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
                                Welcome to Bethel <br className="hidden md:block" /> Mission School
                            </h2>
                            <div className="w-20 h-1.5 bg-sky-500 rounded-full my-4 shadow-lg"></div>
                            <p className="text-xl md:text-2xl text-slate-100 font-medium tracking-wide drop-shadow-md">
                                Service to God & Men
                            </p>
                        </div>
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
                    <h2 className="text-3xl font-bold text-slate-800">
                        <EditableContent
                            id="home_choose_title"
                            defaultContent="Why Choose Us?"
                            type="text"
                            user={user}
                        />
                    </h2>
                    <div className="mt-4 max-w-3xl mx-auto text-slate-600">
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
