import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';

const { Link, useNavigate } = ReactRouterDOM as any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface TextbookLink {
    name: string;
    url: string;
}

// Old format saved by previous admin page
interface TextbookSubject {
    subject: string;
    textbook: string;
}

interface TextbookFolder {
    id: string;
    label: string;
    order: number;
    // new format
    links?: TextbookLink[];
    // old format
    subjects?: TextbookSubject[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
    </svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);

const ExternalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
);

// ─── Helper: get item count regardless of format ──────────────────────────────
const getItemCount = (folder: TextbookFolder): number => {
    if (folder.subjects?.length) return folder.subjects.length;
    return folder.links?.length || 0;
};

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
        <div className="bg-zinc-950 min-h-screen py-14">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-slate-200">
                        🏠 Home
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-900/50 rounded-2xl mb-4">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                        Prescribed Textbooks
                    </h1>
                    <p className="mt-3 text-slate-400 text-base max-w-md mx-auto">
                        Select your class to view the list of prescribed textbooks and resources.
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : folders.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-900">
                        <span className="text-5xl">📂</span>
                        <p className="mt-4 text-white font-semibold text-lg">No textbook lists available yet.</p>
                        <p className="text-slate-400 text-sm mt-1">Please check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {folders.map(folder => {
                            const isOpen = openFolder === folder.id;
                            const itemCount = getItemCount(folder);
                            // Determine which format this folder uses
                            const hasSubjects = (folder.subjects?.length || 0) > 0;
                            const hasLinks = (folder.links?.length || 0) > 0;

                            return (
                                <div
                                    key={folder.id}
                                    className="bg-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden transition-all"
                                >
                                    {/* Folder header */}
                                    <button
                                        onClick={() => toggleFolder(folder.id)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sky-400 transition-colors ${isOpen ? 'text-sky-300' : ''}`}>
                                                <FolderIcon />
                                            </span>
                                            <span className={`font-bold text-white text-base group-hover:text-sky-300 transition-colors ${isOpen ? 'text-sky-300' : ''}`}>
                                                {folder.label}
                                            </span>
                                            <span className="text-xs text-slate-500 font-normal">
                                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-400' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Content when open */}
                                    {isOpen && (
                                        <div className="border-t border-zinc-700">
                                            {itemCount === 0 ? (
                                                <p className="px-6 py-4 text-sm text-slate-500 italic">No items in this folder.</p>
                                            ) : hasSubjects ? (
                                                // ── OLD FORMAT: subjects list (no links) ──
                                                <div className="divide-y divide-zinc-800">
                                                    {folder.subjects!.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                                                            <span className="text-sky-400 shrink-0">
                                                                <BookIcon />
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-xs font-bold text-sky-400 uppercase tracking-wide block">
                                                                    {item.subject}
                                                                </span>
                                                                <span className="text-sm font-medium text-slate-200">
                                                                    {item.textbook}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : hasLinks ? (
                                                // ── NEW FORMAT: links with URLs ──
                                                <div className="divide-y divide-zinc-800">
                                                    {folder.links!.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-800 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sky-400 group-hover:text-sky-300">
                                                                    <LinkIcon />
                                                                </span>
                                                                <span className="text-sm font-medium text-slate-200 group-hover:text-sky-300">
                                                                    {link.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-slate-500 group-hover:text-sky-400">
                                                                <ExternalIcon />
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : null}
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
