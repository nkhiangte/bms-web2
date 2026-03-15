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

    const inputStyle: React.CSSProperties = {
        color: '#1e293b',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '8px 12px',
        width: '100%',
        fontSize: '14px',
        outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        color: '#475569',
        fontSize: '12px',
        fontWeight: 600,
        marginBottom: '4px',
        display: 'block',
        textTransform: 'uppercase',
    };

    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>Website Menu Management</h1>
                <button onClick={handleNew} style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                    + Add Menu Item
                </button>
            </div>

            {/* Edit Form */}
            {editingItem && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
                        {editingItem.id ? 'Edit Menu Link' : 'Add New Menu Item'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Label *</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. Achievements"
                                value={editingItem.label ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Path (URL)</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. /achievements"
                                value={editingItem.path ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, path: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Display Order</label>
                            <input
                                type="number"
                                style={inputStyle}
                                value={editingItem.order ?? ''}
                                min={1}
                                onChange={e => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Parent Menu</label>
                            <select
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                value={editingItem.parent ?? ''}
                                onChange={e => setEditingItem({ ...editingItem, parent: e.target.value || undefined })}
                            >
                                <option value="">— Top-level (no parent) —</option>
                                {topLevelItems
                                    .filter(item => item.id !== editingItem.id)
                                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                    .map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                    ))}
                            </select>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Select a parent to make this a dropdown child item.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button
                            onClick={handleSave}
                            disabled={!editingItem.label?.trim()}
                            style={{ background: '#16a34a', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', opacity: editingItem.label?.trim() ? 1 : 0.5 }}
                        >
                            ✓ Save
                        </button>
                        <button
                            onClick={() => setEditingItem(null)}
                            style={{ background: '#e2e8f0', color: '#475569', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '26%' }} />
                        <col style={{ width: '32%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '14%' }} />
                    </colgroup>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            {['#', 'Label', 'Path', 'Parent', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {navigation.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>
                                    No menu items yet. Click "Add Menu Item" to get started.
                                </td>
                            </tr>
                        ) : (
                            [...navigation]
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{item.order}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.label}>
                                            {item.label || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.path}>
                                            {item.path || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {getParentLabel(item) || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Top-level</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <button onClick={() => setEditingItem({ ...item })} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginRight: '12px' }}>Edit</button>
                                            <button onClick={() => { if (window.confirm(`Delete "${item.label}"?`)) onDelete(item.id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tip */}
            <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', fontSize: '13px', color: '#1e40af' }}>
                <p style={{ fontWeight: 700, marginBottom: '4px' }}>💡 Tips</p>
                <p>To add <strong>Achievements</strong> under Student Life: Label = <code>Achievements</code>, Path = <code>/achievements</code>, Parent = <code>Student Life</code>, Order = <code>3</code>.</p>
            </div>
        </div>
    );
};

export default ManageNavigationPage;
