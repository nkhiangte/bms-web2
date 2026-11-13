import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
import { Staff, EmploymentStatus, Grade, GradeDefinition, User } from '@/types';
import { UserIcon } from '@/components/Icons';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

interface FacultyPageProps {
    staff: Staff[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
    user: User | null;
}

const PhotoWithFallback: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(!src);
    useEffect(() => { setHasError(!src); }, [src]);
    return (
        <div className="relative w-full h-full bg-[#07162B] rounded-full flex items-center justify-center overflow-hidden">
            {hasError ? (
                <div className="flex items-center justify-center text-[#DFC06B]/60 w-full h-full">
                    <UserIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" onError={() => setHasError(true)} />
            )}
        </div>
    );
};

const FacultyCard: React.FC<{ member: Staff; assignedClass: Grade | null }> = ({ member, assignedClass }) => (
    <Link to={`/staff/${member.id}`} className="group block bg-[#132D52] border border-[#C9A84C]/30 rounded-xl shadow-lg p-5 text-center flex flex-col transition-all duration-300 h-full hover:shadow-2xl hover:border-[#C9A84C]">
        <div className="w-24 h-24 rounded-full shadow-lg border-4 border-[#C9A84C]/50 group-hover:border-[#C9A84C] flex-shrink-0 mx-auto transition-colors">
            <PhotoWithFallback src={member.photographUrl} alt={`${member.firstName} ${member.lastName}`} />
        </div>
        <div className="mt-4 flex-grow">
            <h3 className="text-xl font-bold text-white group-hover:text-[#DFC06B] transition-colors">{member.firstName} {member.lastName}</h3>
            <p className="text-sm text-[#DFC06B] font-semibold mt-0.5">{member.designation}</p>
        </div>
        {assignedClass && (
            <div className="mt-4 pt-3 border-t border-white/15">
                <p className="text-sm text-white/75">Class Teacher of <strong className="text-white">{assignedClass}</strong></p>
            </div>
        )}
    </Link>
);

const FacultyPage: React.FC<FacultyPageProps> = ({ staff, gradeDefinitions, user }) => {
    const activeTeachingStaff = useMemo(() => {
        return (staff || [])
            .filter(s => s && s.staffType?.toLowerCase() === 'teaching' && s.status?.toLowerCase() === EmploymentStatus.ACTIVE.toLowerCase())
            .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    }, [staff]);

    const classTeacherMap = useMemo(() => {
        const map = new Map<string, Grade>();
        if (gradeDefinitions) {
            for (const grade in gradeDefinitions) {
                const def = gradeDefinitions[grade as Grade];
                if (def && def.classTeacherId) map.set(def.classTeacherId, grade as Grade);
            }
        }
        return map;
    }, [gradeDefinitions]);

    const handleDownloadFacultyXlsx = () => {
        if (!activeTeachingStaff || activeTeachingStaff.length === 0) {
            alert('No faculty records available to download.');
            return;
        }

        const headers = [
            'Sl. No.',
            'Teacher Name',
            'Designation',
            'Department',
            'Class Teacher Of',
            'Assigned Subjects',
            'Educational Qualification',
            'Specialization',
            'Years of Experience',
            'Contact Number',
            'Email Address'
        ];

        const rows = activeTeachingStaff.map((member, index) => {
            const assignedClass = classTeacherMap.get(member.id);
            const subjects = (member.assignedSubjects || []).map(s => `${s.grade}: ${s.subject}`).join('; ');
            return [
                index + 1,
                `${member.firstName || ''} ${member.lastName || ''}`.trim(),
                member.designation || 'Teacher',
                member.department || 'Academics',
                assignedClass ? `Class ${assignedClass}` : '—',
                subjects || '—',
                member.educationalQualification || '—',
                member.specialization || '—',
                member.yearsOfExperience ?? '—',
                member.contactNumber || '—',
                member.emailAddress || '—'
            ];
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        const colWidths = headers.map((header, colIdx) => {
            let maxLen = header.length;
            for (const row of rows) {
                const cellVal = row[colIdx];
                if (cellVal !== undefined && cellVal !== null) {
                    maxLen = Math.max(maxLen, String(cellVal).length);
                }
            }
            return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
        });
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Faculty Directory');
        const today = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `BMS_Faculty_Directory_${today}.xlsx`);
    };

    return (
        <div className="py-12 sm:py-16 bg-[#0B1F3A] min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#DFC06B]">Academic Team</p>
                    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
                        <EditableContent id="faculty_title" defaultContent="Our Esteemed Faculty" type="text" user={user} />
                    </h1>
                    <div className="mt-3 text-base sm:text-lg text-white/80">
                        <EditableContent id="faculty_subtitle" defaultContent="Meet the dedicated educators shaping the future." type="text" user={user} />
                    </div>
                    {activeTeachingStaff.length > 0 && (
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={handleDownloadFacultyXlsx}
                                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-sm rounded-lg shadow-md transition cursor-pointer"
                                title="Download Faculty directory as Excel spreadsheet (.xlsx)"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Download Faculty List (.xlsx)</span>
                            </button>
                        </div>
                    )}
                </div>
                {activeTeachingStaff.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                        {activeTeachingStaff.map(member => {
                            const assignedClass = classTeacherMap.get(member.id) || null;
                            return <FacultyCard key={member.id} member={member} assignedClass={assignedClass} />;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-[#C9A84C]/35 rounded-xl">
                        <p className="text-white text-lg font-bold">Faculty Information Not Available</p>
                        <p className="text-white/70 mt-2">Faculty information is currently being updated. Please check back soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default FacultyPage;
