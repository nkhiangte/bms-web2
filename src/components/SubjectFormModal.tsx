import React, { useState, useEffect, useMemo } from 'react';
import { Grade, SubjectDefinition } from '@/types';
import { GRADES_WITH_NO_ACTIVITIES } from '@/constants';
import { XIcon, CheckIcon, PlusIcon } from '@/components/Icons';
import { BookOpen, Sparkles } from 'lucide-react';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: SubjectDefinition, originalName?: string) => void;
  initialSubject?: SubjectDefinition | null;
  grade: Grade;
  existingSubjects?: SubjectDefinition[];
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
  grade,
  existingSubjects = []
}) => {
  const isEditing = Boolean(initialSubject);
  const defaultHasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);

  const [name, setName] = useState('');
  const [gradingSystem, setGradingSystem] = useState<'Numerical' | 'OABC'>('Numerical');
  const [examFullMarks, setExamFullMarks] = useState<number>(defaultHasActivities ? 60 : 100);
  const [activityFullMarks, setActivityFullMarks] = useState<number>(defaultHasActivities ? 40 : 0);
  const [error, setError] = useState<string | null>(null);

  // Populate initial values when modal opens or initialSubject changes
  useEffect(() => {
    if (isOpen) {
      if (initialSubject) {
        setName(initialSubject.name || '');
        const isGraded = initialSubject.gradingSystem === 'OABC';
        setGradingSystem(isGraded ? 'OABC' : 'Numerical');
        setExamFullMarks(initialSubject.examFullMarks ?? (defaultHasActivities ? 60 : 100));
        setActivityFullMarks(initialSubject.activityFullMarks ?? (defaultHasActivities ? 40 : 0));
      } else {
        setName('');
        setGradingSystem('Numerical');
        setExamFullMarks(defaultHasActivities ? 60 : 100);
        setActivityFullMarks(defaultHasActivities ? 40 : 0);
      }
      setError(null);
    }
  }, [isOpen, initialSubject, grade, defaultHasActivities]);

  // Suggested subjects based on grade
  const suggestions = useMemo(() => {
    const isPrePrimary = [Grade.NURSERY, Grade.KINDERGARTEN].includes(grade);
    const isPrimary = [Grade.I, Grade.II].includes(grade);
    const isMiddle = [Grade.III, Grade.IV, Grade.V, Grade.VI, Grade.VII, Grade.VIII].includes(grade);
    const isHigh = [Grade.IX, Grade.X].includes(grade);

    if (isPrePrimary) {
      return ['Rhymes', 'Conversation', 'Drawing', 'Numbers Oral', 'Numbers Writing', 'ABC Oral', 'ABC Writing', 'Coloring'];
    }
    if (isPrimary) {
      return ['English', 'Mizo', 'Mathematics', 'EVS', 'Spellings', 'Hindi', 'Cursive', 'Drawing', 'General Knowledge'];
    }
    if (isMiddle) {
      return ['English', 'English - II', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer', 'Drawing', 'Moral Science', 'Physical Education'];
    }
    if (isHigh) {
      return ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science', 'Work Education', 'Physical & Health Education'];
    }
    return ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer', 'Drawing'];
  }, [grade]);

  // Filter suggestions to ones not already in existingSubjects
  const availableSuggestions = useMemo(() => {
    const existingNorm = existingSubjects.map(s => s.name.trim().toLowerCase());
    return suggestions.filter(s => !existingNorm.includes(s.toLowerCase()));
  }, [suggestions, existingSubjects]);

  if (!isOpen) return null;

  const totalFullMarks = gradingSystem === 'OABC' ? 0 : (examFullMarks + activityFullMarks);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Subject name is required.');
      return;
    }

    // Check duplicate
    const isDuplicate = existingSubjects.some(s => {
      if (isEditing && initialSubject && s.name.trim().toLowerCase() === initialSubject.name.trim().toLowerCase()) {
        return false;
      }
      return s.name.trim().toLowerCase() === trimmedName.toLowerCase();
    });

    if (isDuplicate) {
      setError(`A subject named "${trimmedName}" already exists for ${grade}.`);
      return;
    }

    const newSubj: SubjectDefinition = {
      name: trimmedName,
      examFullMarks: gradingSystem === 'OABC' ? 0 : Number(examFullMarks) || 0,
      activityFullMarks: gradingSystem === 'OABC' ? 0 : Number(activityFullMarks) || 0,
      ...(gradingSystem === 'OABC' ? { gradingSystem: 'OABC' } : {})
    };

    onSave(newSubj, initialSubject?.name);
    onClose();
  };

  const applyPreset = (exam: number, activity: number, isOABC: boolean = false) => {
    if (isOABC) {
      setGradingSystem('OABC');
      setExamFullMarks(0);
      setActivityFullMarks(0);
    } else {
      setGradingSystem('Numerical');
      setExamFullMarks(exam);
      setActivityFullMarks(activity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {isEditing ? `Edit Subject: ${initialSubject?.name}` : `Add New Subject`}
              </h3>
              <p className="text-xs text-sky-100 font-medium">
                Target Class: <span className="underline decoration-sky-300 font-semibold">{grade}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Subject Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. English, Science, Mathematics..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-slate-800 text-sm font-medium transition-all"
            />

            {/* Suggestions Chips */}
            {!isEditing && availableSuggestions.length > 0 && (
              <div className="mt-2.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick suggestions for {grade}:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {availableSuggestions.slice(0, 10).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => {
                        setName(sugg);
                        if (error) setError(null);
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grading System Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Evaluation & Grading Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGradingSystem('Numerical')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  gradingSystem === 'Numerical'
                    ? 'border-sky-600 bg-sky-50/70 text-sky-900 font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm">Numerical Marks</span>
                <span className="text-[11px] font-normal text-slate-500 mt-0.5">Scored out of Full Marks (FM)</span>
              </button>

              <button
                type="button"
                onClick={() => setGradingSystem('OABC')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  gradingSystem === 'OABC'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm">Graded Subject (OABC)</span>
                <span className="text-[11px] font-normal text-slate-500 mt-0.5">Letter Grades (O, A, B, C)</span>
              </button>
            </div>
          </div>

          {/* Numerical Marks Inputs */}
          {gradingSystem === 'Numerical' ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Marks Allocation
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Total Full Marks: {totalFullMarks}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Exam / Theory Full Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    required
                    value={examFullMarks}
                    onChange={(e) => setExamFullMarks(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-center font-bold text-slate-800 text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Activity / Internal Full Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={activityFullMarks}
                    onChange={(e) => setActivityFullMarks(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-center font-bold text-slate-800 text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Common Schemes:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset(100, 0)}
                    className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium"
                  >
                    100 (Exam only)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(60, 40)}
                    className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium"
                  >
                    60 Exam + 40 Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(80, 20)}
                    className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium"
                  >
                    80 Exam + 20 Internal
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(50, 0)}
                    className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium"
                  >
                    50 Full Marks
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4 text-purple-700" /> Graded (OABC) Subject Selected
              </p>
              <p className="text-purple-700">
                Students will be awarded letter grades (<strong>O</strong> = Outstanding, <strong>A</strong> = Excellent, <strong>B</strong> = Good, <strong>C</strong> = Satisfactory). This subject will not count towards numeric percentage or total marks.
              </p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              {isEditing ? 'Save Subject Changes' : 'Add Subject to Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectFormModal;
