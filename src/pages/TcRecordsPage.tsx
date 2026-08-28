import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { TcRecord, Student } from '@/types';
import { db } from '@/firebaseConfig';
import { BackIcon, HomeIcon, PrinterIcon, DocumentPlusIcon, SearchIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface TcRecordsPageProps {
  tcRecords: TcRecord[];
  students?: Student[];
}

const getPenFromStudent = (student?: any): string => {
  if (!student) return '';
  const val = student.pen || student.penNumber || student.PEN || student.pen_no || student.permanentEducationNumber;
  return val && String(val).trim() !== 'N/A' ? String(val).trim() : '';
};

const TcRecordsPage: React.FC<TcRecordsPageProps> = ({ tcRecords, students = [] }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvedPens, setResolvedPens] = useState<{ [tcId: string]: string }>({});

  // Auto-fetch/resolve missing PEN from student records
  useEffect(() => {
    tcRecords.forEach(record => {
      // If record already has a valid PEN, nothing to do
      if (record.pen && record.pen.trim() !== '' && record.pen.trim() !== 'N/A') {
        return;
      }

      // Check if already resolved in state
      if (resolvedPens[record.id]) return;

      // 1. Try finding in passed students array
      const matched = students.find(s => 
        s.id === record.studentDbId || 
        s.studentId === record.studentDisplayId || 
        (s.name && record.nameOfStudent && s.name.trim().toLowerCase() === record.nameOfStudent.trim().toLowerCase())
      );

      const foundPen = getPenFromStudent(matched);
      if (foundPen) {
        setResolvedPens(prev => ({ ...prev, [record.id]: foundPen }));
        // Backfill to Firestore
        db.collection('tcRecords').doc(record.id).update({ pen: foundPen }).catch(() => {});
        return;
      }

      // 2. Fetch directly from Firestore students collection if not found in memory
      if (record.studentDbId) {
        db.collection('students').doc(record.studentDbId).get().then(doc => {
          if (doc.exists) {
            const p = getPenFromStudent(doc.data());
            if (p) {
              setResolvedPens(prev => ({ ...prev, [record.id]: p }));
              db.collection('tcRecords').doc(record.id).update({ pen: p }).catch(() => {});
            }
          }
        }).catch(() => {});
      } else if (record.studentDisplayId) {
        db.collection('students').where('studentId', '==', record.studentDisplayId).limit(1).get().then(snap => {
          if (!snap.empty) {
            const p = getPenFromStudent(snap.docs[0].data());
            if (p) {
              setResolvedPens(prev => ({ ...prev, [record.id]: p }));
              db.collection('tcRecords').doc(record.id).update({ pen: p }).catch(() => {});
            }
          }
        }).catch(() => {});
      }
    });
  }, [tcRecords, students, resolvedPens]);

  const getRecordPen = (record: TcRecord) => {
    if (record.pen && record.pen.trim() !== '' && record.pen.trim() !== 'N/A') {
      return record.pen;
    }
    if (resolvedPens[record.id]) {
      return resolvedPens[record.id];
    }
    const matched = students.find(s => s.id === record.studentDbId || s.studentId === record.studentDisplayId);
    return getPenFromStudent(matched);
  };

  const filteredRecords = useMemo(() => {
    return tcRecords.filter(record => {
        const term = searchTerm.toLowerCase();
        const effectivePen = getRecordPen(record);
        return (record.nameOfStudent ?? '').toLowerCase().includes(term) || 
               (record.studentDisplayId ?? '').toLowerCase().includes(term) ||
               effectivePen.toLowerCase().includes(term) ||
               (record.refNo ?? '').toLowerCase().includes(term);
    });
  }, [tcRecords, searchTerm, resolvedPens, students]);

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
            <input type="text" placeholder="Search by name, ID, PEN, or Ref No..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"/>
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
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">PEN</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date of Issue</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredRecords.map(record => {
              const penVal = getRecordPen(record);
              return (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">{record.refNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{record.studentDisplayId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 font-medium">{penVal || <span className="text-slate-400 italic font-normal">N/A</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-700">{record.nameOfStudent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.currentClass}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDateForDisplay(record.dateOfIssueOfTc)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-3">
                      <Link to={`/portal/transfers/edit/${record.id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors" title="Edit Certificate">
                        <DocumentPlusIcon className="w-5 h-5" /> Edit
                      </Link>
                      <Link to={`/portal/transfers/print/${record.id}`} className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 transition-colors" title="Print Certificate">
                        <PrinterIcon className="w-5 h-5" /> Print
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
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
