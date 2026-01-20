import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, User, GradeDefinition, Exam, SubjectMark, StudentStatus, Attendance, SubjectDefinition } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, CheckIcon, SpinnerIcon, SaveIcon, InboxArrowDownIcon, EditIcon, ChevronDownIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';
import { formatStudentId, normalizeSubjectName } from '../utils';
import { ImportMarksModal } from '../components/ImportMarksModal';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../components/ConfirmationModal';

interface ClassMarkStatementPageProps {
  students: Student[];
  academicYear: string;
  user: User;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateAcademic: (studentId: string, performance: Exam[]) => Promise<void>;
}

type MarksData = Record<string, Record<string, number | string | null>>;
type AttendanceData = Record<string, { totalWorkingDays: number | null, daysPresent: number | null }>;

// Define a type for the processed student data to be used by child components
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

// --- MOBILE-SPECIFIC COMPONENTS (MOVED OUTSIDE MAIN COMPONENT) ---

interface MobileEditViewProps {
    student: ProcessedStudent;
    onBack: () => void;
    subjectDefinitions: SubjectDefinition[];
    marksData: MarksData;
    handleMarkChange: (studentId: string, subjectName: string, value: string, type: 'exam' | 'activity' | 'total' | 'grade') => void;
    hasActivities: boolean;
    attendanceData: AttendanceData;
    handleAttendanceChange: (studentId: string, field: 'totalWorkingDays' | 'daysPresent', value: string) => void;
}

const MobileEditView: React.FC<MobileEditViewProps> = ({ student, onBack, subjectDefinitions, marksData, handleMarkChange, hasActivities, attendanceData, handleAttendanceChange }) => {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 mb-4">
          <BackIcon className="w-5 h-5" />
          Back to Student List
        </button>
        <div className="mb-4 p-4 bg-slate-100 rounded-lg">
          <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
          <p className="text-sm text-slate-600">Roll No: {student.rollNo}</p>
        </div>
        <div className="space-y-3">
          {subjectDefinitions.map(sd => {
            const isOABC = sd.gradingSystem === 'OABC';
            return (
              <div key={sd.name} className="p-3 border rounded-lg bg-white shadow-sm">
                <label className="block text-md font-bold text-slate-800 mb-2">{sd.name}</label>
                {isOABC ? (
                  <select
                    value={(marksData[student.id]?.[sd.name] as string) ?? ''}
                    onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'grade')}
                    className="form-select w-full"
                  >
                    <option value="">-- Select Grade --</option>
                    {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                ) : hasActivities ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Exam (out of {sd.examFullMarks})</label>
                      <input
                        type="number" inputMode="numeric"
                        value={marksData[student.id]?.[sd.name + '_exam'] ?? ''}
                        onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'exam')}
                        className="form-input w-full text-center mt-1"
                        max={sd.examFullMarks} min="0" placeholder="-"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Activity (out of {sd.activityFullMarks})</label>
                      <input
                        type="number" inputMode="numeric"
                        value={marksData[student.id]?.[sd.name + '_activity'] ?? ''}
                        onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'activity')}
                        className="form-input w-full text-center mt-1"
                        max={sd.activityFullMarks} min="0" placeholder="-"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Marks (out of {sd.examFullMarks})</label>
                    <input
                      type="number" inputMode="numeric"
                      value={marksData[student.id]?.[sd.name] ?? ''}
                      onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'total')}
                      className="form-input w-full text-center mt-1"
                      max={sd.examFullMarks} min="0" placeholder="-"
                    />
                  </div>
                )}
              </div>
            );
          })}
           <div className="p-3 border rounded-lg bg-white shadow-sm">
                <label className="block text-md font-bold text-slate-800 mb-2">Attendance</label>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number" inputMode="numeric"
                        value={attendanceData[student.id]?.totalWorkingDays ?? ''}
                        onChange={(e) => handleAttendanceChange(student.id, 'totalWorkingDays', e.target.value)}
                        className="form-input w-full text-center mt-1"
                        placeholder="Total Days"
                    />
                    <input
                        type="number" inputMode="numeric"
                        value={attendanceData[student.id]?.daysPresent ?? ''}
                        onChange={(e) => handleAttendanceChange(student.id, 'daysPresent', e.target.value)}
                        className="form-input w-full text-center mt-1"
                        placeholder="Days Present"
                    />
                </div>
            </div>
        </div>
      </div>
    );
};

interface MobileStudentListProps {
    students: ProcessedStudent[];
    onEdit: (student: ProcessedStudent) => void;
    changedStudents: Set<string>;
    attendanceData: AttendanceData;
}

const MobileStudentList: React.FC<MobileStudentListProps> = ({ students, onEdit, changedStudents, attendanceData }) => {
    return (
      <div className="space-y-3">
        {students.map(student => {
          const hasChanged = changedStudents.has(student.id);
          return (
            <div key={student.id} className={`p-3 border rounded-lg flex items-center gap-3 transition-colors ${hasChanged ? 'bg-sky-50 border-sky-200' : 'bg-white'}`}>
              <div className="font-bold text-slate-700 w-8 text-center flex-shrink-0">{student.rollNo}</div>
              <div className="flex-grow">
                <p className="font-bold text-slate-800">{student.name}</p>
                <div className="text-xs text-slate-500 flex flex-wrap gap-x-3">
                  <span>Total: <span className="font-semibold">{student.grandTotal}</span></span>
                  <span>Result: <span className={`font-semibold ${student.result === 'PASS' || student.result === 'SIMPLE PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{student.result}</span></span>
                  <span>Rank: <span className="font-semibold">{student.rank}</span></span>
                  <span>Attendance: <span className="font-semibold">
                      {(attendanceData[student.id]?.totalWorkingDays ?? 0) > 0 
                        ? `${((attendanceData[student.id]?.daysPresent ?? 0) / (attendanceData[student.id]?.totalWorkingDays ?? 1) * 100).toFixed(0)}%`
                        : 'N/A'
                      }</span></span>
                </div>
              </div>
              <button onClick={() => onEdit(student)} className="btn btn-secondary !p-2">
                <EditIcon className="w-5 h-5"/>
              </button>
            </div>
          );
        })}
      </div>
    );
};

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, academicYear, user, gradeDefinitions, onUpdateAcademic }) => {
  // Fix: Cast untyped useParams call to specific type to resolve build error
  const { grade: encodedGrade, examId } = useParams() as { grade: string; examId: string };
  const navigate = useNavigate();
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const topScrollContentRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
  const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
  
  // FIX: Add refs to control state initialization and prevent data loss from background updates.
  const initializationKey = `${grade}-${examId}`;
  const initializedKeyRef = useRef<string | null>(null);

  const classStudents = useMemo(() => {
    if (!grade) return [];
    return students.filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE).sort((a, b) => a.rollNo - b.rollNo);
  }, [students, grade]);

  const subjectDefinitions = useMemo(() => {
    if (!grade) return [];
    let subjects = gradeDefinitions[grade]?.subjects || [];
    // FIX: For Class IX & X, the full marks for each subject should be 100, regardless of the term.
    // This overrides any potentially incorrect data coming from Firestore to prevent capping marks at 60.
    if (grade === Grade.IX || grade === Grade.X) {
        subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activityFullMarks: 0 }));
    }
    return subjects;
  }, [grade, gradeDefinitions]);
  
  const hasActivities = useMemo(() => {
    if (!grade) return false;
    return !GRADES_WITH_NO_ACTIVITIES.includes(grade);
  }, [grade]);

  const isClassIXorX = useMemo(() => {
    if (!grade) return false;
    return grade === Grade.IX || grade === Grade.X;
  }, [grade]);
  
  const isNurseryToII = useMemo(() => {
    if (!grade) return false;
    return [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade as Grade);
  }, [grade]);

  const [marksData, setMarksData] = useState<MarksData>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mobileEditingStudent, setMobileEditingStudent] = useState<ProcessedStudent | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);

  // FIX: This effect resets the initialization flag when the user navigates to a new page (grade/exam changes).
  useEffect(() => {
    initializedKeyRef.current = null;
    setChangedStudents(new Set());
  }, [grade, examId]);

  // FIX: This effect now initializes the data but bails if already initialized for this page view,
  // preventing background data refreshes from wiping local state.
  useEffect(() => {
    if (initializedKeyRef.current === initializationKey) {
        return;
    }

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
        const result = studentExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(subjectDef.name));
        if (subjectDef.gradingSystem === 'OABC') {
            initialMarks[student.id][subjectDef.name] = result?.grade ?? null;
        } else if (hasActivities) {
            initialMarks[student.id][subjectDef.name + '_exam'] = result?.examMarks ?? null;
            initialMarks[student.id][subjectDef.name + '_activity'] = result?.activityMarks ?? null;
        } else {
            initialMarks[student.id][subjectDef.name] = result?.marks ?? null;
        }
      });
    });
    setMarksData(initialMarks);
    setAttendanceData(initialAttendance);
    
    initializedKeyRef.current = initializationKey;
  }, [classStudents, subjectDefinitions, examId, hasActivities, initializationKey]);
  
  const handleMarkChange = (studentId: string, subjectName: string, value: string, type: 'exam' | 'activity' | 'total' | 'grade') => {
    const subjectDef = subjectDefinitions.find(sd => sd.name === subjectName);
    if (!subjectDef) return;

    let key = subjectName;

    if (type === 'grade') {
        setMarksData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [key]: value }
        }));
        setChangedStudents(prev => new Set(prev).add(studentId));
        return;
    }

    let fullMarks = 100;

    if (type === 'exam') {
        fullMarks = subjectDef.examFullMarks;
        key = subjectName + '_exam';
    } else if (type === 'activity') {
        fullMarks = subjectDef.activityFullMarks;
        key = subjectName + '_activity';
    } else { // 'total'
        fullMarks = subjectDef.examFullMarks;
    }
    
    if (!/^\d*$/.test(value)) {
        return;
    }

    let numericValue: number | null;
    if (value === '') {
        numericValue = null;
    } else {
        const parsed = parseInt(value, 10);
        const clampedValue = Math.max(0, Math.min(parsed, fullMarks));
        numericValue = clampedValue;
    }

    setMarksData(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], [key]: numericValue }
    }));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };
  
  const handleAttendanceChange = (studentId: string, field: 'totalWorkingDays' | 'daysPresent', value: string) => {
    if (!/^\d*$/.test(value)) {
        return;
    }
    const numericValue = value === '' ? null : parseInt(value, 10);
    const finalValue = numericValue !== null ? Math.max(0, numericValue) : null;
    setAttendanceData(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: finalValue }
    }));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };
  
  const handleApplyImport = (importedMarks: MarksData) => {
    setMarksData(prev => {
        const newMarksData = { ...prev };
        for (const studentId in importedMarks) {
            newMarksData[studentId] = {
                ...newMarksData[studentId],
                ...importedMarks[studentId]
            };
        }
        return newMarksData;
    });

    const importedStudentIds = Object.keys(importedMarks);
    setChangedStudents(prev => new Set([...prev, ...importedStudentIds]));
  };

  const processedData: ProcessedStudent[] = useMemo(() => {
    const numericSubjects = subjectDefinitions.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = subjectDefinitions.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = classStudents.map(student => {
      let grandTotal = 0;
      let examTotal = 0;
      let activityTotal = 0;
      let fullMarksTotal = 0;
      let failedSubjectsCount_III_to_VIII = 0;
      let failedSubjectsCount_IX_to_X = 0;
      let failedSubjectsCount_N_to_II = 0;
      let gradedSubjectsPassed = 0;
      const studentMarks = marksData[student.id] || {};
      const failedSubjects: string[] = [];

      numericSubjects.forEach(sd => {
        let totalSubjectMark = 0;
        let subjectFullMarks = 0;

        if (hasActivities) { 
            const examMark = (studentMarks[sd.name + '_exam'] as number) ?? 0;
            const activityMark = (studentMarks[sd.name + '_activity'] as number) ?? 0;
            examTotal += examMark;
            activityTotal += activityMark;
            totalSubjectMark = examMark + activityMark;
            subjectFullMarks = sd.examFullMarks + sd.activityFullMarks;

            if (examMark < 20) {
                failedSubjectsCount_III_to_VIII++;
                failedSubjects.push(sd.name);
            }
        } else {
            totalSubjectMark = (studentMarks[sd.name] as number) ?? 0;
            examTotal += totalSubjectMark;
            subjectFullMarks = sd.examFullMarks;

            if (isClassIXorX) {
                if (totalSubjectMark < 33) {
                    failedSubjectsCount_IX_to_X++;
                    failedSubjects.push(sd.name);
                }
            }
            if (isNurseryToII) {
                if (totalSubjectMark < 35) {
                    failedSubjectsCount_N_to_II++;
                    failedSubjects.push(sd.name);
                }
            }
        }
        
        grandTotal += totalSubjectMark;
        fullMarksTotal += subjectFullMarks;
      });

      // Fix: Filter for OABC_GRADES to resolve potential TS error
      gradedSubjects.forEach(sd => {
        const gradeValue = studentMarks[sd.name];
        if (gradeValue && typeof gradeValue === 'string' && OABC_GRADES.includes(gradeValue)) {
            gradedSubjectsPassed++;
        }
      });
      
      const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
      
      let result = 'PASS';
      const failedGradedSubjects = gradedSubjectsPassed < gradedSubjects.length;

      if (failedGradedSubjects) {
          result = 'FAIL';
      } else if (hasActivities) {
          if (failedSubjectsCount_III_to_VIII > 1) {
              result = 'FAIL';
          } else if (failedSubjectsCount_III_to_VIII === 1) {
              result = 'SIMPLE PASS';
          }
      } else if (isClassIXorX) {
          if (failedSubjectsCount_IX_to_X > 1) {
              result = 'FAIL';
          } else if (failedSubjectsCount_IX_to_X === 1) {
              result = 'SIMPLE PASS';
          }
      } else if (isNurseryToII && failedSubjectsCount_N_to_II > 0) {
          result = 'FAIL';
      }

      let division = '-';
      if (isClassIXorX && result === 'PASS') {
          if (percentage >= 75) division = 'Distinction';
          else if (percentage >= 60) division = 'I Div';
          else if (percentage >= 45) division = 'II Div';
          else if (percentage >= 35) division = 'III Div';
      }

      let academicGrade = '-';
      const isIIItoVIII = [Grade.III, Grade.IV, Grade.V, Grade.VI, Grade.VII, Grade.VIII].includes(grade as Grade);

      if (isNurseryToII) {
        if (result === 'FAIL') {
            academicGrade = 'E';
        } else {
            if (percentage > 89) academicGrade = 'O';
            else if (percentage > 79) academicGrade = 'A';
            else if (percentage > 69) academicGrade = 'B';
            else if (percentage > 59) academicGrade = 'C';
            else academicGrade = 'D';
        }
      } else if (isIIItoVIII) {
        if (result === 'FAIL') {
            academicGrade = 'E';
        } else {
            if (percentage > 89) academicGrade = 'O';
            else if (percentage > 79) academicGrade = 'A';
            else if (percentage > 69) academicGrade = 'B';
            else if (percentage > 59) academicGrade = 'C';
            else academicGrade = 'D';
        }
      }
      
      let remark = '';
      if (result === 'FAIL') {
          remark = `Needs significant improvement${failedSubjects.length > 0 ? ` in ${failedSubjects.join(', ')}` : ''}.`;
      } else if (result === 'SIMPLE PASS') {
          remark = `Simple Pass. Needs to work harder to improve in ${failedSubjects.join(', ')}.`;
      } else if (result === 'PASS') {
          if (percentage >= 90) remark = "Outstanding performance. Keep up the excellent work!";
          else if (percentage >= 75) remark = "Excellent performance. Very well done.";
          else if (percentage >= 60) remark = "Good performance. Can do even better.";
          else if (percentage >= 45) remark = "Satisfactory performance. Consistent effort is needed.";
          else remark = "Passed. Needs to work harder to improve scores.";
      }

      return { ...student, grandTotal, examTotal, activityTotal, percentage, result, division, academicGrade, remark };
    });

    const eligibleForRanking = studentData.filter(s => s.result === 'PASS');
    const notEligibleForRanking = studentData.filter(s => s.result !== 'PASS');

    eligibleForRanking.sort((a, b) => b.grandTotal - a.grandTotal);
    
    const rankedEligible: (typeof eligibleForRanking[0] & {rank: number})[] = [];
    if (eligibleForRanking.length > 0) {
        let currentRank = 1;
        rankedEligible.push({ ...eligibleForRanking[0], rank: currentRank });
        for (let i = 1; i < eligibleForRanking.length; i++) {
            if (eligibleForRanking[i].grandTotal < eligibleForRanking[i - 1].grandTotal) {
                currentRank++;
            }
            rankedEligible.push({ ...eligibleForRanking[i], rank: currentRank });
        }
    }
    
    const unrankedIneligible = notEligibleForRanking.map(s => ({ ...s, rank: '-' as const }));

    const finalData = [...rankedEligible, ...unrankedIneligible];
    finalData.sort((a, b) => a.rollNo - b.rollNo);

    return finalData;
  }, [marksData, classStudents, subjectDefinitions, hasActivities, isClassIXorX, isNurseryToII, grade]);

  const handleConfirmSave = async () => {
    setIsConfirmSaveModalOpen(false);
    if (!examDetails || changedStudents.size === 0) return;
    setIsSaving(true);

    const updatePromises = Array.from(changedStudents).map(studentId => {
        const student = classStudents.find(s => s.id === studentId);
        if (!student) return Promise.resolve();

        const studentMarks = marksData[studentId] || {};
        const originalPerformance = student.academicPerformance || [];
        const otherExams = originalPerformance.filter(e => e.id !== examId);
        const originalExam = originalPerformance.find(e => e.id === examId);

        const newResults = subjectDefinitions.map(sd => {
            const originalResult = originalExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
            const newResult: SubjectMark = { 
                subject: sd.name,
                ...(originalResult?.activityLog && { activityLog: originalResult.activityLog })
            };

            const hasMark = (key: string) => Object.prototype.hasOwnProperty.call(studentMarks, key);

            if (sd.gradingSystem === 'OABC') {
                const key = sd.name;
                if (hasMark(key)) {
                    const gradeValue = studentMarks[key];
                    if (gradeValue !== null && gradeValue !== '') {
                        newResult.grade = gradeValue as 'O' | 'A' | 'B' | 'C';
                    }
                }
            } else if (hasActivities) {
                const examKey = sd.name + '_exam';
                if (hasMark(examKey)) {
                    const examValue = studentMarks[examKey];
                    if (examValue !== null) newResult.examMarks = examValue as number;
                }
                const activityKey = sd.name + '_activity';
                if (hasMark(activityKey)) {
                    const activityValue = studentMarks[activityKey];
                    if (activityValue !== null) newResult.activityMarks = activityValue as number;
                }
            } else {
                const key = sd.name;
                if (hasMark(key)) {
                    const markValue = studentMarks[key];
                    if (markValue !== null) newResult.marks = markValue as number;
                }
            }
            return newResult;
        }).filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null || r.grade != null || (r.activityLog && Object.keys(r.activityLog).length > 0));

        const otherSubjectResults = originalExam?.results.filter(r => 
            !subjectDefinitions.some(sd => normalizeSubjectName(sd.name) === normalizeSubjectName(r.subject))
        ) || [];

        const finalResults = [...newResults, ...otherSubjectResults];

        const newExamData: Exam = {
            ...(originalExam || { id: examId as any, name: examDetails.name, results: [] }),
            id: examId as any,
            name: examDetails.name,
            results: finalResults,
        };
        
        const attData = attendanceData[studentId];
        if (attData && attData.totalWorkingDays !== null && attData.daysPresent !== null) {
            newExamData.attendance = {
                totalWorkingDays: attData.totalWorkingDays,
                daysPresent: attData.daysPresent,
            };
        } else {
            delete newExamData.attendance;
        }

        const newPerformance: Exam[] = [...otherExams, newExamData];
        return onUpdateAcademic(studentId, newPerformance);
    });

    await Promise.all(updatePromises);
    setChangedStudents(new Set());
    setIsSaving(false);
  };
  
    const handleExport = (format: 'xlsx' | 'csv') => {
        if (!grade || !examDetails) return;

        const headers: string[] = ['Roll No', 'Student Name'];
        subjectDefinitions.forEach(sd => {
            if (sd.gradingSystem === 'OABC') {
                headers.push(`${sd.name} (Grade)`);
            } else if (hasActivities) {
                headers.push(`${sd.name} (Exam)`);
                headers.push(`${sd.name} (Activity)`);
            } else {
                headers.push(sd.name);
            }
        });

        if (hasActivities) {
            headers.push('Subject Total', 'Activity Total');
        }

        headers.push('Grand Total', 'Percentage', isClassIXorX ? 'Division' : 'Grade', 'Result', 'Remark', 'Attendance (%)', 'Rank');

        const data = processedData.map(student => {
            const row: (string | number | null)[] = [student.rollNo, student.name];
            const studentMarks = marksData[student.id] || {};

            subjectDefinitions.forEach(sd => {
                if (sd.gradingSystem === 'OABC') {
                    row.push(studentMarks[sd.name] ?? '');
                } else if (hasActivities) {
                    row.push(studentMarks[sd.name + '_exam'] ?? '');
                    row.push(studentMarks[sd.name + '_activity'] ?? '');
                } else {
                    row.push(studentMarks[sd.name] ?? '');
                }
            });

            if (hasActivities) {
                row.push(student.examTotal);
                row.push(student.activityTotal);
            }

            const att = attendanceData[student.id];
            const attPercent = (att?.totalWorkingDays ?? 0) > 0 ? ((att?.daysPresent ?? 0) / (att.totalWorkingDays) * 100).toFixed(0) : 'N/A';

            row.push(
                student.grandTotal,
                student.percentage.toFixed(2),
                isClassIXorX ? student.division : student.academicGrade,
                student.result,
                student.remark,
                attPercent,
                student.rank
            );
            return row;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Mark Statement');
        
        const fileName = `Mark_Statement_${grade}_${examDetails.name.replace(/\s+/g, '_')}.${format}`;
        XLSX.writeFile(workbook, fileName);
        setIsExportMenuOpen(false); // Close menu after download
    };

    const handlePrint = () => {
        window.print();
        setIsExportMenuOpen(false);
    };

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const topScroll = topScrollRef.current;
    const topScrollContent = topScrollContentRef.current;

    if (!tableContainer || !topScroll || !topScrollContent) return;

    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
        if (source.scrollLeft !== target.scrollLeft) {
            target.scrollLeft = source.scrollLeft;
        }
    };

    const handleTableScroll = () => syncScroll(tableContainer, topScroll);
    const handleTopScroll = () => syncScroll(topScroll, tableContainer);

    const setTopScrollWidth = () => {
        if (tableContainer.scrollWidth > tableContainer.clientWidth) {
             topScrollContent.style.width = `${tableContainer.scrollWidth}px`;
             topScroll.style.display = 'block';
        } else {
             topScroll.style.display = 'none';
        }
    };

    setTopScrollWidth();
    
    const resizeObserver = new ResizeObserver(setTopScrollWidth);
    resizeObserver.observe(tableContainer);
    
    tableContainer.addEventListener('scroll', handleTableScroll);
    topScroll.addEventListener('scroll', handleTopScroll);

    return () => {
        resizeObserver.disconnect();
        if (tableContainer) {
            tableContainer.removeEventListener('scroll', handleTableScroll);
        }
        if (topScroll) {
            topScroll.removeEventListener('scroll', handleTopScroll);
        }
    };
  }, [processedData]);
  
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [exportMenuRef]);
    
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (changedStudents.size > 0) {
                event.preventDefault();
                event.returnValue = ''; // Standard for most browsers
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [changedStudents.size]);

  if (!grade || !examDetails) return <div>Error: Invalid grade or exam.</div>;

  return (
    <>
    <div id="mark-statement-container" className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center print-hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5"/> Back</button>
            <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home"><HomeIcon className="w-5 h-5"/> Home</Link>
        </div>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Mark Entry</h1>
            <p className="text-slate-600 mt-1 text-lg"><span className="font-semibold">Class:</span> {grade} | <span className="font-semibold">Exam:</span> {examDetails.name}</p>
        </div>
        
        <div className="mt-6">
            {/* Mobile View: List or Edit Form */}
            <div className="md:hidden">
                {mobileEditingStudent ? (
                <MobileEditView 
                    student={mobileEditingStudent}
                    onBack={() => setMobileEditingStudent(null)}
                    subjectDefinitions={subjectDefinitions}
                    marksData={marksData}
                    handleMarkChange={handleMarkChange}
                    hasActivities={hasActivities}
                    attendanceData={attendanceData}
                    handleAttendanceChange={handleAttendanceChange}
                />
                ) : (
                <MobileStudentList
                    students={processedData}
                    onEdit={setMobileEditingStudent}
                    changedStudents={changedStudents}
                    attendanceData={attendanceData}
                />
                )}
            </div>

            {/* Desktop View: Wide Table */}
            <div className="hidden md:block">
              <div ref={topScrollRef} className="overflow-x-auto overflow-y-hidden h-4 mb-1">
                  <div ref={topScrollContentRef} className="h-1"></div>
              </div>
              <div ref={tableContainerRef} className="overflow-x-auto border rounded-lg">
                  <table id="mark-statement-table" className="min-w-full text-sm">
                      <thead className="bg-slate-100">
                          <tr>
                              <th rowSpan={2} className="px-3 py-2 text-left font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 align-middle border-b border-r w-16">Roll No</th>
                              <th rowSpan={2} className="px-3 py-2 text-left font-bold text-slate-800 align-middle border-b border-r min-w-48">Student Name</th>
                              {subjectDefinitions.map(sd => (
                                  <th key={sd.name} colSpan={hasActivities && sd.gradingSystem !== 'OABC' ? 2 : 1} rowSpan={!hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">
                                      {sd.name}
                                  </th>
                              ))}
                              {hasActivities && (
                                  <>
                                      <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Subj. Total</th>
                                      <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Activity Total</th>
                                  </>
                              )}
                              <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Grand Total</th>
                              <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Percentage</th>
                              {isClassIXorX ? (
                                  <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Division</th>
                              ) : (
                                  <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Grade</th>
                              )}
                              <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Result</th>
                              <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Remark</th>
                              <th colSpan={3} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Attendance</th>
                              <th rowSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Rank</th>
                          </tr>
                          <tr>
                              {hasActivities && subjectDefinitions.map(sd => {
                                  if (sd.gradingSystem === 'OABC') {
                                      return <th key={`${sd.name}-sub`} className="px-2 py-1 text-center font-semibold text-slate-700 border-b border-l text-xs">Grade</th>;
                                  } else {
                                      return (
                                            <React.Fragment key={`${sd.name}-sub`}>
                                                <th className="px-2 py-1 text-center font-semibold text-slate-700 border-b border-l text-xs">Exam</th>
                                                <th className="px-2 py-1 text-center font-semibold text-slate-700 border-b border-l text-xs">Activity</th>
                                            </React.Fragment>
                                      );
                                  }
                              })}
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">Working Days</th>
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">Days Present</th>
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">%</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                          {processedData.map(student => (
                              <tr key={student.id} className={`hover:bg-slate-50 ${changedStudents.has(student.id) ? 'bg-sky-50' : ''}`}>
                                  <td className="px-3 py-2 font-bold text-center text-slate-800 whitespace-nowrap sticky left-0 bg-inherit border-r w-16 z-10">{student.rollNo}</td>
                                  <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap border-r min-w-48">{student.name}</td>
                                  {subjectDefinitions.map(sd => {
                                      if (sd.gradingSystem === 'OABC') {
                                          const value = (marksData[student.id]?.[sd.name] as string) ?? '';
                                          return (
                                              <td key={sd.name} className="px-1 py-1 border-l">
                                                  <select value={value} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'grade')} className="form-select w-24 text-center print:hidden">
                                                      <option value="">--</option>
                                                      {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                  </select>
                                                  <span className="hidden print:inline">{value || '-'}</span>
                                              </td>
                                          );
                                      }
                                      if (hasActivities) {
                                          const examValue = marksData[student.id]?.[sd.name + '_exam'] ?? '';
                                          const activityValue = marksData[student.id]?.[sd.name + '_activity'] ?? '';
                                          return (
                                              <React.Fragment key={sd.name}>
                                                  <td className="px-1 py-1 border-l">
                                                      <input type="number" inputMode="numeric" value={examValue} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'exam')} className="form-input w-20 text-center print:hidden" max={sd.examFullMarks} min="0" placeholder="-"/>
                                                      <span className="hidden print:inline">{examValue === null ? '-' : examValue}</span>
                                                  </td>
                                                  <td className="px-1 py-1 border-l">
                                                      <input type="number" inputMode="numeric" value={activityValue} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'activity')} className="form-input w-20 text-center print:hidden" max={sd.activityFullMarks} min="0" placeholder="-"/>
                                                      <span className="hidden print:inline">{activityValue === null ? '-' : activityValue}</span>
                                                  </td>
                                              </React.Fragment>
                                          );
                                      }
                                      const totalValue = marksData[student.id]?.[sd.name] ?? '';
                                      return (
                                          <td key={sd.name} className="px-1 py-1 border-l">
                                              <input type="number" inputMode="numeric" value={totalValue} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'total')} className="form-input w-20 text-center print:hidden" max={sd.examFullMarks} min="0" placeholder="-"/>
                                              <span className="hidden print:inline">{totalValue === null ? '-' : totalValue}</span>
                                          </td>
                                      );
                                  })}
                                  {hasActivities && (
                                      <>
                                          <td className="px-3 py-2 text-center font-semibold text-slate-700 border-l">{student.examTotal}</td>
                                          <td className="px-3 py-2 text-center font-semibold text-slate-700 border-l">{student.activityTotal}</td>
                                      </>
                                  )}
                                  <td className="px-3 py-2 text-center font-bold text-sky-700 border-l">{student.grandTotal}</td>
                                  <td className="px-3 py-2 text-center font-semibold border-l">{student.percentage.toFixed(2)}</td>
                                  {isClassIXorX ? (
                                      <td className="px-3 py-2 text-center font-semibold border-l">{student.division}</td>
                                  ) : (
                                      <td className="px-3 py-2 text-center font-semibold border-l">{student.academicGrade}</td>
                                  )}
                                  <td className={`px-3 py-2 text-center font-bold border-l ${student.result === 'PASS' || student.result === 'SIMPLE PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{student.result}</td>
                                  <td className="px-3 py-2 text-left text-xs border-l min-w-64">{student.remark}</td>
                                   <td className="px-1 py-1 border-l">
                                      <input type="number" inputMode="numeric" value={attendanceData[student.id]?.totalWorkingDays ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'totalWorkingDays', e.target.value)} className="form-input w-20 text-center print:hidden" placeholder="Total"/>
                                      <span className="hidden print:inline">{attendanceData[student.id]?.totalWorkingDays ?? '-'}</span>
                                   </td>
                                    <td className="px-1 py-1 border-l">
                                      <input type="number" inputMode="numeric" value={attendanceData[student.id]?.daysPresent ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'daysPresent', e.target.value)} className="form-input w-20 text-center print:hidden" placeholder="Present"/>
                                      <span className="hidden print:inline">{attendanceData[student.id]?.daysPresent ?? '-'}</span>
                                   </td>
                                   <td className="px-2 py-2 text-center font-semibold border-l">
                                        {(attendanceData[student.id]?.totalWorkingDays ?? 0) > 0 ? `${((attendanceData[student.id]?.daysPresent ?? 0) / (attendanceData[student.id]?.totalWorkingDays ?? 1) * 100).toFixed(0)}%` : '-'}
                                   </td>
                                  <td className="px-3 py-2 text-center font-bold border-l">{student.rank}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end flex-wrap gap-3 print-hidden">
            <Link to={`/portal/reports/bulk-print/${encodedGrade}/${examId}`} target="_blank" className="btn btn-secondary">
                <PrinterIcon className="w-5 h-5" />
                <span>Print Report Cards</span>
            </Link>
            
            <div className="relative" ref={exportMenuRef}>
                <button
                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                    className="btn btn-secondary"
                >
                    <InboxArrowDownIcon className="w-5 h-5" />
                    <span>Export / Print View</span>
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
                {isExportMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            <button onClick={handlePrint} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 block">Print Table View</button>
                            <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 block">Export as XLSX</button>
                            <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 block">Export as CSV</button>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn btn-secondary"
                disabled={isSaving}
            >
                <InboxArrowDownIcon className="w-5 h-5" />
                <span>Import Marks</span>
            </button>
            <button
                onClick={() => setIsConfirmSaveModalOpen(true)}
                disabled={isSaving || changedStudents.size === 0}
                className="btn btn-primary text-base px-6 py-3 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5" />}
                <span>{isSaving ? 'Saving...' : `Save Changes (${changedStudents.size})`}</span>
            </button>
        </div>
    </div>
    {examDetails && 
        <ImportMarksModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onApplyImport={handleApplyImport}
            classStudents={classStudents}
            subjectDefinitions={subjectDefinitions}
            examName={examDetails.name}
            hasActivities={hasActivities}
            isSaving={isSaving}
        />
    }
    <ConfirmationModal
        isOpen={isConfirmSaveModalOpen}
        onClose={() => setIsConfirmSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Save Changes"
        confirmDisabled={isSaving}
    >
        <p>Are you sure you want to save the changes for {changedStudents.size} student(s)?</p>
    </ConfirmationModal>
    </>
  );
};

export default ClassMarkStatementPage;