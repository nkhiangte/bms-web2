
import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { NewsItem, User } from '../types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon, DocumentReportIcon, SpinnerIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';
import NewsFormModal from '../components/NewsFormModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageNewsPageProps {
    news: NewsItem[];
    onSave: (item: Omit<NewsItem, 'id'>, id?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    user: User;
}

const ManageNewsPage: React.FC<ManageNewsPageProps> = ({ news, onSave, onDelete, user }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const sortedNews = useMemo(() => {
        return [...news].sort((a, b) => b.date.localeCompare(a.date));
    }, [news]);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: NewsItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Omit<NewsItem, 'id'>) => {
        setIsSaving(true);
        try {
            await onSave(data, editingItem?.id);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save news item:", error);
            alert("Failed to save news item. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this news item? This action cannot be undone.")) {
            try {
                await onDelete(id);
            } catch (error) {
                console.error("Failed to delete news item:", error);
                alert("Failed to delete news item.");
            }
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                    >
                        <BackIcon className="w-5 h-5" />
                        Back
                    </button>
                    <Link
                        to="/portal/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                        title="Go to Home/Dashboard"
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <DocumentReportIcon className="w-10 h-10 text-rose-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Manage News</h1>
                            <p className="text-slate-600 mt-1">Create, edit, and delete news and announcements for the public website.</p>
                        </div>
                    </div>
                    {user.role === 'admin' && (
                        <button
                            onClick={handleOpenAdd}
                            className="btn btn-primary"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add News Item
                        </button>
                    )}
                </div>

                {sortedNews.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-700 text-lg font-semibold">No news items have been created yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Title</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {sortedNews.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{formatDateForDisplay(item.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="text-sky-600 hover:text-sky-800"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <NewsFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                item={editingItem}
                isSaving={isSaving}
            />
        </>
    );
};
export default ManageNewsPage;
