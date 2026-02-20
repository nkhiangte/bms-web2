
import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, EmploymentStatus, Grade, GradeDefinition, User } from '@/types';
import { UserIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

interface FacultyPageProps {
    staff: Staff[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
    user: User | null;
}

// A self-contained, robust component for displaying a photo with a fallback.
const PhotoWithFallback: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(!src);

    useEffect(() => {
        setHasError(!src);
    }, [src]);

    const handleError = () => {
        setHasError(true);
    };

    return (
        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
            {hasError ? (
                <div className="flex items-center justify-center text-slate-500 w-full h-full">
                    <UserIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                <img src={src} alt={alt} className="h-full w-full object-cover" onError={handleError} />
            )}
        </div>
    );
};

// A self-contained, robust component for the faculty member card.
const FacultyCard: React.FC<{ member: Staff; assignedClass: Grade | null }> = ({ member, assignedClass }) => (
    <Link to={`/staff/${member.id}`} className="group block bg-white rounded-xl shadow-lg p-5 text-center flex flex-col transition-all duration-300 h-full hover:shadow-xl hover:scale-105">
        <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto">
            <PhotoWithFallback src={member.photographUrl} alt={`${member.firstName} ${member.lastName}`} />
        </div>
        <div className="mt-4 flex-grow">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{member.firstName} {member.lastName}</h3>
            <p className="text-md text-sky-700 font-semibold">{member.designation}</p>
        </div>
        {assignedClass && (
            <div className="mt-4 pt-3 border-t border-slate-200">
                <p className="text-sm text-slate-600">Class Teacher of <strong className="text-slate-800">{assignedClass}</strong></p>
            </div>
        )}
    </Link>
);


const FacultyPage: React.FC<FacultyPageProps> = ({ staff, gradeDefinitions, user }) => {
    
    const activeTeachingStaff = useMemo(() => {
        return (staff || [])
            .filter(s => 
                s && 
                s.staffType?.toLowerCase() === 'teaching' && 
                s.status?.toLowerCase() === EmploymentStatus.ACTIVE.toLowerCase()
            )
            .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    }, [staff]);

    const classTeacherMap = useMemo(() => {
        const map = new Map<string, Grade>();
        if (gradeDefinitions) {
            for (const grade in gradeDefinitions) {
                const def = gradeDefinitions[grade as Grade];
                if (def && def.classTeacherId) {
                    map.set(def.classTeacherId, grade as Grade);
                }
            }
        }
        return map;
    }, [gradeDefinitions]);

    return (
        <div className="py-16 bg-slate-50 min-h-[70vh]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                        <EditableContent id="faculty_title" defaultContent="Our Esteemed Faculty" type="text" user={user} />
                    </h1>
                    <div className="mt-4 text-lg text-slate-600">
                         <EditableContent id="faculty_subtitle" defaultContent="Meet the dedicated educators shaping the future." type="text" user={user} />
                    </div>
                </div>

                {activeTeachingStaff.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {activeTeachingStaff.map(member => {
                            const assignedClass = classTeacherMap.get(member.id) || null;
                            return <FacultyCard key={member.id} member={member} assignedClass={assignedClass} />;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-700 text-lg font-semibold">Faculty Information Not Available</p>
                        <p className="text-slate-600 mt-2">Faculty information is currently being updated. Please check back soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default FacultyPage;
