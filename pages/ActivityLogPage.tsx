
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Student, Grade, GradeDefinition, User, SubjectAssignment, ActivityLog, Assessment } from '../types';
import { BackIcon, HomeIcon, ClipboardDocumentListIcon, SaveIcon, SpinnerIcon, PlusIcon } from '../components/Icons';
import { GRADES_LIST, TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES } from '../constants';
import { normalizeSubjectName } from '../utils';

interface ActivityLogPageProps {
  students: Student[];
  user: User;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  assignedGrade: Grade | null;
  assignedSubjects: SubjectAssignment[];
  onBulkUpdateActivityLogs: (updates: Array<{ studentId: string; examId: 'terminal1' | 'terminal2' | 'terminal3'; subjectName: string; activityLog: ActivityLog; activityMarks: number }>) => Promise<void>;
}

// Helper to get the current exam period based on the current date
const getCurrentExamId = (): 'terminal1' | 'terminal2' | 'terminal3' => {
    const month = new Date().getMonth(); // 0:Jan, ..., 11:Dec
    if (month >= 3 && month <= 6) { // April - July -> Term 1
        return 'terminal1';
    } else if (month >= 7 && month <= 10) { // Aug - Nov -> Term 2
        return 'terminal2';
    } else { // Dec - Mar -> Term 3
        return 'terminal3';
    }
};

type EditableMarks = Record<string, {
    test: (number | null)[];
    homework: (number | null)[];
    project: (number | null)[];
}>;


const ActivityLogPage: React.FC<ActivityLogPageProps> = ({
  students,
  user,
  gradeDefinitions,
  academicYear,
  assignedGrade,
  assignedSubjects,
  onBulkUpdateActivityLogs
}) => {
  const navigate = useNavigate();

  const [selectedGrade, setSelectedGrade] = useState<Grade | ''>(assignedGrade || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  // Initialize with current term based on date, but allow user to change it
  const [selectedExamId, setSelectedExamId] = useState<'terminal1' | 'terminal2' | 'terminal3'>(getCurrentExamId());
  
  const [editableMarks, setEditableMarks] = useState<EditableMarks>({});
  const [assessmentCounts, setAssessmentCounts] = useState({ test: 1, homework: 1, project: 1 });
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  
  const currentExamName = useMemo(() => TERMINAL_EXAMS.find(e => e.id === selectedExamId)?.name, [selectedExamId]);

  const availableGrades = useMemo(() => {
    if (user.role === 'admin') {
      return GRADES_LIST.filter(g => !GRADES_WITH_NO_ACTIVITIES.includes(g));
    }
    const grades = new Set<Grade>();
    if (assignedGrade) grades.add(assignedGrade);
    assignedSubjects.forEach(s => grades.add(s.grade));
    return Array.from(grades)
        .filter(g => !GRADES_WITH_NO_ACTIVITIES.includes(g))
        .sort((a, b) => GRADES_LIST.indexOf(a) - GRADES_LIST.indexOf(b));
  }, [user.role, assignedGrade, assignedSubjects]);

  const availableSubjects = useMemo(() => {
    if (!selectedGrade) return [];
    const subjectsForGrade = gradeDefinitions[selectedGrade]?.subjects.filter(s => s.activityFullMarks > 0) || [];
    if (user.role === 'admin') return subjectsForGrade;
    if (user.role === 'user') {
        const teacherSubjects = assignedSubjects
            .filter(s => s.grade === selectedGrade)
            .map(s => normalizeSubjectName(s.subject));
        return subjectsForGrade.filter(sd => teacherSubjects.includes(normalizeSubjectName(sd.name)));
    }
    return [];
  }, [selectedGrade, gradeDefinitions, user.role, assignedSubjects]);
  
  const studentsInClass = useMemo(() => {
    if (!selectedGrade) return [];
    return students.filter(s => s.grade === selectedGrade).sort((a,b) => a.rollNo - b.rollNo);
  }, [students, selectedGrade]);
  
  useEffect(() => {
    if (availableGrades.length === 1 && !selectedGrade) {
      setSelectedGrade(availableGrades[0]);
    }
  }, [availableGrades, selectedGrade]);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some(s => s.name === selectedSubject)) {
      setSelectedSubject(availableSubjects[0]?.name || '');
    } else if (availableSubjects.length === 0) {
      setSelectedSubject('');
    }
  }, [availableSubjects, selectedSubject]);

  useEffect(() => {
    const data: EditableMarks = {};
    let maxTests = 1, maxHomeworks = 1, maxProjects = 1;

    if (selectedSubject) {
        studentsInClass.forEach(student => {
            const exam = student.academicPerformance?.find(e => e.id === selectedExamId);
            const result = exam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(selectedSubject));
            const log = result?.activityLog;
            
            const tests = log?.classTest?.assessments?.map(a => a.marksObtained) || [];
            const homeworks = log?.homework?.assessments?.map(a => a.marksObtained) || [];
            const projects = log?.project?.assessments?.map(a => a.marksObtained) || [];
            
            if (tests.length > maxTests) maxTests = tests.length;
            if (homeworks.length > maxHomeworks) maxHomeworks = homeworks.length;
            if (projects.length > maxProjects) maxProjects = projects.length;

            data[student.id] = { test: tests, homework: homeworks, project: projects };
        });
        
        studentsInClass.forEach(student => {
            const sData = data[student.id];
            sData.test = [...sData.test, ...Array(maxTests - sData.test.length).fill(null)];
            sData.homework = [...sData.homework, ...Array(maxHomeworks - sData.homework.length).fill(null)];
            sData.project = [...sData.project, ...Array(maxProjects - sData.project.length).fill(null)];
        });
        
        setAssessmentCounts({ test: maxTests, homework: maxHomeworks, project: maxProjects });
    }
    setEditableMarks(data);
    setChangedStudents(new Set());
  }, [studentsInClass, selectedSubject, selectedExamId]);
  
  const handleMarkChange = (studentId: string, type: 'test' | 'homework' | 'project', index: number, value: string) => {
    // Allow only digits or an empty string.
    if (!/^\d*$/.test(value)) {
        return;
    }

    const numericValue = value === '' ? null : parseInt(value, 10);
    // Update: Class Test max marks is 20, others are 10.
    const maxMarks = type === 'test' ? 20 : 10;
    
    let finalValue = numericValue;
    if (numericValue !== null) {
        if (numericValue < 0) finalValue = 0;
        if (numericValue > maxMarks) finalValue = maxMarks;
    }
    
    setEditableMarks(prev => {
        const newStudentMarks = [...prev[studentId][type]];
        newStudentMarks[index] = finalValue;
        return { ...prev, [studentId]: { ...prev[studentId], [type]: newStudentMarks }};
    });
    setChangedStudents(prev => new Set(prev).add(studentId));
  };
  
  const handleAddColumn = (type: 'test' | 'homework' | 'project') => {
      setAssessmentCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
      setEditableMarks(prev => {
          const newMarks = { ...prev };
          Object.keys(newMarks).forEach(studentId => {
              newMarks[studentId] = {
                  ...newMarks[studentId],
                  [type]: [...newMarks[studentId][type], null]
              };
          });
          return newMarks;
      });
  };

  const calculateScaledMarks = (assessments: Assessment[], weightage: number): number => {
    const totalObtained = assessments.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
    const totalMax = assessments.reduce((sum, a) => sum + (a.maxMarks || 0), 0);
    if (totalMax === 0 || weightage === 0) return 0;
    return (totalObtained / totalMax) * weightage;
  };

  const handleSaveAll = async () => {
    if (changedStudents.size === 0 || !selectedSubject) return;
    setIsSaving(true);
    
    const updates = Array.from(changedStudents).map(studentId => {
        const marks = editableMarks[studentId];
        
        // Update: Set maxMarks to 20 for tests
        const testAssessments = marks.test.filter(m => m !== null).map(m => ({ marksObtained: m, maxMarks: 20 }));
        const homeworkAssessments = marks.homework.filter(m => m !== null).map(m => ({ marksObtained: m, maxMarks: 10 }));
        const projectAssessments = marks.project.filter(m => m !== null).map(m => ({ marksObtained: m, maxMarks: 10 }));

        const log: ActivityLog = {
            classTest: { assessments: testAssessments, weightage: 20, scaledMarks: calculateScaledMarks(testAssessments, 20) },
            homework: { assessments: homeworkAssessments, weightage: 10, scaledMarks: calculateScaledMarks(homeworkAssessments, 10) },
            project: { assessments: projectAssessments, weightage: 10, scaledMarks: calculateScaledMarks(projectAssessments, 10) }
        };
        const totalMarks = Math.round(log.classTest.scaledMarks + log.homework.scaledMarks + log.project.scaledMarks);
        
        return { studentId, examId: selectedExamId, subjectName: selectedSubject, activityLog: log, activityMarks: totalMarks };
    });

    await onBulkUpdateActivityLogs(updates);
    setChangedStudents(new Set());
    setIsSaving(false);
  };

  const renderHeaderWithAdd = (title: string, type: 'test' | 'homework' | 'project', count: number) => (
      <th colSpan={count} className="p-0 border-b border-l">
          <div className="flex items-center justify-center h-full">
              <span className="px-2 font-bold text-slate-800 uppercase text-xs">{title}</span>
              <button onClick={() => handleAddColumn(type)} className="p-1 text-sky-600 hover:bg-sky-100 rounded-full">
                  <PlusIcon className="w-4 h-4" />
              </button>
          </div>
      </th>
  );

  return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5"/> Back</button>
          <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home"><HomeIcon className="w-5 h-5"/> Home</Link>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <ClipboardDocumentListIcon className="w-10 h-10 text-amber-600"/>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">CCE Activity Log</h1>
            <p className="text-slate-600 mt-1">Manage formative assessment scores.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/3">
                <label className="block text-sm font-bold text-slate-700">Term</label>
                <select 
                    value={selectedExamId} 
                    onChange={e => setSelectedExamId(e.target.value as 'terminal1' | 'terminal2' | 'terminal3')} 
                    className="mt-1 w-full form-select"
                >
                    {TERMINAL_EXAMS.map(term => (
                        <option key={term.id} value={term.id}>{term.name}</option>
                    ))}
                </select>
            </div>
            <div className="w-full sm:w-1/3">
                <label className="block text-sm font-bold text-slate-700">Class</label>
                <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)} className="mt-1 w-full form-select">
                    <option value="">-- Select Class --</option>
                    {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
             <div className="w-full sm:w-1/3">
                <label className="block text-sm font-bold text-slate-700">Subject</label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="mt-1 w-full form-select" disabled={!selectedGrade}>
                    <option value="">-- Select Subject --</option>
                    {availableSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
            </div>
        </div>
        
        <div className="mt-6 overflow-x-auto">
            {selectedGrade && selectedSubject ? (
                 <table className="min-w-full divide-y divide-slate-200 border">
                    <thead className="bg-slate-100">
                        <tr>
                            <th rowSpan={2} className="px-4 py-2 text-left text-xs font-bold text-slate-800 uppercase border-b align-middle">Roll</th>
                            <th rowSpan={2} className="px-4 py-2 text-left text-xs font-bold text-slate-800 uppercase border-b align-middle">Student Name</th>
                            {renderHeaderWithAdd('Test (20)', 'test', assessmentCounts.test)}
                            {renderHeaderWithAdd('Homework (10)', 'homework', assessmentCounts.homework)}
                            {renderHeaderWithAdd('Project (10)', 'project', assessmentCounts.project)}
                            <th rowSpan={2} className="px-4 py-2 text-center text-xs font-bold text-slate-800 uppercase border-b border-l align-middle">Total (40)</th>
                        </tr>
                         <tr>
                            {Array.from({ length: assessmentCounts.test }).map((_, i) => <th key={`t${i}`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">T{i+1}</th>)}
                            {Array.from({ length: assessmentCounts.homework }).map((_, i) => <th key={`h${i}`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">H{i+1}</th>)}
                            {Array.from({ length: assessmentCounts.project }).map((_, i) => <th key={`p${i}`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">P{i+1}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {studentsInClass.map(student => {
                            const studentMarks = editableMarks[student.id] || { test: [], homework: [], project: [] };
                            const scaledTest = calculateScaledMarks(studentMarks.test.map(m => ({ marksObtained: m, maxMarks: 20 })), 20); // Scale tests out of 20
                            const scaledHomework = calculateScaledMarks(studentMarks.homework.map(m => ({ marksObtained: m, maxMarks: 10 })), 10);
                            const scaledProject = calculateScaledMarks(studentMarks.project.map(m => ({ marksObtained: m, maxMarks: 10 })), 10);
                            const total = Math.round(scaledTest + scaledHomework + scaledProject);
                            
                            return (
                                <tr key={student.id} className={`hover:bg-slate-50 ${changedStudents.has(student.id) ? 'bg-sky-50' : ''}`}>
                                    <td className="px-4 py-1 font-semibold">{student.rollNo}</td>
                                    <td className="px-4 py-1">{student.name}</td>
                                    {Array.from({ length: assessmentCounts.test }).map((_, i) => (
                                        <td key={`t${i}`} className="px-1 py-1 text-center border-l">
                                            <input type="tel" pattern="[0-9]*" value={studentMarks.test[i] ?? ''} onChange={e => handleMarkChange(student.id, 'test', i, e.target.value)} className="form-input w-16 text-center" max="20" min="0" placeholder="-"/>
                                        </td>
                                    ))}
                                    {Array.from({ length: assessmentCounts.homework }).map((_, i) => (
                                        <td key={`h${i}`} className="px-1 py-1 text-center border-l">
                                            <input type="tel" pattern="[0-9]*" value={studentMarks.homework[i] ?? ''} onChange={e => handleMarkChange(student.id, 'homework', i, e.target.value)} className="form-input w-16 text-center" max="10" min="0" placeholder="-"/>
                                        </td>
                                    ))}
                                    {Array.from({ length: assessmentCounts.project }).map((_, i) => (
                                        <td key={`p${i}`} className="px-1 py-1 text-center border-l">
                                            <input type="tel" pattern="[0-9]*" value={studentMarks.project[i] ?? ''} onChange={e => handleMarkChange(student.id, 'project', i, e.target.value)} className="form-input w-16 text-center" max="10" min="0" placeholder="-"/>
                                        </td>
                                    ))}
                                    <td className="px-4 py-1 text-center font-bold text-sky-700 border-l">{total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                 </table>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-700 text-lg font-semibold">Please select a class and subject to begin.</p>
                </div>
            )}
        </div>

        {selectedGrade && selectedSubject && (
             <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveAll}
                    disabled={isSaving || changedStudents.size === 0}
                    className="btn btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5"/>}
                    <span>{isSaving ? 'Saving...' : `Save Changes (${changedStudents.size})`}</span>
                </button>
            </div>
        )}
      </div>
  );
};

export default ActivityLogPage;
