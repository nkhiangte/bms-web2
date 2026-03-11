import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { OnlineAdmission, Student } from '@/types';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, ClockIcon, InformationCircleIcon, InboxArrowDownIcon, EyeIcon, TrashIcon, EditIcon, CurrencyDollarIcon, UserIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import ConfirmationModal from '@/components/ConfirmationModal';
import EnrollStudentModal from '@/components/EnrollStudentModal';

const { useNavigate } = ReactRouterDOM as any;

// Simple Lightbox component for this page
const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300" onClick={onClose}>&times;</button>
            <img src={src} alt={alt} className="max-w-full max-h-full rounded shadow-lg" onClick={e => e.stopPropagation()} />
        </div>
    );
};

interface OnlineAdmissionsListPageProps {
    admissions: OnlineAdmission[];
    onUpdateStatus: (id: string, status: OnlineAdmission['status']) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    onEnrollStudent: (admissionId: string, studentData: Omit<Student, 'id'>) => Promise<void>;
    academicYear: string;
}

const getStatusBadge = (status: OnlineAdmission['status']) => {
    switch (status) {
        case 'draft':    return <span className="px-2 py-1 rounded-full bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 w-fit"><ClockIcon className="w-3 h-3"/> Draft</span>;
        case 'pending':  return <span className="px-2 py-1 rounded-full bg-amber-950/60 text-amber-300 text-xs font-bold flex items-center gap-1 w-fit"><ClockIcon className="w-3 h-3"/> Pending</span>;
        case 'reviewed': return <span className="px-2 py-1 rounded-full bg-sky-950/60 text-sky-300 text-xs font-bold flex items-center gap-1 w-fit"><InformationCircleIcon className="w-3 h-3"/> Reviewed</span>;
        case 'approved': return <span className="px-2 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-bold flex items-center gap-1 w-fit"><CheckCircleIcon className="w-3 h-3"/> Approved</span>;
        case 'rejected': return <span className="px-2 py-1 rounded-full bg-red-950/60 text-red-300 text-xs font-bold flex items-center gap-1 w-fit"><XCircleIcon className="w-3 h-3"/> Rejected</span>;
        default: return null;
    }
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
}> = ({ admission, onClose, onUpdateStatus, updatingStatus, onImageClick, onNavigateToEdit, onNavigateToPayment, onEnrollClick }) => {

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="p-6 border-b border-zinc-700 flex justify-between items-center bg-zinc-800 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">Application Details</h2>
                        <p className="text-sm text-zinc-400">Ref ID: <span className="font-mono text-zinc-300">{admission.id}</span></p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow space-y-6">

                    {/* Summary Banner */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                        <div>
                            <h3 className="text-lg font-bold text-white">{admission.studentName}</h3>
                            <p className="text-sm text-zinc-400">Applied for: <span className="font-semibold text-zinc-200">{admission.admissionGrade}</span></p>
                            <p className="text-sm text-zinc-400">Student Type: <span className="font-semibold text-zinc-200">{admission.studentType}</span></p>
                            <p className="text-sm text-zinc-400">Submitted: <span className="text-zinc-300">{formatDateForDisplay(admission.submissionDate)}</span></p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(admission.status)}
                            {admission.paymentStatus === 'paid' && (
                                <span className="px-2 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-bold">Payment Verified</span>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Personal Information */}
                        <div className="space-y-3 text-sm">
                            <h4 className="font-bold text-zinc-300 border-b border-zinc-700 pb-1 mb-2">Personal Information</h4>
                            {[
                                { label: "Father's Name",  value: admission.fatherName },
                                { label: "Mother's Name",  value: admission.motherName },
                                { label: "Date of Birth",  value: formatDateForDisplay(admission.dateOfBirth) },
                                { label: "Gender",         value: admission.gender },
                                { label: "Aadhaar",        value: admission.studentAadhaar },
                                { label: "Address",        value: admission.presentAddress },
                                { label: "Contact",        value: admission.contactNumber },
                                { label: "Last School",    value: admission.lastSchoolAttended || 'N/A' },
                            ].map(({ label, value }) => (
                                <p key={label}>
                                    <span className="text-zinc-500 block">{label}:</span>
                                    <span className="text-zinc-100 font-medium">{value}</span>
                                </p>
                            ))}
                        </div>

                        {/* Documents */}
                        <div className="space-y-3 text-sm">
                            <h4 className="font-bold text-zinc-300 border-b border-zinc-700 pb-1 mb-2">Documents</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {admission.birthCertificateUrl && (
                                    <div className="cursor-pointer group" onClick={() => onImageClick(admission.birthCertificateUrl!, 'Birth Certificate')}>
                                        <div className="aspect-square bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center overflow-hidden relative">
                                            <img src={admission.birthCertificateUrl} alt="Birth Cert" className="object-cover w-full h-full" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                        <p className="text-xs text-center mt-1 text-sky-400 group-hover:underline">Birth Cert.</p>
                                    </div>
                                )}
                                {admission.transferCertificateUrl && (
                                    <div className="cursor-pointer group" onClick={() => onImageClick(admission.transferCertificateUrl!, 'Transfer Certificate')}>
                                        <div className="aspect-square bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center overflow-hidden relative">
                                            <img src={admission.transferCertificateUrl} alt="TC" className="object-cover w-full h-full" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                        <p className="text-xs text-center mt-1 text-sky-400 group-hover:underline">TC</p>
                                    </div>
                                )}
                                {admission.reportCardUrl && (
                                    <div className="cursor-pointer group" onClick={() => onImageClick(admission.reportCardUrl!, 'Report Card')}>
                                        <div className="aspect-square bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center overflow-hidden relative">
                                            <img src={admission.reportCardUrl} alt="Report Card" className="object-cover w-full h-full" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                        <p className="text-xs text-center mt-1 text-sky-400 group-hover:underline">Report Card</p>
                                    </div>
                                )}
                                {admission.paymentScreenshotUrl && (
                                    <div className="cursor-pointer group" onClick={() => onImageClick(admission.paymentScreenshotUrl!, 'Payment Screenshot')}>
                                        <div className="aspect-square bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center overflow-hidden relative">
                                            <img src={admission.paymentScreenshotUrl} alt="Payment" className="object-cover w-full h-full" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                        <p className="text-xs text-center mt-1 text-sky-400 group-hover:underline">Payment</p>
                                    </div>
                                )}
                            </div>
                            {admission.paymentStatus === 'paid' && (
                                <div className="mt-4 p-3 bg-emerald-950/40 rounded border border-emerald-800">
                                    <p className="font-bold text-emerald-400 text-xs uppercase mb-1">Payment Details</p>
                                    <p className="text-zinc-200">Amount: ₹{admission.paymentAmount}</p>
                                    <p className="text-zinc-200">Txn ID: {admission.paymentTransactionId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg">
                        <h4 className="font-bold text-zinc-300 mb-3">Admin Actions</h4>

                        {admission.status === 'approved' && admission.isEnrolled && (
                            <div className="mb-4 p-3 bg-emerald-950/40 border-l-4 border-emerald-500 rounded-r-lg">
                                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5"/> Student Enrolled
                                </h4>
                                {admission.temporaryStudentId && (
                                    <p className="text-sm font-mono font-bold text-zinc-200 mt-1">
                                        Student ID: {admission.temporaryStudentId}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="font-bold text-zinc-300 text-sm">Update Status:</label>
                                {updatingStatus ? <SpinnerIcon className="w-5 h-5 text-sky-400"/> : (
                                    <select
                                        value={admission.status}
                                        onChange={e => onUpdateStatus(admission.id, e.target.value as any)}
                                        disabled={admission.isEnrolled}
                                        className="form-select text-sm bg-zinc-700 border-zinc-600 text-zinc-100 shadow-sm focus:ring-sky-500 focus:border-sky-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-md"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                )}
                                {!admission.isEnrolled && (admission.status === 'approved' || admission.status === 'reviewed') && (
                                    <button
                                        onClick={() => onEnrollClick(admission)}
                                        className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2 h-auto"
                                    >
                                        Finalize Enrollment
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 border-t border-zinc-700 pt-4">
                                <button
                                    onClick={() => onNavigateToEdit(admission)}
                                    className="btn btn-secondary text-sm flex items-center gap-2"
                                >
                                    <EditIcon className="w-4 h-4" /> Edit Application
                                </button>
                                <button
                                    onClick={() => onNavigateToPayment(admission)}
                                    className="btn btn-secondary text-sm flex items-center gap-2"
                                >
                                    <CurrencyDollarIcon className="w-4 h-4" /> Go to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-zinc-800 border-t border-zinc-700 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
};

const OnlineAdmissionsListPage: React.FC<OnlineAdmissionsListPageProps> = ({ admissions, onUpdateStatus, onDelete, onEnrollStudent, academicYear }) => {
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState<'all' | OnlineAdmission['status']>('all');
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
    const [lightboxImage, setLightboxImage] = useState<{ src: string, alt: string } | null>(null);
    const [selectedAdmission, setSelectedAdmission] = useState<OnlineAdmission | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [enrollingAdmission, setEnrollingAdmission] = useState<OnlineAdmission | null>(null);
    const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false);

    const filteredAdmissions = admissions
        .filter(a => filterStatus === 'all' || a.status === filterStatus)
        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

    const handleStatusChange = async (id: string, newStatus: OnlineAdmission['status']) => {
        setUpdatingStatus(prev => ({ ...prev, [id]: true }));
        await onUpdateStatus(id, newStatus);
        setUpdatingStatus(prev => ({ ...prev, [id]: false }));
        if (selectedAdmission && selectedAdmission.id === id) {
            setSelectedAdmission(prev => prev ? ({ ...prev, status: newStatus }) : null);
        }
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

    const navigateToEdit = (admission: OnlineAdmission) => {
        navigate('/admissions/online', { state: { editingAdmission: admission } });
    };

    const navigateToPayment = (admission: OnlineAdmission) => {
        navigate(`/admissions/payment/${admission.id}`, {
            state: {
                grade: admission.admissionGrade,
                studentName: admission.studentName,
                fatherName: admission.fatherName,
                contact: admission.contactNumber,
                studentType: admission.studentType
            }
        });
    };

    return (
        <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <InboxArrowDownIcon className="w-10 h-10 text-sky-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Online Admissions</h1>
                        <p className="text-zinc-400 mt-1">Review and manage incoming student applications.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'draft', 'pending', 'reviewed', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as any)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                                filterStatus === status
                                    ? 'bg-sky-600 text-white shadow-md'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-zinc-700 rounded-lg">
                    <table className="min-w-full divide-y divide-zinc-700">
                        <thead className="bg-zinc-800">
                            <tr>
                                {['Ref ID', 'Class', 'Student Name', "Father's Name", 'Contact', 'Date', 'Payment', 'Status', 'Actions'].map(col => (
                                    <th key={col} scope="col" className={`px-6 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider ${['Payment', 'Status', 'Actions'].includes(col) ? 'text-center' : 'text-left'}`}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                            {filteredAdmissions.length > 0 ? (
                                filteredAdmissions.map(app => (
                                    <tr key={app.id} className="hover:bg-zinc-800/60 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-400">{app.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-200">{app.admissionGrade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{app.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{app.fatherName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{app.contactNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{formatDateForDisplay(app.submissionDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {app.paymentStatus === 'paid' ? (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-950/60 text-emerald-300">Paid</span>
                                            ) : (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-zinc-700 text-zinc-400">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {getStatusBadge(app.status)}
                                                {app.isEnrolled && <span className="text-[10px] font-bold text-emerald-400">ENROLLED</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedAdmission(app)}
                                                    className="text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-950/60 p-2 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                {!app.isEnrolled && (app.status === 'approved' || app.status === 'reviewed') && (
                                                    <button
                                                        onClick={() => setEnrollingAdmission(app)}
                                                        className="text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/60 p-2 rounded-full transition-colors"
                                                        title="Finalize Enrollment"
                                                    >
                                                        <UserIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => setDeletingId(app.id)}
                                                        className="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/60 p-2 rounded-full transition-colors"
                                                        title="Delete Application"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-zinc-500 text-sm">
                                        No applications found matching the selected filter.
                                    </td>
                                </tr>
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

            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="Delete Application"
                confirmDisabled={isDeleting}
            >
                <p>Are you sure you want to permanently delete this application? This action cannot be undone.</p>
                {isDeleting && <p className="text-sm text-zinc-400 mt-2">Deleting...</p>}
            </ConfirmationModal>
        </>
    );
};

export default OnlineAdmissionsListPage;
