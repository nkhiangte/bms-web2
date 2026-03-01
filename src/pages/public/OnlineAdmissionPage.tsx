import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, OnlineAdmission, Grade, Gender, Category, Student, BloodGroup } from '@/types';
import { GRADES_LIST, CATEGORY_LIST, GENDER_LIST, BLOOD_GROUP_LIST } from '@/constants';
import jsPDF from 'jspdf';
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
            <p className="text-xs font-semibold text-slate-500">Step {currentStep} of 3</p>
            {lastSaved && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    💾 Last saved at {formatTime(lastSaved)}
                </p>
            )}
        </div>
        <div className="relative">
            {/* Track */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 z-0" />
            {/* Fill */}
            <div
                className="absolute top-4 left-0 h-1 bg-sky-500 z-0 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
            {/* Steps */}
            <div className="relative z-10 flex justify-between">
                {STEP_LABELS.map((label, i) => {
                    const done = i + 1 < currentStep;
                    const active = i + 1 === currentStep;
                    return (
                        <div key={label} className="flex flex-col items-center gap-2" style={{ width: '33%' }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                done ? 'bg-sky-500 border-sky-500 text-white'
                                : active ? 'bg-white border-sky-500 text-sky-600'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                                {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs font-semibold text-center ${
                                active ? 'text-sky-600' : done ? 'text-sky-400' : 'text-slate-400'
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
        <h3 className="text-base font-bold text-slate-700 whitespace-nowrap">{title}</h3>
        <div className="flex-1 h-px bg-slate-200" />
    </div>
);

// ── Field Error ───────────────────────────────────────────────────────────────
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

// ── Main Component ────────────────────────────────────────────────────────────
const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ user, onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();

    // ── NEW: boarding type selection (-1 = not selected yet, 0 = type selected, form steps 1-3) ──
    // boardingType: null | 'Day Scholar' | 'Boarder'
    const [boardingType, setBoardingType] = useState<'Day Scholar' | 'Boarder' | null>(null);

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
    }, [step, showReviewPage, boardingType]);

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

    const generateAcknowledgementPDF = (id: string, data: Partial<OnlineAdmission>) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;
        const margin = 20;
        const contentW = pageW - margin * 2;
        let y = 0;

        // ── Header band ──────────────────────────────────────────────────────
        doc.setFillColor(15, 40, 80); // deep navy
        doc.rect(0, 0, pageW, 38, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(17);
        doc.setFont('helvetica', 'bold');
        doc.text('BETHEL MISSION SCHOOL', pageW / 2, 13, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Lungpho, Champhai District, Mizoram — 796321', pageW / 2, 20, { align: 'center' });
        doc.text('bethelms04@gmail.com  |  bms04.com', pageW / 2, 26, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('ADMISSION ACKNOWLEDGEMENT', pageW / 2, 34, { align: 'center' });

        y = 50;

        // ── Status badge ─────────────────────────────────────────────────────
        doc.setFillColor(220, 252, 231); // light green
        doc.setDrawColor(134, 239, 172);
        doc.roundedRect(margin, y, contentW, 12, 3, 3, 'FD');
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('✓  Application Received — PENDING REVIEW', pageW / 2, y + 8, { align: 'center' });

        y += 20;

        // ── Reference ID box ─────────────────────────────────────────────────
        doc.setFillColor(15, 40, 80);
        doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('REFERENCE ID', pageW / 2, y + 6, { align: 'center' });
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(id, pageW / 2, y + 14, { align: 'center' });

        y += 24;

        // Submission date
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const submittedOn = new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        doc.text(`Submitted on: ${submittedOn}`, pageW / 2, y, { align: 'center' });

        y += 10;

        // ── Two-column details ────────────────────────────────────────────────
        const drawSection = (title: string, rows: [string, string][]) => {
            // Section header
            doc.setFillColor(241, 245, 249); // slate-100
            doc.setDrawColor(226, 232, 240);
            doc.rect(margin, y, contentW, 8, 'FD');
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.text(title.toUpperCase(), margin + 3, y + 5.5);
            y += 10;

            const colW = contentW / 2;
            rows.forEach(([label, value], i) => {
                const col = i % 2;
                const rx = margin + col * colW;
                if (col === 0 && i !== 0) y += 8;

                doc.setTextColor(100, 116, 139);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');
                doc.text(label, rx + 2, y);

                doc.setTextColor(30, 41, 59);
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'bold');
                const val = value || '—';
                doc.text(val.length > 28 ? val.slice(0, 26) + '…' : val, rx + 2, y + 4.5);
            });
            // move past last row
            const lastRowIndex = rows.length - 1;
            if (lastRowIndex % 2 === 0) y += 8; // last row was in left col only
            y += 10;
        };

        drawSection('Student Information', [
            ['Full Name', data.studentName || ''],
            ['Class Applying For', data.admissionGrade || ''],
            ['Date of Birth', data.dateOfBirth || ''],
            ['Gender', data.gender || ''],
            ['Category', data.category || ''],
            ['Religion', data.religion || ''],
            ['Admission Type', (data as any).boardingType || boardingType || ''],
            ['Student Type', data.studentType || ''],
        ]);

        drawSection('Parent / Guardian Information', [
            ["Father's Name", data.fatherName || ''],
            ["Mother's Name", data.motherName || ''],
            ['Contact No.', data.contactNumber ? `+91 ${data.contactNumber}` : ''],
            ['Email', data.email || ''],
            ['Permanent Address', data.permanentAddress || ''],
            ['Last School', data.lastSchoolAttended || ''],
        ]);

        y += 2;

        // ── What happens next ─────────────────────────────────────────────────
        doc.setFillColor(239, 246, 255); // blue-50
        doc.setDrawColor(191, 219, 254);
        doc.roundedRect(margin, y, contentW, 36, 3, 3, 'FD');

        doc.setTextColor(29, 78, 216);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('WHAT HAPPENS NEXT?', margin + 4, y + 7);

        const steps = [
            '1.  Your application is under review by the admissions committee.',
            '2.  You will be contacted on the provided number for an interview/test date.',
            '3.  Complete the fee payment to confirm your seat once approved.',
        ];
        doc.setTextColor(30, 64, 175);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        steps.forEach((s, i) => {
            doc.text(s, margin + 4, y + 14 + i * 7);
        });

        y += 42;

        // ── Footer ────────────────────────────────────────────────────────────
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, margin + contentW, y);
        y += 5;
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(
            'This is a computer-generated acknowledgement. For queries, contact bethelms04@gmail.com or call the school office.',
            pageW / 2, y, { align: 'center', maxWidth: contentW }
        );
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW / 2, y + 6, { align: 'center' });

        doc.save(`BMS_Admission_${id}.pdf`);
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

            // Generate PDF acknowledgement (non-blocking)
            try {
                generateAcknowledgementPDF(id, admissionData);
            } catch (pdfErr) {
                console.warn('PDF generation failed (non-critical):', pdfErr);
            }

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

    const isNewStudent = formData.studentType === 'Newcomer';
    const isNursery = formData.admissionGrade === Grade.NURSERY;

    // ─── Draft Prompt Overlay ─────────────────────────────────────────────────
    const DraftPrompt = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                <p className="text-3xl mb-3">📝</p>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Unsaved Draft Found</h3>
                <p className="text-sm text-slate-500 mb-6">
                    You have an unfinished application for{' '}
                    <strong>{pendingDraft?.studentName || 'a student'}</strong>.
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
            ['Admission Type', boardingType || '—'],
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
                                {/* Summary table */}
                                <div className="rounded-xl border overflow-hidden mb-6">
                                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center gap-2">
                                        <span>👤</span>
                                        <p className="font-bold text-slate-700 text-sm">Application Details</p>
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {rows.map(([k, v]) => (
                                                <tr key={k} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-2.5 text-slate-500 font-medium w-44 flex-shrink-0">{k}</td>
                                                    <td className="px-5 py-2.5 font-semibold text-slate-800 break-words">{v}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Document thumbnails */}
                                {(formData.birthCertificateUrl || formData.transferCertificateUrl || formData.reportCardUrl) && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span>📄</span>
                                            <p className="font-bold text-slate-700 text-sm">Uploaded Documents</p>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            {([
                                                ['Birth Cert.', formData.birthCertificateUrl],
                                                ['TC', formData.transferCertificateUrl],
                                                ['Report Card', formData.reportCardUrl],
                                            ] as [string, string | undefined][]).filter(([, url]) => url).map(([label, url]) => (
                                                <div key={label} className="text-center">
                                                    <img src={url} alt={label} className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Warning */}
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                    <span className="text-xl mt-0.5 flex-shrink-0">⚠️</span>
                                    <p className="text-sm text-amber-800">
                                        Once submitted, your application status becomes <strong>Pending</strong> and you will be redirected to the payment page. Please review carefully before confirming.
                                    </p>
                                </div>

                                {/* PDF note */}
                                <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-6">
                                    <span className="text-lg flex-shrink-0">📄</span>
                                    <p className="text-xs text-sky-700 font-medium">
                                        An acknowledgement PDF will be automatically downloaded when you submit.
                                    </p>
                                </div>

                                <div className="flex gap-3 flex-col sm:flex-row-reverse">
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting}
                                        className="btn btn-primary flex-1 !py-3 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : '✅'}
                                        {isSubmitting ? 'Submitting…' : 'Confirm & Submit Application'}
                                    </button>
                                    <button
                                        onClick={() => setShowReviewPage(false)}
                                        className="btn btn-secondary flex-1 !py-3"
                                    >
                                        ← Edit Application
                                    </button>
                                </div>

                                <p className="text-xs text-center text-slate-400 mt-4">🔒 Your data is secure and encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── SCREEN A: Boarding Type Selection (shown before everything else) ─────
    if (boardingType === null) {
        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-white p-8 rounded-2xl shadow-xl">
                            <div className="mb-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                                >
                                    <BackIcon className="w-5 h-5" />
                                    Back to Admission Guidelines
                                </button>
                            </div>

                            {/* School banner */}
                            <div className="text-center mb-6">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">Online Admission Portal</h1>
                                <p className="text-slate-500 text-sm">Academic Session 2026-27</p>
                            </div>

                            {/* Deadline banner */}
                            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-8 text-amber-800">
                                <span className="text-2xl flex-shrink-0">⏰</span>
                                <p className="text-sm font-semibold">
                                    Applications open until <strong>{ADMISSION_DEADLINE}</strong>
                                </p>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-slate-700 mb-2">Select Admission Type</h2>
                                <p className="text-slate-500 text-sm">Please select whether you are applying as a Day Scholar or a Boarder/Residential student.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                {/* Day Scholar */}
                                <button
                                    onClick={() => {
                                        setBoardingType('Day Scholar');
                                        setFormData(prev => ({ ...prev, boardingType: 'Day Scholar' }));
                                    }}
                                    className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-sky-500 hover:shadow-2xl transition-all group text-left"
                                >
                                    <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                                        🏠
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Day Scholar</h3>
                                    <p className="text-slate-600">Student attends school during the day and returns home in the evening.</p>
                                </button>

                                {/* Boarder / Residential */}
                                <button
                                    onClick={() => {
                                        setBoardingType('Boarder');
                                        setFormData(prev => ({ ...prev, boardingType: 'Boarder' }));
                                    }}
                                    className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-violet-500 hover:shadow-2xl transition-all group text-left"
                                >
                                    <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                                        🏫
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Boarder / Residential</h3>
                                    <p className="text-slate-600">Student lives on campus in the school's residential hostel.</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── STEP 0: New / Existing Student Selection ─────────────────────────────
    if (step === 0) {
        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-white p-8 rounded-2xl shadow-xl">
                            <div className="mb-6">
                                <button
                                    onClick={() => { setBoardingType(null); setShowIdInput(null); setFetchError(''); setExistingId(''); }}
                                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                                >
                                    <BackIcon className="w-5 h-5" />
                                    Back to Admission Type
                                </button>
                            </div>

                            {/* Boarding type badge */}
                            <div className="flex justify-center mb-4">
                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${boardingType === 'Day Scholar' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'}`}>
                                    {boardingType === 'Day Scholar' ? '🏠' : '🏫'} {boardingType}
                                </span>
                            </div>

                            {!showIdInput ? (
                                <>
                                    {/* School banner */}
                                    <div className="text-center mb-6">
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">Online Admission Portal</h1>
                                        <p className="text-slate-500 text-sm">Academic Session 2026-27</p>
                                    </div>

                                    {/* Deadline banner */}
                                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-8 text-amber-800">
                                        <span className="text-2xl flex-shrink-0">⏰</span>
                                        <p className="text-sm font-semibold">
                                            Applications open until <strong>{ADMISSION_DEADLINE}</strong>
                                        </p>
                                    </div>

                                    <div className="text-center mb-8">
                                        <p className="text-lg text-slate-600">Please select an option to begin.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                        <button
                                            onClick={() => { setFormData(prev => ({ ...prev, studentType: 'Newcomer' })); setStep(1); }}
                                            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-sky-500 hover:shadow-2xl transition-all group text-left"
                                        >
                                            <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                                                🎓
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2">New Student</h3>
                                            <p className="text-slate-600">For children seeking admission for the first time.</p>
                                        </button>
                                        <button
                                            onClick={() => setShowIdInput('existing')}
                                            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-emerald-500 hover:shadow-2xl transition-all group text-left"
                                        >
                                            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                                                🔄
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Existing Student</h3>
                                            <p className="text-slate-600">For current students applying for re-admission or promotion.</p>
                                        </button>
                                    </div>

                                    <div className="text-center mt-10 flex flex-col items-center gap-3">
                                        <button onClick={() => setShowIdInput('continue')} className="font-semibold text-sky-700 hover:underline">
                                            Continue a Saved Application &rarr;
                                        </button>
                                        <button onClick={() => setShowIdInput('resubmit')} className="font-semibold text-amber-600 hover:underline">
                                            Resubmit Payment Screenshot &rarr;
                                        </button>
                                        <Link to="/admissions/status" className="font-semibold text-emerald-700 hover:underline">
                                            Check Application Status &rarr;
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="max-w-lg mx-auto">
                                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                                        {showIdInput === 'existing' ? 'Existing Student'
                                        : showIdInput === 'resubmit' ? 'Resubmit Payment'
                                        : 'Continue Application'}
                                    </h2>
                                    <p className="text-slate-600 text-center mb-6">
                                        {showIdInput === 'existing'
                                            ? 'Enter your Student ID to auto-fill the form.'
                                            : showIdInput === 'resubmit'
                                            ? 'Enter your Reference ID to go back to the payment page and upload a new screenshot.'
                                            : 'Enter your Application ID to resume or edit your submission.'}
                                    </p>

                                    <form onSubmit={handleFetchStudent}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
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
                                                placeholder={showIdInput === 'existing' ? "e.g. BMS240101" : "e.g. BMSAPPxxxx..."}
                                                autoFocus
                                            />
                                            {fetchError && <p className="text-red-500 text-sm mt-2">{fetchError}</p>}
                                            {(showIdInput === 'continue' || showIdInput === 'resubmit') && (
                                                <p className="text-xs text-slate-400 mt-1">The ID is case-sensitive. Copy and paste it for best results.</p>
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
                                            <hr className="my-4" />
                                            <button
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, studentType: 'Existing', lastSchoolAttended: 'Bethel Mission School' }));
                                                    setStep(1);
                                                }}
                                                className="w-full btn btn-secondary"
                                            >
                                                Skip & Fill Manually
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => { setShowIdInput(null); setFetchError(''); setExistingId(''); }}
                                        className="w-full mt-4 text-slate-500 hover:text-slate-800 text-sm"
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
            <div className="bg-slate-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 relative">

                        {/* Saved draft overlay — original */}
                        {savedApplicationId && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                                <div className="bg-white p-8 rounded-lg shadow-xl text-center border animate-fade-in">
                                    <h3 className="text-2xl font-bold text-emerald-600">Application Saved!</h3>
                                    <p className="mt-2 text-slate-600">Please save this ID to continue your application later:</p>
                                    <div className="my-4 p-3 bg-slate-100 border-2 border-dashed rounded font-mono text-xl font-bold text-slate-800">
                                        {savedApplicationId}
                                    </div>
                                    <button onClick={() => navigator.clipboard.writeText(savedApplicationId)} className="btn btn-secondary w-full">Copy ID</button>
                                    <button onClick={() => setSavedApplicationId(null)} className="mt-4 text-sm text-slate-500 hover:underline">Close and Continue Editing</button>
                                </div>
                            </div>
                        )}

                        {/* Back button */}
                        <div className="mb-6">
                            <button
                                onClick={() => { setErrors({}); step > 1 ? setStep(step - 1) : setStep(0); }}
                                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                            >
                                <BackIcon className="w-5 h-5" />
                                Back
                            </button>
                        </div>

                        {/* Boarding type badge */}
                        <div className="flex justify-end mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${boardingType === 'Day Scholar' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'}`}>
                                {boardingType === 'Day Scholar' ? '🏠' : '🏫'} {boardingType}
                            </span>
                        </div>

                        {/* Deadline note */}
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-6 text-amber-800">
                            <span className="flex-shrink-0">⏰</span>
                            <p className="text-xs font-semibold">Applications open until <strong>{ADMISSION_DEADLINE}</strong></p>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-slate-800">Online Admission Form</h1>
                            <p className="text-slate-600 mt-2">Academic Session 2026-27</p>
                            <p className="text-xs text-slate-400 mt-1">
                                <span className="text-red-500 font-bold">*</span> Required fields
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
                                            <label className="block text-sm font-bold">Full Name*</label>
                                            <input type="text" name="studentName" value={formData.studentName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.studentName ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                            <FieldError message={errors.studentName} />
                                            {errors.studentName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <CustomDatePicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} required={false} minYear={1960} maxYear={new Date().getFullYear()} />
                                            <FieldError message={errors.dateOfBirth} />
                                            {errors.dateOfBirth && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Gender*</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1">
                                                {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Aadhaar No. (Optional)</label>
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
                                                className={`form-input w-full mt-1 ${errors.studentAadhaar ? 'border-red-400 focus:ring-red-300' : ''}`}
                                            />
                                            <p className="text-xs text-slate-400 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">PEN No. (Optional)</label>
                                            <input type="text" name="penNumber" value={formData.penNumber || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Mother Tongue (Optional)</label>
                                            <input type="text" name="motherTongue" value={formData.motherTongue || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Blood Group (Optional)</label>
                                            <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="form-select w-full mt-1">
                                                <option value="">-- Select --</option>
                                                {BLOOD_GROUP_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">CWSN*</label>
                                            <select name="cwsn" value={formData.cwsn} onChange={handleChange} className="form-select w-full mt-1">
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Category*</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className={`form-select w-full mt-1 ${errors.category ? 'border-red-400' : ''}`}>
                                                {CATEGORY_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <FieldError message={errors.category} />
                                            {errors.category && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Religion*</label>
                                            <input type="text" name="religion" value={formData.religion || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.religion ? 'border-red-400 focus:ring-red-300' : ''}`} />
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
                                            <label className="block text-sm font-bold">Father's Name*</label>
                                            <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.fatherName ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                            <FieldError message={errors.fatherName} />
                                            {errors.fatherName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Mother's Name*</label>
                                            <input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} className={`form-input w-full mt-1 ${errors.motherName ? 'border-red-400 focus:ring-red-300' : ''}`} />
                                            <FieldError message={errors.motherName} />
                                            {errors.motherName && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Father's Occupation</label>
                                            <input type="text" name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Mother's Occupation</label>
                                            <input type="text" name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold">Father's/Mother's Aadhaar No.</label>
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
                                                className="form-input w-full mt-1"
                                            />
                                            <p className="text-xs text-slate-400 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Guardian's Name (if any)</label>
                                            <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Relationship with Guardian</label>
                                            <input type="text" name="guardianRelationship" value={formData.guardianRelationship || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                    </div>

                                    <SectionDivider icon="📞" title="Contact Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold">Contact No.*</label>
                                            <div className="flex mt-1">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-semibold select-none">
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
                                                    className={`block w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 ${errors.contactNumber ? 'border-red-400' : ''}`}
                                                />
                                            </div>
                                            <FieldError message={errors.contactNumber} />
                                            {errors.contactNumber && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Email</label>
                                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold">Permanent Address*</label>
                                            <textarea name="permanentAddress" value={formData.permanentAddress || ''} onChange={handleChange} className={`form-textarea w-full mt-1 ${errors.permanentAddress ? 'border-red-400 focus:ring-red-300' : ''}`} rows={2}></textarea>
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
                                            <label className="block text-sm font-bold">Last School Attended</label>
                                            <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Division in which he/she passed</label>
                                            <input type="text" name="lastDivision" value={formData.lastDivision || ''} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">General Behaviour</label>
                                            <select name="generalBehaviour" value={formData.generalBehaviour || 'Normal'} onChange={handleChange} className="form-select w-full mt-1">
                                                <option value="Mild">Mild</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Hyperactive">Hyperactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Siblings in this school</label>
                                            <input type="number" name="siblingsInSchool" value={formData.siblingsInSchool || 0} onChange={handleChange} className="form-input w-full mt-1" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold">Achievements (Academics/Extra-curricular)</label>
                                            <textarea name="achievements" value={formData.achievements || ''} onChange={handleChange} className="form-textarea w-full mt-1" rows={3}></textarea>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold">Health Issues (if any)</label>
                                            <textarea name="healthIssues" value={formData.healthIssues || ''} onChange={handleChange} className="form-textarea w-full mt-1" rows={3}></textarea>
                                        </div>
                                    </div>

                                    <SectionDivider icon="📄" title="Documents Upload" />
                                    {isNewStudent && (
                                        <p className="text-sm text-slate-600 my-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                            <span className="font-bold">Important:</span> For new students, the Birth Certificate is mandatory.
                                            {!isNursery && " The Last Report Card is also mandatory."}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold">Birth Certificate{isNewStudent && <span className="text-red-500">*</span>}</label>
                                            <div className="flex items-center gap-3 mt-2 p-3 border rounded-xl bg-slate-50">
                                                <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                    {uploadingDoc === 'birthCertificateUrl' ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'birthCertificateUrl')} className="hidden" accept="image/*" />
                                                    Upload
                                                </label>
                                                {formData.birthCertificateUrl && (
                                                    <a href={formData.birthCertificateUrl} target="_blank" rel="noreferrer">
                                                        <img src={formData.birthCertificateUrl} alt="Birth Cert" className="w-12 h-12 rounded-lg object-cover border" />
                                                    </a>
                                                )}
                                            </div>
                                            <FieldError message={errors.birthCertificateUrl} />
                                            {errors.birthCertificateUrl && <span className="field-error" />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Transfer Certificate (if applicable)</label>
                                            <div className="flex items-center gap-3 mt-2 p-3 border rounded-xl bg-slate-50">
                                                <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                    {uploadingDoc === 'transferCertificateUrl' ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'transferCertificateUrl')} className="hidden" accept="image/*" />
                                                    Upload
                                                </label>
                                                {formData.transferCertificateUrl && (
                                                    <a href={formData.transferCertificateUrl} target="_blank" rel="noreferrer">
                                                        <img src={formData.transferCertificateUrl} alt="TC" className="w-12 h-12 rounded-lg object-cover border" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold">Last Report Card{isNewStudent && !isNursery && <span className="text-red-500">*</span>}</label>
                                            <div className="flex items-center gap-3 mt-2 p-3 border rounded-xl bg-slate-50">
                                                <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                    {uploadingDoc === 'reportCardUrl' ? <SpinnerIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'reportCardUrl')} className="hidden" accept="image/*" />
                                                    Upload
                                                </label>
                                                {formData.reportCardUrl && (
                                                    <a href={formData.reportCardUrl} target="_blank" rel="noreferrer">
                                                        <img src={formData.reportCardUrl} alt="Report Card" className="w-12 h-12 rounded-lg object-cover border" />
                                                    </a>
                                                )}
                                            </div>
                                            <FieldError message={errors.reportCardUrl} />
                                            {errors.reportCardUrl && <span className="field-error" />}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── Navigation buttons ───────────── */}
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
