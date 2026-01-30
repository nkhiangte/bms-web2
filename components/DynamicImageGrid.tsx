
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { User } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, SpinnerIcon, EditIcon, CheckIcon, XIcon } from './Icons';
import { uploadToImgBB, resizeImage } from '../utils';

interface GridItem {
    id: string;
    title: string;
    caption: string;
    imageSrc: string;
}

interface DynamicImageGridProps {
    id: string; // Firestore doc ID (e.g. 'infrastructure_grid')
    user: User | null;
}

const DynamicImageGrid: React.FC<DynamicImageGridProps> = ({ id, user }) => {
    const [items, setItems] = useState<GridItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const isAdmin = user?.role === 'admin';

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
                }
            } else {
                 // Initialize default if needed, or keep empty
                 setItems([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching grid items:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle || !newItemImage) {
            alert("Title and Image are required.");
            return;
        }

        setIsUploading(true);
        try {
            const resized = await resizeImage(newItemImage, 1024, 1024, 0.9);
            const url = await uploadToImgBB(resized);
            
            const newItem: GridItem = {
                id: Date.now().toString(),
                title: newItemTitle,
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
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Add New Infrastructure Item</h3>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Title</label>
                                    <input 
                                        type="text" 
                                        value={newItemTitle} 
                                        onChange={e => setNewItemTitle(e.target.value)} 
                                        className="form-input w-full mt-1" 
                                        placeholder="e.g. Science Lab"
                                        required
                                    />
                                </div>
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
                                    <label className="block text-sm font-bold text-slate-700">Caption/Description</label>
                                    <textarea 
                                        value={newItemCaption} 
                                        onChange={e => setNewItemCaption(e.target.value)} 
                                        className="form-textarea w-full mt-1" 
                                        placeholder="Brief description..."
                                        rows={2}
                                    />
                                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full relative group">
                            <h3 className="text-xl font-bold text-slate-800 p-4 bg-slate-100 border-b text-center">{item.title}</h3>
                            <div className="flex-grow relative">
                                <div className="h-64 bg-slate-200">
                                    <img 
                                        src={item.imageSrc} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-2 bg-black/60 text-white absolute bottom-0 w-full backdrop-blur-sm">
                                    <p className="text-sm font-semibold text-center">{item.caption}</p>
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDeleteItem(item.id)}
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
        </div>
    );
};

export default DynamicImageGrid;
