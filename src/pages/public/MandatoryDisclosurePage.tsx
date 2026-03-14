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
        <h2 className="bg-red-800 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded whitespace-nowrap">
            {label}
        </h2>
        <div className="flex-1 h-px bg-slate-200" />
    </div>
);

const DownloadLink: React.FC<{ href?: string }> = ({ href }) =>
    href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-800 border border-red-300 bg-red-50 hover:bg-red-100 rounded px-3 py-1.5 transition-colors"
        >
            <DownloadIcon /> Download
        </a>
    ) : (
        <span className="text-xs text-slate-400 italic">Not uploaded</span>
    );

const KVTable: React.FC<{ rows: [string, string | undefined][] }> = ({ rows }) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
            <tbody>
                {rows.map(([key, val]) => (
                    <tr key={key} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                        <td className="w-2/5 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                            {key}
                        </td>
                        <td className="px-4 py-2.5 text-slate-800">
                            {val || <span className="text-slate-300 italic">—</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MandatoryDisclosurePage: React.FC<MandatoryDisclosurePageProps> = ({ user }) => {
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
            <div className="flex justify-center items-center py-32">
                <div className="w-8 h-8 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Deep-merge fetched data with defaults so no field is ever undefined
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
        <div className="relative py-16">
            <div className="absolute inset-0 bg-slate-100" />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">

                    {/* School Header */}
                    <div className="text-center border-b-2 border-red-800 pb-6 mb-8">
                        <div className="w-16 h-16 rounded-full bg-red-800 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                            BMS
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                            {d.general.schoolName}
                        </h1>
                        <p className="text-sm text-slate-500 uppercase tracking-wider mt-1">
                            Affiliated to Mizoram Board of School Education (MBSE)
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {d.general.address}{d.general.pinCode ? `, ${d.general.pinCode}` : ''}
                        </p>
                        <span className="inline-block mt-2 bg-amber-50 text-amber-700 border border-amber-300 text-xs font-semibold px-3 py-1 rounded-full">
                            MBSE Affiliated
                        </span>
                    </div>

                    <h2 className="text-center text-base font-bold text-slate-700 uppercase tracking-widest border-y border-slate-200 py-3 mb-8">
                        Mandatory Public Disclosure
                    </h2>

                    <div className="space-y-10 text-slate-700">

                        {/* A */}
                        <section>
                            <SectionHeader label="A. General Information" />
                            <KVTable rows={[
                                ['Name of the School',                d.general.schoolName],
                                ['Affiliation / Recognition No.',      d.general.affiliationNo],
                                ['School Code (MBSE)',                 d.general.schoolCode],
                                ['UDISE Code',                         d.general.udiseCode],
                                ['Complete Address',                   d.general.address],
                                ['Village / Town',                     d.general.town],
                                ['District',                           d.general.district],
                                ['State',                              d.general.state],
                                ['PIN Code',                           d.general.pinCode],
                                ['Principal / Head Teacher Name',      d.general.principalName],
                                ['Principal Qualification',            d.general.principalQualification],
                                ['School Email ID',                    d.general.email],
                                ['Website',                            d.general.website],
                                ['Contact Number',                     d.general.contactNumber],
                                ['Year of Establishment',              d.general.yearEstablished],
                                ['Type of School',                     d.general.schoolType],
                                ['Classes Offered',                    d.general.classesOffered],
                                ['Medium of Instruction',              d.general.medium],
                                ['Boarding / Day School',              d.general.boardingType],
                                ['Management Type',                    d.general.managementType],
                                ['Minority Institution',               d.general.minorityStatus],
                                ['Academic Session Starts',            d.general.sessionStart],
                            ]} />
                        </section>

                        {/* B */}
                        <section>
                            <SectionHeader label="B. Documents and Information" />
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Document</th>
                                            <th className="w-36 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.documents.map((doc, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                                                <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                                                <td className="px-4 py-3 text-slate-700">{doc.label}</td>
                                                <td className="px-4 py-3"><DownloadLink href={doc.fileUrl} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 px-4 py-3 text-xs text-amber-800 leading-relaxed rounded-r">
                                <strong>Note:</strong> The school has uploaded self-attested copies of the above documents signed by the Chairman / Manager / Secretary and Principal.
                            </div>
                        </section>

                        {/* C */}
                        <section>
                            <SectionHeader label="C. Results and Academics" />
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Particulars</th>
                                            <th className="w-36 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.academics.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                                                <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                                                <td className="px-4 py-3 text-slate-700">{item.label}</td>
                                                <td className="px-4 py-3"><DownloadLink href={item.fileUrl} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* D */}
                        <section>
                            <SectionHeader label="D. Staff (Teaching)" />
                            <KVTable rows={[
                                ['Principal',                          d.teachingStaff.principal],
                                ['Total No. of Teachers',              d.teachingStaff.totalTeachers],
                                ['Trained Graduate Teachers (TGT)',    d.teachingStaff.tgt],
                                ['Primary / Junior Teachers (PRT)',    d.teachingStaff.prt],
                                ['Teacher–Student Ratio',              d.teachingStaff.teacherStudentRatio],
                                ['Details of Special Educator',        d.teachingStaff.specialEducator],
                                ['Counsellor / Wellness Teacher',      d.teachingStaff.counsellor],
                            ]} />
                        </section>

                        {/* E */}
                        <section>
                            <SectionHeader label="E. Staff (Non-Teaching)" />
                            <KVTable rows={[
                                ['Administrative / Office Staff',      d.nonTeachingStaff.adminStaff],
                                ['Hostel Wardens (Male)',               d.nonTeachingStaff.wardenMale],
                                ['Hostel Wardens (Female)',             d.nonTeachingStaff.wardenFemale],
                                ['Peon / Support Staff',               d.nonTeachingStaff.supportStaff],
                                ['Watchman / Security',                d.nonTeachingStaff.security],
                            ]} />
                        </section>

                        {/* F */}
                        <section>
                            <SectionHeader label="F. School Infrastructure" />
                            <KVTable rows={[
                                ['Total Campus Area (sq. mtr / acres)', d.infrastructure.campusArea],
                                ['No. and Size of Classrooms',          d.infrastructure.classrooms],
                                ['No. and Size of Labs incl. Computer', d.infrastructure.labs],
                                ['Library — No. of Books',              d.infrastructure.libraryBooks],
                                ['Internet Facility',                   d.infrastructure.internet],
                                ['Sports / Playground Facility',        d.infrastructure.sports],
                                ['Hostel Facility (Boys)',               d.infrastructure.hostelBoys],
                                ['Hostel Facility (Girls)',              d.infrastructure.hostelGirls],
                                ["No. of Girls' Toilets",               d.infrastructure.girlsToilets],
                                ["No. of Boys' Toilets",                d.infrastructure.boysToilets],
                                ['Drinking Water Facility',             d.infrastructure.drinkingWater],
                                ['Electricity Connection',              d.infrastructure.electricity],
                                ['Ramp / Differently Abled Access',     d.infrastructure.ramp],
                                ['CCTV Cameras',                        d.infrastructure.cctv],
                                ['Type of Building',                    d.infrastructure.buildingType],
                            ]} />
                        </section>

                        {/* G */}
                        <section>
                            <SectionHeader label="G. Student Enrolment" />
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Class</th>
                                            <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Boys</th>
                                            <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Girls</th>
                                            <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.enrolment.rows.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                                                <td className="px-4 py-2.5 text-slate-700">{row.className}</td>
                                                <td className="px-4 py-2.5 text-center text-slate-700">{row.boys || '—'}</td>
                                                <td className="px-4 py-2.5 text-center text-slate-700">{row.girls || '—'}</td>
                                                <td className="px-4 py-2.5 text-center font-medium text-slate-800">{row.total || '—'}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-red-50 border-t-2 border-red-200">
                                            <td colSpan={4} className="px-4 py-2.5 text-right font-bold text-red-800 text-sm">Grand Total</td>
                                            <td className="px-4 py-2.5 text-center font-bold text-red-800">{d.enrolment.grandTotal || '—'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* H */}
                        <section>
                            <SectionHeader label="H. HSLC Board Examination Results (Last 3 Years)" />
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            {['Sl.', 'Year', 'Appeared', 'Passed', 'Pass %', 'Distinction / Merit'].map(h => (
                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.boardResults.map((r, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                                                <td className="px-4 py-2.5 font-medium text-slate-700">{r.year}</td>
                                                <td className="px-4 py-2.5 text-slate-700">{r.appeared || '—'}</td>
                                                <td className="px-4 py-2.5 text-slate-700">{r.passed || '—'}</td>
                                                <td className="px-4 py-2.5 text-slate-700">{r.passPercent || '—'}</td>
                                                <td className="px-4 py-2.5 text-slate-700">{r.distinction || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* I */}
                        <section>
                            <SectionHeader label="I. Fee Structure (Academic Year 2026–27)" />
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Sl.</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Fee Head</th>
                                            <th className="w-40 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Amount (₹)</th>
                                            <th className="w-40 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.feeStructure.map((fee, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                                                <td className="px-4 py-2.5 text-slate-700">{fee.head}</td>
                                                <td className="px-4 py-2.5 font-medium text-slate-800">{fee.amount || '—'}</td>
                                                <td className="px-4 py-2.5 text-slate-500 text-xs">{fee.remarks || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 px-4 py-3 text-xs text-amber-800 leading-relaxed rounded-r">
                                <strong>Note:</strong> Fee once paid is non-refundable. The school does not collect any capitation fee or donation.
                            </div>
                        </section>

                        {/* J */}
                        <section>
                            <SectionHeader label="J. Statutory Committees" />
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <tbody>
                                        {d.committees.map((c, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-red-50/20 transition-colors">
                                                <td className="w-2/5 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                                                    {c.name}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {c.fileUrl
                                                        ? <DownloadLink href={c.fileUrl} />
                                                        : <span className="text-slate-700 text-sm">{c.details || <span className="text-slate-300 italic">—</span>}</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Declaration */}
                        <section className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-3">Declaration</h3>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                I hereby declare that the information given above and in the enclosed documents is true and correct to the best of my knowledge and belief. I understand that in case any information is found to be false or incorrect, the school shall be liable for action as per the rules and regulations of the Mizoram Board of School Education and the Government of Mizoram.
                            </p>
                            <div className="mt-6 grid grid-cols-3 gap-6">
                                {["Principal's Signature & Date", "Chairman / Manager's Signature", "School Seal"].map(label => (
                                    <div key={label}>
                                        <div className="border-t border-red-300 pt-2 text-xs text-slate-500">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-6 mt-8">
                        Last updated: {d.lastUpdated} &nbsp;·&nbsp;
                        <a href="https://www.bms04.com" className="text-red-700 hover:underline">www.bms04.com</a>
                        &nbsp;·&nbsp; Bethel Mission School, Champhai, Mizoram
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MandatoryDisclosurePage;
