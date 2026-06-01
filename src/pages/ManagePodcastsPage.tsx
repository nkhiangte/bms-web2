import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PodcastEpisode, User } from '@/types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon, PodcastIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import PodcastFormModal from '@/components/PodcastFormModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManagePodcastsPageProps {
    podcasts: PodcastEpisode[];
    onSave: (item: Omit<PodcastEpisode, 'id'>, id?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    user: User;
}

const ManagePodcastsPage: React.FC<ManagePodcastsPageProps> = ({ podcasts, onSave, onDelete, user }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PodcastEpisode | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const sortedPodcasts = useMemo(() => {
        return [...podcasts].sort((a, b) => b.date.localeCompare(a.date));
    }, [podcasts]);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: PodcastEpisode) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Omit<PodcastEpisode, 'id'>) => {
        setIsSaving(true);
        try {
            await onSave(data, editingItem?.id);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save podcast episode:", error);
            alert("Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this podcast episode?")) {
            try {
                await onDelete(id);
            } catch (error) {
                console.error("Failed to delete podcast:", error);
                alert("Failed to delete.");
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
                        <PodcastIcon className="w-10 h-10 text-indigo-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Manage Podcasts</h1>
                            <p className="text-slate-600 mt-1">Create, edit, and delete podcast episodes.</p>
                        </div>
                    </div>
                    {user.role === 'admin' && (
                        <button
                            onClick={handleOpenAdd}
                            className="btn btn-primary"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Episode
                        </button>
                    )}
                </div>

                {sortedPodcasts.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-700 text-lg font-semibold">No podcast episodes have been created yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Duration</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {sortedPodcasts.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{formatDateForDisplay(item.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.duration || '-'}</td>
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

            <PodcastFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                item={editingItem}
                isSaving={isSaving}
            />
        </>
    );
};
export default ManagePodcastsPage;
