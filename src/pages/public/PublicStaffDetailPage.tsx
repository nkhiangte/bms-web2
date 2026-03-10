import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, Grade, GradeDefinition, User } from '@/types';
import { BackIcon, HomeIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import PhotoWithFallback from '@/components/PhotoWithFallback';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

interface PublicStaffDetailPageProps {
    staff: Staff[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

const normalize = (val?: string | null) => (val ?? '').toString().trim().toLowerCase();

const DetailItem: React.FC<{ label: string; value?: string|number|null; children?: React.ReactNode }> = ({ label, value, children }) => {
    if (!value && !children) return null;
    return (
        <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg">
            <dt className="text-sm font-semibold text-slate-400">{label}</dt>
            <dd className="mt-1 text-md font-bold text-white">{value || children}</dd>
        </div>
    );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-white border-b border-zinc-700 pb-2 mb-4">{title}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">{children}</dl>
    </div>
);

const PublicStaffDetailPage: React.FC<PublicStaffDetailPageProps> = ({ staff, gradeDefinitions }) => {
    const { staffId } = useParams() as { staffId: string };
    const navigate = useNavigate();

    const staffMember = staff.find(s => normalize(s.id) === normalize(staffId));

    const assignedClass = useMemo(() => {
        if (!staffMember) return null;
        const entry = Object.entries(gradeDefinitions).find(
            ([, def]: [string, GradeDefinition]) => normalize(def.classTeacherId) === normalize(staffMember.id)
        );
        return entry ? (entry[0] as Grade) : null;
    }, [staffMember, gradeDefinitions]);

    if (!staffMember) {
        return (
            <div className="bg-black py-16 min-h-screen">
                <div className="text-center container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-red-400">Staff Member Not Found</h2>
                    <p className="text-slate-400 mt-2">The requested staff profile does not exist.</p>
                    <button onClick={()=>navigate('/faculty')} className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition">
                        <BackIcon className="w-5 h-5" /> Return to Faculty
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                            <BackIcon className="w-5 h-5" /> Back to Faculty
                        </button>
                        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                            <HomeIcon className="w-5 h-5" /><span>Website Home</span>
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-start pb-6 mb-6 border-b border-zinc-700">
                        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg border-4 border-zinc-700 flex-shrink-0 mx-auto md:mx-0">
                            <PhotoWithFallback src={staffMember.photographUrl} alt={`${staffMember.firstName}'s photograph`} />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-4xl font-bold text-white">{staffMember.firstName} {staffMember.lastName}</h1>
                            <p className="text-sky-400 text-xl font-semibold mt-1">{staffMember.designation}</p>
                        </div>
                    </div>
                    <div>
                        <DetailSection title="Professional Details">
                            <DetailItem label="Department" value={staffMember.department} />
                            <DetailItem label="Years of Experience" value={`${staffMember.yearsOfExperience} years`} />
                            <DetailItem label="Date of Joining" value={formatDateForDisplay(staffMember.dateOfJoining)} />
                        </DetailSection>
                        <DetailSection title="Academic Role">
                            {assignedClass && <DetailItem label="Class Teacher Of" value={assignedClass} />}
                        </DetailSection>
                        <DetailSection title="Qualifications">
                            <DetailItem label="Highest Qualification" value={staffMember.educationalQualification} />
                            <DetailItem label="Specialization" value={staffMember.specialization} />
                        </DetailSection>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PublicStaffDetailPage;
