
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, OnlineAdmission } from '@/types';
import { BackIcon, HomeIcon, UserIcon, MapPinIcon, PhoneIcon, MailIcon, CalendarIcon, FileIcon, ShieldCheckIcon, AwardIcon } from '@/components/Icons';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import { formatDateForDisplay } from '@/utils';

const { useParams, Link } = ReactRouterDOM as any;

interface StudentProfilePageProps {
    students: Student[];
    user: User;
    admissions?: OnlineAdmission[];
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number | undefined }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-white/30">
        <div className="mt-0.5 text-sky-600">{icon}</div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{value || '-'}</p>
        </div>
    </div>
);

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ students, user, admissions = [] }) => {
    const { studentId } = useParams() as { studentId: string };
    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

    // Try to find the admission record for this student to get uploaded documents
    const admission = useMemo(() => {
        if (!student) return null;
        return admissions.find(a => a.temporaryStudentId === student.studentId || a.previousStudentId === student.studentId);
    }, [student, admissions]);

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <UserIcon className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-lg font-semibold">Student not found</p>
                <Link to="/portal/dashboard" className="text-sky-600 hover:underline mt-2">Return to Dashboard</Link>
            </div>
        );
    }

    const documents = [
        { name: 'Birth Certificate', url: admission?.birthCertificateUrl },
        { name: 'Transfer Certificate', url: admission?.transferCertificateUrl },
        { name: 'Previous Report Card', url: admission?.reportCardUrl },
        { name: 'Aadhaar Card', url: null }, // placeholder if we add this field
    ].filter(doc => !!doc.url);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Navigation */}
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-4">
                     <Link to="/portal/dashboard" className="text-slate-500 hover:text-slate-700"><HomeIcon className="w-5 h-5"/></Link>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-sky-600 to-indigo-600 h-32 relative">
                     <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                        <PhotoWithFallback src={student.photographUrl} alt={student.name} />
                     </div>
                </div>
                <div className="pt-14 pb-6 px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">{student.name}</h1>
                        <p className="text-slate-600 font-bold flex items-center gap-2">
                            <span>{student.grade}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>Roll No: {student.rollNo}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>ID: {student.studentId}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Personal Info */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <UserIcon className="w-5 h-5 text-sky-600"/> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow icon={<CalendarIcon className="w-4 h-4"/>} label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
                            <InfoRow icon={<UserIcon className="w-4 h-4"/>} label="Gender" value={student.gender} />
                            <InfoRow icon={<AwardIcon className="w-4 h-4"/>} label="Blood Group" value={student.bloodGroup} />
                            <InfoRow icon={<ShieldCheckIcon className="w-4 h-4"/>} label="Aadhaar Number" value={student.aadhaarNumber} />
                            <div className="sm:col-span-2">
                                <InfoRow icon={<MapPinIcon className="w-4 h-4"/>} label="Address" value={student.address} />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <UserIcon className="w-5 h-5 text-indigo-600"/> Family Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow icon={<UserIcon className="w-4 h-4"/>} label="Father's Name" value={student.fatherName} />
                            <InfoRow icon={<UserIcon className="w-4 h-4"/>} label="Father's Occupation" value={student.fatherOccupation} />
                            <InfoRow icon={<UserIcon className="w-4 h-4"/>} label="Mother's Name" value={student.motherName} />
                            <InfoRow icon={<UserIcon className="w-4 h-4"/>} label="Mother's Occupation" value={student.motherOccupation} />
                            <div className="sm:col-span-2">
                                <InfoRow icon={<PhoneIcon className="w-4 h-4"/>} label="Emergency Contact" value={student.contact} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Documents & Medical */}
                <div className="space-y-6">
                    <section className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <FileIcon className="w-5 h-5 text-emerald-600"/> Documents
                        </h2>
                        {documents.length > 0 ? (
                            <div className="space-y-3">
                                {documents.map((doc, idx) => (
                                    <a 
                                        key={idx} 
                                        href={doc.url!} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                                <FileIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{doc.name}</span>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                        )}
                    </section>

                    <section className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <ShieldCheckIcon className="w-5 h-5 text-rose-600"/> Medical & Health
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Health Issues / Allergies</p>
                                <p className="text-sm font-semibold text-slate-900 mt-1">{student.healthConditions || 'None recorded'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <AwardIcon className="w-5 h-5 text-amber-600"/> Achievements
                        </h2>
                        <p className="text-sm font-semibold text-slate-900">{student.achievements || 'No specific achievements recorded yet.'}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;
