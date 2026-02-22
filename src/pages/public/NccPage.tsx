import React, { useState, useEffect, useRef } from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { SpinnerIcon, TrashIcon, CheckIcon, XIcon, PlusIcon } from '@/components/Icons';

interface NccPageProps {
    user: User | null;
}

interface GalleryImage {
    id: string;
    title: string;
    caption: string;
    imageSrc: string;
}

interface UploadItem {
    file: File;
    preview: string;
    title: string;
    caption: string;
    status: 'pending' | 'uploading' | 'done' | 'error';
}

const GALLERY_ID = 'ncc_gallery';

const NccPage: React.FC<NccPageProps> = ({ user }) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'user';

    // Gallery state
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true);

    // Lightbox
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Upload state
    const [isAdding, setIsAdding] = useState(false);
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCaption, setEditCaption] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Load images from Firestore
    useEffect(() => {
        const unsub = db.collection('website_content').doc(GALLERY_ID).onSnapshot(
            doc => {
                setImages(doc.exists ? (doc.data()?.items || []) : []);
                setIsLoadingImages(false);
            },
            () => setIsLoadingImages(false)
        );
        return () => unsub();
    }, []);

    // Keyboard nav for lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, images.length - 1) : null);
            if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIndex, images.length]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const items: UploadItem[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            caption: '',
            status: 'pending',
        }));
        setUploadItems(prev => [...prev, ...items]);
    };

    const handleUploadAll = async () => {
        if (!uploadItems.some(i => i.status === 'pending')) return;
        setIsUploading(true);
        const newImages = [...images];
        for (let i = 0; i < uploadItems.length; i++) {
            if (uploadItems[i].status !== 'pending') continue;
            setUploadProgress(`Uploading ${i + 1} of ${uploadItems.length}...`);
            setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'uploading' } : it));
            try {
                const resized = await resizeImage(uploadItems[i].file, 1200, 1200, 0.9);
                const url = await uploadToImgBB(resized);
                newImages.push({
                    id: `${Date.now()}_${i}`,
                    title: uploadItems[i].title || 'Untitled',
                    caption: uploadItems[i].caption || '',
                    imageSrc: url,
                });
                setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'done' } : it));
            } catch {
                setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error' } : it));
            }
        }
        await db.collection('website_content').doc(GALLERY_ID).set({ items: newImages }, { merge: true });
        setUploadProgress('');
        setIsUploading(false);
        setTimeout(() => {
            setUploadItems(prev => prev.filter(i => i.status === 'error'));
            setIsAdding(false);
        }, 800);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this image?')) return;
        const updated = images.filter(i => i.id !== id);
        await db.collection('website_content').doc(GALLERY_ID).set({ items: updated }, { merge: true });
    };

    const handleStartEdit = (img: GalleryImage) => {
        setEditingId(img.id);
        setEditTitle(img.title);
        setEditCaption(img.caption);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        setIsSavingEdit(true);
        try {
            const updated = images.map(img =>
                img.id === editingId ? { ...img, title: editTitle, caption: editCaption } : img
            );
            await db.collection('website_content').doc(GALLERY_ID).set({ items: updated }, { merge: true });
            setEditingId(null);
        } catch { alert('Failed to save.'); }
        finally { setIsSavingEdit(false); }
    };

    const pendingCount = uploadItems.filter(i => i.status === 'pending').length;

    return (
        <>
            {/* ── Lightbox ── */}
            {lightboxIndex !== null && images[lightboxIndex] && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightboxIndex(null)}>
                    <div className="relative max-w-5xl w-full flex flex-col items-center"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxIndex(null)}
                            className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light">✕</button>
                        <img src={images[lightboxIndex].imageSrc} alt={images[lightboxIndex].title}
                            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl" />
                        {(images[lightboxIndex].title || images[lightboxIndex].caption) && (
                            <div className="mt-4 text-center">
                                {images[lightboxIndex].title && <p className="text-white font-semibold text-lg">{images[lightboxIndex].title}</p>}
                                {images[lightboxIndex].caption && <p className="text-slate-300 text-sm mt-1">{images[lightboxIndex].caption}</p>}
                            </div>
                        )}
                        {lightboxIndex > 0 && (
                            <button onClick={() => setLightboxIndex(i => i! - 1)}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/70 hover:text-white text-5xl">‹</button>
                        )}
                        {lightboxIndex < images.length - 1 && (
                            <button onClick={() => setLightboxIndex(i => i! + 1)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/70 hover:text-white text-5xl">›</button>
                        )}
                        <p className="text-slate-400 text-sm mt-3">{lightboxIndex + 1} / {images.length}</p>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {editingId && (() => {
                const img = images.find(i => i.id === editingId);
                if (!img) return null;
                return (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingId(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className="bg-black flex items-center justify-center" style={{ maxHeight: '40vh' }}>
                                <img src={img.imageSrc} alt={img.title} className="max-h-64 max-w-full object-contain" />
                            </div>
                            <div className="p-6 space-y-4">
                                <h3 className="font-bold text-slate-800">Edit Image Details</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Title</label>
                                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                        placeholder="Image title" autoFocus />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Caption</label>
                                    <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400 resize-none"
                                        placeholder="Add a caption (optional)" rows={3} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setEditingId(null)}
                                        className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveEdit} disabled={isSavingEdit}
                                        className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50">
                                        {isSavingEdit ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="relative py-16">
                <div className="absolute inset-0">
                    <EditableContent
                        id="ncc_hero_bg"
                        defaultContent="https://i.ibb.co/Pv7Ywf08/481219402-1045908077568568-4366507493258612299-n.jpg"
                        type="image"
                        user={user}
                        className="w-full h-full object-cover bg-fixed"
                    />
                    <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                                <EditableContent id="ncc_title" defaultContent="National Cadet Corps (NCC)" type="text" user={user} />
                            </h1>
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <EditableContent id="ncc_content_p1" defaultContent="The National Cadet Corps (NCC) in our school serves as a platform for students who wish to cultivate discipline, leadership, and a spirit of service to the nation. Introduced in 2021, the NCC has become a preliminary training ground for young minds who aspire to contribute to society and the country with dedication and responsibility." type="textarea" user={user} />
                            <EditableContent id="ncc_content_p2" defaultContent="Since its establishment, the unit has successfully organized and participated in two training camps – in 2023 and 2025. These camps provided cadets with rigorous physical training, drills, and lessons in teamwork, all of which are essential qualities for shaping future leaders. Beyond the physical aspect, cadets also gained valuable exposure to values such as resilience, commitment, and patriotism." type="textarea" user={user} />
                            <EditableContent id="ncc_content_p3" defaultContent="Our cadets have consistently excelled and brought recognition to the school. In the 2023 training camp, Pausawmdawngzela was awarded the title of Best Junior Cadet, a proud achievement for both the individual and the institution. Continuing this tradition of excellence, in 2025, Thanglianzauva received the same honor, further highlighting the commitment and capabilities of our NCC students." type="textarea" user={user} />
                            <EditableContent id="ncc_content_p4" defaultContent="The school remains committed to supporting and strengthening the NCC program, seeing it not just as an extracurricular activity, but as a foundation for nurturing responsible citizens and inspiring future leaders. Through the NCC, our students are encouraged to embrace discipline, courage, and a lifelong passion for serving the nation." type="textarea" user={user} />
                        </div>

                        {/* ── Gallery Section ── */}
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    <EditableContent id="ncc_gallery_title" defaultContent="NCC in Pictures" type="text" user={user} />
                                </h2>
                                {isAdmin && (
                                    <button
                                        onClick={() => { setIsAdding(!isAdding); setUploadItems([]); }}
                                        className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Add Images
                                    </button>
                                )}
                            </div>

                            {/* Upload Panel — admin only */}
                            {isAdmin && isAdding && (
                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-6">
                                    <h3 className="font-bold text-slate-800 mb-3 text-sm">Upload Images</h3>
                                    <div
                                        className="border-2 border-dashed border-sky-300 rounded-lg p-5 text-center cursor-pointer hover:bg-sky-100 transition-colors mb-4"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <p className="text-sky-700 font-semibold text-sm">Click to select images</p>
                                        <p className="text-slate-400 text-xs mt-1">Hold Ctrl/Shift to select multiple</p>
                                        <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                                    </div>

                                    {uploadItems.length > 0 && (
                                        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                                            {uploadItems.map((item, i) => (
                                                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg border text-sm ${
                                                    item.status === 'done' ? 'bg-green-50 border-green-200' :
                                                    item.status === 'error' ? 'bg-red-50 border-red-200' :
                                                    item.status === 'uploading' ? 'bg-sky-50 border-sky-300' : 'bg-white border-slate-200'
                                                }`}>
                                                    <img src={item.preview} alt="" className="w-10 h-10 object-cover rounded flex-shrink-0" />
                                                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                        <input
                                                            type="text" value={item.title}
                                                            onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it))}
                                                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                            disabled={item.status !== 'pending'} placeholder="Title"
                                                        />
                                                        <input
                                                            type="text" value={item.caption}
                                                            onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, caption: e.target.value } : it))}
                                                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                            disabled={item.status !== 'pending'} placeholder="Caption (optional)"
                                                        />
                                                    </div>
                                                    <div className="w-16 text-center flex-shrink-0 text-xs font-semibold">
                                                        {item.status === 'pending' && <span className="text-slate-400">Ready</span>}
                                                        {item.status === 'uploading' && <SpinnerIcon className="w-4 h-4 text-sky-600 mx-auto" />}
                                                        {item.status === 'done' && <span className="text-green-600">✓ Done</span>}
                                                        {item.status === 'error' && <span className="text-red-600">✕ Failed</span>}
                                                    </div>
                                                    {item.status === 'pending' && (
                                                        <button onClick={() => setUploadItems(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="text-slate-300 hover:text-red-500 flex-shrink-0">
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">{pendingCount} image(s) ready</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setIsAdding(false); setUploadItems([]); }}
                                                className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100"
                                                disabled={isUploading}>
                                                Cancel
                                            </button>
                                            <button onClick={handleUploadAll}
                                                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                                                disabled={isUploading || pendingCount === 0}>
                                                {isUploading ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                                {isUploading ? uploadProgress : `Upload ${pendingCount} image(s)`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Image Grid */}
                            {isLoadingImages ? (
                                <div className="flex justify-center py-12">
                                    <SpinnerIcon className="w-8 h-8 text-sky-500" />
                                </div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                                    <p className="font-semibold">No photos yet.</p>
                                    {isAdmin && <p className="text-sm mt-1">Click "Add Images" above to upload.</p>}
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-400 mb-3">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                        {images.map((img, idx) => (
                                            <div key={img.id}
                                                className="relative aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer group"
                                                onClick={() => setLightboxIndex(idx)}
                                            >
                                                <img src={img.imageSrc} alt={img.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                {/* Caption overlay */}
                                                {(img.title || img.caption) && (
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                        {img.title && <p className="text-white text-sm font-semibold truncate">{img.title}</p>}
                                                        {img.caption && <p className="text-slate-300 text-xs truncate">{img.caption}</p>}
                                                    </div>
                                                )}
                                                {/* Admin controls */}
                                                {isAdmin && (
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={e => e.stopPropagation()}>
                                                        <button onClick={() => handleStartEdit(img)}
                                                            className="bg-sky-600 text-white p-1.5 rounded-full hover:bg-sky-700 shadow"
                                                            title="Edit caption">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(img.id)}
                                                            className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                                                            title="Delete">
                                                            <TrashIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NccPage;
