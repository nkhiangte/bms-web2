import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { OnlineAdmission, Student } from '@/types';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, ClockIcon, InformationCircleIcon, InboxArrowDownIcon, EyeIcon, TrashIcon, EditIcon, CurrencyDollarIcon, UserIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import ConfirmationModal from '@/components/ConfirmationModal';
import EnrollStudentModal from '@/components/EnrollStudentModal';

const { useNavigate } = ReactRouterDOM as any;

const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300" onClick={onClose}>&times;</button>
        <img src={src} alt={alt} className="max-w-full max-h-full rounded shadow-lg" onClick={e => e.stopPropagation()} />
    </div>
);

interface OnlineAdmissionsListPageProps {
    admissions: OnlineAdmission[];
    onUpdateStatus: (id: string, status: OnlineAdmission['status']) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    onEnrollStudent: (admissionId: string, studentData: Omit<Student, 'id'>) => Promise<void>;
    academicYear: string;
}

const getStatusBadge = (status: OnlineAdmission['status']) => {
    switch (status) {
        case 'draft':    return <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1 w-fit"><ClockIcon className="w-3 h-3"/> Draft</span>;
        case 'pending':  return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 w-fit"><ClockIcon className="w-3 h-3"/> Pending</span>;
        case 'reviewed': return <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1 w-fit"><InformationCircleIcon className="w-3 h-3"/> Reviewed</span>;
        case 'approved': return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 w-fit"><CheckCircleIcon className="w-3 h-3"/> Approved</span>;
        case 'rejected': return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1 w-fit"><XCircleIcon className="w-3 h-3"/> Rejected</span>;
        default: return null;
    }
};

const getTypeBadge = (studentType?: string) => {
    if (studentType === 'Boarder') return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold whitespace-nowrap">🏠 Boarder</span>;
    if (studentType === 'Existing') return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">🔄 Existing</span>;
    return <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold whitespace-nowrap">🎓 New</span>;
};

const AdmissionDetailsModal: React.FC<{
    admission: OnlineAdmission;
    onClose: () => void;
    onUpdateStatus: (id: string, status: OnlineAdmission['status']) => Promise<void>;
    updatingStatus: boolean;
    onImageClick: (src: string, alt: string) => void;
    onNavigateToEdit: (admission: OnlineAdmission) => void;
    onNavigateToPayment: (admission: OnlineAdmission) => void;
    onEnrollClick: (admission: OnlineAdmission) => void;
}> = ({ admission, onClose, onUpdateStatus, updatingStatus, onImageClick, onNavigateToEdit, onNavigateToPayment, onEnrollClick }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] text-slate-900" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Application Details</h2>
                    <p className="text-sm text-slate-600">Ref ID: <span className="font-mono text-slate-800">{admission.id}</span></p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 border rounded-lg">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{admission.studentName}</h3>
                        <p className="text-sm text-slate-600">Applied for: <span className="font-semibold text-slate-800">{admission.admissionGrade}</span></p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-600">Type:</span>
                            {getTypeBadge(admission.studentType)}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Submitted: <span className="text-slate-800">{formatDateForDisplay(admission.submissionDate)}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(admission.status)}
                        {admission.paymentStatus === 'paid' && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Payment Verified</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-sm">
                        <h4 className="font-bold text-slate-700 border-b pb-1 mb-2">Personal Information</h4>
                        {[
                            { label: "Father's Name", value: admission.fatherName },
                            { label: "Mother's Name", value: admission.motherName },
                            { label: "Date of Birth", value: formatDateForDisplay(admission.dateOfBirth) },
                            { label: "Gender",        value: admission.gender },
                            { label: "Aadhaar",       value: admission.studentAadhaar },
                            { label: "Address",       value: admission.presentAddress },
                            { label: "Contact",       value: admission.contactNumber },
                            { label: "Last School",   value: admission.lastSchoolAttended || 'N/A' },
                        ].map(({ label, value }) => (
                            <p key={label}>
                                <span className="text-slate-500 block">{label}:</span>
                                <span className="text-slate-900 font-medium">{value}</span>
                            </p>
                        ))}
                    </div>
                    <div className="space-y-3 text-sm">
                        <h4 className="font-bold text-slate-700 border-b pb-1 mb-2">Documents</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {admission.birthCertificateUrl && (
                                <div className="cursor-pointer group" onClick={() => onImageClick(admission.birthCertificateUrl!, 'Birth Certificate')}>
                                    <div className="aspect-square bg-slate-100 rounded border overflow-hidden relative"><img src={admission.birthCertificateUrl} alt="Birth Cert" className="object-cover w-full h-full" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" /></div>
                                    <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">Birth Cert.</p>
                                </div>
                            )}
                            {admission.transferCertificateUrl && (
                                <div className="cursor-pointer group" onClick={() => onImageClick(admission.transferCertificateUrl!, 'Transfer Certificate')}>
                                    <div className="aspect-square bg-slate-100 rounded border overflow-hidden relative"><img src={admission.transferCertificateUrl} alt="TC" className="object-cover w-full h-full" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" /></div>
                                    <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">TC</p>
                                </div>
                            )}
                            {admission.reportCardUrl && (
                                <div className="cursor-pointer group" onClick={() => onImageClick(admission.reportCardUrl!, 'Report Card')}>
                                    <div className="aspect-square bg-slate-100 rounded border overflow-hidden relative"><img src={admission.reportCardUrl} alt="Report Card" className="object-cover w-full h-full" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" /></div>
                                    <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">Report Card</p>
                                </div>
                            )}
                            {admission.paymentScreenshotUrl && (
                                <div className="cursor-pointer group" onClick={() => onImageClick(admission.paymentScreenshotUrl!, 'Payment Screenshot')}>
                                    <div className="aspect-square bg-slate-100 rounded border overflow-hidden relative"><img src={admission.paymentScreenshotUrl} alt="Payment" className="object-cover w-full h-full" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" /></div>
                                    <p className="text-xs text-center mt-1 text-sky-600 group-hover:underline">Payment</p>
                                </div>
                            )}
                        </div>
                        {admission.paymentStatus === 'paid' && (
                            <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-100">
                                <p className="font-bold text-emerald-800 text-xs uppercase">Payment Details</p>
                                <p className="text-slate-800">Amount: ₹{admission.paymentAmount}</p>
                                <p className="text-slate-800">Txn ID: {admission.paymentTransactionId}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border rounded-lg">
                    <h4 className="font-bold text-slate-700 mb-3">Admin Actions</h4>
                    {admission.status === 'approved' && admission.isEnrolled && (
                        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                            <h4 className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Student Enrolled</h4>
                            {admission.temporaryStudentId && <p className="text-sm font-mono font-bold text-slate-800 mt-1">Student ID: {admission.temporaryStudentId}</p>}
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="font-bold text-slate-800 text-sm">Update Status:</label>
                            {updatingStatus ? <SpinnerIcon className="w-5 h-5 text-sky-600"/> : (
                                <select value={admission.status} onChange={e => onUpdateStatus(admission.id, e.target.value as any)} disabled={admission.isEnrolled} className="form-select text-sm text-slate-800 border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-200 disabled:text-slate-500">
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            )}
                            {!admission.isEnrolled && (admission.status === 'approved' || admission.status === 'reviewed') && (
                                <button onClick={() => onEnrollClick(admission)} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2 h-auto">Finalize Enrollment</button>
                            )}
                        </div>
                        <div className="flex gap-2 border-t pt-4">
                            <button onClick={() => onNavigateToEdit(admission)} className="btn btn-secondary text-sm flex items-center gap-2"><EditIcon className="w-4 h-4" /> Edit Application</button>
                            <button onClick={() => onNavigateToPayment(admission)} className="btn btn-secondary text-sm flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4" /> Go to Payment</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 border-t rounded-b-xl flex justify-end">
                <button onClick={onClose} className="btn btn-secondary">Close</button>
            </div>
        </div>
    </div>
);

const OnlineAdmissionsListPage: React.FC<OnlineAdmissionsListPageProps> = ({ admissions, onUpdateStatus, onDelete, onEnrollStudent, academicYear }) => {
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState<'all' | OnlineAdmission['status']>('all');
    const [filterType, setFilterType] = useState<'all' | 'Boarder' | 'day_scholar'>('all');
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
    const [lightboxImage, setLightboxImage] = useState<{ src: string, alt: string } | null>(null);
    const [selectedAdmission, setSelectedAdmission] = useState<OnlineAdmission | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [enrollingAdmission, setEnrollingAdmission] = useState<OnlineAdmission | null>(null);
    const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false);

    const filteredAdmissions = admissions
        .filter(a => filterStatus === 'all' || a.status === filterStatus)
        .filter(a => {
            if (filterType === 'all') return true;
            if (filterType === 'Boarder') return a.studentType === 'Boarder';
            if (filterType === 'day_scholar') return a.studentType !== 'Boarder';
            return true;
        })
        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

    const boarderCount = admissions.filter(a => a.studentType === 'Boarder').length;

    const handleStatusChange = async (id: string, newStatus: OnlineAdmission['status']) => {
        setUpdatingStatus(prev => ({ ...prev, [id]: true }));
        await onUpdateStatus(id, newStatus);
        setUpdatingStatus(prev => ({ ...prev, [id]: false }));
        if (selectedAdmission?.id === id) setSelectedAdmission(prev => prev ? { ...prev, status: newStatus } : null);
    };

    const handleEnroll = async (studentData: Omit<Student, 'id'>) => {
        if (!enrollingAdmission) return;
        setIsProcessingEnrollment(true);
        try {
            await onEnrollStudent(enrollingAdmission.id, studentData);
            setEnrollingAdmission(null);
        } catch (error) {
            console.error("Enrollment failed:", error);
            alert("Enrollment failed. Please try again.");
        } finally {
            setIsProcessingEnrollment(false);
        }
    };

    React.useEffect(() => {
        if (selectedAdmission) {
            const updated = admissions.find(a => a.id === selectedAdmission.id);
            if (updated) setSelectedAdmission(updated);
        }
    }, [admissions, selectedAdmission]);

    const confirmDelete = async () => {
        if (deletingId && onDelete) {
            setIsDeleting(true);
            await onDelete(deletingId);
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const navigateToEdit = (admission: OnlineAdmission) => navigate('/admissions/online', { state: { editingAdmission: admission } });
    const navigateToPayment = (admission: OnlineAdmission) => navigate(`/admissions/payment/${admission.id}`, {
        state: { grade: admission.admissionGrade, studentName: admission.studentName, fatherName: admission.fatherName, contact: admission.contactNumber, studentType: admission.studentType }
    });

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

                {/* Status filter */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {(['all', 'draft', 'pending', 'reviewed', 'approved', 'rejected'] as const).map(status => (
                        <button key={status} onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {status}
                        </button>
                    ))}
                </div>

                {/* Type filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All Types</button>
                    <button onClick={() => setFilterType('day_scholar')} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterType === 'day_scholar' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🎒 Day Scholar</button>
                    <button onClick={() => setFilterType('Boarder')} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${filterType === 'Boarder' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                        🏠 Boarder
                        {boarderCount > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filterType === 'Boarder' ? 'bg-white text-amber-600' : 'bg-amber-200 text-amber-800'}`}>{boarderCount}</span>}
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Ref ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Father's Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredAdmissions.length > 0 ? filteredAdmissions.map(app => (
                                <tr key={app.id} className={`hover:bg-slate-50 transition-colors ${app.studentType === 'Boarder' ? 'border-l-4 border-amber-400' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{app.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{app.admissionGrade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(app.studentType)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{app.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{app.fatherName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{app.contactNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateForDisplay(app.submissionDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {app.paymentStatus === 'paid'
                                            ? <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Paid</span>
                                            : <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-500">Pending</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            {getStatusBadge(app.status)}
                                            {app.isEnrolled && <span className="text-[10px] font-bold text-emerald-600">ENROLLED</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => setSelectedAdmission(app)} className="text-sky-600 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 p-2 rounded-full transition-colors" title="View Details"><EyeIcon className="w-5 h-5" /></button>
                                            {!app.isEnrolled && (app.status === 'approved' || app.status === 'reviewed') && (
                                                <button onClick={() => setEnrollingAdmission(app)} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-full transition-colors" title="Finalize Enrollment"><UserIcon className="w-5 h-5" /></button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => setDeletingId(app.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors" title="Delete Application"><TrashIcon className="w-5 h-5" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={10} className="px-6 py-10 text-center text-slate-500 text-sm">No applications found matching the selected filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedAdmission && (
                <AdmissionDetailsModal
                    admission={selectedAdmission}
                    onClose={() => setSelectedAdmission(null)}
                    onUpdateStatus={handleStatusChange}
                    updatingStatus={!!updatingStatus[selectedAdmission.id]}
                    onImageClick={(src, alt) => setLightboxImage({ src, alt })}
                    onNavigateToEdit={navigateToEdit}
                    onNavigateToPayment={navigateToPayment}
                    onEnrollClick={setEnrollingAdmission}
                />
            )}

            {enrollingAdmission && (
                <EnrollStudentModal
                    isOpen={!!enrollingAdmission}
                    onClose={() => setEnrollingAdmission(null)}
                    onEnroll={handleEnroll}
                    admission={enrollingAdmission}
                    academicYear={academicYear}
                    isProcessing={isProcessingEnrollment}
                />
            )}

            {lightboxImage && <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}

            <ConfirmationModal isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={confirmDelete} title="Delete Application" confirmDisabled={isDeleting}>
                <p className="text-slate-700">Are you sure you want to permanently delete this application? This action cannot be undone.</p>
                {isDeleting && <p className="text-sm text-slate-500 mt-2">Deleting...</p>}
            </ConfirmationModal>
        </>
    );
};

export default OnlineAdmissionsListPage;
