
import React, { useMemo } from 'react';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

interface NewsPageProps {
    news: NewsItem[];
    user: User | null;
}

const NewsPage: React.FC<NewsPageProps> = ({ news, user }) => {
    const sortedNews = useMemo(() => {
        return [...news].sort((a, b) => b.date.localeCompare(a.date));
    }, [news]);

    // Helper to render text with links AND images
    const renderRichContent = (text: string) => {
        // 1. Split by image pattern: ![alt](url)
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

            // 2. Parse Links: [text](url) within text parts
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

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-800">
                         <EditableContent id="news_page_title" defaultContent="Latest News & Announcements" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600">
                         <EditableContent id="news_page_subtitle" defaultContent="Stay updated with the latest happenings at Bethel Mission School." type="text" user={user} />
                    </div>
                </div>
                <div className="max-w-3xl mx-auto space-y-8">
                    {sortedNews.length > 0 ? (
                        sortedNews.map(item => (
                            <div key={item.id} className="p-6 border-l-4 border-sky-500 bg-slate-50 rounded-r-lg">
                                {item.imageUrls && item.imageUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {item.imageUrls.map((url, index) => (
                                            <img key={index} src={url} alt={`${item.title} - image ${index + 1}`} className="w-full h-auto object-cover rounded-lg shadow-sm" />
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm font-semibold text-sky-700">{formatDateForNews(item.date)}</p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-800">{item.title}</h2>
                                <div className="mt-3 text-slate-600 whitespace-pre-wrap">
                                    {renderRichContent(item.content)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
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
