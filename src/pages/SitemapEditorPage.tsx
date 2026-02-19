

import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon, CheckIcon, SpinnerIcon } from '../components/Icons';

const { useNavigate, Link } = ReactRouterDOM as any;

interface SitemapEditorPageProps {
    initialContent: string;
    onSave: (newContent: string) => Promise<void>;
}

const SitemapEditorPage: React.FC<SitemapEditorPageProps> = ({ initialContent, onSave }) => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        await onSave(content);
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                    <BackIcon className="w-5 h-5" />
                    Back
                </button>
                <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                    View Live Sitemap
                </a>
                <Link
                    to="/portal/dashboard"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    title="Go to Home/Dashboard"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">Sitemap Editor</h1>
            <p className="text-slate-700 mb-6">Manually edit the content of the `sitemap.xml` file. Be careful with the XML syntax.</p>
            
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                spellCheck="false"
            />

            <div className="mt-6 flex justify-end items-center gap-4">
                {saveSuccess && (
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold animate-fade-in">
                        <CheckIcon className="w-5 h-5" />
                        <span>Saved successfully!</span>
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-primary"
                >
                    {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                    <span>{isSaving ? 'Saving...' : 'Save Sitemap'}</span>
                </button>
            </div>
        </div>
    );
};

export default SitemapEditorPage;