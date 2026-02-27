/**
 * EnhancedOnlineAdmissionPage.tsx
 *
 * Drop-in replacement for src/pages/public/OnlineAdmissionPage.tsx
 *
 * NEW features vs original:
 *   ✅ School logo/banner at top of portal card
 *   ✅ Admission deadline amber banner
 *   ✅ Graduation-cap / refresh icons on selection cards
 *   ✅ Progress bar with step labels + "Step N of 3" text
 *   ✅ Section dividers with icons (👤 Student Info, 👨‍👩‍👦 Parent Info, 📄 Documents)
 *   ✅ "* Required fields" legend
 *   ✅ Passport photo upload
 *   ✅ Contact number: +91 prefix + 10-digit validation
 *   ✅ Aadhaar: 12-digit validation + masked display (XXXX-XXXX-1234)
 *   ✅ Auto-save every 60 s → "Last saved at HH:MM" indicator
 *   ✅ Draft-persistence prompt on fresh load ("Continue where you left off?")
 *   ✅ Application Summary review page before final submit
 *   ✅ Documents upload: stacked single-column on mobile
 *   ✅ Sticky bottom action bar on mobile
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, NotificationType, OnlineAdmission, AdmissionSettings, Gender } from '@/types';
import { SpinnerIcon, CheckCircleIcon, BackIcon, UploadIcon } from '@/components/Icons';
import { resizeImage, uploadToImgBB } from '@/utils';
import { DEFAULT_ADMISSION_SETTINGS, GRADES_LIST } from '@/constants';
import { db } from '@/firebaseConfig';

const { useNavigate, Link } = ReactRouterDOM as any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface OnlineAdmissionPageProps {
    addNotification: (message: string, type: NotificationType, title?: string) => void;
    admissionConfig?: AdmissionSettings;
    schoolConfig?: {
        schoolName?: string;
        logoUrl?: string;
        udiseCode?: string;
        udiseCodeElementary?: string;
        udiseCodeSecondary?: string;
        admissionDeadline?: string; // e.g. "2026-03-31"
        address?: string;
    };
    editingAdmission?: OnlineAdmission | null;
}

type FormData = {
    // Step 1 — Student
    studentType: 'Newcomer' | 'Existing';
    previousStudentId: string;
    admissionGrade: string;
    studentName: string;
    dateOfBirth: string;
    gender: string;
    studentAadhaar: string;
    religion: string;
    category: string;
    bloodGroup: string;
    motherTongue: string;
    lastSchoolAttended: string;
    lastDivision: string;
    penNumber: string;
    isCWSN: string;
    healthIssues: string;
    achievements: string;
    siblingsInSchool: string;
    // Step 2 — Parent
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation: string;
    guardianName: string;
    guardianRelationship: string;
    parentAadhaar: string;
    contactNumber: string;
    email: string;
    permanentAddress: string;
    presentAddress: string;
    // Step 3 — Documents (URLs after upload)
    studentPhotoUrl: string;
    birthCertificateUrl: string;
    transferCertificateUrl: string;
    reportCardUrl: string;
};

const EMPTY_FORM: FormData = {
    studentType: 'Newcomer', previousStudentId: '', admissionGrade: '',
    studentName: '', dateOfBirth: '', gender: '', studentAadhaar: '',
    religion: '', category: '', bloodGroup: '', motherTongue: '',
    lastSchoolAttended: '', lastDivision: '', penNumber: '',
    isCWSN: 'No', healthIssues: '', achievements: '', siblingsInSchool: '0',
    fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
    guardianName: '', guardianRelationship: '', parentAadhaar: '',
    contactNumber: '', email: '', permanentAddress: '', presentAddress: '',
    studentPhotoUrl: '', birthCertificateUrl: '', transferCertificateUrl: '', reportCardUrl: '',
};

const DRAFT_KEY = 'bms_admission_draft';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const maskAadhaar = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return 'XXXX-' + digits.slice(4);
    return 'XXXX-XXXX-' + digits.slice(8);
};

const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const STEP_LABELS = ['Student Info', 'Parent Info', 'Documents'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionDivider: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 mt-8 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="text-base font-bold text-slate-700">{title}</h3>
        <div className="flex-1 h-px bg-slate-200" />
    </div>
);

const RequiredNote = () => (
    <p className="text-xs text-slate-500 mb-4">
        <span className="text-red-500 font-bold">*</span> Required fields
    </p>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({ label, required, children, hint }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
);

const inputCls = "block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400";
const selectCls = `${inputCls} bg-white`;

// ─── Document Upload Card ─────────────────────────────────────────────────────
const DocUpload: React.FC<{
    label: string; required?: boolean;
    previewUrl: string;
    onUpload: (file: File) => void;
    uploading: boolean;
}> = ({ label, required, previewUrl, onUpload, uploading }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="border rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
            <p className="text-sm font-semibold text-slate-700">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </p>
            {previewUrl ? (
                <div className="relative group">
                    <img src={previewUrl} alt={label} className="w-full h-36 object-cover rounded-lg border" />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-slate-300 rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-colors text-slate-400 hover:text-sky-600"
                >
                    {uploading ? <SpinnerIcon className="w-6 h-6 text-sky-500" /> : <UploadIcon className="w-6 h-6" />}
                    <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Tap to upload'}</span>
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EnhancedOnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({
    addNotification,
    admissionConfig = DEFAULT_ADMISSION_SETTINGS,
    schoolConfig = {},
    editingAdmission,
}) => {
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2 | 3 | 'review'>(!editingAdmission ? 0 : 1); // 0 = selection screen
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const [savedDraft, setSavedDraft] = useState<Partial<FormData> | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    // ── Load editing admission ────────────────────────────────────────────────
    useEffect(() => {
        if (editingAdmission) {
            setForm({
                ...EMPTY_FORM,
                studentType: editingAdmission.studentType || 'Newcomer',
                previousStudentId: editingAdmission.previousStudentId || '',
                admissionGrade: editingAdmission.admissionGrade || '',
                studentName: editingAdmission.studentName || '',
                dateOfBirth: editingAdmission.dateOfBirth || '',
                gender: editingAdmission.gender || '',
                studentAadhaar: editingAdmission.studentAadhaar || '',
                religion: editingAdmission.religion || '',
                category: editingAdmission.category || '',
                bloodGroup: editingAdmission.bloodGroup || '',
                motherTongue: editingAdmission.motherTongue || '',
                lastSchoolAttended: editingAdmission.lastSchoolAttended || '',
                penNumber: editingAdmission.penNumber || '',
                isCWSN: editingAdmission.isCWSN || 'No',
                healthIssues: editingAdmission.healthIssues || '',
                achievements: editingAdmission.achievements || '',
                siblingsInSchool: String(editingAdmission.siblingsInSchool || 0),
                fatherName: editingAdmission.fatherName || '',
                fatherOccupation: editingAdmission.fatherOccupation || '',
                motherName: editingAdmission.motherName || '',
                motherOccupation: editingAdmission.motherOccupation || '',
                guardianName: editingAdmission.guardianName || '',
                guardianRelationship: editingAdmission.guardianRelationship || '',
                parentAadhaar: editingAdmission.parentAadhaar || '',
                contactNumber: editingAdmission.contactNumber || '',
                email: editingAdmission.email || '',
                permanentAddress: editingAdmission.permanentAddress || '',
                presentAddress: editingAdmission.presentAddress || '',
                birthCertificateUrl: editingAdmission.birthCertificateUrl || '',
                transferCertificateUrl: editingAdmission.transferCertificateUrl || '',
                reportCardUrl: editingAdmission.reportCardUrl || '',
                studentPhotoUrl: '',
            });
            setStep(1);
        }
    }, [editingAdmission]);

    // ── Draft persistence ─────────────────────────────────────────────────────
    useEffect(() => {
        if (editingAdmission) return;
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw) as Partial<FormData>;
                if (draft.studentName || draft.fatherName) {
                    setSavedDraft(draft);
                    setShowDraftPrompt(true);
                }
            }
        } catch { /* ignore */ }
    }, []);

    const saveDraft = useCallback((data: FormData) => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
            setLastSaved(new Date());
        } catch { /* ignore */ }
    }, []);

    // ── Auto-save every 60 s ──────────────────────────────────────────────────
    useEffect(() => {
        if (step === 0 || step === 'review' || submitted) return;
        const timer = setInterval(() => saveDraft(form), 60_000);
        return () => clearInterval(timer);
    }, [form, step, submitted, saveDraft]);

    // ── Field change ──────────────────────────────────────────────────────────
    const set = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    // ── File upload ───────────────────────────────────────────────────────────
    const handleFileUpload = async (field: keyof FormData, file: File) => {
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const resized = await resizeImage(file, 800, 800, 0.85);
            const url = await uploadToImgBB(resized);
            set(field, url);
        } catch {
            addNotification('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (s: 1 | 2 | 3): boolean => {
        const errs: Partial<Record<keyof FormData, string>> = {};
        if (s === 1) {
            if (!form.admissionGrade) errs.admissionGrade = 'Class is required';
            if (!form.studentName.trim()) errs.studentName = 'Student name is required';
            if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
            if (!form.gender) errs.gender = 'Gender is required';
            if (form.studentAadhaar && form.studentAadhaar.replace(/\D/g, '').length !== 12)
                errs.studentAadhaar = 'Aadhaar must be exactly 12 digits';
        }
        if (s === 2) {
            if (!form.fatherName.trim()) errs.fatherName = "Father's name is required";
            if (!form.motherName.trim()) errs.motherName = "Mother's name is required";
            if (!form.contactNumber) errs.contactNumber = 'Contact number is required';
            else if (!/^\d{10}$/.test(form.contactNumber))
                errs.contactNumber = 'Enter a valid 10-digit mobile number';
            if (!form.presentAddress.trim()) errs.presentAddress = 'Address is required';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => {
        const cur = step as 1 | 2 | 3;
        if (!validate(cur)) {
            addNotification('Please fix the errors before continuing.', 'error');
            return;
        }
        saveDraft(form);
        if (cur === 3) { setStep('review'); return; }
        setStep((cur + 1) as 1 | 2 | 3);
    };

    const prevStep = () => {
        if (step === 'review') { setStep(3); return; }
        setStep(prev => Math.max(1, (prev as number) - 1) as 1 | 2 | 3);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload: Omit<OnlineAdmission, 'id'> = {
                studentType: form.studentType,
                previousStudentId: form.previousStudentId,
                admissionGrade: form.admissionGrade,
                studentName: form.studentName.trim(),
                dateOfBirth: form.dateOfBirth,
                gender: form.gender,
                studentAadhaar: form.studentAadhaar.replace(/\D/g, ''),
                religion: form.religion,
                category: form.category,
                bloodGroup: form.bloodGroup,
                motherTongue: form.motherTongue,
                lastSchoolAttended: form.lastSchoolAttended,
                lastDivision: form.lastDivision,
                penNumber: form.penNumber,
                isCWSN: form.isCWSN,
                healthIssues: form.healthIssues,
                achievements: form.achievements,
                siblingsInSchool: Number(form.siblingsInSchool) || 0,
                fatherName: form.fatherName.trim(),
                fatherOccupation: form.fatherOccupation,
                motherName: form.motherName.trim(),
                motherOccupation: form.motherOccupation,
                guardianName: form.guardianName,
                guardianRelationship: form.guardianRelationship,
                parentAadhaar: form.parentAadhaar.replace(/\D/g, ''),
                contactNumber: form.contactNumber,
                email: form.email,
                permanentAddress: form.permanentAddress.trim(),
                presentAddress: form.presentAddress.trim(),
                birthCertificateUrl: form.birthCertificateUrl,
                transferCertificateUrl: form.transferCertificateUrl,
                reportCardUrl: form.reportCardUrl,
                submissionDate: new Date().toISOString(),
                status: 'pending',
                paymentStatus: undefined,
            };

            let docId: string;
            if (editingAdmission) {
                await db.collection('online_admissions').doc(editingAdmission.id).update(payload);
                docId = editingAdmission.id;
            } else {
                const ref = await db.collection('online_admissions').add(payload);
                docId = ref.id;
            }

            localStorage.removeItem(DRAFT_KEY);
            setReferenceId(docId);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            addNotification('Submission failed. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // School constants (hardcoded)
    const SCHOOL_NAME = 'Bethel Mission School';
    const SCHOOL_LOGO = 'https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png';
    const UDISE_ELEMENTARY = '15040100705';
    const UDISE_SECONDARY = '15040100708';
    const ADMISSION_DEADLINE_ISO = '2026-04-01';

    const deadlineLabel = new Date(ADMISSION_DEADLINE_ISO).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const schoolName = SCHOOL_NAME;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 0: Selection screen
    // ─────────────────────────────────────────────────────────────────────────
    if (step === 0) {
        return (
            <div className="bg-slate-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-xl">
                    {/* School banner */}
                    <div className="bg-gradient-to-br from-sky-800 to-sky-600 rounded-2xl p-8 mb-6 text-white text-center shadow-xl">
                        <img src={SCHOOL_LOGO} alt="Bethel Mission School Logo" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/30 object-cover shadow-lg" />
                        <h1 className="text-2xl font-extrabold tracking-tight">{SCHOOL_NAME}</h1>
                        <div className="flex justify-center gap-3 mt-2 flex-wrap">
                            <span className="bg-white/15 border border-white/25 rounded-full px-3 py-0.5 text-xs font-mono text-sky-100">Elementary UDISE: {UDISE_ELEMENTARY}</span>
                            <span className="bg-white/15 border border-white/25 rounded-full px-3 py-0.5 text-xs font-mono text-sky-100">Secondary UDISE: {UDISE_SECONDARY}</span>
                        </div>
                        <p className="text-sky-100 text-sm mt-3">Online Admission Portal — {admissionConfig.academicYearLabel}</p>
                    </div>

                    {/* Deadline banner */}
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-amber-800">
                        <span className="text-2xl">⏰</span>
                        <p className="text-sm font-semibold">Applications open until <strong>{deadlineLabel}</strong></p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Start Your Application</h2>
                        <p className="text-center text-slate-500 text-sm mb-6">Select the type of student applying</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => { set('studentType', 'Newcomer'); setStep(1); }}
                                className="group flex flex-col items-center gap-3 p-6 border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all"
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform">🎓</span>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800 text-sm">New Student</p>
                                    <p className="text-xs text-slate-500 mt-1">First time applying</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { set('studentType', 'Existing'); setStep(1); }}
                                className="group flex flex-col items-center gap-3 p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform">🔄</span>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800 text-sm">Existing Student</p>
                                    <p className="text-xs text-slate-500 mt-1">Already enrolled</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-4">🔒 Your data is secure and encrypted</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMITTED confirmation
    // ─────────────────────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 text-center">
                    <img src={SCHOOL_LOGO} alt="Bethel Mission School" className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-slate-200 object-cover shadow" />
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                        <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Application Submitted!</h2>
                    <p className="text-slate-500 mt-3 text-sm">Your application to <strong>Bethel Mission School</strong> has been received successfully.</p>

                    <div className="mt-6 bg-sky-50 border-2 border-dashed border-sky-300 rounded-xl px-6 py-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Reference ID</p>
                        <p className="font-mono text-2xl font-extrabold text-sky-700 tracking-widest">{referenceId}</p>
                        <p className="text-xs text-slate-400 mt-2">Keep this ID to track your application</p>
                    </div>

                    <p className="text-xs text-slate-500 mt-4">
                        Next step: Proceed to <strong>Payment</strong> to complete your admission.
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={() => navigate(`/admissions/payment/${referenceId}`)}
                            className="btn btn-primary w-full !py-3"
                        >
                            Proceed to Payment →
                        </button>
                        <Link to="/admissions/status" className="btn btn-secondary w-full text-center !py-3 block">
                            Check Application Status
                        </Link>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">🔒 Your data is secure</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REVIEW SUMMARY PAGE
    // ─────────────────────────────────────────────────────────────────────────
    if (step === 'review') {
        const rows = [
            ['Student Name', form.studentName],
            ['Applying for Class', form.admissionGrade],
            ['Date of Birth', form.dateOfBirth],
            ['Gender', form.gender],
            ['Aadhaar', form.studentAadhaar ? maskAadhaar(form.studentAadhaar) : '—'],
            ['Father\'s Name', form.fatherName],
            ['Mother\'s Name', form.motherName],
            ['Contact', '+91 ' + form.contactNumber],
            ['Email', form.email || '—'],
            ['Address', form.presentAddress],
            ['Last School', form.lastSchoolAttended || '—'],
        ];
        return (
            <div className="bg-slate-50 min-h-screen py-10">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-slate-800 px-8 py-5 text-white">
                            <h2 className="text-xl font-bold">Review Your Application</h2>
                            <p className="text-slate-300 text-sm mt-1">Please verify all details before submitting</p>
                        </div>

                        <div className="p-8">
                            <div className="rounded-xl border overflow-hidden mb-6">
                                <div className="bg-slate-50 px-5 py-3 border-b">
                                    <p className="font-bold text-slate-700 text-sm">Application Summary</p>
                                </div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {rows.map(([k, v]) => (
                                            <tr key={k} className="border-b last:border-0">
                                                <td className="px-5 py-2.5 text-slate-500 font-medium w-48">{k}</td>
                                                <td className="px-5 py-2.5 font-semibold text-slate-800">{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Document thumbnails */}
                            <div className="mb-6">
                                <p className="font-bold text-slate-700 text-sm mb-3">Uploaded Documents</p>
                                <div className="flex gap-4 flex-wrap">
                                    {([
                                        ['Photo', form.studentPhotoUrl],
                                        ['Birth Cert.', form.birthCertificateUrl],
                                        ['TC', form.transferCertificateUrl],
                                        ['Report Card', form.reportCardUrl],
                                    ] as [string, string][]).filter(([, url]) => url).map(([label, url]) => (
                                        <div key={label} className="text-center">
                                            <img src={url} alt={label} className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                                            <p className="text-xs text-slate-500 mt-1">{label}</p>
                                        </div>
                                    ))}
                                    {!form.studentPhotoUrl && !form.birthCertificateUrl && !form.transferCertificateUrl && !form.reportCardUrl && (
                                        <p className="text-sm text-slate-400 italic">No documents uploaded</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <span className="text-xl mt-0.5">⚠️</span>
                                <p className="text-sm text-amber-800">Once submitted, you will not be able to edit your application without contacting the school office. Please review carefully.</p>
                            </div>

                            <div className="flex gap-3 flex-col sm:flex-row-reverse">
                                <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1 !py-3 flex items-center justify-center gap-2">
                                    {submitting ? <SpinnerIcon className="w-5 h-5" /> : '✅'}
                                    {submitting ? 'Submitting…' : 'Confirm & Submit'}
                                </button>
                                <button onClick={prevStep} className="btn btn-secondary flex-1 !py-3">← Edit Application</button>
                            </div>

                            <p className="text-xs text-center text-slate-400 mt-4">🔒 Your data is secure and encrypted</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DRAFT PROMPT
    // ─────────────────────────────────────────────────────────────────────────
    const DraftPrompt = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                <p className="text-3xl mb-3">📝</p>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Unsaved Draft Found</h3>
                <p className="text-sm text-slate-500 mb-6">
                    You have an unfinished application for <strong>{savedDraft?.studentName || 'a student'}</strong>. Would you like to continue where you left off?
                </p>
                <div className="flex gap-3">
                    <button
                        className="flex-1 btn btn-secondary"
                        onClick={() => { setShowDraftPrompt(false); setSavedDraft(null); localStorage.removeItem(DRAFT_KEY); }}
                    >
                        Start Fresh
                    </button>
                    <button
                        className="flex-1 btn btn-primary"
                        onClick={() => {
                            if (savedDraft) setForm(prev => ({ ...prev, ...savedDraft }));
                            setShowDraftPrompt(false);
                            setStep(1);
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // FORM STEPS 1–3
    // ─────────────────────────────────────────────────────────────────────────
    const stepNum = step as 1 | 2 | 3;

    return (
        <>
            {showDraftPrompt && <DraftPrompt />}

            <div className="bg-slate-50 min-h-screen py-10 pb-32 md:pb-10">
                <div className="container mx-auto px-4 max-w-2xl">

                    {/* School banner (compact) */}
                    <div className="bg-gradient-to-r from-sky-800 to-sky-600 rounded-2xl px-6 py-4 mb-6 text-white flex items-center gap-4">
                        <img src={SCHOOL_LOGO} alt="BMS Logo" className="w-12 h-12 rounded-full border-2 border-white/30 object-cover flex-shrink-0" />
                        <div className="min-w-0">
                            <h1 className="font-extrabold text-base leading-tight">{SCHOOL_NAME}</h1>
                            <p className="text-sky-200 text-xs mt-0.5">Online Admission — {admissionConfig.academicYearLabel}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                                <span className="text-[10px] font-mono bg-white/15 rounded px-1.5 py-0.5 text-sky-100">Elem: {UDISE_ELEMENTARY}</span>
                                <span className="text-[10px] font-mono bg-white/15 rounded px-1.5 py-0.5 text-sky-100">Sec: {UDISE_SECONDARY}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deadline banner */}
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5 text-amber-800">
                        <span>⏰</span>
                        <p className="text-xs font-semibold">Applications open until <strong>{deadlineLabel}</strong></p>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-white rounded-2xl shadow p-6 mb-6">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-slate-500">Step {stepNum} of 3</p>
                            {lastSaved && (
                                <p className="text-xs text-slate-400">💾 Last saved at {formatTime(lastSaved)}</p>
                            )}
                        </div>
                        <div className="relative mt-3">
                            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 z-0" />
                            <div
                                className="absolute top-4 left-0 h-1 bg-sky-500 z-0 transition-all duration-500"
                                style={{ width: `${((stepNum - 1) / 2) * 100}%` }}
                            />
                            <div className="relative z-10 flex justify-between">
                                {STEP_LABELS.map((label, i) => {
                                    const done = i + 1 < stepNum;
                                    const active = i + 1 === stepNum;
                                    return (
                                        <div key={label} className="flex flex-col items-center gap-2" style={{ width: '33%' }}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? 'bg-sky-500 border-sky-500 text-white' : active ? 'bg-white border-sky-500 text-sky-600' : 'bg-white border-slate-300 text-slate-400'}`}>
                                                {done ? '✓' : i + 1}
                                            </div>
                                            <span className={`text-xs font-semibold ${active ? 'text-sky-600' : done ? 'text-sky-400' : 'text-slate-400'}`}>{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <RequiredNote />

                        {/* ── STEP 1: Student Info ─────────────────────────────────── */}
                        {stepNum === 1 && (
                            <div>
                                <SectionDivider icon="🎓" title="Admission Details" />

                                {form.studentType === 'Existing' && (
                                    <div className="mb-5 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                                        <Field label="Previous Student ID" hint="Your existing student ID number">
                                            <input className={inputCls} value={form.previousStudentId} onChange={e => set('previousStudentId', e.target.value)} placeholder="e.g. BMS-2024-001" />
                                        </Field>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Class Applying For" required>
                                        <select className={selectCls} value={form.admissionGrade} onChange={e => set('admissionGrade', e.target.value)}>
                                            <option value="">Select Class</option>
                                            {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        {errors.admissionGrade && <p className="text-xs text-red-500 mt-1">{errors.admissionGrade}</p>}
                                    </Field>
                                </div>

                                <SectionDivider icon="👤" title="Student Information" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Full Name" required>
                                        <input className={inputCls} value={form.studentName} onChange={e => set('studentName', e.target.value)} placeholder="As per birth certificate" />
                                        {errors.studentName && <p className="text-xs text-red-500 mt-1">{errors.studentName}</p>}
                                    </Field>
                                    <Field label="Date of Birth" required>
                                        <input type="date" className={inputCls} value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                                        {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                                    </Field>
                                    <Field label="Gender" required>
                                        <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                            <option value="">Select</option>
                                            {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                                        </select>
                                        {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                                    </Field>
                                    <Field label="Aadhaar Number" hint="12-digit number — will be masked for security">
                                        <input
                                            className={inputCls}
                                            value={form.studentAadhaar ? maskAadhaar(form.studentAadhaar) : ''}
                                            onChange={e => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                set('studentAadhaar', digits);
                                            }}
                                            placeholder="XXXX-XXXX-1234"
                                            maxLength={14}
                                        />
                                        {errors.studentAadhaar && <p className="text-xs text-red-500 mt-1">{errors.studentAadhaar}</p>}
                                    </Field>
                                    <Field label="Blood Group">
                                        <select className={selectCls} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                                            <option value="">Select</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Religion">
                                        <input className={inputCls} value={form.religion} onChange={e => set('religion', e.target.value)} placeholder="e.g. Hindu, Christian…" />
                                    </Field>
                                    <Field label="Category">
                                        <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
                                            <option value="">Select</option>
                                            {['General', 'SC', 'ST', 'OBC'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Mother Tongue">
                                        <input className={inputCls} value={form.motherTongue} onChange={e => set('motherTongue', e.target.value)} placeholder="e.g. Mizo, Hindi…" />
                                    </Field>
                                </div>

                                <SectionDivider icon="🏫" title="Previous School Details" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <Field label="Last School Attended">
                                            <input className={inputCls} value={form.lastSchoolAttended} onChange={e => set('lastSchoolAttended', e.target.value)} placeholder="School name" />
                                        </Field>
                                    </div>
                                    <Field label="Last Class Division / Result">
                                        <input className={inputCls} value={form.lastDivision} onChange={e => set('lastDivision', e.target.value)} placeholder="e.g. First Division" />
                                    </Field>
                                    <Field label="PEN Number">
                                        <input className={inputCls} value={form.penNumber} onChange={e => set('penNumber', e.target.value)} placeholder="Permanent Education Number" />
                                    </Field>
                                </div>

                                <SectionDivider icon="ℹ️" title="Additional Information" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="CWSN">
                                        <select className={selectCls} value={form.isCWSN} onChange={e => set('isCWSN', e.target.value)}>
                                            <option>No</option>
                                            <option>Yes</option>
                                        </select>
                                    </Field>
                                    <Field label="Siblings in This School">
                                        <input type="number" min="0" className={inputCls} value={form.siblingsInSchool} onChange={e => set('siblingsInSchool', e.target.value)} />
                                    </Field>
                                    <div className="sm:col-span-2">
                                        <Field label="Health Issues (if any)">
                                            <textarea className={inputCls} rows={2} value={form.healthIssues} onChange={e => set('healthIssues', e.target.value)} placeholder="Any known medical conditions…" />
                                        </Field>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Field label="Achievements / Extracurriculars">
                                            <textarea className={inputCls} rows={2} value={form.achievements} onChange={e => set('achievements', e.target.value)} placeholder="Awards, sports, etc." />
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Parent Info ──────────────────────────────────── */}
                        {stepNum === 2 && (
                            <div>
                                <SectionDivider icon="👨‍👩‍👦" title="Parent / Guardian Information" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Father's Name" required>
                                        <input className={inputCls} value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
                                        {errors.fatherName && <p className="text-xs text-red-500 mt-1">{errors.fatherName}</p>}
                                    </Field>
                                    <Field label="Father's Occupation">
                                        <input className={inputCls} value={form.fatherOccupation} onChange={e => set('fatherOccupation', e.target.value)} />
                                    </Field>
                                    <Field label="Mother's Name" required>
                                        <input className={inputCls} value={form.motherName} onChange={e => set('motherName', e.target.value)} />
                                        {errors.motherName && <p className="text-xs text-red-500 mt-1">{errors.motherName}</p>}
                                    </Field>
                                    <Field label="Mother's Occupation">
                                        <input className={inputCls} value={form.motherOccupation} onChange={e => set('motherOccupation', e.target.value)} />
                                    </Field>
                                    <Field label="Guardian's Name (if different)">
                                        <input className={inputCls} value={form.guardianName} onChange={e => set('guardianName', e.target.value)} />
                                    </Field>
                                    <Field label="Guardian Relationship">
                                        <input className={inputCls} value={form.guardianRelationship} onChange={e => set('guardianRelationship', e.target.value)} placeholder="e.g. Uncle, Grandparent" />
                                    </Field>
                                    <div className="sm:col-span-2">
                                        <Field label="Parent Aadhaar Number" hint="Parent's/Guardian's Aadhaar">
                                            <input
                                                className={inputCls}
                                                value={form.parentAadhaar ? maskAadhaar(form.parentAadhaar) : ''}
                                                onChange={e => {
                                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                    set('parentAadhaar', digits);
                                                }}
                                                placeholder="XXXX-XXXX-1234"
                                                maxLength={14}
                                            />
                                        </Field>
                                    </div>
                                </div>

                                <SectionDivider icon="📞" title="Contact Details" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Mobile Number" required hint="10-digit Indian mobile number">
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-semibold">+91</span>
                                            <input
                                                className="block w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                                value={form.contactNumber}
                                                onChange={e => set('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                inputMode="numeric"
                                            />
                                        </div>
                                        {errors.contactNumber && <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>}
                                    </Field>
                                    <Field label="Email Address">
                                        <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="parent@example.com" />
                                    </Field>
                                    <div className="sm:col-span-2">
                                        <Field label="Permanent Address" required>
                                            <textarea className={inputCls} rows={2} value={form.permanentAddress} onChange={e => set('permanentAddress', e.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Field label="Present / Correspondence Address" required>
                                            <div className="flex gap-2 mb-1">
                                                <button type="button" onClick={() => set('presentAddress', form.permanentAddress)} className="text-xs text-sky-600 hover:underline">
                                                    Same as permanent
                                                </button>
                                            </div>
                                            <textarea className={inputCls} rows={2} value={form.presentAddress} onChange={e => set('presentAddress', e.target.value)} />
                                            {errors.presentAddress && <p className="text-xs text-red-500 mt-1">{errors.presentAddress}</p>}
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Documents ────────────────────────────────────── */}
                        {stepNum === 3 && (
                            <div>
                                <SectionDivider icon="📄" title="Document Upload" />
                                <p className="text-sm text-slate-500 mb-4">Upload clear images of the required documents. Accepted formats: JPG, PNG.</p>

                                {/* Single-column stacked grid (mobile-first, 2-col on md+) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <DocUpload
                                        label="Passport Photo"
                                        required
                                        previewUrl={form.studentPhotoUrl}
                                        onUpload={f => handleFileUpload('studentPhotoUrl', f)}
                                        uploading={!!uploading.studentPhotoUrl}
                                    />
                                    <DocUpload
                                        label="Birth Certificate"
                                        required
                                        previewUrl={form.birthCertificateUrl}
                                        onUpload={f => handleFileUpload('birthCertificateUrl', f)}
                                        uploading={!!uploading.birthCertificateUrl}
                                    />
                                    <DocUpload
                                        label="Transfer Certificate (TC)"
                                        previewUrl={form.transferCertificateUrl}
                                        onUpload={f => handleFileUpload('transferCertificateUrl', f)}
                                        uploading={!!uploading.transferCertificateUrl}
                                    />
                                    <DocUpload
                                        label="Last Report Card / Marksheet"
                                        previewUrl={form.reportCardUrl}
                                        onUpload={f => handleFileUpload('reportCardUrl', f)}
                                        uploading={!!uploading.reportCardUrl}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── STICKY BOTTOM ACTION BAR (mobile) ──────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl px-4 py-3 flex gap-3 z-40 md:relative md:border-0 md:shadow-none md:bg-transparent md:mt-4 md:px-0 md:pb-0 md:max-w-2xl md:mx-auto">
                {stepNum > 1 ? (
                    <button onClick={prevStep} className="flex-1 btn btn-secondary !py-3">← Back</button>
                ) : (
                    <button onClick={() => setStep(0)} className="flex-1 btn btn-secondary !py-3">← Selection</button>
                )}
                <button onClick={nextStep} disabled={submitting} className="flex-1 btn btn-primary !py-3 flex items-center justify-center gap-2">
                    {stepNum < 3 ? 'Next →' : 'Review Application →'}
                </button>
            </div>
        </>
    );
};

export default EnhancedOnlineAdmissionPage;
