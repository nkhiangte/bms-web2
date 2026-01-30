
import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Notice, Grade } from '../types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon, MegaphoneIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';
import NoticeFormModal from '../components/NoticeFormModal';
import { GRADES_LIST } from '../constants';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageNoticesPageProps {
    user: User;
    allNotices: Notice[];
    onSave: (notice: Omit<Notice, 'id' | 'createdBy'>, id?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ManageNoticesPage: React.FC<ManageNoticesPageProps> = ({ user, allNotices, onSave, onDelete }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const sortedNotices = useMemo(() => {
        return [...allNotices].sort((a, b) => b.date.localeCompare(a.date));
    }, [allNotices]);

    const handleOpenAdd = () => {
        setEditingNotice(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Omit<Notice, 'id' | 'createdBy'>) => {
        setIsSaving(true);
        await onSave(data, editingNotice?.id);
        setIsSaving(false);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <MegaphoneIcon className="w-10 h-10 text-teal-600"/>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Manage Notice Board</h1>
                        <p className="text-slate-600 mt-1">Create, edit, and delete notices for parents.</p>
                    </div>
                </div>

                <div className="flex justify-end mb-4">
                    <button onClick={handleOpenAdd} className="btn btn-primary"><PlusIcon className="w-5 h-5"/> Add Notice</button>
                </div>
                
                <div className="mt-6 space-y-3">
                    {sortedNotices.length > 0 ? sortedNotices.map(notice => (
                        <div key={notice.id} className="p-4 border rounded-lg bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800">{notice.title}</p>
                                    <p className="text-xs text-slate-500">
                                        Posted on: {formatDateForDisplay(notice.date)} by {notice.createdBy.name}
                                    </p>
                                    <div className="mt-1 text-xs text-slate-600">
                                        <strong>Visible to:</strong>{' '}
                                        {notice.targetGrades === 'all' ? 'All Classes' : notice.targetGrades.join(', ')}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEdit(notice)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(notice.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{notice.content}</p>
                        </div>
                    )) : <p className="text-center text-slate-500 py-10">No notices found.</p>}
                </div>
            </div>
             <NoticeFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                notice={editingNotice}
                isSaving={isSaving}
            />
        </>
    );
};

export default ManageNoticesPage;
