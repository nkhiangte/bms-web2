import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, Grade, GradeDefinition } from '@/types';
import { BackIcon, HomeIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';
import PhotoWithFallback from '@/components/PhotoWithFallback';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

interface PublicStaffDetailPageProps {
    staff: Staff[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

const normalize = (val?: string | null) => (val ?? '').toString().trim().toLowerCase();

const DetailItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => {
    if (!value && !children) return null;
    return (
        <div className="bg-[#07162B] border border-white/15 p-3.5 rounded-lg">
            <dt className="text-xs font-bold uppercase tracking-wider text-[#DFC06B]">{label}</dt>
            <dd className="mt-1 text-base font-bold text-white">{value || children}</dd>
        </div>
    );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-white border-b border-[#C9A84C]/35 pb-2 mb-4">{title}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</dl>
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
            <div className="bg-[#0B1F3A] py-16 min-h-screen">
                <div className="text-center container mx-auto px-4">
                    <h2 className="text-2xl font-extrabold text-[#DFC06B]">Staff Member Not Found</h2>
                    <p className="text-white/75 mt-2">The requested staff profile does not exist.</p>
                    <button onClick={() => navigate('/faculty')} className="mt-6 inline-flex items-center mx-auto justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#C9A84C] text-[#0B1F3A] font-bold rounded-lg hover:bg-[#DFC06B] transition">
                        <BackIcon className="w-5 h-5" /> Return to Faculty
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0B1F3A] py-12 sm:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-[#132D52] border border-[#C9A84C]/35 rounded-2xl shadow-2xl p-6 sm:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#DFC06B] hover:text-white transition-colors">
                            <BackIcon className="w-5 h-5" /> Back to Faculty
                        </button>
                        <Link to="/" className="flex items-center gap-2 min-h-[44px] text-sm font-semibold text-white/80 hover:text-white transition-colors">
                            <HomeIcon className="w-5 h-5" /><span>Website Home</span>
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start pb-6 mb-6 border-b border-white/15">
                        <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full shadow-lg border-4 border-[#C9A84C] flex-shrink-0 overflow-hidden bg-[#07162B]">
                            <PhotoWithFallback src={staffMember.photographUrl} alt={`${staffMember.firstName}'s photograph`} />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{staffMember.firstName} {staffMember.lastName}</h1>
                            <p className="text-[#DFC06B] text-xl font-semibold mt-1">{staffMember.designation}</p>
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
