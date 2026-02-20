


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Student, Grade, StudentStatus, Gender, Category, BloodGroup } from '../types';
import { createDefaultFeePayments } from '../utils';
import { ArrowUpOnSquareIcon, XIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon, InboxArrowDownIcon } from './Icons';
import { GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../constants';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Omit<Student, 'id'>[], grade: Grade) => void;
    grade: Grade | null;
    allStudents: Student[];
    allGrades: Grade[];
    isImporting: boolean;
    academicYear: string;
}

type ParsedStudent = Omit<Student, 'id'> & { errors: string[] };

// These headers must match the template exactly
const CSV_HEADERS = [
    'Roll No', 'Name', "Date of birth", 'Gender', 'Aadhaar No', "Father's name", "Mother's name", 
    "Father's Occupation", "Mother's Occupation", "Father's Aadhaar", "Mother's Aadhaar", 
    "Guardian's name", 'Address', 'Contact No', 'PEN', 'Category', 'Religion', 
    'CWSN (Yes/No)', 'Blood Group', 'Last School Attended', 'Health Issues', 'Achievements'
];


export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({ isOpen, onClose, onImport, grade, allStudents, allGrades, isImporting, academicYear }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
    const [parseError, setParseError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');

    const targetGrade = useMemo(() => grade || selectedGrade, [grade, selectedGrade]);

    const resetState = useCallback(() => {
        setFile(null);
        setParsedStudents([]);
        setParseError('');
        setIsProcessing(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSelectedGrade(grade || '');
        } else {
            resetState();
        }
    }, [isOpen, grade, resetState]);

    const existingStudentsInGrade = useMemo(() => {
        if (!targetGrade) return [];
        return allStudents.filter(s => s.grade === targetGrade);
    }, [allStudents, targetGrade]);

    const validateValue = (value: any, type: 'string' | 'number' | 'gender' | 'category' | 'blood' | 'yesno') => {
        const str = String(value || '').trim();
        if (type === 'string') return str;
        if (type === 'number') return parseInt(str, 10) || 0;
        if (type === 'gender') {
            const lower = str.toLowerCase();
            if (lower.startsWith('m')) return Gender.MALE;
            if (lower.startsWith('f')) return Gender.FEMALE;
            return Gender.OTHER;
        }
        if (type === 'category') {
            const upper = str.toUpperCase();
            if (CATEGORY_LIST.includes(upper as Category)) return upper as Category;
            return Category.GENERAL;
        }
        if (type === 'blood') {
            const formatted = str.replace(' ', '').toUpperCase();
            if (BLOOD_GROUP_LIST.includes(formatted as BloodGroup)) return formatted as BloodGroup;
            return undefined;
        }
        if (type === 'yesno') {
            return str.toLowerCase() === 'yes' ? 'Yes' : 'No';
        }
        return str;
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile || !targetGrade) {
            if(!targetGrade) setParseError("Please select a grade first.");
            return;
        };

        setFile(selectedFile);
        setParseError('');
        setParsedStudents([]);
        setIsProcessing(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

            const headerRow = json[0] || [];
            const isHeaderValid = CSV_HEADERS.every((h, i) => String(headerRow[i]).trim() === h);
            if(!isHeaderValid){
                setParseError("CSV headers do not match the template. Please download the template and try again.");
                setIsProcessing(false);
                return;
            }
            
            const rows = json.slice(1);
            const newParsedStudents: ParsedStudent[] = [];
            const newRollNos = new Set<number>();

            rows.forEach((row, index) => {
                if (!row || row.length === 0 || row.every(cell => String(cell).trim() === '')) return;

                const errors: string[] = [];
                const rollNoVal = parseInt(String(row[0]), 10);
                if (isNaN(rollNoVal) || rollNoVal <= 0) {
                    errors.push(`Invalid Roll No.`);
                } else {
                    if (existingStudentsInGrade.some(s => s.rollNo === rollNoVal)) errors.push(`Roll No ${rollNoVal} already exists.`);
                    if (newRollNos.has(rollNoVal)) errors.push(`Duplicate Roll No ${rollNoVal} in this file.`);
                    newRollNos.add(rollNoVal);
                }

                const name = validateValue(row[1], 'string');
                if (!name) errors.push(`Name is required.`);

                const studentData: Omit<Student, 'id'> = {
                    rollNo: rollNoVal,
                    name: name as string,
                    grade: targetGrade as Grade,
                    status: StudentStatus.ACTIVE,
                    feePayments: createDefaultFeePayments(),
                    academicPerformance: [], 
                    dateOfBirth: validateValue(row[2], 'string') as string,
                    gender: validateValue(row[3], 'gender') as Gender,
                    aadhaarNumber: validateValue(row[4], 'string') as string,
                    fatherName: validateValue(row[5], 'string') as string,
                    motherName: validateValue(row[6], 'string') as string,
                    fatherOccupation: validateValue(row[7], 'string') as string,
                    motherOccupation: validateValue(row[8], 'string') as string,
                    fatherAadhaar: validateValue(row[9], 'string') as string,
                    motherAadhaar: validateValue(row[10], 'string') as string,
                    guardianName: validateValue(row[11], 'string') as string,
                    address: validateValue(row[12], 'string') as string,
                    contact: validateValue(row[13], 'string') as string,
                    pen: validateValue(row[14], 'string') as string,
                    category: validateValue(row[15], 'category') as Category,
                    religion: validateValue(row[16], 'string') as string,
                    cwsn: validateValue(row[17], 'yesno') as 'Yes' | 'No',
                    bloodGroup: validateValue(row[18], 'blood') as BloodGroup,
                    lastSchoolAttended: validateValue(row[19], 'string') as string,
                    healthConditions: validateValue(row[20], 'string') as string,
                    achievements: validateValue(row[21], 'string') as string,
                    photographUrl: '',
                    studentId: '', // Default value
                    guardianRelationship: '', // Default value
                    academicYear: academicYear // Passed prop
                };

                newParsedStudents.push({ ...studentData, errors });
            });

            setParsedStudents(newParsedStudents);
        } catch (err) {
            console.error(err);
            setParseError('Failed to parse the file. Please ensure it is a valid CSV or Excel file.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleSubmit = () => {
        if (!targetGrade) {
            setParseError("Please select a grade to import into.");
            return;
        }
        const validStudents = parsedStudents
            .filter(p => p.errors.length === 0)
            .map(({ errors, ...studentData }) => studentData);
            
        if (validStudents.length > 0) {
            onImport(validStudents, targetGrade);
        } else {
            setParseError("No valid student records to import. Please check the errors below.");
        }
    };

    const hasErrors = parsedStudents.some(p => p.errors.length > 0);
    const validCount = parsedStudents.filter(p => p.errors.length === 0).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Import Students</h2>
                    <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <div className="p-4 bg-slate-50 border rounded-lg space-y-3">
                        <h3 className="font-bold text-slate-800">Instructions</h3>
                        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                            <li><button onClick={handleDownloadTemplate} className="text-sky-600 font-semibold hover:underline inline-flex items-center gap-1"><InboxArrowDownIcon className="w-4 h-4"/> Download the Excel template.</button></li>
                            <li>Fill in the student details. Do not change the column headers.</li>
                            <li>Select the target class for import below.</li>
                            <li>Upload the completed file. The system will validate the data before importing.</li>
                        </