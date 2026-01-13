import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Staff, TcRecord, ServiceCertificateRecord, Grade } from '../types';
import { HomeIcon, ChevronRightIcon } from './Icons';

const { Link, useLocation } = ReactRouterDOM as any;

interface BreadcrumbsProps {
  students: Student[];
  staff: Staff[];
  tcRecords: TcRecord[];
  serviceCerts: ServiceCertificateRecord[];
  academicYear: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ students, staff, tcRecords, serviceCerts, academicYear }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x && x !== 'portal');

  const nameMapping: Record<string, string> = {
    'students': 'Students',
    'classes': 'Classes',
    'staff': 'Staff',
    'fees': 'Fee Management',
    'inventory': 'Inventory',
    'transfers': 'Transfer Management',
    'hostel-dashboard': 'Hostel Dashboard',
    'hostel': 'Hostel',
    'calendar': 'Calendar',
    'communication': 'Communication',
    'change-password': 'Change Password',
    'routine': 'Routine',
    'reports': 'Reports',
    'academics': 'Academics',
    'insights': 'AI Insights',
    'homework-scanner': 'Homework Scanner',
    'activity-log': 'Activity Log',
    'news-management': 'News Management',
    'users': 'User Management',
    'promotion': 'Promotion',
    'subjects': 'Manage Subjects',
    'sitemap-editor': 'Sitemap Editor',
    'attendance-logs': 'Attendance Logs',
    'certificates': 'Certificates',
    'generate': 'Generate',
    'print': 'Print',
    'records': 'Records',
    'bulk-print': 'Bulk Print'
  };

  const breadcrumbs = pathnames.map((value, index) => {
    const to = `/portal/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;

    let name = nameMapping[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

    const prevSegment = index > 0 ? pathnames[index - 1] : null;
    try {
        if (prevSegment === 'student') {
            const student = students.find(s => s.id === value);
            name = student ? student.name : 'Student Detail';
        } else if (prevSegment === 'classes' || prevSegment === 'bulk-print') {
            name = decodeURIComponent(value);
        } else if (prevSegment === 'staff' && staff.some(s => s.id === value)) {
            const staffMember = staff.find(s => s.id === value);
            name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Detail';
        } else if (prevSegment === 'print' && pathnames.includes('transfers')) {
            const record = tcRecords.find(r => r.id === value);
            name = record ? `TC: ${record.nameOfStudent}` : 'Print TC';
        } else if (prevSegment === 'print' && pathnames.includes('certificates')) {
            const record = serviceCerts.find(r => r.id === value);
            name = record ? `Cert: ${record.staffDetails.name}` : 'Print Certificate';
        }
    } catch(e) {
        console.error("Error resolving breadcrumb name:", e);
    }
    

    return isLast ? (
      <span key={to} className="font-semibold text-slate-800" aria-current="page">{name}</span>
    ) : (
      <Link key={to} to={to} className="text-sky-600 hover:underline">{name}</Link>
    );
  });

  if (pathnames.length === 0 || pathnames[0] === 'dashboard' || pathnames[0] === 'parent-dashboard') {
    return null; // Don't show on the main dashboard pages
  }

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm print-hidden" aria-label="Breadcrumb">
      <Link to="/portal/dashboard" className="text-slate-500 hover:text-sky-600" title="Go to Dashboard">
        <HomeIcon className="w-5 h-5" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          {crumb}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
