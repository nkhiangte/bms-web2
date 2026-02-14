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
            .filter(r => r.status === 'match' && r