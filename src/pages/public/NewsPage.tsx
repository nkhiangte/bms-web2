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

const ADMISSION_DEADLINE = new Date('2026-04-01').toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });
const DRAFT_KEY = 'bms_admission_draft_v1';

const maskAadhaar = (raw: string) => {
    const digits = raw.replace(/\D/g,'');
    if (digits.length<=4) return digits;
    if (digits.length<=8) return 'XXXX-'+digits.slice(4);
    return 'XXXX-XXXX-'+digits.slice(8);
};
const formatTime = (d: Date) => d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

interface OnlineAdmissionPageProps {
    user: User | null;
    onOnlineAdmissionSubmit: (data: Partial<OnlineAdmission>, id?: string) => Promise<string>;
}

const STEP_LABELS = ['Student Info','Parent Info','Documents'];

const ProgressBar: React.FC<{ currentStep: number; lastSaved: Date | null }> = ({ currentStep, lastSaved }) => (
    <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Step {currentStep} of 3</p>
            {lastSaved && <p className="text-xs text-slate-500 flex items-center gap-1">💾 Last saved at {formatTime(lastSaved)}</p>}
        </div>
        <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-zinc-700 z-0" />
            <div className="absolute top-4 left-0 h-1 bg-sky-500 z-0 transition-all duration-500" style={{width:`${((currentStep-1)/2)*100}%`}} />
            <div className="relative z-10 flex justify-between">
                {STEP_LABELS.map((label,i) => {
                    const done = i+1 < currentStep, active = i+1 === currentStep;
                    return (
                        <div key={label} className="flex flex-col items-center gap-2" style={{width:'33%'}}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done?'bg-sky-500 border-sky-500 text-white':active?'bg-zinc-900 border-sky-500 text-sky-400':'bg-zinc-900 border-zinc-600 text-zinc-500'}`}>
                                {done?<CheckIcon className="w-4 h-4" />:i+1}
                            </div>
                            <span className={`text-xs font-semibold text-center ${active?'text-sky-400':done?'text-sky-600':'text-zinc-500'}`}>{label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

const SectionDivider: React.FC<{icon:string;title:string}> = ({icon,title}) => (
    <div className="flex items-center gap-3 mt-8 mb-5">
        <span className="text-xl">{icon}</span>
        <h3 className="text-base font-bold text-slate-200 whitespace-nowrap">{title}</h3>
        <div className="flex-1 h-px bg-zinc-700" />
    </div>
);

const FieldError: React.FC<{message?:string}> = ({message}) =>
    message ? <p className="text-red-400 text-xs mt-1">{message}</p> : null;

const inputCls = (err?: string) =>
    `block w-full bg-zinc-800 border ${err?'border-red-500':'border-zinc-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition`;
const selectCls = (err?: string) =>
    `block w-full bg-zinc-800 border ${err?'border-red-500':'border-zinc-700'} rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition`;
const textareaCls =
    `block w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-none`;

const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ user, onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string|null>(null);
    const [errors, setErrors] = useState<Record<string,string>>({});
    const [lastSaved, setLastSaved] = useState<Date|null>(null);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<Partial<OnlineAdmission>|null>(null);
    const [showReviewPage, setShowReviewPage] = useState(false);

    useEffect(() => {
        document.querySelector('.max-w-4xl')?.scrollIntoView({behavior:'smooth',block:'start'});
        window.scrollTo({top:0,behavior:'smooth'});
    }, [step, showReviewPage]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw) as Partial<OnlineAdmission>;
                if (draft.studentName||draft.fatherName) { setPendingDraft(draft); setShowDraftPrompt(true); }
            }
        } catch { /* ignore */ }
    }, []);

    const saveDraftLocally = useCallback((data: Partial<OnlineAdmission>) => {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); setLastSaved(new Date()); } catch { /* ignore */ }
    }, []);

    const [showIdInput, setShowIdInput] = useState<'existing'|'continue'|'resubmit'|null>(null);
    const [existingId, setExistingId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [savedApplicationId, setSavedApplicationId] = useState<string|null>(null);

    const [formData, setFormData] = useState<Partial<OnlineAdmission>>({
        admissionGrade: GRADES_LIST[0], gender:'Male', category:'General', cwsn:'No',
        email: user?.email||'', status:'draft', generalBehaviour:'Normal', siblingsInSchool:0,
    });

    useEffect(() => {
        if (step===0||showReviewPage) return;
        const timer = setInterval(()=>saveDraftLocally(formData), 60_000);
        return ()=>clearInterval(timer);
    }, [formData, step, showReviewPage, saveDraftLocally]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const {name,value} = e.target;
        setFormData(prev=>({...prev,[name]:value}));
        if (errors[name]) setErrors(prev=>{const n={...prev};delete n[name];return n;});
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof OnlineAdmission) => {
        if (e.target.files?.[0]) {
            setUploadingDoc(String(field));
            try {
                const resized = await resizeImage(e.target.files[0],1024,1024,0.8);
                const url = await uploadToImgBB(resized);
                setFormData(prev=>({...prev,[field]:url}));
                if (errors[String(field)]) setErrors(prev=>{const n={...prev};delete n[String(field)];return n;});
            } catch { alert("Failed to upload document. Please try again."); }
            finally { setUploadingDoc(null); }
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string,string> = {};
        if (currentStep===1) {
            if (!formData.studentName?.trim()) newErrors.studentName = "Student name is required.";
            if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
            if (!formData.gender) newErrors.gender = "Gender is required.";
            if (!formData.category) newErrors.category = "Category is required.";
            if (!formData.religion?.trim()) newErrors.religion = "Religion is required.";
        }
        if (currentStep===2) {
            if (!formData.fatherName?.trim()) newErrors.fatherName = "Father's name is required.";
            if (!formData.motherName?.trim()) newErrors.motherName = "Mother's name is required.";
            if (!formData.contactNumber?.trim()) newErrors.contactNumber = "Contact number is required.";
            if (!formData.permanentAddress?.trim()) newErrors.permanentAddress = "Permanent address is required.";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(()=>{ document.querySelector('.field-error')?.scrollIntoView({behavior:'smooth',block:'center'}); },50);
            return false;
        }
        return true;
    };

    const handleFetchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!existingId.trim()) return;
        const idInput = showIdInput==='existing' ? existingId.trim().toUpperCase() : existingId.trim();
        setIsFetching(true); setFetchError('');

        if (showIdInput==='resubmit') {
            try {
                const doc = await db.collection('online_admissions').doc(idInput).get();
                if (doc.exists) navigate(`/admissions/payment/${idInput}`);
                else setFetchError('Reference ID not found. Please check and try again.');
            } catch { setFetchError('An error occurred. Please try again.'); }
            finally { setIsFetching(false); }
            return;
        }

        const fillForm = (data: Student|OnlineAdmission, isAdmissionDraft=false) => {
            const s = data as Student, a = data as OnlineAdmission;
            setFormData(prev=>({
                ...(isAdmissionDraft?a:prev), studentType:'Existing',
                previousStudentId: s.studentId||idInput,
                admissionGrade: isAdmissionDraft?a.admissionGrade:getNextGrade(s.grade)||s.grade,
                studentName: s.name||a.studentName, dateOfBirth: s.dateOfBirth||a.dateOfBirth,
                gender: s.gender||a.gender, studentAadhaar: s.aadhaarNumber||a.studentAadhaar,
                fatherName: s.fatherName||a.fatherName, motherName: s.motherName||a.motherName,
                fatherOccupation: s.fatherOccupation||a.fatherOccupation, motherOccupation: s.motherOccupation||a.motherOccupation,
                parentAadhaar: s.fatherAadhaar||a.parentAadhaar, guardianName: s.guardianName||a.guardianName,
                guardianRelationship: s.guardianRelationship||a.guardianRelationship,
                permanentAddress: s.address||a.permanentAddress, presentAddress: s.address||a.presentAddress,
                contactNumber: s.contact||a.contactNumber, religion: s.religion||a.religion,
                category: (s.category as string)||(a.category as string), cwsn: s.cwsn||a.cwsn,
                bloodGroup: s.bloodGroup||a.bloodGroup, penNumber: s.pen||a.penNumber,
                achievements: s.achievements||a.achievements, healthIssues: s.healthConditions||a.healthIssues,
                lastSchoolAttended: isAdmissionDraft?a.lastSchoolAttended:'Bethel Mission School',
            }));
            setStep(1);
        };

        try {
            if (showIdInput==='continue') {
                const doc = await db.collection('online_admissions').doc(idInput).get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data?.status==='rejected') { setFetchError('This application has been rejected and cannot be edited.'); return; }
                    fillForm({id:doc.id,...data} as OnlineAdmission, true);
                } else setFetchError('Application not found. Please check the ID.');
                return;
            }
            let snapshot = await db.collection('students').where('studentId','==',idInput).limit(1).get();
            if (!snapshot.empty) { fillForm(snapshot.docs[0].data() as Student); return; }
            const idPattern = /^BMS(\d{2})([A-Z0-9]{2})(\d+)$/;
            const match = idInput.match(idPattern);
            if (match) {
                const [_,yearShort,gradeCode,rollStr] = match;
                const rollNo = parseInt(rollStr,10);
                const gradeMap: Record<string,string> = {'NU':'Nursery','KG':'Kindergarten','01':'Class I','02':'Class II','03':'Class III','04':'Class IV','05':'Class V','06':'Class VI','07':'Class VII','08':'Class VIII','09':'Class IX','10':'Class X'};
                const grade = gradeMap[gradeCode];
                if (grade) {
                    const fb = await db.collection('students').where('grade','==',grade).where('rollNo','==',rollNo).get();
                    const found = fb.docs.find(doc=>{ const s=doc.data() as Student; return s.academicYear?.startsWith(`20${yearShort}`); });
                    if (found) { fillForm(found.data() as Student); return; }
                }
            }
            setFetchError('Student ID not found. Please check the ID or choose "Skip" to fill manually.');
        } catch (error) { console.error(error); setFetchError('An error occurred while fetching details.'); }
        finally { setIsFetching(false); }
    };

    const handleSaveForLater = async () => {
        setIsSaving(true);
        try {
            const draftData = {...formData, status:'draft' as const, submissionDate: formData.submissionDate||new Date().toISOString()};
            const id = await onOnlineAdmissionSubmit(draftData, formData.id);
            setFormData(prev=>({...prev,id}));
            setSavedApplicationId(id);
            saveDraftLocally({...draftData,id});
        } catch { alert("Failed to save application draft."); }
        finally { setIsSaving(false); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const isNewStudent = formData.studentType==='Newcomer', isNursery = formData.admissionGrade===Grade.NURSERY;
        const docErrors: Record<string,string> = {};
        if (isNewStudent && !formData.birthCertificateUrl) docErrors.birthCertificateUrl = "Birth Certificate is mandatory for new students.";
        if (isNewStudent && !isNursery && !formData.reportCardUrl) docErrors.reportCardUrl = "Last Report Card is mandatory for new students (except Nursery).";
        if (Object.keys(docErrors).length > 0) { setErrors(docErrors); setTimeout(()=>document.querySelector('.field-error')?.scrollIntoView({behavior:'smooth',block:'center'}),50); return; }
        setShowReviewPage(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const id = await onOnlineAdmissionSubmit({...formData, submissionDate:new Date().toISOString(), status:'pending' as const}, formData.id);
            localStorage.removeItem(DRAFT_KEY);
            navigate(`/admissions/payment/${id}`, {state:{grade:formData.admissionGrade,studentName:formData.studentName,fatherName:formData.fatherName,contact:formData.contactNumber,studentType:formData.studentType}});
        } catch { alert("Failed to submit application. Please try again."); }
        finally { setIsSubmitting(false); }
    };

    const isNewStudent = formData.studentType==='Newcomer', isNursery = formData.admissionGrade===Grade.NURSERY;

    const DraftPrompt = () => (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                <p className="text-3xl mb-3">📝</p>
                <h3 className="text-lg font-bold text-white mb-2">Unsaved Draft Found</h3>
                <p className="text-sm text-slate-400 mb-6">You have an unfinished application for <strong className="text-white">{pendingDraft?.studentName||'a student'}</strong>. Would you like to continue where you left off?</p>
                <div className="flex gap-3">
                    <button className="flex-1 btn btn-secondary" onClick={()=>{setShowDraftPrompt(false);setPendingDraft(null);localStorage.removeItem(DRAFT_KEY);}}>Start Fresh</button>
                    <button className="flex-1 btn btn-primary" onClick={()=>{if(pendingDraft){setFormData(prev=>({...prev,...pendingDraft}));setStep(1);}setShowDraftPrompt(false);}}>Continue</button>
                </div>
            </div>
        </div>
    );

    // Review page
    if (showReviewPage) {
        const rows: [string,string][] = [
            ['Student Name',formData.studentName||'—'],['Class Applying For',formData.admissionGrade||'—'],
            ['Date of Birth',formData.dateOfBirth||'—'],['Gender',formData.gender||'—'],
            ['Aadhaar',formData.studentAadhaar?maskAadhaar(formData.studentAadhaar):'—'],
            ['Category',formData.category||'—'],['Religion',formData.religion||'—'],
            ["Father's Name",formData.fatherName||'—'],["Mother's Name",formData.motherName||'—'],
            ['Contact',formData.contactNumber||'—'],['Email',formData.email||'—'],
            ['Permanent Address',formData.permanentAddress||'—'],['Last School',formData.lastSchoolAttended||'—'],
        ];
        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-black py-12 min-h-screen">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-zinc-800 px-8 py-5">
                                <h2 className="text-xl font-bold text-white">Review Your Application</h2>
                                <p className="text-slate-400 text-sm mt-1">Please verify all details before submitting.</p>
                            </div>
                            <div className="p-8">
                                <div className="rounded-xl border border-zinc-700 overflow-hidden mb-6">
                                    <div className="bg-zinc-800 px-5 py-3 border-b border-zinc-700 flex items-center gap-2">
                                        <span>👤</span><p className="font-bold text-slate-200 text-sm">Application Details</p>
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {rows.map(([k,v])=>(
                                                <tr key={k} className="border-b border-zinc-700 last:border-0 hover:bg-zinc-800/50">
                                                    <td className="px-5 py-2.5 text-slate-400 font-medium w-44">{k}</td>
                                                    <td className="px-5 py-2.5 font-semibold text-white break-words">{v}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(formData.birthCertificateUrl||formData.transferCertificateUrl||formData.reportCardUrl) && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3"><span>📄</span><p className="font-bold text-slate-200 text-sm">Uploaded Documents</p></div>
                                        <div className="flex gap-4 flex-wrap">
                                            {([['Birth Cert.',formData.birthCertificateUrl],['TC',formData.transferCertificateUrl],['Report Card',formData.reportCardUrl]] as [string,string|undefined][]).filter(([,url])=>url).map(([label,url])=>(
                                                <div key={label} className="text-center">
                                                    <img src={url} alt={label} className="w-20 h-20 object-cover rounded-xl border-2 border-zinc-700 shadow-sm" />
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-700 rounded-xl p-4 mb-6">
                                    <span className="text-xl mt-0.5 flex-shrink-0">⚠️</span>
                                    <p className="text-sm text-amber-300">Once submitted, your application status becomes <strong>Pending</strong>. Please review carefully before confirming.</p>
                                </div>
                                <div className="flex gap-3 flex-col sm:flex-row-reverse">
                                    <button onClick={handleFinalSubmit} disabled={isSubmitting} className="btn btn-primary flex-1 !py-3 flex items-center justify-center gap-2">
                                        {isSubmitting?<SpinnerIcon className="w-5 h-5" />:'✅'} {isSubmitting?'Submitting…':'Confirm & Submit Application'}
                                    </button>
                                    <button onClick={()=>setShowReviewPage(false)} className="btn btn-secondary flex-1 !py-3">← Edit Application</button>
                                </div>
                                <p className="text-xs text-center text-zinc-500 mt-4">🔒 Your data is secure and encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Step 0 — selection screen
    if (step===0) {
        return (
            <>
                {showDraftPrompt && <DraftPrompt />}
                <div className="bg-black py-16 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                            <div className="mb-6">
                                <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                                    <BackIcon className="w-5 h-5" /> Back to Admission Guidelines
                                </button>
                            </div>
                            {!showIdInput ? (
                                <>
                                    <div className="text-center mb-6">
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Online Admission Portal</h1>
                                        <p className="text-slate-500 text-sm">Academic Session 2026-27</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-amber-950/30 border border-amber-700 rounded-xl px-5 py-3 mb-8 text-amber-300">
                                        <span className="text-2xl flex-shrink-0">⏰</span>
                                        <p className="text-sm font-semibold">Applications open until <strong>{ADMISSION_DEADLINE}</strong></p>
                                    </div>
                                    <div className="text-center mb-8"><p className="text-lg text-slate-400">Please select an option to begin.</p></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                        <button onClick={()=>{setFormData(prev=>({...prev,studentType:'Newcomer'}));setStep(1);}} className="bg-zinc-800 p-8 rounded-2xl shadow-lg border-2 border-zinc-700 hover:border-sky-500 hover:shadow-2xl transition-all group text-left">
                                            <div className="bg-sky-900/40 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">🎓</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">New Student</h3>
                                            <p className="text-slate-400">For children seeking admission for the first time.</p>
                                        </button>
                                        <button onClick={()=>setShowIdInput('existing')} className="bg-zinc-800 p-8 rounded-2xl shadow-lg border-2 border-zinc-700 hover:border-emerald-500 hover:shadow-2xl transition-all group text-left">
                                            <div className="bg-emerald-900/40 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">🔄</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Existing Student</h3>
                                            <p className="text-slate-400">For current students applying for re-admission or promotion.</p>
                                        </button>
                                    </div>
                                    <div className="text-center mt-10 flex flex-col items-center gap-3">
                                        <button onClick={()=>setShowIdInput('continue')} className="font-semibold text-sky-400 hover:underline">Continue a Saved Application &rarr;</button>
                                        <button onClick={()=>setShowIdInput('resubmit')} className="font-semibold text-amber-400 hover:underline">Resubmit Payment Screenshot &rarr;</button>
                                        <Link to="/admissions/status" className="font-semibold text-emerald-400 hover:underline">Check Application Status &rarr;</Link>
                                    </div>
                                </>
                            ) : (
                                <div className="max-w-lg mx-auto">
                                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                                        {showIdInput==='existing'?'Existing Student':showIdInput==='resubmit'?'Resubmit Payment':'Continue Application'}
                                    </h2>
                                    <p className="text-slate-400 text-center mb-6">
                                        {showIdInput==='existing'?'Enter your Student ID to auto-fill the form.':showIdInput==='resubmit'?'Enter your Reference ID to go back to the payment page.':'Enter your Application ID to resume or edit your submission.'}
                                    </p>
                                    <form onSubmit={handleFetchStudent}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-slate-200 mb-2">{showIdInput==='existing'?'Student ID':'Reference / Application ID'}</label>
                                            <input type="text" value={existingId} onChange={e=>setExistingId(showIdInput==='existing'?e.target.value.toUpperCase():e.target.value)} className={inputCls()} placeholder={showIdInput==='existing'?"e.g. BMS240101":"e.g. BMSAPPxxxx..."} autoFocus />
                                            {fetchError && <p className="text-red-400 text-sm mt-2">{fetchError}</p>}
                                            {(showIdInput==='continue'||showIdInput==='resubmit') && <p className="text-xs text-zinc-500 mt-1">The ID is case-sensitive. Copy and paste it for best results.</p>}
                                        </div>
                                        <button type="submit" disabled={isFetching||!existingId} className="w-full btn btn-primary flex items-center justify-center gap-2 mb-4">
                                            {isFetching?<SpinnerIcon className="w-5 h-5" />:<CheckIcon className="w-5 h-5" />}
                                            {isFetching?'Fetching...':showIdInput==='resubmit'?'Go to Payment Page':'Continue'}
                                        </button>
                                    </form>
                                    {showIdInput==='existing' && (
                                        <>
                                            <hr className="my-4 border-zinc-700" />
                                            <button onClick={()=>{setFormData(prev=>({...prev,studentType:'Existing',lastSchoolAttended:'Bethel Mission School'}));setStep(1);}} className="w-full btn btn-secondary">Skip & Fill Manually</button>
                                        </>
                                    )}
                                    <button onClick={()=>{setShowIdInput(null);setFetchError('');setExistingId('');}} className="w-full mt-4 text-zinc-500 hover:text-slate-200 text-sm">&larr; Back to Selection</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Steps 1-3: Form
    return (
        <>
            {showDraftPrompt && <DraftPrompt />}
            <div className="bg-black py-12 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-8 relative">

                        {savedApplicationId && (
                            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                                <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-lg shadow-2xl text-center">
                                    <h3 className="text-2xl font-bold text-emerald-400">Application Saved!</h3>
                                    <p className="mt-2 text-slate-300">Please save this ID to continue your application later:</p>
                                    <div className="my-4 p-3 bg-zinc-900 border-2 border-dashed border-zinc-600 rounded font-mono text-xl font-bold text-white">{savedApplicationId}</div>
                                    <button onClick={()=>navigator.clipboard.writeText(savedApplicationId)} className="btn btn-secondary w-full">Copy ID</button>
                                    <button onClick={()=>setSavedApplicationId(null)} className="mt-4 text-sm text-zinc-500 hover:text-slate-200 hover:underline">Close and Continue Editing</button>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <button onClick={()=>{setErrors({});step>1?setStep(step-1):setStep(0);}} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                                <BackIcon className="w-5 h-5" /> Back
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-700 rounded-xl px-4 py-2.5 mb-6 text-amber-300">
                            <span className="flex-shrink-0">⏰</span>
                            <p className="text-xs font-semibold">Applications open until <strong>{ADMISSION_DEADLINE}</strong></p>
                        </div>

                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-white">Online Admission Form</h1>
                            <p className="text-slate-400 mt-2">Academic Session 2026-27</p>
                            <p className="text-xs text-zinc-500 mt-1"><span className="text-red-400 font-bold">*</span> Required fields</p>
                        </div>

                        <ProgressBar currentStep={step} lastSaved={lastSaved} />

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Step 1 */}
                            {step===1 && (
                                <section className="animate-fade-in">
                                    <SectionDivider icon="🎓" title="Admission Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Class Applying For*</label>
                                            <select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className={selectCls()} required>
                                                {GRADES_LIST.map(g=><option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <SectionDivider icon="👤" title="Student Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Full Name*</label>
                                            <input type="text" name="studentName" value={formData.studentName||''} onChange={handleChange} className={inputCls(errors.studentName)} />
                                            <FieldError message={errors.studentName} />{errors.studentName&&<span className="field-error"/>}
                                        </div>
                                        <div>
                                            <CustomDatePicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth||''} onChange={handleChange} required={false} minYear={1960} maxYear={new Date().getFullYear()} />
                                            <FieldError message={errors.dateOfBirth} />{errors.dateOfBirth&&<span className="field-error"/>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Gender*</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls()}>
                                                {GENDER_LIST.map(g=><option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Aadhaar No. (Optional)</label>
                                            <input type="text" name="studentAadhaar" value={formData.studentAadhaar?maskAadhaar(formData.studentAadhaar):''}
                                                onChange={e=>{const d=e.target.value.replace(/\D/g,'').slice(0,12);setFormData(prev=>({...prev,studentAadhaar:d}));if(errors.studentAadhaar)setErrors(prev=>{const n={...prev};delete n.studentAadhaar;return n;});}}
                                                placeholder="XXXX-XXXX-1234" maxLength={14} className={inputCls()} />
                                            <p className="text-xs text-zinc-500 mt-0.5">12 digits — masked for security</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">PEN No. (Optional)</label>
                                            <input type="text" name="penNumber" value={formData.penNumber||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Mother Tongue (Optional)</label>
                                            <input type="text" name="motherTongue" value={formData.motherTongue||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Blood Group (Optional)</label>
                                            <select name="bloodGroup" value={formData.bloodGroup||''} onChange={handleChange} className={selectCls()}>
                                                <option value="">-- Select --</option>
                                                {BLOOD_GROUP_LIST.map(g=><option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">CWSN*</label>
                                            <select name="cwsn" value={formData.cwsn} onChange={handleChange} className={selectCls()}>
                                                <option value="No">No</option><option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Category*</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className={selectCls(errors.category)}>
                                                {CATEGORY_LIST.map(g=><option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <FieldError message={errors.category} />{errors.category&&<span className="field-error"/>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Religion*</label>
                                            <input type="text" name="religion" value={formData.religion||''} onChange={handleChange} className={inputCls(errors.religion)} />
                                            <FieldError message={errors.religion} />{errors.religion&&<span className="field-error"/>}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Step 2 */}
                            {step===2 && (
                                <section className="animate-fade-in">
                                    <SectionDivider icon="👨‍👩‍👦" title="Parent / Guardian Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Father's Name*</label>
                                            <input type="text" name="fatherName" value={formData.fatherName||''} onChange={handleChange} className={inputCls(errors.fatherName)} />
                                            <FieldError message={errors.fatherName} />{errors.fatherName&&<span className="field-error"/>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Mother's Name*</label>
                                            <input type="text" name="motherName" value={formData.motherName||''} onChange={handleChange} className={inputCls(errors.motherName)} />
                                            <FieldError message={errors.motherName} />{errors.motherName&&<span className="field-error"/>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Father's Occupation</label>
                                            <input type="text" name="fatherOccupation" value={formData.fatherOccupation||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Mother's Occupation</label>
                                            <input type="text" name="motherOccupation" value={formData.motherOccupation||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Father's/Mother's Aadhaar No.</label>
                                            <input type="text" name="parentAadhaar" value={formData.parentAadhaar?maskAadhaar(formData.parentAadhaar):''}
                                                onChange={e=>{const d=e.target.value.replace(/\D/g,'').slice(0,12);setFormData(prev=>({...prev,parentAadhaar:d}));}}
                                                placeholder="XXXX-XXXX-1234" maxLength={14} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Guardian's Name (if any)</label>
                                            <input type="text" name="guardianName" value={formData.guardianName||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Relationship with Guardian</label>
                                            <input type="text" name="guardianRelationship" value={formData.guardianRelationship||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                    </div>
                                    <SectionDivider icon="📞" title="Contact Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Contact No.*</label>
                                            <div className="flex mt-1">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-700 bg-zinc-800 text-slate-400 text-sm font-semibold select-none">+91</span>
                                                <input type="tel" name="contactNumber" value={formData.contactNumber||''}
                                                    onChange={e=>{const v=e.target.value.replace(/\D/g,'').slice(0,10);setFormData(prev=>({...prev,contactNumber:v}));if(errors.contactNumber)setErrors(prev=>{const n={...prev};delete n.contactNumber;return n;});}}
                                                    placeholder="10-digit number" maxLength={10} inputMode="numeric"
                                                    className={`block w-full rounded-r-lg border ${errors.contactNumber?'border-red-500':'border-zinc-700'} bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500`} />
                                            </div>
                                            <FieldError message={errors.contactNumber} />{errors.contactNumber&&<span className="field-error"/>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Email</label>
                                            <input type="email" name="email" value={formData.email||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Permanent Address*</label>
                                            <textarea name="permanentAddress" value={formData.permanentAddress||''} onChange={handleChange} className={textareaCls} rows={2}></textarea>
                                            <FieldError message={errors.permanentAddress} />{errors.permanentAddress&&<span className="field-error"/>}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Step 3 */}
                            {step===3 && (
                                <section className="animate-fade-in">
                                    <SectionDivider icon="🏫" title="Previous School Details" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Last School Attended</label>
                                            <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Division in which he/she passed</label>
                                            <input type="text" name="lastDivision" value={formData.lastDivision||''} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">General Behaviour</label>
                                            <select name="generalBehaviour" value={formData.generalBehaviour||'Normal'} onChange={handleChange} className={selectCls()}>
                                                <option value="Mild">Mild</option><option value="Normal">Normal</option><option value="Hyperactive">Hyperactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Siblings in this school</label>
                                            <input type="number" name="siblingsInSchool" value={formData.siblingsInSchool||0} onChange={handleChange} className={inputCls()} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Achievements</label>
                                            <textarea name="achievements" value={formData.achievements||''} onChange={handleChange} className={textareaCls} rows={3}></textarea>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Health Issues (if any)</label>
                                            <textarea name="healthIssues" value={formData.healthIssues||''} onChange={handleChange} className={textareaCls} rows={3}></textarea>
                                        </div>
                                    </div>
                                    <SectionDivider icon="📄" title="Documents Upload" />
                                    {isNewStudent && (
                                        <p className="text-sm text-amber-300 my-4 bg-amber-950/30 p-3 rounded-lg border border-amber-700">
                                            <span className="font-bold">Important:</span> For new students, the Birth Certificate is mandatory.{!isNursery&&" The Last Report Card is also mandatory."}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {([
                                            ['birthCertificateUrl','Birth Certificate',isNewStudent],
                                            ['transferCertificateUrl','Transfer Certificate (if applicable)',false],
                                            ['reportCardUrl','Last Report Card',isNewStudent&&!isNursery],
                                        ] as [keyof OnlineAdmission, string, boolean][]).map(([field,label,required])=>(
                                            <div key={String(field)}>
                                                <label className="block text-sm font-bold text-slate-200 mb-1">{label}{required&&<span className="text-red-400">*</span>}</label>
                                                <div className="flex items-center gap-3 mt-2 p-3 border border-zinc-700 rounded-xl bg-zinc-800">
                                                    <label className="btn btn-secondary cursor-pointer flex items-center gap-2 min-h-[44px]">
                                                        {uploadingDoc===String(field)?<SpinnerIcon className="w-5 h-5" />:<UploadIcon className="w-5 h-5" />}
                                                        <input type="file" onChange={e=>handleFileChange(e,field)} className="hidden" accept="image/*" />
                                                        Upload
                                                    </label>
                                                    {formData[field] && (
                                                        <a href={String(formData[field])} target="_blank" rel="noreferrer">
                                                            <img src={String(formData[field])} alt={label} className="w-12 h-12 rounded-lg object-cover border border-zinc-600" />
                                                        </a>
                                                    )}
                                                </div>
                                                <FieldError message={errors[String(field)]} />{errors[String(field)]&&<span className="field-error"/>}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between items-center pt-6 border-t border-zinc-700">
                                {step>1?<button type="button" onClick={()=>{setErrors({});setStep(s=>s-1);}} className="btn btn-secondary">Back</button>:<div></div>}
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={handleSaveForLater} disabled={isSubmitting||isSaving} className="btn btn-secondary">
                                        {isSaving?<><SpinnerIcon className="w-5 h-5" /> Saving...</>:<><SaveIcon className="w-5 h-5" /> Save for Later</>}
                                    </button>
                                    {step<3?(
                                        <button type="button" onClick={()=>{if(validateStep(step))setStep(s=>s+1);}} className="btn btn-primary">
                                            Next <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                    ):(
                                        <button type="submit" disabled={isSubmitting||isSaving} className="btn btn-primary px-8 py-3 text-lg">
                                            {isSubmitting?<><SpinnerIcon className="w-6 h-6" /> Submitting...</>:'Review & Submit'}
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
