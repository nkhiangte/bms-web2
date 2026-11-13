import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, UserIcon } from '@/components/Icons';
import { storage, db } from '@/firebaseConfig';

const { useParams, useNavigate } = ReactRouterDOM as any;

const parseNameFromFilename = (filename: string): string => {
    const withoutExt = filename.replace(/\.[^/.]+$/, '');
    const withoutTimestamp = withoutExt.replace(/^\d+_/, '');
    return withoutTimestamp.replace(/_/g, ' ');
};

interface HolderImage { 
    name: string; 
    imageUrl: string; 
    caption?: string; 
    percentage?: number;
}

const HolderCard: React.FC<{ holder: HolderImage }> = ({ holder }) => (
    <div className="bg-white border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] rounded-2xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group">
        <div className="w-full bg-[#F4F7FB] flex flex-col items-center justify-center overflow-hidden">
            <img 
                src={holder.imageUrl} 
                alt={holder.name} 
                loading="lazy"
                decoding="async"
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" 
                referrerPolicy="no-referrer"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/bms-logo-color.png'; }} 
            />
        </div>
        <div className="p-4 border-t border-[#0B1F3A]/10 bg-white">
            <div className="flex justify-between items-start gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider line-clamp-1 flex-1">{holder.name}</h3>
                {holder.percentage !== undefined && holder.percentage > 0 && (
                    <span className="flex-shrink-0 bg-[#FBF6E8] text-[#8E6D1B] text-[11px] font-extrabold px-2 py-0.5 rounded border border-[#C9A84C] font-tabular">
                        {holder.percentage}%
                    </span>
                )}
            </div>
            {holder.caption && (
                <p className="text-[11px] text-[#132D52]/80 line-clamp-2 leading-tight uppercase font-medium italic">
                    {holder.caption}
                </p>
            )}
        </div>
    </div>
);

const DistinctionHoldersPage: React.FC = () => {
    const { year } = useParams() as { year: string };
    const navigate = useNavigate();
    const [holders, setHolders] = useState<HolderImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        if (!year) return;
        const fetchHolders = async () => {
            setLoading(true); setError(null); setHolders([]);
            try {
                // FIRST: Check if there's a dynamic HSLC result with a distinction list image
                const hslcSnap = await db.collection('hslc_results').where('year', '==', parseInt(year)).get();
                if (!hslcSnap.empty) {
                    const resultData = hslcSnap.docs[0].data();
                    if (resultData.distinctionListImageUrl) {
                        setHolders([{ name: `Distinction List ${year}`, imageUrl: resultData.distinctionListImageUrl }]);
                        setLoading(false);
                        return;
                    }
                }

                // SECOND: Check multiple potential documents for items
                const potentialDocs = [
                    'gallery_by_category_achievements',
                    'gallery_by_category_achievements_distinguished_hslc_graduate',
                    `gallery_by_category_achievements_distinguished_hslc_graduate_${year}`
                ];

                let allItemsFetched: any[] = [];
                for (const docId of potentialDocs) {
                    const doc = await db.collection('website_content').doc(docId).get();
                    if (doc.exists) {
                        const data = doc.data();
                        const items = data?.items || (Array.isArray(data) ? data : Object.values(data || {}));
                        if (Array.isArray(items)) {
                            allItemsFetched = [...allItemsFetched, ...items];
                        }
                    }
                }

                if (allItemsFetched.length > 0) {
                    const filteredHolders = allItemsFetched
                        .filter((item: any) => {
                            const itemYear = String(item.year || '').trim();
                            const targetYear = String(year).trim();
                            return itemYear === targetYear; 
                        })
                        .filter((item: any) => item.imageSrc && (item.type === 'image' || !item.type))
                        .map((item: any) => {
                            const title = item.title || '';
                            const caption = item.caption || '';
                            const combinedText = `${title} ${caption} ${item.year || ''}`;
                            
                            const matches = combinedText.matchAll(/(\d+(?:\.\d+)?)\s*%/g);
                            let maxPercent = 0;
                            for (const match of matches) {
                                const val = parseFloat(match[1]);
                                if (val > maxPercent) maxPercent = val;
                            }
                            
                            return {
                                name: title || parseNameFromFilename(item.imageSrc.split('/').pop() || 'Student'),
                                imageUrl: item.imageSrc,
                                caption: caption,
                                percentage: maxPercent
                            };
                        });

                    if (filteredHolders.length > 0) {
                        const uniqueHolders = Array.from(new Map(filteredHolders.map(h => [h.imageUrl, h])).values());
                        uniqueHolders.sort((a, b) => {
                            const pA = a.percentage || 0;
                            const pB = b.percentage || 0;
                            if (Math.abs(pB - pA) > 0.01) return pB - pA;
                            return a.name.localeCompare(b.name);
                        });
                        
                        setHolders(uniqueHolders);
                        setLoading(false);
                        return;
                    }
                }

                // THIRD: Fallback to existing logic (specific subfolder)
                const folderPath = `gallery/by_category/achievements/distinguished_hslc_graduate/${year}`;
                const folderRef = storage.ref(folderPath);
                const result = await folderRef.listAll();
                if (result.items.length > 0) {
                    const holderData: HolderImage[] = await Promise.all(result.items.map(async (itemRef) => {
                        const url = await itemRef.getDownloadURL();
                        const name = parseNameFromFilename(itemRef.name);
                        return { name, imageUrl: url, percentage: 0 };
                    }));
                    holderData.sort((a, b) => a.name.localeCompare(b.name));
                    setHolders(holderData);
                } else {
                    const docRef = db.collection('website_content').doc(`gallery_by_category_achievements_distinguished_hslc_graduate_${year}`);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        const items: HolderImage[] = Object.values(data || {}).filter((item: any) => item.type === 'image').map((item: any) => {
                            const caption = item.caption || '';
                            const percentMatch = caption.match(/(\d+(?:\.\d+)?)\s*%/);
                            const percentage = percentMatch ? parseFloat(percentMatch[1]) : 0;
                            return { 
                                name: item.title, 
                                imageUrl: item.imageSrc,
                                caption: caption,
                                percentage: percentage
                            };
                        });
                        items.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
                        setHolders(items);
                    } else { setHolders([]); }
                }
            } catch (err: any) { setError('Could not load images. Please try again later.'); }
            finally { setLoading(false); }
        };
        fetchHolders();
    }, [year]);

    return (
        <div className="bg-[#F4F7FB] py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <button onClick={() => navigate('/achievements/academic')} className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors">
                            <BackIcon className="w-5 h-5" />Back to Academic Achievements
                        </button>
                    </div>
                    <div className="text-center mb-10">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C]/50 px-3 py-1 rounded-full mb-3">
                            HSLC Roll of Honour
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] font-tabular">Distinction Holders ({year})</h1>
                        <p className="mt-2 text-base sm:text-lg text-[#132D52]/80">Celebrating the academic excellence of our top students.</p>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#132D52] text-sm font-medium">Loading distinction holders...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white border border-[#0B1F3A]/15 py-16 text-center rounded-2xl shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-[#0B1F3A]/40" />
                            <h2 className="text-2xl font-bold text-[#0B1F3A] mt-4">Something went wrong</h2>
                            <p className="text-[#132D52]/80 mt-2">{error}</p>
                        </div>
                    ) : holders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {holders.map((holder, index) => <HolderCard key={index} holder={holder} />)}
                        </div>
                    ) : (
                        <div className="bg-white border border-[#0B1F3A]/15 py-16 text-center rounded-2xl shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-[#0B1F3A]/40" />
                            <h2 className="text-2xl font-bold text-[#0B1F3A] mt-4">Information Coming Soon</h2>
                            <p className="text-[#132D52]/80 mt-2">Details for the distinction holders of <span className="font-tabular">{year}</span> are not yet available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default DistinctionHoldersPage;
