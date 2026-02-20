import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { BackIcon, HomeIcon, PlusIcon, TrashIcon, SpinnerIcon, CheckIcon, FolderIcon } from '@/components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface GalleryManagerPageProps {
    user: User;
}

interface GalleryImage {
    id: string;
    title: string;
    caption: string;
    imageSrc: string;
}

interface GalleryFolder {
    name: string;
    thumbnail: string;
    subfolders?: GalleryFolder[];
}

const galleryData: GalleryFolder[] = [
    {
        name: 'By Event/Occasion',
        thumbnail: '',
        subfolders: [
            { name: 'Annual Day', thumbnail: '' },
            { name: 'Sports Day', thumbnail: '' },
            {
                name: 'Science Fair', thumbnail: '',
                subfolders: [
                    { name: 'Science Exhibition', thumbnail: '' },
                    { name: 'Science Congress', thumbnail: '' },
                    { name: 'Inspire Award Manak', thumbnail: '' },
                ]
            },
            { name: 'Independence Day', thumbnail: '' },
            { name: 'Teachers Day', thumbnail: '' },
            { name: 'Cultural Programs', thumbnail: '' },
            { name: 'Competitions', thumbnail: '' },
            {
                name: 'Field Trips', thumbnail: '',
                subfolders: [{ name: 'Eco-Club', thumbnail: '' }]
            },
        ]
    },
    {
        name: 'By Year', thumbnail: '',
        subfolders: [
            { name: '2025 Events', thumbnail: '' },
            { name: '2024 Events', thumbnail: '' },
            { name: '2023 Events', thumbnail: '' },
        ]
    },
    {
        name: 'By Category', thumbnail: '',
        subfolders: [
            {
                name: 'Students', thumbnail: '',
                subfolders: [
                    { name: 'Nursery', thumbnail: '' }, { name: 'Kindergarten', thumbnail: '' },
                    { name: 'Class I', thumbnail: '' }, { name: 'Class II', thumbnail: '' },
                    { name: 'Class III', thumbnail: '' }, { name: 'Class IV', thumbnail: '' },
                    { name: 'Class V', thumbnail: '' }, { name: 'Class VI', thumbnail: '' },
                    { name: 'Class VII', thumbnail: '' }, { name: 'Class VIII', thumbnail: '' },
                    { name: 'Class IX', thumbnail: '' }, { name: 'Class X', thumbnail: '' },
                ]
            },
            { name: 'Campus & Infrastructure', thumbnail: '' },
            { name: 'Classrooms', thumbnail: '' },
            { name: 'Achievements', thumbnail: '' },
            { name: 'Activities', thumbnail: '' },
            { name: 'Alumni', thumbnail: '' },
        ]
    }
];

const getAllFolderPaths = (folders: GalleryFolder[], parentPath: string[] = []): string[][] => {
    const paths: string[][] = [];
    for (const folder of folders) {
        const currentPath = [...parentPath, folder.name];
        paths.push(currentPath);
        if (folder.subfolders) {
            paths.push(...getAllFolderPaths(folder.subfolders, currentPath));
        }
    }
    return paths;
};

const pathToId = (path: string[]) =>
    path.length === 0
        ? 'gallery_root'
        : `gallery_${path.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`;

const GalleryManagerPage: React.FC<GalleryManagerPageProps> = ({ user }) => {
    const navigate = useNavigate();
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCaption, setNewCaption] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allPaths = getAllFolderPaths(galleryData);
    const selectedId = pathToId(selectedPath);

    useEffect(() => {
        if (!selectedId) return;
        setIsLoading(true);
        const unsubscribe = db.collection('website_content').doc(selectedId).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setImages(data?.items || []);
            } else {
                setImages([]);
            }
            setIsLoading(false);
        }, err => {
            console.error(err);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [selectedId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setNewFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!newFile) return alert('Please select an image.');
        setIsUploading(true);
        try {
            const resized = await resizeImage(newFile, 1200, 1200, 0.9);
            const url = await uploadToImgBB(resized);
            const newImage: GalleryImage = {
                id: Date.now().toString(),
                title: newTitle || 'Untitled',
                caption: newCaption,
                imageSrc: url,
            };
            const updatedImages = [...images, newImage];
            await db.collection('website_content').doc(selectedId).set({ items: updatedImages }, { merge: true });
            setNewTitle('');
            setNewCaption('');
            setNewFile(null);
            setPreview(null);
            setIsAdding(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this image?')) return;
        const updatedImages = images.filter(i => i.id !== id);
        await db.collection('website_content').doc(selectedId).set({ items: updatedImages }, { merge: true });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">Gallery Manager</h1>
            <p className="text-slate-500 mb-8">Select a folder to manage its images. Images are uploaded to ImgBB and URLs are saved to Firebase.</p>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Folder Tree */}
                <div className="lg:w-72 flex-shrink-0">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Folders</h2>
                        <div className="space-y-1 max-h-[600px] overflow-y-auto">
                            {allPaths.map(path => (
                                <button
                                    key={path.join('/')}
                                    onClick={() => { setSelectedPath(path); setIsAdding(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                                        JSON.stringify(selectedPath) === JSON.stringify(path)
                                            ? 'bg-sky-600 text-white font-semibold'
                                            : 'hover:bg-slate-200 text-slate-700'
                                    }`}
                                    style={{ paddingLeft: `${(path.length - 1) * 16 + 12}px` }}
                                >
                                    <FolderIcon className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{path[path.length - 1]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Image Manager */}
                <div className="flex-1 min-w-0">
                    {selectedPath.length === 0 ? (
                        <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl">
                            <div className="text-center text-slate-400">
                                <FolderIcon className="w-12 h-12 mx-auto mb-2" />
                                <p className="font-semibold">Select a folder to manage images</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Folder Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedPath[selectedPath.length - 1]}</h2>
                                    <p className="text-xs text-slate-400">{selectedPath.join(' / ')}</p>
                                </div>
                                <button
                                    onClick={() => setIsAdding(!isAdding)}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Image
                                </button>
                            </div>

                            {/* Add Image Form */}
                            {isAdding && (
                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-6">
                                    <h3 className="font-bold text-slate-800 mb-4">Upload New Image</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Image File *</label>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={newTitle}
                                                    onChange={e => setNewTitle(e.target.value)}
                                                    placeholder="e.g. Annual Day 2024"
                                                    className="form-input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Caption (optional)</label>
                                                <input
                                                    type="text"
                                                    value={newCaption}
                                                    onChange={e => setNewCaption(e.target.value)}
                                                    placeholder="Brief description..."
                                                    className="form-input w-full"
                                                />
                                            </div>
                                        </div>
                                        {preview && (
                                            <div className="flex items-center justify-center">
                                                <img src={preview} alt="Preview" className="max-h-48 rounded-lg shadow object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button onClick={() => { setIsAdding(false); setPreview(null); setNewFile(null); }} className="btn btn-secondary" disabled={isUploading}>
                                            Cancel
                                        </button>
                                        <button onClick={handleUpload} className="btn btn-primary flex items-center gap-2" disabled={isUploading || !newFile}>
                                            {isUploading ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                                            {isUploading ? 'Uploading to ImgBB...' : 'Upload & Save'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Image Grid */}
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <SpinnerIcon className="w-8 h-8 text-sky-600" />
                                </div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-400 font-semibold">No images in this folder yet.</p>
                                    <p className="text-slate-400 text-sm mt-1">Click "Add Image" to upload one.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map(img => (
                                        <div key={img.id} className="relative group rounded-lg overflow-hidden shadow border border-slate-200 aspect-square bg-slate-100">
                                            <img src={img.imageSrc} alt={img.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(img.id)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryManagerPage;
