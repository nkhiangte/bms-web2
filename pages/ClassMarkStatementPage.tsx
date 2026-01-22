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

const MobileEditView: React.FC<any> = ({ student, onBack, subjectDefinitions, marksData, handleMarkChange, hasActivities, attendanceData, handleAttendanceChange }) => {
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
          {subjectDefinitions.map((sd: any) => {
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
        </div>
      </div>
    );
};

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, academicYear, user, gradeDefinitions, onUpdateAcademic }) => {
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

  const isClassIXorX = useMemo(() => grade === Grade.IX || grade === Grade.X, [grade]);
  const isNurseryToII = useMemo(() => [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade as Grade), [grade]);

  const [marksData, setMarksData] = useState<MarksData>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mobileEditingStudent, setMobileEditingStudent] = useState<ProcessedStudent | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('rollNo');

  useEffect(() => {
    if (classStudents.length === 0) return;
    if (Object.keys(marksData).length > 0 && changedStudents.size > 0) return;

    const initialMarks: MarksData = {};
    const initialAttendance: AttendanceData = {};
    classStudents.forEach(student => {
      initialMarks[student.id] = {};
      const studentExam = student.academicPerformance?.find(e => 
          e.id === examId || (e.name && examDetails && e.name.trim().toLowerCase() === examDetails.name.trim().toLowerCase())
      );
      initialAttendance[student.id] = {
          totalWorkingDays: studentExam?.attendance?.totalWorkingDays ?? null,
          daysPresent: studentExam?.attendance?.daysPresent ?? null,
      };
      subjectDefinitions.forEach(subjectDef => {
        const normSubjName = normalizeSubjectName(subjectDef.name);
        const result = studentExam?.results.find(r => {
            const normResultName = normalizeSubjectName(r.subject);
            if (normResultName === normSubjName) return true;
            // Fallbacks for legacy data
            if (normSubjName === 'english' && normResultName === 'english i') return true;
            if (normSubjName === 'english - ii' && normResultName === 'english ii') return true;
            if (normSubjName === 'social studies' && normResultName === 'social science') return true;
            // Fallbacks for Class II subjects
            if (normSubjName === 'math' && normResultName === 'mathematics') return true;
            if (normSubjName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
            if (normSubjName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;
            if (normSubjName === 'spellings' && normResultName === 'spelling') return true;
            return false;
        });
        
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
  }, [classStudents, subjectDefinitions, examId, hasActivities, examDetails]);
  
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
  
  const handleAttendanceChange = (studentId: string, field: 'totalWorkingDays' | 'daysPresent', value: string) => {
    if (!/^\d*$/.test(value)) return;
    const numericValue = value === '' ? null : Math.max(0, parseInt(value, 10));
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: numericValue }}));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };
  
  const handleApplyImport = (importedMarks: MarksData) => {
    setMarksData(prev => {
        const newMarksData = { ...prev };
        for (const studentId in importedMarks) {
            newMarksData[studentId] = { ...newMarksData[studentId], ...importedMarks[studentId] };
        }
        return newMarksData;
    });
    setChangedStudents(prev => new Set([...prev, ...Object.keys(importedMarks)]));
  };

  const processedData: ProcessedStudent[] = useMemo(() => {
    const numericSubjects = subjectDefinitions.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = subjectDefinitions.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = classStudents.map(student => {
      let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
      let failedSubjectsCount = 0, gradedSubjectsPassed = 0;
      const studentMarks = marksData[student.id] || {};
      const failedSubjects: string[] = [];

      numericSubjects.forEach(sd => {
        let totalSubjectMark = 0, subjectFullMarks = 0;
        if (hasActivities) {
            const examMark = Number(studentMarks[sd.name + '_exam']) || 0;
            const activityMark = Number(studentMarks[sd.name + '_activity']) || 0;
            examTotal += examMark; activityTotal += activityMark;
            totalSubjectMark = examMark + activityMark;
            // FIX: Explicitly cast properties to Number to resolve a TypeScript type inference issue.
            subjectFullMarks = Number(sd.examFullMarks) + Number(sd.activityFullMarks);
            if (examMark < 20) { failedSubjectsCount++; failedSubjects.push(sd.name); }
        } else {
            totalSubjectMark = Number(studentMarks[sd.name]) || 0;
            examTotal += totalSubjectMark;
            subjectFullMarks = sd.examFullMarks;
            const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
            if (totalSubjectMark < failLimit) { failedSubjectsCount++; failedSubjects.push(sd.name); }
        }
        grandTotal += totalSubjectMark; fullMarksTotal += subjectFullMarks;
      });

      gradedSubjects.forEach(sd => {
        const gradeValue = studentMarks[sd.name];
        if (gradeValue && typeof gradeValue === 'string' && OABC_GRADES.includes(gradeValue)) gradedSubjectsPassed++;
      });
      
      const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
      let result = (gradedSubjectsPassed < gradedSubjects.length || failedSubjectsCount > 1) ? 'FAIL' : failedSubjectsCount === 1 ? 'SIMPLE PASS' : 'PASS';
      if (isNurseryToII && failedSubjectsCount > 0) result = 'FAIL';


      let division = isClassIXorX && result === 'PASS' ? (percentage >= 75 ? 'Distinction' : percentage >= 60 ? 'I Div' : percentage >= 45 ? 'II Div' : percentage >= 35 ? 'III Div' : '-') : '-';
      let academicGrade = result === 'FAIL' ? 'E' : (percentage > 89 ? 'O' : percentage > 79 ? 'A' : percentage > 69 ? 'B' : percentage > 59 ? 'C' : 'D');
      
      let remark = '';
      if (result === 'FAIL') {
          remark = `Needs improvement in ${failedSubjects.join(', ')}`;
      } else if (result === 'SIMPLE PASS') {
          remark = `Focus on ${failedSubjects.join(', ')}`;
      } else { // PASS
          if (percentage >= 90) remark = "Outstanding performance!";
          else if (percentage >= 75) remark = "Excellent progress. Keep up the great work.";
          else if (percentage >= 60) remark = "Good progress. Well done.";
          else if (percentage >= 45) remark = "Satisfactory performance. Consistent effort will lead to better results.";
          else remark = "Passed. Consistent effort is needed to improve scores.";
      }

      return { ...student, grandTotal, examTotal, activityTotal, percentage, result, division, academicGrade, remark };
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => b - a);
    
    const finalData = studentData.map(s => {
        if (s.result === 'FAIL' || s.result === 'SIMPLE PASS') {
            return { ...s, rank: '-' as const };
        }
        const rankIndex = uniqueScores.indexOf(s.grandTotal);
        return { ...s, rank: rankIndex !== -1 ? rankIndex + 1 : '-' as const };
    });
    
    const sortedData = finalData;

    if (sortCriteria === 'name') {
        sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortCriteria === 'totalMarks') {
        sortedData.sort((a, b) => {
            const aIsFail = a.result === 'FAIL';
            const bIsFail = b.result === 'FAIL';

            if (aIsFail && !bIsFail) return 1;
            if (!aIsFail && bIsFail) return -1;
            
            return b.grandTotal - a.grandTotal;
        });
    } else { // default to 'rollNo'
        sortedData.sort((a, b) => a.rollNo - b.rollNo);
    }
    
    return sortedData;
  }, [marksData, classStudents, subjectDefinitions, hasActivities, isClassIXorX, isNurseryToII, sortCriteria]);

  const handleConfirmSave = async () => {
    if (!examDetails || changedStudents.size === 0) return;
    setIsSaving(true);

    const updatePromises = Array.from(changedStudents).map(studentId => {
        const student = classStudents.find(s => s.id === studentId);
        if (!student) return Promise.resolve();

        const studentMarks = marksData[studentId] || {};
        const originalExam = student.academicPerformance?.find(e => e.id === examId);

        const newResults = subjectDefinitions.map(sd => {
            const originalResult = originalExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
            const newResult: SubjectMark = { subject: sd.name, ...(originalResult?.activityLog && { activityLog: originalResult.activityLog }) };

            if (sd.gradingSystem === 'OABC') {
                if (studentMarks[sd.name]) newResult.grade = studentMarks[sd.name] as any;
            } else if (hasActivities) {
                if (studentMarks[sd.name + '_exam'] !== undefined) newResult.examMarks = studentMarks[sd.name + '_exam'] as number;
                if (studentMarks[sd.name + '_activity'] !== undefined) newResult.activityMarks = studentMarks[sd.name + '_activity'] as number;
            } else {
                if (studentMarks[sd.name] !== undefined) newResult.marks = studentMarks[sd.name] as number;
            }
            return newResult;
        }).filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null || r.grade != null);

        const newExamData: Exam = {
            id: examId as any,
            name: examDetails.name,
            results: newResults,
        };
        
        // FIX: Conditionally add the attendance object to avoid sending `undefined` to Firestore.
        if (attendanceData[studentId]?.totalWorkingDays != null && attendanceData[studentId]?.daysPresent != null) {
            newExamData.attendance = { 
                totalWorkingDays: attendanceData[studentId].totalWorkingDays!, 
                daysPresent: attendanceData[studentId].daysPresent! 
            };
        }

        const newPerformance: Exam[] = [...(student.academicPerformance?.filter(e => e.id !== examId) || []), newExamData];
        return onUpdateAcademic(studentId, newPerformance);
    });

    await Promise.all(updatePromises);
    setChangedStudents(new Set());
    setIsSaving(false);
    setIsConfirmSaveModalOpen(false);
  };

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

        <div className="mt-6 flex justify-end items-center gap-2 print-hidden">
            <span className="text-sm font-semibold text-slate-600">Sort by:</span>
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100">
                <button 
                    onClick={() => setSortCriteria('rollNo')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === 'rollNo' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}
                >
                    Roll No
                </button>
                <button
                    onClick={() => setSortCriteria('name')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === 'name' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}
                >
                    Name
                </button>
                <button
                    onClick={() => setSortCriteria('totalMarks')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === 'totalMarks' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}
                >
                    Total Marks
                </button>
            </div>
        </div>
        
        <div className="mt-2 overflow-x-auto border rounded-lg">
            <table id="mark-statement-table" className="min-w-full text-sm">
                 <thead className="bg-slate-100">
                    <tr>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-left font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 border-b border-r w-16 align-middle">No</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-left font-bold text-slate-800 border-b border-r min-w-48 align-middle">Student Name</th>
                        
                        {subjectDefinitions.map(sd => {
                            if (hasActivities && sd.gradingSystem !== 'OABC') {
                                return <th key={sd.name} colSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l">{sd.name}</th>;
                            } else {
                                return <th key={sd.name} rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">{sd.name}</th>;
                            }
                        })}
                        
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Total</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Percentage</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Rank</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">{isClassIXorX ? 'Division' : '-'}</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Result</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-left font-bold text-slate-800 border-b border-l min-w-48 align-middle">Remark</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Working Days</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Days Present</th>
                    </tr>
                    {hasActivities && (
                        <tr>
                            {subjectDefinitions.flatMap(sd => 
                                sd.gradingSystem !== 'OABC' ? [
                                    <th key={`${sd.name}-exam`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">Exam</th>,
                                    <th key={`${sd.name}-activity`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l border-r">Activity</th>
                                ] : []
                            )}
                        </tr>
                    )}
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {processedData.map(student => (
                        <tr key={student.id} className={`hover:bg-slate-50 ${changedStudents.has(student.id) ? 'bg-sky-50' : ''}`}>
                            <td className="px-3 py-2 font-bold text-center border-r sticky left-0 bg-inherit">{student.rollNo}</td>
                            <td className="px-3 py-2 font-medium border-r">{student.name}</td>
                            
                            {subjectDefinitions.map(sd => {
                                const isOABC = sd.gradingSystem === 'OABC';

                                if (isOABC) {
                                    return (
                                        <td key={sd.name} colSpan={1} className="px-1 py-1 border-l text-center">
                                            <select
                                                value={marksData[student.id]?.[sd.name] as string ?? ''}
                                                onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'grade')}
                                                className="form-select w-20 text-center"
                                            >
                                                <option value="">-</option>
                                                {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </td>
                                    );
                                }

                                if (hasActivities) {
                                    return (
                                        <React.Fragment key={sd.name}>
                                            <td className="px-1 py-1 border-l text-center">
                                                <input type="number" value={marksData[student.id]?.[sd.name + '_exam'] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'exam')} className="form-input w-20 text-center" placeholder="-" />
                                            </td>
                                            <td className="px-1 py-1 border-l text-center">
                                                <input type="number" value={marksData[student.id]?.[sd.name + '_activity'] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'activity')} className="form-input w-20 text-center" placeholder="-" />
                                            </td>
                                        </React.Fragment>
                                    );
                                }
                                
                                return (
                                    <td key={sd.name} className="px-1 py-1 border-l text-center">
                                        <input type="number" value={marksData[student.id]?.[sd.name] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'total')} className="form-input w-20 text-center" placeholder="-" />
                                    </td>
                                );
                            })}

                            <td className="px-3 py-2 text-center font-bold text-sky-700 border-l">{student.grandTotal}</td>
                            <td className="px-3 py-2 text-center border-l">{student.percentage.toFixed(2)}</td>
                            <td className="px-3 py-2 text-center font-bold border-l">{student.rank}</td>
                            <td className="px-3 py-2 text-center border-l">{isClassIXorX ? student.division : '-'}</td>
                            <td className={`px-3 py-2 text-center font-bold border-l ${student.result === 'PASS' || student.result === 'SIMPLE PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{student.result}</td>
                            <td className="px-3 py-2 text-sm border-l">{student.remark}</td>
                            <td className="px-1 py-1 border-l">
                                <input type="number" value={attendanceData[student.id]?.totalWorkingDays ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'totalWorkingDays', e.target.value)} className="form-input w-20 text-center" />
                            </td>
                            <td className="px-1 py-1 border-l">
                                <input type="number" value={attendanceData[student.id]?.daysPresent ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'daysPresent', e.target.value)} className="form-input w-20 text-center" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6 flex justify-end gap-4 print-hidden">
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary">
                <InboxArrowDownIcon className="w-5 h-5" /> Import Marks
            </button>
            <button
                onClick={() => setIsConfirmSaveModalOpen(true)}
                disabled={isSaving || changedStudents.size === 0}
                className="btn btn-primary"
            >
                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5" />}
                <span>Save Changes ({changedStudents.size})</span>
            </button>
        </div>
    </div>
    
    <ConfirmationModal
        isOpen={isConfirmSaveModalOpen}
        onClose={() => setIsConfirmSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Save Changes"
        confirmDisabled={isSaving}
    >
        <p>Save marks for {changedStudents.size} student(s)?</p>
    </ConfirmationModal>

    {examDetails && <ImportMarksModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplyImport={handleApplyImport}
        classStudents={classStudents}
        subjectDefinitions={subjectDefinitions}
        examName={examDetails.name}
        hasActivities={hasActivities}
        isSaving={isSaving}
    />}
    </>
  );
};

export default ClassMarkStatementPage;