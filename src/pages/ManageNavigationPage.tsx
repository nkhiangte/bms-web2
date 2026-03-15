import React, { useState } from 'react';
import { NavMenuItem } from '@/types';

interface Props {
    navigation: NavMenuItem[];
    onSave: (item: Partial<NavMenuItem>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ManageNavigationPage: React.FC<Props> = ({ navigation, onSave, onDelete }) => {
    const [editingItem, setEditingItem] = useState<Partial<NavMenuItem> | null>(null);

    const topLevelItems = navigation.filter(item => !item.parent);

    const handleNew = () => {
        setEditingItem({ label: '', path: '', order: navigation.length + 1 });
    };

    const handleSave = async () => {
        if (!editingItem || !editingItem.label?.trim()) return;
        const toSave = { ...editingItem };
        if (!toSave.parent) delete toSave.parent;
        await onSave(toSave);
        setEditingItem(null);
    };

    const getParentLabel = (item: NavMenuItem) => {
        if (!item.parent) return null;
        return navigation.find(n => n.id === item.parent)?.label || item.parent;
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Website Menu Management</h1>
                <button onClick={handleNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    + Add Menu Item
                </button>
            </div>

            {editingItem && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">{editingItem.id ? 'Edit Menu Link' : 'Add New Menu Item'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">LABEL <span className="text-red-500">*</span></label>
                            <input type="text" className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" placeholder="e.g. Achievements" value={editingItem.label ?? ''} onChange={e => setEditingItem({ ...editingItem, label: e.target.value })} autoFocus />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">PATH (URL)</label>
                            <input type="text" className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" placeholder="e.g. /achievements" value={editingItem.path ?? ''} onChange={e => setEditingItem({ ...editingItem, path: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">DISPLAY ORDER</label>
                            <input type="number" className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" value={editingItem.order ?? ''} min={1} onChange={e => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })} />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-3">
                            <label className="text-sm font-medium text-gray-600">PARENT MENU</label>
                            <select className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white" value={editingItem.parent ?? ''} onChange={e => setEditingItem({ ...editingItem, parent: e.target.value || undefined })}>
                                <option value="">— Top-level (no parent) —</option>
                                {topLevelItems.filter(item => item.id !== editingItem.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(item => (
                                    <option key={item.id} value={item.id}>{item.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400">Select a parent to make this a dropdown child item.</p>
                        </div>
                    </div>
                    <div className="mt-5 flex gap-3">
                        <button onClick={handleSave} disabled={!editingItem.label?.trim()} className="bg-green-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">✓ Save</button>
                        <button onClick={() => setEditingItem(null)} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">✕ Cancel</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '28%' }} />
                        <col style={{ width: '34%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Path</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {navigation.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 italic">No menu items yet. Click "Add Menu Item" to get started.</td></tr>
                        ) : (
                            [...navigation].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.order}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate" title={item.label}>{item.label || <span className="italic text-gray-300">—</span>}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 truncate" title={item.path}>{item.path || <span className="italic text-gray-300">—</span>}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 truncate">{getParentLabel(item) || <span className="italic text-gray-300">Top-level</span>}</td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <button onClick={() => setEditingItem({ ...item })} className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-medium">Edit</button>
                                        <button onClick={() => { if (window.confirm(`Delete "${item.label}"?`)) onDelete(item.id); }} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-bold mb-1">💡 Tips</p>
                <p>To add <strong>Achievements</strong> under Student Life: Label = <code>Achievements</code>, Path = <code>/achievements</code>, Parent = <code>Student Life</code>, Order = <code>3</code>.</p>
            </div>
        </div>
    );
};

export default ManageNavigationPage;
