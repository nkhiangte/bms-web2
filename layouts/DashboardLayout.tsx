
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord } from '/types';
import Header from '/components/Header';
import Sidebar from '/components/Sidebar';
import Breadcrumbs from '/components/Breadcrumbs';

const { Outlet, useLocation } = ReactRouterDOM as any;

interface DashboardLayoutProps {
    user: User;
    onLogout: () => void;
    students: Student[];
    staff: Staff[];
    tcRecords: TcRecord[];
    serviceCerts: ServiceCertificateRecord[];
    academicYear: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, students, staff, tcRecords, serviceCerts, academicYear }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isParentDashboard = location.pathname === '/portal/parent-dashboard';

    return (
        <div className="relative flex h-screen print:h-auto print:block">
            {isParentDashboard && (
                <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100"></div>
            )}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
            <div className={`flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:block ${isParentDashboard ? '' : 'bg-slate-100'}`}>
                <Header 
                    user={user} 
                    onLogout={onLogout} 
                    onToggleSidebar={() => setIsSidebarOpen(v => !v)} 
                    className={`print-hidden ${isParentDashboard ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}`}
                />
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:h-auto print:p-0">
                    {!isParentDashboard && <Breadcrumbs 
                        students={students}
                        staff={staff}
                        tcRecords={tcRecords}
                        serviceCerts={serviceCerts}
                        academicYear={academicYear}
                    />}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
