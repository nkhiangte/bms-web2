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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:border-sky-500/50 hover:shadow-sky-900/20 group">
        <div className="w-full bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
            <img 
                src={holder.imageUrl} 
                alt={holder.name} 
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-105" 
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).parentElement!.classList.add('bg-zinc-900'); (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
        </div>
        <div className="p-3 border-t border-zinc-800/50 bg-black/40">
            <div className="flex justify-between items-center gap-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{holder.name}</h3>
                {holder.percentage !== undefined && holder.percentage > 0 && (
                    <span className="flex-shrink-0 bg-sky-600/20 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/30">
                        {holder.percentage}%
                    </span>
                )}
            </div>
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

                // SECOND: Check if they are in the parent Achievements folder but tagged with the year
                const achievementsDocRef = db.collection('website_content').doc('gallery_by_category_achievements');
                const achievementsDoc = await achievementsDocRef.get();
                if (achievementsDoc.exists) {
                    const data = achievementsDoc.data();
                    const items: any[] = data?.items || [];
                    const filteredItems = items.filter((item: any) => 
                        String(item.year) === String(year) && item.type === 'image'
                    ).map((item: any) => {
                        const title = item.title || '';
                        const caption = item.caption || '';
                        // Search for percentage in Title, Caption or Year (sometimes people put it there)
                        const combinedText = `${title} ${caption} ${item.year || ''}`;
                        const percentMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*%/);
                        const percentage = percentMatch ? parseFloat(percentMatch[1]) : 0;
                        
                        return {
                            name: title,
                            imageUrl: item.imageSrc,
                            caption: caption,
                            percentage: percentage
                        };
                    });

                    if (filteredItems.length > 0) {
                        // Sort by percentage descending
                        filteredItems.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
                        setHolders(filteredItems);
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
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <button onClick={() => navigate('/achievements/academic')} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                            <BackIcon className="w-5 h-5" />Back to Academic Achievements
                        </button>
                    </div>
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Distinction Holders ({year})</h1>
                        <p className="mt-2 text-lg text-slate-400">Celebrating the academic excellence of our top students.</p>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm">Loading distinction holders...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-zinc-900 border border-zinc-800 py-16 text-center rounded-lg shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-zinc-600" />
                            <h2 className="text-2xl font-bold text-white mt-4">Something went wrong</h2>
                            <p className="text-slate-400 mt-2">{error}</p>
                        </div>
                    ) : holders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {holders.map((holder, index) => <HolderCard key={index} holder={holder} />)}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 py-16 text-center rounded-lg shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-zinc-600" />
                            <h2 className="text-2xl font-bold text-white mt-4">Information Coming Soon</h2>
                            <p className="text-slate-400 mt-2">Details for the distinction holders of {year} are not yet available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default DistinctionHoldersPage;
