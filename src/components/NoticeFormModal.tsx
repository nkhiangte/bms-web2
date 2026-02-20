import React, { useState, useEffect, FormEvent } from 'react';
import { Notice, Grade } from '@/types';
import { GRADES_LIST } from '@/constants';
import { SpinnerIcon } from '@/components/Icons';

interface NoticeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notice: Omit<Notice, 'id' | 'createdBy'>) => Promise<void>;
    notice: Notice | null;
    isSaving: boolean;
}

const NoticeFormModal: React.FC<NoticeFormModalProps> = ({ isOpen, onClose, onSave, notice, isSaving }) => {
    const getInitialState = () => ({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        targetGrades: 'all' as Grade[] | 'all',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(notice ? { ...notice } : getInitialState());
        }
    }, [isOpen, notice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const values: Grade[] = [];
        let isAllSelected = false;
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                if (options[i].value === 'all') {
                    isAllSelected = true;
                    break;
                }
                values.push(options[i].value as Grade);
            }
        }
        setFormData(prev => ({ ...prev, targetGrades: isAllSelected ? 'all' : values }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const { id, createdBy, ...dataToSave } = formData as Notice;
        await onSave(dataToSave);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-slate-800">{notice ? 'Edit Notice' : 'New Notice'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input w-full mt-1" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Content</label>
                            <textarea name="content" value={formData.content} onChange={handleChange} rows={5} className="form-textarea w-full mt-1" required></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Visible to (Hold Ctrl/Cmd to select multiple)</label>
                            <select
                                multiple
                                value={Array.isArray(formData.targetGrades) ? formData.targetGrades : [formData.targetGrades]}
                                onChange={handleGradeChange}
                                className="w-full h-40 border-slate-300 rounded-md shadow-sm mt-1"
                            >
                                <option value="all">All Classes</option>
                                {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving && <SpinnerIcon className="w-5 h-5"/>}
                            {isSaving ? 'Saving...' : 'Save Notice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoticeFormModal;