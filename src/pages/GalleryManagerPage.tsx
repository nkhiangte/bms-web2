import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { BackIcon, HomeIcon, PlusIcon, TrashIcon, SpinnerIcon, CheckIcon, XIcon } from '@/components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface GalleryManagerPageProps { user: User; }
interface GalleryImage { id: string; title: string; caption: string; imageSrc: string; }
interface GalleryFolder { name: string; subfolders?: GalleryFolder[]; }
interface UploadItem { file: File; preview: string; title: string; caption: string; status: 'pending' | 'uploading' | 'done' | 'error'; }

const FOLDERS_DOC_ID = 'gallery_folders';

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

// Flatten folder tree into a list with depth info
const getFlatPaths = (folders: GalleryFolder[], parent: string[] = []): { path: string[]; depth: number }[] => {
    const result: { path: string[]; depth: number }[] = [];
    for (const f of folders) {
        const path = [...parent, f.name];
        result.push({ path, depth: parent.length });
        if (f.subfolders) result.push(...getFlatPaths(f.subfolders, path));
    }
    return result;
};

const pathToId = (path: string[]) =>
    `gallery_${path.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`;

// Add a new folder at the given parent path in the tree
const addFolderToTree = (folders: GalleryFolder[], parentPath: string[], newName: string): GalleryFolder[] => {
    if (parentPath.length === 0) return [...folders, { name: newName, subfolders: [] }];
    return folders.map(f => f.name === parentPath[0]
        ? { ...f, subfolders: addFolderToTree(f.subfolders || [], parentPath.slice(1), newName) }
        : f);
};

// Remove a folder at the given path from the tree
const deleteFolderFromTree = (folders: GalleryFolder[], path: string[]): GalleryFolder[] => {
    if (path.length === 1) return folders.filter(f => f.name !== path[0]);
    return folders.map(f => f.name === path[0]
        ? { ...f, subfolders: deleteFolderFromTree(f.subfolders || [], path.slice(1)) }
        : f);
};

// Inline folder icon component with explicit fixed size - avoids CSS class issues
const FolderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        className={className} width="16" height="16" style={{ minWidth: 'auto', maxWidth: 'none' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

const GalleryManagerPage: React.FC<GalleryManagerPageProps> = ({ user }) => {
    const navigate = useNavigate();

    // Folder tree state - starts with defaults, then syncs from Firestore
    const [folderTree, setFolderTree] = useState<GalleryFolder[]>(DEFAULT_FOLDERS);
    const [folderTreeLoaded, setFolderTreeLoaded] = useState(false);

    // Selection & image state
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    // Upload state
    const [isAdding, setIsAdding] = useState(false);
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Folder creation state
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderParentPath, setNewFolderParentPath] = useState<string[]>([]);
    const [isSavingFolder, setIsSavingFolder] = useState(false);

    const allEntries = getFlatPaths(folderTree);
    const selectedId = selectedPath.length ? pathToId(selectedPath) : '';

    // Load folder structure from Firestore (if saved), fallback to defaults
    useEffect(() => {
        const unsub = db.collection('website_content').doc(FOLDERS_DOC_ID).onSnapshot(
            doc => {
                if (doc.exists && doc.data()?.folders) {
                    setFolderTree(doc.data()!.folders);
                }
                setFolderTreeLoaded(true);
            },
            () => setFolderTreeLoaded(true) // on error, still show defaults
        );
        return () => unsub();
    }, []);

    // Load images for selected folder
    useEffect(() => {
        if (!selectedId) return;
        setIsLoadingImages(true);
        const unsub = db.collection('website_content').doc(selectedId).onSnapshot(
            doc => { setImages(doc.exists ? (doc.data()?.items || []) : []); setIsLoadingImages(false); },
            () => setIsLoadingImages(false)
        );
        return () => unsub();
    }, [selectedId]);

    const saveFolderTree = async (tree: GalleryFolder[]) => {
        await db.collection('website_content').doc(FOLDERS_DOC_ID).set({ folders: tree }, { merge: true });
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return alert('Please enter a folder name.');
        setIsSavingFolder(true);
        try {
            const newTree = addFolderToTree(folderTree, newFolderParentPath, newFolderName.trim());
            setFolderTree(newTree);
            await saveFolderTree(newTree);
            setNewFolderName('');
            setIsCreatingFolder(false);
        } catch { alert('Failed to save folder. Check Firestore permissions.'); }
        finally { setIsSavingFolder(false); }
    };

    const handleDeleteFolder = async (path: string[]) => {
        const name = path[path.length - 1];
        if (!window.confirm(`Delete folder "${name}"? Images inside will NOT be deleted from ImgBB.`)) return;
        const newTree = deleteFolderFromTree(folderTree, path);
        setFolderTree(newTree);
        await saveFolderTree(newTree);
        // Deselect if we deleted the selected folder or a parent of it
        if (selectedPath.slice(0, path.length).join('/') === path.join('/')) {
            setSelectedPath([]);
        }
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const items: UploadItem[] = files.map(file => ({
            file, preview: URL.createObjectURL(file),
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
        await db.collection('website_content').doc(selectedId).set({ items: newImages }, { merge: true });
        setUploadProgress('');
        setIsUploading(false);
        setTimeout(() => {
            setUploadItems(prev => prev.filter(i => i.status === 'error'));
            if (!uploadItems.some(i => i.status === 'error')) setIsAdding(false);
        }, 1000);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this image from the gallery?')) return;
        const updated = images.filter(i => i.id !== id);
        await db.collection('website_content').doc(selectedId).set({ items: updated }, { merge: true });
    };

    const pendingCount = uploadItems.filter(i => i.status === 'pending').length;

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCaption, setEditCaption] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const handleStartEdit = (img: GalleryImage) => {
        setEditingId(img.id);
        setEditTitle(img.title);
        setEditCaption(img.caption);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        setIsSavingEdit(true);
        try {
            const updated = images.map(img => img.id === editingId
                ? { ...img, title: editTitle, caption: editCaption }
                : img);
            await db.collection('website_content').doc(selectedId).set({ items: updated }, { merge: true });
            setEditingId(null);
        } catch { alert('Failed to save.'); }
        finally { setIsSavingEdit(false); }
    };

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

            <h1 className="text-2xl font-bold text-slate-800 mb-1">Gallery Manager</h1>
            <p className="text-slate-500 text-sm mb-6">Select a folder · Upload multiple images at once · Images go to ImgBB · URLs saved to Firebase</p>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* ===== LEFT: Folder Tree ===== */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="font-bold text-slate-700 text-sm">Folders</h2>
                            <button
                                onClick={() => { setIsCreatingFolder(true); setNewFolderParentPath([]); setNewFolderName(''); }}
                                title="Add new top-level folder"
                                className="text-sky-600 hover:text-sky-800 p-0.5 rounded"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Folder list */}
                        <div className="overflow-y-auto max-h-[480px]">
                            {allEntries.map(({ path, depth }) => {
                                const isSelected = JSON.stringify(selectedPath) === JSON.stringify(path);
                                const label = path[path.length - 1];
                                return (
                                    <div key={path.join('/')} className="group flex items-center border-b border-slate-100 last:border-0">
                                        <button
                                            onClick={() => { setSelectedPath(path); setIsAdding(false); setUploadItems([]); }}
                                            className={`flex-1 flex items-center gap-2 py-2 pr-2 text-sm transition-colors min-w-0 ${
                                                isSelected ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-sky-50 text-slate-700'
                                            }`}
                                            style={{ paddingLeft: `${depth * 14 + 12}px` }}
                                        >
                                            <span className="flex-shrink-0" style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                                                <FolderIcon className={isSelected ? 'text-white' : 'text-slate-400'} />
                                            </span>
                                            <span className="truncate">{label}</span>
                                        </button>
                                        {/* Hover actions */}
                                        <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                            <button
                                                onClick={() => { setIsCreatingFolder(true); setNewFolderParentPath(path); setNewFolderName(''); }}
                                                title="Add subfolder"
                                                className="p-1 text-slate-400 hover:text-sky-600 rounded"
                                            >
                                                <PlusIcon className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFolder(path)}
                                                title="Delete folder"
                                                className="p-1 text-slate-400 hover:text-red-500 rounded"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Create folder form */}
                        {isCreatingFolder && (
                            <div className="p-3 border-t border-slate-200 bg-white">
                                <p className="text-xs font-semibold text-slate-500 mb-2">
                                    {newFolderParentPath.length === 0
                                        ? 'New top-level folder'
                                        : `Subfolder in: ${newFolderParentPath[newFolderParentPath.length - 1]}`}
                                </p>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    placeholder="Folder name..."
                                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-2 focus:outline-none focus:border-sky-400"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateFolder}
                                        disabled={isSavingFolder}
                                        className="flex items-center gap-1 bg-sky-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-sky-700 disabled:opacity-50"
                                    >
                                        {isSavingFolder ? <SpinnerIcon className="w-3 h-3" /> : <CheckIcon className="w-3 h-3" />}
                                        Create
                                    </button>
                                    <button
                                        onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                                        className="text-xs px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== RIGHT: Image Panel ===== */}
                <div className="flex-1 min-w-0">
                    {!selectedPath.length ? (
                        <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="40" height="40">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                            </svg>
                            <p className="font-semibold text-sm">← Select a folder from the list</p>
                        </div>
                    ) : (
                        <>
                            {/* Folder header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{selectedPath[selectedPath.length - 1]}</h2>
                                    <p className="text-xs text-slate-400">{selectedPath.join(' › ')}</p>
                                </div>
                                <button
                                    onClick={() => { setIsAdding(!isAdding); setUploadItems([]); }}
                                    className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4" /> Add Images
                                </button>
                            </div>

                            {/* Upload panel */}
                            {isAdding && (
                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-5">
                                    <h3 className="font-bold text-slate-800 mb-3 text-sm">
                                        Upload to "{selectedPath[selectedPath.length - 1]}"
                                    </h3>

                                    {/* Drop zone */}
                                    <div
                                        className="border-2 border-dashed border-sky-300 rounded-lg p-5 text-center cursor-pointer hover:bg-sky-100 transition-colors mb-4"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <p className="text-sky-700 font-semibold text-sm">Click to select images</p>
                                        <p className="text-slate-400 text-xs mt-1">Hold Ctrl or Shift to select multiple files at once</p>
                                        <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                                    </div>

                                    {/* Upload queue */}
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
                                                            type="text"
                                                            value={item.title}
                                                            onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it))}
                                                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                            disabled={item.status !== 'pending'}
                                                            placeholder="Title"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.caption}
                                                            onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, caption: e.target.value } : it))}
                                                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                            disabled={item.status !== 'pending'}
                                                            placeholder="Caption (optional)"
                                                        />
                                                    </div>
                                                    <div className="w-16 text-center flex-shrink-0 text-xs font-semibold">
                                                        {item.status === 'pending' && <span className="text-slate-400">Ready</span>}
                                                        {item.status === 'uploading' && <SpinnerIcon className="w-4 h-4 text-sky-600 mx-auto" />}
                                                        {item.status === 'done' && <span className="text-green-600">✓ Done</span>}
                                                        {item.status === 'error' && <span className="text-red-600">✕ Failed</span>}
                                                    </div>
                                                    {item.status === 'pending' && (
                                                        <button
                                                            onClick={() => setUploadItems(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="text-slate-300 hover:text-red-500 flex-shrink-0"
                                                        >
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">{pendingCount} image(s) ready to upload</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setIsAdding(false); setUploadItems([]); }}
                                                className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100"
                                                disabled={isUploading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUploadAll}
                                                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                                                disabled={isUploading || pendingCount === 0}
                                            >
                                                {isUploading ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                                {isUploading ? uploadProgress : `Upload ${pendingCount} image(s)`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Image grid */}
                            {isLoadingImages ? (
                                <div className="flex justify-center py-10"><SpinnerIcon className="w-7 h-7 text-sky-500" /></div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                                    <p className="font-semibold text-sm">No images in this folder yet</p>
                                    <p className="text-xs mt-1">Click "Add Images" above to upload</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-400 mb-3">{images.length} image(s) in this folder</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {images.map(img => (
                                            <div key={img.id}
                                                className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-pointer"
                                                onClick={() => handleStartEdit(img)}
                                            >
                                                <img src={img.imageSrc} alt={img.title} className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                                    <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                                                    {img.caption && <p className="text-slate-300 text-xs truncate">{img.caption}</p>}
                                                </div>
                                                <div className="absolute top-1.5 right-1.5">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleDelete(img.id); }}
                                                        className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                                                        title="Delete image"
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Lightbox / Edit Modal */}
                                        {editingId && (() => {
                                            const img = images.find(i => i.id === editingId);
                                            if (!img) return null;
                                            return (
                                                <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
                                                    onClick={() => setEditingId(null)}>
                                                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                                                        onClick={e => e.stopPropagation()}>
                                                        {/* Image */}
                                                        <div className="flex-1 bg-black flex items-center justify-center min-h-0" style={{maxHeight: '60vh'}}>
                                                            <img src={img.imageSrc} alt={img.title}
                                                                className="max-w-full max-h-full object-contain" />
                                                        </div>
                                                        {/* Edit fields */}
                                                        <div className="p-5 space-y-3 border-t border-slate-200">
                                                            <h3 className="font-bold text-slate-800 text-sm">Edit Details</h3>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={editTitle}
                                                                    onChange={e => setEditTitle(e.target.value)}
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                                                    placeholder="Image title"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Caption</label>
                                                                <textarea
                                                                    value={editCaption}
                                                                    onChange={e => setEditCaption(e.target.value)}
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400 resize-none"
                                                                    placeholder="Add a caption (optional)"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <div className="flex justify-end gap-3 pt-1">
                                                                <button onClick={() => setEditingId(null)}
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
                                            );
                                        })()}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryManagerPage;
