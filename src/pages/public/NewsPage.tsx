import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';
import { isPublishedNewsItem } from '@/components/LatestNewsBannerSection';

interface NewsPageProps {
    news: NewsItem[];
    user: User | null;
}

const NewsPage: React.FC<NewsPageProps> = ({ news, user }) => {
    const sortedNews = useMemo(() => {
        return [...news]
            .filter(isPublishedNewsItem)
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [news]);

    const renderContent = (content: string) => {
        if (!content) return null;
        const stripped = content.replace(/<[^>]*>?/gm, '');
        const summary = stripped.length > 200 ? stripped.substring(0, 200) + '...' : stripped;
        return (
            <p className="mt-2.5 text-sm sm:text-base text-[#0B1F3A]/75 line-clamp-3">
                {summary}
            </p>
        );
    };

    return (
        <div className="bg-[#F4F7FB] min-h-screen py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 sm:mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8E6D1B]">School Bulletins</p>
                    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                        <EditableContent id="news_page_title" defaultContent="Latest News & Announcements" type="text" user={user} />
                    </h1>
                    <div className="mt-3 text-base sm:text-lg text-[#0B1F3A]/75">
                        <EditableContent id="news_page_subtitle" defaultContent="Stay updated with the latest happenings at Bethel Mission School." type="text" user={user} />
                    </div>
                </div>
                <div className="max-w-3xl mx-auto space-y-5">
                    {sortedNews.length > 0 ? (
                        sortedNews.map(item => (
                            <Link
                                key={item.id}
                                to={`/news/${item.id}`}
                                className="block p-5 sm:p-6 border-l-4 border-[#C9A84C] bg-white rounded-r-xl shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-5">
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                        <div className="w-full md:w-48 h-36 flex-shrink-0 overflow-hidden rounded-lg bg-[#0B1F3A]">
                                            <img
                                                src={item.imageUrls[0]}
                                                alt={item.title}
                                                loading="lazy"
                                                decoding="async"
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#8E6D1B]">{formatDateForNews(item.date)}</p>
                                        <h2 className="mt-1 text-xl font-extrabold text-[#0B1F3A] group-hover:text-[#8E6D1B] transition-colors">{item.title}</h2>
                                        {renderContent(item.content)}
                                        <div className="mt-4 inline-flex items-center text-[#0B1F3A] font-bold text-sm group-hover:text-[#8E6D1B]">
                                            Read More
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-[#0B1F3A]/20 rounded-xl bg-white">
                            <p className="text-[#0B1F3A] text-lg font-bold">No news articles found.</p>
                            <p className="text-[#0B1F3A]/70 mt-2">Please check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
