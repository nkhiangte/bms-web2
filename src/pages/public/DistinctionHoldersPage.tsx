import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, UserIcon, SpinnerIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface GalleryItem {
    id: string;
    title: string;
    caption: string;
    imageSrc?: string;
    type?: 'image' | 'video';
    year?: number | string;
}

// Firestore doc ID for the Distinguished HSLC Graduate gallery folder
const GALLERY_DOC_ID = 'gallery_by_category_achievements_distinguished_hslc_graduate';

const HolderCard: React.FC<{ holder: GalleryItem }> = ({ holder }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform transform hover:-translate-y-2">
        <div className="w-full bg-slate-200 flex items-center justify-center" style={{ height: '220px' }}>
            <img
                src={holder.imageSrc}
                alt={holder.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
            />
        </div>
        <div className="p-4">
            <h3 className="font-bold text-lg text-slate-800">{holder.title}</h3>
            {holder.caption && <p className="text-sm text-slate-600 mt-1">{holder.caption}</p>}
        </div>
    </div>
);

const DistinctionHoldersPage: React.FC = () => {
    const { year } = useParams() as { year: string };
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsub = db.collection('website_content').doc(GALLERY_DOC_ID).onSnapshot(
            doc => {
                const items: GalleryItem[] = doc.exists ? (doc.data()?.items || []) : [];
                setAllItems(items);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    // Filter items by year — match item.year field, or year in title/caption as fallback
    const holders = allItems.filter(item => {
        if (item.year !== undefined && item.year !== null && item.year !== '') {
            return String(item.year) === String(year);
        }
        // Fallback: check if year appears in title or caption
        const yearStr = String(year);
        return (item.title && item.title.includes(yearStr)) ||
               (item.caption && item.caption.includes(yearStr));
    });

    return (
        <div className="bg-slate-50 py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/achievements/academic')}
                            className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            Back to Academic Achievements
                        </button>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                            Distinction Holders ({year})
                        </h1>
                        <p className="mt-2 text-lg text-slate-600">
                            Celebrating the academic excellence of our top students.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <SpinnerIcon className="w-10 h-10 text-sky-500" />
                        </div>
                    ) : holders.length > 0 ? (
                        <>
                            <p className="text-center text-slate-500 mb-8">
                                {holders.length} distinction holder{holders.length !== 1 ? 's' : ''} in {year}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {holders.map((holder, index) => (
                                    <HolderCard key={holder.id || index} holder={holder} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white py-16 text-center rounded-lg shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-slate-400" />
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">Information Coming Soon</h2>
                            <p className="text-slate-600 mt-2">
                                Details for the distinction holders of {year} are not yet available.
                            </p>
                            <p className="text-slate-400 text-sm mt-2">
                                To show photos here, upload them in the Gallery Manager under<br />
                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                                    By Category → Achievements → Distinguished HSLC Graduate
                                </span>
                                <br />and set the <strong>Year</strong> field to <strong>{year}</strong>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DistinctionHoldersPage;
