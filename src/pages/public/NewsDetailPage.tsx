import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import { ArrowLeft } from 'lucide-react';

interface NewsDetailPageProps {
    news: NewsItem[];
    user: User | null;
}

const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ news }) => {
    const { newsId } = useParams<{ newsId: string }>();
    const item = news.find(n => n.id === newsId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        className="max-w-full h-auto rounded-lg my-4 shadow-sm block"
                        referrerPolicy="no-referrer"
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
                        className="text-[#8E6D1B] hover:text-[#0B1F3A] underline font-semibold break-all"
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

        const trimmed = content.trim();
        const isHtml = trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(content) || content.includes('</');

        if (isHtml) {
            return (
                <div
                    className="mt-6 text-[#0B1F3A]/85 prose max-w-none prose-p:leading-relaxed prose-headings:text-[#0B1F3A] prose-a:text-[#8E6D1B] prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        }

        return (
            <div className="mt-6 text-[#0B1F3A]/85 whitespace-pre-wrap leading-relaxed">
                {renderRichContent(content)}
            </div>
        );
    };

    if (!item) {
        return (
            <div className="bg-[#F4F7FB] min-h-screen py-16 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-[#0B1F3A]">News item not found</h2>
                    <Link to="/news" className="mt-4 inline-flex items-center text-[#8E6D1B] hover:text-[#0B1F3A] font-bold">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to News
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F4F7FB] min-h-screen py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <Link to="/news" className="mb-6 inline-flex items-center min-h-[44px] text-[#0B1F3A] hover:text-[#8E6D1B] font-bold transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All News
                    </Link>

                    <article className="bg-white rounded-2xl shadow-md border-t-4 border-[#C9A84C] overflow-hidden">
                        {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="aspect-video w-full overflow-hidden bg-[#0B1F3A]">
                                <img
                                    src={item.imageUrls[0]}
                                    alt={item.title}
                                    decoding="async"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )}

                        <div className="p-6 sm:p-10">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-[#FBF6E8] border border-[#C9A84C] text-[#8E6D1B] text-xs font-bold uppercase tracking-wider rounded-full">
                                    Announcement
                                </span>
                                <span className="text-[#0B1F3A]/65 text-sm font-medium">
                                    {formatDateForNews(item.date)}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A] leading-tight">
                                {item.title}
                            </h1>

                            {item.imageUrls && item.imageUrls.length > 1 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    {item.imageUrls.slice(1).map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`${item.title} - ${index + 2}`}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                            className="w-full h-48 object-cover rounded-xl shadow-sm"
                                            referrerPolicy="no-referrer"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 border-t border-[#0B1F3A]/10 pt-8">
                                {renderContent(item.content)}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailPage;
