import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { db } from '@/firebaseConfig';
import { DEFAULT_DISCLOSURE_DATA, DisclosureData } from '@/pages/MandatoryDisclosureData';

interface MandatoryDisclosurePageProps {
    user: User | null;
}

const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-3 mb-4">
        <h2 className="bg-[#0B1F3A] border-l-4 border-[#C9A84C] text-white text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-r whitespace-nowrap">
            {label}
        </h2>
        <div className="flex-1 h-px bg-[#0B1F3A]/15" />
    </div>
);

const DownloadLink: React.FC<{ href?: string }> = ({ href }) =>
    href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] border border-[#C9A84C] bg-[#FBF6E8] hover:bg-[#C9A84C] rounded px-3 py-1.5 transition-colors"
        >
            <DownloadIcon /> Download
        </a>
    ) : (
        <span className="text-xs text-[#0B1F3A]/45 italic">Not uploaded</span>
    );

const KVTable: React.FC<{ rows: [string, string | undefined][] }> = ({ rows }) => (
    <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
            <tbody>
                {rows.map(([key, val]) => (
                    <tr key={key} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                        <td className="w-2/5 px-4 py-2.5 text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide bg-[#F4F7FB]">
                            {key}
                        </td>
                        <td className="px-4 py-2.5 text-[#0B1F3A] font-medium">
                            {val || <span className="text-[#0B1F3A]/35 italic">&mdash;</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MandatoryDisclosurePage: React.FC<MandatoryDisclosurePageProps> = () => {
    const [data, setData] = useState<DisclosureData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        db.collection('settings').doc('disclosure').get()
            .then(doc => {
                setData(doc.exists ? (doc.data() as DisclosureData) : DEFAULT_DISCLOSURE_DATA);
            })
            .catch(() => setData(DEFAULT_DISCLOSURE_DATA))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32 bg-[#F4F7FB]">
                <div className="w-8 h-8 border-2 border-[#0B1F3A] border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
        );
    }

    const d: DisclosureData = {
        ...DEFAULT_DISCLOSURE_DATA,
        ...data,
        lastUpdated: data?.lastUpdated ?? DEFAULT_DISCLOSURE_DATA.lastUpdated,
        general: { ...DEFAULT_DISCLOSURE_DATA.general, ...(data?.general ?? {}) },
        teachingStaff: { ...DEFAULT_DISCLOSURE_DATA.teachingStaff, ...(data?.teachingStaff ?? {}) },
        nonTeachingStaff: { ...DEFAULT_DISCLOSURE_DATA.nonTeachingStaff, ...(data?.nonTeachingStaff ?? {}) },
        infrastructure: { ...DEFAULT_DISCLOSURE_DATA.infrastructure, ...(data?.infrastructure ?? {}) },
        enrolment: {
            rows: data?.enrolment?.rows?.length ? data.enrolment.rows : DEFAULT_DISCLOSURE_DATA.enrolment.rows,
            grandTotal: data?.enrolment?.grandTotal ?? '',
        },
        documents: data?.documents?.length ? data.documents : DEFAULT_DISCLOSURE_DATA.documents,
        academics: data?.academics?.length ? data.academics : DEFAULT_DISCLOSURE_DATA.academics,
        boardResults: data?.boardResults?.length ? data.boardResults : DEFAULT_DISCLOSURE_DATA.boardResults,
        feeStructure: data?.feeStructure?.length ? data.feeStructure : DEFAULT_DISCLOSURE_DATA.feeStructure,
        committees: data?.committees?.length ? data.committees : DEFAULT_DISCLOSURE_DATA.committees,
    };

    return (
        <div className="relative py-12 sm:py-16 bg-[#F4F7FB]">
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white border-t-4 border-[#C9A84C] p-6 sm:p-10 md:p-12 rounded-2xl shadow-xl">

                    <div className="text-center border-b-2 border-[#0B1F3A] pb-6 mb-8">
                        <div className="w-16 h-16 rounded-full bg-[#0B1F3A] border-2 border-[#C9A84C] text-[#DFC06B] font-extrabold text-lg flex items-center justify-center mx-auto mb-3">
                            BMS
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                            {d.general.schoolName}
                        </h1>
                        <p className="text-sm text-[#0B1F3A]/70 uppercase tracking-wider mt-1 font-medium">
                            Affiliated to Mizoram Board of School Education (MBSE)
                        </p>
                        <p className="text-sm text-[#0B1F3A]/70 mt-1">
                            {d.general.address}{d.general.pinCode ? `, ${d.general.pinCode}` : ''}
                        </p>
                        <span className="inline-block mt-3 bg-[#FBF6E8] text-[#8E6D1B] border border-[#C9A84C] text-xs font-bold px-3 py-1 rounded-full">
                            MBSE Affiliated
                        </span>
                    </div>

                    <h2 className="text-center text-base font-extrabold text-[#0B1F3A] uppercase tracking-widest border-y border-[#0B1F3A]/15 py-3 mb-8">
                        Mandatory Public Disclosure
                    </h2>

                    <div className="space-y-10 text-[#0B1F3A]">

                        <section>
                            <SectionHeader label="A. General Information" />
                            <KVTable rows={[
                                ['Name of the School', d.general.schoolName],
                                ['Affiliation / Recognition No.', d.general.affiliationNo],
                                ['School Code (MBSE)', d.general.schoolCode],
                                ['UDISE Code', d.general.udiseCode],
                                ['Complete Address', d.general.address],
                                ['Village / Town', d.general.town],
                                ['District', d.general.district],
                                ['State', d.general.state],
                                ['PIN Code', d.general.pinCode],
                                ['Principal / Head Teacher Name', d.general.principalName],
                                ['Principal Qualification', d.general.principalQualification],
                                ['School Email ID', d.general.email],
                                ['Website', d.general.website],
                                ['Contact Number', d.general.contactNumber],
                                ['Year of Establishment', d.general.yearEstablished],
                                ['Type of School', d.general.schoolType],
                                ['Classes Offered', d.general.classesOffered],
                                ['Medium of Instruction', d.general.medium],
                                ['Boarding / Day School', d.general.boardingType],
                                ['Management Type', d.general.managementType],
                                ['Minority Institution', d.general.minorityStatus],
                                ['Academic Session Starts', d.general.sessionStart],
                            ]} />
                        </section>

                        <section>
                            <SectionHeader label="B. Documents and Information" />
                            <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide">Document</th>
                                            <th className="w-36 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.documents.map((doc, i) => (
                                            <tr key={i} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                                                <td className="px-4 py-3 text-[#0B1F3A]/65 text-xs font-tabular">{i + 1}</td>
                                                <td className="px-4 py-3 text-[#0B1F3A] font-medium">{doc.label}</td>
                                                <td className="px-4 py-3"><DownloadLink href={doc.fileUrl} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 bg-[#FBF6E8] border-l-4 border-[#C9A84C] px-4 py-3 text-xs text-[#0B1F3A] leading-relaxed rounded-r">
                                <strong>Note:</strong> The school has uploaded self-attested copies of the above documents signed by the Chairman / Manager / Secretary and Principal.
                            </div>
                        </section>

                        <section>
                            <SectionHeader label="C. Results and Academics" />
                            <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide">Particulars</th>
                                            <th className="w-36 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.academics.map((item, i) => (
                                            <tr key={i} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                                                <td className="px-4 py-3 text-[#0B1F3A]/65 text-xs font-tabular">{i + 1}</td>
                                                <td className="px-4 py-3 text-[#0B1F3A] font-medium">{item.label}</td>
                                                <td className="px-4 py-3"><DownloadLink href={item.fileUrl} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <SectionHeader label="D. Staff (Teaching)" />
                            <KVTable rows={[
                                ['Principal', d.teachingStaff.principal],
                                ['Total No. of Teachers', d.teachingStaff.totalTeachers],
                                ['Trained Graduate Teachers (TGT)', d.teachingStaff.tgt],
                                ['Primary / Junior Teachers (PRT)', d.teachingStaff.prt],
                                ['Teacher–Student Ratio', d.teachingStaff.teacherStudentRatio],
                                ['Details of Special Educator', d.teachingStaff.specialEducator],
                                ['Counsellor / Wellness Teacher', d.teachingStaff.counsellor],
                            ]} />
                        </section>

                        <section>
                            <SectionHeader label="E. Staff (Non-Teaching)" />
                            <KVTable rows={[
                                ['Administrative / Office Staff', d.nonTeachingStaff.adminStaff],
                                ['Hostel Wardens (Male)', d.nonTeachingStaff.wardenMale],
                                ['Hostel Wardens (Female)', d.nonTeachingStaff.wardenFemale],
                                ['Peon / Support Staff', d.nonTeachingStaff.supportStaff],
                                ['Watchman / Security', d.nonTeachingStaff.security],
                            ]} />
                        </section>

                        <section>
                            <SectionHeader label="F. School Infrastructure" />
                            <KVTable rows={[
                                ['Total Campus Area (sq. mtr / acres)', d.infrastructure.campusArea],
                                ['No. and Size of Classrooms', d.infrastructure.classrooms],
                                ['No. and Size of Labs incl. Computer', d.infrastructure.labs],
                                ['Library — No. of Books', d.infrastructure.libraryBooks],
                                ['Internet Facility', d.infrastructure.internet],
                                ['Sports / Playground Facility', d.infrastructure.sports],
                                ['Hostel Facility (Boys)', d.infrastructure.hostelBoys],
                                ['Hostel Facility (Girls)', d.infrastructure.hostelGirls],
                                ["No. of Girls' Toilets", d.infrastructure.girlsToilets],
                                ["No. of Boys' Toilets", d.infrastructure.boysToilets],
                                ['Drinking Water Facility', d.infrastructure.drinkingWater],
                                ['Electricity Connection', d.infrastructure.electricity],
                                ['Ramp / Differently Abled Access', d.infrastructure.ramp],
                                ['CCTV Cameras', d.infrastructure.cctv],
                                ['Type of Building', d.infrastructure.buildingType],
                            ]} />
                        </section>

                        <section>
                            <SectionHeader label="G. Student Enrolment" />
                            <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">Class</th>
                                            <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-[#0B1F3A]/75 uppercase">Boys</th>
                                            <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-[#0B1F3A]/75 uppercase">Girls</th>
                                            <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-[#0B1F3A]/75 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.enrolment.rows.map((row, i) => (
                                            <tr key={i} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                                                <td className="px-4 py-2.5 text-[#0B1F3A]/65 text-xs font-tabular">{i + 1}</td>
                                                <td className="px-4 py-2.5 text-[#0B1F3A]">{row.className}</td>
                                                <td className="px-4 py-2.5 text-center text-[#0B1F3A] font-tabular">{row.boys || '—'}</td>
                                                <td className="px-4 py-2.5 text-center text-[#0B1F3A] font-tabular">{row.girls || '—'}</td>
                                                <td className="px-4 py-2.5 text-center font-bold text-[#0B1F3A] font-tabular">{row.total || '—'}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-[#0B1F3A] border-t-2 border-[#C9A84C]">
                                            <td colSpan={4} className="px-4 py-2.5 text-right font-extrabold text-white text-sm">Grand Total</td>
                                            <td className="px-4 py-2.5 text-center font-extrabold text-[#DFC06B] font-tabular">{d.enrolment.grandTotal || '—'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <SectionHeader label="H. HSLC Board Examination Results (Last 3 Years)" />
                            <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                            {['Sl.', 'Year', 'Appeared', 'Passed', 'Pass %', 'Distinction / Merit'].map(h => (
                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.boardResults.map((r, i) => (
                                            <tr key={i} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                                                <td className="px-4 py-2.5 text-[#0B1F3A]/65 text-xs font-tabular">{i + 1}</td>
                                                <td className="px-4 py-2.5 font-bold text-[#0B1F3A] font-tabular">{r.year}</td>
                                                <td className="px-4 py-2.5 text-[#0B1F3A] font-tabular">{r.appeared || '—'}</td>
                                                <td className="px-4 py-2.5 text-[#0B1F3A] font-tabular">{r.passed || '—'}</td>
                                                <td className="px-4 py-2.5 text-[#8E6D1B] font-bold font-tabular">{r.passPercent || '—'}</td>
                                                <td className="px-4 py-2.5 text-[#0B1F3A]">{r.distinction || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <SectionHeader label="I. Fee Structure (Academic Year 2026–27)" />
                            <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">Fee Head</th>
                                            <th className="w-40 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">Amount (&#8377;)</th>
                                            <th className="w-40 px-4 py-2.5 text-left text-xs font-bold text-[#0B1F3A]/75 uppercase">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.feeStructure.map((fee, i) => (
                                            <tr key={i} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                                                <td className="px-4 py-2.5 text-[#0B1F3A]/65 text-xs font-tabular">{i + 1}</td>
                                                <td className="px-4 py-2.5 text-[#0B1F3A]">{fee.head}</td>
                                                <td className="px-4 py-2.5 font-bold text-[#0B1F3A] font-tabular">{fee.amount || '—'}</td>
                                                <td className="px-4 py-2.5 text-[#0B1F3A]/65 text-xs">{fee.remarks || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 bg-[#FBF6E8] border-l-4 border-[#C9A84C] px-4 py-3 text-xs text-[#0B1F3A] leading-relaxed rounded-r">
                                <strong>Note:</strong> Fee once paid is non-refundable. The school does not collect any capitation fee or donation.
                            </div>
                        </section>

                        <section>
                            <SectionHeader label="J. Statutory Committees" />
                            <div className="border border-[#0B1F3A]/15 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <tbody>
                                        {d.committees.map((c, i) => (
                                            <tr key={i} className="border-b border-[#0B1F3A]/10 last:border-0 hover:bg-[#FBF6E8]/50 transition-colors">
                                                <td className="w-2/5 px-4 py-2.5 text-xs font-bold text-[#0B1F3A]/75 uppercase tracking-wide bg-[#F4F7FB]">
                                                    {c.name}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {c.fileUrl
                                                        ? <DownloadLink href={c.fileUrl} />
                                                        : <span className="text-[#0B1F3A] text-sm">{c.details || <span className="text-[#0B1F3A]/35 italic">&mdash;</span>}</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-[#FBF6E8] border border-[#C9A84C] rounded-xl p-6">
                            <h3 className="text-sm font-extrabold text-[#0B1F3A] uppercase tracking-wide mb-3">Declaration</h3>
                            <p className="text-sm text-[#0B1F3A]/85 leading-relaxed">
                                I hereby declare that the information given above and in the enclosed documents is true and correct to the best of my knowledge and belief. I understand that in case any information is found to be false or incorrect, the school shall be liable for action as per the rules and regulations of the Mizoram Board of School Education and the Government of Mizoram.
                            </p>
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {["Principal's Signature & Date", "Chairman / Manager's Signature", "School Seal"].map(label => (
                                    <div key={label}>
                                        <div className="border-t border-[#C9A84C] pt-2 text-xs text-[#0B1F3A]/70 font-semibold">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    <div className="text-center text-xs text-[#0B1F3A]/60 border-t border-[#0B1F3A]/15 pt-6 mt-8">
                        Last updated: {d.lastUpdated} &nbsp;&middot;&nbsp;
                        <a href="https://www.bms04.com" className="text-[#8E6D1B] font-bold hover:underline">www.bms04.com</a>
                        &nbsp;&middot;&nbsp; Bethel Mission School, Champhai, Mizoram
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MandatoryDisclosurePage;
