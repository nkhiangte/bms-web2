
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, EditIcon, CheckIcon, XIcon } from '../components/Icons';
import { User, Student, HostelResident, Chore, ChoreRoster, Gender, DailyChoreAssignment } from '../types';
import { CHORE_LIST, DAYS_OF_WEEK } from '../constants';

interface HostelChoreRosterPageProps {
    user: User;
    students: Student[];
    residents: HostelResident[];
    choreRoster: ChoreRoster;
    onUpdateChoreRoster: (newRoster: ChoreRoster) => Promise<void>;
    academicYear: string;
}

const girlsOnlyChores: Chore[] = [
    Chore.GIRLS_I_CLEANING,
    Chore.GIRLS_II_CLEANING,
    Chore.FOOD_SERVER,
    Chore.VERANDA_CLEANING,
    Chore.TEA_SERVER,
    Chore.RAG_WASHER,
    Chore.MOPPER,
    Chore.ROAD_SWEEPER,
];

const boysOnlyChores: Chore[] = [
    Chore.BOYS_DORM_CLEANER,
    Chore.SHOE_POLISHER,
    Chore.TEACHERS_PLATE_WASHER,
    Chore.DINING_HALL_SWEEPER,
    Chore.BIO_WASTE_WATER_BOYS
];


const HostelChoreRosterPage: React.FC<HostelChoreRosterPageProps> = ({ user, students, residents, choreRoster, onUpdateChoreRoster, academicYear }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoster, setEditableRoster] = useState<ChoreRoster>({} as ChoreRoster);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    const residentDetails = useMemo(() => {
        return residents.map(resident => {
            const student = studentMap.get(resident.studentId);
            return {
                residentId: resident.id,
                studentId: resident.studentId,
                name: student?.name || 'Unknown Student',
                grade: student?.grade || 'N/A',
                dormitory: resident.dormitory,
                gender: student?.gender,
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [residents, studentMap]);

    const normalizeRoster = (roster: ChoreRoster): ChoreRoster => {
        const normalized: ChoreRoster = {} as ChoreRoster;
        CHORE_LIST.forEach(chore => {
            normalized[chore] = {};
            DAYS_OF_WEEK.forEach(day => {
                normalized[chore][day] = roster[chore]?.[day] || [];
            });
        });
        return normalized;
    };
    
    useEffect(() => {
        if (choreRoster) {
            setEditableRoster(normalizeRoster(choreRoster));
        }
    }, [choreRoster]);

    const handleEditToggle = () => {
        setEditableRoster(normalizeRoster(choreRoster));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditableRoster(normalizeRoster(choreRoster));
        setIsEditing(false);
    };

    const handleSave = async () => {
        await onUpdateChoreRoster(editableRoster);
        setIsEditing(false);
    };

    const handleCheckboxChange = (chore: Chore, day: string, residentId: string, isChecked: boolean) => {
        setEditableRoster(prev => {
            const currentAssignments = prev[chore]?.[day] || [];
            const newAssignments = isChecked
                ? [...new Set([...currentAssignments, residentId])] // Add, ensuring uniqueness
                : currentAssignments.filter(id => id !== residentId); // Remove

            return {
                ...prev,
                [chore]: {
                    ...(prev[chore] as DailyChoreAssignment),
                    [day]: newAssignments
                }
            };
        });
    };

    const getResidentsForChore = (chore: Chore) => {
        if (girlsOnlyChores.includes(chore)) {
            return residentDetails.filter(r => r.gender === Gender.FEMALE);
        }
        if (boysOnlyChores.includes(chore)) {
            return residentDetails.filter(r => r.gender === Gender.MALE);
        }
        return [];
    };
    
    const renderChoreTableView = (chore: Chore) => {
        const assignments = choreRoster[chore] || {};
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-slate-100">
                        <tr>
                            {DAYS_OF_WEEK.map(day => <th key={day} className="p-2 border font-semibold">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {DAYS_OF_WEEK.map(day => {
                                const residentIds = assignments[day] || [];
                                return (
                                    <td key={day} className="p-2 border align-top min-w-[150px]">
                                        {residentIds.length > 0 ? (
                                            <ul className="space-y-1">
                                                {residentIds.map(resId => {
                                                    const resident = residentDetails.find(rd => rd.residentId === resId);
                                                    return <li key={resId}>{resident ? resident.name : 'Unknown'}</li>;
                                                })}
                                            </ul>
                                        ) : (
                                            <span className="text-slate-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const renderChoreTableEdit = (chore: Chore) => {
        const assignments = editableRoster[chore] || {};
        const availableResidents = getResidentsForChore(chore);
        return (
             <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-slate-100">
                        <tr>
                            {DAYS_OF_WEEK.map(day => <th key={day} className="p-2 border font-semibold">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {DAYS_OF_WEEK.map(day => {
                                const assignedIds = new Set(assignments[day] || []);
                                return (
                                    <td key={day} className="p-1 border align-top min-w-[160px]">
                                        <div className="w-full h-48 overflow-y-auto p-1 space-y-1 bg-white border border-slate-300 rounded-md">
                                            {availableResidents.map(res => (
                                                <label key={res.residentId} className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                                        checked={assignedIds.has(res.residentId)}
                                                        onChange={(e) => handleCheckboxChange(chore, day, res.residentId, e.target.checked)}
                                                    />
                                                    <span>{res.name}</span>
                                                </label>
                                            ))}
                                            {availableResidents.length === 0 && (
                                                <p className="text-slate-500 text-xs text-center p-2">No residents available for this chore type.</p>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/hostel-dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Hostel Dashboard">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Hostel Chore Roster</h1>
                    <p className="text-slate-600 mt-1">Manage daily cleaning and duty assignments for residents.</p>
                </div>
                {!isEditing ? (
                    <button onClick={handleEditToggle} className="btn btn-primary">
                        <EditIcon className="w-5 h-5" /> Edit Roster
                    </button>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <button onClick={handleCancel} className="btn btn-secondary">
                            <XIcon className="w-5 h-5" /> Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700">
                            <CheckIcon className="w-5 h-5" /> Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {CHORE_LIST.map(chore => (
                    <div key={chore} className="bg-slate-50 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">{chore}</h2>
                        {isEditing ? renderChoreTableEdit(chore) : renderChoreTableView(chore)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HostelChoreRosterPage;
