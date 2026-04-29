import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { SpinnerIcon, PlusIcon, XIcon, EditIcon, TrashIcon as DeleteIcon, BookOpenIcon as ImageIcon } from '@/components/Icons';
import { User, HSLCResultSummary } from '@/types';

interface Props { user: User; }

const ManageHSLCResultsPage: React.FC<Props> = ({ user }) => {
    const [results, setResults] = useState<HSLCResultSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<HSLCResultSummary> | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const unsub = db.collection('hslc_results')
            .orderBy('year', 'desc')
            .onSnapshot(snap => {
                setResults(snap.docs.map(d => ({ id: d.id, ...d.data() } as HSLCResultSummary)));
                setLoading(false);
            });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        if (!editing?.year) return;
        setSaving(true);
        try {
            const data = {
                year: Number(editing.year),
                appeared: Number(editing.appeared || 0),
                passed: Number(editing.passed || 0),
                passPercentage: editing.passPercentage || '0%',
                distinction: Number(editing.distinction || 0),
                firstDivision: Number(editing.firstDivision || 0),
                secondDivision: Number(editing.secondDivision || 0),
                thirdDivision: Number(editing.thirdDivision || 0),
                distinctionListImageUrl: editing.distinctionListImageUrl || '',
            };
            
            if (editing.id) {
                await db.collection('hslc_results').doc(editing.id).update(data);
            } else {
                await db.collection('hslc_results').add(data);
            }
            setEditing(null);
        } catch (err: any) {
            alert('Save failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this result entry?')) return;
        try {
            await db.collection('hslc_results').doc(id).delete();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const resized = await resizeImage(file, 1600, 2400, 0.9);
            const url = await uploadToImgBB(resized);
            setEditing(prev => prev ? { ...prev, distinctionListImageUrl: url } : prev);
        } catch {
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500';
    const labelCls = 'block text-xs font-semibold text-slate-500 uppercase mb-1';

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage HSLC Results</h1>
                    <p className="text-sm text-slate-500 mt-1">Update yearly HSLC performance statistics and distinction lists.</p>
                </div>
                <button 
                    onClick={() => setEditing({ year: new Date().getFullYear() })} 
                    className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 text-sm font-semibold transition-colors"
                >
                    <PlusIcon className="w-4 h-4" /> Add Year Entry
                </button>
            </div>

            {editing && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-slate-800">{editing.id ? `Edit HSLC ${editing.year}` : 'New HSLC Entry'}</h2>
                        <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className={labelCls}>Year *</label>
                            <input type="number" className={inputCls} value={editing.year || ''} onChange={e => setEditing({ ...editing, year: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelCls}>Appeared</label>
                            <input type="number" className={inputCls} value={editing.appeared || 0} onChange={e => setEditing({ ...editing, appeared: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelCls}>Passed</label>
                            <input type="number" className={inputCls} value={editing.passed || 0} onChange={e => {
                                const passed = parseInt(e.target.value);
                                const appeared = editing.appeared || 1;
                                const percentage = ((passed / appeared) * 100).toFixed(2) + '%';
                                setEditing({ ...editing, passed, passPercentage: percentage });
                            }} />
                        </div>
                        <div>
                            <label className={labelCls}>Pass %</label>
                            <input type="text" className={inputCls} value={editing.passPercentage || ''} onChange={e => setEditing({ ...editing, passPercentage: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Distinction</label>
                            <input type="number" className={inputCls} value={editing.distinction || 0} onChange={e => setEditing({ ...editing, distinction: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelCls}>I Division</label>
                            <input type="number" className={inputCls} value={editing.firstDivision || 0} onChange={e => setEditing({ ...editing, firstDivision: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelCls}>II Division</label>
                            <input type="number" className={inputCls} value={editing.secondDivision || 0} onChange={e => setEditing({ ...editing, secondDivision: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelCls}>III Division</label>
                            <input type="number" className={inputCls} value={editing.thirdDivision || 0} onChange={e => setEditing({ ...editing, thirdDivision: parseInt(e.target.value) })} />
                        </div>
                        <div className="col-span-2 md:col-span-4">
                            <label className={labelCls}>Distinction List Image (Optional)</label>
                            <div className="flex items-center gap-4 border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                                {editing.distinctionListImageUrl ? (
                                    <div className="relative group">
                                        <img src={editing.distinctionListImageUrl} alt="Distinction List" className="w-24 h-32 object-cover rounded shadow-md" />
                                        <button 
                                            onClick={() => setEditing({ ...editing, distinctionListImageUrl: '' })}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-32 flex items-center justify-center border-2 border-slate-200 rounded text-slate-300">
                                        <ImageIcon className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <p className="text-xs text-slate-500 mb-2">Upload the scanned copy of the HSLC Distinction List provided by MBSE.</p>
                                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                        {uploading ? <SpinnerIcon className="w-4 h-4 animate-spin text-sky-600" /> : <ImageIcon className="w-4 h-4" />}
                                        {uploading ? 'Uploading...' : editing.distinctionListImageUrl ? 'Change Image' : 'Upload Image'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={handleSave} 
                            disabled={saving || !editing.year} 
                            className="bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            {saving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : '✓'}
                            {saving ? 'Saving...' : 'Save HSLC Result'}
                        </button>
                        <button onClick={() => setEditing(null)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Year</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Appeared</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Passed</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase text-sky-600">Pass %</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase text-amber-500">Dist.</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Div. I/II/III</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">List Image</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                        {loading ? (
                            <tr><td colSpan={8} className="py-20 text-center"><SpinnerIcon className="w-8 h-8 animate-spin mx-auto text-sky-500" /></td></tr>
                        ) : results.length === 0 ? (
                            <tr><td colSpan={8} className="py-20 text-center text-slate-400 italic">No HSLC results added yet.</td></tr>
                        ) : (
                            results.map(res => (
                                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-800">{res.year}</td>
                                    <td className="px-4 py-3 text-center">{res.appeared}</td>
                                    <td className="px-4 py-3 text-center">{res.passed}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-sky-600">{res.passPercentage}</td>
                                    <td className="px-4 py-3 text-center font-bold text-amber-600">{res.distinction}</td>
                                    <td className="px-4 py-3 text-center">{res.firstDivision} / {res.secondDivision} / {res.thirdDivision}</td>
                                    <td className="px-4 py-3 text-center text-xs font-semibold">
                                        {res.distinctionListImageUrl ? (
                                            <a href={res.distinctionListImageUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline flex items-center justify-center gap-1">
                                                <ImageIcon className="w-3 h-3" /> View
                                            </a>
                                        ) : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <button onClick={() => setEditing({ ...res })} className="text-sky-600 hover:text-sky-800 font-semibold mr-4 p-1 rounded-full hover:bg-sky-50 transition-colors" title="Edit">
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-700 font-semibold p-1 rounded-full hover:bg-red-50 transition-colors" title="Delete">
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-start">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600"><PlusIcon className="w-5 h-5 rotate-45" /></div>
                <div>
                    <h4 className="font-bold text-amber-900 text-sm">Deployment Guide</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        After adding the 2026 results here, they will automatically appear in the Academic Achievements page and chart. 
                        If you upload a distinction list image, students can view it by clicking on the year 2026.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManageHSLCResultsPage;
