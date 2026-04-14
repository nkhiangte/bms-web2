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
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.backgroundImage = 'none';
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.backgroundImage = '';
        };
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
        
        const trimmed = content.trim();
        const isHtml = trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(content) || content.includes('</');
        
        if (isHtml) {
            return (
                <div 
                    className="mt-6 text-slate-700 prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-a:text-sky-600 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        }
        
        return (
            <div className="mt-6 text-slate-700 whitespace-pre-wrap leading-relaxed">
                {renderRichContent(content)}
            </div>
        );
    };

    if (!item) {
        return (
            <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">News item not found</h2>
                    <Link to="/news" className="mt-4 inline-flex items-center text-sky-600 hover:text-sky-800 font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to News
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <Link to="/news" className="mb-8 inline-flex items-center text-slate-500 hover:text-sky-600 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All News
                    </Link>
                    
                    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="aspect-video w-full overflow-hidden">
                                <img 
                                    src={item.imageUrls[0]} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )}
                        
                        <div className="p-8 sm:p-12">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                    Announcement
                                </span>
                                <span className="text-slate-400 text-sm">
                                    {formatDateForNews(item.date)}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                                {item.title}
                            </h1>
                            
                            {item.imageUrls && item.imageUrls.length > 1 && (
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    {item.imageUrls.slice(1).map((url, index) => (
                                        <img 
                                            key={index} 
                                            src={url} 
                                            alt={`${item.title} - ${index + 2}`} 
                                            className="w-full h-48 object-cover rounded-xl shadow-sm"
                                            referrerPolicy="no-referrer"
                                        />
                                    ))}
                                </div>
                            )}
                            
                            <div className="mt-8 border-t border-slate-100 pt-8">
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
