
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, Grade } from '@/types';
import { EditIcon, UserIcon, TrashIcon } from '@/components/Icons';
import { formatStudentId } from '@/utils';
import ConfirmationModal from '@/components/ConfirmationModal';

const { Link } = ReactRouterDOM as any;

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, onDelete, academicYear, user, assignedGrade }) => {
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  if (students.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-700 text-lg font-semibold">No student records found.</p>
        <p className="text-slate-600 mt-2">Try adjusting your search or filter.</p>
      </div>
    );
  }

  const canEdit = (student: Student) => ['admin', 'user'].includes(user.role);
  const isAdmin = user.role === 'admin';

  const handleConfirmDelete = () => {
    if (studentToDelete && onDelete) {
      onDelete(studentToDelete.id);
    }
    setStudentToDelete(null);
  };

  return (
    <>
      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
        {students.map(student => (
          <div key={student.id} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex-shrink-0">
                <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                    {student.photographUrl ? (
                        <img src={student.photographUrl} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                        <UserIcon className="w-8 h-8 text-slate-500" />
                    )}
                </div>
            </div>
            <div className="flex-grow">
                <Link to={`/portal/student/${student.id}`} className="font-bold text-lg text-sky-700 hover:underline">
                    {student.name}
                </Link>
                <div className="text-sm text-slate-600">
                    <span>{student.grade}</span> &bull; <span className="font-mono text-xs">ID: {formatStudentId(student, academicYear)}</span>
                </div>
                <div className="text-xs mt-1 text-slate-500">
                    <span>Parent: {student.fatherName}</span>
                </div>
            </div>
            {canEdit(student) && (
              <div className="flex flex-col gap-2">
                <button onClick={() => onEdit(student)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full flex-shrink-0 self-start" title="Edit">
                  <EditIcon className="w-5 h-5" />
                </button>
                {isAdmin && onDelete && (
                  <button onClick={() => setStudentToDelete(student)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-full flex-shrink-0 self-start" title="Delete">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    
      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Grade</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Parent's Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Contact</th>
              {(user.role === 'admin' || assignedGrade) && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatStudentId(student, academicYear)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                  <Link to={`/portal/student/${student.id}`} className="hover:underline text-sky-700 font-semibold">
                    {student.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.fatherName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.contact}</td>
                {(user.role === 'admin' || user.role === 'user') && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      {canEdit(student) && (
                        <button onClick={() => onEdit(student)} className="text-sky-600 hover:text-sky-800 transition-colors" title="Edit">
                          <EditIcon className="w-5 h-5" />
                        </button>
                      )}
                      {isAdmin && onDelete && (
                        <button onClick={() => setStudentToDelete(student)} className="text-rose-600 hover:text-rose-800 transition-colors" title="Delete">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Permanent Deletion"
      >
        <div className="space-y-3">
          <p className="text-slate-700">
            Are you sure you want to <span className="font-bold text-rose-600">permanently delete</span> the record for <span className="font-bold">{studentToDelete?.name}</span>?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-sm">
            <p className="font-bold mb-1">Warning:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This action cannot be undone.</li>
              <li>All student data, including academic records and fee history, will be lost.</li>
              <li>If the student is just leaving, consider marking them as "Dropped" instead of deleting.</li>
            </ul>
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default StudentTable;