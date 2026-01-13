
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Student, StudentStatus } from '../types';
import PhotoWithFallback from '../components/PhotoWithFallback';
import { BookOpenIcon, CalendarDaysIcon } from '../components/Icons';

const { Link } = ReactRouterDOM as any;

const ActionCard: React.FC<{ title: string; link: string; icon: React.ReactNode; color: string }> = ({ title, link, icon, color }) => (
    <Link to={link} className={`group block p-6 bg-slate-50 rounded-lg text-slate-800 hover:bg-white hover:shadow-xl transition-all duration-300 border-l-4 ${color}`}>
        <div className="flex items-center gap-4">
            {icon}
            <h3 className="text-xl font-bold group-hover:text-sky-700">{title}</h3>
        </div>
    </Link>
);

interface ParentDashboardPageProps {
    user: User;
    allStudents: Student[];
}

const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ user, allStudents }) => {
    
    const linkedStudents = useMemo(() => {
        if (!user.studentIds || user.studentIds.length === 0) {
            return [];
        }
        return allStudents.filter(s => user.studentIds!.includes(s.id) && s.status === StudentStatus.ACTIVE);
    }, [user, allStudents]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">Parent Dashboard</h1>
                <p className="text-slate-600 text-lg mt-1">
                    Welcome, <span className="font-semibold text-sky-600">{user.displayName}</span>!
                </p>
            </div>
            
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ActionCard 
                        title="View Class Routine"
                        link="/portal/routine"
                        icon={<BookOpenIcon className="w-8 h-8 text-indigo-500"/>}
                        color="border-indigo-500"
                    />
                    <ActionCard 
                        title="View School Calendar"
                        link="/portal/calendar"
                        icon={<CalendarDaysIcon className="w-8 h-8 text-teal-500"/>}
                        color="border-teal-500"
                    />
                </div>
            </div>

            {linkedStudents.length > 0 ? (
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Children</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {linkedStudents.map(student => (
                            <div key={student.id} className="bg-slate-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-transform hover:scale-105 hover:shadow-lg">
                                <div className="w-32 h-32 rounded-full shadow-lg border-4 border-white mb-4">
                                    <PhotoWithFallback src={student.photographUrl} alt={`${student.name}'s photograph`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">{student.name}</h3>
                                <p className="text-slate-600 font-semibold">{student.grade} - Roll No: {student.rollNo}</p>
                                <div className="mt-6 w-full">
                                    <div className="flex flex-col gap-2">
                                        <Link to={`/portal/student/${student.id}`} className="btn btn-primary w-full">View Details</Link>
                                        <Link to={`/portal/student/${student.id}/attendance-log`} className="btn btn-secondary w-full">
                                            <CalendarDaysIcon className="w-5 h-5"/> Attendance Log
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-700 text-lg font-semibold">No Students Linked</p>
                    <p className="text-slate-600 mt-2 max-w-md mx-auto">
                        Your account has been created, but it is not yet linked to any student records.
                        Please contact the school administration to have your account linked to your child's profile.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ParentDashboardPage;
