




import React from 'react';
import { SubjectMark, SubjectDefinition, Grade } from '../types';
import { GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';

interface AcademicRecordTableProps {
    examName: string;
    examId: string;
    academicYear: string;
    results: SubjectMark[];
    isEditing: boolean;
    onUpdate: (newResults: SubjectMark[]) => void;
    subjectDefinitions: SubjectDefinition[];
    grade: Grade;
    onOpenActivityLog: (subjectName: string) => void;
}

const AcademicRecordTable: React.FC<AcademicRecordTableProps> = ({ examName, examId, results, isEditing, onUpdate, subjectDefinitions, grade, onOpenActivityLog }) => {

    const handleMarkChange = (subjectName: string, field: 'marks' | 'examMarks' | 'grade', value: string) => {
        const newResults = results.map(r => {
            if (r.subject === subjectName) {
                if (field === 'grade') {
                    // Ensure the 'grade' property conforms to the SubjectMark type.
                    // An empty string from the select should result in an undefined grade.
                    return { ...r, grade: value ? (value as 'O' | 'A' | 'B' | 'C') : undefined };
                }

                // Allow only digits or an empty string. This prevents non-numeric characters and handles clearing the input.
                if (!/^\d*$/.test(value)) {
                    return r; // Ignore invalid input
                }

                if (value === '') {
                    return { ...r, [field]: null };
                }
                
                const numValue = parseInt(value, 10);
                if (isNaN(numValue)) {
                    // This check is now redundant due to regex but kept for safety.
                    return r;
                }

                const subjectDef = subjectDefinitions.find(sd => sd.name === subjectName);
                if (!subjectDef) return r; // Should not happen

                let maxMarks = 100; // Default
                if (field === 'examMarks') maxMarks = subjectDef.examFullMarks;
                else if (field === 'marks') maxMarks = subjectDef.examFullMarks;

                // Clamp value between 0 and maxMarks
                const clampedValue = Math.max(0, Math.min(numValue, maxMarks));

                return { ...r, [field]: clampedValue };
            }
            return r;
        });
        onUpdate(newResults);
    };
    
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);

    return (
        <div className="border rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold text-slate-800 p-4 bg-slate-50 border-b">{examName}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                     <thead className="bg-slate-100 text-xs uppercase text-slate-600 font-bold">
                        {hasActivities ? (
                            <tr>
                                <th className="px-4 py-2 text-left align-middle">Subject</th>
                                <th className="px-4 py-2 text-center align-middle border-l">Summative FM</th>
                                <th className="px-4 py-2 text-center align-middle border-l">Summative Obt.</th>
                                <th className="px-4 py-2 text-center align-middle border-l">Activity FM</th>
                                <th className="px-4 py-2 text-center align-middle border-l">Activity Obt.</th>
                                <th className="px-4 py-2 text-center align-middle border-l">Total Marks</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Subject</th>
                                <th className="px-4 py-2 text-center text-xs font-bold text-slate-600 uppercase">Full Marks</th>
                                <th className="px-4 py-2 text-center text-xs font-bold text-slate-600 uppercase">Marks Obtained</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {subjectDefinitions.map(subjectDef => {
                            const result = results.find(r => r.subject === subjectDef.name) || { subject: subjectDef.name };
                            const isOABC = subjectDef.gradingSystem === 'OABC';
                           
                            if (hasActivities) {
                                 // FIX: Default null/undefined marks to 0 before arithmetic operation to prevent TypeError.
                                 const examMarks = result?.examMarks ?? 0;
                                 const activityMarks = result?.activityMarks ?? 0;
                                 const totalMarks = examMarks + activityMarks;
                                 return (
                                    <tr key={subjectDef.name}>
                                        <td className="px-4 py-2 font-semibold text-slate-800">{subjectDef.name}</td>
                                        {isOABC ? (
                                            <td colSpan={5} className="px-4 py-2 text-center">
                                                {isEditing ? (
                                                    <select value={result.grade ?? ''} onChange={e => handleMarkChange(subjectDef.name, 'grade', e.target.value)} className="form-select w-24 text-center">
                                                        <option value="">--</option>
                                                        {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                    </select>
                                                ) : (
                                                    <span className="font-bold text-lg text-sky-700">{result.grade || 'N/A'}</span>
                                                )}
                                            </td>
                                        ) : (
                                            <>
                                                <td className="px-4 py-2 text-center font-semibold text-slate-700">{subjectDef.examFullMarks}</td>
                                                <td className="px-4 py-2 text-center">
                                                    {isEditing ? (
                                                        <input type="tel" pattern="[0-9]*" value={result.examMarks ?? ''} onChange={e => handleMarkChange(subjectDef.name, 'examMarks', e.target.value)} className="form-input w-24 text-center" max={subjectDef.examFullMarks} />
                                                    ) : result.examMarks}
                                                </td>
                                                <td className="px-4 py-2 text-center font-semibold text-slate-700">{subjectDef.activityFullMarks}</td>
                                                <td className="px-4 py-2 text-center">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-semibold">{activityMarks}</span>
                                                            <button type="button" onClick={() => onOpenActivityLog(subjectDef.name)} className="text-xs btn btn-secondary !p-1" title="Edit activity log">Edit Log</button>
                                                        </div>
                                                    ) : activityMarks}
                                                </td>
                                                <td className="px-4 py-2 text-center font-bold text-lg text-sky-700">{totalMarks}</td>
                                            </>
                                        )}
                                    </tr>
                                );
                            }
                            
                            // Logic for grades without activities (Nursery, KG, I, II, IX, X)
                            const marksObtained = result?.marks || 0;
                            const fullMarks = subjectDef.examFullMarks;

                            return (
                                <tr key={subjectDef.name}>
                                    <td className="px-4 py-2 font-semibold text-slate-800">{subjectDef.name}</td>
                                    <td className="px-4 py-2 text-center font-semibold text-slate-700">{isOABC ? 'Graded' : fullMarks}</td>
                                    <td className="px-4 py-2 text-center">
                                        {isOABC ? (
                                            isEditing ? (
                                                <select value={result.grade ?? ''} onChange={e => handleMarkChange(subjectDef.name, 'grade', e.target.value)} className="form-select w-24 text-center">
                                                    <option value="">--</option>
                                                    {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            ) : (
                                                <span className="font-bold text-lg text-sky-700">{result.grade || 'N/A'}</span>
                                            )
                                        ) : (
                                            isEditing ? (
                                                 <input type="tel" pattern="[0-9]*" value={result.marks ?? ''} onChange={e => handleMarkChange(subjectDef.name, 'marks', e.target.value)} className="form-input w-24 text-center" max={fullMarks} />
                                            ) : (
                                                 <span className="font-bold text-lg text-sky-700">{marksObtained}</span>
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AcademicRecordTable;