import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord } from '../types';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';

const { Outlet } = ReactRouterDOM as any;

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

    return (
        <div className="flex h-screen print:h-auto print:block">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
            <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:block">
                <Header user={user} onLogout={onLogout} onToggleSidebar={() => setIsSidebarOpen(v => !v)} className="print-hidden"/>
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:h-auto print:p-0">
                    <Breadcrumbs 
                        students={students}
                        staff={staff}
                        tcRecords={tcRecords}
                        serviceCerts={serviceCerts}
                        academicYear={academicYear}
                    />
                    {/* The Outlet renders the current child route's element */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;