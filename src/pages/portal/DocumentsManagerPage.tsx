import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { BackIcon, HomeIcon, PlusIcon, TrashIcon, SpinnerIcon, CheckIcon } from '@/components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface DocumentsManagerPageProps {
    user: User;
}

interface PdfDocument {
    id: string;
    title: string;
    description?: string;
    url: string;
    category: string;
    addedAt: string;
}

const CATEGORIES = ['General', 'School Prospectus', 'Rules & Regulations', 'Academic', 'Admission', 'Circulars', 'Forms'];

const DocumentsManagerPage: React.FC<DocumentsManagerPageProps> = ({ user }) => {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<PdfDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('General');
    const [isSaving, setIsSaving] = useState(false);

    // Load documents from Firestore
    useEffect(() => {
        const unsub = db.collection('website_content').doc('about_documents').onSnapshot(
            doc => {
                setDocuments(doc.exists ? (doc.data()?.items || []) : []);
                setIsLoading(false);
            },
            () => setIsLoading(false)
        );
        return () => unsub();
    }, []);

    const handleAdd = async () => {
        if (!title.trim()) return alert('Please enter a title.');
        if (!url.trim()) return alert('Please enter a URL.');

        // Basic URL validation
        try { new URL(url.trim()); } catch { return alert('Please enter a valid URL (must start with https://)'); }

        setIsSaving(true);
        try {
            const newDoc: PdfDocument = {
                id: `doc_${Date.now()}`,
                title: title.trim(),
                description: description.trim(),
                url: url.trim(),
                category: category,
                addedAt: new Date().toISOString(),
            };
            const updated = [...documents, newDoc];
            await db.collection('website_content').doc('about_documents').set({ items: updated }, { merge: true });
            // Reset form
            setTitle('');
            setDescription('');
            setUrl('');
            setCategory('General');
            setIsAdding(false);
        } catch {
            alert('Failed to save. Check your connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this document from the website?')) return;
        const updated = documents.filter(d => d.id !== id);
        await db.collection('website_content').doc('about_documents').set({ items: updated }, { merge: true });
    };

    // Group by category for display
    const grouped = documents.reduce((acc, doc) => {
        const cat = doc.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
    }, {} as Record<string, PdfDocument[]>);

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

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Documents Manager</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage downloadable documents shown on the About Us page</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Document
                </button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">Add New Document</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                placeholder="e.g. School Prospectus 2025-26"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Document URL * 
                                <span className="font-normal text-slate-400 ml-2">(Google Drive, Dropbox, or any direct link)</span>
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                placeholder="https://drive.google.com/file/..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Description 
                                <span className="font-normal text-slate-400 ml-2">(optional — shown as subtitle)</span>
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                                placeholder="e.g. Academic year 2025-26"
                            />
                        </div>
                    </div>

                    {/* Google Drive tip */}
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                        <strong>💡 Google Drive tip:</strong> Open your PDF in Drive → Share → "Anyone with the link can view" → Copy link. Paste that link here.
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => { setIsAdding(false); setTitle(''); setUrl(''); setDescription(''); }}
                            className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-100"
                            disabled={isSaving}>
                            Cancel
                        </button>
                        <button onClick={handleAdd} disabled={isSaving}
                            className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50">
                            {isSaving ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                            {isSaving ? 'Saving...' : 'Add Document'}
                        </button>
                    </div>
                </div>
            )}

            {/* Document List */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <SpinnerIcon className="w-8 h-8 text-sky-500" />
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-semibold text-sm">No documents yet</p>
                    <p className="text-xs mt-1">Click "Add Document" above to add your first one</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([cat, docs]) => (
                        <div key={cat}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{cat}</h3>
                            <div className="space-y-2">
                                {docs.map(doc => (
                                    <div key={doc.id}
                                        className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                                        {/* PDF icon */}
                                        <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 truncate">{doc.title}</p>
                                            {doc.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.description}</p>}
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-sky-500 hover:underline truncate block mt-0.5 max-w-xs">
                                                {doc.url}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                                                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-white transition-colors">
                                                Preview
                                            </a>
                                            <button onClick={() => handleDelete(doc.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-slate-400 text-right pt-2">{documents.length} document{documents.length !== 1 ? 's' : ''} total</p>
                </div>
            )}
        </div>
    );
};

export default DocumentsManagerPage;
