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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Website Menu Management</h1>
                <button 
                    onClick={() => setEditingItem({ label: '', path: '', order: navigation.length + 1 })}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" /> Add Menu Item
                </button>
            </div>

            {editingItem && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">{editingItem.id ? 'Edit' : 'Add'} Link</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Label</label>
                            <input
                                type="text"
                                className="p-2 border rounded"
                                value={editingItem.label}
                                onChange={e => setEditingItem({...editingItem, label: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Path (URL)</label>
                            <input
                                type="text"
                                className="p-2 border rounded"
                                value={editingItem.path}
                                onChange={e => setEditingItem({...editingItem, path: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Display Order</label>
                            <input
                                type="number"
                                className="p-2 border rounded"
                                value={editingItem.order}
                                onChange={e => setEditingItem({...editingItem, order: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={() => { onSave(editingItem); setEditingItem(null); }} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"><SaveIcon className="w-4 h-4"/> Save</button>
                        <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white px-4 py-2 rounded flex items-center gap-2"><XIcon className="w-4 h-4"/> Cancel</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {navigation.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.order}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.label}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.path}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setEditingItem(item)} className="text-blue-600 hover:text-blue-900 mr-4"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageNavigationPage;