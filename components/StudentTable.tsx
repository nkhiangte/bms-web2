

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Student, Grade } from '@/types';
import { EditIcon, UserIcon } from './Icons';
import { formatStudentId } from '../utils';

const { Link } = ReactRouterDOM;

interface StudentTableProps {
    students: Student[];
    onEdit: (student: Student) => void;
    academicYear: string;
    user: User;
    assignedGrade: Grade | null;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, academicYear, user, assignedGrade }) => {
  if (students.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-700 text-lg font-semibold">No student records found.</p>
        <p className="text-slate-600 mt-2">Try adjusting your search or filter.</p>
      </div>
    );
  }

  const canEdit = (student: Student) => user.role === 'admin' || student.grade === assignedGrade;

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
              <button onClick={() => onEdit(student)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full flex-shrink-0 self-start" title="Edit">
                <EditIcon className="w-5 h-5" />
              </button>
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
                {(user.role === 'admin' || assignedGrade) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      {canEdit(student) && (
                        <button onClick={() => onEdit(student)} className="text-sky-600 hover:text-sky-800 transition-colors" title="Edit">
                          <EditIcon className="w-5 h-5" />
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
    </>
  );
};

export default StudentTable;