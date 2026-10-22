import React, { useState } from 'react';
import { Grade, GradeDefinition, SubjectDefinition } from '@/types';
import { GRADES_LIST } from '@/constants';
import { XIcon, CheckIcon } from '@/components/Icons';
import { Copy, Layers } from 'lucide-react';

interface CopySubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGrade: Grade;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onCopy: (targetGrade: Grade, subjects: SubjectDefinition[]) => void;
}

export const CopySubjectsModal: React.FC<CopySubjectsModalProps> = ({
  isOpen,
  onClose,
  targetGrade,
  gradeDefinitions,
  onCopy
}) => {
  const otherGrades = GRADES_LIST.filter(g => g !== targetGrade);
  const [sourceGrade, setSourceGrade] = useState<Grade>(otherGrades[0] || Grade.I);
  const [mode, setMode] = useState<'replace' | 'merge'>('replace');

  if (!isOpen) return null;

  const sourceSubjects = gradeDefinitions[sourceGrade]?.subjects || [];
  const currentSubjects = gradeDefinitions[targetGrade]?.subjects || [];

  const handleApply = () => {
    let result: SubjectDefinition[] = [];
    if (mode === 'replace') {
      result = JSON.parse(JSON.stringify(sourceSubjects));
    } else {
      // Merge: keep current, append missing
      const existingNorm = currentSubjects.map(s => s.name.trim().toLowerCase());
      const toAppend = sourceSubjects.filter(s => !existingNorm.includes(s.name.trim().toLowerCase()));
      result = [...JSON.parse(JSON.stringify(currentSubjects)), ...JSON.parse(JSON.stringify(toAppend))];
    }
    onCopy(targetGrade, result);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Copy Subjects to {targetGrade}</h3>
              <p className="text-xs text-emerald-100 font-medium">Replicate curriculum from another class</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Source Grade Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Copy Subjects From Class:
            </label>
            <select
              value={sourceGrade}
              onChange={(e) => setSourceGrade(e.target.value as Grade)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
            >
              {otherGrades.map(g => {
                const count = gradeDefinitions[g]?.subjects?.length || 0;
                return (
                  <option key={g} value={g}>
                    {g} ({count} subjects)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Copy Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Copy Strategy:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('replace')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  mode === 'replace'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-bold">Replace All</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                  Replace {targetGrade}'s existing subjects with {sourceGrade}'s list
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('merge')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  mode === 'merge'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-bold">Append Missing</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                  Keep existing subjects and add only new ones from {sourceGrade}
                </div>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Subjects in {sourceGrade} ({sourceSubjects.length}):
              </span>
            </div>
            {sourceSubjects.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs text-slate-600">
                {sourceSubjects.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 px-2 rounded bg-white border border-slate-100">
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {s.gradingSystem === 'OABC' ? 'Graded (OABC)' : `FM: ${s.examFullMarks + s.activityFullMarks}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No subjects configured in {sourceGrade}.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={sourceSubjects.length === 0}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            Apply to {targetGrade}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopySubjectsModal;
