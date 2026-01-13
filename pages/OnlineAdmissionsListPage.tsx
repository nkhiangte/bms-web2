import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OnlineAdmission, Grade } from '../types';
import { BackIcon, HomeIcon, InboxArrowDownIcon, ChevronDownIcon, SpinnerIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';
import { GRADES_LIST } from '../constants';

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

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <InboxArrowDownIcon className="w-10 h-10 text-violet-600"/>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Online Admission Applications</h1>
                        <p className="text-slate-600 mt-1">Review and process new student applications.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-center gap-4">
                    <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input flex-grow w-full sm:w-auto"/>
                    <select name="status" value={activeFilters.status} onChange={handleFilterChange} className="form-select w-full sm:w-auto">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select name="grade" value={activeFilters.grade} onChange={handleFilterChange} className="form-select w-full sm:w-auto">
                        <option value="">All Classes</option>
                        {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className="mt-6 space-y-3">
                    {filteredAdmissions.length > 0 ? filteredAdmissions.map(app => {
                        const isExpanded = expandedId === app.id;
                        return (
                            <div key={app.id} className="border rounded-lg overflow-hidden">
                                <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100">
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800">{app.studentName}</p>
                                        <p className="text-sm text-slate-600">Applied for: {app.admissionGrade}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-slate-500">{new Date(app.submissionDate).toLocaleDateString()}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(app.status)}`}>{app.status}</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="p-6 bg-white space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <DetailItem label="Date of Birth" value={formatDateForDisplay(app.dateOfBirth)} />
                                            <DetailItem label="Gender" value={app.gender} />
                                            <DetailItem label="Aadhaar" value={app.studentAadhaar} />
                                            <DetailItem label="Contact" value={app.contactNumber} />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <DetailItem label="Father's Name" value={app.fatherName} />
                                            <DetailItem label="Mother's Name" value={app.motherName} />
                                            <DetailItem label="Parent's Aadhaar" value={app.parentAadhaar} />
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
                                            <h4 className="text-sm font-bold text-slate-800 mb-2">Payment Screenshot</h4>
                                            {app.paymentScreenshotUrl ? (
                                                <img 
                                                    src={app.paymentScreenshotUrl} 
                                                    alt="Payment Screenshot" 
                                                    className="w-48 h-auto rounded-lg border cursor-pointer" 
                                                    onClick={() => setLightboxImage({ src: app.paymentScreenshotUrl, alt: "Payment Screenshot" })}
                                                />
                                            ) : <p className="text-slate-500 italic">Not uploaded.</p>}
                                        </div>

                                        <div className="pt-4 border-t flex items-center gap-4">
                                            <label className="font-bold text-slate-800">Update Status:</label>
                                            {updatingStatus[app.id] ? <SpinnerIcon className="w-5 h-5"/> : (
                                                <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value as any)} className="form-select">
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewed">Reviewed</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <p className="text-center py-10 text-slate-600">No applications match the current filters.</p>
                    )}
                </div>
            </div>
            {lightboxImage && <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}
        </>
    );
};

export default OnlineAdmissionsListPage;