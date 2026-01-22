import React, { useMemo } from 'react';
import { NewsItem } from '../../types';
import { formatDateForNews } from '../../utils';

interface NewsPageProps {
    news: NewsItem[];
}

const NewsPage: React.FC<NewsPageProps> = ({ news }) => {
    const sortedNews = useMemo(() => {
        return [...news].sort((a, b) => b.date.localeCompare(a.date));
    }, [news]);

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-800">Latest News & Announcements</h1>
                    <p className="mt-4 text-lg text-slate-600">Stay updated with the latest happenings at Bethel Mission School.</p>
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
                                <p className="mt-3 text-slate-600 whitespace-pre-wrap">{item.content}</p>
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