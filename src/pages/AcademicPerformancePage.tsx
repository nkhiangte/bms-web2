

import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Exam, SubjectMark, Grade, GradeDefinition, User, ActivityLog, SubjectAssignment, Attendance, StudentStatus } from '@/types';
import { TERMINAL_EXAMS, CONDUCT_GRADE_LIST, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '@/constants';
import { BackIcon, EditIcon, CheckIcon, XIcon, HomeIcon, SpinnerIcon, PrinterIcon, AwardIcon, TrendingUpIcon } from '@/components/Icons';
import ActivityLogModal from '@/components/ActivityLogModal';
import ExamPerformanceCard from '@/components/ExamPerformanceCard';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import { normalizeSubjectName, subjectsMatch, normalizeAcademicYear, getProcessedClassData } from '@/utils';
import { db } from '@/firebaseConfig';

const { useParams, Link } = ReactRouterDOM as any;

interface AcademicPerformancePageProps {
  students: Student[];
  onUpdateAcademic: (studentId: string, performance: Exam[]) => Promise<void>;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
  assignedSubjects: SubjectAssignment[];
}

const AcademicPerformancePage: React.FC<AcademicPerformancePageProps> = ({ students, onUpdateAcademic, gradeDefinitions, academicYear, user, assignedGrade, assignedSubjects }) => {
  const { studentId } = useParams() as { studentId: string };

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

  const studentYear = useMemo(() => student?.academicYear || academicYear, [student, academicYear]);
  
  const classmates = useMemo(() => {
    if (!student) return [];
    return students.filter(s => {
        const matchesGrade = s.grade === student.grade;
        const matchesStatus = s.status === StudentStatus.ACTIVE || 
                              s.status === StudentStatus.TRANSFERRED || 
                              s.status === StudentStatus.GRADUATED || 
                              s.status === StudentStatus.DROPPED;
        const studentYearNorm = normalizeAcademicYear(s.academicYear);
        const selectedYearNorm = normalizeAcademicYear(studentYear);
        const matchesYear = studentYearNorm === selectedYearNorm;
        
        return matchesGrade && matchesStatus && matchesYear;
    });
  }, [students, student, studentYear]);

  const [isEditing, setIsEditing] = useState(false);
  const [performanceData, setPerformanceData] = useState<Exam[]>([]);
  const [editingActivityLogFor, setEditingActivityLogFor] = useState<{ examId: string, subjectName: string } | null>(null);
  
  const isSubjectTeacherForThisClass = useMemo(() => {
    if (!student) return false;
    return assignedSubjects.some(s => s.grade === student.grade);
  }, [assignedSubjects, student]);

  const canEdit = user.role === 'admin' || (student && student.grade === assignedGrade) || isSubjectTeacherForThisClass;

  useEffect(() => {
    if (!student) return;
    const gradeDef = gradeDefinitions[student.grade];
    if (!gradeDef || !Array.isArray(gradeDef.subjects)) return;

    const studentPerformance = student.academicPerformance || [];
    const subjects = gradeDef.subjects;

    const initialData = TERMINAL_EXAMS.map(examTemplate => {
      const existingExam = studentPerformance.find(e => 
          e.id === examTemplate.id || (e.name && e.name.trim().toLowerCase() === examTemplate.name.trim().toLowerCase())
      );
      const results: SubjectMark[] = subjects.map(sd => {
        const existingResult = Array.isArray(existingExam?.results) ? existingExam.results.find(r => subjectsMatch(r.subject, sd.name)) : undefined;
        
        return {
          subject: sd.name,
          marks: existingResult?.marks,
          examMarks: existingResult?.examMarks ?? existingResult?.marks,
          activityMarks: existingResult?.activityMarks,
          activityLog: existingResult?.activityLog,
          grade: existingResult?.grade,
        };
      });

      return {
        ...examTemplate,
        results,
        teacherRemarks: existingExam?.teacherRemarks || '',
        generalConduct: existingExam?.generalConduct,
        attendance: existingExam?.attendance,
      } as Exam;
    });
    setPerformanceData(initialData);
  }, [student, gradeDefinitions]);

  const handleUpdateExamData = (examId: string, field: 'results' | 'teacherRemarks' | 'generalConduct' | 'attendance', value: any) => {
    setPerformanceData(prev => prev.map(exam => exam.id === examId ? { ...exam, [field]: value } : exam));
  };

  const handleSave = async () => {
    if(student) {
      await onUpdateAcademic(student.id, performanceData);
    }
    setIsEditing(false);
  };

  if (!student) return <div className="text-center py-20"><SpinnerIcon className="w-10 h-10 mx-auto text-sky-600"/></div>;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
             <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5" /> Back</button>
             <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800"> <HomeIcon className="w-5 h-5" /> Home</Link>
        </div>
        <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full shadow-lg border-2 border-white flex-shrink-0">
                    <PhotoWithFallback src={student.photographUrl} alt={student.name} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Academic Performance</h1>
                    <p className="text-slate-700 text-lg mt-1 font-semibold">{student.name}</p>
                </div>
            </div>
            {canEdit && (
                <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`btn ${isEditing ? 'btn-primary bg-emerald-600 hover:bg-emerald-700' : 'btn-primary'}`}>
                    {isEditing ? <CheckIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5"/>}
                    {isEditing ? 'Save Changes' : 'Edit Records'}
                </button>
            )}
        </div>

        <div className="space-y-8">
            {performanceData.map(exam => {
                const processedClass = getProcessedClassData(classmates, student.grade, exam.id as any, gradeDefinitions, studentYear);
                const studentSummary = processedClass.find(s => s.id === student.id);
                const classAvg = processedClass.length > 0 
                    ? (processedClass.reduce((acc, curr) => acc + curr.percentage, 0) / processedClass.length).toFixed(1)
                    : '0.0';

                return (
                    <div key={exam.id} className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <AwardIcon className="w-6 h-6 text-sky-600"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{exam.name} - Summary</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                         <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                             Rank: <span className="text-sky-700">{studentSummary?.rank || '-'}</span>
                                         </p>
                                         <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                             Percentage: <span className="text-sky-700">{studentSummary?.percentage?.toFixed(1) || '0.0'}%</span>
                                         </p>
                                         <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                             Class Avg: <span className="text-indigo-700">{classAvg}%</span>
                                         </p>
                                    </div>
                                </div>
                             </div>
                             <Link 
                                to={`/portal/progress-report/${student.id}/${exam.id}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-sky-200 text-sky-700 font-bold rounded-lg hover:bg-sky-50 transition-all shadow-sm"
                             >
                                <PrinterIcon className="w-5 h-5"/> Download Report Card (PDF)
                             </Link>
                        </div>

                        <ExamPerformanceCard
                            exam={exam}
                            student={student}
                            gradeDefinitions={gradeDefinitions}
                            allStudents={classmates}
                            isEditing={isEditing}
                            canEdit={canEdit}
                            onUpdateExamData={handleUpdateExamData}
                            onOpenActivityLog={(examId, subj) => setEditingActivityLogFor({examId, subjectName: subj})}
                            academicYear={academicYear}
                        />
                    </div>
                );
            })}
        </div>
        {editingActivityLogFor && (
            <ActivityLogModal
                isOpen={!!editingActivityLogFor}
                onClose={() => setEditingActivityLogFor(null)}
                onLogChange={(log: ActivityLog) => {
                    if (student && editingActivityLogFor) {
                        const newPerformanceData = performanceData.map(exam => {
                            if (exam.id === editingActivityLogFor.examId) {
                                const newResults = (Array.isArray(exam.results) ? exam.results : []).map(result => {
                                    if (result.subject === editingActivityLogFor.subjectName) {
                                        const totalActivityMarks = Math.round(
                                            (log.classTest.scaledMarks || 0) + 
                                            (log.homework.scaledMarks || 0) + 
                                            (log.project.scaledMarks || 0)
                                        );
                                        return { ...result, activityLog: log, activityMarks: totalActivityMarks };
                                    }
                                    return result;
                                });
                                return { ...exam, results: newResults };
                            }
                            return exam;
                        });
                        setPerformanceData(newPerformanceData);
                        onUpdateAcademic(student.id, newPerformanceData); // Persist changes immediately
                    }
                }}
                studentName={student?.name || ''}
                examName={editingActivityLogFor.examId}
                subjectName={editingActivityLogFor.subjectName}
                initialLog={performanceData.find(e => e.id === editingActivityLogFor.examId)?.results?.find?.(r => r.subject === editingActivityLogFor.subjectName)?.activityLog}
                // Placeholder navigation handlers for now
                onNavigate={() => {}}
                canNavigatePrev={false}
                canNavigateNext={false}
            />
        )}
    </div>
  );
};

export default AcademicPerformancePage;
