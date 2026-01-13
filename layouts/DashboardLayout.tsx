import React, { useState } from 'react';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord } from '../types';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';

interface DashboardLayoutProps {
    user: User;
    onLogout: () => void;
    children: React.ReactNode;
    students: Student[];
    staff: Staff[];
    tcRecords: TcRecord[];
    serviceCerts: ServiceCertificateRecord[];
    academicYear: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, children, students, staff, tcRecords, serviceCerts, academicYear }) => {
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
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
