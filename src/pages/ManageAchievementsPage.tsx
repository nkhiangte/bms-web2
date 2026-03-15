import React, { useState, useEffect } from 'react';
import { seedAchievements } from '@/seedAchievements';
import { db } from '@/firebaseConfig';
import { uploadToImgBB, resizeImage } from '@/utils';
import { SpinnerIcon, PlusIcon, XIcon } from '@/components/Icons';
import { User } from '@/types';

interface Achievement {
    id: string;
    title: string;
    description: string;
    year: string;
    category: 'Academic' | 'Sports' | 'Science & Maths' | 'Quiz' | 'Other';
    studentName: string;
    imageUrl?: string;
}

const CATEGORIES = ['Academic', 'Sports', 'Science & Maths', 'Quiz', 'Other'] as const;

const EMPTY: Omit<Achievement, 'id'> = {
    title: '', description: '', year: new Date().getFullYear().toString(),
    category: 'Academic', studentName: '', imageUrl: '',
};

interface Props { user: User; }

const ManageAchievementsPage: React.FC<Props> = ({ user }) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // ← ADD THIS
    const [editing, setEditing] = useState<Partial<Achievement> | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filterCat, setFilterCat] = useState('All');
const seedScienceAchievements = async () => {
        const data = [
            { title: 'SLSMEE — First Participation', description: 'First participation in the State Level Science Mathematics & Environment Exhibition (SLSMEE) organized by SCERT.', year: '2006', category: 'Science & Maths', studentName: '', imageUrl: '' },
            { title: 'SLSMEE — 3rd Prize & Eastern India Science Fair', description: 'Lalrinchhani (Class IX) won 3rd Prize at SLSMEE and showcased her project at the Eastern India Science Fair 2015 at BITM, Kolkata.', year: '2014', category: 'Science & Maths', studentName: 'Lalrinchhani', imageUrl: '' },
            { title: 'SLSMEE — 1st Prizes & Eastern India Science Fair', description: 'Runrempuia and Vanlalfeli won 1st Prizes; Lalbuatsaiha won 3rd Prize. All three represented Mizoram at the Eastern India Science Fair 2015, BITM, Kolkata.', year: '2015', category: 'Science & Maths', studentName: 'Runrempuia, Vanlalfeli, Lalbuatsaiha', imageUrl: '' },
            { title: 'SLSMEE — 1st Prize & JNSMEE National Level', description: 'Joar Vanlalchhanhimi (Class IX) won 1st Prize and participated at JNSMEE 2017 in Bhopal, Madhya Pradesh.', year: '2016', category: 'Science & Maths', studentName: 'Joar Vanlalchhanhimi', imageUrl: '' },
            { title: 'SLSMEE — Prize Winners & Eastern India Science Fair', description: 'C.L. Kimteii and R. Lalrinmawii won prizes and presented at the Eastern India Science Fair 2018, BITM, Kolkata.', year: '2017', category: 'Science & Maths', studentName: 'C.L. Kimteii, R. Lalrinmawii', imageUrl: '' },
            { title: 'SLSMEE — 1st & 2nd Prize & Eastern India Science Fair', description: 'Zenngoluni won 1st Prize and Dosiamliana won 2nd Prize, both advancing to the Eastern India Science Fair 2019, BITM, Kolkata.', year: '2018', category: 'Science & Maths', studentName: 'Zenngoluni, Dosiamliana', imageUrl: '' },
            { title: 'SLSMEE — Eastern India Science Fair', description: 'C. Lalrohlui, K.C. Lalremruatpuia, Vanlalhlupuii, and Lalrohlupuii represented the state at the Eastern India Science Fair 2020, BITM, Kolkata.', year: '2019', category: 'Science & Maths', studentName: 'C. Lalrohlui, K.C. Lalremruatpuia, Vanlalhlupuii, Lalrohlupuii', imageUrl: '' },
            { title: 'SLSMEE — 1st Prize in Mathematics', description: 'Laldinpuii won 1st Prize in the Mathematics category at SLSMEE.', year: '2022', category: 'Science & Maths', studentName: 'Laldinpuii', imageUrl: '' },
            { title: 'SLSMEE — Prize Winners & NE India Science Fair', description: 'Lawmgsangzuali Hmar and Lalruatkima received prizes and represented the state at the NE India Science Fair, National Science Centre, Guwahati.', year: '2024', category: 'Science & Maths', studentName: 'Lawmgsangzuali Hmar, Lalruatkima', imageUrl: 'https://i.ibb.co/wJgWfX6/science-lab.jpg' },
            { title: 'INSPIRE Award MANAK — 1st Prize & National Exhibition', description: 'Lalhmangaihzuali won 1st Prize at the state level and represented Mizoram at the National Exhibition, New Delhi.', year: '2012', category: 'Science & Maths', studentName: 'Lalhmangaihzuali', imageUrl: '' },
            { title: 'INSPIRE Award MANAK — 2nd Prize & National Exhibition', description: 'Lalramengmawia won 2nd Prize at the state level and participated at the National Exhibition, New Delhi.', year: '2015', category: 'Science & Maths', studentName: 'Lalramengmawia', imageUrl: '' },
            { title: 'INSPIRE Award MANAK — National Level Selection', description: 'Lalruatpuia Hrahsel was selected for the National Level, but the exhibition was cancelled due to the Covid-19 pandemic.', year: '2020', category: 'Science & Maths', studentName: 'Lalruatpuia Hrahsel', imageUrl: '' },
            { title: 'INSPIRE Award MANAK — 2nd Prize & National Exhibition', description: 'J. Malsawma won 2nd Prize and presented at the National Exhibition, New Delhi.', year: '2021', category: 'Science & Maths', studentName: 'J. Malsawma', imageUrl: '' },
            { title: 'INSPIRE Award MANAK — 2nd Prize & National Level', description: 'Paul K. Lalhruaitluanga won 2nd Prize at the state level and is scheduled to participate at the National Level in 2025.', year: '2024', category: 'Science & Maths', studentName: 'Paul K. Lalhruaitluanga', imageUrl: 'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-6900955725830066556-n.jpg' },
            { title: 'NCSC — 1st Prize District & State Level', description: 'Students won 1st Prizes at the District Level and advanced to the State Level.', year: '2012', category: 'Science & Maths', studentName: '', imageUrl: '' },
            { title: 'NCSC — National Level, Bengaluru', description: 'H. Lalrinchhani won 1st Prize at District Level, advanced to State Level, and was selected for the National Level in Bengaluru.', year: '2014', category: 'Science & Maths', studentName: 'H. Lalrinchhani', imageUrl: '' },
            { title: 'NCSC — National Level, Chandigarh', description: 'C. Lalrindiki represented Mizoram at the National Level in Chandigarh.', year: '2015', category: 'Science & Maths', studentName: 'C. Lalrindiki', imageUrl: '' },
            { title: 'NCSC — National Level, Baramati (Pune)', description: 'Lalhunthari presented her project at the National Level in Baramati, Pune.', year: '2016', category: 'Science & Maths', studentName: 'Lalhunthari', imageUrl: '' },
            { title: 'NCSC — 1st Prize District & State Level', description: 'Lalzikpuii Hrahsel won 1st Prize at the District Level and advanced to the State Level.', year: '2017', category: 'Science & Maths', studentName: 'Lalzikpuii Hrahsel', imageUrl: '' },
            { title: 'NCSC — National Level, Bhubaneswar', description: 'Lalruatlawmi was selected for the National Level and presented in Bhubaneswar.', year: '2018', category: 'Science & Maths', studentName: 'Lalruatlawmi', imageUrl: '' },
            { title: 'NCSC — National Level Selection', description: 'J. Malsawmzuali won 1st Prize at District Level, advanced to State Level, and was selected for the National Level.', year: '2023', category: 'Science & Maths', studentName: 'J. Malsawmzuali', imageUrl: '' },
            { title: 'Science Tour — NE Science Tour, Guwahati', description: 'Students Lalzikpuii Hrahsel and Lalruatlawmi joined the NE tour organized by SCERT, Mizoram.', year: '2017', category: 'Science & Maths', studentName: 'Lalzikpuii Hrahsel, Lalruatlawmi', imageUrl: '' },
            { title: 'Science Tour — NE Science Tour, Guwahati', description: 'Chingliansangi and Lalhmangaihi were selected for the enriching NE science tour.', year: '2021', category: 'Science & Maths', studentName: 'Chingliansangi, Lalhmangaihi', imageUrl: '' },
            { title: 'Science Tour — Indian International Science Festival, Faridabad', description: 'Pausawmdawngzela actively participated in this national-level event, gaining valuable exposure.', year: '2023', category: 'Science & Maths', studentName: 'Pausawmdawngzela', imageUrl: '' },
            { title: 'Science Tour — Indian International Science Festival, IIT Guwahati', description: '20 Class IX students accompanied by 3 teachers represented the school at the prestigious Indian International Science Festival at IIT Guwahati.', year: '2024', category: 'Science & Maths', studentName: '', imageUrl: '' },
            { title: 'State Mathematics Competition — Consolation Prize', description: 'Runrempuia won a Consolation Prize at the State-Level Mathematics Competition organized by MMS & MISTIC.', year: '2016', category: 'Science & Maths', studentName: 'Runrempuia', imageUrl: '' },
            { title: 'State Mathematics Competition — Centre Prize', description: 'Thangbiakmuani won the Centre Prize at the State-Level Mathematics Competition.', year: '2019', category: 'Science & Maths', studentName: 'Thangbiakmuani', imageUrl: '' },
            { title: 'State Mathematics Competition — 1st Prize & Consolation Prize', description: 'Esther Tingbiakmuani won 1st Prize; C. Lalrosanga won a Consolation Prize at the State-Level Mathematics Competition.', year: '2022', category: 'Science & Maths', studentName: 'Esther Tingbiakmuani, C. Lalrosanga', imageUrl: '' },
            { title: 'State Mathematics Competition — 1st Prize', description: 'Paumuansanga won 1st Prize at the State-Level Mathematics Competition.', year: '2023', category: 'Science & Maths', studentName: 'Paumuansanga', imageUrl: '' },
        ];
        const batch = db.batch();
        data.forEach(a => batch.set(db.collection('achievements').doc(), a));
        await batch.commit();
        alert('Science achievements seeded!');
    };
    useEffect(() => {
        // ✅ Don't subscribe until user is ready
        if (!user) return;

        setLoading(true);
        setError(null);

        const unsub = db.collection('achievements')
            .orderBy('year', 'desc')
            .onSnapshot(
                snap => {
                    setAchievements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
                    setLoading(false);
                },
                (err) => {
                    // ✅ Properly handle and display the error
                    console.error('Firestore error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );
        return () => unsub();
    }, [user]); // ✅ Re-run when user changes, not just on mount

    const handleNew = () => setEditing({ ...EMPTY });

    const handleSave = async () => {
        if (!editing?.title?.trim()) return;
        setSaving(true);
        try {
            const data = {
                title: editing.title?.trim() || '',
                description: editing.description?.trim() || '',
                year: editing.year || new Date().getFullYear().toString(),
                category: editing.category || 'Other',
                studentName: editing.studentName?.trim() || '',
                imageUrl: editing.imageUrl || '',
            };
            if (editing.id) {
                await db.collection('achievements').doc(editing.id).update(data);
            } else {
                await db.collection('achievements').add(data);
            }
            setEditing(null);
        } catch (err: any) {
            alert('Save failed: ' + err.message); // ✅ Don't silently fail
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this achievement?')) return;
        try {
            await db.collection('achievements').doc(id).delete();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const resized = await resizeImage(file, 1024, 1024, 0.85);
            const url = await uploadToImgBB(resized);
            setEditing(prev => prev ? { ...prev, imageUrl: url } : prev);
        } catch {
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500';
    const labelCls = 'block text-xs font-semibold text-slate-500 uppercase mb-1';
    const filtered = filterCat === 'All' ? achievements : achievements.filter(a => a.category === filterCat);

    // ✅ Show error state instead of blank screen
    if (error) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700 font-semibold">Failed to load achievements</p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                    <button onClick={seedScienceAchievements} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Seed Science</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Achievements</h1>
                    <p className="text-sm text-slate-500 mt-1">Add and manage student achievements shown on the public website.</p>
                </div>
                <button onClick={handleNew} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 text-sm font-semibold transition-colors">
                    <PlusIcon className="w-4 h-4" /> Add Achievement
                </button>
            </div>
<button onClick={seedAchievements} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
    Seed Once
</button>
            {/* Edit / Add Form */}
            {editing && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-slate-800">{editing.id ? 'Edit Achievement' : 'New Achievement'}</h2>
                        <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelCls}>Title *</label>
                            <input type="text" className={inputCls} placeholder="e.g. State Level Science Award" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} autoFocus />
                        </div>
                        <div>
                            <label className={labelCls}>Student Name</label>
                            <input type="text" className={inputCls} placeholder="e.g. John Doe" value={editing.studentName || ''} onChange={e => setEditing({ ...editing, studentName: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Year</label>
                            <input type="text" className={inputCls} placeholder="e.g. 2024" value={editing.year || ''} onChange={e => setEditing({ ...editing, year: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Category</label>
                            <select className={inputCls} value={editing.category || 'Academic'} onChange={e => setEditing({ ...editing, category: e.target.value as any })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Image (optional)</label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                                    {uploading ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : '📷'}
                                    {uploading ? 'Uploading...' : 'Upload Photo'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                                {editing.imageUrl && <img src={editing.imageUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />}
                                {editing.imageUrl && <button onClick={() => setEditing({ ...editing, imageUrl: '' })} className="text-red-400 hover:text-red-600 text-xs">Remove</button>}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Description</label>
                            <textarea className={inputCls} rows={3} placeholder="Describe the achievement..." value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button onClick={handleSave} disabled={saving || !editing.title?.trim()} className="flex items-center gap-2 bg-green-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                            {saving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : '✓'} {saving ? 'Saving...' : 'Save Achievement'}
                        </button>
                        <button onClick={() => setEditing(null)} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-5">
                {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${filterCat === cat ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16"><SpinnerIcon className="w-8 h-8 animate-spin text-sky-500" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-slate-500">No achievements yet. Click "Add Achievement" to get started.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title / Student</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-32">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-20">Year</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-16">Image</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800">{item.title}</p>
                                        {item.studentName && <p className="text-xs text-sky-600 mt-0.5">🎓 {item.studentName}</p>}
                                        {item.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.category}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{item.year}</td>
                                    <td className="px-4 py-3">
                                        {item.imageUrl
                                            ? <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                                            : <span className="text-slate-300 text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <button onClick={() => setEditing({ ...item })} className="text-sky-600 hover:text-sky-800 font-semibold mr-3">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
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

export default ManageAchievementsPage;
