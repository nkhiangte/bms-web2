import React, { useState } from 'react';
import { StudentClaim } from '../types';
import { SpinnerIcon } from './Icons';

const RELATIONSHIPS = ['Mother', 'Father', 'Legal Guardian', 'Grandparent', 'Other'];

interface LinkChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (claim: StudentClaim) => Promise<void>;
    parentRelationship: string;
}

const LinkChildModal: React.FC<LinkChildModalProps> = ({ isOpen, onClose, onSubmit, parentRelationship }) => {
    const [claim, setClaim] = useState<StudentClaim>({
        fullName: '',
        studentId: '',
        dob: '',
        relationship: parentRelationship || 'Parent',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof StudentClaim, value: string) => {
        setClaim(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claim.fullName || !claim.studentId || !claim.dob) {
            alert("Please fill all fields.");
            return;
        }
        setIsSubmitting(true);
        await onSubmit(claim);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-slate-800">Link Another Child</h3>
                        <p className="text-sm text-slate-600 mt-1">Enter your child's details for verification. This request will be sent to the school administration for approval.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700">Child's Full Name</label>
                            <input type="text" value={claim.fullName} onChange={e => handleChange('fullName', e.target.value)} className="mt-1 form-input w-full" placeholder="As per school records" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700">Child's Student ID</label>
                            <input type="text" value={claim.studentId} onChange={e => handleChange('studentId', e.target.value.toUpperCase())} className="mt-1 form-input w-full" placeholder="e.g., BMS240101" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700">Child's Date of Birth</label>
                            <input type="date" value={claim.dob} onChange={e => handleChange('dob', e.target.value)} className="mt-1 form-input w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700">Your Relationship to Child</label>
                            <select value={claim.relationship} onChange={e => handleChange('relationship', e.target.value)} className="mt-1 form-select w-full" required>
                                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : null}
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LinkChildModal;