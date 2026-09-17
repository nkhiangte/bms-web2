import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, Grade, GradeDefinition, EmploymentStatus, SubjectAssignment, User } from '@/types';
import { BackIcon, EditIcon, UserIcon, HomeIcon, MailIcon, PhoneIcon, BriefcaseIcon, AcademicCapIcon, CurrencyDollarIcon, BookOpenIcon, PlusIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import StaffFormModal from '@/components/StaffFormModal';
import TeacherSubjectAssignmentsModal from '@/components/TeacherSubjectAssignmentsModal';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

interface StaffDetailPageProps {
  staff: Staff[];
  onEdit: (staffData: Omit<Staff, 'id'>, id: string | undefined, assignedGrade: Grade | null) => Promise<void>;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  user: User;
  onUpdateStaffAssignments?: (teacherId: string, assignedSubjects: SubjectAssignment[], assignedGradeKey: Grade | null) => Promise<void>;
}

const DetailItem: React.FC<{label: string, value?: string | number | null, children?: React.ReactNode}> = ({ label, value, children }) => {
    if (!value && !children) return null;
    return (
         <div className="bg-slate-50 p-3 rounded-lg">
            <dt className="text-sm font-semibold text-slate-700">{label}</dt>
            <dd className="mt-1 text-md font-bold text-slate-900">{value || children}</dd>
        </div>
    )
}

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children}) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{title}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {children}
        </dl>
    </div>
)


const StaffDetailPage: React.FC<StaffDetailPageProps> = ({ staff, onEdit, gradeDefinitions, user, onUpdateStaffAssignments }) => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const staffMember = staff.find(s => s.id === staffId);

  const assignedClass = useMemo(() => {
    if (!staffMember) return null;
    const entry = Object.entries(gradeDefinitions).find(([, def]: [string, GradeDefinition]) => def.classTeacherId === staffMember.id);
    return entry ? entry[0] as Grade : null;
  }, [staffMember, gradeDefinitions]);
  
  const subjectsByGrade = useMemo(() => {
      if (!staffMember?.assignedSubjects) return null;
      return staffMember.assignedSubjects.reduce((acc, asgn) => {
          if (!acc[asgn.grade]) {
              acc[asgn.grade] = [];
          }
          acc[asgn.grade].push(asgn.subject);
          return acc;
      }, {} as Record<Grade, string[]>);
  }, [staffMember]);


  const handleEditSubmit = async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
    if (!staffMember) return;
    setIsSaving(true);
    try {
        await onEdit(staffData, staffMember.id, assignedGradeKey);
        setIsEditModalOpen(false);
    } catch (error) {
        console.error("Error updating staff:", error);
        alert("Failed to update staff profile. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveAssignments = async (
    teacherId: string,
    assignedSubjects: SubjectAssignment[],
    assignedGradeKey: Grade | null
  ) => {
    setIsSaving(true);
    try {
        if (onUpdateStaffAssignments) {
            await onUpdateStaffAssignments(teacherId, assignedSubjects, assignedGradeKey);
        }
        setIsAssignmentsModalOpen(false);
    } catch (error) {
        console.error("Error saving teacher assignments:", error);
        throw error;
    } finally {
        setIsSaving(false);
    }
  };

  if (!staffMember) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Staff Member Not Found</h2>
            <p className="text-slate-700 mt-2">The requested staff profile does not exist.</p>
            <button
                onClick={() => navigate('/portal/staff')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to Staff List
            </button>
        </div>
    );
  }
  
  const statusStyles = {
    [EmploymentStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
    [EmploymentStatus.ON_LEAVE]: 'bg-amber-100 text-amber-800',
    [EmploymentStatus.RESIGNED]: 'bg-rose-100 text-rose-800',
    [EmploymentStatus.RETIRED]: 'bg-slate-200 text-slate-700',
  };
  const statusStyle = statusStyles[staffMember.status] || statusStyles[EmploymentStatus.RETIRED];

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const canEdit = isAdmin || (user?.email && staffMember.emailAddress && user.email.trim().toLowerCase() === staffMember.emailAddress.trim().toLowerCase());
  const isTeaching = staffMember.staffType === 'Teaching';

  return (
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
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 mb-6 border-b">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto md:mx-0">
            <PhotoWithFallback src={staffMember.photographUrl} alt={`${staffMember.firstName}'s photograph`} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-bold text-slate-900">{staffMember.firstName} {staffMember.lastName}</h1>
          <p className="text-sky-700 text-xl font-semibold mt-1">{staffMember.designation}</p>
          <p className="text-sm text-slate-700">{staffMember.department}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-md font-semibold ${statusStyle}`}>
                {staffMember.status}
            </span>
            {assignedClass && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-600" />
                    Class Teacher: {assignedClass}
                </span>
            )}
          </div>
           <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
             {isAdmin && isTeaching && (
               <button
                  type="button"
                  onClick={() => setIsAssignmentsModalOpen(true)}
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition cursor-pointer"
                  title="Add, edit, or delete classes & subjects taught"
                >
                  <AcademicCapIcon className="h-5 h-5" />
                  Manage Classes &amp; Subjects Taught
                </button>
             )}
             {canEdit && (
               <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition cursor-pointer"
                >
                  <EditIcon className="h-5 h-5" />
                  Edit Profile
                </button>
             )}
           </div>
        </div>
      </div>
      
      <div>
          <DetailSection title="Personal Details">
              <DetailItem label="Employee ID" value={staffMember.employeeId} />
              <DetailItem label="Date of Birth" value={formatDateForDisplay(staffMember.dateOfBirth)} />
              <DetailItem label="Gender" value={staffMember.gender} />
              <DetailItem label="Marital Status" value={staffMember.maritalStatus} />
              <DetailItem label="Nationality" value={staffMember.nationality} />
              <DetailItem label="Blood Group" value={staffMember.bloodGroup} />
              <DetailItem label="Aadhaar Number" value={staffMember.aadhaarNumber} />
          </DetailSection>

          <DetailSection title="Contact Information">
              <DetailItem label="Phone Number" value={staffMember.contactNumber} />
              <DetailItem label="Email Address" value={staffMember.emailAddress} />
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Current Address" value={staffMember.currentAddress} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Permanent Address" value={staffMember.permanentAddress} /></div>
          </DetailSection>

          <DetailSection title="Qualifications & Experience">
              <DetailItem label="Qualification" value={staffMember.educationalQualification} />
              <DetailItem label="Specialization" value={staffMember.specialization} />
              <DetailItem label="Years of Experience" value={`${staffMember.yearsOfExperience} years`} />
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Previous Experience" value={staffMember.previousExperience} /></div>
          </DetailSection>

          <DetailSection title="Professional Details">
              <DetailItem label="Date of Joining" value={formatDateForDisplay(staffMember.dateOfJoining)} />
              <DetailItem label="Employee Type" value={staffMember.employeeType} />
              {assignedClass && <DetailItem label="Class Teacher Of" value={assignedClass} />}
              {staffMember.staffType === 'Teaching' && (
                <>
                    <DetailItem label="Teacher License No." value={staffMember.teacherLicenseNumber} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <BookOpenIcon className="w-4 h-4 text-indigo-600" />
                                    Classes &amp; Subjects Taught ({staffMember.assignedSubjects?.length || 0})
                                </span>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAssignmentsModalOpen(true)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <EditIcon className="w-3.5 h-3.5" />
                                        Add / Edit / Delete Subjects
                                    </button>
                                )}
                            </div>
                            {subjectsByGrade && Object.keys(subjectsByGrade).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(subjectsByGrade).map(([grade, subjects]: [string, string[]]) => (
                                        <div key={grade} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                            <div className="font-bold text-xs text-indigo-950 mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                                                <span className="flex items-center gap-1">
                                                    <AcademicCapIcon className="w-3.5 h-3.5 text-indigo-600" />
                                                    {grade}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {subjects.length} subject(s)
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {subjects.map(sub => (
                                                    <span key={sub} className="bg-indigo-50 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                    <BookOpenIcon className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                                    <p className="text-xs text-slate-500 font-medium">No subjects or classes currently assigned to this teacher.</p>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAssignmentsModalOpen(true)}
                                            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                        >
                                            + Assign classes and subjects now
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
              )}
          </DetailSection>

          <DetailSection title="Payroll Details">
            <DetailItem label="Salary Grade" value={staffMember.salaryGrade} />
            <DetailItem label="Basic Salary" value={staffMember.basicSalary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(staffMember.basicSalary) : 'N/A'} />
            <DetailItem label="PAN Number" value={staffMember.panNumber} />
            <DetailItem label="Bank Name" value={staffMember.bankName} />
            <div className="sm:col-span-2"><DetailItem label="Bank Account Number" value={staffMember.bankAccountNumber} /></div>
          </DetailSection>
          
          <DetailSection title="Attendance Records">
                <div className="sm:col-span-3 bg-slate-50 text-slate-700 p-4 rounded-lg text-center">
                    Full attendance tracking feature is coming soon.
                </div>
          </DetailSection>
          
          <DetailSection title="Emergency Contact">
              <DetailItem label="Contact Name" value={staffMember.emergencyContactName} />
              <DetailItem label="Relationship" value={staffMember.emergencyContactRelationship} />
              <DetailItem label="Contact Number" value={staffMember.emergencyContactNumber} />
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Known Medical Conditions" value={staffMember.medicalConditions} /></div>
          </DetailSection>
      </div>

      <StaffFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        staffMember={staffMember}
        allStaff={staff}
        gradeDefinitions={gradeDefinitions}
        isSaving={isSaving}
      />

      <TeacherSubjectAssignmentsModal
        isOpen={isAssignmentsModalOpen}
        onClose={() => setIsAssignmentsModalOpen(false)}
        teacher={staffMember}
        gradeDefinitions={gradeDefinitions}
        allStaff={staff}
        onSave={handleSaveAssignments}
        isSaving={isSaving}
      />
    </div>
  );
};

export default StaffDetailPage;