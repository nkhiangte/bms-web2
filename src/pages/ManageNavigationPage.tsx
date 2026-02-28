import React, { useState } from 'react';
import { NavMenuItem } from '@/types';

interface Props {
    navigation: NavMenuItem[];
    onSave: (item: Partial<NavMenuItem>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ManageNavigationPage: React.FC<Props> = ({ navigation, onSave, onDelete }) => {
    const [editingItem, setEditingItem] = useState<Partial<NavMenuItem> | null>(null);

    const handleNew = () => {
        setEditingItem({ label: '', path: '', order: navigation.length + 1, parentLabel: '' });
    };

    const handleSave = async () => {
        if (!editingItem || !editingItem.label?.trim()) return;
        await onSave(editingItem);
        setEditingItem(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Website Menu Management</h1>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                    + Add Menu Item
                </button>
            </div>

            {editingItem && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingItem.id ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Label <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Syllabus"
                                value={editingItem.label ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Path (URL)</label>
                            <input
                                type="text"
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. /textbooks or https://..."
                                value={editingItem.path ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, path: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Parent Group</label>
                            <input
                                type="text"
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Academics, Admissions (leave blank for top-level)"
                                value={(editingItem as any).parentLabel ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, parentLabel: e.target.value } as any)}
                            />
                            <p className="text-xs text-gray-400">Must match an existing top-level menu label exactly.</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Display Order</label>
                            <input
                                type="number"
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingItem.order ?? ''}
                                min={1}
                                onChange={e => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
                            />
                            <p className="text-xs text-gray-400">Lower numbers appear first.</p>
                        </div>
                    </div>
                    <div className="mt-5 flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!editingItem.label?.trim()}
                            className="bg-green-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                            ✓ Save
                        </button>
                        <button
                            onClick={() => setEditingItem(null)}
                            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Path</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {navigation.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 italic">
                                    No menu items yet. Click "Add Menu Item" to get started.
                                </td>
                            </tr>
                        ) : (
                            navigation.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.order}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.label}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.path || <span className="italic text-gray-300">—</span>}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{(item as any).parentLabel || <span className="italic text-gray-300">Top-level</span>}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => { if (window.confirm(`Delete "${item.label}"?`)) onDelete(item.id); }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-bold mb-1">💡 Tips</p>
                <p>To add <strong>Syllabus</strong> under Academics: set Label = <code>Syllabus</code>, Path = <code>/textbooks</code>, Parent Group = <code>Academics</code>, Order = <code>3</code>.</p>
            </div>
        </div>
    );
};

export default ManageNavigationPage;
