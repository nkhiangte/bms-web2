

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
// FIX: Imported the missing `SubjectDefinition` type to resolve a TypeScript error.
import { Student, Grade, StudentStatus, Gender, Category, BloodGroup, SubjectDefinition } from '../types';
import { createDefaultFeePayments } from '../utils';
import { ArrowUpOnSquareIcon, XIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon, InboxArrowDownIcon } from './Icons';
import { OABC_GRADES } from '../constants';

interface ImportMarksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyImport: (importedData: Record<string, Record<string, number | string | null>>) => void;
    classStudents: Student[];
    subjectDefinitions: SubjectDefinition[];
    examName: string;
    hasActivities: boolean;
    isSaving: boolean;
}

type ParsedRow = {
    rollNo: number;
    studentName: string;
    studentId: string;
    marks: Record<string, number | string | null>;
    errors: string[];
};

export const ImportMarksModal: React.FC<ImportMarksModalProps> = ({ isOpen, onClose, onApplyImport, classStudents, subjectDefinitions, examName, hasActivities, isSaving }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [parseError, setParseError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const resetState = useCallback(() => {
        setFile(null);
        setParsedData([]);
        setParseError('');
        setIsProcessing(false);
    }, []);

    const subjectHeaders = useMemo(() => {
        const headers: { key: string, label: string, subjectName: string, type: 'exam' | 'activity' | 'total' | 'grade' }[] = [];
        subjectDefinitions.forEach(sd => {
            if (sd.gradingSystem === 'OABC') {
                headers.push({ key: sd.name, label: `${sd.name} (Grade)`, subjectName: sd.name, type: 'grade' });
            } else if (hasActivities) {
                headers.push({ key: sd.name + '_exam', label: `${sd.name} (Exam)`, subjectName: sd.name, type: 'exam' });
                headers.push({ key: sd.name + '_activity', label: `${sd.name} (Activity)`, subjectName: sd.name, type: 'activity' });
            } else {
                headers.push({ key: sd.name, label: sd.name, subjectName: sd.name, type: 'total' });
            }
        });
        return headers;
    }, [subjectDefinitions, hasActivities]);

    const handleDownloadTemplate = () => {
        const headers = ['Roll No', 'Student Name', ...subjectHeaders.map(h => h.label)];
        const data = classStudents.map(s => [s.rollNo, s.name]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Entry');
        XLSX.writeFile(workbook, `Marks_Template_${classStudents[0]?.grade}_${examName.replace(/\s+/g, '_')}.xlsx`);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setParseError('');
        setParsedData([]);
        setIsProcessing(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            const headerRow = json[0] || [];
            // FIX: Explicitly typed the Map to ensure correct type inference for its values.
            const studentMapByRoll = new Map<number, Student>(classStudents.map(s => [s.rollNo, s]));
            
            const expectedHeaders = ['Roll No', 'Student Name', ...subjectHeaders.map(h => h.label)];
            const isHeaderValid = expectedHeaders.every((h, i) => String(headerRow[i]).trim() === h);

            if (!isHeaderValid) {
                setParseError("File headers do not match the template. Please download the template and try again.");
                setIsProcessing(false);
                return;
            }

            const newParsedData: ParsedRow[] = [];

            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0 || row.every(cell => cell === null || String(cell).trim() === '')) continue;

                const rollNo = parseInt(String(row[0]), 10);
                const student: Student | undefined = studentMapByRoll.get(rollNo);
                const errors: string[] = [];
                const marks: Record<string, number | string | null> = {};

                if (!student) {
                    errors.push(`Roll No ${rollNo} not found in this class.`);
                }
                
                subjectHeaders.forEach((headerInfo, index) => {
                    const cellIndex = index + 2; // +2 to account for Roll No and Name columns
                    const value = row[cellIndex];

                    if (value === null || String(value).trim() === '') {
                        marks[headerInfo.key] = null;
                        return;
                    }

                    const subjectDef = subjectDefinitions.find(sd => sd.name === headerInfo.subjectName)!;
                    
                    if (headerInfo.type === 'grade') {
                        const gradeValue = String(value).toUpperCase();
                        if (OABC_GRADES.includes(gradeValue as any)) {
                            marks[headerInfo.key] = gradeValue;
                        } else {
                            errors.push(`Invalid grade "${value}" for ${headerInfo.subjectName}.`);
                        }
                    } else {
                        const numValue = parseInt(String(value), 10);
                        if (isNaN(numValue)) {
                            errors.push(`Non-numeric mark "${value}" for ${headerInfo.label}.`);
                            return;
                        }
                        
                        let maxMarks = 0;
                        if(headerInfo.type === 'exam') maxMarks = subjectDef.examFullMarks;
                        else if(headerInfo.type === 'activity') maxMarks = subjectDef.activityFullMarks;
                        else maxMarks = subjectDef.examFullMarks;

                        if (numValue < 0 || numValue > maxMarks) {
                            errors.push(`Mark ${numValue} for ${headerInfo.label} is out of range (0-${maxMarks}).`);
                        } else {
                            marks[headerInfo.key] = numValue;
                        }
                    }
                });

                newParsedData.push({
                    rollNo: rollNo,
                    studentName: student?.name || String(row[1] || 'Unknown'),
                    studentId: student?.id || 'N/A',
                    marks,
                    errors,
                });
            }
            setParsedData(newParsedData);
        } catch (err) {
            console.error(err);
            setParseError('Failed to process the file. Please ensure it is a valid CSV or Excel file.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleApply = () => {
        const validData = parsedData.filter(p => p.errors.length === 0 && p.studentId !== 'N/A');
        const dataToImport: Record<string, Record<string, number | string | null>> = {};

        validData.forEach(row => {
            dataToImport[row.studentId] = row.marks;
        });

        if(Object.keys(dataToImport).length > 0) {
            onApplyImport(dataToImport);
            onClose();
        } else {
            setParseError("No valid data to import. Please check the errors.");
        }
    };

    const hasErrors = parsedData.some(p => p.errors.length > 0);
    const validCount = parsedData.filter(p => p.errors.length === 0).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Import Marks</h2>
                    <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <div className="p-4 bg-slate-50 border rounded-lg space-y-3">
                        <h3 className="font-bold text-slate-800">Instructions</h3>
                        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                            <li><button onClick={handleDownloadTemplate} className="text-sky-600 font-semibold hover:underline inline-flex items-center gap-1"><InboxArrowDownIcon className="w-4 h-4"/> Download the marks entry template for this class.</button></li>
                            <li>Fill in the student marks. Do not change the 'Roll No' or 'Student Name' columns.</li>
                            <li>Upload the completed file. The system will validate the marks before importing.</li>
                        </ol>
                    </div>

                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-bold text-slate-800">Upload File</label>
                        <input type="file" id="file-upload" onChange={handleFileChange} disabled={isProcessing} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50"/>
                    </div>
                    
                    {parseError && <p className="text-red-600 font-semibold">{parseError}</p>}
                    
                    {(isProcessing || parsedData.length > 0) && (
                        <div className="mt-4">
                            <h3 className="font-bold text-slate-800 mb-2">Validation Preview</h3>
                            {isProcessing ? (
                                <div className="flex items-center justify-center gap-2 p-8"><SpinnerIcon className="w-6 h-6"/><span>Processing file...</span></div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-100 sticky top-0"><tr className="text-left"><th className="p-2">Roll</th><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2">Errors</th></tr></thead>
                                        <tbody className="divide-y">
                                            {parsedData.map((s, i) => (
                                                <tr key={i} className={s.errors.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}>
                                                    <td className="p-2 font-mono">{s.rollNo}</td>
                                                    <td className="p-2 font-semibold">{s.studentName}</td>
                                                    <td className="p-2">{s.errors.length > 0 ? <XCircleIcon className="w-5 h-5 text-red-500"/> : <CheckCircleIcon className="w-5 h-5 text-emerald-500"/>}</td>
                                                    <td className="p-2 text-red-700 text-xs">{s.errors.join(', ')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center rounded-b-xl border-t">
                    <div>
                        {parsedData.length > 0 && (
                            <span className={`font-semibold ${hasErrors ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {validCount} of {parsedData.length} records are valid.
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="button" onClick={handleApply} className="btn btn-primary" disabled={isSaving || isProcessing || hasErrors || parsedData.length === 0 || validCount === 0}>
                            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <ArrowUpOnSquareIcon className="w-5 h-5"/>}
                            {isSaving ? 'Applying...' : `Apply ${validCount} Records`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};