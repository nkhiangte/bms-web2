import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, SpinnerIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { useNavigate } = ReactRouterDOM as any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubjectEntry {
    subject: string;
    textbook: string;
}

interface TextbookFolder {
    id: string;
    label: string;
    order: number;
    subjects: SubjectEntry[];
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

// ─── Add Subject Modal ────────────────────────────────────────────────────────
const AddSubjectModal: React.FC<{
    editEntry?: SubjectEntry & { index: number } | null;
    onSave: (entry: SubjectEntry) => void;
    onClose: () => void;
    saving: boolean;
}> = ({ editEntry, onSave, onClose, saving }) => {
    const [subject, setSubject] = useState(editEntry?.subject ?? '');
    const [textbook, setTextbook] = useState(editEntry?.textbook ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !textbook.trim()) return;
        onSave({ subject: subject.trim(), textbook: textbook.trim() });
    };

    const isEdit = !!editEntry;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">
                        {isEdit ? 'Edit Subject & Textbook' : 'Add Subject & Prescribed Textbook'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="e.g. English, Mathematics, Science"
                            className="form-input w-full"
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Prescribed Textbook <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={textbook}
                            onChange={e => setTextbook(e.target.value)}
                            placeholder="e.g. NCERT English Marigold Part 1"
                            className="form-input w-full"
                            required
                        />
                        <p className="text-xs text-slate-400 mt-1">Enter the full name of the prescribed textbook.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
                        <button
                            type="submit"
                            disabled={saving || !subject.trim() || !textbook.trim()}
                            className="flex-1 btn btn-primary"
                        >
                            {saving
                                ? <><SpinnerIcon className="w-4 h-4" /> Saving...</>
                                : isEdit ? 'Save Changes' : 'Add Subject'}
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
                    <h3 className="font-bold text-slate-800 text-lg">Create New Class Folder</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Class Name <span className="text-red-500">*</span></label>
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
                        <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
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
    const [showAddSubject, setShowAddSubject] = useState<string | null>(null); // folderId
    const [editSubject, setEditSubject] = useState<{ folderId: string; entry: SubjectEntry & { index: number } } | null>(null);
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
            await db.collection('textbooks').add({ label, order, subjects: [] });
            setShowAddFolder(false);
        } catch {
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
        if (!window.confirm(`Delete class "${folder.label}" and all its subjects? This cannot be undone.`)) return;
        try {
            await db.collection('textbooks').doc(folder.id).delete();
            if (expandedFolder === folder.id) setExpandedFolder(null);
        } catch {
            alert('Failed to delete folder.');
        }
    };

    // ── Add subject entry ──────────────────────────────────────────────────────
    const handleAddSubject = async (folderId: string, entry: SubjectEntry) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        setSaving(true);
        try {
            const newSubjects = [...(folder.subjects || []), entry];
            await db.collection('textbooks').doc(folderId).update({ subjects: newSubjects });
            setShowAddSubject(null);
        } catch {
            alert('Failed to add subject.');
        } finally {
            setSaving(false);
        }
    };

    // ── Edit subject entry ─────────────────────────────────────────────────────
    const handleEditSubject = async (entry: SubjectEntry) => {
        if (!editSubject) return;
        const { folderId, entry: { index } } = editSubject;
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        setSaving(true);
        try {
            const newSubjects = folder.subjects.map((s, i) => i === index ? entry : s);
            await db.collection('textbooks').doc(folderId).update({ subjects: newSubjects });
            setEditSubject(null);
        } catch {
            alert('Failed to update subject.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete subject entry ───────────────────────────────────────────────────
    const handleDeleteSubject = async (folderId: string, index: number) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        if (!window.confirm('Remove this subject?')) return;
        try {
            const newSubjects = folder.subjects.filter((_, i) => i !== index);
            await db.collection('textbooks').doc(folderId).update({ subjects: newSubjects });
        } catch {
            alert('Failed to remove subject.');
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
            {showAddSubject && (
                <AddSubjectModal
                    onSave={entry => handleAddSubject(showAddSubject, entry)}
                    onClose={() => setShowAddSubject(null)}
                    saving={saving}
                />
            )}
            {editSubject && (
                <AddSubjectModal
                    editEntry={editSubject.entry}
                    onSave={handleEditSubject}
                    onClose={() => setEditSubject(null)}
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
                    <PlusIcon /> New Class
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">📚 Manage Prescribed Textbooks</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Create a folder per class, then add subjects with their prescribed textbooks.
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
                    <p className="mt-4 font-semibold text-slate-600">No classes yet.</p>
                    <p className="text-slate-400 text-sm">Click "New Class" to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {folders.map(folder => {
                        const isExpanded = expandedFolder === folder.id;
                        const subjectCount = folder.subjects?.length || 0;
                        return (
                            <div key={folder.id} className="border border-slate-200 rounded-xl overflow-hidden">

                                {/* Folder row */}
                                <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <button
                                        onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <span className="text-sky-500"><FolderIcon /></span>
                                        <span className="font-bold text-slate-800">{folder.label}</span>
                                        <span className="text-xs text-slate-400">
                                            {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-xs text-slate-300">· order {folder.order}</span>
                                    </button>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setExpandedFolder(folder.id); setShowAddSubject(folder.id); }}
                                            title="Add subject"
                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        >
                                            <PlusIcon />
                                        </button>
                                        <button
                                            onClick={() => setEditFolder(folder)}
                                            title="Edit class"
                                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFolder(folder)}
                                            title="Delete class"
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

                                {/* Subjects table */}
                                {isExpanded && (
                                    <div>
                                        {!folder.subjects?.length ? (
                                            <div className="px-6 py-5 text-center">
                                                <p className="text-sm text-slate-400 italic">No subjects yet.</p>
                                                <button
                                                    onClick={() => setShowAddSubject(folder.id)}
                                                    className="mt-2 text-sm font-semibold text-sky-600 hover:underline"
                                                >
                                                    + Add first subject
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Header */}
                                                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-6 py-2 bg-slate-100 border-t border-slate-200">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prescribed Textbook</span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</span>
                                                </div>

                                                {/* Rows */}
                                                <div className="divide-y divide-slate-100">
                                                    {folder.subjects.map((entry, i) => (
                                                        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center px-6 py-3 hover:bg-slate-50">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="text-base">📖</span>
                                                                <span className="text-sm font-semibold text-slate-800 truncate">{entry.subject}</span>
                                                            </div>
                                                            <span className="text-sm text-slate-600 truncate">{entry.textbook}</span>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    onClick={() => setEditSubject({ folderId: folder.id, entry: { ...entry, index: i } })}
                                                                    className="p-1 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <EditIcon />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteSubject(folder.id, i)}
                                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <TrashIcon />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Add button at bottom */}
                                        {subjectCount > 0 && (
                                            <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100">
                                                <button
                                                    onClick={() => setShowAddSubject(folder.id)}
                                                    className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                                                >
                                                    <PlusIcon /> Add another subject
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
                    <li>Add each subject and its prescribed textbook name inside the class folder.</li>
                    <li>Use the order number to control which class appears first.</li>
                    <li>Changes are saved instantly to Firebase and visible on the public page right away.</li>
                </ul>
            </div>
        </div>
    );
};

export default ManageTextbooksPage;
