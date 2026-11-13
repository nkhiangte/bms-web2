import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, OnlineAdmission, Grade, Gender, Category, Student, BloodGroup } from '@/types';
import { GRADES_LIST, CATEGORY_LIST, GENDER_LIST, BLOOD_GROUP_LIST } from '@/constants';
import { UploadIcon, SpinnerIcon, CheckIcon, XIcon, PlusIcon, UserIcon, SearchIcon, ArrowRightIcon, SaveIcon, BackIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';
import CustomDatePicker from '@/components/CustomDatePicker';
import { resizeImage, uploadToImgBB, getNextGrade } from '@/utils';
import { db } from '@/firebaseConfig';

const { useNavigate, Link } = ReactRouterDOM as any;

// ── School Constants ──────────────────────────────────────────────────────────
const ADMISSION_DEADLINE = new Date('2026-04-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
const DRAFT_KEY = 'bms_admission_draft_v1';

// ── Helpers ───────────────────────────────────────────────────────────────────
const maskAadhaar = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return 'XXXX-' + digits.slice(4);
    return 'XXXX-XXXX-' + digits.slice(8);
};

const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ── Props ─────────────────────────────────────────────────────────────────────
interface OnlineAdmissionPageProps {
    user: User | null;
    onOnlineAdmissionSubmit: (data: Partial<OnlineAdmission>, id?: string) => Promise<string>;
}

// ── Progress Bar (enhanced with labels + step text) ───────────────────────────
const STEP_LABELS = ['Student Info', 'Parent Info', 'Documents'];

const ProgressBar: React.FC<{ currentStep: number; lastSaved: Date | null }> = ({ currentStep, lastSaved }) => (
    <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A]/75">Step {currentStep} of 3</p>
            {lastSaved && (
                <p className="text-xs text-[#8E6D1B] font-medium flex items-center gap-1 font-tabular">
                    Saved at {formatTime(lastSaved)}
                </p>
            )}
        </div>
        <div className="relative">
            {/* Track */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-[#0B1F3A]/15 z-0" />
            {/* Fill */}
            <div
                className="absolute top-4 left-0 h-1 bg-[#C9A84C] z-0 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
            {/* Steps */}
            <div className="relative z-10 flex justify-between">
                {STEP_LABELS.map((label, i) => {
                    const done = i + 1 < currentStep;
                    const active = i + 1 === currentStep;
                    return (
                        <div key={label} className="flex flex-col items-center gap-2" style={{ width: '33%' }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all font-tabular ${
                                done ? 'bg-[#0B1F3A] border-[#C9A84C] text-[#DFC06B]'
                                : active ? 'bg-[#C9A84C] border-[#0B1F3A] text-[#0B1F3A]'
                                : 'bg-white border-[#0B1F3A]/25 text-[#0B1F3A]/50'
                            }`}>
                                {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs font-bold text-center ${
                                active ? 'text-[#0B1F3A]' : done ? 'text-[#8E6D1B]' : 'text-[#0B1F3A]/50'
                            }`}>{label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

// ── Section Divider ───────────────────────────────────────────────────────────
const SectionDivider: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 mt-8 mb-5">
        <span className="text-xl">{icon}</span>
        <h3 className="text-base font-extrabold text-[#0B1F3A] whitespace-nowrap">{title}</h3>
        <div className="flex-1 h-px bg-[#0B1F3A]/15" />
    </div>
);

// ── Field Error ───────────────────────────────────────────────────────────────
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? <p className="text-[#8E6D1B] font-semibold text-xs mt-1">{message}</p> : null;

// ── Main Component ────────────────────────────────────────────────────────────
const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ user, onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<Partial<OnlineAdmission> | null>(null);
    const [showReviewPage, setShowReviewPage] = useState(false);

    useEffect(() => {
        document.querySelector('.max-w-4xl')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step, showReviewPage]);

    // ── Draft persistence: check on mount ────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw) as Partial<OnlineAdmission>;
                if (draft.studentName || draft.fatherName) {
                    setPendingDraft(draft);
                    setShowDraftPrompt(true);
                }
            }
        } catch { /* ignore */ }
    }, []);

    const saveDraftLocally = useCallback((data: Partial<OnlineAdmission>) => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
            setLastSaved(new Date());
        } catch { /* ignore */ }
    }, []);

    // 'existing' | 'continue' | 'resubmit' | null
    const [showIdInput, setShowIdInput] = useState<'existing' | 'continue' | 'resubmit' | null>(null);
    const [existingId, setExistingId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [savedApplicationId, setSavedApplicationId] = useState<string | null>(null);

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

    // ── Auto-save every 60s ───────────────────────────────────────────────────
    useEffect(() => {
        if (step === 0 || showReviewPage) return;
        const timer = setInterval(() => saveDraftLocally(formData), 60_000);
        return () => clearInterval(timer);
    }, [formData, step, showReviewPage, saveDraftLocally]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof OnlineAdmission) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingDoc(String(field));
            try {
                const file = e.target.files[0];
                const resized = await resizeImage(file, 1024, 1024, 0.8);
                const url = await uploadToImgBB(resized);
                setFormData(prev => ({ ...prev, [field]: url }));
                if (errors[String(field)]) {
                    setErrors(prev => { const next = { ...prev }; delete next[String(field)]; return next; });
                }
            } catch (error) {
                console.error(`Error uploading ${String(field)}:`, error);
                alert("Failed to upload document. Please try again.");
            } finally {
                setUploadingDoc(null);
            }
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.studentName?.trim()) newErrors.studentName = "Student name is required.";
            if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
            if (!formData.gender) newErrors.gender = "Gender is required.";
            if (!formData.category) newErrors.category = "Category is required.";
            if (!formData.religion?.trim()) newErrors.religion = "Religion is required.";
        }
        if (currentStep === 2) {
            if (!formData.fatherName?.trim()) newErrors.fatherName = "Father's name is required.";
            if (!formData.motherName?.trim()) newErrors.motherName = "Mother's name is required.";
            if (!formData.contactNumber?.trim()) newErrors.contactNumber = "Contact number is required.";
            if (!formData.permanentAddress?.trim()) newErrors.permanentAddress = "Permanent address is required.";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorEl = document.querySelector('.field-error');
                if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
            return false;
        }
        return true;
    };

    // ── ORIGINAL fetch logic — unchanged ─────────────────────────────────────
    const handleFetchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!existingId.trim()) return;

        const idInput = showIdInput === 'existing'
            ? existingId.trim().toUpperCase()
            : existingId.trim();

        setIsFetching(true);
        setFetchError('');

        if (showIdInput === 'resubmit') {
            try {
                const doc = await db.collection('online_admissions').doc(idInput).get();
                if (doc.exists) {
                    navigate(`/admissions/payment/${idInput}`);
                } else {
                    setFetchError('Reference ID not found. Please check and try again.');
                }
            } catch (error) {
                setFetchError('An error occurred. Please try again.');
            } finally {
                setIsFetching(false);
            }
            return;
        }

        const fillFormWithStudent = (data: Student | OnlineAdmission, isAdmissionDraft = false) => {
            const studentData = data as Student;
            const admissionData = data as OnlineAdmission;
            const nextGrade = isAdmissionDraft ? admissionData.admissionGrade : getNextGrade(studentData.grade);
            setFormData(prev => ({
                ...(isAdmissionDraft ? admissionData : prev),
                studentType: 'Existing',
                previousStudentId: studentData.studentId || idInput,
                admissionGrade: nextGrade || studentData.grade,
                studentName: studentData.name || admissionData.studentName,
                dateOfBirth: studentData.dateOfBirth || admissionData.dateOfBirth,
                gender: studentData.gender || admissionData.gender,
                studentAadhaar: studentData.aadhaarNumber || admissionData.studentAadhaar,
                fatherName: studentData.fatherName || admissionData.fatherName,
                motherName: studentData.motherName || admissionData.motherName,
                fatherOccupation: studentData.fatherOccupation || admissionData.fatherOccupation,
                motherOccupation: studentData.motherOccupation || admissionData.motherOccupation,
                parentAadhaar: studentData.fatherAadhaar || admissionData.parentAadhaar,
                guardianName: studentData.guardianName || admissionData.guardianName,
                guardianRelationship: studentData.guardianRelationship || admissionData.guardianRelationship,
                permanentAddress: studentData.address || admissionData.permanentAddress,
                presentAddress: studentData.address || admissionData.presentAddress,
                contactNumber: studentData.contact || admissionData.contactNumber,
                religion: studentData.religion || admissionData.religion,
                category: (studentData.category as string) || (admissionData.category as string),
                cwsn: studentData.cwsn || admissionData.cwsn,
                bloodGroup: studentData.bloodGroup || admissionData.bloodGroup,
                penNumber: studentData.pen || admissionData.penNumber,
                achievements: studentData.achievements || admissionData.achievements,
                healthIssues: studentData.healthConditions || admissionData.healthIssues,
                lastSchoolAttended: isAdmissionDraft ? admissionData.lastSchoolAttended : 'Bethel Mission School',
            }));
            setStep(1);
        };

        try {
            if (showIdInput === 'continue') {
                const doc = await db.collection('online_admissions').doc(idInput).get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data?.status === 'rejected') {
                        setFetchError('This application has been rejected and cannot be edited.');
                        return;
                    }
                    fillFormWithStudent({ id: doc.id, ...data } as OnlineAdmission, true);
                } else {
                    setFetchError('Application not found. Please check the ID.');
                }
                return;
            }

            let snapshot = await db.collection('students').where('studentId', '==', idInput).limit(1).get();
            if (!snapshot.empty) {
                fillFormWithStudent(snapshot.docs[0].data() as Student);
                return;
            }

            const idPattern = /^BMS(\d{2})([A-Z0-9]{2})(\d+)$/;
            const match = idInput.match(idPattern);
            if (match) {
                const [_, yearShort, gradeCode, rollStr] = match;
                const rollNo = parseInt(rollStr, 10);
                const targetYearStart = `20${yearShort}`;
                const gradeMap: Record<string, string> = {
                    'NU': 'Nursery', 'KG': 'Kindergarten',
                    '01': 'Class I', '02': 'Class II', '03': 'Class III', '04': 'Class IV',
                    '05': 'Class V', '06': 'Class VI', '07': 'Class VII', '08': 'Class VIII',
                    '09': 'Class IX', '10': 'Class X'
                };
                const grade = gradeMap[gradeCode];
                if (grade) {
                    const fallbackSnapshot = await db.collection('students').where('grade', '==', grade).where('rollNo', '==', rollNo).get();
                    const foundDoc = fallbackSnapshot.docs.find(doc => {
                        const s = doc.data() as Student;
                        return s.academicYear && s.academicYear.startsWith(targetYearStart);
                    });
                    if (foundDoc) {
                        fillFormWithStudent(foundDoc.data() as Student);
                        return;
                    }
                }
            }
            setFetchError('Student ID not found. Please check the ID or choose "Skip" to fill manually.');
        } catch (error) {
            console.error("Error fetching student/application:", error);
            setFetchError('An error occurred while fetching details.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSaveForLater = async () => {
        setIsSaving(true);
        try {
            const draftData = {
                ...formData,
                status: 'draft' as const,
                submissionDate: formData.submissionDate || new Date().toISOString(),
            };
            const id = await onOnlineAdmissionSubmit(draftData, formData.id);
            setFormData(prev => ({ ...prev, id }));
            setSavedApplicationId(id);
            saveDraftLocally({ ...draftData, id });
        } catch (error) {
            console.error("Save for later failed:", error);
            alert("Failed to save application draft.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // ── FIX: Only require documents for Newcomers, not Existing/boarder students ──
        const isNewStudent = formData.studentType === 'Newcomer';
        const isNursery = formData.admissionGrade === Grade.NURSERY;
        const docErrors: Record<string, string> = {};
        if (isNewStudent && !formData.birthCertificateUrl) {
            docErrors.birthCertificateUrl = "Birth Certificate is mandatory for new students.";
        }
        if (isNewStudent && !isNursery && !formData.reportCardUrl) {
            docErrors.reportCardUrl = "Last Report Card is mandatory for new students (except Nursery).";
        }
        if (Object.keys(docErrors).length > 0) {
            setErrors(docErrors);
            setTimeout(() => {
                const firstErrorEl = document.querySelector('.field-error');
                if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
            return;
        }
        // Show review page before final submit
        setShowReviewPage(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const admissionData = {
                ...formData,
                submissionDate: new Date().toISOString(),
                status: 'pending' as const
            };
            const id = await onOnlineAdmissionSubmit(admissionData, formData.id);
            localStorage.removeItem(DRAFT_KEY);
            navigate(`/admissions/payment/${id}`, {
                state: {
                    grade: formData.admissionGrade,
                    studentName: formData.studentName,
                    fatherName: formData.fatherName,
                    contact: formData.contactNumber,
                    studentType: formData.studentType
                }
            });
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── FIX: Derive both flags used throughout the component ──────────────────
    const isNewStudent = formData.studentType === 'Newcomer';
    const isExistingStudent = formData.studentType === 'Existing';
    const isNursery = formData.admissionGrade === Grade.NURSERY;

    // ─── Draft Prompt Overlay ─────────────────────────────────────────────────
    const DraftPrompt = () => (
        <div className="fixed inset-0 bg-[#07162B]/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-t-4 border-[#C9A84C] rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                <h3 className="text-lg font-extrabold text-[#0B1F3A] mb-2">Unsaved Draft Found</h3>
                <p className="text-sm text-[#0B1F3A]/75 mb-6">
                    You have an unfinished application for{' '}
                    <strong className="text-[#0B1F3A]">{pendingDraft?.studentName || 'a student'}</strong>.
                    Would you like to continue where you left off?
                </p>
                <div className="flex gap-3">
                    <button
                        className="flex-1 btn btn-secondary"
                        onClick={() => {
                            setShowDraftPrompt(false);
                            setPendingDraft(null);
                            localStorage.removeItem(DRAFT_KEY);
                        }}
                    >
                        Start Fresh
                    </button>
                    <button
                        className="flex-1 btn btn-primary"
                        onClick={() => {
                            if (pendingDraft) {
                                setFormData(prev => ({ ...prev, ...pendingDraft }));
                                setStep(1);
                            }
                            setShowDraftPrompt(false);
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── Review / Summary Page ────────────────────────────────────────────────
    if (showReviewPage) {
        const rows: [string, string][] = [
            ['Student Name', formData.studentName || '—'],
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
                <div className="bg-[#F4F7FB] py-10 sm:py-12 min-h-screen">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="bg-white border border-[#0B1F3A]/10 rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-[#0B1F3A] border-b-4 border-[#C9A84C] px-6 sm:px-8 py-5 text-white">
                                <h2 className="text-xl font-extrabold">Review Your Application</h2>
                                <p className="text-white/80 text-sm mt-1">Please verify all details before submitting. You cannot edit after submission without contacting the school.</p>
                            </div>

                            <div className="p-6 sm:p-8">
                                {/* Summary table */}
                                <div className="rounded-xl border border-[#0B1F3A]/15 overflow-hidden mb-6">
                                    <div className="bg-[#F4F7FB] px-5 py-3 border-b border-[#0B1F3A]/10 flex items-center gap-2">
                                        <p className="font-bold text-[#0B1F3A] text-sm">Application Details</p>
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {rows.map(([k, v]) => (
                                                <tr key={k} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#F4F7FB] transition-colors">
                                                    <td className="px-4 sm:px-5 py-2.5 text-[#0B1F3A]/70 font-medium w-40 sm:w-44 flex-shrink-0">{k}</td>
                                                    <td className="px-4 sm:px-5 py-2.5 font-semibold text-[#0B1F3A] break-words">{v}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Document thumbnails */}
                                {(formData.birthCertificateUrl || formData.transferCertificateUrl || formData.reportCardUrl) && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <p className="font-bold text-[#0B1F3A] text-sm">Uploaded Documents</p>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            {([
                                                ['Birth Cert.', formData.birthCertificateUrl],
                                                ['TC', formData.transferCertificateUrl],
                                                ['Report Card', formData.reportCardUrl],
                                            ] as [string, string | undefined][]).filter(([, url]) => url).map(([label, url]) => (
                                                <div key={label} className="text-center">
                                                    <img src={url} alt={label} className="w-20 h-20 object-cover rounded-xl border-2 border-[#C9A84C]/50 shadow-sm" />
                                                    <p className="text-xs text-[#0B1F3A]/75 mt-1 font-medium">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Warning */}
                                <div className="flex items-start gap-3 bg-[#FBF6E8] border border-[#C9A84C] rounded-xl p-4 mb-6">
                                    <p className="text-sm text-[#0B1F3A]">
                                        Once submitted, your application status becomes <strong>Pending</strong> and you will be redirected to the payment page. Please review carefully before confirming.
                                    </p>
                                </div>

                                <div className="flex gap-3 flex-col sm:flex-row-reverse">
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting}
                                        className="btn btn-primary flex-1 !py-3 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : null}
                                        {isSubmitting ? 'Submitting…' : 'Confirm & Submit Application'}
                                    </button>
                                    <button
                                        onClick={() => setShowReviewPage(false)}
                                        className="btn btn-secondary flex-1 !py-3"
                                    >
                                        &larr; Edit Application
                                    </button>
                                </div>

                                <p className="text-xs text-center text-[#0B1F3A]/60 mt-4">Your data is securely stored with Bethel Mission School</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── STEP 0: Selection screen ─────────────────────────────────────────────
    if (step === 0) {
        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-[#F4F7FB] py-10 sm:py-16 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-white border-t-4 border-[#C9A84C] p-6 sm:p-10 rounded-2xl shadow-xl">
                            <div className="mb-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors"
                                >
                                    <BackIcon className="w-5 h-5" />
                                    Back to Admission Guidelines
                                </button>
                            </div>

                            {!showIdInput ? (
                                <>
                                    {/* ── School banner ── */}
                                    <div className="text-center mb-6">
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8E6D1B]">Nursery to Class X &middot; Champhai</p>
                                        <h1 className="mt-1 text-3xl md:text-4xl font-extrabold text-[#0B1F3A] mb-2">Online Admission Portal</h1>
                                        <p className="text-[#0B1F3A]/70 text-sm font-medium">Academic Session 2026-27</p>
                                    </div>

                                    {/* ── Deadline banner ── */}
                                    <div className="flex items-center justify-center gap-3 bg-[#FBF6E8] border border-[#C9A84C] rounded-xl px-5 py-3 mb-8 text-[#0B1F3A]">
                                        <p className="text-sm font-semibold">
                                            Applications open until <strong>{ADMISSION_DEADLINE}</strong>
                                        </p>
                                    </div>

                                    <div className="text-center mb-8">
                                        <p className="text-base sm:text-lg text-[#0B1F3A]/80 font-medium">Please select an option to begin.</p>
                                    </div>

                                    {/* ── Cards ── */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                        <button
                                            onClick={() => { setFormData(prev => ({ ...prev, studentType: 'Newcomer' })); setStep(1); }}
                                            className="bg-white p-7 rounded-2xl shadow-md border-2 border-[#0B1F3A]/15 hover:border-[#C9A84C] hover:shadow-xl transition-all group text-left"
                                        >
                                            <div className="bg-[#0B1F3A] text-[#DFC06B] w-14 h-14 rounded-xl flex items-center justify-center mb-5 text-2xl font-extrabold group-hover:bg-[#C9A84C] group-hover:text-[#0B1F3A] transition-colors">
                                                New
                                            </div>
                                            <h3 className="text-2xl font-bold text-[#0B1F3A] mb-2">New Student</h3>
                                            <p className="text-[#0B1F3A]/75 text-sm">For children seeking admission for the first time (Nursery – Class IX).</p>
                                        </button>
                                        <button
                                            onClick={() => setShowIdInput('existing')}
                                            className="bg-white p-7 rounded-2xl shadow-md border-2 border-[#0B1F3A]/15 hover:border-[#C9A84C] hover:shadow-xl transition-all group text-left"
                                        >
                                            <div className="bg-[#FBF6E8] border border-[#C9A84C] text-[#0B1F3A] w-14 h-14 rounded-xl flex items-center justify-center mb-5 text-xl font-extrabold group-hover:bg-[#0B1F3A] group-hover:text-[#DFC06B] transition-colors">
                                                BMS
                                            </div>
                                            <h3 className="text-2xl font-bold text-[#0B1F3A] mb-2">Existing Student</h3>
                                            <p className="text-[#0B1F3A]/75 text-sm">For current students applying for re-admission or promotion.</p>
                                        </button>
                                    </div>

                                    <div className="text-center mt-10 flex flex-col items-center gap-3">
                                        <button onClick={() => setShowIdInput('continue')} className="min-h-[44px] font-bold text-[#0B1F3A] hover:text-[#8E6D1B] hover:underline">
                                            Continue a Saved Application &rarr;
                                        </button>
                                        <button onClick={() => setShowIdInput('resubmit')} className="min-h-[44px] font-bold text-[#8E6D1B] hover:text-[#0B1F3A] hover:underline">
                                            Resubmit Payment Screenshot &rarr;
                                        </button>
                                        <Link to="/admissions/status" className="min-h-[44px] inline-flex items-center font-bold text-[#0B1F3A] hover:text-[#8E6D1B] hover:underline">
                                            Check Application Status &rarr;
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="max-w-lg mx-auto">
                                    <h2 className="text-2xl font-bold text-[#0B1F3A] text-center mb-2">
                                        {showIdInput === 'existing' ? 'Existing Student'
                                        : showIdInput === 'resubmit' ? 'Resubmit Payment'
                                        : 'Continue Application'}
                                    </h2>
                                    <p className="text-[#0B1F3A]/75 text-center mb-6 text-sm sm:text-base">
                                        {showIdInput === 'existing'
                                            ? 'Enter your Student ID to auto-fill the form.'
                                            : showIdInput === 'resubmit'
                                            ? 'Enter your Reference ID to go back to the payment page and upload a new screenshot.'
                                            : 'Enter your Application ID to resume or edit your submission.'}
                                    </p>

                                    <form onSubmit={handleFetchStudent}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-[#0B1F3A] mb-2">
                                                {showIdInput === 'existing' ? 'Student ID' : 'Reference / Application ID'}
                                            </label>
                                            <input
                                                type="text"
                                                value={existingId}
                                                onChange={(e) => setExistingId(
                                                    showIdInput === 'existing'
                                                        ? e.target.value.toUpperCase()
                                                        : e.target.value
                                                )}
                                                className="form-input w-full"
                                                placeholder={showIdInput === 'existing' ? "e.g. BMS260101" : "e.g. BMSAPPxxxx..."}
                                                autoFocus
                                            />
                                            {fetchError && <p className="text-[#8E6D1B] font-semibold text-sm mt-2">{fetchError}</p>}
                                            {(showIdInput === 'continue' || showIdInput === 'resubmit') && (
                                                <p className="text-xs text-[#0B1F3A]/60 mt-1">The ID is case-sensitive. Copy and paste it for best results.</p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isFetching || !existingId}
                                            className="w-full btn btn-primary flex items-center justify-center gap-2 mb-4"
                                        >
                                            {isFetching ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                                            {isFetching ? 'Fetching...' : showIdInput === 'resubmit' ? 'Go to Payment Page' : 'Continue'}
                                        </button>
                                    </form>

                                    {showIdInput === 'existing' && (
                                        <>
                                            <hr className="my-4 border-[#0B1F3A]/15" />
                                            <button
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, studentType: 'Existing', lastSchoolAttended: 'Bethel Mission School' }));
                                                    setStep(1);
                                                }}
                                                className="w-full btn btn-secondary"
                                            >
                                                Skip &amp; Fill Manually
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => { setShowIdInput(null); setFetchError(''); setExistingId(''); }}
                                        className="w-full min-h-[44px] mt-4 text-[#0B1F3A]/70 hover:text-[#0B1F3A] text-sm font-semibold"
                                    >
                                        &larr; Back to Selection
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── STEPS 1-3: Form ──────────────────────────────────────────────────────
    return (
        <>
            {showDraftPrompt && <DraftPrompt />}
            <div className="bg-[#F4F7FB] py-10 sm:py-12 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white border-t-4 border-[#C9A84C] rounded-2xl shadow-lg p-6 sm:p-8 relative">

                        {/* Saved draft overlay */}
                        {savedApplicationId && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
                                <div className="bg-white border-2 border-[#C9A84C] p-8 rounded-xl shadow-xl text-center animate-fade-in max-w-sm w-full mx-4">
                                    <h3 className="text-2xl font-extrabold text-[#0B1F3A]">Application Saved!</h3>
                                    <p className="mt-2 text-sm text-[#0B1F3A]/75">Please save this ID to continue your application later:</p>
                                    <div className="my-4 p-3 bg-[#FBF6E8] border-2 border-dashed border-[#C9A84C] rounded-lg font-tabular text-xl font-extrabold text-[#0B1F3A]">
                                        {savedApplicationId}
                                    </div>
                                    <button onClick={() => navigator.clipboard.writeText(savedApplicationId)} className="btn btn-secondary w-full">Copy ID</button>
                                    <button onClick={() => setSavedApplicationId(null)} className="mt-4 min-h-[44px] text-sm font-semibold text-[#8E6D1B] hover:underline">Close and Continue Editing</button>
                                </div>
                            </div>
                        )}

                        {/* Back button */}
                        <div className="mb-6">
                            <button
                                onClick={() => { setErrors({}); step > 1 ? setStep(step - 1) : setStep(0); }}
                                className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors"
                            >
                                <BackIcon className="w-5 h-5" />
                                Back
                            </button>
                        </div>

                        {/* Deadline note */}
                        <div className="flex items-center gap-2 bg-[#FBF6E8] border border-[#C9A84C] rounded-xl px-4 py-2.5 mb-6 text-[#0B1F3A]">
                            <p className="text-xs font-semibold">Applications open until <strong>{ADMISSION_DEADLINE}</strong></p>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">Online Admission Form</h1>
                            <p className="text-[#0B1F3A]/75 mt-1 text-sm sm:text-base">Academic Session 2026-27</p>
                            <p className="text-xs text-[#0B1F3A]/60 mt-1">
                                <span className="text-[#8E6D1B] font-bold">*</span> Required fields
                            </p>
                        </div>

                        <ProgressBar currentStep={step} lastSaved={lastSaved} />

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* ── STEP 1: Student Information ────────────────────── */}
                            {step === 1 && (
                                <section className="animate-fade-in">
                                    <SectionDivider icon="🎓" title="Admission Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold">Class Applying For*</label>
                                            <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required>
                                                {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <SectionDivider icon="👤" title="Student Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Full Name*</label>
                                            <input type="text" name="studentName" value={formData.studentName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.studentName ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`} />
                                            <FieldError message={errors.studentName} />
                                            {errors.studentName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <CustomDatePicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} required={false} minYear={1960} maxYear={new Date().getFullYear()} />
                                            <FieldError message={errors.dateOfBirth} />
                                            {errors.dateOfBirth && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Gender*</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1">
                                                {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Aadhaar No. (Optional)</label>
                                            <input
                                                type="text"
                                                name="studentAadhaar"
                                                value={formData.studentAadhaar ? maskAadhaar(formData.studentAadhaar) : ''}
                                                onChange={e => {
                                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                    setFormData(prev => ({ ...prev, studentAadhaar: digits }));
                                                    if (errors.studentAadhaar) setErrors(prev => { const n = { ...prev }; delete n.studentAadhaar; return n; });
                                                }}
                                                placeholder="XXXX-XXXX-1234"
                                                maxLength={14}
                                                className={`form-input w-full mt-1 font-tabular ${errors.studentAadhaar ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`}
                                            />
                                            <p className="text-xs text-[#0B1F3A]/60 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">PEN No. (Optional)</label>
                                            <input type="text" name="penNumber" value={formData.penNumber || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Mother Tongue (Optional)</label>
                                            <input type="text" name="motherTongue" value={formData.motherTongue || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Blood Group (Optional)</label>
                                            <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="form-select w-full mt-1">
                                                <option value="">-- Select --</option>
                                                {BLOOD_GROUP_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">CWSN*</label>
                                            <select name="cwsn" value={formData.cwsn} onChange={handleChange} className="form-select w-full mt-1">
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Category*</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className={`form-select w-full mt-1 ${errors.category ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`}>
                                                {CATEGORY_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <FieldError message={errors.category} />
                                            {errors.category && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Religion*</label>
                                            <input type="text" name="religion" value={formData.religion || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.religion ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`} />
                                            <FieldError message={errors.religion} />
                                            {errors.religion && <span className="field-error" />}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── STEP 2: Parent/Guardian Information ────────────── */}
                            {step === 2 && (
                                <section className="animate-fade-in">
                                    <SectionDivider icon="👨‍👩‍👦" title="Parent / Guardian Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Father's Name*</label>
                                            <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.fatherName ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`} />
                                            <FieldError message={errors.fatherName} />
                                            {errors.fatherName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Mother's Name*</label>
                                            <input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.motherName ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`} />
                                            <FieldError message={errors.motherName} />
                                            {errors.motherName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Father's Occupation</label>
                                            <input type="text" name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Mother's Occupation</label>
                                            <input type="text" name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Father's/Mother's Aadhaar No.</label>
                                            <input
                                                type="text"
                                                name="parentAadhaar"
                                                value={formData.parentAadhaar ? maskAadhaar(formData.parentAadhaar) : ''}
                                                onChange={e => {
                                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                    setFormData(prev => ({ ...prev, parentAadhaar: digits }));
                                                }}
                                                placeholder="XXXX-XXXX-1234"
                                                maxLength={14}
                                                className="form-input w-full mt-1 font-tabular"
                                            />
                                            <p className="text-xs text-[#0B1F3A]/60 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Guardian's Name (if any)</label>
                                            <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Relationship with Guardian</label>
                                            <input type="text" name="guardianRelationship" value={formData.guardianRelationship || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                    </div>

                                    <SectionDivider icon="📞" title="Contact Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Contact No.*</label>
                                            <div className="flex mt-1">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#0B1F3A]/20 bg-[#F4F7FB] text-[#0B1F3A] text-sm font-bold select-none font-tabular">
                                                    +91
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="contactNumber"
                                                    value={formData.contactNumber || ''}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setFormData(prev => ({ ...prev, contactNumber: val }));
                                                        if (errors.contactNumber) setErrors(prev => { const n = { ...prev }; delete n.contactNumber; return n; });
                                                    }}
                                                    placeholder="10-digit number"
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                    className={`block w-full min-h-[44px] rounded-r-lg border border-[#0B1F3A]/20 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] font-tabular ${errors.contactNumber ? '!border-[#C9A84C]' : ''}`}
                                                />
                                            </div>
                                            <FieldError message={errors.contactNumber} />
                                            {errors.contactNumber && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Email</label>
                                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Permanent Address*</label>
                                            <textarea name="permanentAddress" value={formData.permanentAddress || ''} onChange={handleChange} className={`form-textarea w-full mt-1 ${errors.permanentAddress ? '!border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : ''}`} rows={2}></textarea>
                                            <FieldError message={errors.permanentAddress} />
                                            {errors.permanentAddress && <span className="field-error" />}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── STEP 3: Documents & Other Info ─────────────────── */}
                            {step === 3 && (
                                <section className="animate-fade-in">
                                    <SectionDivider icon="🏫" title="Previous School Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Last School Attended</label>
                                            <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Division in which he/she passed</label>
                                            <input type="text" name="lastDivision" value={formData.lastDivision || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">General Behaviour</label>
                                            <select name="generalBehaviour" value={formData.generalBehaviour || 'Normal'} onChange={handleChange} className="form-select w-full mt-1">
                                                <option value="Mild">Mild</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Hyperactive">Hyperactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Siblings in this school</label>
                                            <input type="number" name="siblingsInSchool" value={formData.siblingsInSchool || 0} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Achievements (Academics/Extra-curricular)</label>
                                            <textarea name="achievements" value={formData.achievements || ''} onChange={handleChange} className="form-textarea w-full mt-1" rows={3}></textarea>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-[#0B1F3A]">Health Issues (if any)</label>
                                            <textarea name="healthIssues" value={formData.healthIssues || ''} onChange={handleChange} className="form-textarea w-full mt-1" rows={3}></textarea>
                                        </div>
                                    </div>

                                    <SectionDivider icon="📄" title="Documents Upload" />

                                    {/* ── FIX: Show correct notice based on student type ── */}
                                    {isNewStudent && (
                                        <p className="text-sm text-[#0B1F3A] my-4 bg-[#FBF6E8] p-3.5 rounded-xl border border-[#C9A84C]">
                                            <span className="font-bold">Important:</span> For new students, the Birth Certificate is mandatory.
                                            {!isNursery && " The Last Report Card is also mandatory."}
                                        </p>
                                    )}
                                    {isExistingStudent && (
                                        <p className="text-sm text-[#0B1F3A] my-4 bg-[#F4F7FB] p-3.5 rounded-xl border border-[#0B1F3A]/20">
                                            <span className="font-bold">Note:</span> Document uploads are <span className="font-bold text-[#8E6D1B]">optional</span> for existing / returning students. Your records are already on file.
                                        </p>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Birth Certificate — required only for new students */}
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">
                                                Birth Certificate
                                                {isNewStudent && <span className="text-[#8E6D1B]">*</span>}
                                                {isExistingStudent && <span className="text-[#0B1F3A]/60 font-normal text-xs ml-1">(optional)</span>}
                                            </label>
                                            <div className="flex items-center gap-3 mt-2 p-3 border border-[#0B1F3A]/15 rounded-xl bg-[#F4F7FB]">
                                                <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                    {uploadingDoc === 'birthCertificateUrl' ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'birthCertificateUrl')} className="hidden" accept="image/*" />
                                                    Upload
                                                </label>
                                                {formData.birthCertificateUrl && (
                                                    <a href={formData.birthCertificateUrl} target="_blank" rel="noreferrer">
                                                        <img src={formData.birthCertificateUrl} alt="Birth Cert" className="w-12 h-12 rounded-lg object-cover border border-[#C9A84C]" />
                                                    </a>
                                                )}
                                            </div>
                                            <FieldError message={errors.birthCertificateUrl} />
                                            {errors.birthCertificateUrl && <span className="field-error" />}
                                        </div>

                                        {/* Transfer Certificate — always optional */}
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">
                                                Transfer Certificate
                                                <span className="text-[#0B1F3A]/60 font-normal text-xs ml-1">(if applicable)</span>
                                            </label>
                                            <div className="flex items-center gap-3 mt-2 p-3 border border-[#0B1F3A]/15 rounded-xl bg-[#F4F7FB]">
                                                <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                    {uploadingDoc === 'transferCertificateUrl' ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'transferCertificateUrl')} className="hidden" accept="image/*" />
                                                    Upload
                                                </label>
                                                {formData.transferCertificateUrl && (
                                                    <a href={formData.transferCertificateUrl} target="_blank" rel="noreferrer">
                                                        <img src={formData.transferCertificateUrl} alt="TC" className="w-12 h-12 rounded-lg object-cover border border-[#C9A84C]" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Last Report Card — required only for new non-nursery students */}
                                        <div>
                                            <label className="block text-sm font-bold text-[#0B1F3A]">
                                                Last Report Card
                                                {isNewStudent && !isNursery && <span className="text-[#8E6D1B]">*</span>}
                                                {(isExistingStudent || isNursery) && <span className="text-[#0B1F3A]/60 font-normal text-xs ml-1">(optional)</span>}
                                            </label>
                                            <div className="flex items-center gap-3 mt-2 p-3 border border-[#0B1F3A]/15 rounded-xl bg-[#F4F7FB]">
                                                <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                    {uploadingDoc === 'reportCardUrl' ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'reportCardUrl')} className="hidden" accept="image/*" />
                                                    Upload
                                                </label>
                                                {formData.reportCardUrl && (
                                                    <a href={formData.reportCardUrl} target="_blank" rel="noreferrer">
                                                        <img src={formData.reportCardUrl} alt="Report Card" className="w-12 h-12 rounded-lg object-cover border border-[#C9A84C]" />
                                                    </a>
                                                )}
                                            </div>
                                            <FieldError message={errors.reportCardUrl} />
                                            {errors.reportCardUrl && <span className="field-error" />}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── Navigation buttons ─────────────────────────────── */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                {step > 1 ? (
                                    <button type="button" onClick={() => { setErrors({}); setStep(s => s - 1); }} className="btn btn-secondary">Back</button>
                                ) : <div></div>}

                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={handleSaveForLater} disabled={isSubmitting || isSaving} className="btn btn-secondary">
                                        {isSaving ? <><SpinnerIcon className="w-5 h-5" /> Saving...</> : <><SaveIcon className="w-5 h-5" /> Save for Later</>}
                                    </button>
                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={() => { if (validateStep(step)) setStep(s => s + 1); }}
                                            className="btn btn-primary"
                                        >
                                            Next <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button type="submit" disabled={isSubmitting || isSaving} className="btn btn-primary px-8 py-3 text-lg">
                                            {isSubmitting ? <><SpinnerIcon className="w-6 h-6" /> Submitting...</> : 'Review & Submit'}
                                        </button>
                                    )}
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
