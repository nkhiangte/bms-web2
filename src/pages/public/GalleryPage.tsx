import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FolderIcon, SpinnerIcon } from '@/components/Icons';
import { User } from '@/types';
import { db } from '@/firebaseConfig';

const { useNavigate, useParams } = ReactRouterDOM as any;

interface GalleryItem {
    id: string;
    title: string;
    caption: string;
    imageSrc?: string;
    type?: 'image' | 'video';
    videoUrl?: string;
}

interface GalleryFolder {
    name: string;
    thumbnail?: string;
    subfolders?: GalleryFolder[];
}

const FOLDERS_DOC_ID = 'gallery_folders';

const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pathToId = (path: string[]) =>
    `gallery_${path.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`;

const getYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

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

// ── Video Lightbox ─────────────────────────────────────────────────────────
const VideoModal: React.FC<{ videoId: string; title: string; onClose: () => void }> = ({ videoId, title, onClose }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light">✕</button>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        className="absolute inset-0 w-full h-full rounded-xl"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                {title && <p className="text-white font-semibold text-center mt-4">{title}</p>}
            </div>
        </div>
    );
};

// ── Image Lightbox ─────────────────────────────────────────────────────────
const ImageLightbox: React.FC<{
    images: GalleryItem[];
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
interface GalleryPageProps { user: User | null; }

const GalleryPage: React.FC<GalleryPageProps> = ({ user }) => {
    const navigate = useNavigate();
    const params = useParams();
    const slugPath: string = (params['*'] || '').replace(/^\/+|\/+$/g, '');

    const [folderTree, setFolderTree] = useState<GalleryFolder[]>(DEFAULT_FOLDERS);
    const [folderTreeLoading, setFolderTreeLoading] = useState(true);
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    // Lightbox state
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [activeVideoTitle, setActiveVideoTitle] = useState('');

    const [folderThumbs, setFolderThumbs] = useState<Record<string, string>>({});

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [slugPath]);

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

    const navigateTo = (folderName: string) => {
        const newSlug = [...currentPath, folderName].map(toSlug).join('/');
        navigate(`/gallery/${newSlug}`);
    };

    const navigateToBreadcrumb = (index: number) => {
        if (index < 0) navigate('/gallery');
        else navigate(`/gallery/${currentPath.slice(0, index + 1).map(toSlug).join('/')}`);
    };

    useEffect(() => {
        if (!isLeafNode) { setItems([]); return; }
        const id = pathToId(currentPath);
        setItemsLoading(true);
        const unsub = db.collection('website_content').doc(id).onSnapshot(
            doc => { setItems(doc.exists ? (doc.data()?.items || []) : []); setItemsLoading(false); },
            () => setItemsLoading(false)
        );
        return () => unsub();
    }, [isLeafNode, currentPath.join('/')]);

    useEffect(() => {
        currentSubfolders.forEach(async folder => {
            const path = [...currentPath, folder.name];
            const id = pathToId(path);
            try {
                const doc = await db.collection('website_content').doc(id).get();
                const folderItems: GalleryItem[] = doc.exists ? (doc.data()?.items || []) : [];
                if (folderItems.length > 0 && folderItems[0].imageSrc) {
                    setFolderThumbs(prev => ({ ...prev, [folder.name]: folderItems[0].imageSrc! }));
                }
            } catch {}
        });
    }, [currentSubfolders]);

    // Only image items go into the lightbox (videos open in VideoModal)
    const imageItems = items.filter(i => i.type !== 'video');

    const handleItemClick = (item: GalleryItem, idx: number) => {
        if (item.type === 'video' && item.videoUrl) {
            const ytId = getYouTubeId(item.videoUrl);
            if (ytId) {
                setActiveVideoId(ytId);
                setActiveVideoTitle(item.title);
            }
        } else {
            // Find index within image-only items for lightbox navigation
            const imageIdx = imageItems.findIndex(i => i.id === item.id);
            if (imageIdx !== -1) setLightboxIndex(imageIdx);
        }
    };

    return (
        <>
            {/* Video Modal */}
            {activeVideoId && (
                <VideoModal
                    videoId={activeVideoId}
                    title={activeVideoTitle}
                    onClose={() => setActiveVideoId(null)}
                />
            )}

            {/* Image Lightbox */}
            {lightboxIndex !== null && (
                <ImageLightbox
                    images={imageItems}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNav={setLightboxIndex}
                />
            )}

            <div className="bg-slate-50 py-16 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-extrabold text-slate-800">School Gallery</h1>
                        <p className="mt-2 text-slate-500">Browse photos and videos by event, year, or category</p>
                    </div>

                    {/* Breadcrumbs */}
                    <nav className="text-sm font-semibold text-slate-600 mb-8 flex items-center flex-wrap gap-1">
                        <button onClick={() => navigateToBreadcrumb(-1)} className="hover:text-sky-600 transition-colors">Gallery</button>
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
                        <div className="flex justify-center py-20"><SpinnerIcon className="w-10 h-10 text-sky-500" /></div>
                    ) : !isLeafNode ? (
                        /* Folder Grid */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {currentSubfolders.map(folder => {
                                const thumb = folderThumbs[folder.name] || folder.thumbnail;
                                const hasSubfolders = folder.subfolders && folder.subfolders.length > 0;
                                return (
                                    <div key={folder.name} onClick={() => navigateTo(folder.name)}
                                        className="aspect-square relative rounded-xl overflow-hidden shadow-md cursor-pointer group">
                                        {thumb ? (
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${thumb})` }} />
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
                        /* Items Grid (images + videos) */
                        itemsLoading ? (
                            <div className="flex justify-center py-20"><SpinnerIcon className="w-10 h-10 text-sky-500" /></div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-xl">
                                <FolderIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-semibold">No photos or videos in this folder yet.</p>
                                <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-slate-400 mb-4">
                                    {items.length} item{items.length !== 1 ? 's' : ''} —&nbsp;
                                    {imageItems.length} photo{imageItems.length !== 1 ? 's' : ''},&nbsp;
                                    {items.filter(i => i.type === 'video').length} video{items.filter(i => i.type === 'video').length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {items.map((item, idx) => (
                                        <div key={item.id} onClick={() => handleItemClick(item, idx)}
                                            className="aspect-square relative rounded-xl overflow-hidden shadow-md cursor-pointer group">

                                            {/* Thumbnail */}
                                            <img
                                                src={item.imageSrc}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />

                                            {/* Video play button overlay */}
                                            {item.type === 'video' ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                                                    <div className="bg-red-600/90 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </div>
                                                    {/* YouTube badge */}
                                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                                        YT
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Title/caption */}
                                            {(item.title || item.caption) && (
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    {item.title && <p className="text-white text-sm font-semibold truncate">{item.title}</p>}
                                                    {item.caption && <p className="text-slate-300 text-xs truncate">{item.caption}</p>}
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
