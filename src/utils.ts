import { Student, Staff, Grade, FeePayments, GradeDefinition, StaffAttendanceRecord, StudentAttendanceRecord, AttendanceStatus, StudentAttendanceStatus, FeeStructure, HostelDisciplineEntry, HostelResident, CalendarEvent, FeeSet, SubjectMark, SubjectDefinition } from '@/types';
import { academicMonths, GRADES_LIST, FEE_SET_GRADES, IMGBB_API_KEY, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '@/constants';
import { useState, useEffect } from 'react';

// Custom hook to dynamically load an external script
export const useScript = (src: string) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'idle'>(src ? "loading" : "idle");

  useEffect(() => {
    if (!src || typeof document === 'undefined') {
      setStatus("idle");
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      const setAttribute = (event: Event) => {
        script.setAttribute("data-status", event.type === "load" ? "ready" : "error");
      };

      script.addEventListener("load", setAttribute);
      script.addEventListener("error", setAttribute);
    } else {
      setStatus(script.getAttribute("data-status") as any || 'ready');
    }

    const setState = (event: Event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    script.addEventListener("load", setState);
    script.addEventListener("error", setState);

    return () => {
      if (script) {
        script.removeEventListener("load", setState);
        script.removeEventListener("error", setState);
      }
    };
  }, [src]);

  return status;
};


const getGradeCode = (grade: Grade): string => {
    switch (grade) {
        case Grade.NURSERY: return 'NU';
        case Grade.KINDERGARTEN: return 'KG';
        case Grade.I: return '01';
        case Grade.II: return '02';
        case Grade.III: return '03';
        case Grade.IV: return '04';
        case Grade.V: return '05';
        case Grade.VI: return '06';
        case Grade.VII: return '07';
        case Grade.VIII: return '08';
        case Grade.IX: return '09';
        case Grade.X: return '10';
        default: return 'XX'; // Fallback for any unexpected grade
    }
};

export const formatStudentId = (student: Partial<Student>, academicYear: string): string => {
    if (student?.studentId) {
        return student.studentId;
    }
    if (!student?.grade || typeof student.rollNo !== 'number' || !academicYear) {
        return student?.id ? `ID-${student.id}` : 'INVALID-STUDENT-ID';
    }
    const startYear = academicYear.substring(0, 4);
    const yearSuffix = startYear.slice(-2);
    const gradeCode = getGradeCode(student.grade);
    const paddedRollNo = String(student.rollNo).padStart(2, '0');
    return `BMS${yearSuffix}${gradeCode}${paddedRollNo}`;
};

export const getFeeDetails = (grade: Grade, feeStructure: FeeStructure): FeeSet => {
    const map = feeStructure.gradeMap || FEE_SET_GRADES;

    let set: FeeSet | undefined;
    if (map.set1?.includes(grade)) {
        set = feeStructure.set1;
    } else if (map.set2?.includes(grade)) {
        set = feeStructure.set2;
    } else if (map.set3?.includes(grade)) {
        set = feeStructure.set3;
    }
    
    return set || { heads: [] };
};

export const calculateDues = (student: Student, feeStructure: FeeStructure): string[] => {
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;
    const feeSet = getFeeDetails(student.grade, feeStructure);

    const duesMessages: string[] = [];

    const oneTimeFees = (feeSet.heads || []).filter(h => h.type === 'one-time');
    const monthlyFees = (feeSet.heads || []).filter(h => h.type === 'monthly');
    const termFees = (feeSet.heads || []).filter(h => h.type === 'term');

    if (!feePayments.admissionFeePaid && oneTimeFees.length > 0) {
        const totalOneTime = oneTimeFees.reduce((sum, h) => sum + h.amount, 0);
        const names = oneTimeFees.map(h => h.name).join(', ');
        duesMessages.push(`${names}: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalOneTime)}`);
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid?.[month]);
    if (unpaidTuitionMonths.length > 0 && monthlyFees.length > 0) {
        const monthlyTotal = monthlyFees.reduce((sum, h) => sum + h.amount, 0);
        const totalDue = unpaidTuitionMonths.length * monthlyTotal;
        const names = monthlyFees.map(h => h.name).join(' + ');
        duesMessages.push(`${names}: ${unpaidTuitionMonths.length} month(s) pending (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalDue)})`);
    }

    if (termFees.length > 0) {
        const termTotal = termFees.reduce((sum, h) => sum + h.amount, 0);
        const unpaidExams: string[] = [];
        if (!feePayments.examFeesPaid?.terminal1) unpaidExams.push('Term 1');
        if (!feePayments.examFeesPaid?.terminal2) unpaidExams.push('Term 2');
        if (!feePayments.examFeesPaid?.terminal3) unpaidExams.push('Term 3');
        
        if (unpaidExams.length > 0) {
            const totalTermDue = unpaidExams.length * termTotal;
            const names = termFees.map(h => h.name).join(' + ');
            duesMessages.push(`${names}: ${unpaidExams.join(', ')} (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalTermDue)})`);
        }
    }

    return duesMessages;
};

export interface DueItem {
    description: string;
    amount: number;
}
export interface DuesSummary {
    items: DueItem[];
    total: number;
}

export const getDuesSummary = (student: Student, feeStructure: FeeStructure): DuesSummary => {
    const items: DueItem[] = [];
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;
    const feeSet = getFeeDetails(student.grade, feeStructure);

    const oneTimeFees = (feeSet.heads || []).filter(h => h.type === 'one-time');
    const monthlyFees = (feeSet.heads || []).filter(h => h.type === 'monthly');
    const termFees = (feeSet.heads || []).filter(h => h.type === 'term');

    if (!feePayments.admissionFeePaid) {
        oneTimeFees.forEach(head => {
            items.push({ description: head.name, amount: head.amount });
        });
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid?.[month]);
    if (unpaidTuitionMonths.length > 0) {
        monthlyFees.forEach(head => {
            const totalForHead = unpaidTuitionMonths.length * head.amount;
            items.push({ description: `${head.name} (${unpaidTuitionMonths.length} months)`, amount: totalForHead });
        });
    }

    const unpaidExams: string[] = [];
    if (!feePayments.examFeesPaid?.terminal1) unpaidExams.push('Term 1');
    if (!feePayments.examFeesPaid?.terminal2) unpaidExams.push('Term 2');
    if (!feePayments.examFeesPaid?.terminal3) unpaidExams.push('Term 3');
    
    if (unpaidExams.length > 0) {
        termFees.forEach(head => {
             const totalForHead = unpaidExams.length * head.amount;
             items.push({ description: `${head.name} (${unpaidExams.join(', ')})`, amount: totalForHead });
        });
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return { items, total };
};

export const createDefaultFeePayments = (): FeePayments => ({
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
});

export const getNextGrade = (currentGrade: Grade): Grade | null => {
    const currentIndex = GRADES_LIST.indexOf(currentGrade);
    if (currentIndex === -1 || currentIndex >= GRADES_LIST.length - 1) {
        return null;
    }
    return GRADES_LIST[currentIndex + 1];
};

export const getNextAcademicYear = (currentYear: string): string => {
    const [start, end] = currentYear.split('-').map(Number);
    if (!start || !end) return "2026-2027"; // Fallback
    return `${start + 1}-${end + 1}`;
};

/**
 * Aggressive normalization: strips ALL non-alphanumeric characters, including spaces.
 * This ensures "English I" and "English" or "English - I" can be compared reliably.
 */
export const normalizeSubjectName = (name: string): string => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Robust subject matching that handles common aliases and special characters.
 */
export const subjectsMatch = (name1: string, name2: string): boolean => {
    const n1 = normalizeSubjectName(name1);
    const n2 = normalizeSubjectName(name2);
    
    if (!n1 || !n2) return false;
    if (n1 === n2) return true;

    // Mapping for common subject aliases to handle inconsistencies in data entry.
    // Since normalizeSubjectName strips spaces, "English I" becomes "englishi".
    const aliases: string[][] = [
        ['english', 'englishi', 'english1', 'engi', 'eng1', 'englishl'],
        ['englishii', 'english2', 'engii', 'eng2'],
        ['math', 'maths', 'mathematics'],
        ['socialscience', 'socialstudies', 'socstudies', 'evs'],
        ['mizo', 'lushei'],
        ['drawing', 'art'],
        ['cursive', 'writing', 'handwriting'],
        ['spelling', 'spellings']
    ];

    return aliases.some(group => group.includes(n1) && group.includes(n2));
};

export const calculateStudentResult = (student: Student, gradeDef: GradeDefinition): 'PASS' | 'FAIL' => {
    if (!gradeDef || !gradeDef.subjects) return 'PASS';

    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    
    const studentExam = student.academicPerformance?.find(e => e.id === 'terminal3');
    
    if (!studentExam) return 'PASS';

    const numericSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem === 'OABC');

    let failedSubjectsCount_III_to_VIII = 0;
    let failedSubjectsCount_IX_to_X = 0;
    let gradedSubjectsPassed = 0;

    numericSubjects.forEach(sd => {
        const result = studentExam.results.find(r => subjectsMatch(r.subject, sd.name));
        if (hasActivities) { 
            const examMark = result?.examMarks ?? 0;
            if (examMark < 20) { 
                failedSubjectsCount_III_to_VIII++;
            }
        } else { 
            if (isClassIXorX) {
                const totalSubjectMark = result?.marks ?? 0;
                if (totalSubjectMark < 33) { 
                    failedSubjectsCount_IX_to_X++;
                }
            }
        }
    });

    gradedSubjects.forEach(sd => {
        const result = studentExam.results.find(r => subjectsMatch(r.subject, sd.name));
        if (result?.grade && OABC_GRADES.includes(result.grade as any)) {
            gradedSubjectsPassed++;
        }
    });
    
    if (gradedSubjectsPassed < gradedSubjects.length) {
        return 'FAIL';
    } else if (hasActivities && failedSubjectsCount_III_to_VIII > 1) {
        return 'FAIL';
    } else if (isClassIXorX && failedSubjectsCount_IX_to_X > 1) {
        return 'FAIL';
    }

    return 'PASS';
};

export const formatDateForDisplay = (isoDate?: string): string => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || '';
  }
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateForStorage = (displayDate?: string): string => {
  if (!displayDate) {
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) {
    return displayDate;
  }
  const match = displayDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return ''; 
  }
  const [, day, month, year] = match;
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

export const formatDateForNews = (isoDate?: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;
    return d;
}

export const getHolidayDates = (events: CalendarEvent[]): Set<string> => {
    const holidayDates = new Set<string>();
    events.forEach(event => {
        if (event.type === 'Holiday') {
            let current = new Date(event.date);
            const end = new Date(event.endDate || event.date);
            current.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            while (current <= end) {
                holidayDates.add(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
    });
    return holidayDates;
}

export const exportAttendanceToCsv = ({
    people,
    attendanceData,
    startDate,
    endDate,
    entityName,
    entityType,
    academicYear,
    holidays
}: {
    people: (Student | Staff)[];
    attendanceData: { [date: string]: StaffAttendanceRecord | StudentAttendanceRecord };
    startDate: string;
    endDate: string;
    entityName: string;
    entityType: 'Student' | 'Staff';
    academicYear: string;
    holidays?: Set<string>;
}) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
    }

    const isStaff = entityType === 'Staff';

    const headers = [
        `${entityType} ID`,
        'Name',
        ...dates.map(d => {
            const [yyyy, mm, dd] = d.split('-');
            return `${dd}/${mm}`;
        }),
        'Total Working Days',
        'Days Present',
        'Days Absent',
        'Days on Leave',
    ];
    if (isStaff) headers.push('Days Late');
    
    const rows = people.map(person => {
        const rowData = [
            entityType === 'Student' ? formatStudentId(person as Student, academicYear) : (person as Staff).employeeId,
            entityType === 'Student' ? (person as Student).name : `${(person as Staff).firstName} ${(person as Staff).lastName}`,
        ];

        let presentCount = 0;
        let absentCount = 0;
        let leaveCount = 0;
        let lateCount = 0; 
        let totalDaysCount = 0;

        dates.forEach(dateStr => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const isWeekend = dateObj.getDay() === 0; // Sunday (0) is a holiday
            const isHoliday = holidays?.has(dateStr);

            if (isWeekend || isHoliday) {
                rowData.push('Holiday');
            } else {
                const dayRecord = attendanceData[dateStr];
                const status = dayRecord ? dayRecord[person.id] : undefined;
                
                let statusChar = '-';
                
                if (status) {
                    totalDaysCount++;
                    if (status === AttendanceStatus.PRESENT || status === StudentAttendanceStatus.PRESENT) {
                        statusChar = 'P';
                        presentCount++;
                    } else if (status === AttendanceStatus.ABSENT || status === StudentAttendanceStatus.ABSENT) {
                        statusChar = 'A';
                        absentCount++;
                    } else if (status === AttendanceStatus.LEAVE || status === StudentAttendanceStatus.LEAVE) {
                        statusChar = 'LV';
                        leaveCount++;
                    } else if (isStaff && status === AttendanceStatus.LATE) {
                        statusChar = 'L';
                        lateCount++;
                    }
                }
                rowData.push(statusChar);
            }
        });

        rowData.push(String(totalDaysCount), String(presentCount), String(absentCount), String(leaveCount));
        if (isStaff) rowData.push(String(lateCount));
        
        return rowData.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${entityType}_Attendance_${entityName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const formatPhoneNumberForWhatsApp = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        return digitsOnly;
    }
    if (digitsOnly.length === 10) {
        return `91${digitsOnly}`;
    }
    return digitsOnly;
};

export const exportDisciplineLogToCsv = ({
    logEntries,
    students,
    residents,
    fileName,
    academicYear,
}: {
    logEntries: HostelDisciplineEntry[];
    students: Student[];
    residents: HostelResident[];
    fileName: string;
    academicYear: string;
}) => {
    const studentMap = new Map(students.map(s => [s.id, s]));

    const headers = [
        'Date', 'Student Name', 'Student ID', 'Class', 'Category', 
        'Severity', 'Status', 'Description', 'Action Taken', 'Reported By'
    ];
    
    const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (/[",\n\r]/.test(stringField)) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const rows = logEntries.map(entry => {
        const student = students.find(s => s.id === entry.studentId);
        
        return [
            escapeCsvField(formatDateForDisplay(entry.date)),
            escapeCsvField(student?.name || 'N/A'),
            escapeCsvField(student ? formatStudentId(student, academicYear) : 'N/A'),
            escapeCsvField(student?.grade || 'N/A'),
            escapeCsvField(entry.category),
            escapeCsvField(entry.severity),
            escapeCsvField(entry.status),
            escapeCsvField(entry.actionTaken),
            escapeCsvField(entry.reportedBy),
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseSubjectAndTeacher = (subjectString: string): { subject: string, teacher: string | null } => {
    const match = subjectString.match(/(.+?)\s*\((.+?)\)/);
    if (match) {
        return { subject: match[1].trim(), teacher: match[2].trim() };
    }
    return { subject: subjectString.trim(), teacher: null };
};

export const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); 
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

export const getCurrentAcademicYear = (): string => {
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();
    const startYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    return `${startYear}-${startYear + 1}`;
};

export const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) {
                return reject(new Error("FileReader did not return a result."));
            }
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
            img.src = e.target.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

export const uploadToImgBB = async (base64Image: string): Promise<string> => {
    const formData = new FormData();
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    formData.append('image', cleanBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
    }
};
