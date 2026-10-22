import React from 'react';
import { Grade, SubjectDefinition, Staff } from '@/types';
import { TrashIcon, XIcon } from '@/components/Icons';
import { AlertTriangle, UserCheck } from 'lucide-react';

interface DeleteSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectDefinition | null;
  grade: Grade;
  assignedTeachers?: Staff[];
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteSubjectModal: React.FC<DeleteSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  grade,
  assignedTeachers = [],
  onConfirm,
  isDeleting = false
}) => {
  if (!isOpen || !subject) return null;

  const isGraded = subject.gradingSystem === 'OABC';
  const totalMarks = isGraded ? 'Letter Graded (OABC)' : `${subject.examFullMarks + subject.activityFullMarks} Marks (Exam: ${subject.examFullMarks}, Act: ${subject.activityFullMarks})`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-50 p-5 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 leading-tight">Remove Subject</h3>
              <p className="text-xs text-red-700 font-medium">Class: {grade}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-red-100/50"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to remove <strong className="text-slate-900 font-bold">"{subject.name}"</strong> from the curriculum of <span className="font-semibold text-sky-700">{grade}</span>?
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Subject Name:</span>
              <span className="font-bold text-slate-800">{subject.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Evaluation:</span>
              <span className="font-semibold text-slate-700">{totalMarks}</span>
            </div>
          </div>

          {assignedTeachers.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-800">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Assigned Teacher Notice:
              </div>
              <p>
                The following {assignedTeachers.length} teacher(s) have this subject assigned for {grade}:
              </p>
              <ul className="list-disc list-inside font-semibold text-amber-950 mt-1">
                {assignedTeachers.map(t => (
                  <li key={t.id}>{t.firstName} {t.lastName}</li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 mt-1">
                Deleting this subject will remove it from the active class list for reports and routines.
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500 italic">
            Note: You can re-add this subject at any time if needed.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            {isDeleting ? 'Removing...' : 'Confirm Remove Subject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubjectModal;
