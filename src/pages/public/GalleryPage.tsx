import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FolderIcon, SpinnerIcon } from '@/components/Icons';
import { User } from '@/types';
import { db } from '@/firebaseConfig';

const { useNavigate, useParams } = ReactRouterDOM as any;

// ── Types ──────────────────────────────────────────────────────────────────
interface GalleryImage {
    id: string;
    title: string;
    caption: string;
    imageSrc: string;
}

interface GalleryFolder {
    name: string;
    thumbnail?: string;
    subfolders?: GalleryFolder[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const FOLDERS_DOC_ID = 'gallery_folders';

// Convert folder name to URL-safe slug: "By Category" → "by-category"
const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Convert URL slug back to folder name by searching the tree
const slugToName = (slug: string, folders: GalleryFolder[]): string | null => {
    for (const f of folders) {
        if (toSlug(f.name) === slug) return f.name;
        if (f.subfolders) {
            const found = slugToName(slug, f.subfolders);
            if (found) return found;
        }
    }
    return null;
};

// Convert path array to Firestore doc ID
const pathToId = (path: string[]) =>
    `gallery_${path.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`;

// Default folders fallback
const DEFAULT_FOLDERS: GalleryFolder[] = [
    { name: 'By Event/Occasion', subfolders: [
        { name: 'Annual Day' }, { name: 'Sports Day' },
        { name: 'Science Fair', subfolders: [
            { name: 'Science Exhibition' }, { name: 'Science Congress' }, { name: 'Inspire Award Manak' },
        ]},
        { name: 'Independence Day' }, { name: 'Teachers Day' },
        { name: 'Cultural Programs' }, { name: 'Competitions' },
        { name: 'Field Trips', subfolders: [{ name: 'Eco-Club' }] },
    ]},
    { name: 'By Year', subfolders: [
        { name: '2025 Events' }, { name: '2024 Events' }, { name: '2023 Events' },
    ]},
    { name: 'By Category', subfolders: [
        { name: 'Students', subfolders: [
            { name: 'Nursery' }, { name: 'Kindergarten' },
            { name: 'Class I' }, { name: 'Class II' }, { name: 'Class III' },
            { name: 'Class IV' }, { name: 'Class V' }, { name: 'Class VI' },
            { name: 'Class VII' }, { name: 'Class VIII' }, { name: 'Class IX' }, { name: 'Class X' },
        ]},
        { name: 'Campus & Infrastructure' }, { name: 'Classrooms' },
        { name: 'Achievements' }, { name: 'Activities' }, { name: 'Alumni' },
    ]}
];

// ── Lightbox ───────────────────────────────────────────────────────────────
const Lightbox: React.FC<{
    images: GalleryImage[];
    index: number;
    onClose: () => void;
    onNav: (i: number) => void;
}> = ({ images, index, onClose, onNav }) => {
    const img = images[index];
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNav(Math.min(index + 1, images.length - 1));
            if (e.key === 'ArrowLeft') onNav(Math.max(index - 1, 0));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [index]);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light">✕</button>
                <img src={img.imageSrc} alt={img.title} className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl" />
                {(img.title || img.caption) && (
                    <div className="mt-4 text-center">
                        {img.title && <p className="text-white font-semibold text-lg">{img.title}</p>}
                        {img.caption && <p className="text-slate-300 text-sm mt-1">{img.caption}</p>}
                    </div>
                )}
                {index > 0 && (
                    <button onClick={() => onNav(index - 1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/70 hover:text-white text-5xl">‹</button>
                )}
                {index < images.length - 1 && (
                    <button onClick={() => onNav(index + 1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/70 hover:text-white text-5xl">›</button>
                )}
                <p className="text-slate-400 text-sm mt-3">{index + 1} / {images.length}</p>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
interface GalleryPageProps {
    user: User | null;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ user }) => {
    const navigate = useNavigate();
    // React Router wildcard param — captures everything after /gallery/
    const params = useParams();
    const slugPath: string = (params['*'] || '').replace(/^\/+|\/+$/g, ''); // trim slashes

    // Folder tree from Firestore
    const [folderTree, setFolderTree] = useState<GalleryFolder[]>(DEFAULT_FOLDERS);
    const [folderTreeLoading, setFolderTreeLoading] = useState(true);

    // Images for current leaf folder
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);

    // Lightbox
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Folder thumbnail cache
    const [folderThumbs, setFolderThumbs] = useState<Record<string, string>>({});

    // Scroll to top on navigation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slugPath]);

    // Load folder tree from Firestore
    useEffect(() => {
        const unsub = db.collection('website_content').doc(FOLDERS_DOC_ID).onSnapshot(
            doc => {
                if (doc.exists && doc.data()?.folders) setFolderTree(doc.data()!.folders);
                setFolderTreeLoading(false);
            },
            () => setFolderTreeLoading(false)
        );
        return () => unsub();
    }, []);

    // Convert URL slug path → folder name path array
    // e.g. "by-category/classrooms" → ["By Category", "Classrooms"]
    const currentPath: string[] = useMemo(() => {
        if (!slugPath || folderTreeLoading) return [];
        const slugs = slugPath.split('/').filter(Boolean);
        const result: string[] = [];
        let level = folderTree;
        for (const slug of slugs) {
            const found = level.find(f => toSlug(f.name) === slug);
            if (!found) break;
            result.push(found.name);
            level = found.subfolders || [];
        }
        return result;
    }, [slugPath, folderTree, folderTreeLoading]);

    // Current folder's subfolders
    const currentSubfolders = useMemo(() => {
        if (currentPath.length === 0) return folderTree;
        let level = folderTree;
        for (const name of currentPath) {
            const found = level.find(f => f.name === name);
            if (!found) return [];
            level = found.subfolders || [];
        }
        return level;
    }, [currentPath, folderTree]);

    const isLeafNode = currentPath.length > 0 && currentSubfolders.length === 0;

    // Navigate to a folder — updates the URL
    const navigateTo = (folderName: string) => {
        const newSlug = [...currentPath, folderName].map(toSlug).join('/');
        navigate(`/gallery/${newSlug}`);
    };

    // Navigate via breadcrumb
    const navigateToBreadcrumb = (index: number) => {
        if (index < 0) {
            navigate('/gallery');
        } else {
            const newPath = currentPath.slice(0, index + 1).map(toSlug).join('/');
            navigate(`/gallery/${newPath}`);
        }
    };

    // Load images at leaf node
    useEffect(() => {
        if (!isLeafNode) { setImages([]); return; }
        const id = pathToId(currentPath);
        setImagesLoading(true);
        const unsub = db.collection('website_content').doc(id).onSnapshot(
            doc => { setImages(doc.exists ? (doc.data()?.items || []) : []); setImagesLoading(false); },
            () => setImagesLoading(false)
        );
        return () => unsub();
    }, [isLeafNode, currentPath.join('/')]);

    // Pre-fetch folder thumbnails
    useEffect(() => {
        currentSubfolders.forEach(async folder => {
            const path = [...currentPath, folder.name];
            const id = pathToId(path);
            try {
                const doc = await db.collection('website_content').doc(id).get();
                const items: GalleryImage[] = doc.exists ? (doc.data()?.items || []) : [];
                if (items.length > 0) {
                    setFolderThumbs(prev => ({ ...prev, [folder.name]: items[0].imageSrc }));
                }
            } catch {}
        });
    }, [currentSubfolders]);

    return (
        <>
            {lightboxIndex !== null && (
                <Lightbox
                    images={images}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNav={setLightboxIndex}
                />
            )}

            <div className="bg-slate-50 py-16 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-extrabold text-slate-800">School Gallery</h1>
                        <p className="mt-2 text-slate-500">Browse photos by event, year, or category</p>
                    </div>

                    {/* Breadcrumbs */}
                    <nav className="text-sm font-semibold text-slate-600 mb-8 flex items-center flex-wrap gap-1">
                        <button onClick={() => navigateToBreadcrumb(-1)} className="hover:text-sky-600 transition-colors">
                            Gallery
                        </button>
                        {currentPath.map((folder, index) => (
                            <React.Fragment key={folder}>
                                <span className="text-slate-300">/</span>
                                <button
                                    onClick={() => navigateToBreadcrumb(index)}
                                    className={`hover:text-sky-600 transition-colors ${index === currentPath.length - 1 ? 'text-sky-600' : ''}`}
                                >
                                    {folder}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>

                    {folderTreeLoading ? (
                        <div className="flex justify-center py-20">
                            <SpinnerIcon className="w-10 h-10 text-sky-500" />
                        </div>
                    ) : !isLeafNode ? (
                        /* ── Folder Grid ── */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {currentSubfolders.map(folder => {
                                const thumb = folderThumbs[folder.name] || folder.thumbnail;
                                const hasSubfolders = folder.subfolders && folder.subfolders.length > 0;
                                return (
                                    <div
                                        key={folder.name}
                                        onClick={() => navigateTo(folder.name)}
                                        className="aspect-square relative rounded-xl overflow-hidden shadow-md cursor-pointer group"
                                    >
                                        {thumb ? (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${thumb})` }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-slate-200 flex items-center justify-center">
                                                <FolderIcon className="w-16 h-16 text-sky-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
                                        <div className="relative z-10 h-full flex flex-col justify-end p-4 text-white">
                                            <FolderIcon className="w-6 h-6 opacity-80 mb-1" />
                                            <h3 className="font-bold text-base leading-tight">{folder.name}</h3>
                                            {hasSubfolders && (
                                                <p className="text-xs text-white/60 mt-0.5">
                                                    {folder.subfolders!.length} subfolder{folder.subfolders!.length !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* ── Image Grid (Leaf Node) ── */
                        imagesLoading ? (
                            <div className="flex justify-center py-20">
                                <SpinnerIcon className="w-10 h-10 text-sky-500" />
                            </div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-xl">
                                <FolderIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-semibold">No photos in this folder yet.</p>
                                <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-slate-400 mb-4">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            onClick={() => setLightboxIndex(idx)}
                                            className="aspect-square relative rounded-xl overflow-hidden shadow-md cursor-pointer group"
                                        >
                                            <img
                                                src={img.imageSrc} alt={img.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                            {(img.title || img.caption) && (
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    {img.title && <p className="text-white text-sm font-semibold truncate">{img.title}</p>}
                                                    {img.caption && <p className="text-slate-300 text-xs truncate">{img.caption}</p>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default GalleryPage;
