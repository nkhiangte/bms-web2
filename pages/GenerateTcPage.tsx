







import React, { useState, useEffect, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, TcRecord, Grade, Gender, Category, StudentStatus } from '../types';
import { BackIcon, HomeIcon, SearchIcon, DocumentPlusIcon, CheckIcon, SpinnerIcon, SparklesIcon, PrinterIcon } from '../components/Icons';
import { formatStudentId, formatDateForDisplay, formatDateForStorage } from '../utils';
// FIX: Corrected import to use GoogleGenAI from @google/genai.
import { GoogleGenAI } from "@google/genai";
import ConfirmationModal from '../components/ConfirmationModal';

const { useNavigate, useParams, Link } = ReactRouterDOM as any;

interface GenerateTcPageProps {
  students: Student[];
  tcRecords: TcRecord[];
  academicYear: string;
  onGenerateTc: (tcData: Omit<TcRecord, 'id'>) => Promise<boolean>;
  isSaving: boolean;
  error?: string;
}

const ReadonlyField: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-bold text-slate-800">{label}</label>
        <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 min-h-[42px] flex items-center">
            {value || 'N/A'}
        </div>
    </div>
);

const FormField: React.FC<{
    label: string; name: string; value: string; onChange: (e: React.ChangeEvent<any>) => void;
    type?: 'text' | 'date' | 'select' | 'textarea'; options?: { value: string; label: string }[]; required?: boolean;
}> = ({ label, name, value, onChange, type = 'text', options, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-slate-800">{label}</label>
        {type === 'select' ? (
            <select id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm h-[42px]">{options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
        ) : type === 'textarea' ? (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
        )}
    </div>
);

const REASON_FOR_LEAVING_OPTIONS = [
    "Parent's Choice",
    "Unavoidable change of residence",
    "Completion of the School Course",
    "Ill Health",
    "Minor reasons",
];

const GenerateTcPage: React.FC<GenerateTcPageProps> = ({ students, tcRecords, academicYear, onGenerateTc, isSaving, error }) => {
    const navigate = useNavigate();
    const { studentId: paramStudentId } = useParams() as { studentId: string };

    const [studentIdInput, setStudentIdInput] = useState<string>('');
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [searchError, setSearchError] = useState<string>('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isGeneratingWords, setIsGeneratingWords] = useState(false);
    const [existingTc, setExistingTc] = useState<TcRecord | null>(null);
    
    const [formData, setFormData] = useState({
        dateOfBirthInWords: '',
        schoolDuesIfAny: 'None',
        qualifiedForPromotion: 'Not Applicable' as 'Yes' | 'No' | 'Not Applicable',
        dateOfLastAttendance: '',
        dateOfApplicationOfTc: new Date().toISOString().split('T')[0],
        dateOfIssueOfTc: new Date().toISOString().split('T')[0],
        reasonForLeaving: REASON_FOR_LEAVING_OPTIONS[0],
        generalConduct: 'Good',
        anyOtherRemarks: 'None',
    });

    const findStudentById = (id: string) => {
        setFoundStudent(null);
        setSearchError('');
        setExistingTc(null);
        
        const student = students.find(s => s.id === id);
        
        if (student) {
            setFoundStudent(student);
            if (student.status === StudentStatus.TRANSFERRED) {
                const tc = tcRecords.find(t => t.studentDbId === student.id);
                if (tc) {
                    setSearchError('This student has already been transferred. You can view or print the existing TC.');
                    setExistingTc(tc);
                } else {
                    setSearchError('Warning: This student is marked as transferred, but no TC record was found. You can generate a new TC to resolve this inconsistency.');
                }
            }
            setFormData(prev => ({ ...prev, dateOfBirthInWords: '' }));
        } else {
            setSearchError('Student with this database ID not found.');
        }
    };
    
    useEffect(() => {
        if (paramStudentId) {
            findStudentById(paramStudentId);
        }
    }, [paramStudentId, students, tcRecords]);

    const handleStudentSearch = (e: FormEvent) => {
        e.preventDefault();
        setFoundStudent(null);
        setSearchError('');
        const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());
        if (student) {
            navigate(`/portal/transfers/generate/${student.id}`);
        } else {
            setSearchError('Active student with this ID not found.');
        }
    };

    const handleGenerateDateInWords = async () => {
        if (!foundStudent) return;
        setIsGeneratingWords(true);
        try {
            // FIX: Updated Gemini API initialization and call to follow latest guidelines.
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const displayDate = formatDateForDisplay(foundStudent.dateOfBirth);
            const promptText = `Convert the date ${displayDate} to words in "Day Month Year" format, where the day is an ordinal number. For example, 07/05/2007 becomes "Seventh May Two Thousand Seven".`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: promptText,
            });
            
            // FIX: Correctly access the text from the response object.
            setFormData(prev => ({...prev, dateOfBirthInWords: response.text ?? ''}));
        } catch (err) {
            console.error("Gemini API error:", err);
            setSearchError("Could not generate date in words. Please enter manually.");
        } finally {
            setIsGeneratingWords(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!foundStudent || !formData.dateOfBirthInWords) {
            alert("Please find a student and generate/enter date of birth in words.");
            return;
        }
        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmGenerate = () => {
        if (!foundStudent) return;

        const issueYear = new Date(formData.dateOfIssueOfTc).getFullYear();

        // Filter tcRecords for TCs issued in the same year.
        const tcsInSameYear = tcRecords.filter(tc => 
            new Date(tc.dateOfIssueOfTc).getFullYear() === issueYear
        );

        // The next number is the count of existing records for that year + 1.
        const nextNumber = tcsInSameYear.length + 1;

        // Pad the number to ensure it has at least 3 digits (e.g., 1 -> "001", 12 -> "012").
        const paddedNumber = String(nextNumber).padStart(3, '0');

        // Construct the new reference number in the format BMSTCYYYYNNN.
        const newRefNo = `BMSTC${issueYear}${paddedNumber}`;

        const tcData: Omit<TcRecord, 'id'> = {
            refNo: newRefNo,
            studentDbId: foundStudent.id,
            studentDisplayId: formatStudentId(foundStudent, academicYear),
            nameOfStudent: foundStudent.name,
            gender: foundStudent.gender,
            fatherName: foundStudent.fatherName,
            motherName: foundStudent.motherName,
            currentClass: foundStudent.grade,
            rollNo: foundStudent.rollNo,
            dateOfBirth: foundStudent.dateOfBirth,
            category: foundStudent.category,
            religion: foundStudent.religion,
            ...formData,
        };
        onGenerateTc(tcData);
        setIsConfirmModalOpen(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Generate Transfer Certificate</h1>
            
            {!paramStudentId && (
                <form onSubmit={handleStudentSearch} className="my-6 max-w-lg">
                    <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Find Student by ID</label>
                    <div className="flex gap-2 items-start">
                        <div className="flex-grow"><input id="student-id-input" type="text" placeholder="e