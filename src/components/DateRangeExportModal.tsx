
import React, { useState } from 'react';
import { XIcon, InboxArrowDownIcon, SpinnerIcon } from '@/components/Icons';

interface DateRangeExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (startDate: string, endDate: string) => Promise<void>;
    title?: string;
}

const DateRangeExportModal: React.FC<DateRangeExportModalProps> = ({ isOpen, onClose, onExport, title = "Export Attendance" }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!startDate || !endDate) return;
        if (startDate > endDate) {
            alert("Start date cannot be after end date.");
            return;
        }
        setIsExporting(true);
        await onExport(startDate, endDate);
        setIsExporting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={e => onClose()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-full mt-1 border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-full mt-1 border-slate-300 rounded-md shadow-sm" />
                    </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleExport} disabled={isExporting || !startDate || !endDate} className="btn btn-primary">
                        {isExporting ? <SpinnerIcon className="w-5 h-5" /> : <InboxArrowDownIcon className="w-5 h-5" />}
                        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
export default DateRangeExportModal;
