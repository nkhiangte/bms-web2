import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, GradeDefinition, SubjectDefinition, User, Staff, Student } from '@/types';
import { GRADES_LIST, GRADES_WITH_NO_ACTIVITIES, GRADE_DEFINITIONS } from '@/constants';
import { BackIcon, HomeIcon, EditIcon, BookOpenIcon, TrashIcon, PlusIcon, SearchIcon } from '@/components/Icons';
import { ArrowUp, ArrowDown, Copy, RotateCcw, Award, CheckCircle, Sparkles, Filter, Layers } from 'lucide-react';
import SubjectFormModal from '@/components/SubjectFormModal';
import DeleteSubjectModal from '@/components/DeleteSubjectModal';
import CopySubjectsModal from '@/components/CopySubjectsModal';
import ConfirmationModal from '@/components/ConfirmationModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageSubjectsPageProps {
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => void;
  user: User;
  onResetAllMarks: () => Promise<void>;
  staff?: Staff[];
  students?: Student[];
}

type GradeFilterCategory = 'ALL' | 'PRE_PRIMARY' | 'PRIMARY' | 'MIDDLE' | 'HIGH';

export const ManageSubjectsPage: React.FC<ManageSubjectsPageProps> = ({
  gradeDefinitions,
  onUpdateGradeDefinition,
  user,
  onResetAllMarks,
  staff = [],
  students = []
}) => {
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<GradeFilterCategory>('ALL');
  const [selectedGradeTab, setSelectedGradeTab] = useState<Grade | 'ALL'>('ALL');

  // Modals state
  const [activeGradeForAdd, setActiveGradeForAdd] = useState<Grade | null>(null);
  const [subjectToEdit, setSubjectToEdit] = useState<{ grade: Grade; subject: SubjectDefinition } | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<{ grade: Grade; subject: SubjectDefinition } | null>(null);
  const [copyTargetGrade, setCopyTargetGrade] = useState<Grade | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Helper to categorize grades
  const getCategoryForGrade = (grade: Grade): GradeFilterCategory => {
    if ([Grade.NURSERY, Grade.KINDERGARTEN].includes(grade)) return 'PRE_PRIMARY';
    if ([Grade.I, Grade.II].includes(grade)) return 'PRIMARY';
    if ([Grade.III, Grade.IV, Grade.V, Grade.VI, Grade.VII, Grade.VIII].includes(grade)) return 'MIDDLE';
    if ([Grade.IX, Grade.X].includes(grade)) return 'HIGH';
    return 'MIDDLE';
  };

  // Filtered grades
  const filteredGrades = useMemo(() => {
    return GRADES_LIST.filter(grade => {
      // Category filter
      if (categoryFilter !== 'ALL' && getCategoryForGrade(grade) !== categoryFilter) {
        return false;
      }
      // Single grade tab filter
      if (selectedGradeTab !== 'ALL' && grade !== selectedGradeTab) {
        return false;
      }
      // Search term filter across subject names or grade name
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesGrade = grade.toLowerCase().includes(term);
        const subjects = gradeDefinitions[grade]?.subjects || [];
        const matchesSubject = subjects.some(s => s.name.toLowerCase().includes(term));
        return matchesGrade || matchesSubject;
      }
      return true;
    });
  }, [categoryFilter, selectedGradeTab, searchTerm, gradeDefinitions]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalSubjectsAcrossSchool = 0;
    let gradedCount = 0;
    GRADES_LIST.forEach(g => {
      const subjs = gradeDefinitions[g]?.subjects || [];
      totalSubjectsAcrossSchool += subjs.length;
      gradedCount += subjs.filter(s => s.gradingSystem === 'OABC').length;
    });
    return {
      totalClasses: GRADES_LIST.length,
      totalSubjects: totalSubjectsAcrossSchool,
      gradedSubjects: gradedCount,
      numericSubjects: totalSubjectsAcrossSchool - gradedCount
    };
  }, [gradeDefinitions]);

  // Handle adding or updating a subject
  const handleSaveSubject = (savedSubject: SubjectDefinition, originalName?: string) => {
    const targetGrade = subjectToEdit?.grade || activeGradeForAdd;
    if (!targetGrade) return;

    const currentDef = gradeDefinitions[targetGrade] || { subjects: [] };
    const currentSubjects = [...(currentDef.subjects || [])];

    if (originalName) {
      // Editing
      const idx = currentSubjects.findIndex(
        s => s.name.trim().toLowerCase() === originalName.trim().toLowerCase()
      );
      if (idx !== -1) {
        currentSubjects[idx] = savedSubject;
      } else {
        currentSubjects.push(savedSubject);
      }
    } else {
      // Adding new
      currentSubjects.push(savedSubject);
    }

    onUpdateGradeDefinition(targetGrade, {
      ...currentDef,
      subjects: currentSubjects
    });

    setActiveGradeForAdd(null);
    setSubjectToEdit(null);
  };

  // Handle removing a subject
  const handleConfirmDelete = () => {
    if (!subjectToDelete) return;
    const { grade, subject } = subjectToDelete;
    const currentDef = gradeDefinitions[grade] || { subjects: [] };
    const updatedSubjects = (currentDef.subjects || []).filter(
      s => s.name.trim().toLowerCase() !== subject.name.trim().toLowerCase()
    );

    onUpdateGradeDefinition(grade, {
      ...currentDef,
      subjects: updatedSubjects
    });

    setSubjectToDelete(null);
  };

  // Handle moving subject up/down
  const handleMoveSubject = (grade: Grade, index: number, direction: 'up' | 'down') => {
    const currentDef = gradeDefinitions[grade] || { subjects: [] };
    const subjects = [...(currentDef.subjects || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= subjects.length) return;

    const temp = subjects[index];
    subjects[index] = subjects[targetIndex];
    subjects[targetIndex] = temp;

    onUpdateGradeDefinition(grade, {
      ...currentDef,
      subjects
    });
  };

  // Copy subjects from another grade
  const handleCopySubjects = (targetGrade: Grade, newSubjects: SubjectDefinition[]) => {
    const currentDef = gradeDefinitions[targetGrade] || { subjects: [] };
    onUpdateGradeDefinition(targetGrade, {
      ...currentDef,
      subjects: newSubjects
    });
  };

  // Reset grade subjects to defaults
  const handleResetGradeToDefaults = (grade: Grade) => {
    if (window.confirm(`Restore standard default subjects for ${grade}? Custom changes for this class will be reset.`)) {
      const defaultSubjects = GRADE_DEFINITIONS[grade]?.subjects || [];
      const currentDef = gradeDefinitions[grade] || { subjects: [] };
      onUpdateGradeDefinition(grade, {
        ...currentDef,
        subjects: JSON.parse(JSON.stringify(defaultSubjects))
      });
    }
  };

  // Find teachers assigned to a subject in a grade
  const getAssignedTeachersForSubject = (grade: Grade, subjName: string) => {
    const norm = subjName.trim().toLowerCase();
    return staff.filter(s => 
      s.assignedSubjects?.some(as => as.grade === grade && as.subject.trim().toLowerCase() === norm)
    );
  };

  // Reset all marks (Danger Zone)
  const handleConfirmReset = async () => {
    setIsResetting(true);
    await onResetAllMarks();
    setIsResetting(false);
    setIsResetModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Navigation & Top Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
              <BackIcon className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <Link
                to="/portal/classes"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 transition-colors"
              >
                <BookOpenIcon className="w-4 h-4" />
                View Classes
              </Link>
              <Link
                to="/portal/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Manage Subjects by Class
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Configure curriculum, full marks (FM), evaluation scheme, and subject lists for each grade.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Classes: <span className="text-indigo-600 font-bold">{stats.totalClasses}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                Total Subjects: <span className="text-sky-800 font-bold">{stats.totalSubjects}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                Graded (OABC): <span className="text-purple-800 font-bold">{stats.gradedSubjects}</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject across all classes (e.g. Science, Mizo, English)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Section:
              </span>
              {[
                { id: 'ALL', label: 'All Classes' },
                { id: 'PRE_PRIMARY', label: 'Pre-Primary' },
                { id: 'PRIMARY', label: 'Primary (I-II)' },
                { id: 'MIDDLE', label: 'Middle (III-VIII)' },
                { id: 'HIGH', label: 'High (IX-X)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCategoryFilter(tab.id as GradeFilterCategory);
                    setSelectedGradeTab('ALL');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    categoryFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Class Quick Selection Chips */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedGradeTab('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedGradeTab === 'ALL'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Grades
            </button>
            {GRADES_LIST.map((g) => {
              const count = gradeDefinitions[g]?.subjects?.length || 0;
              const isSelected = selectedGradeTab === g;
              return (
                <button
                  key={g}
                  onClick={() => {
                    setSelectedGradeTab(g);
                    setCategoryFilter('ALL');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{g}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classes & Subjects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGrades.map(grade => {
            const gradeDef = gradeDefinitions[grade] || { subjects: [] };
            const subjects = gradeDef.subjects || [];
            const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);
            const teacher = staff.find(s => s.id === gradeDef?.classTeacherId);

            // Filter subjects if searching
            const displaySubjects = searchTerm.trim()
              ? subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
              : subjects;

            return (
              <div 
                key={grade} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col hover:border-slate-300 transition-all group"
              >
                {/* Class Card Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-slate-100/60 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shadow-inner">
                      {grade.replace('Class ', '').replace('Kindergarten', 'KG')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/portal/classes/${encodeURIComponent(grade)}`}
                          className="text-lg font-extrabold text-slate-800 hover:text-sky-600 transition-colors flex items-center gap-1.5"
                          title="Open class students"
                        >
                          {grade}
                        </Link>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
                          {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {hasActivities ? 'Theory (60) + Activity (40)' : 'Theory (100) Marks'}
                        {teacher && ` • ${teacher.firstName} ${teacher.lastName}`}
                      </p>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setCopyTargetGrade(grade)}
                          className="p-1.5 text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                          title={`Copy subjects to ${grade} from another class`}
                        >
                          <Copy className="w-4 h-4 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => handleResetGradeToDefaults(grade)}
                          className="p-1.5 text-xs text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                          title={`Restore default subjects for ${grade}`}
                        >
                          <RotateCcw className="w-4 h-4 text-amber-600" />
                        </button>

                        <button
                          onClick={() => {
                            setActiveGradeForAdd(grade);
                            setSubjectToEdit(null);
                          }}
                          className="px-2.5 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-all"
                          title={`Add new subject for ${grade}`}
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          Add Subject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subjects List */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  {subjects.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <BookOpenIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <p className="font-semibold text-slate-600">No subjects configured for {grade}.</p>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveGradeForAdd(grade);
                            setSubjectToEdit(null);
                          }}
                          className="mt-2 text-xs font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> Add First Subject
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {displaySubjects.map((subject, index) => {
                        const isGraded = subject.gradingSystem === 'OABC';
                        const totalFM = isGraded ? null : (subject.examFullMarks + subject.activityFullMarks);

                        return (
                          <div
                            key={`${grade}-${subject.name}-${index}`}
                            className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-lg transition-colors group/item"
                          >
                            {/* Left: Reorder controls + Subject Name */}
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isAdmin && (
                                <div className="flex flex-col gap-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleMoveSubject(grade, index, 'up')}
                                    disabled={index === 0}
                                    className="p-0.5 text-slate-400 hover:text-sky-600 hover:bg-slate-200 rounded disabled:opacity-20"
                                    title="Move up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveSubject(grade, index, 'down')}
                                    disabled={index === subjects.length - 1}
                                    className="p-0.5 text-slate-400 hover:text-sky-600 hover:bg-slate-200 rounded disabled:opacity-20"
                                    title="Move down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              <span className="text-xs font-mono font-semibold text-slate-400 w-4">
                                {index + 1}.
                              </span>

                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 text-sm truncate block">
                                  {subject.name}
                                </span>
                                {!isGraded && hasActivities && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Exam: {subject.examFullMarks} • Act: {subject.activityFullMarks}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right: Badges & Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isGraded ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                  <Award className="w-3 h-3 text-purple-600" /> Graded (OABC)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  FM: {totalFM}
                                </span>
                              )}

                              {isAdmin && (
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => setSubjectToEdit({ grade, subject })}
                                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                                    title={`Edit ${subject.name}`}
                                  >
                                    <EditIcon className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setSubjectToDelete({ grade, subject })}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title={`Remove ${subject.name}`}
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/portal/classes/${encodeURIComponent(grade)}`}
                      className="text-slate-500 hover:text-sky-700 font-semibold flex items-center gap-1"
                    >
                      View Students in {grade} →
                    </Link>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveGradeForAdd(grade);
                          setSubjectToEdit(null);
                        }}
                        className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Add Subject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Danger Zone */}
        {isAdmin && (
          <div className="mt-10 bg-red-50/50 rounded-2xl border border-red-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                  <TrashIcon className="w-5 h-5 text-red-600" />
                  Academic Reset Zone
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">
                  Caution: This irreversible action will wipe out all terminal examination marks for all students across the school.
                </p>
              </div>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
              >
                <TrashIcon className="w-4 h-4" />
                Reset All Academic Records
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Single Subject Modal */}
      {(activeGradeForAdd || subjectToEdit) && (
        <SubjectFormModal
          isOpen={Boolean(activeGradeForAdd || subjectToEdit)}
          onClose={() => {
            setActiveGradeForAdd(null);
            setSubjectToEdit(null);
          }}
          onSave={handleSaveSubject}
          initialSubject={subjectToEdit?.subject || null}
          grade={(subjectToEdit?.grade || activeGradeForAdd)!}
          existingSubjects={
            gradeDefinitions[(subjectToEdit?.grade || activeGradeForAdd)!]?.subjects || []
          }
        />
      )}

      {/* Delete Subject Confirmation Modal */}
      {subjectToDelete && (
        <DeleteSubjectModal
          isOpen={Boolean(subjectToDelete)}
          onClose={() => setSubjectToDelete(null)}
          subject={subjectToDelete.subject}
          grade={subjectToDelete.grade}
          assignedTeachers={getAssignedTeachersForSubject(
            subjectToDelete.grade,
            subjectToDelete.subject.name
          )}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Copy Subjects Modal */}
      {copyTargetGrade && (
        <CopySubjectsModal
          isOpen={Boolean(copyTargetGrade)}
          onClose={() => setCopyTargetGrade(null)}
          targetGrade={copyTargetGrade}
          gradeDefinitions={gradeDefinitions}
          onCopy={handleCopySubjects}
        />
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Confirm Reset All Academic Records"
        confirmDisabled={isResetting}
      >
        <div className="space-y-2 text-sm text-slate-700">
          <p className="font-semibold text-red-700">
            Warning: This action will permanently delete all student examination results and marks.
          </p>
          <p>
            Are you completely sure you want to proceed? This cannot be undone.
          </p>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default ManageSubjectsPage;