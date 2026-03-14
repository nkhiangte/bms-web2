import React, { useState } from 'react';
import { NavMenuItem } from '@/types';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon, XIcon } from '@/components/Icons';

interface Props {
    navigation: NavMenuItem[];
    onSave: (item: Partial<NavMenuItem>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ManageNavigationPage: React.FC<Props> = ({ navigation, onSave, onDelete }) => {
    const [editingItem, setEditingItem] = useState<Partial<NavMenuItem> | null>(null);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Website Menu Management</h1>
                <button
                    onClick={() => setEditingItem({ label: '', path: '', order: navigation.length + 1 })}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                    <PlusIcon className="w-4 h-4" /> + Add Menu Item
                </button>
            </div>

            {editingItem && (
                <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h2 className="text-base font-semibold text-slate-800 mb-4">{editingItem.id ? 'Edit' : 'Add'} Menu Link</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Label</label>
                            <input
                                type="text"
                                className="p-2 border border-slate-300 rounded-lg text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={editingItem.label ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                placeholder="e.g. About Us"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Path (URL)</label>
                            <input
                                type="text"
                                className="p-2 border border-slate-300 rounded-lg text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={editingItem.path ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, path: e.target.value })}
                                placeholder="e.g. /about"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Display Order</label>
                            <input
                                type="number"
                                className="p-2 border border-slate-300 rounded-lg text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={editingItem.order ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => { onSave(editingItem); setEditingItem(null); }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm font-semibold"
                        >
                            <SaveIcon className="w-4 h-4" /> Save
                        </button>
                        <button
                            onClick={() => setEditingItem(null)}
                            className="bg-slate-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-500 transition-colors text-sm font-semibold"
                        >
                            <XIcon className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: '500px' }}>
                        <colgroup>
                            <col style={{ width: '56px' }} />
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '32%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '14%' }} />
                        </colgroup>
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">#</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Label</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Path</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Parent</th>
                                <th className="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {navigation.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-3 text-slate-500 text-center text-xs">{item.order}</td>
                                    <td className="px-3 py-3 font-semibold text-slate-800 truncate" title={item.label}>
                                        {item.label || <span className="text-slate-300 italic text-xs">—</span>}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600 truncate font-mono text-xs" title={item.path}>
                                        {item.path || <span className="text-slate-300 italic">—</span>}
                                    </td>
                                    <td className="px-3 py-3 text-slate-500 text-xs truncate">
                                        {item.parentId ? item.parentId : 'Top-level'}
                                    </td>
                                    <td className="px-3 py-3 text-right space-x-2">
                                        <button onClick={() => setEditingItem(item)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors">Edit</button>
                                        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 font-semibold text-xs transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {navigation.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400 italic">
                                        No menu items yet. Click "+ Add Menu Item" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageNavigationPage;
