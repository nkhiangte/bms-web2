import React, { useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { NewsItem } from '@/types';
import { formatDateForNews, stripHtml } from '@/utils';

const { Link } = ReactRouterDOM as any;

interface LatestNewsBannerSectionProps {
    news: NewsItem[];
}

function getNormalizedDateString(rawDate: any): string {
    if (!rawDate) return '';
    if (typeof rawDate === 'string') {
        return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.trim();
    }
    if (typeof rawDate?.toDate === 'function') {
        return rawDate.toDate().toISOString().split('T')[0];
    }
    return '';
}

function getPublicationTimestamp(item: NewsItem): number {
    const raw = (item as any).date || (item as any).publishedAt || (item as any).createdAt;
    if (!raw) return 0;
    if (typeof raw?.toDate === 'function') return raw.toDate().getTime();
    const parsed = Date.parse(String(raw));
    return Number.isNaN(parsed) ? 0 : parsed;
}

export function isPublishedNewsItem(item: NewsItem): boolean {
    if (!item || !item.id || !item.title) return false;
    const raw = item as any;
    if (raw.deleted === true || raw.isDeleted === true) return false;
    if (raw.isDraft === true || raw.published === false || raw.isPublished === false) return false;
    if (typeof raw.status === 'string') {
        const normalized = raw.status.trim().toLowerCase();
        if (normalized && normalized !== 'published' && normalized !== 'active') {
            return false;
        }
    }
    return true;
}

const NewsThumbnail: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [hidden, setHidden] = useState(false);
    if (!src || hidden) return null;

    return (
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden bg-[#10233F]/5 border border-[#10233F]/10 flex-shrink-0">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setHidden(true)}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

const LatestNewsBannerSection: React.FC<LatestNewsBannerSectionProps> = ({ news }) => {
    const { publishedItems, totalPublishedCount } = useMemo(() => {
        const filtered = (news || []).filter(isPublishedNewsItem);
        const sorted = [...filtered].sort((a, b) => {
            const diff = getPublicationTimestamp(b) - getPublicationTimestamp(a);
            if (diff !== 0) return diff;
            return getNormalizedDateString(b.date).localeCompare(getNormalizedDateString(a.date));
        });
        return {
            publishedItems: sorted.slice(0, 3),
            totalPublishedCount: sorted.length,
        };
    }, [news]);

    if (publishedItems.length === 0) {
        return null;
    }

    return (
        <section
            aria-labelledby="top-latest-news-heading"
            className="bg-[#F8F7F3] border-b border-[#10233F]/10 py-5 sm:py-6"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2
                            id="top-latest-news-heading"
                            className="text-lg sm:text-xl font-extrabold text-[#10233F] tracking-tight"
                        >
                            Latest News &amp; Announcements
                        </h2>
                        <div className="mt-1.5 h-0.5 w-12 bg-[#C9A33B]" />
                    </div>

                    <Link
                        to="/news"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#10233F] hover:text-[#C9A33B] transition-colors whitespace-nowrap shrink-0 py-1.5"
                    >
                        <span>
                            {totalPublishedCount > 3 ? `View All News (${totalPublishedCount})` : 'View All News'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div
                    className={`grid grid-cols-1 gap-3.5 sm:gap-4 ${
                        publishedItems.length === 1
                            ? 'md:grid-cols-1 max-w-2xl'
                            : publishedItems.length === 2
                            ? 'md:grid-cols-2'
                            : 'md:grid-cols-3'
                    }`}
                >
                    {publishedItems.map(item => {
                        const dateStr = getNormalizedDateString(item.date);
                        const formattedDate = dateStr ? formatDateForNews(dateStr) : '';
                        const cleanExcerpt = stripHtml(item.content || '').replace(/\s+/g, ' ').trim();
                        const shortExcerpt =
                            cleanExcerpt.length > 105 ? `${cleanExcerpt.substring(0, 105)}...` : cleanExcerpt;
                        const thumbUrl = Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls[0] : '';

                        return (
                            <article
                                key={item.id}
                                className="bg-white border border-[#10233F]/15 hover:border-[#C9A33B] rounded-xl p-3.5 sm:p-4 shadow-sm transition-colors flex items-start gap-3.5"
                            >
                                {thumbUrl && <NewsThumbnail src={thumbUrl} alt={item.title} />}

                                <div className="min-w-0 flex-1 flex flex-col justify-between h-full">
                                    <div>
                                        {formattedDate && (
                                            <time
                                                dateTime={dateStr}
                                                className="block text-[11px] font-bold uppercase tracking-wider text-[#8E6D1B] tabular-nums"
                                            >
                                                {formattedDate}
                                            </time>
                                        )}
                                        <h3 className="mt-0.5 text-sm sm:text-[15px] font-bold text-[#10233F] leading-snug line-clamp-2">
                                            {item.title}
                                        </h3>
                                        {shortExcerpt && (
                                            <p className="mt-1 text-xs text-[#10233F]/75 leading-relaxed line-clamp-2">
                                                {shortExcerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-2.5">
                                        <Link
                                            to={`/news/${item.id}`}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#10233F] hover:text-[#C9A33B] transition-colors py-1"
                                        >
                                            <span>Read More</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default LatestNewsBannerSection;
