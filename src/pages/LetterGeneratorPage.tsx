
import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { SCHOOL_BANNER_URL } from '@/constants';
import { PrinterIcon, DocumentPlusIcon, InboxArrowDownIcon } from '@/components/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LetterData {
    letterNo: string;
    senderName: string;
    senderDesignation: string;
    date: string;
    recipientName: string;
    recipientDesignation: string;
    recipientOrganization: string;
    recipientAddress: string;
    subject: string;
    salutation: string;
    body: string;
    signOffName: string;
    signOffDesignation: string;
}

const LetterGeneratorPage: React.FC<{ user: User; schoolConfig: { udiseCode?: string } }> = ({ user, schoolConfig }) => {
    const generateLetterNo = () => {
        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
        return `BMSAPP${randomNum}`;
    };

    const [letterData, setLetterData] = useState<LetterData>({
        letterNo: generateLetterNo(),
        senderName: user.name || '[Your Name]',
        senderDesignation: user.role === 'admin' ? 'Principal' : 'Administrative Assistant',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        recipientName: '',
        recipientDesignation: '',
        recipientOrganization: '',
        recipientAddress: '',
        subject: '',
        salutation: 'Respected Sir/Madam,',
        body: '',
        signOffName: user.name || '[Your Name]',
        signOffDesignation: user.role === 'admin' ? 'Principal' : 'Administrative Assistant',
    });

    const letterRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLetterData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!letterRef.current) return;

        const canvas = await html2canvas(letterRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Official_Letter_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Form Section */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <DocumentPlusIcon className="w-6 h-6 text-sky-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Official Letter Generator</h1>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Letter Reference</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Letter No.</label>
                                    <input
                                        type="text"
                                        name="letterNo"
                                        value={letterData.letterNo}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="text"
                                        name="date"
                                        value={letterData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Sender Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sender Name</label>
                                    <input
                                        type="text"
                                        name="senderName"
                                        value={letterData.senderName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sender Designation</label>
                                    <input
                                        type="text"
                                        name="senderDesignation"
                                        value={letterData.senderDesignation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Recipient Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Name/Title</label>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={letterData.recipientName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. The Director"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Designation</label>
                                    <input
                                        type="text"
                                        name="recipientDesignation"
                                        value={letterData.recipientDesignation}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Education Board"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                                    <input
                                        type="text"
                                        name="recipientOrganization"
                                        value={letterData.recipientOrganization}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="recipientAddress"
                                        value={letterData.recipientAddress}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Letter Content</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={letterData.subject}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Application for [Purpose]"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Salutation</label>
                                    <input
                                        type="text"
                                        name="salutation"
                                        value={letterData.salutation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Body Paragraphs</label>
                                    <textarea
                                        name="body"
                                        value={letterData.body}
                                        onChange={handleInputChange}
                                        rows={8}
                                        placeholder="Type your letter content here..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Sign-off</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sign-off Name</label>
                                    <input
                                        type="text"
                                        name="signOffName"
                                        value={letterData.signOffName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sign-off Designation</label>
                                    <input
                                        type="text"
                                        name="signOffDesignation"
                                        value={letterData.signOffDesignation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handlePrint}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                            >
                                <PrinterIcon className="w-5 h-5" />
                                Print Letter
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                            >
                                <InboxArrowDownIcon className="w-5 h-5" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="w-full md:w-[600px] lg:w-[800px] print:w-full print:m-0">
                    <div className="sticky top-8 bg-slate-200 p-4 rounded-xl print:bg-transparent print:p-0">
                        <div 
                            ref={letterRef}
                            className="bg-white w-full aspect-[1/1.414] p-12 shadow-xl print:shadow-none print:p-0 mx-auto overflow-hidden"
                            style={{ fontFamily: 'serif' }}
                        >
                            {/* Header */}
                            <div className="border-b-2 border-slate-800 pb-4 mb-8 text-center">
                                <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full max-h-24 object-contain mb-2" />
                                <div className="text-sm font-bold text-slate-700">
                                    CHAMPHAI, MIZORAM | DISE Code: {schoolConfig.udiseCode || '[DISE Code]'}
                                </div>
                            </div>

                            {/* Date & Sender */}
                            <div className="flex justify-between mb-8 text-sm">
                                <div>
                                    <div className="font-bold">Ref No: {letterData.letterNo}</div>
                                    <div className="font-bold mt-2">{letterData.senderName}</div>
                                    <div>{letterData.senderDesignation}</div>
                                    <div>Bethel Mission School</div>
                                    <div>Champhai, Mizoram</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">Date: {letterData.date}</div>
                                </div>
                            </div>

                            {/* Recipient */}
                            <div className="mb-8 text-sm">
                                <div className="font-bold">To,</div>
                                <div>{letterData.recipientName}</div>
                                {letterData.recipientDesignation && <div>{letterData.recipientDesignation}</div>}
                                {letterData.recipientOrganization && <div>{letterData.recipientOrganization}</div>}
                                {letterData.recipientAddress && <div>{letterData.recipientAddress}</div>}
                            </div>

                            {/* Subject */}
                            <div className="mb-6 text-sm">
                                <span className="font-bold underline">Subject: {letterData.subject || '[Subject Line]'}</span>
                            </div>

                            {/* Salutation */}
                            <div className="mb-4 text-sm">
                                {letterData.salutation}
                            </div>

                            {/* Body */}
                            <div className="mb-12 text-sm leading-relaxed whitespace-pre-wrap min-h-[300px]">
                                {letterData.body || 'Type your letter content in the form to see the preview here...'}
                            </div>

                            {/* Sign-off */}
                            <div className="text-sm">
                                <div className="mb-12">Yours faithfully,</div>
                                <div className="font-bold">( {letterData.signOffName} )</div>
                                <div>{letterData.signOffDesignation}</div>
                                <div>Bethel Mission School</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LetterGeneratorPage;
