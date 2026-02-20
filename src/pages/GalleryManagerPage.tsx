import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { BackIcon, HomeIcon, PlusIcon, TrashIcon, SpinnerIcon, CheckIcon, XIcon } from '@/components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface GalleryManagerPageProps { user: User; }
interface GalleryImage { id: string; title: string; caption: string; imageSrc: string; }
interface GalleryFolder { name: string; thumbnail: string; subfolders?: GalleryFolder[]; }
interface UploadItem { file: File; preview: string; title: string; status: 'pending' | 'uploading' | 'done' | 'error'; }

const FOLDERS_DOC_ID = 'gallery_folders';

const DEFAULT_FOLDERS: GalleryFolder[] = [
    { name: 'By Event/Occasion', thumbnail: '', subfolders: [
        { name: 'Annual Day', thumbnail: '' }, { name: 'Sports Day', thumbnail: '' },
        { name: 'Science Fair', thumbnail: '', subfolders: [
            { name: 'Science Exhibition', thumbnail: '' }, { name: 'Science Congress', thumbnail: '' }, { name: 'Inspire Award Manak', thumbnail: '' },
        ]},
        { name: 'Independence Day', thumbnail: '' }, { name: 'Teachers Day', thumbnail: '' },
        { name: 'Cultural Programs', thumbnail: '' }, { name: 'Competitions', thumbnail: '' },
        { name: 'Field Trips', thumbnail: '', subfolders: [{ name: 'Eco-Club', thumbnail: '' }] },
    ]},
    { name: 'By Year', thumbnail: '', subfolders: [
        { name: '2025 Events', thumbnail: '' }, { name: '2024 Events', thumbnail: '' }, { name: '2023 Events', thumbnail: '' },
    ]},
    { name: 'By Category', thumbnail: '', subfolders: [
        { name: 'Students', thumbnail: '', subfolders: [
            { name: 'Nursery', thumbnail: '' }, { name: 'Kindergarten', thumbnail: '' },
            { name: 'Class I', thumbnail: '' }, { name: 'Class II', thumbnail: '' }, { name: 'Class III', thumbnail: '' },
            { name: 'Class IV', thumbnail: '' }, { name: 'Class V', thumbnail: '' }, { name: 'Class VI', thumbnail: '' },
            { name: 'Class VII', thumbnail: '' }, { name: 'Class VIII', thumbnail: '' }, { name: 'Class IX', thumbnail: '' }, { name: 'Class X', thumbnail: '' },
        ]},
        { name: 'Campus & Infrastructure', thumbnail: '' }, { name: 'Classrooms', thumbnail: '' },
        { name: 'Achievements', thumbnail: '' }, { name: 'Activities', thumbnail: '' }, { name: 'Alumni', thumbnail: '' },
    ]}
];

const getAllFolderPaths = (folders: GalleryFolder[], parentPath: string[] = []): string[][] => {
    const paths: string[][] = [];
    for (const folder of folders) {
        const currentPath = [...parentPath, folder.name];
        paths.push(currentPath);
        if (folder.subfolders) paths.push(...getAllFolderPaths(folder.subfolders, currentPath));
    }
    return paths;
};

const pathToId = (path: string[]) =>
    path.length === 0 ? 'gallery_root' : `gallery_${path.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`;

const addFolderToTree = (folders: GalleryFolder[], parentPath: string[], name: string): GalleryFolder[] => {
    if (parentPath.length === 0) return [...folders, { name, thumbnail: '', subfolders: [] }];
    return folders.map(f => f.name === parentPath[0]
        ? { ...f, subfolders: addFolderToTree(f.subfolders || [], parentPath.slice(1), name) }
        : f);
};

const deleteFolderFromTree = (folders: GalleryFolder[], path: string[]): GalleryFolder[] => {
    if (path.length === 1) return folders.filter(f => f.name !== path[0]);
    return folders.map(f => f.name === path[0]
        ? { ...f, subfolders: deleteFolderFromTree(f.subfolders || [], path.slice(1)) }
        : f);
};

const GalleryManagerPage: React.FC<GalleryManagerPageProps> = ({ user }) => {
    const navigate = useNavigate();
    const [folderTree, setFolderTree] = useState<GalleryFolder[]>(DEFAULT_FOLDERS);
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderParentPath, setNewFolderParentPath] = useState<string[]>([]);
    const [isSavingFolder, setIsSavingFolder] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allPaths = getAllFolderPaths(folderTree);
    const selectedId = pathToId(selectedPath);

    useEffect(() => {
        const unsub = db.collection('website_content').doc(FOLDERS_DOC_ID).onSnapshot(doc => {
            if (doc.exists && doc.data()?.folders) setFolderTree(doc.data()!.folders);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!selectedPath.length) return;
        setIsLoading(true);
        const unsub = db.collection('website_content').doc(selectedId).onSnapshot(doc => {
            setImages(doc.exists ? (doc.data()?.items || []) : []);
            setIsLoading(false);
        }, () => setIsLoading(false));
        return () => unsub();
    }, [selectedId, selectedPath]);

    const saveFolderTree = async (tree: GalleryFolder[]) => {
        await db.collection('website_content').doc(FOLDERS_DOC_ID).set({ folders: tree }, { merge: true });
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return alert('Please enter a folder name.');
        setIsSavingFolder(true);
        try {
            const newTree = addFolderToTree(folderTree, newFolderParentPath, newFolderName.trim());
            await saveFolderTree(newTree);
            setFolderTree(newTree);
            setNewFolderName(''); setIsCreatingFolder(false);
        } catch { alert('Failed to create folder.'); }
        finally { setIsSavingFolder(false); }
    };

    const handleDeleteFolder = async (path: string[]) => {
        if (!window.confirm(`Delete folder "${path[path.length - 1]}"? Images inside are NOT deleted from ImgBB.`)) return;
        const newTree = deleteFolderFromTree(folderTree, path);
        await saveFolderTree(newTree);
        setFolderTree(newTree);
        if (JSON.stringify(selectedPath).startsWith(JSON.stringify(path).slice(0, -1))) setSelectedPath([]);
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const items: UploadItem[] = files.map(file => ({
            file, preview: URL.createObjectURL(file),
            title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            status: 'pending',
        }));
        setUploadItems(prev => [...prev, ...items]);
    };

    const handleUploadAll = async () => {
        const hasPending = uploadItems.some(i => i.status === 'pending');
        if (!hasPending) return;
        setIsUploading(true);
        const newImages = [...images];
        for (let i = 0; i < uploadItems.length; i++) {
            if (uploadItems[i].status !== 'pending') continue;
            setUploadProgress(`Uploading ${i + 1} of ${uploadItems.length}...`);
            setUploadItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'uploading' } : item));
            try {
                const resized = await resizeImage(uploadItems[i].file, 1200, 1200, 0.9);
                const url = await uploadToImgBB(resized);
                newImages.push({ id: `${Date.now()}_${i}`, title: uploadItems[i].title || 'Untitled', caption: '', imageSrc: url });
                setUploadItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'done' } : item));
            } catch {
                setUploadItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error' } : item));
            }
        }
        await db.collection('website_content').doc(selectedId).set({ items: newImages }, { merge: true });
        setUploadProgress(''); setIsUploading(false);
        setTimeout(() => { setUploadItems(prev => prev.filter(i => i.status === 'error')); setIsAdding(false); }, 1000);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this image from gallery?')) return;
        const updated = images.filter(i => i.id !== id);
        await db.collection('website_content').doc(selectedId).set({ items: updated }, { merge: true });
    };

    const pendingCount = uploadItems.filter(i => i.status === 'pending').length;

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-1">Gallery Manager</h1>
            <p className="text-slate-500 mb-6 text-sm">Bulk upload images · Create custom folders · Images go to ImgBB · URLs saved to Firebase</p>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Folder Tree */}
                <div className="lg:w-72 flex-shrink-0">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Folders</h2>
                            <button onClick={() => { setIsCreatingFolder(true); setNewFolderParentPath([]); setNewFolderName(''); }}
                                className="text-sky-600 hover:text-sky-800 p-1 rounded" title="New top-level folder">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-0.5 max-h-[500px] overflow-y-auto pr-1">
                            {allPaths.map(path => (
                                <div key={path.join('/')} className="flex items-center group">
                                    <button
                                        onClick={() => { setSelectedPath(path); setIsAdding(false); setUploadItems([]); }}
                                        className={`flex-1 text-left py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors min-w-0 ${
                                            JSON.stringify(selectedPath) === JSON.stringify(path)
                                                ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-slate-200 text-slate-700'
                                        }`}
                                        style={{ paddingLeft: `${(path.length - 1) * 14 + 10}px`, paddingRight: '6px' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                        </svg>
                                        <span className="truncate">{path[path.length - 1]}</span>
                                    </button>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 ml-1 flex-shrink-0">
                                        <button onClick={() => { setIsCreatingFolder(true); setNewFolderParentPath(path); setNewFolderName(''); }}
                                            className="p-0.5 text-slate-400 hover:text-sky-600" title="Add subfolder">
                                            <PlusIcon className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteFolder(path)}
                                            className="p-0.5 text-slate-400 hover:text-red-600" title="Delete folder">
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isCreatingFolder && (
                            <div className="mt-3 p-3 bg-white border border-sky-200 rounded-lg">
                                <p className="text-xs font-semibold text-slate-600 mb-2">
                                    {newFolderParentPath.length === 0 ? 'New top-level folder' : `Under: ${newFolderParentPath[newFolderParentPath.length - 1]}`}
                                </p>
                                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                                    placeholder="Folder name..." className="form-input w-full text-sm mb-2" autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} />
                                <div className="flex gap-2">
                                    <button onClick={handleCreateFolder} disabled={isSavingFolder} className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1">
                                        {isSavingFolder ? <SpinnerIcon className="w-3 h-3" /> : <CheckIcon className="w-3 h-3" />} Create
                                    </button>
                                    <button onClick={() => setIsCreatingFolder(false)} className="btn btn-secondary text-xs py-1 px-3">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Panel */}
                <div className="flex-1 min-w-0">
                    {selectedPath.length === 0 ? (
                        <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl">
                            <div className="text-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                </svg>
                                <p className="font-semibold">Select a folder to manage images</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedPath[selectedPath.length - 1]}</h2>
                                    <p className="text-xs text-slate-400">{selectedPath.join(' › ')}</p>
                                </div>
                                <button onClick={() => { setIsAdding(!isAdding); setUploadItems([]); }} className="btn btn-primary flex items-center gap-2">
                                    <PlusIcon className="w-5 h-5" /> Add Images
                                </button>
                            </div>

                            {isAdding && (
                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-6">
                                    <h3 className="font-bold text-slate-800 mb-3">Upload to "{selectedPath[selectedPath.length - 1]}"</h3>
                                    <div className="border-2 border-dashed border-sky-300 rounded-lg p-6 text-center cursor-pointer hover:bg-sky-100 transition-colors mb-4"
                                        onClick={() => fileInputRef.current?.click()}>
                                        <p className="text-sky-700 font-semibold">Click to select images</p>
                                        <p className="text-slate-500 text-sm mt-1">Select multiple files at once (Ctrl+Click or Shift+Click)</p>
                                        <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                                    </div>

                                    {uploadItems.length > 0 && (
                                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                            {uploadItems.map((item, i) => (
                                                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg border ${
                                                    item.status === 'done' ? 'bg-green-50 border-green-200' :
                                                    item.status === 'error' ? 'bg-red-50 border-red-200' :
                                                    item.status === 'uploading' ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-200'
                                                }`}>
                                                    <img src={item.preview} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                                                    <input type="text" value={item.title} onChange={e => setUploadItems(prev => prev.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it))}
                                                        className="form-input flex-1 text-sm py-1" placeholder="Title" disabled={item.status !== 'pending'} />
                                                    <div className="w-20 text-center flex-shrink-0">
                                                        {item.status === 'pending' && <span className="text-xs text-slate-400">Ready</span>}
                                                        {item.status === 'uploading' && <SpinnerIcon className="w-4 h-4 text-sky-600 mx-auto" />}
                                                        {item.status === 'done' && <span className="text-xs text-green-600 font-bold">✓ Done</span>}
                                                        {item.status === 'error' && <span className="text-xs text-red-600 font-bold">✕ Error</span>}
                                                    </div>
                                                    {item.status === 'pending' && (
                                                        <button onClick={() => setUploadItems(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-500">{pendingCount} image(s) ready</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => { setIsAdding(false); setUploadItems([]); }} className="btn btn-secondary" disabled={isUploading}>Cancel</button>
                                            <button onClick={handleUploadAll} className="btn btn-primary flex items-center gap-2" disabled={isUploading || pendingCount === 0}>
                                                {isUploading ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                                                {isUploading ? uploadProgress : `Upload ${pendingCount} Image(s)`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex justify-center py-12"><SpinnerIcon className="w-8 h-8 text-sky-600" /></div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-400 font-semibold">No images yet.</p>
                                    <p className="text-slate-400 text-sm mt-1">Click "Add Images" to upload.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500 mb-3">{images.length} image(s) in this folder</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {images.map(img => (
                                            <div key={img.id} className="relative group rounded-lg overflow-hidden shadow border border-slate-200 aspect-square bg-slate-100">
                                                <img src={img.imageSrc} alt={img.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                                                </div>
                                                <button onClick={() => handleDelete(img.id)}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
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
