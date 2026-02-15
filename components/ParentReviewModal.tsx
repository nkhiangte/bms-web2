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


export const ParentReviewModal: React.FC<ParentReviewModalProps> = ({ user, students, academicYear, onClose, onApprove }) => {
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
    }, [verificationResults]);

    const handleApprove = () => {
        onApprove(Array.from(verifiedIds));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-slate-800">Review Parent Account Request</h3>
                    <p className="text-sm text-slate-600">Approve claims for: <span className="font-semibold">{user.displayName}</span></p>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {verificationResults.map(({ claim, student, status }, index) => (
                        <div key={index} className="p-4 border rounded-lg flex items-start gap-4">
                            <div className="mt-1">
                                {status === 'match' && <CheckCircleIcon className="w-6 h-6 text-emerald-500"/>}
                                {status === 'dob_mismatch' && <ExclamationTriangleIcon className="w-6 h-6 text-amber-500"/>}
                                {status === 'not_found' && <XCircleIcon className="w-6 h-6 text-red-500"/>}
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-800">{claim.fullName} (Claimed)</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                                    <DetailItem label="Claimed Student ID" value={claim.studentId} />
                                    <DetailItem label="Claimed DOB" value={formatDateForDisplay(claim.dob)} />
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    {status === 'match' && student && (
                                        <>
                                            <p className="font-semibold text-emerald-700 mb-2">✅ Match Found</p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <DetailItem label="Student Name" value={student.name} />
                                                <DetailItem label="Database DOB" value={formatDateForDisplay(student.dateOfBirth)} />
                                            </div>
                                        </>
                                    )}
                                     {status === 'dob_mismatch' && student && (
                                        <>
                                            <p className="font-semibold text-amber-700 mb-2">⚠️ DOB Mismatch</p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <DetailItem label="Student Name Found" value={student.name} />
                                                <DetailItem label="Database DOB" value={formatDateForDisplay(student.dateOfBirth)} />
                                            </div>
                                        </>
                                    )}
                                    {status === 'not_found' && (
                                        <p className="font-semibold text-red-700">❌ Student ID not found in database.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button 
                        onClick={handleApprove} 
                        className="btn btn-primary"
                        disabled={verifiedIds.size === 0}
                    >
                        Approve & Link {verifiedIds.size} Student(s)
                    </button>
                </div>
            </div>
        </div>
    );
};