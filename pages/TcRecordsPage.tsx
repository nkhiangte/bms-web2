
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TcRecord } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, DocumentPlusIcon, SearchIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';

interface TcRecordsPageProps {
  tcRecords: TcRecord[];
}

const TcRecordsPage: React.FC<TcRecordsPageProps> = ({ tcRecords }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    return tcRecords.filter(record => {
        const term = searchTerm.toLowerCase();
        return (record.nameOfStudent ?? '').toLowerCase().includes(term) || 
               (record.studentDisplayId ?? '').toLowerCase().includes(term) ||
               (record.refNo ?? '').toLowerCase().includes(term);
    });
  }, [tcRecords, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
        <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <h1 className="text-3xl font-bold text-slate-800 flex-grow">TC Records</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-500" /></div>
            <input type="text" placeholder="Search by name, ID, or Ref No..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"/>
          </div>
          <Link to="/portal/transfers/generate" className="btn btn-primary w-full sm:w-auto"><DocumentPlusIcon className="h-5 w-5" /> Generate New TC</Link>
        </div>
      </div>
      
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Ref. No</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date of Issue</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredRecords.map(record => (
              <tr key={record.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">{record.refNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{record.studentDisplayId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-700">{record.nameOfStudent}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.currentClass}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDateForDisplay(record.dateOfIssueOfTc)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Link to={`/portal/transfers/print/${record.id}`} className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 transition-colors" title="Print Certificate">
                    <PrinterIcon className="w-5 h-5" /> Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div className="text-center py-10"><p className="text-slate-700 font-semibold">No records found.</p></div>
        )}
      </div>
    </div>
  );
};

export default TcRecordsPage;
