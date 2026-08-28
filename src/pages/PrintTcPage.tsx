import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { TcRecord, Student } from '@/types';
import { db } from '@/firebaseConfig';
import { BackIcon, PrinterIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import { SCHOOL_BANNER_URL } from '@/constants';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface PrintTcPageProps {
  tcRecords: TcRecord[];
  students?: Student[];
}

const getPenFromStudent = (student?: any): string => {
  if (!student) return '';
  const val = student.pen || student.penNumber || student.PEN || student.pen_no || student.permanentEducationNumber;
  return val && String(val).trim() !== 'N/A' ? String(val).trim() : '';
};

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="flex items-end pb-1">
        <span className="text-slate-900 pr-1 whitespace-nowrap text-[11px] uppercase tracking-tight">{label}</span>
        <span className="flex-grow font-bold text-slate-900 border-b border-dotted border-slate-900 text-left pl-1">{value || ''}</span>
    </div>
);

const PrintTcPage: React.FC<PrintTcPageProps> = ({ tcRecords, students = [] }) => {
    const { tcId } = useParams() as { tcId: string };
    const navigate = useNavigate();

    const record = tcRecords.find(r => r.id === tcId);
    const [fetchedPen, setFetchedPen] = useState<string>('');

    useEffect(() => {
        if (!record) return;
        if (record.pen && record.pen.trim() !== '' && record.pen.trim() !== 'N/A') {
            setFetchedPen(record.pen.trim());
            return;
        }

        // Try memory lookup first
        const matched = students.find(s => 
            s.id === record.studentDbId || 
            s.studentId === record.studentDisplayId || 
            (s.name && record.nameOfStudent && s.name.trim().toLowerCase() === record.nameOfStudent.trim().toLowerCase())
        );

        const foundPen = getPenFromStudent(matched);
        if (foundPen) {
            setFetchedPen(foundPen);
            db.collection('tcRecords').doc(record.id).update({ pen: foundPen }).catch(() => {});
            return;
        }

        // Fetch from Firestore
        if (record.studentDbId) {
            db.collection('students').doc(record.studentDbId).get().then(doc => {
                if (doc.exists) {
                    const p = getPenFromStudent(doc.data());
                    if (p) {
                        setFetchedPen(p);
                        db.collection('tcRecords').doc(record.id).update({ pen: p }).catch(() => {});
                    }
                }
            }).catch(() => {});
        } else if (record.studentDisplayId) {
            db.collection('students').where('studentId', '==', record.studentDisplayId).limit(1).get().then(snap => {
                if (!snap.empty) {
                    const p = getPenFromStudent(snap.docs[0].data());
                    if (p) {
                        setFetchedPen(p);
                        db.collection('tcRecords').doc(record.id).update({ pen: p }).catch(() => {});
                    }
                }
            }).catch(() => {});
        }
    }, [record, students]);

    if (!record) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Certificate Not Found</h2>
                <p className="text-slate-700 mt-2">The requested certificate record does not exist.</p>
                <button
                    onClick={() => navigate('/portal/transfers/records')}
                    className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
                >
                    <BackIcon className="w-5 h-5" />
                    Return to Records
                </button>
            </div>
        );
    }

    const displayPen = (record.pen && record.pen.trim() !== 'N/A' && record.pen.trim() !== '') ? record.pen : (fetchedPen || 'N/A');

    return (
      <div className="bg-slate-200 print:bg-white flex flex-col items-center py-4 print:py-0">
        <div className="w-full max-w-[210mm] mb-4 flex justify-between items-center print:hidden px-4 md:px-0">
            <button
                onClick={() => navigate(-1)}
                className="btn btn-secondary flex items-center justify-center gap-2 shadow-sm"
            >
                <BackIcon className="w-5 h-5" />
                Back
            </button>
            <button
                onClick={() => window.print()}
                className="btn btn-primary flex items-center justify-center gap-2 shadow-sm"
            >
                <PrinterIcon className="w-5 h-5" />
                Print Certificate
            </button>
        </div>

        <div id="printable-tc" className="bg-white A4-size p-8 shadow-lg print:shadow-none font-serif text-sm">
                 <style>{`
                    @page { size: A4 portrait; margin: 1cm; }
                    @media print {
                        #printable-tc { font-size: 9.5pt; padding: 0.5cm; }
                        .A4-size { width: 100% !important; height: auto !important; }
                    }
                `}</style>
                <header className="text-center mb-6">
                    <img
                        src={SCHOOL_BANNER_URL}
                        alt="Bethel Mission School Banner"
                        className="w-full h-auto"
                    />
                    <div className="mt-4">
                        <h2 className="text-lg font-bold inline-block border-b-2 border-slate-800 px-4 mt-2 pb-1">TRANSFER CERTIFICATE</h2>
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-x-4 mb-4">
                    <div><strong>Ref. No:</strong> {record.refNo}</div>
                    <div className="text-center"><strong>PEN:</strong> {displayPen}</div>
                    <div className="text-right"><strong>Student ID:</strong> {record.studentDisplayId}</div>
                </div>

                <main className="space-y-2 text-slate-900">
                    <div className="flex items-center">
                        <span className="text-[11px] uppercase tracking-tight pr-1">Name of student:</span>
                        <span className="flex-grow font-bold text-base border-b border-dotted border-slate-900 text-center">{record.nameOfStudent}</span>
                        <span className="text-[11px] uppercase tracking-tight px-2">Gender:</span>
                        <span className="w-20 font-bold border-b border-dotted border-slate-900 text-center">{record.gender}</span>
                    </div>
                     <div className="flex items-center">
                        <span className="text-[11px] uppercase tracking-tight pr-1">Father's Name:</span>
                        <span className="flex-grow font-bold text-base border-b border-dotted border-slate-900 text-center">{record.fatherName}</span>
                    </div>
                     <div className="flex items-center">
                        <span className="text-[11px] uppercase tracking-tight pr-1">Mother's Name:</span>
                        <span className="flex-grow font-bold text-base border-b border-dotted border-slate-900 text-center">{record.motherName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-1">
                        <DetailItem label="PEN (Permanent Education No):" value={displayPen} />
                        <DetailItem label="Current Class:" value={record.currentClass} />
                        <DetailItem label="Roll No:" value={record.rollNo} />
                        <DetailItem label="Date of birth:" value={formatDateForDisplay(record.dateOfBirth)} />
                        <div className="col-span-2 flex items-end pb-1">
                            <span className="pr-1 whitespace-nowrap text-[11px] uppercase tracking-tight">Date of birth in words:</span>
                            <span className="flex-grow font-bold border-b border-dotted border-slate-900 text-left pl-1">{record.dateOfBirthInWords}</span>
                        </div>
                        <DetailItem label="Category:" value={record.category} />
                        <DetailItem label="Religion:" value={record.religion} />
                        <DetailItem label="School dues (if any):" value={record.schoolDuesIfAny} />
                        <DetailItem label="Whether qualified for promotion:" value={record.qualifiedForPromotion} />
                        <DetailItem label="Date of last attendance at school:" value={record.dateOfLastAttendance ? formatDateForDisplay(record.dateOfLastAttendance) : 'N/A'} />
                        <DetailItem label="Date of application of TC:" value={formatDateForDisplay(record.dateOfApplicationOfTc)} />
                        <DetailItem label="Date of issue of TC:" value={formatDateForDisplay(record.dateOfIssueOfTc)} />
                        <DetailItem label="Reason for leaving:" value={record.reasonForLeaving} />
                        <DetailItem label="General Conduct:" value={record.generalConduct} />
                        <DetailItem label="Any Other Remarks:" value={record.anyOtherRemarks} />
                    </div>
                </main>
                
                <footer className="mt-16 text-slate-900">
                    <div className="grid grid-cols-3 gap-8">
                        <div className="flex flex-col justify-end">
                            <div className="h-12"></div>
                            <p className="border-t-2 border-slate-900 pt-1 text-center font-semibold">Prepared by</p>
                        </div>
                        <div className="flex flex-col justify-end">
                             <p className="text-center font-semibold">Date : {formatDateForDisplay(record.dateOfIssueOfTc)}</p>
                        </div>
                         <div className="flex flex-col justify-end text-center">
                            <div className="h-12"></div>
                            <div className="border-t-2 border-slate-900 pt-1">
                                <p className="font-bold uppercase">K MALSAWMDAWNGI</p>
                                <p className="font-semibold">Principal</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PrintTcPage;
