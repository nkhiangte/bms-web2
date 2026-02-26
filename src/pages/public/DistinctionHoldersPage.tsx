import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, UserIcon } from '@/components/Icons';
import { storage } from '@/firebaseConfig';

const { useParams, useNavigate } = ReactRouterDOM as any;

// ─── Parse a student name from a Firebase Storage filename ────────────────────
// Filenames follow the pattern: {timestamp}_{Name_With_Underscores}.jpg
// e.g. "1771960102037_J_Malsawmzual.jpg" → "J Malsawmzual"
const parseNameFromFilename = (filename: string): string => {
    // Remove extension
    const withoutExt = filename.replace(/\.[^/.]+$/, '');
    // Remove leading timestamp (digits followed by underscore)
    const withoutTimestamp = withoutExt.replace(/^\d+_/, '');
    // Replace remaining underscores with spaces
    return withoutTimestamp.replace(/_/g, ' ');
};

interface HolderImage {
    name: string;
    imageUrl: string;
}

const HolderCard: React.FC<{ holder: HolderImage }> = ({ holder }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform transform hover:-translate-y-2">
        <div className="w-full h-72 bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
                src={holder.imageUrl}
                alt={holder.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        </div>

    </div>
);

const DistinctionHoldersPage: React.FC = () => {
    const { year } = useParams() as { year: string };
    const navigate = useNavigate();

    const [holders, setHolders] = useState<HolderImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!year) return;

        const fetchHolders = async () => {
            setLoading(true);
            setError(null);
            setHolders([]);

            try {
                const folderPath = `gallery/by_category/achievements/distinguished_hslc_graduate/${year}`;
                const folderRef = storage.ref(folderPath);
                const result = await folderRef.listAll();

                if (result.items.length === 0) {
                    setHolders([]);
                    setLoading(false);
                    return;
                }

                const holderData: HolderImage[] = await Promise.all(
                    result.items.map(async (itemRef) => {
                        const url = await itemRef.getDownloadURL();
                        const name = parseNameFromFilename(itemRef.name);
                        return { name, imageUrl: url };
                    })
                );

                // Sort alphabetically by name
                holderData.sort((a, b) => a.name.localeCompare(b.name));
                setHolders(holderData);
            } catch (err: any) {
                console.error('Failed to load distinction holders:', err);
                setError('Could not load images. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchHolders();
    }, [year]);

    return (
        <div className="bg-slate-50 py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
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
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm">Loading distinction holders...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white py-16 text-center rounded-lg shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-slate-400" />
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">Something went wrong</h2>
                            <p className="text-slate-600 mt-2">{error}</p>
                        </div>
                    ) : holders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {holders.map((holder, index) => (
                                <HolderCard key={index} holder={holder} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white py-16 text-center rounded-lg shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-slate-400" />
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">Information Coming Soon</h2>
                            <p className="text-slate-600 mt-2">
                                Details for the distinction holders of {year} are not yet available.
                            </p>
                            <p className="text-slate-400 mt-1 text-sm">
                                Add images to the gallery under <code className="bg-slate-100 px-1 rounded">achievements → distinguished-hslc-graduate → {year}</code>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DistinctionHoldersPage;
