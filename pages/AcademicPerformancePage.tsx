
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Exam, SubjectMark, Grade, GradeDefinition, User, ActivityLog, SubjectAssignment, Attendance } from '../types';
import { TERMINAL_EXAMS, CONDUCT_GRADE_LIST, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';
import { BackIcon, EditIcon, CheckIcon, XIcon, HomeIcon } from '../components/Icons';
import { formatStudentId, normalizeSubjectName, formatDateForDisplay } from '../utils';
import ActivityLogModal from '../components/ActivityLogModal';
import ExamPerformanceCard from '../components/ExamPerformanceCard';

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

  const originalPerformanceData = useMemo(() => {
    if (!student) return [];
    
    const gradeDef = gradeDefinitions[student.grade];
    if (!gradeDef || !Array.isArray(gradeDef.subjects)) return [];

    const subjectNamesForGrade = gradeDef.subjects.filter(Boolean).map(s => s.name);
    const studentPerformance = student.academicPerformance || [];

    return TERMINAL_EXAMS.map(examTemplate => {
      const existingExam = studentPerformance.find(e => e.id === examTemplate.id);
      
      const results: SubjectMark[] = subjectNamesForGrade.map(subjectName => {
        const existingResult = existingExam?.results.find(r => r.subject && normalizeSubjectName(r.subject) === normalizeSubjectName(subjectName));
        return {
          subject: subjectName,
          marks: existingResult?.marks,
          examMarks: existingResult?.examMarks,
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
  }, [student, gradeDefinitions]);

  useEffect(() => {
    setPerformanceData(originalPerformanceData);
  }, [originalPerformanceData]);

  const handleEditToggle = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setPerformanceData(originalPerformanceData);
    setIsEditing(false);
  };
  
  const handleSave = () => {
    if(student) {
      const cleanedPerformanceData = performanceData.map(exam => {
        // 1. Map over results to create clean copies of each result object,
        // ensuring no `undefined` properties are included.
        // 2. Filter out any results that have no data points (marks, grades, etc.).
        const cleanedResults = exam.results
          .map(r => {
            const newResult: Partial<SubjectMark> = { subject: r.subject };
            let hasData = false;
            
            if (r.marks != null) { newResult.marks = r.marks; hasData = true; }
            if (r.examMarks != null) { newResult.examMarks = r.examMarks; hasData = true; }
            if (r.activityMarks != null) { newResult.activityMarks = r.activityMarks; hasData = true; }
            // FIX: Removed invalid comparison `r.grade !== ''`. The type for `grade` is `'O' | 'A' | 'B' | 'C' | undefined` and cannot be an empty string, so `!= null` is sufficient.
            if (r.grade != null) { newResult.grade = r.grade; hasData = true; }
            if (r.activityLog != null) { newResult.activityLog = r.activityLog; hasData = true; }
            
            return hasData ? (newResult as SubjectMark) : null;
          })
          .filter((r): r is SubjectMark => r !== null);
        
        // Create a new exam object with the cleaned results.
        const cleanedExam: any = {
          ...exam,
          results: cleanedResults,
        };
        
        // Remove empty optional fields to keep Firestore data clean.
        if (exam.teacherRemarks && exam.teacherRemarks.trim()) {
            cleanedExam.teacherRemarks = exam.teacherRemarks.trim();
        } else {
            delete cleanedExam.teacherRemarks;
        }

        if (exam.generalConduct && exam.generalConduct.trim()) {
            cleanedExam.generalConduct = exam.generalConduct.trim();
        } else {
            delete cleanedExam.generalConduct;
        }
        
        if (exam.attendance) {
            cleanedExam.attendance = exam.attendance;
        } else {
            delete cleanedExam.attendance;
        }

        return cleanedExam as Exam;
      });

      onUpdateAcademic(student.id, cleanedPerformanceData);
    }
    setIsEditing(false);
  };

  const handleUpdateExamData = (examId: string, field: 'results' | 'teacherRemarks' | 'generalConduct' | 'attendance', value: any) => {
    setPerformanceData(prev => 
      prev.map(exam => exam.id === examId ? { ...exam, [field]: value } : exam)
    );
  };

  const handleOpenActivityLog = (examId: string, subjectName: string) => {
    setEditingActivityLogFor({ examId, subjectName });
  };
  
  const handleActivityLogChange = (log: ActivityLog) => {
      if (!editingActivityLogFor) return;
  
      const { examId, subjectName } = editingActivityLogFor;
      
      const total = Math.round(
        (log.classTest?.scaledMarks || 0) +
        (log.homework?.scaledMarks || 0) +
        (log.project?.scaledMarks || 0)
      );
  
      setPerformanceData(prev => 
        prev.map(exam => {
          if (exam.id === examId) {
            
            let subjectFound = false;
            const newResults = exam.results.map(result => {
              if (result.subject === subjectName) {
                subjectFound = true;
                return { ...result, activityLog: log, activityMarks: total };
              }
              return result;
            });
            
            if (!subjectFound) {
                newResults.push({ subject: subjectName, activityLog: log, activityMarks: total });
            }

            return { ...exam, results: newResults };
          }
          return exam;
        })
      );
  };

  const currentActivityLogData = useMemo(() => {
      if (!editingActivityLogFor) return undefined;
      const exam = performanceData.find(e => e.id === editingActivityLogFor.examId);
      const result = exam?.results.find(r => r.subject === editingActivityLogFor.subjectName);
      return result?.activityLog;
  }, [editingActivityLogFor, performanceData]);

  if (!student) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
            <p className="text-slate-700 mt-2">The requested student profile does not exist.</p>
            <button
                onClick={() => navigate('/portal/students')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to List
            </button>
        </div>
    );
  }
  
  const gradeDef = gradeDefinitions[student.grade];

  if (!gradeDef || !Array.isArray(gradeDef.subjects)) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600">Invalid Configuration</h2>
            <p className="text-slate-700 mt-2">Could not load academic records. The subject list for {student.grade} is missing or invalid.</p>
            <button onClick={() => navigate('/portal/classes')} className="mt-6 btn btn-primary">Back to Classes</button>
        </div>
      );
  }

  return (
    <>
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
             <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                Back
            </button>
             <Link
                to="/portal/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                title="Go to Home/Dashboard"
            >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
            </Link>
        </div>
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Academic Performance</h1>
                <p className="text-slate-700 text-lg mt-1 font-semibold">{student.name} ({formatStudentId(student, academicYear)})</p>
                <div className="text-slate-600 text-sm mt-1">
                    <span><strong>S/o:</strong> {student.fatherName}</span>
                    <span className="mx-2">|</span>
                    <span><strong>DOB:</strong> {formatDateForDisplay(student.dateOfBirth)}</span>
                </div>
            </div>
            <div className="flex gap-3">
                {canEdit && (
                  isEditing ? (
                      <>
                          <button
                              onClick={handleCancel}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                          >
                              <XIcon className="h-5 h-5" />
                              Cancel
                          </button>
                          <button
                              onClick={handleSave}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
                          >
                              <CheckIcon className="h-5 h-5" />
                              Save Changes
                          </button>
                      </>
                  ) : (
                      <button
                          onClick={handleEditToggle}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                      >
                          <EditIcon className="h-5 h-5" />
                          Edit Records
                      </button>
                  )
                )}
            </div>
        </div>

        <div>
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
                    onOpenActivityLog={handleOpenActivityLog}
                    academicYear={academicYear}
                />
            ))}
        </div>
    </div>
     {editingActivityLogFor && student && (
        <ActivityLogModal
            isOpen={!!editingActivityLogFor}
            onClose={() => setEditingActivityLogFor(null)}
            onLogChange={handleActivityLogChange}
            studentName={student.name}
            examName={performanceData.find(e => e.id === editingActivityLogFor.examId)?.name || ''}
            subjectName={editingActivityLogFor.subjectName}
            initialLog={currentActivityLogData}
            onNavigate={() => {}}
            canNavigatePrev={false}
            canNavigateNext={false}
        />
    )}
    </>
  );
};

export default AcademicPerformancePage;
