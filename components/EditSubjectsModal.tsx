

import React, { useState, useEffect } from 'react';
import { Grade, GradeDefinition, SubjectDefinition } from '@/types';
import { PlusIcon, TrashIcon } from './Icons';
import { GRADES_WITH_NO_ACTIVITIES } from '../constants';

interface EditSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDefinition: GradeDefinition) => void;
  grade: Grade;
  initialGradeDefinition: GradeDefinition;
}

const EditSubjectsModal: React.FC<EditSubjectsModalProps> = ({ isOpen, onClose, onSave, grade, initialGradeDefinition }) => {
  const [subjects, setSubjects] = useState<SubjectDefinition[]>([]);
  const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);

  useEffect(() => {
    if (isOpen && initialGradeDefinition) {
      // Deep copy to prevent modifying the original state directly
      setSubjects(JSON.parse(JSON.stringify(initialGradeDefinition.subjects || [])));
    }
  }, [isOpen, initialGradeDefinition]);

  const handleSubjectChange = (index: number, field: keyof SubjectDefinition, value: string | number) => {
    const newSubjects = [...subjects];
    const subjectToUpdate = { ...newSubjects[index] };

    if (field === 'name') {
        subjectToUpdate[field] = value as string;
    } else if (field === 'examFullMarks' || field === 'activityFullMarks') {
        subjectToUpdate[field] = parseInt(value as string, 10) || 0;
    }
    
    newSubjects[index] = subjectToUpdate;
    setSubjects(newSubjects);
  };

  const handleGradingSystemChange = (index: number, isOABC: boolean) => {
    const newSubjects = [...subjects];
    const subjectToUpdate = { ...newSubjects[index] };
    if (isOABC) {
        subjectToUpdate.gradingSystem = 'OABC';
        subjectToUpdate.examFullMarks = 0;
        subjectToUpdate.activityFullMarks = 0;
    } else {
        delete subjectToUpdate.gradingSystem;
        // Reset to default marks when unchecked
        const isMiddleSchool = [Grade.III, Grade.IV, Grade.V, Grade.VI, Grade.VII, Grade.VIII].includes(grade);
        if (isMiddleSchool) {
            subjectToUpdate.examFullMarks = 60;
            subjectToUpdate.activityFullMarks = 40;
        } else {
            subjectToUpdate.examFullMarks = 100;
            subjectToUpdate.activityFullMarks = 0;
        }
    }
    newSubjects[index] = subjectToUpdate;
    setSubjects(newSubjects);
  };

  const handleAddSubject = () => {
    const isMiddleSchool = [Grade.III, Grade.IV, Grade.V, Grade.VI, Grade.VII, Grade.VIII].includes(grade);
    
    const newSubject: SubjectDefinition = { 
        name: '', 
        examFullMarks: 100, 
        activityFullMarks: 0 
    };

    if (isMiddleSchool) {
        newSubject.examFullMarks = 60;
        newSubject.activityFullMarks = 40;
    }
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Filter out any empty subject names before saving
    const cleanedSubjects = subjects.filter(s => s.name.trim() !== '');
    onSave({ ...initialGradeDefinition, subjects: cleanedSubjects });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">Edit Subjects for {grade}</h2>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-600 px-2 mb-2">
                <div className="col-span-5">Subject Name</div>
                {hasActivities ? (
                    <>
                        <div className="col-span-2 text-center">Exam FM</div>
                        <div className="col-span-2 text-center">Activity FM</div>
                    </>
                ) : (
                    <div className="col-span-3 text-center">Full Marks</div>
                )}
                 <div className="col-span-2 text-center">Graded (OABC)</div>
                 <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {subjects.map((subject, index) => {
                const isGraded = subject.gradingSystem === 'OABC';
                return (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded-lg">
                    <div className="col-span-5">
                        <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                            className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm"
                            placeholder="Enter subject name"
                        />
                    </div>
                    {hasActivities ? (
                        <>
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    value={subject.examFullMarks}
                                    onChange={(e) => handleSubjectChange(index, 'examFullMarks', e.target.value)}
                                    className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm text-center disabled:bg-slate-200 disabled:cursor-not-allowed"
                                    disabled={isGraded}
                                />
                            </div>
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    value={subject.activityFullMarks}
                                    onChange={(e) => handleSubjectChange(index, 'activityFullMarks', e.target.value)}
                                    className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm text-center disabled:bg-slate-200 disabled:cursor-not-allowed"
                                    disabled={isGraded}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="col-span-3">
                            <input
                                type="number"
                                value={subject.examFullMarks}
                                onChange={(e) => handleSubjectChange(index, 'examFullMarks', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm text-center disabled:bg-slate-200 disabled:cursor-not-allowed"
                                disabled={isGraded}
                            />
                        </div>
                    )}
                     <div className="col-span-2 flex justify-center items-center">
                        <input
                            type="checkbox"
                            checked={isGraded}
                            onChange={e => handleGradingSystemChange(index, e.target.checked)}
                            className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                     </div>
                    <div className="col-span-1 flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleRemoveSubject(index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            title="Remove subject"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleAddSubject}
              className="mt-3 flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200"
            >
              <PlusIcon className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSubjectsModal;