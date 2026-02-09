import React, { useState, useEffect } from 'react';
import { OnlineAdmission, Grade, Student, StudentStatus, Gender, Category, BloodGroup } from '../types';
import { GRADES_LIST } from '../constants';
import { XIcon, CheckCircleIcon, SpinnerIcon, UserIcon } from './Icons';
import { createDefaultFeePayments, formatStudentId } from '../utils';

interface EnrollStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnroll: (studentData: Omit<Student, 'id'>) => Promise<void>;
    admission: OnlineAdmission;
    academicYear: string;
    isProcessing: boolean;
}

const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({ isOpen, onClose, onEnroll, admission, academicYear, isProcessing }) => {
    const [rollNo, setRollNo] = useState<number>(1);
    const [targetGrade, setTargetGrade] = useState<Grade>(admission.admissionGrade as Grade);
    const [customStudentId, setCustomStudentId] = useState('');
    
    // Auto-update student ID suggestion when roll or grade changes
    useEffect(() => {
        if (isOpen) {
            // We use a dummy object to leverage the format utility
            const tempStudent = { 
                grade: targetGrade, 
                rollNo: rollNo 
            } as any;
            
            // For 2026-2027, academicYear should be "2026-2027"
            // The utility will produce BMS26...
            const suggestedId = formatStudentId(tempStudent, academicYear);
            setCustomStudentId(suggestedId);
        }
    }, [isOpen, targetGrade, rollNo, academicYear]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const studentData: Omit<Student, 'id'> = {
            rollNo: rollNo,
            name: admission.studentName,
            grade: targetGrade,
            studentId: customStudentId, 
            contact: admission.contactNumber,
            dateOfBirth: admission.dateOfBirth,
            gender: (admission.gender as Gender) || Gender.MALE,
            address: admission.permanentAddress,
            aadhaarNumber: admission.studentAadhaar,
            pen: admission.penNumber || '',
            category: (admission.category as Category) || Category.GENERAL,
            religion: admission.religion || '',
            bloodGroup: (admission.bloodGroup as BloodGroup) || undefined,
            cwsn: admission.cwsn || 'No',
            fatherName: admission.fatherName,
            fatherOccupation: admission.fatherOccupation || '',
            fatherAadhaar: admission.parentAadhaar || '',
            motherName: admission.motherName,
            motherOccupation: admission.motherOccupation || '',
            motherAadhaar: '',
            guardianName: admission.guardianName || '',
            guardianRelationship: admission.guardianRelationship || '',
            lastSchoolAttended: admission.lastSchoolAttended || '',
            healthConditions: admission.healthIssues || '',
            achievements: admission.achievements || '',
            status: StudentStatus.ACTIVE,
            photographUrl: '', 
            feePayments: createDefaultFeePayments(),
            academicPerformance: [],
            academicYear: academicYear
        };

        await onEnroll(studentData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-600"/>
                        Finalize Enrollment
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border shadow-sm flex-shrink-0">
                                <UserIcon className="w-7 h-7 text-sky-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{admission.studentName}</p>
                                <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Ref: {admission.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Grade</label>
                                <select 
                                    value={targetGrade} 
                                    onChange={e => setTargetGrade(e.target.value as Grade)}
                                    className="form-select w-full"
                                    required
                                >
                                    {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Roll Number</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={rollNo}
                                    onChange={e => setRollNo(parseInt(e.target.value) || 1)}
                                    className="form-input w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Permanent Student ID</label>
                            <input 
                                type="text" 
                                value={customStudentId}
                                onChange={e => setCustomStudentId(e.target.value.toUpperCase())}
                                className="form-input w-full font-mono text-lg tracking-wider"
                                placeholder="BMS26XXXX"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">Suggested based on pattern: <strong>BMS{academicYear.substring(2, 4)}[ClassCode][Roll]</strong></p>
                        </div>

                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                            <strong>Note:</strong> Enrollment will create a student record for the <strong>{academicYear}</strong> session. This action cannot be reversed from this screen.
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isProcessing}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400" disabled={isProcessing}>
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
                            <span>{isProcessing ? 'Enrolling...' : 'Finalize & Enroll'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollStudentModal;