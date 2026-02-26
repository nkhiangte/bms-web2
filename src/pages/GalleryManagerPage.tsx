import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { db, storage } from '@/firebaseConfig';
import { resizeImage } from '@/utils';
import { BackIcon, HomeIcon, PlusIcon, TrashIcon, SpinnerIcon, CheckIcon, XIcon } from '@/components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface GalleryManagerPageProps { user: User; }
interface GalleryItem {
    id: string;
    title: string;
    caption: string;
    imageSrc?: string;
    type?: 'image' | 'video';
    videoUrl?: string;
    year?: string; // ← NEW: year tag for filtering (e.g. "2025")
}
interface GalleryFolder { name: string; subfolders?: GalleryFolder[]; }
interface UploadItem {
    file: File;
    preview: string;
    title: string;
    caption: string;
    year: string; // ← NEW
    status: 'pending' | 'uploading' | 'done' | 'error';
}

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

const addFolderToTree = (folders: GalleryFolder[], parentPath: string[], newName: string): GalleryFolder[] => {
    if (parentPath.length === 0) return [...folders, { name: newName, subfolders: [] }];
    return folders.map(f => f.name === parentPath[0]
        ? { ...f, subfolders: addFolderToTree(f.subfolders || [], parentPath.slice(1), newName) }
        : f);
};

const deleteFolderFromTree = (folders: GalleryFolder[], path: string[]): GalleryFolder[] => {
    if (path.length === 1) return folders.filter(f => f.name !== path[0]);
    return folders.map(f => f.name === path[0]
        ? { ...f, subfolders: deleteFolderFromTree(f.subfolders || [], path.slice(1)) }
        : f);
};

const uploadToFirebaseStorage = async (file: File, folderPath: string[]): Promise<string> => {
    const folder = folderPath.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('/');
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = storage.ref(`gallery/${folder}/${fileName}`);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
};

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

const getYouTubeThumbnail = (videoId: string) =>
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

const FolderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        className={className} width="16" height="16" style={{ minWidth: 'auto', maxWidth: 'none' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

const GalleryManagerPage: React.FC<GalleryManagerPageProps> = ({ user }) => {
    const navigate = useNavigate();

    const [folderTree, setFolderTree] = useState<GalleryFolder[]>(DEFAULT_FOLDERS);
    const [folderTreeLoaded, setFolderTreeLoaded] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    // Upload state
    const [isAdding, setIsAdding] = useState(false);
    const [addMode, setAddMode] = useState<'image' | 'video'>('image');
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Video add state
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [videoCaption, setVideoCaption] = useState('');
    const [videoYear, setVideoYear] = useState(''); // ← NEW
    const [isSavingVideo, setIsSavingVideo] = useState(false);
    const [videoPreviewId, setVideoPreviewId] = useState<string | null>(null);

    // Folder creation state
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderParentPath, setNewFolderParentPath] = useState<string[]>([]);
    const [isSavingFolder, setIsSavingFolder] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCaption, setEditCaption] = useState('');
    const [editYear, setEditYear] = useState(''); // ← NEW
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const allEntries = getFlatPaths(folderTree);
    const selectedId = selectedPath.length ? pathToId(selectedPath) : '';

    useEffect(() => {
        const unsub = db.collection('website_content').doc(FOLDERS_DOC_ID).onSnapshot(
            doc => {
                if (doc.exists && doc.data()?.folders) setFolderTree(doc.data()!.folders);
                setFolderTreeLoaded(true);
            },
            () => setFolderTreeLoaded(true)
        );
        return () => unsub();
    }, []);

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
        } catch { alert('Failed to save folder.'); }
        finally { setIsSavingFolder(false); }
    };

    const handleDeleteFolder = async (path: string[]) => {
        const name = path[path.length - 1];
        if (!window.confirm(`Delete folder "${name}"? Images inside will NOT be deleted from Firebase Storage.`)) return;
        const newTree = deleteFolderFromTree(folderTree, path);
        setFolderTree(newTree);
        await saveFolderTree(newTree);
        if (selectedPath.slice(0, path.length).join('/') === path.join('/')) setSelectedPath([]);
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const items: UploadItem[] = files.map(file => ({
            file, preview: URL.createObjectURL(file),
            title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            caption: '',
            year: '', // ← NEW
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
                const fetchRes = await fetch(resized);
                const blob = await fetchRes.blob();
                const resizedFile = new File([blob], uploadItems[i].file.name, { type: blob.type || 'image/jpeg' });
                const url = await uploadToFirebaseStorage(resizedFile, selectedPath);
                newImages.push({
                    id: `${Date.now()}_${i}`,
                    title: uploadItems[i].title || 'Untitled',
                    caption: uploadItems[i].caption || '',
                    year: uploadItems[i].year || '', // ← NEW
                    imageSrc: url,
                    type: 'image',
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

    const handleVideoUrlChange = (url: string) => {
        setVideoUrl(url);
        const id = getYouTubeId(url);
        setVideoPreviewId(id);
    };

    const handleAddVideo = async () => {
        if (!videoPreviewId) return alert('Please enter a valid YouTube URL.');
        if (!videoTitle.trim()) return alert('Please enter a title for the video.');
        setIsSavingVideo(true);
        try {
            const newItem: GalleryItem = {
                id: `video_${Date.now()}`,
                title: videoTitle.trim(),
                caption: videoCaption.trim(),
                year: videoYear.trim(), // ← NEW
                type: 'video',
                videoUrl: `https://www.youtube.com/watch?v=${videoPreviewId}`,
                imageSrc: getYouTubeThumbnail(videoPreviewId),
            };
            const newItems = [...images, newItem];
            await db.collection('website_content').doc(selectedId).set({ items: newItems }, { merge: true });
            setVideoUrl('');
            setVideoTitle('');
            setVideoCaption('');
            setVideoYear(''); // ← NEW
            setVideoPreviewId(null);
            setIsAdding(false);
        } catch { alert('Failed to save video.'); }
        finally { setIsSavingVideo(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this item from the gallery?')) return;
        const updated = images.filter(i => i.id !== id);
        await db.collection('website_content').doc(selectedId).set({ items: updated }, { merge: true });
    };

    const pendingCount = uploadItems.filter(i => i.status === 'pending').length;

    const handleStartEdit = (img: GalleryItem) => {
        setEditingId(img.id);
        setEditTitle(img.title);
        setEditCaption(img.caption);
        setEditYear(img.year || ''); // ← NEW
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        setIsSavingEdit(true);
        try {
            const updated = images.map(img => img.id === editingId
                ? { ...img, title: editTitle, caption: editCaption, year: editYear } // ← NEW: save year
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
            <p className="text-slate-500 text-sm mb-6">Select a folder · Upload images or add YouTube videos · Saved to Firebase Storage</p>

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
                                    <button onClick={handleCreateFolder} disabled={isSavingFolder}
                                        className="flex items-center gap-1 bg-sky-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-sky-700 disabled:opacity-50">
                                        {isSavingFolder ? <SpinnerIcon className="w-3 h-3" /> : <CheckIcon className="w-3 h-3" />}
                                        Create
                                    </button>
                                    <button onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                                        className="text-xs px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== RIGHT: Content Panel ===== */}
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsAdding(true); setAddMode('image'); setUploadItems([]); }}
                                        className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Add Images
                                    </button>
                                    <button
                                        onClick={() => { setIsAdding(true); setAddMode('video'); setVideoUrl(''); setVideoTitle(''); setVideoCaption(''); setVideoYear(''); setVideoPreviewId(null); }}
                                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                        Add YouTube Video
                                    </button>
                                </div>
                            </div>

                            {/* Add panel */}
                            {isAdding && (
                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-5">

                                    {/* IMAGE UPLOAD MODE */}
                                    {addMode === 'image' && (
                                        <>
                                            <h3 className="font-bold text-slate-800 mb-3 text-sm">
                                                Upload Images to "{selectedPath[selectedPath.length - 1]}"
                                            </h3>
                                            <div
                                                className="border-2 border-dashed border-sky-300 rounded-lg p-5 text-center cursor-pointer hover:bg-sky-100 transition-colors mb-4"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <p className="text-sky-700 font-semibold text-sm">Click to select images</p>
                                                <p className="text-slate-400 text-xs mt-1">Hold Ctrl or Shift to select multiple files</p>
                                                <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                                            </div>

                                            {uploadItems.length > 0 && (
                                                <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
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
                                                                    disabled={item.status !== 'pending'} placeholder="Title (student name)" />
                                                                <input type="text" value={item.caption}
                                                                    onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, caption: e.target.value } : it))}
                                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                                                                    disabled={item.status !== 'pending'} placeholder="Caption (e.g. parentage, subjects)" />
                                                                {/* ← NEW: Year field */}
                                                                <input type="text" value={item.year}
                                                                    onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, year: e.target.value } : it))}
                                                                    className="w-full border border-amber-200 bg-amber-50 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
                                                                    disabled={item.status !== 'pending'} placeholder="Year (e.g. 2025) — required for Distinction Holders" />
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
                                                <span className="text-xs text-slate-500">{pendingCount} image(s) ready to upload</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setIsAdding(false); setUploadItems([]); }}
                                                        className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100"
                                                        disabled={isUploading}>Cancel</button>
                                                    <button onClick={handleUploadAll}
                                                        className="flex items-center gap-2 bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                                                        disabled={isUploading || pendingCount === 0}>
                                                        {isUploading ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                                        {isUploading ? uploadProgress : `Upload ${pendingCount} image(s)`}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* VIDEO ADD MODE */}
                                    {addMode === 'video' && (
                                        <>
                                            <h3 className="font-bold text-slate-800 mb-3 text-sm">
                                                Add YouTube Video to "{selectedPath[selectedPath.length - 1]}"
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">YouTube URL</label>
                                                    <input type="text" value={videoUrl} onChange={e => handleVideoUrlChange(e.target.value)}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                                        placeholder="https://www.youtube.com/watch?v=..." autoFocus />
                                                    {videoUrl && !videoPreviewId && (
                                                        <p className="text-red-500 text-xs mt-1">⚠ Could not detect a valid YouTube video ID.</p>
                                                    )}
                                                </div>
                                                {videoPreviewId && (
                                                    <div className="flex gap-4 items-start bg-white border border-slate-200 rounded-lg p-3">
                                                        <img src={getYouTubeThumbnail(videoPreviewId)} alt="Video thumbnail"
                                                            className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-xs text-green-600 font-semibold mb-1">✓ Valid YouTube video detected</p>
                                                            <p className="text-xs text-slate-500">Video ID: {videoPreviewId}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title <span className="text-red-400">*</span></label>
                                                    <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                                        placeholder="Video title" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Caption (optional)</label>
                                                    <input type="text" value={videoCaption} onChange={e => setVideoCaption(e.target.value)}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                                        placeholder="Short description..." />
                                                </div>
                                                {/* ← NEW: Year field for video */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-amber-700 mb-1">Year (optional — for Distinction Holders filtering)</label>
                                                    <input type="text" value={videoYear} onChange={e => setVideoYear(e.target.value)}
                                                        className="w-full border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                                                        placeholder="e.g. 2025" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <button onClick={() => setIsAdding(false)}
                                                    className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100">Cancel</button>
                                                <button onClick={handleAddVideo} disabled={isSavingVideo || !videoPreviewId || !videoTitle.trim()}
                                                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                                                    {isSavingVideo ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                                    Save Video
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Content grid */}
                            {isLoadingImages ? (
                                <div className="flex justify-center py-10"><SpinnerIcon className="w-7 h-7 text-sky-500" /></div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                                    <p className="font-semibold text-sm">No items in this folder yet</p>
                                    <p className="text-xs mt-1">Click "Add Images" or "Add YouTube Video" above</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-400 mb-3">
                                        {images.length} item(s) — {images.filter(i => i.type === 'video').length} video(s), {images.filter(i => i.type !== 'video').length} image(s)
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {images.map(img => (
                                            <div key={img.id}
                                                className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-pointer"
                                                onClick={() => handleStartEdit(img)}
                                            >
                                                <img src={img.imageSrc} alt={img.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                {img.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-red-600/90 rounded-full p-2">
                                                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* ← NEW: Show year badge if set */}
                                                {img.year && (
                                                    <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                                        {img.year}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                                    <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                                                    {img.caption && <p className="text-slate-300 text-xs truncate">{img.caption}</p>}
                                                </div>
                                                <div className="absolute top-1.5 right-1.5">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleDelete(img.id); }}
                                                        className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Edit Modal */}
                            {editingId && (() => {
                                const img = images.find(i => i.id === editingId);
                                if (!img) return null;
                                const ytId = img.type === 'video' && img.videoUrl ? getYouTubeId(img.videoUrl) : null;
                                return (
                                    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
                                        onClick={() => setEditingId(null)}>
                                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                                            onClick={e => e.stopPropagation()}>
                                            {/* Preview — fixed height, does not scroll */}
                                            <div className="flex-shrink-0 bg-black flex items-center justify-center" style={{height: '40vh'}}>
                                                {ytId ? (
                                                    <iframe src={`https://www.youtube.com/embed/${ytId}`}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen title={img.title} />
                                                ) : (
                                                    <img src={img.imageSrc} alt={img.title}
                                                        className="max-w-full max-h-full object-contain"
                                                        referrerPolicy="no-referrer" />
                                                )}
                                            </div>
                                            {/* Edit fields — scrollable */}
                                            <div className="p-5 space-y-3 border-t border-slate-200 overflow-y-auto flex-1">
                                                <h3 className="font-bold text-slate-800 text-sm">Edit Details</h3>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                                                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                                        placeholder="Title" autoFocus />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Caption</label>
                                                    <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400 resize-none"
                                                        placeholder="Add a caption (optional)" rows={2} />
                                                </div>
                                                {/* ← NEW: Year field in edit modal */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-amber-700 mb-1">
                                                        Year <span className="font-normal text-slate-400">(required for Distinction Holders page filtering)</span>
                                                    </label>
                                                    <input type="text" value={editYear} onChange={e => setEditYear(e.target.value)}
                                                        className="w-full border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                                                        placeholder="e.g. 2025" />
                                                </div>
                                                <div className="flex justify-end gap-3 pt-1">
                                                    <button onClick={() => setEditingId(null)}
                                                        className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100">Close</button>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryManagerPage;
