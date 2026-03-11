import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, OnlineAdmission, Grade, Student } from '@/types';
import { GRADES_LIST, CATEGORY_LIST, GENDER_LIST, BLOOD_GROUP_LIST } from '@/constants';
import { UploadIcon, SpinnerIcon, CheckIcon, ArrowRightIcon, SaveIcon, BackIcon } from '@/components/Icons';
import CustomDatePicker from '@/components/CustomDatePicker';
import { resizeImage, uploadToImgBB, getNextGrade } from '@/utils';
import { db } from '@/firebaseConfig';

const { useNavigate, Link } = ReactRouterDOM as any;

const ADMISSION_DEADLINE = new Date('2026-04-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
const DRAFT_KEY = 'bms_admission_draft_v1';

// ── Always-light input helpers ────────────────────────────────────────────────
const inputCls = (extra = '') =>
    `block w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 ${extra}`;
const selectCls = (extra = '') =>
    `block w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 ${extra}`;
const textareaCls = (extra = '') =>
    `block w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none ${extra}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const maskAadhaar = (raw: string) => {
    const d = raw.replace(/\D/g, '');
    if (d.length <= 4) return d;
    if (d.length <= 8) return 'XXXX-' + d.slice(4);
    return 'XXXX-XXXX-' + d.slice(8);
};
const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

interface OnlineAdmissionPageProps {
    user: User | null;
    onOnlineAdmissionSubmit: (data: Partial<OnlineAdmission>, id?: string) => Promise<string>;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
const STEP_LABELS = ['Student Info', 'Parent Info', 'Documents'];
const ProgressBar: React.FC<{ currentStep: number; lastSaved: Date | null }> = ({ currentStep, lastSaved }) => (
    <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500">Step {currentStep} of 3</p>
            {lastSaved && <p className="text-xs text-slate-400">💾 Last saved at {formatTime(lastSaved)}</p>}
        </div>
        <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 z-0" />
            <div className="absolute top-4 left-0 h-1 bg-sky-500 z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
            <div className="relative z-10 flex justify-between">
                {STEP_LABELS.map((label, i) => {
                    const done = i + 1 < currentStep, active = i + 1 === currentStep;
                    return (
                        <div key={label} className="flex flex-col items-center gap-2" style={{ width: '33%' }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? 'bg-sky-500 border-sky-500 text-white' : active ? 'bg-white border-sky-500 text-sky-600' : 'bg-white border-slate-300 text-slate-400'}`}>
                                {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs font-semibold text-center ${active ? 'text-sky-600' : done ? 'text-sky-400' : 'text-slate-400'}`}>{label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

const SectionDivider: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 mt-8 mb-5">
        <span className="text-xl">{icon}</span>
        <h3 className="text-base font-bold text-slate-700 whitespace-nowrap">{title}</h3>
        <div className="flex-1 h-px bg-slate-200" />
    </div>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

// ── Selection stage type ──────────────────────────────────────────────────────
type SelStage = 'category' | 'subtype' | 'id_input';
type StudentCategory = 'DayScholar' | 'Boarder';

// ── Main Component ────────────────────────────────────────────────────────────
const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ user, onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    // Selection screen stages
    const [selStage, setSelStage] = useState<SelStage>('category');
    const [selCategory, setSelCategory] = useState<StudentCategory | null>(null);

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<Partial<OnlineAdmission> | null>(null);
    const [showReviewPage, setShowReviewPage] = useState(false);
    const [savedApplicationId, setSavedApplicationId] = useState<string | null>(null);

    // Student ID fetch
    const [studentId, setStudentId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

    const [formData, setFormData] = useState<Partial<OnlineAdmission>>({
        admissionGrade: GRADES_LIST[0],
        gender: 'Male',
        category: 'General',
        cwsn: 'No',
        email: user?.email || '',
        status: 'draft',
        generalBehaviour: 'Normal',
        siblingsInSchool: 0,
    });

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step, showReviewPage]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw) as Partial<OnlineAdmission>;
                if (draft.studentName || draft.fatherName) { setPendingDraft(draft); setShowDraftPrompt(true); }
            }
        } catch { /* ignore */ }
    }, []);

    const saveDraftLocally = useCallback((data: Partial<OnlineAdmission>) => {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); setLastSaved(new Date()); } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (step === 0 || showReviewPage) return;
        const t = setInterval(() => saveDraftLocally(formData), 60_000);
        return () => clearInterval(t);
    }, [formData, step, showReviewPage, saveDraftLocally]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof OnlineAdmission) => {
        if (!e.target.files?.[0]) return;
        setUploadingDoc(String(field));
        try {
            const resized = await resizeImage(e.target.files[0], 1024, 1024, 0.8);
            const url = await uploadToImgBB(resized);
            setFormData(prev => ({ ...prev, [field]: url }));
            if (errors[String(field)]) setErrors(prev => { const n = { ...prev }; delete n[String(field)]; return n; });
        } catch { alert('Failed to upload document. Please try again.'); }
        finally { setUploadingDoc(null); }
    };

    const validateStep = (s: number) => {
        const e: Record<string, string> = {};
        if (s === 1) {
            if (!formData.studentName?.trim()) e.studentName = 'Student name is required.';
            if (!formData.dateOfBirth) e.dateOfBirth = 'Date of birth is required.';
            if (!formData.gender) e.gender = 'Gender is required.';
            if (!formData.category) e.category = 'Category is required.';
            if (!formData.religion?.trim()) e.religion = 'Religion is required.';
        }
        if (s === 2) {
            if (!formData.fatherName?.trim()) e.fatherName = "Father's name is required.";
            if (!formData.motherName?.trim()) e.motherName = "Mother's name is required.";
            if (!formData.contactNumber?.trim()) e.contactNumber = 'Contact number is required.';
            if (!formData.permanentAddress?.trim()) e.permanentAddress = 'Permanent address is required.';
        }
        setErrors(e);
        if (Object.keys(e).length > 0) {
            setTimeout(() => document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
            return false;
        }
        return true;
    };

    // ── Fetch existing student ────────────────────────────────────────────────
    const handleFetchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId.trim()) return;
        const idInput = studentId.trim().toUpperCase();
        setIsFetching(true); setFetchError('');

        const fillForm = (data: Student) => {
            const resolvedType = selCategory === 'Boarder' ? 'Boarder' : 'Existing';
            const nextGrade = getNextGrade(data.grade);
            setFormData(prev => ({
                ...prev,
                studentType: resolvedType,
                previousStudentId: data.studentId || idInput,
                admissionGrade: nextGrade || data.grade,
                studentName: data.name,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                studentAadhaar: data.aadhaarNumber,
                fatherName: data.fatherName,
                motherName: data.motherName,
                fatherOccupation: data.fatherOccupation,
                motherOccupation: data.motherOccupation,
                parentAadhaar: data.fatherAadhaar,
                guardianName: data.guardianName,
                guardianRelationship: data.guardianRelationship,
                permanentAddress: data.address,
                presentAddress: data.address,
                contactNumber: data.contact,
                religion: data.religion,
                category: data.category as string,
                cwsn: data.cwsn,
                bloodGroup: data.bloodGroup,
                penNumber: data.pen,
                achievements: data.achievements,
                healthIssues: data.healthConditions,
                lastSchoolAttended: 'Bethel Mission School',
            }));
            setStep(1);
        };

        try {
            let snap = await db.collection('students').where('studentId', '==', idInput).limit(1).get();
            if (!snap.empty) { fillForm(snap.docs[0].data() as Student); return; }

            const match = idInput.match(/^BMS(\d{2})([A-Z0-9]{2})(\d+)$/);
            if (match) {
                const [, yearShort, gradeCode, rollStr] = match;
                const gradeMap: Record<string, string> = {
                    'NU': 'Nursery', 'KG': 'Kindergarten',
                    '01': 'Class I', '02': 'Class II', '03': 'Class III', '04': 'Class IV',
                    '05': 'Class V', '06': 'Class VI', '07': 'Class VII', '08': 'Class VIII',
                    '09': 'Class IX', '10': 'Class X',
                };
                const grade = gradeMap[gradeCode];
                if (grade) {
                    const fb = await db.collection('students').where('grade', '==', grade).where('rollNo', '==', parseInt(rollStr, 10)).get();
                    const found = fb.docs.find(d => (d.data() as Student).academicYear?.startsWith(`20${yearShort}`));
                    if (found) { fillForm(found.data() as Student); return; }
                }
            }
            setFetchError('Student ID not found. Please check and try again, or use "Skip & Fill Manually".');
        } catch { setFetchError('An error occurred. Please try again.'); }
        finally { setIsFetching(false); }
    };

    const handleSaveForLater = async () => {
        setIsSaving(true);
        try {
            const d = { ...formData, status: 'draft' as const, submissionDate: formData.submissionDate || new Date().toISOString() };
            const id = await onOnlineAdmissionSubmit(d, formData.id);
            setFormData(prev => ({ ...prev, id }));
            setSavedApplicationId(id);
            saveDraftLocally({ ...d, id });
        } catch { alert('Failed to save application draft.'); }
        finally { setIsSaving(false); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const isNew = formData.studentType === 'Newcomer' || formData.studentType === 'Boarder';
        const isNursery = formData.admissionGrade === Grade.NURSERY;
        const docErrors: Record<string, string> = {};
        if (isNew && !formData.birthCertificateUrl) docErrors.birthCertificateUrl = 'Birth Certificate is mandatory for new students.';
        if (isNew && !isNursery && !formData.reportCardUrl) docErrors.reportCardUrl = 'Last Report Card is mandatory (except Nursery).';
        if (Object.keys(docErrors).length > 0) {
            setErrors(docErrors);
            setTimeout(() => document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
            return;
        }
        setShowReviewPage(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const admData = { ...formData, submissionDate: new Date().toISOString(), status: 'pending' as const };
            const id = await onOnlineAdmissionSubmit(admData, formData.id);
            localStorage.removeItem(DRAFT_KEY);
            navigate(`/admissions/payment/${id}`, {
                state: { grade: formData.admissionGrade, studentName: formData.studentName, fatherName: formData.fatherName, contact: formData.contactNumber, studentType: formData.studentType }
            });
        } catch { alert('Failed to submit. Please try again.'); }
        finally { setIsSubmitting(false); }
    };

    const isNewStudent = formData.studentType === 'Newcomer' || formData.studentType === 'Boarder';
    const isNursery = formData.admissionGrade === Grade.NURSERY;

    // ─── Draft Prompt ─────────────────────────────────────────────────────────
    const DraftPrompt = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                <p className="text-3xl mb-3">📝</p>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Unsaved Draft Found</h3>
                <p className="text-sm text-slate-500 mb-6">You have an unfinished application for <strong>{pendingDraft?.studentName || 'a student'}</strong>. Continue?</p>
                <div className="flex gap-3">
                    <button className="flex-1 btn btn-secondary" onClick={() => { setShowDraftPrompt(false); setPendingDraft(null); localStorage.removeItem(DRAFT_KEY); }}>Start Fresh</button>
                    <button className="flex-1 btn btn-primary" onClick={() => { if (pendingDraft) { setFormData(prev => ({ ...prev, ...pendingDraft })); setStep(1); } setShowDraftPrompt(false); }}>Continue</button>
                </div>
            </div>
        </div>
    );

    // ─── Review Page ──────────────────────────────────────────────────────────
    if (showReviewPage) {
        const typeLabel =
            formData.studentType === 'Boarder' ? 'Boarder — Residential'
            : formData.studentType === 'Existing' ? 'Day Scholar — Existing'
            : 'Day Scholar — New';
        const rows: [string, string][] = [
            ['Student Name', formData.studentName || '—'],
            ['Admission Type', typeLabel],
            ['Class Applying For', formData.admissionGrade || '—'],
            ['Date of Birth', formData.dateOfBirth || '—'],
            ['Gender', formData.gender || '—'],
            ['Aadhaar', formData.studentAadhaar ? maskAadhaar(formData.studentAadhaar) : '—'],
            ['Category', formData.category || '—'],
            ['Religion', formData.religion || '—'],
            ["Father's Name", formData.fatherName || '—'],
            ["Mother's Name", formData.motherName || '—'],
            ['Contact', formData.contactNumber || '—'],
            ['Email', formData.email || '—'],
            ['Permanent Address', formData.permanentAddress || '—'],
            ['Last School', formData.lastSchoolAttended || '—'],
        ];
        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-slate-50 py-12 min-h-screen">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-slate-800 px-8 py-5 text-white">
                                <h2 className="text-xl font-bold">Review Your Application</h2>
                                <p className="text-slate-300 text-sm mt-1">Please verify all details before submitting. You cannot edit after submission without contacting the school.</p>
                            </div>
                            <div className="p-8">
                                <div className="rounded-xl border overflow-hidden mb-6">
                                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center gap-2">
                                        <span>👤</span><p className="font-bold text-slate-700 text-sm">Application Details</p>
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {rows.map(([k, v]) => (
                                                <tr key={k} className="border-b last:border-0 hover:bg-slate-50">
                                                    <td className="px-5 py-2.5 text-slate-500 font-medium w-44">{k}</td>
                                                    <td className="px-5 py-2.5 font-semibold text-slate-800 break-words">{v}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(formData.birthCertificateUrl || formData.transferCertificateUrl || formData.reportCardUrl) && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3"><span>📄</span><p className="font-bold text-slate-700 text-sm">Uploaded Documents</p></div>
                                        <div className="flex gap-4 flex-wrap">
                                            {([['Birth Cert.', formData.birthCertificateUrl], ['TC', formData.transferCertificateUrl], ['Report Card', formData.reportCardUrl]] as [string, string | undefined][]).filter(([, u]) => u).map(([label, url]) => (
                                                <div key={label} className="text-center">
                                                    <img src={url} alt={label} className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {formData.studentType === 'Boarder' && (
                                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                        <span className="text-xl flex-shrink-0">🏠</span>
                                        <p className="text-sm text-amber-800">You are applying as a <strong>Boarder (Residential)</strong>. Boarding fees will be shown at payment.</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                    <span className="text-xl flex-shrink-0">⚠️</span>
                                    <p className="text-sm text-amber-800">Once submitted, status becomes <strong>Pending</strong> and you'll be redirected to payment.</p>
                                </div>
                                <div className="flex gap-3 flex-col sm:flex-row-reverse">
                                    <button onClick={handleFinalSubmit} disabled={isSubmitting} className="btn btn-primary flex-1 !py-3 flex items-center justify-center gap-2">
                                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : '✅'}
                                        {isSubmitting ? 'Submitting…' : 'Confirm & Submit Application'}
                                    </button>
                                    <button onClick={() => setShowReviewPage(false)} className="btn btn-secondary flex-1 !py-3">← Edit Application</button>
                                </div>
                                <p className="text-xs text-center text-slate-400 mt-4">🔒 Your data is secure and encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── STEP 0: 3-stage selection ────────────────────────────────────────────
    if (step === 0) {
        const cardBase = 'bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-8 text-left transition-all group hover:shadow-2xl';

        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-white p-8 rounded-2xl shadow-xl">

                            {/* Back button */}
                            <div className="mb-6">
                                <button
                                    onClick={() => {
                                        if (selStage === 'id_input') { setSelStage('subtype'); setFetchError(''); setStudentId(''); }
                                        else if (selStage === 'subtype') { setSelStage('category'); setSelCategory(null); }
                                        else navigate(-1);
                                    }}
                                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                                >
                                    <BackIcon className="w-5 h-5" />
                                    {selStage === 'category' ? 'Back to Admission Guidelines' : 'Back'}
                                </button>
                            </div>

                            {/* Breadcrumb */}
                            {selStage !== 'category' && (
                                <div className="flex items-center gap-1.5 text-xs mb-6 text-slate-400">
                                    <span>Category</span>
                                    <span className="text-slate-300">›</span>
                                    <span className={`font-semibold ${selStage === 'subtype' ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {selCategory === 'Boarder' ? '🏠 Boarder' : '🎒 Day Scholar'}
                                    </span>
                                    {selStage === 'id_input' && (
                                        <>
                                            <span className="text-slate-300">›</span>
                                            <span className="text-slate-800 font-semibold">Existing — Enter Student ID</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ══ STAGE 1: Day Scholar vs Boarder ══ */}
                            {selStage === 'category' && (
                                <>
                                    <div className="text-center mb-6">
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">Online Admission Portal</h1>
                                        <p className="text-slate-500 text-sm">Academic Session 2026-27</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-8 text-amber-800">
                                        <span className="text-2xl flex-shrink-0">⏰</span>
                                        <p className="text-sm font-semibold">Applications open until <strong>{ADMISSION_DEADLINE}</strong></p>
                                    </div>
                                    <div className="text-center mb-8">
                                        <p className="text-lg font-semibold text-slate-700">Step 1 of 3 — Select student category</p>
                                        <p className="text-slate-400 text-sm mt-1">Will the student attend as a day scholar or reside in the hostel?</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
                                        <button onClick={() => { setSelCategory('DayScholar'); setSelStage('subtype'); }} className={`${cardBase} hover:border-sky-500`}>
                                            <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform">🎒</div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Day Scholar</h3>
                                            <p className="text-slate-500 text-sm">Student attends school daily and returns home.</p>
                                        </button>
                                        <button onClick={() => { setSelCategory('Boarder'); setSelStage('subtype'); }} className={`${cardBase} hover:border-amber-500`}>
                                            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform">🏠</div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Boarder (Residential)</h3>
                                            <p className="text-slate-500 text-sm">Student stays in the school hostel.</p>
                                            <span className="mt-3 inline-block text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Residential Fees Apply</span>
                                        </button>
                                    </div>

                                    <div className="border-t pt-6 text-center flex flex-col items-center gap-3">
                                        <button onClick={() => { setSelCategory(null); setSelStage('id_input'); }} className="font-semibold text-sky-700 hover:underline text-sm">Continue a Saved Application →</button>
                                        <Link to="/admissions/status" className="font-semibold text-emerald-700 hover:underline text-sm">Check Application Status →</Link>
                                    </div>
                                </>
                            )}

                            {/* ══ STAGE 2: New vs Existing ══ */}
                            {selStage === 'subtype' && selCategory && (
                                <>
                                    <div className="text-center mb-8">
                                        <p className="text-lg font-semibold text-slate-700">Step 2 of 3 — New or Existing Student?</p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            New students fill the form from scratch. Existing students can auto-fill using their Student ID.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                        {/* New */}
                                        <button
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, studentType: selCategory === 'Boarder' ? 'Boarder' : 'Newcomer' }));
                                                setStep(1);
                                            }}
                                            className={`${cardBase} ${selCategory === 'Boarder' ? 'hover:border-amber-400' : 'hover:border-sky-500'}`}
                                        >
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform ${selCategory === 'Boarder' ? 'bg-amber-100' : 'bg-sky-100'}`}>🎓</div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">New {selCategory === 'Boarder' ? 'Boarder' : 'Student'}</h3>
                                            <p className="text-slate-500 text-sm">First-time admission — fill in all details from scratch.</p>
                                        </button>

                                        {/* Existing */}
                                        <button
                                            onClick={() => { setSelStage('id_input'); setStudentId(''); setFetchError(''); }}
                                            className={`${cardBase} hover:border-emerald-500`}
                                        >
                                            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform">🔄</div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Existing Student</h3>
                                            <p className="text-slate-500 text-sm">Already enrolled — auto-fill your details using your Student ID.</p>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* ══ STAGE 3: Enter Student ID ══ */}
                            {selStage === 'id_input' && (
                                <div className="max-w-md mx-auto">
                                    {selCategory && (
                                        <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 mb-6 text-sm font-medium border ${selCategory === 'Boarder' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>
                                            <span>{selCategory === 'Boarder' ? '🏠' : '🎒'}</span>
                                            <span>{selCategory === 'Boarder' ? 'Boarder (Residential)' : 'Day Scholar'} — Existing Student</span>
                                        </div>
                                    )}

                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Enter Your Student ID</h2>
                                    <p className="text-slate-500 text-sm mb-6">Your details will be auto-filled from school records. You can review and edit before submitting.</p>

                                    <form onSubmit={handleFetchStudent}>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Student ID</label>
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={e => { setStudentId(e.target.value.toUpperCase()); setFetchError(''); }}
                                            className={inputCls()}
                                            placeholder="e.g. BMS240101"
                                            autoFocus
                                        />
                                        {fetchError && <p className="text-red-500 text-sm mt-2">{fetchError}</p>}
                                        <p className="text-xs text-slate-400 mt-1 mb-4">Your ID is printed on school records or fee receipts.</p>

                                        <button type="submit" disabled={isFetching || !studentId} className="w-full btn btn-primary flex items-center justify-center gap-2 mb-3">
                                            {isFetching ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                                            {isFetching ? 'Fetching details…' : 'Fetch & Continue'}
                                        </button>
                                    </form>

                                    <hr className="my-4" />
                                    <button
                                        onClick={() => {
                                            const type = selCategory === 'Boarder' ? 'Boarder' : 'Existing';
                                            setFormData(prev => ({ ...prev, studentType: type, lastSchoolAttended: 'Bethel Mission School' }));
                                            setStep(1);
                                        }}
                                        className="w-full btn btn-secondary"
                                    >
                                        Skip & Fill Manually
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── STEPS 1–3: Form ──────────────────────────────────────────────────────
    return (
        <>
            {showDraftPrompt && <DraftPrompt />}
            <div className="bg-white py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 relative">

                        {savedApplicationId && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                                <div className="bg-white p-8 rounded-lg shadow-xl text-center border">
                                    <h3 className="text-2xl font-bold text-emerald-600">Application Saved!</h3>
                                    <p className="mt-2 text-slate-600">Save this ID to continue later:</p>
                                    <div className="my-4 p-3 bg-slate-100 border-2 border-dashed rounded font-mono text-xl font-bold text-slate-800">{savedApplicationId}</div>
                                    <button onClick={() => navigator.clipboard.writeText(savedApplicationId)} className="btn btn-secondary w-full">Copy ID</button>
                                    <button onClick={() => setSavedApplicationId(null)} className="mt-4 text-sm text-slate-500 hover:underline">Close and Continue Editing</button>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <button onClick={() => { setErrors({}); step > 1 ? setStep(step - 1) : setStep(0); }} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                                <BackIcon className="w-5 h-5" /> Back
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-amber-800">
                            <span>⏰</span>
                            <p className="text-xs font-semibold">Applications open until <strong>{ADMISSION_DEADLINE}</strong></p>
                        </div>

                        {formData.studentType === 'Boarder' && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 mb-4">
                                <span>🏠</span>
                                <p className="text-xs font-semibold text-amber-800">Applying as <strong>Boarder (Residential)</strong> — boarding fees will apply at payment.</p>
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-slate-800">Online Admission Form</h1>
                            <p className="text-slate-600 mt-2">Academic Session 2026-27</p>
                            <p className="text-xs text-slate-400 mt-1"><span className="text-red-500 font-bold">*</span> Required fields</p>
                        </div>

                        <ProgressBar currentStep={step} lastSaved={lastSaved} />

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* ── STEP 1: Student Info ── */}
                            {step === 1 && (
                                <section>
                                    <SectionDivider icon="🎓" title="Admission Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Class Applying For*</label>
                                            <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className={selectCls()} required>
                                                {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <SectionDivider icon="👤" title="Student Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name*</label>
                                            <input type="text" name="studentName" value={formData.studentName || ''} onChange={handleChange} className={inputCls(errors.studentName ? 'border-red-400' : '')} />
                                            <FieldError message={errors.studentName} />{errors.studentName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <CustomDatePicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} required={false} minYear={1960} maxYear={new Date().getFullYear()} />
                                            <FieldError message={errors.dateOfBirth} />{errors.dateOfBirth && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Gender*</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls()}>
                                                {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Aadhaar No. (Optional)</label>
                                            <input type="text" value={formData.studentAadhaar ? maskAadhaar(formData.studentAadhaar) : ''} onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,12); setFormData(p=>({...p,studentAadhaar:d})); }} placeholder="XXXX-XXXX-1234" maxLength={14} className={inputCls()} />
                                            <p className="text-xs text-slate-400 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">PEN No. (Optional)</label>
                                            <input type="text" name="penNumber" value={formData.penNumber || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Mother Tongue (Optional)</label>
                                            <input type="text" name="motherTongue" value={formData.motherTongue || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Blood Group (Optional)</label>
                                            <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className={selectCls()}>
                                                <option value="">-- Select --</option>
                                                {BLOOD_GROUP_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">CWSN*</label>
                                            <select name="cwsn" value={formData.cwsn} onChange={handleChange} className={selectCls()}>
                                                <option value="No">No</option><option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Category*</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className={selectCls(errors.category ? 'border-red-400' : '')}>
                                                {CATEGORY_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <FieldError message={errors.category} />{errors.category && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Religion*</label>
                                            <input type="text" name="religion" value={formData.religion || ''} onChange={handleChange} className={inputCls(errors.religion ? 'border-red-400' : '')} />
                                            <FieldError message={errors.religion} />{errors.religion && <span className="field-error" />}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── STEP 2: Parent Info ── */}
                            {step === 2 && (
                                <section>
                                    <SectionDivider icon="👨‍👩‍👦" title="Parent / Guardian Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Father's Name*</label>
                                            <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className={inputCls(errors.fatherName ? 'border-red-400' : '')} />
                                            <FieldError message={errors.fatherName} />{errors.fatherName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Mother's Name*</label>
                                            <input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} className={inputCls(errors.motherName ? 'border-red-400' : '')} />
                                            <FieldError message={errors.motherName} />{errors.motherName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Father's Occupation</label>
                                            <input type="text" name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Mother's Occupation</label>
                                            <input type="text" name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Father's/Mother's Aadhaar No.</label>
                                            <input type="text" value={formData.parentAadhaar ? maskAadhaar(formData.parentAadhaar) : ''} onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,12); setFormData(p=>({...p,parentAadhaar:d})); }} placeholder="XXXX-XXXX-1234" maxLength={14} className={inputCls()} />
                                            <p className="text-xs text-slate-400 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Guardian's Name (if any)</label>
                                            <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Relationship with Guardian</label>
                                            <input type="text" name="guardianRelationship" value={formData.guardianRelationship || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                    </div>

                                    <SectionDivider icon="📞" title="Contact Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Contact No.*</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-semibold select-none">+91</span>
                                                <input type="tel" name="contactNumber" value={formData.contactNumber || ''} onChange={e => { const v=e.target.value.replace(/\D/g,'').slice(0,10); setFormData(p=>({...p,contactNumber:v})); if(errors.contactNumber) setErrors(p=>{const n={...p};delete n.contactNumber;return n;}); }} placeholder="10-digit number" maxLength={10} inputMode="numeric" className={`block w-full rounded-r-lg border border-slate-300 bg-white text-slate-900 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 ${errors.contactNumber ? 'border-red-400' : ''}`} />
                                            </div>
                                            <FieldError message={errors.contactNumber} />{errors.contactNumber && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Permanent Address*</label>
                                            <textarea name="permanentAddress" value={formData.permanentAddress || ''} onChange={handleChange} className={textareaCls(errors.permanentAddress ? 'border-red-400' : '')} rows={2} />
                                            <FieldError message={errors.permanentAddress} />{errors.permanentAddress && <span className="field-error" />}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── STEP 3: Documents ── */}
                            {step === 3 && (
                                <section>
                                    <SectionDivider icon="🏫" title="Previous School Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Last School Attended</label>
                                            <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Division in which he/she passed</label>
                                            <input type="text" name="lastDivision" value={formData.lastDivision || ''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">General Behaviour</label>
                                            <select name="generalBehaviour" value={formData.generalBehaviour || 'Normal'} onChange={handleChange} className={selectCls()}>
                                                <option>Mild</option><option>Normal</option><option>Hyperactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Siblings in this school</label>
                                            <input type="number" name="siblingsInSchool" value={formData.siblingsInSchool || 0} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Achievements</label>
                                            <textarea name="achievements" value={formData.achievements || ''} onChange={handleChange} className={textareaCls()} rows={3} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Health Issues (if any)</label>
                                            <textarea name="healthIssues" value={formData.healthIssues || ''} onChange={handleChange} className={textareaCls()} rows={3} />
                                        </div>
                                    </div>

                                    <SectionDivider icon="📄" title="Documents Upload" />
                                    {isNewStudent && (
                                        <p className="text-sm text-slate-600 my-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                            <span className="font-bold">Important:</span> Birth Certificate is mandatory.{!isNursery && ' Last Report Card is also mandatory.'}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {([
                                            { label: `Birth Certificate${isNewStudent ? '*' : ''}`, field: 'birthCertificateUrl' as keyof OnlineAdmission, url: formData.birthCertificateUrl, error: errors.birthCertificateUrl },
                                            { label: 'Transfer Certificate (if applicable)', field: 'transferCertificateUrl' as keyof OnlineAdmission, url: formData.transferCertificateUrl, error: undefined },
                                            { label: `Last Report Card${isNewStudent && !isNursery ? '*' : ''}`, field: 'reportCardUrl' as keyof OnlineAdmission, url: formData.reportCardUrl, error: errors.reportCardUrl },
                                        ]).map(({ label, field, url, error }) => (
                                            <div key={String(field)}>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
                                                <div className="flex items-center gap-3 p-3 border rounded-xl bg-slate-50">
                                                    <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                        {uploadingDoc === String(field) ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                        <input type="file" onChange={e => handleFileChange(e, field)} className="hidden" accept="image/*" />
                                                        Upload
                                                    </label>
                                                    {url && <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={label} className="w-12 h-12 rounded-lg object-cover border" /></a>}
                                                </div>
                                                {error && <><FieldError message={error} /><span className="field-error" /></>}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Navigation ── */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                {step > 1
                                    ? <button type="button" onClick={() => { setErrors({}); setStep(s => s - 1); }} className="btn btn-secondary">Back</button>
                                    : <div />
                                }
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={handleSaveForLater} disabled={isSubmitting || isSaving} className="btn btn-secondary">
                                        {isSaving ? <><SpinnerIcon className="w-5 h-5" /> Saving...</> : <><SaveIcon className="w-5 h-5" /> Save for Later</>}
                                    </button>
                                    {step < 3
                                        ? <button type="button" onClick={() => { if (validateStep(step)) setStep(s => s + 1); }} className="btn btn-primary">Next <ArrowRightIcon className="w-5 h-5" /></button>
                                        : <button type="submit" disabled={isSubmitting || isSaving} className="btn btn-primary px-8 py-3 text-lg">
                                            {isSubmitting ? <><SpinnerIcon className="w-6 h-6" /> Submitting...</> : 'Review & Submit'}
                                          </button>
                                    }
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OnlineAdmissionPage;
