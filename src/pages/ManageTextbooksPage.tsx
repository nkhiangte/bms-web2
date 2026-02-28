import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, SpinnerIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { useNavigate } = ReactRouterDOM as any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface TextbookLink {
    name: string;
    url: string;
}

interface TextbookFolder {
    id: string;
    label: string;
    order: number;
    links: TextbookLink[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
);

// ─── Add Link Modal ───────────────────────────────────────────────────────────
const AddLinkModal: React.FC<{
    onSave: (link: TextbookLink) => void;
    onClose: () => void;
    saving: boolean;
}> = ({ onSave, onClose, saving }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !url.trim()) return;
        onSave({ name: name.trim(), url: url.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Add New Link</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Display Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. English Textbook (NCERT)"
                            className="form-input w-full"
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">URL / Link <span className="text-red-500">*</span></label>
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="form-input w-full"
                            required
                        />
                        <p className="text-xs text-slate-400 mt-1">Can be a Google Drive link, PDF URL, or any website.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving || !name.trim() || !url.trim()} className="flex-1 btn btn-primary">
                            {saving ? <><SpinnerIcon className="w-4 h-4" /> Saving...</> : 'Add Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Add Folder Modal ─────────────────────────────────────────────────────────
const AddFolderModal: React.FC<{
    existingCount: number;
    onSave: (label: string, order: number) => void;
    onClose: () => void;
    saving: boolean;
}> = ({ existingCount, onSave, onClose, saving }) => {
    const [label, setLabel] = useState('');
    const [order, setOrder] = useState(existingCount + 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim()) return;
        onSave(label.trim(), order);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Create New Folder</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Folder Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="e.g. Class X, Nursery, Class VII"
                            className="form-input w-full"
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Display Order</label>
                        <input
                            type="number"
                            value={order}
                            onChange={e => setOrder(Number(e.target.value))}
                            className="form-input w-full"
                            min={1}
                        />
                        <p className="text-xs text-slate-400 mt-1">Lower numbers appear first.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving || !label.trim()} className="flex-1 btn btn-primary">
                            {saving ? <><SpinnerIcon className="w-4 h-4" /> Creating...</> : 'Create Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Rename Folder Modal ──────────────────────────────────────────────────────
const RenameFolderModal: React.FC<{
    folder: TextbookFolder;
    onSave: (label: string, order: number) => void;
    onClose: () => void;
    saving: boolean;
}> = ({ folder, onSave, onClose, saving }) => {
    const [label, setLabel] = useState(folder.label);
    const [order, setOrder] = useState(folder.order);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim()) return;
        onSave(label.trim(), order);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Edit Folder</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Folder Name</label>
                        <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="form-input w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Display Order</label>
                        <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="form-input w-full" min={1} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 btn btn-primary">
                            {saving ? <><SpinnerIcon className="w-4 h-4" /> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ManageTextbooksPage: React.FC = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<TextbookFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

    // Modals
    const [showAddFolder, setShowAddFolder] = useState(false);
    const [showAddLink, setShowAddLink] = useState<string | null>(null); // folderId
    const [editFolder, setEditFolder] = useState<TextbookFolder | null>(null);

    useEffect(() => {
        const unsub = db.collection('textbooks')
            .orderBy('order', 'asc')
            .onSnapshot(snap => {
                setFolders(snap.docs.map(d => ({ id: d.id, ...d.data() } as TextbookFolder)));
                setLoading(false);
            }, () => setLoading(false));
        return () => unsub();
    }, []);

    // ── Create folder ──────────────────────────────────────────────────────────
    const handleCreateFolder = async (label: string, order: number) => {
        setSaving(true);
        try {
            await db.collection('textbooks').add({ label, order, links: [] });
            setShowAddFolder(false);
        } catch (e) {
            alert('Failed to create folder.');
        } finally {
            setSaving(false);
        }
    };

    // ── Rename/reorder folder ──────────────────────────────────────────────────
    const handleEditFolder = async (label: string, order: number) => {
        if (!editFolder) return;
        setSaving(true);
        try {
            await db.collection('textbooks').doc(editFolder.id).update({ label, order });
            setEditFolder(null);
        } catch {
            alert('Failed to update folder.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete folder ──────────────────────────────────────────────────────────
    const handleDeleteFolder = async (folder: TextbookFolder) => {
        if (!window.confirm(`Delete folder "${folder.label}" and all its links? This cannot be undone.`)) return;
        try {
            await db.collection('textbooks').doc(folder.id).delete();
            if (expandedFolder === folder.id) setExpandedFolder(null);
        } catch {
            alert('Failed to delete folder.');
        }
    };

    // ── Add link to folder ─────────────────────────────────────────────────────
    const handleAddLink = async (folderId: string, link: TextbookLink) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        setSaving(true);
        try {
            const newLinks = [...(folder.links || []), link];
            await db.collection('textbooks').doc(folderId).update({ links: newLinks });
            setShowAddLink(null);
        } catch {
            alert('Failed to add link.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete link from folder ────────────────────────────────────────────────
    const handleDeleteLink = async (folderId: string, linkIndex: number) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        if (!window.confirm('Remove this link?')) return;
        try {
            const newLinks = folder.links.filter((_, i) => i !== linkIndex);
            await db.collection('textbooks').doc(folderId).update({ links: newLinks });
        } catch {
            alert('Failed to remove link.');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">

            {/* Modals */}
            {showAddFolder && (
                <AddFolderModal
                    existingCount={folders.length}
                    onSave={handleCreateFolder}
                    onClose={() => setShowAddFolder(false)}
                    saving={saving}
                />
            )}
            {showAddLink && (
                <AddLinkModal
                    onSave={link => handleAddLink(showAddLink, link)}
                    onClose={() => setShowAddLink(null)}
                    saving={saving}
                />
            )}
            {editFolder && (
                <RenameFolderModal
                    folder={editFolder}
                    onSave={handleEditFolder}
                    onClose={() => setEditFolder(null)}
                    saving={saving}
                />
            )}

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <button
                    onClick={() => setShowAddFolder(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <PlusIcon /> New Folder
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">📚 Manage Prescribed Textbooks</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Create folders (one per class) and add links to textbooks, PDFs or any resource inside each.
                </p>
            </div>

            {/* Folder list */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : folders.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <span className="text-5xl">📂</span>
                    <p className="mt-4 font-semibold text-slate-600">No folders yet.</p>
                    <p className="text-slate-400 text-sm">Click "New Folder" to create your first class folder.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {folders.map(folder => {
                        const isExpanded = expandedFolder === folder.id;
                        return (
                            <div key={folder.id} className="border border-slate-200 rounded-xl overflow-hidden">

                                {/* Folder row */}
                                <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    {/* Expand toggle */}
                                    <button
                                        onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <span className="text-sky-500"><FolderIcon /></span>
                                        <span className="font-bold text-slate-800">{folder.label}</span>
                                        <span className="text-xs text-slate-400">
                                            {folder.links?.length || 0} link{(folder.links?.length || 0) !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-xs text-slate-300">· order {folder.order}</span>
                                    </button>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setExpandedFolder(folder.id); setShowAddLink(folder.id); }}
                                            title="Add link"
                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        >
                                            <PlusIcon />
                                        </button>
                                        <button
                                            onClick={() => setEditFolder(folder)}
                                            title="Edit folder"
                                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFolder(folder)}
                                            title="Delete folder"
                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <TrashIcon />
                                        </button>
                                        <svg
                                            className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Links */}
                                {isExpanded && (
                                    <div className="divide-y divide-slate-100">
                                        {!folder.links?.length ? (
                                            <div className="px-6 py-5 text-center">
                                                <p className="text-sm text-slate-400 italic">No links yet.</p>
                                                <button
                                                    onClick={() => setShowAddLink(folder.id)}
                                                    className="mt-2 text-sm font-semibold text-sky-600 hover:underline"
                                                >
                                                    + Add first link
                                                </button>
                                            </div>
                                        ) : (
                                            folder.links.map((link, i) => (
                                                <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-sky-400 shrink-0">🔗</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">{link.name}</p>
                                                            <p className="text-xs text-slate-400 truncate max-w-xs">{link.url}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-sky-600 hover:underline"
                                                        >
                                                            Open ↗
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteLink(folder.id, i)}
                                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {/* Add link button at bottom when expanded and has items */}
                                        {(folder.links?.length || 0) > 0 && (
                                            <div className="px-6 py-2.5 bg-slate-50">
                                                <button
                                                    onClick={() => setShowAddLink(folder.id)}
                                                    className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                                                >
                                                    <PlusIcon /> Add another link
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-bold mb-1">💡 Tips</p>
                <ul className="space-y-1 list-disc list-inside text-blue-700">
                    <li>Create one folder per class (e.g. "Class X", "Nursery").</li>
                    <li>Links can point to Google Drive, PDFs, NCERT website, or any URL.</li>
                    <li>Use the order number to control which class appears first.</li>
                    <li>Changes are saved instantly and visible on the public page right away.</li>
                </ul>
            </div>
        </div>
    );
};

export default ManageTextbooksPage;
