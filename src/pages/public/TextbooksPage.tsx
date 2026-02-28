import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { Link, useNavigate } = ReactRouterDOM as any;

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
    </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const TextbooksPage: React.FC = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<TextbookFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [openFolder, setOpenFolder] = useState<string | null>(null);

    useEffect(() => {
        const unsub = db.collection('textbooks')
            .orderBy('order', 'asc')
            .onSnapshot(snap => {
                setFolders(snap.docs.map(d => ({ id: d.id, ...d.data() } as TextbookFolder)));
                setLoading(false);
            }, () => setLoading(false));
        return () => unsub();
    }, []);

    const toggleFolder = (id: string) =>
        setOpenFolder(prev => prev === id ? null : id);

    return (
        <div className="bg-slate-50 min-h-screen py-14">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                    >
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                        🏠 Home
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-100 rounded-2xl mb-4">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                        Prescribed Textbooks
                    </h1>
                    <p className="mt-3 text-slate-500 text-base max-w-md mx-auto">
                        Select your class to view the list of prescribed textbooks.
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : folders.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                        <span className="text-5xl">📂</span>
                        <p className="mt-4 text-slate-700 font-semibold text-lg">No textbook lists available yet.</p>
                        <p className="text-slate-400 text-sm mt-1">Please check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {folders.map(folder => {
                            const isOpen = openFolder === folder.id;
                            const subjectCount = folder.subjects?.length || 0;
                            return (
                                <div
                                    key={folder.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                                >
                                    {/* Folder header */}
                                    <button
                                        onClick={() => toggleFolder(folder.id)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-sky-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`transition-colors ${isOpen ? 'text-sky-700' : 'text-sky-500'}`}>
                                                <FolderIcon />
                                            </span>
                                            <span className={`font-bold text-base transition-colors ${isOpen ? 'text-sky-700' : 'text-slate-800 group-hover:text-sky-700'}`}>
                                                {folder.label}
                                            </span>
                                            <span className="text-xs text-slate-400 font-normal">
                                                {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-600' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Subjects table */}
                                    {isOpen && (
                                        <div className="border-t border-slate-100">
                                            {!subjectCount ? (
                                                <p className="px-6 py-4 text-sm text-slate-400 italic">No subjects listed yet.</p>
                                            ) : (
                                                <>
                                                    {/* Table header */}
                                                    <div className="grid grid-cols-2 gap-4 px-6 py-2 bg-slate-50 border-b border-slate-100">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</span>
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prescribed Textbook</span>
                                                    </div>
                                                    {/* Rows */}
                                                    <div className="divide-y divide-slate-50">
                                                        {folder.subjects.map((entry, i) => (
                                                            <div key={i} className="grid grid-cols-2 gap-4 px-6 py-3 hover:bg-sky-50 transition-colors">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm">📖</span>
                                                                    <span className="text-sm font-semibold text-slate-800">{entry.subject}</span>
                                                                </div>
                                                                <span className="text-sm text-slate-600">{entry.textbook}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextbooksPage;
