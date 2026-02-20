
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Exam, SubjectMark, Grade, GradeDefinition, User, ActivityLog, SubjectAssignment, Attendance, StudentStatus } from '@/types';
import { TERMINAL_EXAMS, CONDUCT_GRADE_LIST, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '@/constants';
import { BackIcon, EditIcon, CheckIcon, XIcon, HomeIcon, SpinnerIcon } from '@/components/Icons';
import ActivityLogModal from '@/components/ActivityLogModal';
import ExamPerformanceCard from '@/components/ExamPerformanceCard';
import { normalizeSubjectName, subjectsMatch } from '@/utils';
import { db } from '@/firebaseConfig';

const { Link, useParams } = ReactRouterDOM as any;

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
  const [classmates, setClassmates] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [performanceData, setPerformanceData] = useState<Exam[]>([]);
  const [editingActivityLogFor, setEditingActivityLogFor] = useState<{ examId: string, subjectName: string } | null>(null);
  
  const isSubjectTeacherForThisClass = useMemo(() => {
    if (!student) return false;
    return assignedSubjects.some(s => s.grade === student.grade);
  }, [assignedSubjects, student]);

  const canEdit = user.role === 'admin' || (student && student.grade === assignedGrade) || isSubjectTeacherForThisClass;

  useEffect(() => {
    if (student) {
      const unsubscribe = db.collection('students')
        .where('grade', '==', student.grade)
        .where('status', '==', StudentStatus.ACTIVE)
        .onSnapshot(snapshot => {
          const fetchedClassmates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
          setClassmates(fetchedClassmates);
        });
      
      return () => unsubscribe();
    }
  }, [student]);

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
        const existingResult = existingExam?.results.find(r => subjectsMatch(r.subject, sd.name));
        
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
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Academic Performance</h1>
                <p className="text-slate-700 text-lg mt-1 font-semibold">{student.name}</p>
            </div>
            {canEdit && (
                <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`btn ${isEditing ? 'btn-primary bg-emerald-600 hover:bg-emerald-700' : 'btn-primary'}`}>
                    {isEditing ? <CheckIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5"/>}
                    {isEditing ? 'Save Changes' : 'Edit Records'}
                </button>
            )}
        </div>

        <div className="space-y-8">
            {performanceData.map(exam => (
                <ExamPerformanceCard
                    key={exam.id}
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
            ))}
        </div>
        {editingActivityLogFor && (
            <ActivityLogModal
                isOpen={!!editingActivityLogFor}
                onClose={() => setEditingActivityLogFor(null)}
                onLogChange={(log: ActivityLog) => {
                    if (student && editingActivityLogFor) {
                        const newPerformanceData = performanceData.map(exam => {
                            if (exam.id === editingActivityLogFor.examId) {
                                const newResults = exam.results.map(result => {
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
                initialLog={performanceData.find(e => e.id === editingActivityLogFor.examId)?.results.find(r => r.subject === editingActivityLogFor.subjectName)?.activityLog}
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
