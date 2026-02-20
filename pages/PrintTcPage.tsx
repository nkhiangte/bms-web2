
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { TcRecord } from '@/types';
import { BackIcon, PrinterIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import { SCHOOL_BANNER_URL } from '@/constants';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface PrintTcPageProps {
  tcRecords: TcRecord[];
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="flex items-end pb-1">
        <span className="text-slate-700 pr-2 whitespace-nowrap">{label}</span>
        <span className="flex-grow font-bold text-slate-900 border-b border-dotted border-slate-600 text-left">{value || ''}</span>
    </div>
);


const PrintTcPage: React.FC<PrintTcPageProps> = ({ tcRecords }) => {
    // Fix: Cast untyped useParams call to specific type to resolve build error
    const { tcId } = useParams() as { tcId: string };
    const navigate = useNavigate();

    const record = tcRecords.find(r => r.id === tcId);

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
    
    // Properties accessed directly from record below

    return (
      <div className="bg-slate-200 print:bg-white flex justify-center py-8">
        <div className="print-hidden fixed top-4 right-4 flex flex-col gap-2">
            <button onClick={() => window.print()} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print</button>
            <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5"/> Back</button>
        </div>

        <div id="printable-tc" className="bg-white A4-size p-8 shadow-lg print:shadow-none font-serif text-sm">
                 <style>{`
                    @page { size: A4 portrait; margin: 1.5cm; }
                    @media print {
                        #printable-tc { font-size: 10pt; padding: 0; }
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

                <div className="grid grid-cols-4 gap-x-8 mb-4">
                    <div className="col-span-2"><strong>Ref. No:</strong> {record.refNo}</div>
                    <div className="col-span-2 text-right"><strong>Student ID:</strong> {record.studentDisplayId}</div>
                </div>

                <main className="space-y-3 text-slate-800">
                    <div className="flex items-center">
                        <span className="w-1/4">Name of student:</span>
                        <span className="flex-grow font-bold text-base border-b border-dotted border-slate-600 text-center">{record.nameOfStudent}</span>
                        <span className="w-1/6 text-right pr-2">Gender:</span>
                        <span className="w-1/6 font-bold border-b border-dotted border-slate-600 text-center">{record.gender}</span>
                    </div>
                     <div className="flex items-center">
                        <span className="w-1/4">Father's Name:</span>
                        <span className="flex-grow font-bold text-base border-b border-dotted border-slate-600 text-center">{record.fatherName}</span>
                    </div>
                     <div className="flex items-center">
                        <span className="w-1/4">Mother's Name:</span>
                        <span className="flex-grow font-bold text-base border-b border-dotted border-slate-600 text-center">{record.motherName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-3 pt-2">
                        <DetailItem label="Current Class:" value={record.currentClass} />
                        <DetailItem label="Roll No:" value={record.rollNo} />
                        <DetailItem label="Date of birth:" value={formatDateForDisplay(record.dateOfBirth)} />
                        <div className="col-span-2 flex items-end pb-1">
                            <span className="pr-2 whitespace-nowrap">Date of birth in words:</span>
                            <span className="flex-grow font-bold border-b border-dotted border-slate-600 text-left">{record.dateOfBirthInWords}</span>
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
                
                <footer className="mt-16">
                    <div className="grid grid-cols-3 gap-8">
                        <div className="flex flex-col justify-end">
                            <div className="h-12"></div>
                            <p className="border-t-2 border-slate-500 pt-1 text-center">Prepared by</p>
                        </div>
                        <div className="flex flex-col justify-end">
                             <p className="text-center">Date : {formatDateForDisplay(record.dateOfIssueOfTc)}</p>
                        </div>
                         <div className="flex flex-col justify-end text-center">
                            <div className="h-12"></div>
                            <div className="border-t-2 border-slate-500 pt-1">
                                <p className="font-bold">K MALSAWMDAWNGI</p>
                                <p>Principal</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PrintTcPage;
