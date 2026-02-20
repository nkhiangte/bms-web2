
import React, { useState, useEffect, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, TcRecord, Grade, Gender, Category, StudentStatus, User } from '@/types';
import { BackIcon, HomeIcon, SearchIcon, DocumentPlusIcon, CheckIcon, SpinnerIcon, SparklesIcon, PrinterIcon } from '@/components/Icons';
import { formatStudentId, formatDateForDisplay, formatDateForStorage } from '@/utils';
import { GoogleGenAI } from "@google/genai";
import ConfirmationModal from '@/components/ConfirmationModal';

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
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm h-[42px] px-3" />
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

export const GenerateTcPage: React.FC<GenerateTcPageProps> = ({ students, tcRecords, academicYear, onGenerateTc, isSaving, error }) => {
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
            
            const tc = tcRecords.find(r => r.studentDbId === student.id);
            if (tc) {
                setExistingTc(tc);
            }
        } else {
            setSearchError('Student not found.');
        }
    };

    useEffect(() => {
        if (paramStudentId) {
            findStudentById(paramStudentId);
        }
    }, [paramStudentId, students, tcRecords]);

    const handleStudentSearch = () => {
        setFoundStudent(null);
        setSearchError('');
        setExistingTc(null);

        if (!studentIdInput) {
            setSearchError('Please enter a Student ID.');
            return;
        }
        
        const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

        if (student) {
            setFoundStudent(student);
            const tc = tcRecords.find(r => r.studentDbId === student.id);
            if(tc) {
                setExistingTc(tc);
            }
        } else {
            setSearchError('No active student found with this ID. Please check and try again.');
        }
    };

    const handleGenerateDateInWords = async () => {
        if (!foundStudent) return;
        setIsGeneratingWords(true);
        try {
            const prompt = `Convert the date ${formatDateForDisplay(foundStudent.dateOfBirth)} into words. For example, for "15/08/1947" you should respond with "Fifteenth of August, Nineteen Hundred and Forty-Seven". Do not add any extra formatting or quotation marks.`;
            
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            });
            const text = response.text;
            if (text) {
                setFormData(prev => ({ ...prev, dateOfBirthInWords: text.replace(/["*]/g, '').trim() }));
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
            alert("Failed to generate date in words. Please enter it manually.");
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
        if (!foundStudent) {
            alert("Please find and select a student first.");
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!foundStudent) return;

        const tcData: Omit<TcRecord, 'id'> = {
            refNo: `BMS/TC/${academicYear.split('-')[0]}/${foundStudent.rollNo}`,
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

        const success = await onGenerateTc(tcData);
        if (success) {
            setIsConfirmModalOpen(false);
        }
    };
    
    return (
    <>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                    <BackIcon className="w-5 h-5" />
                    Back
                </button>
                <Link
                    to="/portal/dashboard"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    title="Go to Home/Dashboard"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">Generate Transfer Certificate</h1>
            <p className="text-slate-700 mb-8">Enter a student's ID to fetch their details and generate a TC.</p>
            
            <div className="mb-8 max-w-lg">
                <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID</label>
                <div className="flex gap-2 items-start">
                    <div className="flex-grow">
                        <input
                            id="student-id-input"
                            type="text"
                            placeholder="e.g., BMS250501"
                            value={studentIdInput}
                            onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStudentSearch(); }}}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                        {searchError && <p className={`${searchError.startsWith('Warning') ? 'text-amber-600' : 'text-red-500'} text-sm mt-1`}>{searchError}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={handleStudentSearch}
                        className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px] flex items-center"
                    >
                       <SearchIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            {existingTc && (
                 <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <h3 className="font-bold text-amber-800">TC Already Exists</h3>
                    <p className="text-amber-900 text-sm mt-1">A Transfer Certificate with Ref No. <span className="font-mono">{existingTc.refNo}</span> has already been generated for this student.</p>
                    <Link to={`/portal/transfers/print/${existingTc.id}`} className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:underline">
                        <PrinterIcon className="w-4 h-4" /> Print Existing Certificate
                    </Link>
                </div>
            )}
            
            {foundStudent && !existingTc && (
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <fieldset className="border p-4 rounded-lg">
                            <legend className="text-lg font-bold text-slate-800 px-2">Student Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                <ReadonlyField label="Student Name" value={foundStudent.name} />
                                <ReadonlyField label="Father's Name" value={foundStudent.fatherName} />
                                <ReadonlyField label="Mother's Name" value={foundStudent.motherName} />
                                <ReadonlyField label="Current Class" value={foundStudent.grade} />
                                <ReadonlyField label="Roll No" value={foundStudent.rollNo} />
                                <ReadonlyField label="Date of Birth" value={formatDateForDisplay(foundStudent.dateOfBirth)} />
                                <ReadonlyField label="Category" value={foundStudent.category} />
                                <ReadonlyField label="Religion" value={foundStudent.religion} />
                            </div>
                        </fieldset>
                        
                        <fieldset className="border p-4 rounded-lg">
                            <legend className="text-lg font-bold text-slate-800 px-2">Certificate Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-bold text-slate-800">Date of Birth (in words)</label>
                                    <div className="flex items-center gap-2">
                                        <input type="text" name="dateOfBirthInWords" value={formData.dateOfBirthInWords} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                                        <button type="button" onClick={handleGenerateDateInWords} disabled={isGeneratingWords} className="btn btn-secondary whitespace-nowrap">
                                            {isGeneratingWords ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5"/>}
                                            {isGeneratingWords ? 'Generating...' : 'AI Generate'}
                                        </button>
                                    </div>
                                </div>

                                <FormField label="School Dues (if any)" name="schoolDuesIfAny" value={formData.schoolDuesIfAny} onChange={handleChange} />
                                <FormField label="Whether qualified for promotion:" name="qualifiedForPromotion" value={formData.qualifiedForPromotion} onChange={handleChange} type="select" options={[{value: 'Yes', label: 'Yes'}, {value: 'No', label: 'No'}, {value: 'Not Applicable', label: 'Not Applicable'}]} />
                                <FormField label="Date of last attendance at school:" name="dateOfLastAttendance" value={formData.dateOfLastAttendance} onChange={handleChange} type="date" />
                                <FormField label="Date of application of TC:" name="dateOfApplicationOfTc" value={formData.dateOfApplicationOfTc} onChange={handleChange} type="date" />
                                <FormField label="Date of issue of TC:" name="dateOfIssueOfTc" value={formData.dateOfIssueOfTc} onChange={handleChange} type="date" />
                                <FormField label="Reason for leaving:" name="reasonForLeaving" value={formData.reasonForLeaving} onChange={handleChange} type="select" options={REASON_FOR_LEAVING_OPTIONS.map(r => ({value: r, label: r}))} />
                                <FormField label="General Conduct:" name="generalConduct" value={formData.generalConduct} onChange={handleChange} />
                                <div className="lg:col-span-2">
                                    <FormField label="Any Other Remarks:" name="anyOtherRemarks" value={formData.anyOtherRemarks} onChange={handleChange} type="textarea" required={false} />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <DocumentPlusIcon className="w-5 h-5" />}
                            <span>{isSaving ? 'Saving...' : 'Generate & Save TC'}</span>
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmSave}
                title="Confirm TC Generation"
                confirmDisabled={isSaving}
            >
                <p>Are you sure you want to generate a Transfer Certificate for <span className="font-bold">{foundStudent?.name}</span>? This will also update the student's status to 'Transferred'.</p>
            </ConfirmationModal>
        </div>
    </>
    );
};