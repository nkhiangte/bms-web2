import React, { useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student } from '@/types';
import { db } from '@/firebaseConfig';
import { SearchIcon, DocumentReportIcon, PrinterIcon } from '@/components/Icons';
import { SCHOOL_BANNER_URL } from '@/constants';

const { useNavigate } = ReactRouterDOM as any;

const TestimonialGeneratorPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    
    const [division, setDivision] = useState('First');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [certificateId, setCertificateId] = useState('');
    const [dateOfIssue, setDateOfIssue] = useState(new Date().toISOString().split('T')[0]);

    // Auto-generate certificate ID when student is selected
    React.useEffect(() => {
        if (selectedStudent && !certificateId) {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 90000) + 10000; // 5 digit random
            setCertificateId(`BMS${year}${random}`);
        } else if (!selectedStudent) {
            setCertificateId('');
        }
    }, [selectedStudent, certificateId]);

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow typing the prefix
        if (value === '' || value === 'B' || value === 'BM' || value === 'BMS') {
            setCertificateId(value);
            return;
        }
        
        // If it's longer than 3, it MUST start with BMS and be followed by numerals
        if (value.startsWith('BMS')) {
            const afterPrefix = value.substring(3);
            if (/^\d*$/.test(afterPrefix)) {
                setCertificateId(value);
            }
        }
    };

    const printRef = useRef<HTMLDivElement>(null);

    const handleSearch = async () => {
        if (!searchTerm) return;
        
        try {
            // Very simple search implementation
            const snapshot = await db.collection('students').get();
            const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
            
            const searchLower = searchTerm.toLowerCase().trim();
            const results = allStudents.filter(s => 
                (s.name || '').toLowerCase().includes(searchLower) || 
                (s.studentId || '').toLowerCase().includes(searchLower)
            );
            
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching students:", error);
        }
    };

    const handlePrint = () => {
        // Fallback for isolated iframe contexts (like AI Studio previews)
        try {
            window.print();
        } catch (error) {
            console.warn("Standard print failed. Check if running in a sandboxed iframe without 'allow-modals'.", error);
            alert("The printing dialog is blocked by your browser's security settings (iframe sandbox). Please click the full screen/new window arrow in the top right corner of the AI Studio preview to open the app directly, then try printing again.");
        }
    };

    const getDaySuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year = d.getFullYear();
        
        return `${day}${getDaySuffix(day)} ${month}, ${year}`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0 pb-20 md:pb-0">
            <div className="print:hidden">
                <div className="flex items-center justify-between mb-6 mt-4">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <DocumentReportIcon className="w-8 h-8 text-sky-600" />
                        Testimonial Generator
                    </h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Select Student</h2>
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by Name or Admission Number..."
                            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <SearchIcon className="w-5 h-5" />
                            Search
                        </button>
                    </div>

                    {searchResults.length > 0 && !selectedStudent && (
                        <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admission No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Father's Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {searchResults.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.studentId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.fatherName || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setSearchResults([]);
                                                        setSearchTerm('');
                                                    }}
                                                    className="text-sky-600 hover:text-sky-900"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {selectedStudent && (
                        <div className="bg-sky-50 border border-sky-200 p-4 rounded-md relative flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sky-900">{selectedStudent.name}</p>
                                <p className="text-sm text-sky-700">D/O, S/O: {selectedStudent.fatherName || selectedStudent.motherName}</p>
                                <p className="text-sm text-sky-700">DOB: {formatDate(selectedStudent.dateOfBirth)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-sky-600 hover:underline text-sm font-medium"
                            >
                                Change Student
                            </button>
                        </div>
                    )}
                </div>

                {selectedStudent && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">2. Certificate Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Certificate ID / No.</label>
                                <input
                                    type="text"
                                    value={certificateId}
                                    onChange={handleIdChange}
                                    className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    placeholder="BMS20260001"
                                />
                                <p className="mt-1 text-xs text-slate-500">Format: BMS + Numbers only</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">HSLC Division Passed</label>
                                <select
                                    value={division}
                                    onChange={(e) => setDivision(e.target.value)}
                                    className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                >
                                    <option value="Distinction">Distinction</option>
                                    <option value="First">First</option>
                                    <option value="Second">Second</option>
                                    <option value="Third">Third</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Examination Year</label>
                                <input
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    placeholder="2026"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Issue</label>
                                <input
                                    type="date"
                                    value={dateOfIssue}
                                    onChange={(e) => setDateOfIssue(e.target.value)}
                                    className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handlePrint}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <PrinterIcon className="w-5 h-5" />
                                Print Certificate
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Area */}
            {selectedStudent && (
                <div className="hidden print:block font-serif A4-size" id="printable-testimonial" ref={printRef}>
                    <style>{`
                        @page { size: A4 portrait; margin: 0; }
                        @media print {
                            body { margin: 0; padding: 0; background: white; }
                            #printable-testimonial { 
                                font-size: 13pt; 
                                line-height: 1.6; 
                                padding: 1cm 2cm; 
                                width: 210mm;
                                height: 297mm;
                                box-sizing: border-box;
                            }
                        }
                    `}</style>
                
                    <header className="text-center mb-6">
                        <img
                            src={SCHOOL_BANNER_URL}
                            alt="Bethel Mission School Banner"
                            className="w-full h-auto mb-2"
                        />
                    </header>

                    <h1 className="text-center text-xl font-bold uppercase tracking-wide mb-6 underline underline-offset-8">
                        Testimonial / Character Certificate
                    </h1>
                    
                    <div className="flex justify-between items-center mb-8 text-lg">
                        <div>
                            No<span className="font-medium ml-2 border-b-2 border-dashed border-black pb-1 inline-block min-w-[150px] text-center">{certificateId}</span>
                        </div>
                        <div>
                            ID<span className="font-medium ml-2 border-b-2 border-dashed border-black pb-1 inline-block min-w-[150px] text-center">{selectedStudent.studentId}</span>
                        </div>
                    </div>

                    <div className="text-justify space-y-8">
                        <p className="indent-16">
                            This is to certify that <span className="font-bold border-b-2 border-dashed border-black pb-1 px-4 inline-block">{selectedStudent.name}</span> 
                            {selectedStudent.gender === 'Female' ? ' daughter of ' : ' son of '} 
                            <span className="font-bold border-b-2 border-dashed border-black pb-1 px-4 inline-block">{selectedStudent.fatherName || selectedStudent.motherName}</span> 
                            was a bonafide student of Bethel Mission School, Champhai.
                        </p>

                        <p>
                            {selectedStudent.gender === 'Female' ? 'She' : 'He'} had passed HSLC Examination in <span className="font-bold border-b-2 border-dashed border-black pb-1 px-4 inline-block">{division}</span> division under Mizoram Board of School Education from this school in the year <span className="font-bold border-b-2 border-dashed border-black pb-1 px-4 inline-block">{year}</span>.
                        </p>

                        <p className="indent-16">
                            {selectedStudent.gender === 'Female' ? 'Her' : 'His'} date of birth according to the School Register is <span className="font-bold border-b-2 border-dashed border-black pb-1 px-4 inline-block">{formatDate(selectedStudent.dateOfBirth)}</span>. {selectedStudent.gender === 'Female' ? 'Her' : 'His'} character and conduct in the school is good and proved reliable in all the works entrusted to {selectedStudent.gender === 'Female' ? 'her' : 'him'}.
                        </p>

                        <p className="indent-16">
                            I wish {selectedStudent.gender === 'Female' ? 'her' : 'him'} every success in {selectedStudent.gender === 'Female' ? 'her' : 'his'} future career.
                        </p>
                    </div>

                    <div className="mt-12 flex justify-between items-end text-lg">
                        <div>
                            <div>Dated. Champhai</div>
                            <div className="mt-2 font-bold border-b-2 border-dashed border-black min-w-[180px] text-center pb-1">
                                {formatDate(dateOfIssue)}
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="font-bold">(K. MALSAWMDAWNGI)</div>
                            <div className="mt-1 pb-1">Principal</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestimonialGeneratorPage;
