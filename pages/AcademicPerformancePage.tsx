import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Exam, SubjectMark, Grade, GradeDefinition, User, ActivityLog, SubjectAssignment, Attendance } from '../types';
import { TERMINAL_EXAMS, CONDUCT_GRADE_LIST, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';
// Import SpinnerIcon to resolve the error on line 83
import { BackIcon, EditIcon, CheckIcon, XIcon, HomeIcon, SpinnerIcon } from '../components/Icons';
import ActivityLogModal from '../components/ActivityLogModal';
import ExamPerformanceCard from '../components/ExamPerformanceCard';
import { normalizeSubjectName } from '../utils';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

interface AcademicPerformancePageProps {
  students: Student[];
  onUpdateAcademic: (studentId: string, performance: Exam[]) => void;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
  assignedSubjects: SubjectAssignment[];
}

const AcademicPerformancePage: React.FC<AcademicPerformancePageProps> = ({ students, onUpdateAcademic, gradeDefinitions, academicYear, user, assignedGrade, assignedSubjects }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
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
      const existingExam = studentPerformance.find(e => e.id === examTemplate.id);
      const results: SubjectMark[] = subjects.map(sd => {
        const normSubjName = normalizeSubjectName(sd.name);
        const existingResult = existingExam?.results.find(r => {
            const normResultName = normalizeSubjectName(r.subject);
            if (normResultName === normSubjName) return true;
            // Fallbacks for legacy data
            if (normSubjName === 'english' && normResultName === 'english i') return true;
            if (normSubjName === 'english - ii' && normResultName === 'english ii') return true;
            if (normSubjName === 'social studies' && normResultName === 'social science') return true;
            return false;
        });
        
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

  const handleSave = () => {
    if(student) {
      onUpdateAcademic(student.id, performanceData);
    }
    setIsEditing(false);
  };

  // FIX: Using imported SpinnerIcon
  if (!student) return <div className="text-center py-20"><SpinnerIcon className="w-10 h-10 mx-auto text-sky-600"/></div>;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
             <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5" /> Back</button>
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
                    allStudents={students}
                    isEditing={isEditing}
                    canEdit={canEdit}
                    onUpdateExamData={handleUpdateExamData}
                    onOpenActivityLog={(examId, subj) => setEditingActivityLogFor({examId, subjectName: subj})}
                    academicYear={academicYear}
                />
            ))}
        </div>
    </div>
  );
};

export default AcademicPerformancePage;