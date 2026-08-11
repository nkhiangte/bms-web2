import React, { useState } from 'react';
import { Grade, Student } from '@/types';
import { GRADES_LIST } from '@/constants';
import { SpinnerIcon } from '@/components/Icons';

interface TransferStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (newGrade: Grade) => Promise<void>;
  currentGrade: Grade;
  isSaving: boolean;
}

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({ isOpen, onClose, onTransfer, currentGrade, isSaving }) => {
  const [newGrade, setNewGrade] = useState<Grade>(currentGrade);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onTransfer(newGrade);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Transfer Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800">Current Grade</label>
            <div className="mt-1 p-2 bg-slate-100 rounded-md border text-slate-600">{currentGrade}</div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800">Target Grade</label>
            <select 
              value={newGrade} 
              onChange={(e) => setNewGrade(e.target.value as Grade)} 
              className="mt-1 block w-full border-slate-300 rounded-md shadow-sm h-[42px] px-4"
              required
            >
              {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferStudentModal;
