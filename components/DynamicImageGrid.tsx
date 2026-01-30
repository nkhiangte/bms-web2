
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { User } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, SpinnerIcon, EditIcon, CheckIcon, XIcon } from './Icons';
import { uploadToImgBB, resizeImage } from '../utils';

export interface GridItem {
    id: string;
    title: string;
    caption: string;
    imageSrc: string;
}

interface DynamicImageGridProps {
    id: string; // Firestore doc ID (e.g. 'infrastructure_grid')
    user: User | null;
    displayType?: 'card' | 'grid'; // 'card' has text below, 'grid' is just images
    defaultItems?: GridItem[];
}

const DynamicImageGrid: React.FC<DynamicImageGridProps> = ({ id, user, displayType = 'card', defaultItems = [] }) => {
    const [items, setItems] = useState<GridItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<GridItem | null>(null);
    
    // Strict check: User must exist AND have role 'admin'
    const isAdmin = !!user && user.role === 'admin';

    // New Item State
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemCaption, setNewItemCaption] = useState('');
    const [newItemImage, setNewItemImage] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = db.collection('website_content').doc(id).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data && data.items) {
                    setItems(data.items);
                } else {
                    setItems([]);
                }
            } else {
                 setItems(defaultItems);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching grid items:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [id, defaultItems]); 

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemImage) {
            alert("Image is required.");
            return;
        }

        setIsUploading(true);
        try {
            const resized = await resizeImage(newItemImage, 1024, 1024, 0.9);
            const url = await uploadToImgBB(resized);
            
            const newItem: GridItem = {
                id: Date.now().toString(),
                title: newItemTitle || 'Untitled',
                caption: newItemCaption,
                imageSrc: url
            };

            const updatedItems = [...items, newItem];
            await db.collection('website_content').doc(id).set({ items: updatedItems }, { merge: true });
            
            setNewItemTitle('');
            setNewItemCaption('');
            setNewItemImage(null);
            setIsAdding(false);
        } catch (error) {
            console.error("Failed to add item:", error);
            alert("Failed to upload image or save item.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        
        setIsSaving(true);
        try {
            const updatedItems = items.filter(i => i.id !== itemId);
            await db.collection('website_content').doc(id).set({ items: updatedItems }, { merge: true });
        } catch (error) {
            console.error("Failed to delete item:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {isAdmin && (
                <div className="flex justify-end">
                    {!isAdding ? (
                        <button 
                            onClick={() => setIsAdding(true)} 
                            className="btn btn-primary"
                        >
                            <PlusIcon className="w-5 h-5" /> Add New Item
                        </button>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-sky-100 w-full max-w-lg mx-auto">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Add New Image</h3>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Image</label>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={e => setNewItemImage(e.target.files?.[0] || null)} 
                                        className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" 
                                        accept="image/*"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Title / Alt Text</label>
                                    <input 
                                        type="text" 
                                        value={newItemTitle} 
                                        onChange={e => setNewItemTitle(e.target.value)} 
                                        className="form-input w-full mt-1" 
                                        placeholder="e.g. Science Lab"
                                    />
                                </div>
                                {displayType === 'card' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700">Caption/Description</label>
                                        <textarea 
                                            value={newItemCaption} 
                                            onChange={e => setNewItemCaption(e.target.value)} 
                                            className="form-textarea w-full mt-1" 
                                            placeholder="Brief description..."
                                            rows={2}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAdding(false)} 
                                        className="btn btn-secondary"
                                        disabled={isUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                                        {isUploading ? 'Uploading...' : 'Save Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <SpinnerIcon className="w-8 h-8 text-sky-600" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500">No items added yet.</p>
                </div>
            ) : (
                <div className={`grid gap-6 ${displayType === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                    {items.map(item => (
                        <div 
                            key={item.id} 
                            className={`${displayType === 'card' ? 'bg-white rounded-lg shadow-lg flex flex-col' : 'rounded-lg shadow-md aspect-square'} overflow-hidden relative group cursor-pointer`}
                            onClick={() => setLightboxImage(item)}
                        >
                            {displayType === 'card' && (
                                <h3 className="text-xl font-bold text-slate-800 p-4 bg-slate-100 border-b text-center">{item.title}</h3>
                            )}
                            
                            <div className={`relative ${displayType === 'card' ? 'h-64' : 'h-full w-full'}`}>
                                <img 
                                    src={item.imageSrc} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {displayType === 'card' && item.caption && (
                                    <div className="p-2 bg-black/60 text-white absolute bottom-0 w-full backdrop-blur-sm">
                                        <p className="text-sm font-semibold text-center">{item.caption}</p>
                                    </div>
                                )}
                                {displayType === 'grid' && (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                )}
                            </div>
                            
                            {isAdmin && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteItem(item.id);
                                    }}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                                    title="Delete Item"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Lightbox */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setLightboxImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300"
                        onClick={() => setLightboxImage(null)}
                    >
                        &times;
                    </button>
                    <div className="max-w-[90vw] max-h-[90vh]">
                        <img 
                            src={lightboxImage.imageSrc} 
                            alt={lightboxImage.title} 
                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl mx-auto"
                            onClick={e => e.stopPropagation()}
                        />
                        {(lightboxImage.title || lightboxImage.caption) && (
                            <div className="text-center text-white mt-4">
                                <h3 className="text-xl font-bold">{lightboxImage.title}</h3>
                                <p className="text-slate-300">{lightboxImage.caption}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicImageGrid;
