
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { User } from '../types';
import { EditIcon, SaveIcon, XIcon, SpinnerIcon, UploadIcon } from './Icons';
import { uploadToImgBB, resizeImage } from '../utils';

interface EditableContentProps {
    id: string; // Unique ID for Firestore document (e.g., 'home_hero_title')
    defaultContent: string; // Fallback content if nothing in DB
    type: 'text' | 'textarea' | 'image';
    user: User | null; // To check admin role
    className?: string; // For styling the display element
    style?: React.CSSProperties; // Inline styles
    imgAlt?: string; // Alt text for images
    placeholder?: string;
}

const EditableContent: React.FC<EditableContentProps> = ({ 
    id, 
    defaultContent, 
    type, 
    user, 
    className = '', 
    style = {},
    imgAlt = 'Website image',
    placeholder = 'Enter content...'
}) => {
    const [content, setContent] = useState<string>(defaultContent);
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState<string>(defaultContent);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user?.role === 'admin';

    // Fetch content on mount
    useEffect(() => {
        const unsubscribe = db.collection('website_content').doc(id).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data && data.value) {
                    setContent(data.value);
                }
            } else {
                // If doc doesn't exist, use default, but don't save yet to avoid spamming DB
                setContent(defaultContent);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching content:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [id, defaultContent]);

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTempContent(content);
        setIsEditing(true);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(false);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaving(true);
        try {
            await db.collection('website_content').doc(id).set({
                value: tempContent,
                updatedAt: new Date().toISOString(),
                updatedBy: user?.email
            }, { merge: true });
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving content:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            // Resize if it's too huge, max 1920px wide or high
            const resized = await resizeImage(file, 1920, 1920, 0.9);
            const url = await uploadToImgBB(resized);
            setTempContent(url);
            
            // Auto save for images after upload
            await db.collection('website_content').doc(id).set({
                value: url,
                updatedAt: new Date().toISOString(),
                updatedBy: user?.email
            }, { merge: true });
            
            setIsEditing(false);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDER LOGIC ---

    if (type === 'image') {
        return (
            <div className={`relative group ${className}`} style={style}>
                <img 
                    src={content} 
                    alt={imgAlt} 
                    className={`w-full h-full object-cover ${isSaving ? 'opacity-50' : ''}`} 
                />
                
                {isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                        <SpinnerIcon className="w-10 h-10 text-white" />
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute top-4 right-4 z-20">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            className="bg-white text-sky-700 p-2 rounded-full shadow-lg border border-sky-100 hover:bg-sky-50 transition-transform hover:scale-110 flex items-center justify-center"
                            title="Change Image (Admin)"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="relative border-2 border-sky-500 rounded p-1 bg-white shadow-xl z-30">
                {type === 'textarea' ? (
                    <textarea 
                        value={tempContent} 
                        onChange={(e) => setTempContent(e.target.value)} 
                        className="w-full form-textarea text-slate-800 text-base"
                        rows={6}
                        autoFocus
                    />
                ) : (
                    <input 
                        type="text" 
                        value={tempContent} 
                        onChange={(e) => setTempContent(e.target.value)} 
                        className="w-full form-input text-slate-800 text-lg font-bold"
                        autoFocus
                    />
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={handleCancel} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Cancel">
                        <XIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Save">
                        {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative group inline-block w-full ${isAdmin ? 'hover:ring-2 hover:ring-sky-400/50 hover:bg-sky-50/20 rounded transition-all' : ''}`}>
            {type === 'textarea' ? (
                 <div className={`whitespace-pre-wrap ${className}`} style={style}>{content}</div>
            ) : (
                 <span className={className} style={style}>{content}</span>
            )}
           
            {isAdmin && (
                <button 
                    onClick={handleEditClick}
                    className="absolute -top-3 -right-3 bg-sky-600 text-white p-1.5 rounded-full shadow-md z-20 hover:bg-sky-700 transition-transform hover:scale-110"
                    title="Edit Content (Admin)"
                >
                    <EditIcon className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export default EditableContent;
