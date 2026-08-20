
import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, Grade } from '@/types';
import { GRADES_LIST } from '@/constants';
import { EditIcon, UserIcon, TrashIcon } from '@/components/Icons';
import { formatStudentId } from '@/utils';
import ConfirmationModal from '@/components/ConfirmationModal';

const { Link } = ReactRouterDOM as any;

type SortField = 'studentId' | 'name' | 'grade';
type SortDirection = 'asc' | 'desc';

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
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    if (!sortField) return students;

    return [...students].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'studentId') {
        const idA = formatStudentId(a, academicYear).toLowerCase();
        const idB = formatStudentId(b, academicYear).toLowerCase();
        comparison = idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else if (sortField === 'grade') {
        const indexA = GRADES_LIST.indexOf(a.grade);
        const indexB = GRADES_LIST.indexOf(b.grade);
        if (indexA !== -1 && indexB !== -1) {
          comparison = indexA - indexB;
        } else {
          comparison = (a.grade || '').localeCompare(b.grade || '');
        }
        if (comparison === 0) {
          comparison = (a.rollNo || 0) - (b.rollNo || 0) || a.name.localeCompare(b.name);
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [students, sortField, sortDirection, academicYear]);

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

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="inline-flex flex-col ml-1.5 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity">
          <svg className="w-2.5 h-2.5 -mb-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4l-6 6h12z"/>
          </svg>
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 20l-6-6h12z"/>
          </svg>
        </span>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <span className="inline-flex ml-1.5 text-sky-600 font-bold" title="Sorted Ascending">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4l-6 6h12z"/>
          </svg>
        </span>
      );
    }

    return (
      <span className="inline-flex ml-1.5 text-sky-600 font-bold" title="Sorted Descending">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 20l-6-6h12z"/>
        </svg>
      </span>
    );
  };

  return (
    <>
      {/* Mobile Sorting Controls */}
      <div className="md:hidden flex items-center justify-between mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600">Sort by:</span>
        <div className="flex gap-1">
          {(['studentId', 'name', 'grade'] as const).map(field => {
            const labels = { studentId: 'ID', name: 'Name', grade: 'Grade' };
            const isActive = sortField === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => handleSort(field)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{labels[field]}</span>
                {isActive && (sortDirection === 'asc' ? '▲' : '▼')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
        {sortedStudents.map(student => (
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
              <th
                scope="col"
                onClick={() => handleSort('studentId')}
                className="group px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                title="Click to sort by Student ID"
              >
                <div className="inline-flex items-center">
                  <span>Student ID</span>
                  {renderSortIndicator('studentId')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('name')}
                className="group px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                title="Click to sort by Name"
              >
                <div className="inline-flex items-center">
                  <span>Name</span>
                  {renderSortIndicator('name')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('grade')}
                className="group px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                title="Click to sort by Grade"
              >
                <div className="inline-flex items-center">
                  <span>Grade</span>
                  {renderSortIndicator('grade')}
                </div>
              </th>
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
            {sortedStudents.map(student => (
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