
import React from 'react';
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
} from '../components/Icons';

const { Link, useNavigate } = ReactRouterDOM as any;

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
}

const AdminPage: React.FC<AdminPageProps> = ({
    pendingAdmissionsCount,
    pendingParentCount,
    pendingStaffCount
}) => {
    const navigate = useNavigate();

    const adminLinks = [
        { title: "Manage Staff", description: "Add, view, and manage all staff profiles.", icon: <BriefcaseIcon className="w-7 h-7" />, link: "/portal/staff" },
        { title: "Online Admissions", description: "Review and process new student applications.", icon: <InboxArrowDownIcon className="w-7 h-7" />, link: "/portal/admissions", count: pendingAdmissionsCount },
        { title: "Admission Settings", description: "Configure fees, items, and mandatory requirements.", icon: <CurrencyDollarIcon className="w-7 h-7" />, link: "/portal/admission-settings" },
        { title: "Parents Management", description: "View parent biodata and approve new accounts.", icon: <UserGroupIcon className="w-7 h-7" />, link: "/portal/parents", count: pendingParentCount },
        { title: "Staff User Accounts", description: "Approve new user registrations for staff.", icon: <UserGroupIcon className="w-7 h-7" />, link: "/portal/users", count: pendingStaffCount },
        { title: "News Management", description: "Create and manage school news.", icon: <DocumentReportIcon className="w-7 h-7" />, link: "/portal/news-management" },
        { title: "School Settings", description: "Update school info, payment QR codes, etc.", icon: <CogIcon className="w-7 h-7" />, link: "/portal/settings" },
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
        </div>
    );
};

export default AdminPage;
