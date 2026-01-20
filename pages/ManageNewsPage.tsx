import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { NewsItem, User } from '../types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon, DocumentReportIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageNewsPageProps {
    news: NewsItem[];
    onAdd: () => void;
    onEdit: (item: NewsItem) => void;
    onDelete: (item: NewsItem) => void;
    user: User;
}

const ManageNewsPage: React.FC<ManageNewsPageProps> = ({ news, onAdd, onEdit, onDelete, user }) => {
    const navigate = useNavigate();

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
                        onClick={onAdd}
                        className="btn btn-primary"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add News Item
                    </button>
                )}
            </div>

            {news.length === 0 ? (
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
                            {news.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{formatDateForDisplay(item.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-sky-600 hover:text-sky-800"
                                                title="Edit"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item)}
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
    );
};
export default ManageNewsPage;