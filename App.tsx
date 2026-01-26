
    const handleUpdateAdmissionStatus = async (id: string, status: OnlineAdmission['status']) => {
        try {
            const docRef = db.collection('online_admissions').doc(id);
            const admissionDoc = await docRef.get();
            
            if (!admissionDoc.exists) {
                throw new Error("Admission record not found");
            }

            const admissionData = admissionDoc.data() as OnlineAdmission;
            const updates: Partial<OnlineAdmission> = { status };

            // Logic for Approving and Enrolling
            if (status === 'approved' && !admissionData.isEnrolled) {
                
                // 1. Calculate Next Roll Number for the specific grade
                const studentsSnapshot = await db.collection('students')
                    .where('grade', '==', admissionData.admissionGrade)
                    .get();
                
                let maxRoll = 0;
                studentsSnapshot.forEach(doc => {
                    const sData = doc.data() as Student;
                    if (sData.rollNo && typeof sData.rollNo === 'number') {
                        maxRoll = Math.max(maxRoll, sData.rollNo);
                    }
                });
                const newRollNo = maxRoll + 1;

                // 2. Map Admission Data to Student Data
                const newStudentData: Omit<Student, 'id'> = {
                    rollNo: newRollNo,
                    name: admissionData.studentName.toUpperCase(),
                    grade: admissionData.admissionGrade as Grade,
                    studentId: '', // Will be formatted below or by helper if needed, but we save basic fields first
                    contact: admissionData.contactNumber,
                    dateOfBirth: admissionData.dateOfBirth,
                    gender: admissionData.gender as any, // Assumption: Gender types match
                    address: admissionData.presentAddress,
                    aadhaarNumber: admissionData.studentAadhaar,
                    pen: admissionData.penNumber || '',
                    category: 'General' as any, // Defaulting as category isn't in admission form explicitly mapped
                    fatherName: admissionData.fatherName,
                    fatherOccupation: admissionData.fatherOccupation || '',
                    fatherAadhaar: admissionData.parentAadhaar || '',
                    motherName: admissionData.motherName,
                    motherOccupation: admissionData.motherOccupation || '',
                    motherAadhaar: '', // Not distinct in admission form
                    guardianName: admissionData.guardianName || '',
                    guardianRelationship: admissionData.guardianRelationship || '',
                    lastSchoolAttended: admissionData.lastSchoolAttended || '',
                    healthConditions: admissionData.healthIssues || '',
                    achievements: admissionData.achievements || '',
                    status: StudentStatus.ACTIVE,
                    cwsn: admissionData.isCWSN as any || 'No',
                    religion: 'Christian', // Default or add to form
                    bloodGroup: admissionData.bloodGroup as any,
                    photographUrl: '', // Photo upload in admission form isn't strictly profile photo usually
                    feePayments: createDefaultFeePayments(),
                    academicPerformance: []
                };

                // Generate ID based on year, grade, and roll
                // We utilize the helper formatStudentId but since we don't have the object with an ID yet,
                // we construct it conceptually or rely on the helper to handle the logic.
                // However, the helper takes a Student object. Let's create the ID manually here to be safe and consistent.
                
                // Helper logic replicated for safety: BMS + YY + GradeCode + Roll
                const getGradeCode = (g: string) => {
                    if(g === 'Nursery') return 'NU';
                    if(g === 'Kindergarten') return 'KG';
                    const roman = g.replace('Class ', '');
                    const map: any = { 'I':'01', 'II':'02', 'III':'03', 'IV':'04', 'V':'05', 'VI':'06', 'VII':'07', 'VIII':'08', 'IX':'09', 'X':'10' };
                    return map[roman] || '00';
                };
                
                const startYear = academicYear.substring(0, 4);
                const yearSuffix = startYear.slice(-2);
                const gradeCode = getGradeCode(admissionData.admissionGrade);
                const paddedRoll = String(newRollNo).padStart(2, '0');
                const generatedStudentId = `BMS${yearSuffix}${gradeCode}${paddedRoll}`;

                newStudentData.studentId = generatedStudentId;

                // 3. Create Student Document
                await db.collection('students').add(newStudentData);

                // 4. Mark admission as enrolled
                updates.isEnrolled = true;
                updates.temporaryStudentId = generatedStudentId; // Store permanent ID as temp for reference if needed
                
                addNotification(`Student enrolled successfully to ${admissionData.admissionGrade} with Roll No: ${newRollNo}`, 'success');
            } else if (status === 'approved' && admissionData.isEnrolled) {
                 addNotification("This student is already enrolled.", "info");
                 return;
            } else if (status === 'approved' && !admissionData.temporaryStudentId && !admissionData.isEnrolled) {
                // Fallback for logic where we just want to generate a temp ID for payment,
                // but the MAIN logic above handles full enrollment.
                // If we are approving for PAYMENT purposes (pre-enrollment for Class IX maybe?),
                // the logic above effectively enrolls them immediately.
                // If you want a 2-step process (Approve -> Pay -> Enroll), the logic needs to change.
                // Based on "automatically placed in class page", immediate enrollment on Approval is best.
            }

            await docRef.update(updates);
            addNotification(`Application status updated to ${status}`, 'success');
        } catch (error: any) {
            console.error("Error updating admission status:", error);
            addNotification("Failed to update status: " + error.message, 'error');
        }
    };


    const handleMarkStaffAttendance = async (staffId: string, status: AttendanceStatus) => {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
            await db.collection('staffAttendance').doc(todayStr).set({ [staffId]: status }, { merge: true });
        } catch (e: any) {
            addNotification(e.message, "error");
        }
    };
