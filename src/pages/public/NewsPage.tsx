import React, { useMemo } from 'react';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

interface NewsPageProps { news: NewsItem[]; user: User | null; }

const NewsPage: React.FC<NewsPageProps> = ({ news, user }) => {
    const sortedNews = useMemo(() => [...news].sort((a,b) => b.date.localeCompare(a.date)), [news]);

    const renderRichContent = (text: string) => {
        const parts = text.split(/(!\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) return <img key={index} src={imgMatch[2]} alt={imgMatch[1]||'News Image'} className="max-w-full h-auto rounded-lg my-4 shadow-sm block border border-zinc-700" />;
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const textElements: React.ReactNode[] = [];
            let lastIdx = 0, match;
            while ((match = linkRegex.exec(part)) !== null) {
                if (match.index > lastIdx) textElements.push(part.substring(lastIdx, match.index));
                textElements.push(<a key={`${index}-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-medium break-all">{match[1]}</a>);
                lastIdx = linkRegex.lastIndex;
            }
            if (lastIdx < part.length) textElements.push(part.substring(lastIdx));
            return <span key={index}>{textElements}</span>;
        });
    };

    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">
                        <EditableContent id="news_page_title" defaultContent="Latest News & Announcements" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-400">
                        <EditableContent id="news_page_subtitle" defaultContent="Stay updated with the latest happenings at Bethel Mission School." type="text" user={user} />
                    </div>
                </div>
                <div className="max-w-3xl mx-auto space-y-8">
                    {sortedNews.length > 0 ? (
                        sortedNews.map(item => (
                            <div key={item.id} className="p-6 border-l-4 border-sky-500 bg-zinc-900 rounded-r-lg shadow-lg">
                                {item.imageUrls && item.imageUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {item.imageUrls.map((url,i) => <img key={i} src={url} alt={`${item.title} - image ${i+1}`} className="w-full h-auto object-cover rounded-lg shadow-sm border border-zinc-700" />)}
                                    </div>
                                )}
                                <p className="text-sm font-semibold text-sky-400">{formatDateForNews(item.date)}</p>
                                <h2 className="mt-2 text-2xl font-bold text-white">{item.title}</h2>
                                <div className="mt-3 text-slate-300 whitespace-pre-wrap">{renderRichContent(item.content)}</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-lg">
                            <p className="text-slate-300 text-lg font-semibold">No news articles found.</p>
                            <p className="text-slate-500 mt-2">Please check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default NewsPage;
