

import React, { useState, useEffect } from 'react';
import { User, Student, StudentClaim } from '../types';
import { formatStudentId, formatDateForDisplay, formatDateForStorage } from '../utils';
import { UserIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './Icons';

interface ParentReviewModalProps {
    user: User;
    students: Student[];
    academicYear: string;
    onClose: () => void;
    onApprove: (studentIds: string[]) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <dt className="text-xs font-semibold text-slate-500 uppercase">{label}</dt>
        <dd className="text-sm text-slate-800">{value || '-'}</dd>
    </div>
);


const ParentReviewModal: React.FC<ParentReviewModalProps> = ({ user, students, academicYear, onClose, onApprove }) => {
    const claims: StudentClaim[] = user.claimedStudents || 
        (user.claimedStudentId ? [{
            studentId: user.claimedStudentId,
            dob: user.claimedDateOfBirth || '',
            fullName: 'Legacy Claim',
            relationship: 'Parent'
        }] : []);

    const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());

    const verificationResults = claims.map(claim => {
        const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === claim.studentId.toLowerCase());
        
        let status: 'match' | 'dob_mismatch' | 'not_found' | 'missing_dob' = 'not_found';
        if (student) {
            // FIX: Normalize both dates to 'YYYY-MM-DD' before comparing to handle different input formats.
            if (claim.dob && student.dateOfBirth && formatDateForStorage(student.dateOfBirth) === formatDateForStorage(claim.dob)) {
                status = 'match';
            } else if (!claim.dob) {
                status = 'missing_dob';
            } else {
                status = 'dob_mismatch';
            }
        }
        return { claim, student, status };
    });
    
    useEffect(() => {
        const matches = verificationResults
            .filter(r => r.status === 'match' && r.student)
            .map(r => r.student!.id);
        setVerifiedIds(new Set(matches));
    }, []);

    const toggleVerification = (studentId: string) => {
        setVerifiedIds(prev => {
            const next = new Set(prev);
            if (next.has(studentId)) next.delete(studentId);
            else next.add(studentId);
            return next;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Review Parent Application</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="bg-slate-50 p-4 rounded-lg border mb-6">
                        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <UserIcon className="w-5 h-5"/> Applicant Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <DetailItem label="Name" value={user.displayName} />
                            <DetailItem label="Email" value={user.email} />
                            {user.registrationDetails && (
                                <>
                                    <DetailItem label="Phone" value={user.registrationDetails.contactNumber} />
                                    <div className="col-span-2"><DetailItem label="Address" value={user.registrationDetails.address} /></div>
                                </>
                            )}
                        </div>
                    </div>

                    <h4 className="font-bold text-slate-700 mb-2">Claimed Students</h4>
                    <div className="space-y-3">
                        {verificationResults.map((result, idx) => (
                            <div key={idx} className={`p-3 border rounded-lg flex items-center justify-between ${
                                result.status === 'match' ? 'bg-emerald-50 border-emerald-200' : 
                                result.status === 'not_found' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div>
                                    <p className="font-semibold text-sm">Claimed ID: {result.claim.studentId}</p>
                                    <p className="text-xs text-slate-600">Claimed Name: {result.claim.fullName} ({result.claim.relationship})</p>
                                    <p className="text-xs text-slate-600">Claimed DOB: {formatDateForDisplay(result.claim.dob)}</p>
                                    
                                    {result.student ? (
                                        <div className="mt-2 text-xs">
                                            <p className="font-bold text-slate-700">Found in Database:</p>
                                            <p>{result.student.name} ({result.student.grade})</p>
                                            <p>DB DOB: {formatDateForDisplay(result.student.dateOfBirth)}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-red-600 font-bold mt-1">Student Not Found in Database</p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {result.status === 'match' && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> Matched</span>}
                                    {result.status === 'dob_mismatch' && <span className="text-xs font-bold text-red-600 flex items-center gap-1"><XCircleIcon className="w-4 h-4"/> DOB Mismatch</span>}
                                    {result.status === 'missing_dob' && <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><ExclamationTriangleIcon className="w-4 h-4"/> Manual Check</span>}

                                    {result.student && (
                                        <label className="flex items-center gap-2 cursor-pointer mt-2 bg-white px-2 py-1 border rounded-md shadow-sm">
                                            <input 
                                                type="checkbox" 
                                                checked={verifiedIds.has(result.student.id)}
                                                onChange={() => toggleVerification(result.student!.id)}
                                                className="form-checkbox text-sky-600 rounded"
                                            />
                                            <span className="text-sm font-semibold">Link</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button 
                        onClick={() => onApprove(Array.from(verifiedIds))}
                        disabled={verifiedIds.size === 0}
                        className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400"
                    >
                        Approve & Link {verifiedIds.size} Student(s)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentReviewModal;