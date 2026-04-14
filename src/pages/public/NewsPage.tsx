import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

interface NewsPageProps {
    news: NewsItem[];
    user: User | null;
}

const NewsPage: React.FC<NewsPageProps> = ({ news, user }) => {
    // Reset body background in case PublicHomePage left it black
    useEffect(() => {
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.backgroundImage = 'none';
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.backgroundImage = '';
        };
    }, []);

    const sortedNews = useMemo(() => {
        return [...news].sort((a, b) => b.date.localeCompare(a.date));
    }, [news]);

    const renderRichContent = (text: string) => {
        const parts = text.split(/(!\[.*?\]\(.*?\))/g);
        
        return parts.map((part, index) => {
            const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
                return (
                    <img 
                        key={index} 
                        src={imgMatch[2]} 
                        alt={imgMatch[1] || 'News Image'} 
                        className="max-w-full h-auto rounded-lg my-4 shadow-sm block" 
                    />
                );
            }

            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const textElements = [];
            let lastIdx = 0;
            let match;

            while ((match = linkRegex.exec(part)) !== null) {
                if (match.index > lastIdx) {
                    textElements.push(part.substring(lastIdx, match.index));
                }
                textElements.push(
                    <a 
                        key={`${index}-${match.index}`} 
                        href={match[2]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sky-600 hover:text-sky-800 underline font-medium break-all"
                    >
                        {match[1]}
                    </a>
                );
                lastIdx = linkRegex.lastIndex;
            }
            if (lastIdx < part.length) {
                textElements.push(part.substring(lastIdx));
            }

            return <span key={index}>{textElements}</span>;
        });
    };

    const renderContent = (content: string) => {
        if (!content) return null;
        
        // Strip HTML for summary
        const stripped = content.replace(/<[^>]*>?/gm, '');
        const summary = stripped.length > 200 ? stripped.substring(0, 200) + '...' : stripped;
        
        return (
            <p className="mt-3 text-slate-600 line-clamp-3">
                {summary}
            </p>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-800">
                        <EditableContent id="news_page_title" defaultContent="Latest News & Announcements" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600">
                        <EditableContent id="news_page_subtitle" defaultContent="Stay updated with the latest happenings at Bethel Mission School." type="text" user={user} />
                    </div>
                </div>
                <div className="max-w-3xl mx-auto space-y-6">
                    {sortedNews.length > 0 ? (
                        sortedNews.map(item => (
                            <Link 
                                key={item.id} 
                                to={`/news/${item.id}`}
                                className="block p-6 border-l-4 border-sky-500 bg-white rounded-r-xl shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                        <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                                            <img 
                                                src={item.imageUrls[0]} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-sky-700">{formatDateForNews(item.date)}</p>
                                        <h2 className="mt-1 text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{item.title}</h2>
                                        {renderContent(item.content)}
                                        <div className="mt-4 flex items-center text-sky-600 font-medium text-sm">
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
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                            <p className="text-slate-700 text-lg font-semibold">No news articles found.</p>
                            <p className="text-slate-600 mt-2">Please check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
