
import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { NewsItem } from '../types';
import { PlusIcon, XIcon, SpinnerIcon } from './Icons';
import { uploadToImgBB, resizeImage } from '../utils';

interface NewsFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<NewsItem, 'id'>) => void;
    item: NewsItem | null;
    isSaving: boolean;
    error?: string;
}

const NewsFormModal: React.FC<NewsFormModalProps> = ({ isOpen, onClose, onSubmit, item, isSaving, error }) => {
    const getInitialFormData = (): Omit<NewsItem, 'id'> => ({
        title: '',
        date: new Date().toISOString().split('T')[0],
        content: '',
        imageUrls: [],
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initialData = item ? { ...item, imageUrls: item.imageUrls || [] } : getInitialFormData();
            setFormData(initialData);
        }
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const files: File[] = Array.from(e.target.files);
            const newImageUrls: string[] = [];
            
            try {
                for (const file of files) {
                    const compressedDataUrl = await resizeImage(file, 800, 800, 0.8);
                    const imgBbUrl = await uploadToImgBB(compressedDataUrl);
                    newImageUrls.push(imgBbUrl);
                }
                setFormData(prev => ({ ...prev, imageUrls: [...(prev.imageUrls || []), ...newImageUrls] }));
            } catch (error) {
                console.error("Image upload failed:", error);
                alert("Failed to upload one or more images. Please check your connection and try again.");
            } finally {
                setIsUploading(false);
                if(fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleRemovePhoto = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: (prev.imageUrls || []).filter((_, index) => index !== indexToRemove)
        }));
    };


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">{item ? 'Edit News Item' : 'Add New News Item'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-slate-800">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-bold text-slate-800">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Images</label>
                            <div className="mt-2 p-4 border-2 border-dashed rounded-lg bg-slate-50">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {(formData.imageUrls || []).map((url, index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <img src={url} alt={`News preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(index)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                aria-label="Remove image"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="aspect-square flex flex-col items-center justify-center bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 hover:bg-slate-200 hover:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isUploading ? <SpinnerIcon className="w-8 h-8 text-sky-600" /> : <PlusIcon className="w-8 h-8 text-slate-500" />}
                                        <span className="text-xs font-semibold text-slate-600 mt-1">{isUploading ? 'Uploading...' : 'Add Photos'}</span>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" id="photo-upload-news" multiple />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-bold text-slate-800">Content</label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={8}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving || isUploading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading}>
                            {isSaving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsFormModal;
