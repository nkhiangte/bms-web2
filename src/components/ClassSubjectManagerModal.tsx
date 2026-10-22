import React, { useState } from 'react';
import { Grade, GradeDefinition, SubjectDefinition, Staff } from '@/types';
import { GRADE_DEFINITIONS, GRADES_WITH_NO_ACTIVITIES } from '@/constants';
import { PlusIcon, TrashIcon, EditIcon, XIcon, CheckIcon } from '@/components/Icons';
import { ArrowUp, ArrowDown, BookOpen, Copy, RotateCcw, Award, Layers } from 'lucide-react';
import SubjectFormModal from '@/components/SubjectFormModal';
import DeleteSubjectModal from '@/components/DeleteSubjectModal';
import CopySubjectsModal from '@/components/CopySubjectsModal';

interface ClassSubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: Grade;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => void;
  staff?: Staff[];
  isAdmin?: boolean;
}

export const ClassSubjectManagerModal: React.FC<ClassSubjectManagerModalProps> = ({
  isOpen,
  onClose,
  grade,
  gradeDefinitions,
  onUpdateGradeDefinition,
  staff = [],
  isAdmin = true
}) => {
  const [editingSubject, setEditingSubject] = useState<SubjectDefinition | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectDefinition | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  if (!isOpen || !grade) return null;

  const currentDef = gradeDefinitions[grade] || { subjects: [] };
  const subjects = currentDef.subjects || [];
  const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);

  // Find class teacher if assigned
  const classTeacher = staff.find(s => s.id === currentDef.classTeacherId);

  // Save / Update a single subject
  const handleSaveSubject = (savedSubject: SubjectDefinition, originalName?: string) => {
    let updatedSubjects = [...subjects];
    if (originalName) {
      // Editing existing subject
      const index = updatedSubjects.findIndex(
        s => s.name.trim().toLowerCase() === originalName.trim().toLowerCase()
      );
      if (index !== -1) {
        updatedSubjects[index] = savedSubject;
      } else {
        updatedSubjects.push(savedSubject);
      }
    } else {
      // Adding new subject
      updatedSubjects.push(savedSubject);
    }

    onUpdateGradeDefinition(grade, {
      ...currentDef,
      subjects: updatedSubjects
    });
  };

  // Delete a subject
  const handleConfirmDelete = () => {
    if (!subjectToDelete) return;
    const updatedSubjects = subjects.filter(
      s => s.name.trim().toLowerCase() !== subjectToDelete.name.trim().toLowerCase()
    );
    onUpdateGradeDefinition(grade, {
      ...currentDef,
      subjects: updatedSubjects
    });
    setIsDeleteModalOpen(false);
    setSubjectToDelete(null);
  };

  // Move subject up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subjects.length) return;

    const updated = [...subjects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onUpdateGradeDefinition(grade, {
      ...currentDef,
      subjects: updated
    });
  };

  // Copy subjects from another grade
  const handleCopySubjects = (targetG: Grade, newSubjects: SubjectDefinition[]) => {
    onUpdateGradeDefinition(targetG, {
      ...currentDef,
      subjects: newSubjects
    });
  };

  // Reset to default subjects from constants
  const handleResetToDefaults = () => {
    if (window.confirm(`Reset ${grade} subjects to standard school defaults? Any custom subjects for ${grade} will be restored to default template.`)) {
      const defaultSubjects = GRADE_DEFINITIONS[grade]?.subjects || [];
      onUpdateGradeDefinition(grade, {
        ...currentDef,
        subjects: JSON.parse(JSON.stringify(defaultSubjects))
      });
    }
  };

  // Find teachers assigned to the subject being deleted
  const getAssignedTeachersForSubject = (subjName: string) => {
    const norm = subjName.trim().toLowerCase();
    return staff.filter(s => 
      s.assignedSubjects?.some(as => as.grade === grade && as.subject.trim().toLowerCase() === norm)
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-indigo-800 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shadow-inner">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white leading-tight">Class Subjects: {grade}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                    {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
                  </span>
                </div>
                <p className="text-xs text-sky-100 mt-0.5">
                  {hasActivities ? 'Scheme: Theory (60) + Activity (40) / Graded' : 'Scheme: Theory (100) / Graded'}
                  {classTeacher && ` • Class Teacher: ${classTeacher.firstName} ${classTeacher.lastName}`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Toolbar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium">
              Manage curriculum, reorder priority, and configure full marks for <span className="font-bold text-slate-800">{grade}</span>.
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Copy subjects from another grade"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  Copy from Class
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Restore default subjects from school curriculum"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Defaults
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject(null);
                    setIsAddEditModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Subject
                </button>
              </div>
            )}
          </div>

          {/* Subjects Table / List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
            {subjects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No subjects currently configured for {grade}.</p>
                <p className="text-xs text-slate-500 mt-1">Click "Add Subject" or "Defaults" above to set up subjects.</p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubject(null);
                      setIsAddEditModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow inline-flex items-center gap-1.5"
                  >
                    <PlusIcon className="w-4 h-4" /> Add First Subject
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                {subjects.map((subject, index) => {
                  const isGraded = subject.gradingSystem === 'OABC';
                  const totalFM = isGraded ? null : (subject.examFullMarks + subject.activityFullMarks);

                  return (
                    <div 
                      key={`${subject.name}-${index}`}
                      className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      {/* Left: Reorder controls + Index + Name */}
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMove(index, 'up')}
                              disabled={index === 0}
                              className="p-0.5 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(index, 'down')}
                              disabled={index === subjects.length - 1}
                              className="p-0.5 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <span className="w-6 text-center text-xs font-mono font-semibold text-slate-400">
                          {index + 1}.
                        </span>

                        <div>
                          <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {subject.name}
                            {isGraded && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                <Award className="w-3 h-3 text-purple-600" /> Graded (OABC)
                              </span>
                            )}
                          </div>
                          
                          {/* Marks distribution subtitle */}
                          {!isGraded && (
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Theory/Exam: <strong className="text-slate-700 font-semibold">{subject.examFullMarks}</strong></span>
                              {hasActivities && (
                                <>
                                  <span>•</span>
                                  <span>Activity: <strong className="text-slate-700 font-semibold">{subject.activityFullMarks}</strong></span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Badges and Action Buttons */}
                      <div className="flex items-center gap-3">
                        {!isGraded && (
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-800 bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                              FM: {totalFM}
                            </span>
                          </div>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSubject(subject);
                                setIsAddEditModalOpen(true);
                              }}
                              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title={`Edit ${subject.name}`}
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSubjectToDelete(subject);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={`Remove ${subject.name}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Changes update automatically across report cards, attendance, and routines.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modal: Add / Edit Subject */}
      <SubjectFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
        grade={grade}
        existingSubjects={subjects}
      />

      {/* Sub-modal: Delete Subject */}
      <DeleteSubjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSubjectToDelete(null);
        }}
        subject={subjectToDelete}
        grade={grade}
        assignedTeachers={subjectToDelete ? getAssignedTeachersForSubject(subjectToDelete.name) : []}
        onConfirm={handleConfirmDelete}
      />

      {/* Sub-modal: Copy Subjects */}
      <CopySubjectsModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        targetGrade={grade}
        gradeDefinitions={gradeDefinitions}
        onCopy={handleCopySubjects}
      />
    </>
  );
};

export default ClassSubjectManagerModal;
