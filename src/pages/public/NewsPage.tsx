import React, { useMemo } from 'react';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

interface NewsPageProps { news: NewsItem[]; user: User | null; }

const NewsPage: React.FC<NewsPageProps> = ({ news, user }) => {
    const sortedNews = useMemo(() => [...news].sort((a, b) => b.date.localeCompare(a.date)), [news]);

    const renderRichContent = (text: string) => {
        const parts = text.split(/(!\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) return <img key={index} src={imgMatch[2]} alt={imgMatch[1] || 'News Image'} className="max-w-full h-auto rounded-lg my-4 shadow-sm block" />;
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const textElements: React.ReactNode[] = [];
            let lastIdx = 0, match;
            while ((match = linkRegex.exec(part)) !== null) {
                if (match.index > lastIdx) textElements.push(part.substring(lastIdx, match.index));
                textElements.push(<a key={`${index}-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }} className="underline font-medium break-all">{match[1]}</a>);
                lastIdx = linkRegex.lastIndex;
            }
            if (lastIdx < part.length) textElements.push(part.substring(lastIdx));
            return <span key={index}>{textElements}</span>;
        });
    };

    return (
        <div className="py-20" style={{ background: 'var(--bg-base)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <div className="section-label mb-3">Stay Informed</div>
                    <h1 className="section-heading">
                        <EditableContent id="news_page_title" defaultContent="Latest News & Announcements" type="text" user={user} />
                    </h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext max-w-xl mx-auto">
                        <EditableContent id="news_page_subtitle" defaultContent="Stay updated with the latest happenings at Bethel Mission School." type="text" user={user} />
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    {sortedNews.length > 0 ? sortedNews.map(item => (
                        <div
                            key={item.id}
                            className="rounded-xl overflow-hidden"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                        >
                            {item.imageUrls && item.imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 pb-0">
                                    {item.imageUrls.map((url, i) => (
                                        <img key={i} src={url} alt={`${item.title} ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                    ))}
                                </div>
                            )}
                            <div className="p-6">
                                <div
                                    className="pl-3 mb-1"
                                    style={{ borderLeft: '3px solid var(--gold)' }}
                                >
                                    <span className="section-label">{formatDateForNews(item.date)}</span>
                                </div>
                                <h2 className="mt-3 text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{item.title}</h2>
                                <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                                    {renderRichContent(item.content)}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed var(--border-subtle)' }}>
                            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No news articles found.</p>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
