
import React, { useState } from 'react';
import { OnlineAdmission, Grade } from '../types';
import { GRADES_LIST } from '../constants';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, ClockIcon, InformationCircleIcon, InboxArrowDownIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';

// Simple Lightbox component for this page
const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300" onClick={onClose}>&times;</button>
            <img src={src} alt={alt} className="max-w-full max-h-full rounded shadow-lg" onClick={e => e.stopPropagation()} />
        </div>
    );
};

interface OnlineAdmissionsListPageProps {
    admissions: OnlineAdmission[];
    onUpdateStatus: (id: string, status: OnlineAdmission['status']) => Promise<void>;
}

const OnlineAdmissionsListPage: React.FC<OnlineAdmissionsListPageProps> = ({ admissions, onUpdateStatus }) => {
    const [filterStatus, setFilterStatus] = useState<'all' | OnlineAdmission['status']>('all');
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
    const [lightboxImage, setLightboxImage] = useState<{ src: string, alt: string } | null>(null);

    const filteredAdmissions = admissions.filter(a => filterStatus === 'all' || a.status === filterStatus)
        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

    const handleStatusChange = async (id: string, newStatus: OnlineAdmission['status']) => {
        setUpdatingStatus(prev => ({ ...prev, [id]: true }));
        await onUpdateStatus(id, newStatus);
        setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    };

    const getStatusBadge = (status: OnlineAdmission['status']) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Pending</span>;
            case 'reviewed': return <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1"><InformationCircleIcon className="w-3 h-3"/> Reviewed</span>;
            case 'approved': return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Approved</span>;
            case 'rejected': return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1"><XCircleIcon className="w-3 h-3"/> Rejected</span>;
            default: return null;
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <InboxArrowDownIcon className="w-10 h-10 text-sky-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Online Admissions</h1>
                        <p className="text-slate-600 mt-1">Review and manage incoming student applications.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'reviewed', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as any)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-6">
                    {filteredAdmissions.length > 0 ? filteredAdmissions.map(app => (
                        <div key={app.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-800">{app.studentName}</h3>
                                        {getStatusBadge(app.status)}
                                        {app.paymentStatus === 'paid' && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Paid</span>}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">Applied for: <span className="font-semibold text-slate-800">{app.admissionGrade}</span> • Submitted: {formatDateForDisplay(app.submissionDate)}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-1">Ref ID: {app.id}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p><span className="text-slate-500">Father:</span> <span className="font-medium">{app.fatherName}</span></p>
                                    <p><span className="text-slate-500">Contact:</span> <span className="font-medium">{app.contactNumber}</span></p>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-3 text-sm">
                                    <h4 className="font-bold text-slate-700 border-b pb-1 mb-2">Personal Details</h4>
                                    <p><span className="text-slate-500 block">Date of Birth:</span> {formatDateForDisplay(app.dateOfBirth)}</p>
                                    <p><span className="text-slate-500 block">Gender:</span> {app.gender}</p>
                                    <p><span className="text-slate-500 block">Aadhaar:</span> {app.studentAadhaar}</p>
                                    <p><span className="text-slate-500 block">Address:</span> {app.presentAddress}</p>
                                    <p><span className="text-slate-500 block">Last School:</span> {app.lastSchoolAttended || 'N/A'}</p>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <h4 className="font-bold text-slate-700 border-b pb-1 mb-2">Documents</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {app.birthCertificateUrl && (
                                            <div className="cursor-pointer group" onClick={() => setLightboxImage({ src: app.birthCertificateUrl!, alt: 'Birth Certificate' })}>
                                                <div className="aspect-square bg-slate-100 rounded border flex items-center justify-center overflow-hidden relative">
                                                    <img src={app.birthCertificateUrl} alt="Birth Cert" className="object-cover w-full h-full" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                                <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">Birth Cert.</p>
                                            </div>
                                        )}
                                        {app.transferCertificateUrl && (
                                            <div className="cursor-pointer group" onClick={() => setLightboxImage({ src: app.transferCertificateUrl!, alt: 'Transfer Certificate' })}>
                                                <div className="aspect-square bg-slate-100 rounded border flex items-center justify-center overflow-hidden relative">
                                                    <img src={app.transferCertificateUrl} alt="TC" className="object-cover w-full h-full" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                                <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">TC</p>
                                            </div>
                                        )}
                                        {app.reportCardUrl && (
                                            <div className="cursor-pointer group" onClick={() => setLightboxImage({ src: app.reportCardUrl!, alt: 'Report Card' })}>
                                                <div className="aspect-square bg-slate-100 rounded border flex items-center justify-center overflow-hidden relative">
                                                    <img src={app.reportCardUrl} alt="Report Card" className="object-cover w-full h-full" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                                <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">Report Card</p>
                                            </div>
                                        )}
                                         {app.paymentScreenshotUrl && (
                                            <div className="cursor-pointer group" onClick={() => setLightboxImage({ src: app.paymentScreenshotUrl!, alt: 'Payment Screenshot' })}>
                                                <div className="aspect-square bg-slate-100 rounded border flex items-center justify-center overflow-hidden relative">
                                                    <img src={app.paymentScreenshotUrl} alt="Payment" className="object-cover w-full h-full" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                                <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">Payment</p>
                                            </div>
                                        )}
                                    </div>
                                    {app.paymentStatus === 'paid' && (
                                        <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-100">
                                            <p className="font-bold text-emerald-800 text-xs uppercase">Payment Details</p>
                                            <p>Amount: ₹{app.paymentAmount}</p>
                                            <p>Txn ID: {app.paymentTransactionId}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            {app.status !== 'rejected' && (
                                <div className="bg-slate-50 p-4 border-t border-slate-200">
                                    {app.status === 'approved' && app.isEnrolled && (
                                        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                                            <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5"/> Student Enrolled
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-1">
                                                This student has been added to the <strong>{app.admissionGrade}</strong> class list.
                                            </p>
                                            {app.temporaryStudentId && (
                                                <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                                                    Student ID: {app.temporaryStudentId}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {app.status === 'approved' && !app.isEnrolled && app.temporaryStudentId && (
                                        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                                            <h4 className="font-bold text-emerald-800">Temporary Student ID Generated</h4>
                                            <p className="font-mono text-lg font-bold text-slate-800 bg-white inline-block px-3 py-1 rounded mt-1 border border-emerald-200">
                                                {app.temporaryStudentId}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">Please provide this ID to the parent/guardian to complete payment.</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <label className="font-bold text-slate-800 text-sm">Update Application Status:</label>
                                        <div className="flex items-center gap-2">
                                            {updatingStatus[app.id] ? <SpinnerIcon className="w-5 h-5 text-sky-600"/> : (
                                                <select 
                                                    value={app.status} 
                                                    onChange={e => handleStatusChange(app.id, e.target.value as any)} 
                                                    disabled={app.isEnrolled}
                                                    className="form-select text-sm border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-200 disabled:text-slate-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewed">Reviewed</option>
                                                    <option value="approved">Approved (Enroll)</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 italic">
                                            {app.isEnrolled ? "Student is already enrolled." : "Approving will automatically enroll the student into the class."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                            <p className="text-slate-600 text-lg">No applications found matching the selected filter.</p>
                        </div>
                    )}
                </div>
            </div>
            {lightboxImage && <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}
        </>
    );
};

export default OnlineAdmissionsListPage;
