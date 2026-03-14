import React, { useState, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    BackIcon, 
    HomeIcon, 
    BriefcaseIcon,
    InboxArrowDownIcon,
    UserGroupIcon,
    DocumentReportIcon,
    CogIcon,
    CurrencyDollarIcon,
    EditIcon,
    TrashIcon,
    PlusIcon,
} from '@/components/Icons';
import { db } from '@/firebaseConfig';
import { formatStudentId } from '@/utils';
import { Student } from '@/types';
import {
    DisclosureData,
    DEFAULT_DISCLOSURE_DATA,
    DISCLOSURE_SECTIONS,
    EnrolmentRow,
    BoardResultRow,
    FeeRow,
    CommitteeRow,
} from './MandatoryDisclosureData';

const { Link, useNavigate } = ReactRouterDOM as any;

// ─── Icons ────────────────────────────────────────────────────────────────────

const DocIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const DisclosureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
);

// ─── AdminCard (unchanged) ────────────────────────────────────────────────────

const AdminCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    link?: string;
    onClick?: () => void;
    count?: number;
    accent?: string;
}> = ({ title, description, icon, link, onClick, count, accent = 'border-sky-500' }) => {
    const inner = (
        <div className="flex items-start gap-4">
            <div className="bg-sky-100 text-sky-600 p-3 rounded-lg shrink-0">{icon}</div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{title}</h3>
                <p className="text-slate-600 text-sm mt-1">{description}</p>
            </div>
            {count !== undefined && (
                <div className="ml-auto text-3xl font-bold text-sky-600">{count}</div>
            )}
        </div>
    );

    const cls = `block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border-l-4 ${accent}`;

    if (onClick) return <button className={`${cls} text-left w-full`} onClick={onClick}>{inner}</button>;
    return <Link to={link} className={cls}>{inner}</Link>;
};

// ─── Disclosure Editor atoms ──────────────────────────────────────────────────

const Field: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}> = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div className="grid grid-cols-5 gap-3 items-start py-2.5 border-b border-slate-100 last:border-0">
        <label className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wide pt-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="col-span-3 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 bg-white text-slate-800 placeholder:text-slate-300"
        />
    </div>
);

const SubCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
        <div className="bg-red-800 px-5 py-2.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">{title}</h4>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// ─── Disclosure Editor (embedded) ────────────────────────────────────────────

const DisclosureEditor: React.FC<{
    initialData: DisclosureData;
    onSave: (data: DisclosureData) => Promise<void>;
    onClose: () => void;
}> = ({ initialData, onSave, onClose }) => {
    const [data, setData] = useState<DisclosureData>(initialData ?? DEFAULT_DISCLOSURE_DATA);
    const [activeSection, setActiveSection] = useState('general');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const update = useCallback(<K extends keyof DisclosureData>(
        section: K,
        field: keyof DisclosureData[K],
        value: string
    ) => {
        setData(prev => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } }));
        setSaved(false);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ ...data, lastUpdated: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) });
            setSaved(true);
        } finally {
            setSaving(false);
        }
    };

    // ── Array updaters ──

    const updateDocUrl = (i: number, url: string) => {
        const docs = [...data.documents];
        docs[i] = { ...docs[i], fileUrl: url };
        setData(p => ({ ...p, documents: docs }));
        setSaved(false);
    };

    const updateAcademicUrl = (i: number, url: string) => {
        const ac = [...data.academics];
        ac[i] = { ...ac[i], fileUrl: url };
        setData(p => ({ ...p, academics: ac }));
        setSaved(false);
    };

    const updateEnrolment = (i: number, field: keyof EnrolmentRow, val: string) => {
        const rows = [...data.enrolment.rows];
        rows[i] = { ...rows[i], [field]: val };
        setData(p => ({ ...p, enrolment: { ...p.enrolment, rows } }));
        setSaved(false);
    };

    const updateBoardResult = (i: number, field: keyof BoardResultRow, val: string) => {
        const rows = [...data.boardResults];
        rows[i] = { ...rows[i], [field]: val };
        setData(p => ({ ...p, boardResults: rows }));
        setSaved(false);
    };

    const updateFeeRow = (i: number, field: keyof FeeRow, val: string) => {
        const rows = [...data.feeStructure];
        rows[i] = { ...rows[i], [field]: val };
        setData(p => ({ ...p, feeStructure: rows }));
        setSaved(false);
    };

    const updateCommittee = (i: number, field: keyof CommitteeRow, val: string) => {
        const rows = [...data.committees];
        rows[i] = { ...rows[i], [field]: val };
        setData(p => ({ ...p, committees: rows }));
        setSaved(false);
    };

    const inputCls = "w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-300 bg-white";

    return (
        <div className="mt-8 border-2 border-red-100 rounded-2xl overflow-hidden">

            {/* Editor header */}
            <div className="bg-red-800 px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-white font-bold text-base">Mandatory Public Disclosure Editor</h2>
                    <p className="text-red-200 text-xs mt-0.5">Changes are saved to Firestore and reflected on the public disclosure page.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/portal/disclosure"
                        className="text-xs font-semibold text-white border border-white/40 hover:border-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Preview →
                    </Link>
                    <button
                        onClick={onClose}
                        className="text-xs font-semibold text-white border border-white/40 hover:border-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                        ✕ Close
                    </button>
                </div>
            </div>

            {/* Sticky save bar */}
            <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex justify-between items-center">
                <p className="text-xs text-slate-500">
                    {saved
                        ? <span className="text-green-600 font-semibold">✓ Changes saved</span>
                        : 'Unsaved changes'}
                </p>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-800 hover:bg-red-900 disabled:bg-red-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                    {saving
                        ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    }
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            <div className="flex bg-slate-50">

                {/* Section sidebar */}
                <aside className="hidden md:block w-52 shrink-0 border-r border-slate-200 p-3 bg-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Sections</p>
                    {DISCLOSURE_SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg mb-0.5 font-medium transition-colors ${
                                activeSection === s.id
                                    ? 'bg-red-800 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </aside>

                {/* Mobile tabs */}
                <div className="md:hidden w-full">
                    <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-slate-200 bg-white">
                        {DISCLOSURE_SECTIONS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                                    activeSection === s.id
                                        ? 'bg-red-800 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main editor area */}
                <main className="flex-1 p-4 lg:p-6 min-w-0">

                    {/* A: General Information */}
                    {activeSection === 'general' && (
                        <SubCard title="A. General Information">
                            {([
                                ['schoolName',             'Name of the School'],
                                ['affiliationNo',          'Affiliation / Recognition No.'],
                                ['schoolCode',             'School Code (MBSE)'],
                                ['udiseCode',              'UDISE Code'],
                                ['address',                'Complete Address'],
                                ['town',                   'Village / Town'],
                                ['district',               'District'],
                                ['state',                  'State'],
                                ['pinCode',                'PIN Code'],
                                ['principalName',          'Principal / Head Teacher Name'],
                                ['principalQualification', 'Principal Qualification'],
                                ['email',                  'School Email ID'],
                                ['website',                'Website'],
                                ['contactNumber',          'Contact Number'],
                                ['yearEstablished',        'Year of Establishment'],
                                ['schoolType',             'Type of School'],
                                ['classesOffered',         'Classes Offered'],
                                ['medium',                 'Medium of Instruction'],
                                ['boardingType',           'Boarding / Day School'],
                                ['managementType',         'Management Type'],
                                ['minorityStatus',         'Minority Institution'],
                                ['sessionStart',           'Academic Session Starts'],
                            ] as [keyof DisclosureData['general'], string][]).map(([field, label]) => (
                                <Field key={field} label={label} value={data.general[field]} onChange={v => update('general', field, v)} />
                            ))}
                        </SubCard>
                    )}

                    {/* B: Documents */}
                    {activeSection === 'documents' && (
                        <SubCard title="B. Documents and Information">
                            <p className="text-xs text-slate-500 mb-4">Paste the URL of each uploaded PDF or Google Drive file.</p>
                            <div className="space-y-3">
                                {data.documents.map((doc, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <p className="text-xs font-medium text-slate-700 mb-2">{i + 1}. {doc.label}</p>
                                        <input type="url" value={doc.fileUrl || ''} onChange={e => updateDocUrl(i, e.target.value)}
                                            placeholder="https://..." className={inputCls} />
                                    </div>
                                ))}
                            </div>
                        </SubCard>
                    )}

                    {/* C: Academics */}
                    {activeSection === 'academics' && (
                        <SubCard title="C. Results and Academics">
                            <p className="text-xs text-slate-500 mb-4">Paste URLs for each document or page link.</p>
                            <div className="space-y-3">
                                {data.academics.map((item, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <p className="text-xs font-medium text-slate-700 mb-2">{i + 1}. {item.label}</p>
                                        <input type="url" value={item.fileUrl || ''} onChange={e => updateAcademicUrl(i, e.target.value)}
                                            placeholder="https://..." className={inputCls} />
                                    </div>
                                ))}
                            </div>
                        </SubCard>
                    )}

                    {/* D: Teaching Staff */}
                    {activeSection === 'teachingStaff' && (
                        <SubCard title="D. Staff (Teaching)">
                            {([
                                ['principal',           'Principal'],
                                ['totalTeachers',       'Total No. of Teachers'],
                                ['tgt',                 'Trained Graduate Teachers (TGT)'],
                                ['prt',                 'Primary / Junior Teachers (PRT)'],
                                ['teacherStudentRatio', 'Teacher–Student Ratio'],
                                ['specialEducator',     'Details of Special Educator'],
                                ['counsellor',          'Counsellor / Wellness Teacher'],
                            ] as [keyof DisclosureData['teachingStaff'], string][]).map(([field, label]) => (
                                <Field key={field} label={label} value={data.teachingStaff[field]} onChange={v => update('teachingStaff', field, v)} />
                            ))}
                        </SubCard>
                    )}

                    {/* E: Non-Teaching Staff */}
                    {activeSection === 'nonTeachingStaff' && (
                        <SubCard title="E. Staff (Non-Teaching)">
                            {([
                                ['adminStaff',   'Administrative / Office Staff'],
                                ['wardenMale',   'Hostel Wardens (Male)'],
                                ['wardenFemale', 'Hostel Wardens (Female)'],
                                ['supportStaff', 'Peon / Support Staff'],
                                ['security',     'Watchman / Security'],
                            ] as [keyof DisclosureData['nonTeachingStaff'], string][]).map(([field, label]) => (
                                <Field key={field} label={label} value={data.nonTeachingStaff[field]} onChange={v => update('nonTeachingStaff', field, v)} />
                            ))}
                        </SubCard>
                    )}

                    {/* F: Infrastructure */}
                    {activeSection === 'infrastructure' && (
                        <SubCard title="F. School Infrastructure">
                            {([
                                ['campusArea',   'Total Campus Area (sq. mtr / acres)'],
                                ['classrooms',   'No. and Size of Classrooms (sq. mtr)'],
                                ['labs',         'No. and Size of Laboratories incl. Computer Lab'],
                                ['libraryBooks', 'Library — No. of Books'],
                                ['internet',     'Internet Facility'],
                                ['sports',       'Sports / Playground Facility'],
                                ['hostelBoys',   'Hostel Facility (Boys)'],
                                ['hostelGirls',  'Hostel Facility (Girls)'],
                                ['girlsToilets', "No. of Girls' Toilets"],
                                ['boysToilets',  "No. of Boys' Toilets"],
                                ['drinkingWater','Drinking Water Facility'],
                                ['electricity',  'Electricity Connection'],
                                ['ramp',         'Ramp / Accessibility for Differently Abled'],
                                ['cctv',         'CCTV Cameras'],
                                ['buildingType', 'Type of Building'],
                            ] as [keyof DisclosureData['infrastructure'], string][]).map(([field, label]) => (
                                <Field key={field} label={label} value={data.infrastructure[field]} onChange={v => update('infrastructure', field, v)} />
                            ))}
                        </SubCard>
                    )}

                    {/* G: Enrolment */}
                    {activeSection === 'enrolment' && (
                        <SubCard title="G. Student Enrolment">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mb-4">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase">Class</th>
                                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-500 uppercase w-24">Boys</th>
                                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-500 uppercase w-24">Girls</th>
                                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-500 uppercase w-24">Total</th>
                                            <th className="w-10" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.enrolment.rows.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="px-1 py-1.5"><input value={row.className} onChange={e => updateEnrolment(i, 'className', e.target.value)} className={inputCls} /></td>
                                                {(['boys', 'girls', 'total'] as const).map(f => (
                                                    <td key={f} className="px-1 py-1.5"><input value={row[f] || ''} onChange={e => updateEnrolment(i, f, e.target.value)} className={`${inputCls} text-center`} /></td>
                                                ))}
                                                <td className="px-1 py-1.5 text-center">
                                                    <button onClick={() => { const rows = data.enrolment.rows.filter((_, idx) => idx !== i); setData(p => ({ ...p, enrolment: { ...p.enrolment, rows } })); setSaved(false); }} className="text-red-400 hover:text-red-700 p-1">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setData(p => ({ ...p, enrolment: { ...p.enrolment, rows: [...p.enrolment.rows, { className: '' }] } })); setSaved(false); }}
                                    className="flex items-center gap-1.5 text-sm text-red-700 hover:text-red-900 font-medium">
                                    <PlusIcon className="w-4 h-4" /> Add Row
                                </button>
                                <div className="flex-1" />
                                <label className="text-xs font-medium text-slate-500 uppercase">Grand Total</label>
                                <input value={data.enrolment.grandTotal} onChange={e => { setData(p => ({ ...p, enrolment: { ...p.enrolment, grandTotal: e.target.value } })); setSaved(false); }}
                                    placeholder="e.g. 450" className="w-24 text-sm border border-slate-200 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-red-300 bg-white" />
                            </div>
                        </SubCard>
                    )}

                    {/* H: Board Results */}
                    {activeSection === 'boardResults' && (
                        <SubCard title="H. HSLC Board Examination Results">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mb-4">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            {['Year', 'Appeared', 'Passed', 'Pass %', 'Distinction / Merit', ''].map(h => (
                                                <th key={h} className="px-2 py-2 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.boardResults.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                {(['year', 'appeared', 'passed', 'passPercent', 'distinction'] as (keyof BoardResultRow)[]).map(f => (
                                                    <td key={f} className="px-1 py-1.5"><input value={row[f] || ''} onChange={e => updateBoardResult(i, f, e.target.value)} className={inputCls} /></td>
                                                ))}
                                                <td className="px-1 py-1.5 text-center">
                                                    <button onClick={() => { setData(p => ({ ...p, boardResults: p.boardResults.filter((_, idx) => idx !== i) })); setSaved(false); }} className="text-red-400 hover:text-red-700 p-1">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={() => { setData(p => ({ ...p, boardResults: [...p.boardResults, { year: '' }] })); setSaved(false); }}
                                className="flex items-center gap-1.5 text-sm text-red-700 hover:text-red-900 font-medium">
                                <PlusIcon className="w-4 h-4" /> Add Year
                            </button>
                        </SubCard>
                    )}

                    {/* I: Fee Structure */}
                    {activeSection === 'feeStructure' && (
                        <SubCard title="I. Fee Structure (2026–27)">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mb-4">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-2 py-2 text-left text-xs font-bold text-slate-500 uppercase">Fee Head</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold text-slate-500 uppercase w-36">Amount (₹)</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold text-slate-500 uppercase w-40">Remarks</th>
                                            <th className="w-10" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.feeStructure.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="px-1 py-1.5"><input value={row.head} onChange={e => updateFeeRow(i, 'head', e.target.value)} className={inputCls} /></td>
                                                <td className="px-1 py-1.5"><input value={row.amount || ''} onChange={e => updateFeeRow(i, 'amount', e.target.value)} placeholder="e.g. ₹12,000" className={inputCls} /></td>
                                                <td className="px-1 py-1.5"><input value={row.remarks || ''} onChange={e => updateFeeRow(i, 'remarks', e.target.value)} placeholder="Optional" className={inputCls} /></td>
                                                <td className="px-1 py-1.5 text-center">
                                                    <button onClick={() => { setData(p => ({ ...p, feeStructure: p.feeStructure.filter((_, idx) => idx !== i) })); setSaved(false); }} className="text-red-400 hover:text-red-700 p-1">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={() => { setData(p => ({ ...p, feeStructure: [...p.feeStructure, { head: '' }] })); setSaved(false); }}
                                className="flex items-center gap-1.5 text-sm text-red-700 hover:text-red-900 font-medium">
                                <PlusIcon className="w-4 h-4" /> Add Fee Row
                            </button>
                        </SubCard>
                    )}

                    {/* J: Committees */}
                    {activeSection === 'committees' && (
                        <SubCard title="J. Statutory Committees">
                            <div className="space-y-4">
                                {data.committees.map((c, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <p className="text-xs font-bold text-slate-700 mb-2">{c.name}</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase">Details / Members</label>
                                                <input value={c.details || ''} onChange={e => updateCommittee(i, 'details', e.target.value)}
                                                    placeholder="e.g. As per notification" className={`${inputCls} mt-1`} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase">Document URL</label>
                                                <input type="url" value={c.fileUrl || ''} onChange={e => updateCommittee(i, 'fileUrl', e.target.value)}
                                                    placeholder="https://..." className={`${inputCls} mt-1`} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SubCard>
                    )}

                </main>
            </div>
        </div>
    );
};

// ─── AdminPage Props ──────────────────────────────────────────────────────────

interface AdminPageProps {
    pendingAdmissionsCount: number;
    pendingParentCount: number;
    pendingStaffCount: number;
    students: Student[];
    academicYear: string;
    disclosureData: DisclosureData;
    onSaveDisclosure: (data: DisclosureData) => Promise<void>;
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

const AdminPage: React.FC<AdminPageProps> = ({
    pendingAdmissionsCount,
    pendingParentCount,
    pendingStaffCount,
    students,
    academicYear,
    disclosureData,
    onSaveDisclosure,
}) => {
    const navigate = useNavigate();
    const [migrating, setMigrating] = useState(false);
    const [migrateResult, setMigrateResult] = useState<string | null>(null);
    const [showDisclosure, setShowDisclosure] = useState(false);

    const handleMigrateStudentIds = async () => {
        if (!window.confirm('This will write the correct studentId and academicYear into every student record that is missing them. Continue?')) return;
        setMigrating(true);
        setMigrateResult(null);
        try {
            const snapshot = await db.collection('students').get();
            const batch = db.batch();
            let count = 0;
            snapshot.docs.forEach(doc => {
                const s = doc.data() as Student;
                const updates: Record<string, any> = {};
                const correctId = formatStudentId({ ...s, studentId: undefined }, academicYear);
                if (!s.studentId || s.studentId !== correctId) updates.studentId = correctId;
                if (!s.academicYear) updates.academicYear = academicYear;
                if (Object.keys(updates).length > 0) { batch.update(doc.ref, updates); count++; }
            });
            await batch.commit();
            setMigrateResult(`✅ Done! Updated ${count} student records.`);
        } catch (err: any) {
            setMigrateResult(`❌ Error: ${err.message}`);
        } finally {
            setMigrating(false);
        }
    };

    const adminLinks = [
        { title: "Manage Staff",        description: "Add, view, and manage all staff profiles.",                              icon: <BriefcaseIcon className="w-7 h-7" />,      link: "/portal/staff" },
        { title: "Fee Management",      description: "Collect tuition/exam fees and edit fee structures.",                     icon: <CurrencyDollarIcon className="w-7 h-7" />, link: "/portal/fees" },
        { title: "Online Admissions",   description: "Review and process new student applications.",                           icon: <InboxArrowDownIcon className="w-7 h-7" />, link: "/portal/admissions",        count: pendingAdmissionsCount },
        { title: "Admission Settings",  description: "Edit Admission & Re-admission fees for both new and existing students.", icon: <CurrencyDollarIcon className="w-7 h-7" />, link: "/portal/admission-settings" },
        { title: "Parents Management",  description: "View parent biodata and approve new accounts.",                          icon: <UserGroupIcon className="w-7 h-7" />,      link: "/portal/parents",           count: pendingParentCount },
        { title: "Staff User Accounts", description: "Approve new user registrations for staff.",                              icon: <UserGroupIcon className="w-7 h-7" />,      link: "/portal/users",             count: pendingStaffCount },
        { title: "News Management",     description: "Create and manage school news.",                                         icon: <DocumentReportIcon className="w-7 h-7" />, link: "/portal/news-management" },
        { title: "School Settings",     description: "Update school info, payment QR codes, etc.",                             icon: <CogIcon className="w-7 h-7" />,            link: "/portal/settings" },
        { title: "Manage Documents",    description: "Upload and manage downloadable PDF documents for the website.",          icon: <DocIcon />,                                link: "/portal/documents" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            {/* Top Nav */}
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" /><span>Home</span>
                </Link>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
                <p className="text-slate-600 mt-2">Central hub for all administrative tasks.</p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminLinks.map(link => (
                    <AdminCard key={link.title} {...link} />
                ))}
                {/* Disclosure card — opens editor inline */}
                <AdminCard
                    title="Mandatory Public Disclosure"
                    description="Edit and publish the school's mandatory public disclosure information."
                    icon={<DisclosureIcon />}
                    accent="border-red-500"
                    onClick={() => { setShowDisclosure(v => !v); window.setTimeout(() => document.getElementById('disclosure-editor')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                />
            </div>

            {/* Inline Disclosure Editor */}
            {showDisclosure && (
                <div id="disclosure-editor">
                    <DisclosureEditor
                        initialData={disclosureData}
                        onSave={onSaveDisclosure}
                        onClose={() => setShowDisclosure(false)}
                    />
                </div>
            )}

            {/* Data Maintenance */}
            <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <h2 className="text-lg font-bold text-amber-800 mb-1">🔧 Data Maintenance</h2>
                <p className="text-sm text-amber-700 mb-4">Run this once to write correct <code>studentId</code> and <code>academicYear</code> fields into all student records. Safe to run multiple times.</p>
                <button
                    onClick={handleMigrateStudentIds}
                    disabled={migrating}
                    className="btn btn-secondary border-amber-400 text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                    {migrating ? 'Updating...' : 'Fix Student IDs in Database'}
                </button>
                {migrateResult && <p className="mt-3 text-sm font-semibold text-slate-700">{migrateResult}</p>}
            </div>
        </div>
    );
};

export default AdminPage;
