import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition, User } from '../types';
import { BackIcon, PrinterIcon, SpinnerIcon, SaveIcon, InboxArrowDownIcon, EditIcon, CogIcon, HomeIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';
import { ImportMarksModal } from '../components/ImportMarksModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EditSubjectsModal from '../components/EditSubjectsModal';
import { db } from '../firebaseConfig';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

interface ClassMarkStatementPageProps {
  students: Student[];
  academicYear: string;
  user: User;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateAcademic: (studentId: string, performance: Exam[]) => Promise<void>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => Promise<void>;
}

type MarksData = Record<string, Record<string, number | string | null>>;
type AttendanceData = Record<string, { totalWorkingDays: number | null, daysPresent: number | null }>;

interface ProcessedStudent extends Student {
    grandTotal: number;
    examTotal: number;
    activityTotal: number;
    percentage: number;
    result: string;
    division: string;
    academicGrade: string;
    remark: string;
    rank: number | '-';
}

type SortCriteria = 'rollNo' | 'name' | 'totalMarks';

const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!results) return undefined;
    const normSubjDefName = normalizeSubjectName(subjectDef.name);
    
    return results.find(r => {
        const normResultName = normalizeSubjectName(r.subject);
        if (normResultName === normSubjDefName) return true;
        const mathNames = ['math', 'maths', 'mathematics'];
        if (mathNames.includes(normSubjDefName) && mathNames.includes(normResultName)) return true;
        if (normSubjDefName === 'english' && normResultName === 'english i') return true;
        if (normSubjDefName === 'english - ii' && normResultName === 'english ii') return true;
        if (normSubjDefName === 'social studies' && normResultName === 'social science') return true;
        return false;
    });
};

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, academicYear, user, gradeDefinitions, onUpdateAcademic, onUpdateGradeDefinition }) => {
  const { grade: encodedGrade, examId } = useParams() as { grade: string; examId: string };
  const navigate = useNavigate();
  const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
  const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

  const classStudents = useMemo(() => {
    if (!grade) return [];
    return students.filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE).sort((a, b) => a.rollNo - b.rollNo);
  }, [students, grade]);

  const subjectDefinitions = useMemo(() => {
    if (!grade) return [];
    let subjects = gradeDefinitions[grade]?.subjects || [];
    if (grade === Grade.IX || grade === Grade.X) {
        subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activityFullMarks: 0 }));
    }
    return subjects;
  }, [grade, gradeDefinitions]);
  
  const hasActivities = useMemo(() => {
    if (!grade) return false;
    return !GRADES_WITH_NO_ACTIVITIES.includes(grade);
  }, [grade]);

  const [marksData, setMarksData] = useState<MarksData>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('rollNo');
  const [isEditSubjectsModalOpen, setIsEditSubjectsModalOpen] = useState(false);

  useEffect(() => {
    if (classStudents.length === 0) return;
    const initialMarks: MarksData = {};
    const initialAttendance: AttendanceData = {};
    classStudents.forEach(student => {
      initialMarks[student.id] = {};
      const studentExam = student.academicPerformance?.find(e => e.id === examId);
      initialAttendance[student.id] = {
          totalWorkingDays: studentExam?.attendance?.totalWorkingDays ?? null,
          daysPresent: studentExam?.attendance?.daysPresent ?? null,
      };
      subjectDefinitions.forEach(subjectDef => {
        const result = findResultWithAliases(studentExam?.results, subjectDef);
        if (subjectDef.gradingSystem === 'OABC') {
            initialMarks[student.id][subjectDef.name] = result?.grade ?? null;
        } else if (hasActivities) {
            initialMarks[student.id][subjectDef.name + '_exam'] = result?.examMarks ?? result?.marks ?? null;
            initialMarks[student.id][subjectDef.name + '_activity'] = result?.activityMarks ?? null;
        } else {
            initialMarks[student.id][subjectDef.name] = result?.marks ?? null;
        }
      });
    });
    setMarksData(initialMarks);
    setAttendanceData(initialAttendance);
  }, [classStudents, subjectDefinitions, examId, hasActivities]);

  const handleMarkChange = (studentId: string, subjectName: string, value: string, type: 'exam' | 'activity' | 'total' | 'grade') => {
    const subjectDef = subjectDefinitions.find(sd => sd.name === subjectName);
    if (!subjectDef) return;
    let key = subjectName;
    if (type === 'grade') {
        setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [key]: value }}));
        setChangedStudents(prev => new Set(prev).add(studentId));
        return;
    }
    let fullMarks = type === 'exam' ? subjectDef.examFullMarks : type === 'activity' ? subjectDef.activityFullMarks : subjectDef.examFullMarks;
    if (type === 'exam') key = subjectName + '_exam';
    else if (type === 'activity') key = subjectName + '_activity';
    if (!/^\d*$/.test(value)) return;
    const numericValue = value === '' ? null : Math.max(0, Math.min(parseInt(value, 10), fullMarks));
    setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [key]: numericValue }}));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };

  const handleApplyImport = (importedMarks: MarksData) => {
    setMarksData(prev => ({ ...prev, ...importedMarks }));
    setChangedStudents(prev => new Set([...prev, ...Object.keys(importedMarks)]));
  };

  const handleConfirmSave = async () => {
    if (!examDetails || changedStudents.size === 0) return;
    setIsSaving(true);
    const updatePromises = Array.from(changedStudents).map(studentId => {
        const student = classStudents.find(s => s.id === studentId);
        if (!student) return Promise.resolve();
        const studentMarks = marksData[studentId] || {};
        const newResults = subjectDefinitions.map(sd => {
            const newResult: SubjectMark = { subject: sd.name };
            if (sd.gradingSystem === 'OABC') {
                if (studentMarks[sd.name]) newResult.grade = studentMarks[sd.name] as any;
            } else if (hasActivities) {
                if (studentMarks[sd.name + '_exam'] !== undefined) newResult.examMarks = studentMarks[sd.name + '_exam'] as number;
                if (studentMarks[sd.name + '_activity'] !== undefined) newResult.activityMarks = studentMarks[sd.name + '_activity'] as number;
            } else {
                if (studentMarks[sd.name] !== undefined) newResult.marks = studentMarks[sd.name] as number;
            }
            return newResult;
        });
        const newPerformance: Exam[] = [...(student.academicPerformance?.filter(e => e.id !== examId) || []), { id: examId as any, name: examDetails.name, results: newResults }];
        return onUpdateAcademic(studentId, newPerformance);
    });
    await Promise.all(updatePromises);
    setChangedStudents(new Set());
    setIsSaving(false);
    setIsConfirmSaveModalOpen(false);
  };

  if (!grade || !examDetails) return <div>Invalid Selection</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center print-hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5"/> Back</button>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 text-center">{examDetails.name} - {grade}</h1>
        <div className="mt-8 overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-3 py-2 text-left border-b border-r sticky left-0 bg-slate-100">Roll</th>
                        <th className="px-3 py-2 text-left border-b border-r">Student Name</th>
                        {subjectDefinitions.map(sd => (
                            <th key={sd.name} className="px-3 py-2 text-center border-b border-l">{sd.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {classStudents.map(student => (
                        <tr key={student.id} className={changedStudents.has(student.id) ? 'bg-sky-50' : ''}>
                            <td className="px-3 py-2 font-bold text-center border-r sticky left-0 bg-inherit">{student.rollNo}</td>
                            <td className="px-3 py-2 font-medium border-r">{student.name}</td>
                            {subjectDefinitions.map(sd => (
                                <td key={sd.name} className="px-1 py-1 border-l text-center">
                                    {sd.gradingSystem === 'OABC' ? (
                                        <select value={marksData[student.id]?.[sd.name] as string ?? ''} onChange={e => handleMarkChange(student.id, sd.name, e.target.value, 'grade')} className="form-select w-16">
                                            <option value="">-</option>
                                            {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    ) : (
                                        <div className="flex gap-1 justify-center">
                                            {hasActivities ? (
                                                <>
                                                    <input type="number" value={marksData[student.id]?.[sd.name + '_exam'] ?? ''} onChange={e => handleMarkChange(student.id, sd.name, e.target.value, 'exam')} className="form-input w-12 text-center" placeholder="Ex" />
                                                    <input type="number" value={marksData[student.id]?.[sd.name + '_activity'] ?? ''} onChange={e => handleMarkChange(student.id, sd.name, e.target.value, 'activity')} className="form-input w-12 text-center" placeholder="Ac" />
                                                </>
                                            ) : (
                                                <input type="number" value={marksData[student.id]?.[sd.name] ?? ''} onChange={e => handleMarkChange(student.id, sd.name, e.target.value, 'total')} className="form-input w-16 text-center" />
                                            )}
                                        </div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-6 flex justify-end gap-4 print-hidden">
            <button onClick={() => setIsConfirmSaveModalOpen(true)} disabled={isSaving || changedStudents.size === 0} className="btn btn-primary">
                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5" />}
                Save Changes
            </button>
        </div>
        <ConfirmationModal isOpen={isConfirmSaveModalOpen} onClose={() => setIsConfirmSaveModalOpen(false)} onConfirm={handleConfirmSave} title="Save Marks">
            <p>Save marks for {changedStudents.size} student(s)?</p>
        </ConfirmationModal>
    </div>
  );
};

export default ClassMarkStatementPage;