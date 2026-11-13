import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FolderIcon, SpinnerIcon } from '@/components/Icons';
import { User } from '@/types';
import { db } from '@/firebaseConfig';

const { useNavigate, useParams } = ReactRouterDOM as any;

interface GalleryItem { id: string; title: string; caption: string; imageSrc?: string; type?: 'image' | 'video'; videoUrl?: string; }
interface GalleryFolder { name: string; thumbnail?: string; subfolders?: GalleryFolder[]; }

const FOLDERS_DOC_ID = 'gallery_folders';
const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pathToId = (path: string[]) => `gallery_${path.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`;
const getYouTubeId = (url: string): string | null => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/];
    for (const pattern of patterns) { const match = url.match(pattern); if (match) return match[1]; }
    return null;
};

const DEFAULT_FOLDERS: GalleryFolder[] = [
    { name: 'By Event/Occasion', subfolders: [{ name: 'Annual Day' }, { name: 'Sports Day' }, { name: 'Science Fair', subfolders: [{ name: 'Science Exhibition' }, { name: 'Science Congress' }, { name: 'Inspire Award Manak' }] }, { name: 'Independence Day' }, { name: 'Teachers Day' }, { name: 'Cultural Programs' }, { name: 'Competitions' }, { name: 'Field Trips', subfolders: [{ name: 'Eco-Club' }] }] },
    { name: 'By Year', subfolders: [{ name: '2025 Events' }, { name: '2024 Events' }, { name: '2023 Events' }] },
    { name: 'By Category', subfolders: [{ name: 'Students', subfolders: [{ name: 'Nursery' }, { name: 'Kindergarten' }, { name: 'Class I' }, { name: 'Class II' }, { name: 'Class III' }, { name: 'Class IV' }, { name: 'Class V' }, { name: 'Class VI' }, { name: 'Class VII' }, { name: 'Class VIII' }, { name: 'Class IX' }, { name: 'Class X' }] }, { name: 'Campus & Infrastructure' }, { name: 'Classrooms' }, { name: 'Achievements' }, { name: 'Activities' }, { name: 'Alumni' }] }
];

const VideoModal: React.FC<{ videoId: string; title: string; onClose: () => void }> = ({ videoId, title, onClose }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
    return (
        <div className="fixed inset-0 bg-[#07162B]/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close video" className="absolute -top-11 right-0 text-white/80 hover:text-[#DFC06B] text-3xl font-light">&times;</button>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe className="absolute inset-0 w-full h-full rounded-xl border border-[#C9A84C]/40" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                {title && <p className="text-white font-bold text-center mt-4">{title}</p>}
            </div>
        </div>
    );
};

const ImageLightbox: React.FC<{ images: GalleryItem[]; index: number; onClose: () => void; onNav: (i: number) => void; }> = ({ images, index, onClose, onNav }) => {
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
        <div className="fixed inset-0 bg-[#07162B]/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close image" className="absolute -top-11 right-0 text-white/80 hover:text-[#DFC06B] text-3xl font-light">&times;</button>
                <img src={img.imageSrc} alt={img.title} decoding="async" className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-[#C9A84C]/30" referrerPolicy="no-referrer" />
                {(img.title || img.caption) && (
                    <div className="mt-4 text-center">
                        {img.title && <p className="text-white font-bold text-lg">{img.title}</p>}
                        {img.caption && <p className="text-white/75 text-sm mt-1">{img.caption}</p>}
                    </div>
                )}
                {index > 0 && <button onClick={() => onNav(index - 1)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0B1F3A]/85 border border-[#C9A84C]/50 text-white hover:text-[#DFC06B] text-3xl flex items-center justify-center">&lsaquo;</button>}
                {index < images.length - 1 && <button onClick={() => onNav(index + 1)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0B1F3A]/85 border border-[#C9A84C]/50 text-white hover:text-[#DFC06B] text-3xl flex items-center justify-center">&rsaquo;</button>}
                <p className="font-tabular text-white/60 text-sm mt-3">{index + 1} / {images.length}</p>
            </div>
        </div>
    );
};

interface GalleryPageProps { user: User | null; }

const GalleryPage: React.FC<GalleryPageProps> = () => {
    const navigate = useNavigate();
    const params = useParams();
    const slugPath: string = (params['*'] || '').replace(/^\/+|\/+$/g, '');
    const [folderTree, setFolderTree] = useState<GalleryFolder[]>(DEFAULT_FOLDERS);
    const [folderTreeLoading, setFolderTreeLoading] = useState(true);
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [activeVideoTitle, setActiveVideoTitle] = useState('');
    const [folderThumbs, setFolderThumbs] = useState<Record<string, string>>({});

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [slugPath]);

    useEffect(() => {
        const unsub = db.collection('website_content').doc(FOLDERS_DOC_ID).onSnapshot(
            doc => { if (doc.exists && doc.data()?.folders) setFolderTree(doc.data()!.folders); setFolderTreeLoading(false); },
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
    const navigateTo = (folderName: string) => { const newSlug = [...currentPath, folderName].map(toSlug).join('/'); navigate(`/gallery/${newSlug}`); };
    const navigateToBreadcrumb = (index: number) => { if (index < 0) navigate('/gallery'); else navigate(`/gallery/${currentPath.slice(0, index + 1).map(toSlug).join('/')}`); };

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
        const findThumbRecursive = async (path: string[], subfolders: GalleryFolder[]): Promise<string | null> => {
            const id = pathToId(path);
            try {
                const doc = await db.collection('website_content').doc(id).get();
                const folderItems: GalleryItem[] = doc.exists ? (doc.data()?.items || []) : [];
                const imageItem = folderItems.find(i => i.type !== 'video' && i.imageSrc);
                if (imageItem?.imageSrc) return imageItem.imageSrc;
            } catch {}
            for (const sub of subfolders) { const result = await findThumbRecursive([...path, sub.name], sub.subfolders || []); if (result) return result; }
            return null;
        };
        currentSubfolders.forEach(async folder => {
            const path = [...currentPath, folder.name];
            const thumb = await findThumbRecursive(path, folder.subfolders || []);
            if (thumb) setFolderThumbs(prev => ({ ...prev, [folder.name]: thumb }));
        });
    }, [currentSubfolders]);

    const imageItems = items.filter(i => i.type !== 'video');
    const handleItemClick = (item: GalleryItem) => {
        if (item.type === 'video' && item.videoUrl) {
            const ytId = getYouTubeId(item.videoUrl);
            if (ytId) { setActiveVideoId(ytId); setActiveVideoTitle(item.title); }
        } else {
            const imageIdx = imageItems.findIndex(i => i.id === item.id);
            if (imageIdx !== -1) setLightboxIndex(imageIdx);
        }
    };

    return (
        <>
            {activeVideoId && <VideoModal videoId={activeVideoId} title={activeVideoTitle} onClose={() => setActiveVideoId(null)} />}
            {lightboxIndex !== null && <ImageLightbox images={imageItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={setLightboxIndex} />}
            <div className="bg-[#0B1F3A] py-12 sm:py-16 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Campus Memories</p>
                        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">School Gallery</h1>
                        <p className="mt-2 text-white/75 text-sm sm:text-base">Browse photos and videos by event, year, or category</p>
                    </div>
                    <nav className="text-sm font-bold text-white/75 mb-8 flex items-center flex-wrap gap-1.5">
                        <button onClick={() => navigateToBreadcrumb(-1)} className="hover:text-[#DFC06B] transition-colors">Gallery</button>
                        {currentPath.map((folder, index) => (
                            <React.Fragment key={folder}>
                                <span className="text-white/40">/</span>
                                <button onClick={() => navigateToBreadcrumb(index)} className={`hover:text-[#DFC06B] transition-colors ${index === currentPath.length - 1 ? 'text-[#DFC06B]' : ''}`}>{folder}</button>
                            </React.Fragment>
                        ))}
                    </nav>
                    {folderTreeLoading ? (
                        <div className="flex justify-center py-20"><SpinnerIcon className="w-10 h-10 text-[#C9A84C]" /></div>
                    ) : !isLeafNode ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {currentSubfolders.map(folder => {
                                const thumb = folderThumbs[folder.name] || folder.thumbnail;
                                const hasSubfolders = folder.subfolders && folder.subfolders.length > 0;
                                return (
                                    <div key={folder.name} onClick={() => navigateTo(folder.name)} className="aspect-square relative rounded-xl overflow-hidden shadow-md cursor-pointer group border border-white/15 hover:border-[#C9A84C] transition-colors">
                                        {thumb ? (
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundImage: `url(${thumb})` }} />
                                        ) : (
                                            <div className="absolute inset-0 bg-[#132D52] flex items-center justify-center"><FolderIcon className="w-16 h-16 text-[#C9A84C]/50" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#07162B]/90 via-[#07162B]/30 to-transparent" />
                                        <div className="relative z-10 h-full flex flex-col justify-end p-4 text-white">
                                            <FolderIcon className="w-6 h-6 text-[#DFC06B] mb-1" />
                                            <h3 className="font-bold text-base leading-tight">{folder.name}</h3>
                                            {hasSubfolders && <p className="text-xs text-white/70 mt-0.5 font-tabular">{folder.subfolders!.length} subfolder{folder.subfolders!.length !== 1 ? 's' : ''}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        itemsLoading ? (
                            <div className="flex justify-center py-20"><SpinnerIcon className="w-10 h-10 text-[#C9A84C]" /></div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-24 border-2 border-dashed border-[#C9A84C]/35 rounded-xl bg-[#132D52]">
                                <FolderIcon className="w-12 h-12 text-[#DFC06B]/60 mx-auto mb-3" />
                                <p className="text-white font-bold">No photos or videos in this folder yet.</p>
                                <p className="text-white/65 text-sm mt-1">Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                <p className="font-tabular text-sm text-[#DFC06B] mb-4 font-semibold">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {items.map((item) => (
                                        <div key={item.id} onClick={() => handleItemClick(item)} className="aspect-square relative rounded-xl overflow-hidden shadow-md cursor-pointer group border border-white/15 hover:border-[#C9A84C] transition-colors bg-[#132D52]">
                                            <img src={item.imageSrc} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                                            {item.type === 'video' ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-[#07162B]/40 group-hover:bg-[#07162B]/60 transition-colors duration-300">
                                                    <div className="bg-[#C9A84C] rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        <svg className="w-8 h-8 text-[#0B1F3A]" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-[#07162B]/0 group-hover:bg-[#07162B]/35 transition-colors duration-300" />
                                            )}
                                            {(item.title || item.caption) && (
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#07162B]/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    {item.title && <p className="text-white text-sm font-bold truncate">{item.title}</p>}
                                                    {item.caption && <p className="text-white/75 text-xs truncate">{item.caption}</p>}
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
