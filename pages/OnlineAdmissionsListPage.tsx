import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OnlineAdmission, Grade } from '../types';
import { BackIcon, HomeIcon, InboxArrowDownIcon, ChevronDownIcon, SpinnerIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';
import { GRADES_LIST } from '../constants';
import * as XLSX from 'xlsx';

interface OnlineAdmissionsListPageProps {
    admissions: OnlineAdmission[];
    onUpdateStatus: (id: string, status: OnlineAdmission['status']) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-600">{label}</dt>
        <dd className="mt-1 text-md text-slate-900">{value || <span className="italic text-slate-500">Not provided</span>}</dd>
    </div>
);

const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl">&times;</button>
        <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] rounded-lg" onClick={e => e.stopPropagation()} />
    </div>
);

const OnlineAdmissionsListPage: React.FC<OnlineAdmissionsListPageProps> = ({ admissions, onUpdateStatus }) => {
    const navigate = useNavigate();
    const [activeFilters, setActiveFilters] = useState({ status: '', grade: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredAdmissions = useMemo(() => {
        return admissions
            .filter(a => activeFilters.status ? a.status === activeFilters.status : true)
            .filter(a => activeFilters.grade ? a.admissionGrade === activeFilters.grade : true)
            .filter(a => searchTerm ? a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) : true)
            .sort((a, b) => b.submissionDate.localeCompare(a.submissionDate));
    }, [admissions, activeFilters, searchTerm]);
    
    const getStatusStyles = (status: OnlineAdmission['status']) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800';
            case 'reviewed': return 'bg-sky-100 text-sky-800';
            case 'approved': return 'bg-emerald-100 text-emerald-800';
            case 'rejected': return 'bg-rose-100 text-rose-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const handleStatusChange = async (id: string, status: OnlineAdmission['status']) => {
        setUpdatingStatus(prev => ({ ...prev, [id]: true }));
        await onUpdateStatus(id, status);
        setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    };

    const handleExportExcel = () => {
        if (filteredAdmissions.length === 0) {
            alert("No data to export.");
            return;
        }

        const dataToExport = filteredAdmissions.map(app => ({
            "Student Name": app.studentName,
            "Grade Applied": app.admissionGrade,
            "Status": app.status,
            "Date of Birth": formatDateForDisplay(app.dateOfBirth),
            "Gender": app.gender,
            "Father's Name": app.fatherName,
            "Mother's Name": app.motherName,
            "Contact": app.contactNumber,
            "Address": app.presentAddress,
            "Last School": app.lastSchoolAttended || 'N/A',
            "Payment Status": app.paymentStatus || 'Pending',
            "Payment Amount": app.paymentAmount || 0,
            "Transaction ID": app.paymentTransactionId || 'N/A',
            "Submission Date": new Date(app.submissionDate).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admissions");
        
        // Generate filename based on filters
        let filename = "Online_Admissions";
        if (activeFilters.grade) filename += `_${activeFilters.grade}`;
        if (activeFilters.status) filename += `_${activeFilters.status}`;
        filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

        XLSX.writeFile(workbook, filename);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5"/> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                        <HomeIcon className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <InboxArrowDownIcon className="w-10 h-10 text-violet-600"/>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Online Admission Applications</h1>
                        <p className="text-slate-600 mt-1">Review and process new student applications.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-lg flex flex-col md:flex-row items-center gap-4 mb-6">
                    <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input flex-grow w-full md:w-auto"/>
                    <select name="status" value={activeFilters.status} onChange={handleFilterChange} className="form-select w-full md:w-auto">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select name="grade" value={activeFilters.grade} onChange={handleFilterChange} className="form-select w-full md:w-auto">
                        <option value="">All Classes</option>
                        {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button 
                        onClick={handleExportExcel}
                        className="btn btn-secondary w-full md:w-auto whitespace-nowrap"
                        disabled={filteredAdmissions.length === 0}
                    >
                        Export to Excel
                    </button>
                </div>

                <div className="space-y-3">
                    {filteredAdmissions.length > 0 ? filteredAdmissions.map(app => {
                        const isExpanded = expandedId === app.id;
                        return (
                            <div key={app.id} className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                                <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800">{app.studentName}</p>
                                        <p className="text-sm text-slate-600">Applied for: {app.admissionGrade}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-slate-500 hidden sm:inline">{new Date(app.submissionDate).toLocaleDateString()}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(app.status)}`}>{app.status}</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="p-6 bg-white space-y-6 border-t animate-fade-in">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <DetailItem label="Application Ref. ID" value={app.id} />
                                            <DetailItem label="Date of Birth" value={formatDateForDisplay(app.dateOfBirth)} />
                                            <DetailItem label="Gender" value={app.gender} />
                                            <DetailItem label="Contact" value={app.contactNumber} />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <DetailItem label="Father's Name" value={app.fatherName} />
                                            <DetailItem label="Mother's Name" value={app.motherName} />
                                            <DetailItem label="Aadhaar (Student)" value={app.studentAadhaar} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <DetailItem label="Permanent Address" value={app.permanentAddress} />
                                            <DetailItem label="Present Address" value={app.presentAddress} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <DetailItem label="Last School" value={app.lastSchoolAttended} />
                                            <DetailItem label="CWSN" value={app.isCWSN} />
                                            <DetailItem label="Behaviour" value={app.generalBehaviour} />
                                            <DetailItem label="Siblings in School" value={app.siblingsInSchool} />
                                        </div>
                                        <div><DetailItem label="Health Issues" value={app.healthIssues} /></div>
                                        <div><DetailItem label="Achievements" value={app.achievements} /></div>
                                        
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 mb-2">Uploaded Documents</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {app.birthCertificateUrl && <a href={app.birthCertificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">Birth Certificate</a>}
                                                {app.transferCertificateUrl && <a href={app.transferCertificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">Transfer Certificate</a>}
                                                {app.reportCardUrl && <a href={app.reportCardUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">Report Card</a>}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 mb-2">Payment Details</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                                 <DetailItem label="Status" value={app.paymentStatus} />
                                                 <DetailItem label="Amount" value={app.paymentAmount ? `₹${app.paymentAmount}` : '0'} />
                                                 <DetailItem label="Transaction ID" value={app.paymentTransactionId} />
                                            </div>
                                            {app.paymentScreenshotUrl ? (
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold text-slate-600 mb-1">Screenshot:</p>
                                                    <img 
                                                        src={app.paymentScreenshotUrl} 
                                                        alt="Payment Screenshot" 
                                                        className="w-48 h-auto rounded-lg border cursor-pointer hover:opacity-90" 
                                                        onClick={() => setLightboxImage({ src: app.paymentScreenshotUrl!, alt: "Payment Screenshot" })}
                                                    />
                                                </div>
                                            ) : <p className="text-slate-500 italic text-sm">Screenshot not uploaded.</p>}
                                        </div>

                                        {app.status === 'approved' && app.temporaryStudentId && (
                                            <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                                                <h4 className="font-bold text-emerald-800">Temporary Student ID Generated</h4>
                                                <p className="font-mono text-lg font-bold text-slate-800 bg-white inline-block px-3 py-1 rounded mt-1">
                                                    {app.temporaryStudentId}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-1">Please provide this ID to the parent/guardian to complete payment.</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 -mx-6 -mb-6 p-6">
                                            <label className="font-bold text-slate-800">Update Application Status:</label>
                                            <div className="flex items-center gap-2">
                                                {updatingStatus[app.id] ? <SpinnerIcon className="w-5 h-5"/> : (
                                                    <select 
                                                        value={app.status} 
                                                        onChange={e => handleStatusChange(app.id, e.target.value as any)} 
                                                        className="form-select border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="reviewed">Reviewed</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 italic">Changing status updates the record immediately.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <p className="text-center py-10 text-slate-600 border-2 border-dashed rounded-lg">No applications match the current filters.</p>
                    )}
                </div>
            </div>
            {lightboxImage && <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}
        </>
    );
};

export default OnlineAdmissionsListPage;
