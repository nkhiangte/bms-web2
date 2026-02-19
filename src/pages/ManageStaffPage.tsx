import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, EmploymentStatus, Grade, GradeDefinition, Designation, User } from '@/types';
import { PlusIcon, SearchIcon, HomeIcon, BackIcon, EditIcon, BriefcaseIcon, PhoneIcon, MailIcon, TrashIcon, DocumentReportIcon, InboxArrowDownIcon, ChevronDownIcon, SpinnerIcon } from '@/components/Icons';
import * as XLSX from 'xlsx';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import StaffFormModal from '@/components/StaffFormModal';
import ConfirmationModal from '@/components/ConfirmationModal'; 

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageStaffPageProps {
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onSaveStaff: (staffData: Omit<Staff, 'id'>, id: string | undefined, assignedGrade: Grade | null) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  user: User;
}

const StaffCard: React.FC<{ 
    staffMember: Staff;
    onEdit: (staffMember: Staff) => void;
    onDelete: (staffMember: Staff) => void;
    user: User;
}> = ({ staffMember, onEdit, onDelete, user }) => {
    const { status, firstName, lastName, designation, department } = staffMember;
    const isActive = status === EmploymentStatus.ACTIVE;
    
    const statusStyles = {
        [EmploymentStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
        [EmploymentStatus.ON_LEAVE]: 'bg-amber-100 text-amber-800',
        [EmploymentStatus.RESIGNED]: 'bg-rose-100 text-rose-800',
        [EmploymentStatus.RETIRED]: 'bg-slate-200 text-slate-700',
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const canEdit = isAdmin || (user?.email && staffMember.emailAddress && user.email.trim().toLowerCase() === staffMember.emailAddress.trim().toLowerCase());
    const canDelete = isAdmin;

    return (
        <div className={`bg-white rounded-xl shadow-lg p-5 flex flex-col transition-all duration-300 h-full ${!isActive ? 'opacity-70 bg-slate-50' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
            <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full shadow-md border-2 border-white flex-shrink-0">
                    <Link to={`/staff/${staffMember.id}`} className="block w-full h-full">
                        <PhotoWithFallback src={staffMember.photographUrl} alt={`${firstName} ${lastName}'s photograph`} />
                    </Link>
                </div>
                <div className="flex-grow">
                    <Link to={`/staff/${staffMember.id}`} className="block">
                        <h3 className="text-xl font-bold text-slate-900 hover:text-sky-700">{firstName} {lastName}</h3>
                    </Link>
                    <p className="text-md text-sky-700 font-semibold">{designation}</p>
                    <p className="text-sm text-slate-700">{department}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles[EmploymentStatus.RETIRED]}`}>
                        {status}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2 z-10">
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            if(!canEdit) { alert("You do not have permission to edit this staff member."); return; }
                            onEdit(staffMember); 
                        }} 
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full flex-shrink-0 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                        title={canEdit ? "Edit Staff Details" : "You can only edit your own profile"}
                        disabled={!canEdit}
                    >
                        <EditIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            if(!canDelete) { alert("Only admins can delete staff."); return; }
                            onDelete(staffMember); 
                        }} 
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full flex-shrink-0 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                        title={canDelete ? "Remove Staff" : "Admin access required"}
                        disabled={!canDelete}
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-800 flex-grow">
                <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <span>{staffMember.educationalQualification} ({staffMember.yearsOfExperience} yrs exp.)</span>
                </div>
                <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <span>{staffMember.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <a href={`mailto:${staffMember.emailAddress}`} className="hover:underline text-sky-700 truncate">{staffMember.emailAddress}</a>
                </div>
            </div>
        </div>
    );
};


const StaffGrid: React.FC<{staff: Staff[], onEdit: (staffMember: Staff) => void, onDelete: (staffMember: Staff) => void, user: User, title?: string}> = ({ staff, onEdit, onDelete, user, title }) => {
    if (staff.length === 0) {
        return <p className="text-slate-600 text-center py-4">{title ? `No staff found for ${title}.` : "No staff found."}</p>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(member => (
                <StaffCard
                    key={member.id}
                    staffMember={member}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    user={user}
                />
            ))}
        </div>
    )
}

const PrintableStaffList: React.FC<{ staff: Staff[] }> = ({ staff }) => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bethel Mission School - Staff List</h1>
      <table className="w-full border-collapse border border-slate-400 text-sm">
        <thead>
          <tr className="bg-slate-200">
            <th className="border p-2 text-left">Employee ID</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Staff Type</th>
            <th className="border p-2 text-left">Designation</th>
            <th className="border p-2 text-left">Department</th>
            <th className="border p-2 text-left">Contact</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(member => (
            <tr key={member.id}>
              <td className="border p-2">{member.employeeId}</td>
              <td className="border p-2">{`${member.firstName} ${member.lastName}`}</td>
              <td className="border p-2">{member.staffType}</td>
              <td className="border p-2">{member.designation}</td>
              <td className="border p-2">{member.department}</td>
              <td className="border p-2">{member.contactNumber}</td>
              <td className="border p-2">{member.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);

const ManageStaffPage: React.FC<ManageStaffPageProps> = ({ staff, gradeDefinitions, onSaveStaff, onDeleteStaff, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'teaching' | 'non-teaching'>('teaching');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // State for delete confirmation modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const confinedGrades: Grade[] = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II];

  const filteredStaff = useMemo(() => 
    staff.filter(s => 
        ((s.firstName || '') + ' ' + (s.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase())
    ), 
  [staff, searchTerm]);

  const teachingStaff = useMemo(() => filteredStaff.filter(s => s.staffType === 'Teaching'), [filteredStaff]);
  const nonTeachingStaff = useMemo(() => filteredStaff.filter(s => s.staffType === 'Non-Teaching'), [filteredStaff]);

  const confinedTeachers = useMemo(() => 
      teachingStaff.filter(s => {
          const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === s.id) as Grade | null;
          return assignedGradeKey && confinedGrades.includes(assignedGradeKey);
      })
  , [teachingStaff, gradeDefinitions]);
  
  const subjectTeachers = useMemo(() => 
      teachingStaff.filter(s => !confinedTeachers.some(ct => ct.id === s.id))
  , [teachingStaff, confinedTeachers]);

  const clerks = useMemo(() => nonTeachingStaff.filter(s => s.designation === Designation.CLERK), [nonTeachingStaff]);
  const librarians = useMemo(() => nonTeachingStaff.filter(s => s.designation === Designation.LIBRARIAN), [nonTeachingStaff]);
  const sportsTeachers = useMemo(() => nonTeachingStaff.filter(s => s.designation === Designation.SPORTS_TEACHER), [nonTeachingStaff]);

  // --- Handlers ---
  const handleOpenAdd = () => {
      setEditingStaff(null);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (staffMember: Staff) => {
      if (!staffMember) {
          alert("Error: No staff member selected for editing.");
          return;
      }
      setEditingStaff(staffMember);
      setIsModalOpen(true);
  };
  
  const handleSave = async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
      setIsSaving(true);
      try {
          await onSaveStaff(staffData, editingStaff?.id, assignedGradeKey);
          setIsModalOpen(false);
      } catch (error: any) {
          console.error("Failed to save staff:", error);
          alert(`Failed to save staff member: ${error.message || 'Unknown error. Check console for details.'}`);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteClick = (staffMember: Staff) => {
      if (!staffMember || !staffMember.id) {
          alert("Error: Invalid staff member record for deletion.");
          return;
      }
      setStaffToDelete(staffMember);
      setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
      if (!staffToDelete) return;
      setIsSaving(true); // Re-use isSaving for delete operation feedback
      try {
          await onDeleteStaff(staffToDelete.id);
          setIsDeleteConfirmOpen(false);
          setStaffToDelete(null);
      } catch (error: any) {
          console.error("Failed to delete staff:", error);
          alert(`Failed to delete staff member: ${error.message || 'Unknown error. Check console for details.'}`);
      } finally {
          setIsSaving(false);
      }
  };

  const getExportData = (dataToExport: Staff[]) => {
    const headers = [
        'EmployeeID', 'StaffType', 'FirstName', 'LastName', 'Gender', 'DateOfBirth', 'Nationality', 
        'MaritalStatus', 'BloodGroup', 'AadhaarNumber', 'ContactNumber', 'EmailAddress', 
        'PermanentAddress', 'CurrentAddress', 'EducationalQualification', 'Specialization', 
        'YearsOfExperience', 'PreviousExperience', 'DateOfJoining', 'Department', 'Designation', 
        'EmployeeType', 'Status', 'AssignedSubjects', 'TeacherLicenseNumber', 'SalaryGrade', 
        'BasicSalary', 'BankAccountNumber', 'BankName', 'PANNumber', 'EmergencyContactName', 
        'EmergencyContactRelationship', 'EmergencyContactNumber', 'MedicalConditions'
    ];

    const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (/[",\n\r]/.test(stringField)) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const rows = dataToExport.map(member => [
        escapeCsvField(member.employeeId),
        escapeCsvField(member.staffType),
        escapeCsvField(member.firstName),
        escapeCsvField(member.lastName),
        escapeCsvField(member.gender),
        escapeCsvField(member.dateOfBirth),
        escapeCsvField(member.nationality),
        escapeCsvField(member.maritalStatus),
        escapeCsvField(member.bloodGroup),
        escapeCsvField(member.aadhaarNumber),
        escapeCsvField(member.contactNumber),
        escapeCsvField(member.emailAddress),
        escapeCsvField(member.permanentAddress),
        escapeCsvField(member.currentAddress),
        escapeCsvField(member.educationalQualification),
        escapeCsvField(member.specialization),
        escapeCsvField(member.yearsOfExperience),
        escapeCsvField(member.previousExperience),
        escapeCsvField(member.dateOfJoining),
        escapeCsvField(member.department),
        escapeCsvField(member.designation),
        escapeCsvField(member.employeeType),
        escapeCsvField(member.status),
        escapeCsvField((member.assignedSubjects || []).map(a => `${a.grade}: ${a.subject}`).join(' | ')),
        escapeCsvField(member.teacherLicenseNumber),
        escapeCsvField(member.salaryGrade),
        escapeCsvField(member.basicSalary),
        escapeCsvField(member.bankAccountNumber),
        escapeCsvField(member.bankName),
        escapeCsvField(member.panNumber),
        escapeCsvField(member.emergencyContactName),
        escapeCsvField(member.emergencyContactRelationship),
        escapeCsvField(member.emergencyContactNumber),
        escapeCsvField(member.medicalConditions)
    ]);
    
    return { headers, rows };
  };

  const handleDownloadCsv = () => {
    const dataToExport = activeTab === 'teaching' ? teachingStaff : nonTeachingStaff;
    if (dataToExport.length === 0) {
        alert("No staff data available to download for the current view.");
        return;
    }
    const { headers, rows } = getExportData(dataToExport);
    const csvContent = [headers.join(','), ...rows.map(row => row.