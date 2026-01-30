
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
    
    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textImageInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Strict check: User must exist AND have role 'admin'
    const isAdmin = !!user && user.role === 'admin';

    // Fetch content on mount
    useEffect(() => {
        const unsubscribe = db.collection('website_content').doc(id).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data && data.value) {
                    setContent(data.value);
                }
            } else {
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

    // Handle Image Replacement (type='image')
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const resized = await resizeImage(file, 1920, 1920, 0.9);
            const url = await uploadToImgBB(resized);
            setTempContent(url);
            
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

    // Handle Image Insertion into Textarea
    const handleTextImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const resized = await resizeImage(file, 1024, 1024, 0.9);
            const url = await uploadToImgBB(resized);
            
            const imageMarkdown = `\n![Image](${url})\n`;
            
            if (textareaRef.current) {
                const start = textareaRef.current.selectionStart;
                const end = textareaRef.current.selectionEnd;
                const newText = tempContent.substring(0, start) + imageMarkdown + tempContent.substring(end);
                setTempContent(newText);
            } else {
                setTempContent(prev => prev + imageMarkdown);
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setIsSaving(false);
            if(textImageInputRef.current) textImageInputRef.current.value = '';
        }
    };

    // Render text with Markdown-style images and links
    const renderRichText = (text: string) => {
        // 1. Split by image pattern: ![alt](url)
        const parts = text.split(/(!\[.*?\]\(.*?\))/g);
        
        return parts.map((part, index) => {
            const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
                return (
                    <img 
                        key={index} 
                        src={imgMatch[2]} 
                        alt={imgMatch[1] || 'Embedded Image'} 
                        className="max-w-full h-auto rounded-lg my-4 shadow-sm block" 
                    />
                );
            }

            // 2. Parse Links: [text](url) within text parts
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const textElements = [];
            let lastIdx = 0;
            let match;

            while ((match = linkRegex.exec(part)) !== null) {
                if (match.index > lastIdx) {
                    textElements.push(part.substring(lastIdx, match.index));
                }
                textElements.push(
                    <a 
                        key={`${index}-${match.index}`} 
                        href={match[2]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sky-600 hover:underline font-medium break-all"
                    >
                        {match[1]}
                    </a>
                );
                lastIdx = linkRegex.lastIndex;
            }
            if (lastIdx < part.length) {
                textElements.push(part.substring(lastIdx));
            }

            return <span key={index}>{textElements}</span>;
        });
    };

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
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
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

    if (isEditing && isAdmin) {
        return (
            <div className="relative border-2 border-sky-500 rounded p-1 bg-white shadow-xl z-30">
                {type === 'textarea' ? (
                    <>
                        <div className="flex justify-end mb-1">
                             <button 
                                type="button" 
                                onClick={() => textImageInputRef.current?.click()}
                                className="text-xs flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold bg-sky-50 px-2 py-1 rounded"
                                disabled={isSaving}
                            >
                                <UploadIcon className="w-3 h-3"/> Insert Image
                            </button>
                            <input 
                                type="file" 
                                ref={textImageInputRef} 
                                onChange={handleTextImageUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        <textarea 
                            ref={textareaRef}
                            value={tempContent} 
                            onChange={(e) => setTempContent(e.target.value)} 
                            className="w-full form-textarea text-slate-800 text-base min-h-[150px]"
                            rows={6}
                            autoFocus
                        />
                    </>
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
        <div className={`relative group inline-block w-full ${isAdmin ? 'hover:ring-2 hover:ring-sky-400/50 hover:bg-sky-50/20 rounded transition-all cursor-text' : ''}`}>
            {type === 'textarea' ? (
                 <div className={`whitespace-pre-wrap ${className}`} style={style}>
                     {renderRichText(content)}
                 </div>
            ) : (
                 <span className={className} style={style}>{content}</span>
            )}
           
            {isAdmin && (
                <button 
                    onClick={handleEditClick}
                    className="absolute -top-3 -right-3 bg-sky-600 text-white p-1.5 rounded-full shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-700 hover:scale-110"
                    title="Edit Content (Admin)"
                >
                    <EditIcon className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export default EditableContent;
