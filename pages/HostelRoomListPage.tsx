

import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { HostelResident, Student } from '../types';
import { BackIcon, HomeIcon, BedIcon, UsersIcon } from '../components/Icons';
import { HOSTEL_DORMITORY_LIST } from '../constants';

const { Link, useNavigate } = ReactRouterDOM as any;

interface HostelRoomListPageProps {
    residents: HostelResident[];
    students: Student[];
}

const HostelRoomListPage: React.FC<HostelRoomListPageProps> = ({ residents, students }) => {
    const navigate = useNavigate();

    const dormitoryDetails = useMemo(() => {
        return HOSTEL_DORMITORY_LIST.map(dormitory => {
            const occupants = residents
                .filter(res => res.dormitory === dormitory)
                .map(res => students.find(stu => stu.id === res.studentId))
                .filter((stu): stu is Student => !!stu)
                .sort((a, b) => a.name.localeCompare(b.name));

            return {
                name: dormitory,
                occupants,
            };
        });
    }, [residents, students]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="mb-6 flex items-center gap-4">
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <BedIcon className="w-8 h-8" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dormitory Occupancy</h1>
                    <p className="text-slate-600 mt-1">Overview of all hostel dormitories and their occupants.</p>
                </div>
            </div>

            <div className="space-y-8">
                {dormitoryDetails.map(dorm => (
                    <div key={dorm.name}>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
                            <UsersIcon className="w-6 h-6 text-sky-700"/>
                            {dorm.name} ({dorm.occupants.length} students)
                        </h2>
                        {dorm.occupants.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {dorm.occupants.map(occupant => (
                                    <Link 
                                        to={`/portal/student/${occupant.id}`} 
                                        key={occupant.id}
                                        className="bg-slate-50 p-3 rounded-lg border hover:bg-sky-50 hover:border-sky-300 transition-colors"
                                    >
                                        <p className="font-semibold text-slate-800 truncate">{occupant.name}</p>
                                        <p className="text-sm text-slate-600">{occupant.grade} - Roll No: {occupant.rollNo}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                             <div className="p-4 bg-slate-100 rounded-md text-center text-slate-600">
                                This dormitory is currently empty.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HostelRoomListPage;