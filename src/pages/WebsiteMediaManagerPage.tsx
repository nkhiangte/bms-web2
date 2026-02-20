import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { BackIcon, HomeIcon, PlusIcon, TrashIcon, SpinnerIcon, CheckIcon, XIcon } from '@/components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface WebsiteMediaManagerPageProps { user: User; }
interface MediaImage { id: string; title: string; caption: string; imageSrc: string; }
interface UploadItem { file: File; preview: string; title: string; caption: string; status: 'pending' | 'uploading' | 'done' | 'error'; }

const SECTIONS = [
    { id: 'ncc_gallery',          label: 'NCC',                    path: '/ncc' },
    { id: 'arts_culture_gallery', label: 'Arts & Culture',         path: '/arts-culture' },
    { id: 'eco_club_gallery',     label: 'Eco Club',               path: '/eco-club' },
    { id: 'hostel_life_gallery',  label: 'Hostel Life',            path: '/hostel' },
    { id: 'infrastructure_grid',  label: 'Campus & Infrastructure', path: '/infrastructure' },
];

const WebsiteMediaManagerPage: React.FC<WebsiteMediaManagerPageProps> = ({ user }) => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
    const [images, setImages] = useState<MediaImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Lightbox / edit state
    const [editingImg, setEditingImg] = useState<MediaImage | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCaption, setEditCaption] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setIsAdding(false);
        setUploadItems([]);
        const unsub = db.collection('website_content').doc(selectedSection.id).onSnapshot(
            doc => { setImages(doc.exists ? (doc.data()?.items || []) : []); setIsLoading(false); },
            () => setIsLoading(false)
        );
        return () => unsub();
    }, [selectedSection.id]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadItems(prev => [...prev, ...files.map(file => ({
            file, preview: URL.createObjectURL(file),
            title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            caption: '', status: 'pending' as const,
        }))]);
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
                newImages.push({ id: `${Date.now()}_${i}`, title: uploadItems[i].title || 'Untitled', caption: uploadItems[i].caption, imageSrc: url });
                setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'done' } : it));
            } catch {
                setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error' } : it));
            }
        }
        await db.collection('website_content').doc(selectedSection.id).set({ items: newImages }, { merge: true });
        setUploadProgress(''); setIsUploading(false);
        setTimeout(() => { setUploadItems(prev => prev.filter(i => i.status === 'error')); setIsAdding(false); }, 1000);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this image?')) return;
        const updated = images.filter(i => i.id !== id);
        await db.collection('website_content').doc(selectedSection.id).set({ items: updated }, { merge: true });
    };

    const handleOpenEdit = (img: MediaImage) => {
        setEditingImg(img);
        setEditTitle(img.title);
        setEditCaption(img.caption);
    };

    const handleSaveEdit = async () => {
        if (!editingImg) return;
        setIsSavingEdit(true);
        try {
            const updated = images.map(img => img.id === editingImg.id ? { ...img, title: editTitle, caption: editCaption } : img);
            await db.collection('website_content').doc(selectedSection.id).set({ items: updated }, { merge: true });
            setEditingImg(null);
        } catch { alert('Failed to save.'); }
        finally { setIsSavingEdit(false); }
    };

    const pendingCount = uploadItems.filter(i => i.status === 'pending').length;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="mb-5 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-4 h-4" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                    <HomeIcon className="w-4 h-4" /> Home
                </Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Website Media Manager</h1>
            <p className="text-slate-500 text-sm mb-6">Manage images for public website pages · Click image to enlarge and edit</p>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Section Tabs */}
                <div className="lg:w-56 flex-shrink-0">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                            <h2 className="font-bold text-slate-700 text-sm">Pages</h2>
                        </div>
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setSelectedSection(section)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-slate-100 last:border-0 transition-colors ${
                                    selectedSection.id === section.id ? 'bg-sky-600 text-white' : 'hover:bg-sky-50 text-slate-700'
                                }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                    <a href={selectedSection.path} target="_blank" rel="noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 text-xs text-sky-600 hover:underline py-2">
                        View live page ↗
                    </a>
                </div>

                {/* Image Panel */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{selectedSection.label}</h2>
                            <p className="text-xs text-slate-400">{images.length} image(s)</p>
                        </div>
                        <button onClick={() => { setIsAdding(!isAdding); setUploadItems([]); }}
                            className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors">
                            <PlusIcon className="w-4 h-4" /> Add Images
                        </button>
                    </div>

                    {/* Upload Panel */}
                    {isAdding && (
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-5">
                            <h3 className="font-bold text-slate-800 mb-3 text-sm">Upload to "{selectedSection.label}"</h3>
                            <div className="border-2 border-dashed border-sky-300 rounded-lg p-5 text-center cursor-pointer hover:bg-sky-100 transition-colors mb-4"
                                onClick={() => fileInputRef.current?.click()}>
                                <p className="text-sky-700 font-semibold text-sm">Click to select images</p>
                                <p className="text-slate-400 text-xs mt-1">Hold Ctrl or Shift to select multiple files</p>
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
                                                <input type="text" value={item.title}
                                                    onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it))}
                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                    disabled={item.status !== 'pending'} placeholder="Title" />
                                                <input type="text" value={item.caption}
                                                    onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, caption: e.target.value } : it))}
                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                    disabled={item.status !== 'pending'} placeholder="Caption (optional)" />
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
                                        className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100" disabled={isUploading}>
                                        Cancel
                                    </button>
                                    <button onClick={handleUploadAll}
                                        className="flex items-center gap-2 bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                                        disabled={isUploading || pendingCount === 0}>
                                        {isUploading ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                        {isUploading ? uploadProgress : `Upload ${pendingCount}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-10"><SpinnerIcon className="w-7 h-7 text-sky-500" /></div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                            <p className="font-semibold text-sm">No images yet for {selectedSection.label}</p>
                            <p className="text-xs mt-1">Click "Add Images" to upload</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {images.map(img => (
                                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-pointer"
                                    onClick={() => handleOpenEdit(img)}>
                                    <img src={img.imageSrc} alt={img.title} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                        <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                                        {img.caption && <p className="text-slate-300 text-xs truncate">{img.caption}</p>}
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(img.id); }}
                                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                                        title="Delete">
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox / Edit Modal */}
            {editingImg && (
                <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
                    onClick={() => setEditingImg(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex-1 bg-black flex items-center justify-center min-h-0" style={{ maxHeight: '60vh' }}>
                            <img src={editingImg.imageSrc} alt={editingImg.title} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="p-5 space-y-3 border-t border-slate-200">
                            <h3 className="font-bold text-slate-800 text-sm">Edit Details</h3>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                    placeholder="Image title" autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Caption</label>
                                <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400 resize-none"
                                    placeholder="Add a caption (optional)" rows={2} />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button onClick={() => setEditingImg(null)}
                                    className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100">
                                    Close
                                </button>
                                <button onClick={handleSaveEdit} disabled={isSavingEdit}
                                    className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50">
                                    {isSavingEdit ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebsiteMediaManagerPage;
