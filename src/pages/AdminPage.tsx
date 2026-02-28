import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    BackIcon, 
    HomeIcon, 
    BriefcaseIcon,
    InboxArrowDownIcon,
    UserGroupIcon,
    DocumentReportIcon,
    CogIcon,
    CurrencyDollarIcon
} from '@/components/Icons';
import { db } from '@/firebaseConfig';
import { formatStudentId } from '@/utils';
import { Student } from '@/types';

const { Link, useNavigate } = ReactRouterDOM as any;

// Inline document icon (avoids needing a new icon export)
const DocIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const AdminCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  count?: number;
}> = ({ title, description, icon, link, count }) => (
    <Link to={link} className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border-l-4 border-sky-500">
        <div className="flex items-start gap-4">
            <div className="bg-sky-100 text-sky-600 p-3 rounded-lg">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{title}</h3>
                <p className="text-slate-600 text-sm mt-1">{description}</p>
            </div>
            {count !== undefined && (
                <div className="ml-auto text-3xl font-bold text-sky-600">{count}</div>
            )}
        </div>
    </Link>
);

interface AdminPageProps {
    pendingAdmissionsCount: number;
    pendingParentCount: number;
    pendingStaffCount: number;
    students: Student[];
    academicYear: string;
}

const AdminPage: React.FC<AdminPageProps> = ({
    pendingAdmissionsCount,
    pendingParentCount,
    pendingStaffCount,
    students,
    academicYear
}) => {
    const navigate = useNavigate();
    const [migrating, setMigrating] = useState(false);
    const [migrateResult, setMigrateResult] = useState<string | null>(null);

    const handleMigrateStudentIds = async () => {
        if (!window.confirm('This will write the correct studentId and academicYear into every student record that is missing them. Continue?')) return;
        setMigrating(true);
        setMigrateResult(null);
        try {
            const snapshot = await db.collection('students').get();
            const batch = db.batch();
            let count = 0;
            snapshot.docs.forEach(doc => {
                const s = doc.data() as Student;
                const updates: Record<string, any> = {};
                const correctId = formatStudentId({ ...s, studentId: undefined }, academicYear);
                if (!s.studentId || s.studentId !== correctId) {
                    updates.studentId = correctId;
                }
                if (!s.academicYear) {
                    updates.academicYear = academicYear;
                }
                if (Object.keys(updates).length > 0) {
                    batch.update(doc.ref, updates);
                    count++;
                }
            });
            await batch.commit();
            setMigrateResult(`✅ Done! Updated ${count} student records.`);
        } catch (err: any) {
            setMigrateResult(`❌ Error: ${err.message}`);
        } finally {
            setMigrating(false);
        }
    };

   const adminLinks = [
    { title: "Manage Staff", description: "Add, view, and manage all staff profiles.", icon: <BriefcaseIcon className="w-7 h-7" />, link: "/portal/staff" },
    { title: "Prescribed Textbooks", description: "Manage class folders and textbook links for the public page.", icon: <DocIcon />, link: "/portal/manage-textbooks" },
    { title: "Fee Management", description: "Collect tuition/exam fees and edit fee structures.", icon: <CurrencyDollarIcon className="w-7 h-7" />, link: "/portal/fees" },
    { title: "Online Admissions", description: "Review and process new student applications.", icon: <InboxArrowDownIcon className="w-7 h-7" />, link: "/portal/admissions", count: pendingAdmissionsCount },
    { title: "Admission Settings", description: "Edit Admission & Re-admission fees for both new and existing students.", icon: <CurrencyDollarIcon className="w-7 h-7" />, link: "/portal/admission-settings" },
    { title: "Parents Management", description: "View parent biodata and approve new accounts.", icon: <UserGroupIcon className="w-7 h-7" />, link: "/portal/parents", count: pendingParentCount },
    { title: "Staff User Accounts", description: "Approve new user registrations for staff.", icon: <UserGroupIcon className="w-7 h-7" />, link: "/portal/users", count: pendingStaffCount },
    { title: "News Management", description: "Create and manage school news.", icon: <DocumentReportIcon className="w-7 h-7" />, link: "/portal/news-management" },
    { title: "School Settings", description: "Update school info, payment QR codes, etc.", icon: <CogIcon className="w-7 h-7" />, link: "/portal/settings" },
    { title: "Manage Documents", description: "Upload and manage downloadable PDF documents for the website.", icon: <DocIcon />, link: "/portal/documents" },
];

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </Link>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
                <p className="text-slate-600 mt-2">Central hub for all administrative tasks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminLinks.map(link => (
                    <AdminCard key={link.title} {...link} />
                ))}
            </div>

            <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <h2 className="text-lg font-bold text-amber-800 mb-1">🔧 Data Maintenance</h2>
                <p className="text-sm text-amber-700 mb-4">Run this once to write correct <code>studentId</code> and <code>academicYear</code> fields into all student records. Safe to run multiple times.</p>
                <button
                    onClick={handleMigrateStudentIds}
                    disabled={migrating}
                    className="btn btn-secondary border-amber-400 text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                    {migrating ? 'Updating...' : 'Fix Student IDs in Database'}
                </button>
                {migrateResult && <p className="mt-3 text-sm font-semibold text-slate-700">{migrateResult}</p>}
            </div>
        </div>
    );
};

export default AdminPage;
