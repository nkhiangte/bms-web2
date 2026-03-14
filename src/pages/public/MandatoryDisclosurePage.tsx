import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '@/types';
import { BackIcon, HomeIcon, EditIcon } from '@/components/Icons';
import { DisclosureData, DISCLOSURE_SECTIONS } from './MandatoryDisclosureData';

const { Link } = ReactRouterDOM as any;

interface MandatoryDisclosurePageProps {
    user: User;
    data: DisclosureData;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-3 mb-4">
        <h2 className="bg-red-800 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded">
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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download
        </a>
    ) : (
        <span className="text-xs text-slate-400 italic">Not uploaded</span>
    );

// ─── Main Page ────────────────────────────────────────────────────────────────

const MandatoryDisclosurePage: React.FC<MandatoryDisclosurePageProps> = ({ user, data }) => {
    const isAdmin = user.role === 'admin';

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">

            {/* ── Top Nav ── */}
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"
                >
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link
                            to="/portal/admin/disclosure"
                            className="flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <EditIcon className="w-4 h-4" /> Edit Disclosure
                        </Link>
                    )}
                    <Link
                        to="/portal/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                        title="Go to Home"
                    >
                        <HomeIcon className="w-5 h-5" /> Home
                    </Link>
                </div>
            </div>

            {/* ── School Header ── */}
            <div className="text-center border-b-2 border-red-800 pb-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-red-800 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                    BMS
                </div>
                <h1 className="text-2xl font-bold text-red-900">{data.general.schoolName}</h1>
                <p className="text-sm text-slate-500 uppercase tracking-wider mt-1">
                    Affiliated to Mizoram Board of School Education (MBSE)
                </p>
                <p className="text-sm text-slate-500 mt-1">{data.general.address}, {data.general.pinCode}</p>
                <span className="inline-block mt-2 bg-amber-50 text-amber-700 border border-amber-300 text-xs font-semibold px-3 py-1 rounded-full">
                    MBSE Affiliated
                </span>
            </div>

            <h2 className="text-center text-base font-bold text-slate-700 uppercase tracking-widest border-y border-slate-200 py-3 mb-8">
                Mandatory Public Disclosure
            </h2>

            {/* ── A: General Information ── */}
            <div className="mb-10">
                <SectionHeader label="A. General Information" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {[
                                ['Name of the School', data.general.schoolName],
                                ['Affiliation / Recognition No.', data.general.affiliationNo],
                                ['School Code (MBSE)', data.general.schoolCode],
                                ['UDISE Code', data.general.udiseCode],
                                ['Complete Address', data.general.address],
                                ['Village / Town', data.general.town],
                                ['District', data.general.district],
                                ['State', data.general.state],
                                ['PIN Code', data.general.pinCode],
                                ['Principal / Head Teacher Name', data.general.principalName],
                                ['Principal Qualification', data.general.principalQualification],
                                ['School Email ID', data.general.email],
                                ['Website', data.general.website],
                                ['Contact Number', data.general.contactNumber],
                                ['Year of Establishment', data.general.yearEstablished],
                                ['Type of School', data.general.schoolType],
                                ['Classes Offered', data.general.classesOffered],
                                ['Medium of Instruction', data.general.medium],
                                ['Boarding / Day School', data.general.boardingType],
                                ['Management Type', data.general.managementType],
                                ['Minority Institution', data.general.minorityStatus],
                                ['Academic Session Starts', data.general.sessionStart],
                            ].map(([key, val]) => (
                                <tr key={key} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
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
            </div>

            {/* ── B: Documents ── */}
            <div className="mb-10">
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
                            {data.documents.map((doc, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                                    <td className="px-4 py-3 text-slate-700">{doc.label}</td>
                                    <td className="px-4 py-3"><DownloadLink href={doc.fileUrl} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 px-4 py-3 text-xs text-amber-800 leading-relaxed rounded-r">
                    <strong>Note:</strong> The school needs to upload self-attested copies of the above documents signed by the Chairman / Manager / Secretary and Principal. Documents found to be non-genuine shall attract action as per applicable norms.
                </div>
            </div>

            {/* ── C: Results & Academics ── */}
            <div className="mb-10">
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
                            {data.academics.map((item, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.label}</td>
                                    <td className="px-4 py-3"><DownloadLink href={item.fileUrl} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── D: Teaching Staff ── */}
            <div className="mb-10">
                <SectionHeader label="D. Staff (Teaching)" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {[
                                ['Principal', data.teachingStaff.principal],
                                ['Total No. of Teachers', data.teachingStaff.totalTeachers],
                                ['Trained Graduate Teachers (TGT)', data.teachingStaff.tgt],
                                ['Primary / Junior Teachers (PRT)', data.teachingStaff.prt],
                                ['Teacher–Student Ratio', data.teachingStaff.teacherStudentRatio],
                                ['Details of Special Educator', data.teachingStaff.specialEducator],
                                ['Counsellor / Wellness Teacher', data.teachingStaff.counsellor],
                            ].map(([key, val]) => (
                                <tr key={key} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="w-2/5 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">{key}</td>
                                    <td className="px-4 py-2.5 text-slate-800">{val || <span className="text-slate-300 italic">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── E: Non-Teaching Staff ── */}
            <div className="mb-10">
                <SectionHeader label="E. Staff (Non-Teaching)" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {[
                                ['Administrative / Office Staff', data.nonTeachingStaff.adminStaff],
                                ['Hostel Wardens (Male)', data.nonTeachingStaff.wardenMale],
                                ['Hostel Wardens (Female)', data.nonTeachingStaff.wardenFemale],
                                ['Peon / Support Staff', data.nonTeachingStaff.supportStaff],
                                ['Watchman / Security', data.nonTeachingStaff.security],
                            ].map(([key, val]) => (
                                <tr key={key} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="w-2/5 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">{key}</td>
                                    <td className="px-4 py-2.5 text-slate-800">{val || <span className="text-slate-300 italic">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── F: Infrastructure ── */}
            <div className="mb-10">
                <SectionHeader label="F. School Infrastructure" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {[
                                ['Total Campus Area (sq. mtr / acres)', data.infrastructure.campusArea],
                                ['No. and Size of Classrooms (sq. mtr)', data.infrastructure.classrooms],
                                ['No. and Size of Laboratories incl. Computer Lab', data.infrastructure.labs],
                                ['Library — No. of Books', data.infrastructure.libraryBooks],
                                ['Internet Facility', data.infrastructure.internet],
                                ['Sports / Playground Facility', data.infrastructure.sports],
                                ['Hostel Facility (Boys)', data.infrastructure.hostelBoys],
                                ['Hostel Facility (Girls)', data.infrastructure.hostelGirls],
                                ['No. of Girls\' Toilets', data.infrastructure.girlsToilets],
                                ['No. of Boys\' Toilets', data.infrastructure.boysToilets],
                                ['Drinking Water Facility', data.infrastructure.drinkingWater],
                                ['Electricity Connection', data.infrastructure.electricity],
                                ['Ramp / Accessibility for Differently Abled', data.infrastructure.ramp],
                                ['CCTV Cameras', data.infrastructure.cctv],
                                ['Type of Building', data.infrastructure.buildingType],
                            ].map(([key, val]) => (
                                <tr key={key} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="w-2/5 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">{key}</td>
                                    <td className="px-4 py-2.5 text-slate-800">{val || <span className="text-slate-300 italic">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── G: Enrolment ── */}
            <div className="mb-10">
                <SectionHeader label="G. Student Enrolment" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Sl.</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Class</th>
                                <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">Boys</th>
                                <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">Girls</th>
                                <th className="w-20 px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.enrolment.rows.map((row, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{row.className}</td>
                                    <td className="px-4 py-2.5 text-center text-slate-700">{row.boys || '—'}</td>
                                    <td className="px-4 py-2.5 text-center text-slate-700">{row.girls || '—'}</td>
                                    <td className="px-4 py-2.5 text-center font-medium text-slate-800">{row.total || '—'}</td>
                                </tr>
                            ))}
                            <tr className="bg-red-50 border-t-2 border-red-200">
                                <td colSpan={4} className="px-4 py-2.5 text-right font-bold text-red-800 text-sm">Grand Total</td>
                                <td className="px-4 py-2.5 text-center font-bold text-red-800">{data.enrolment.grandTotal || '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── H: Board Results ── */}
            <div className="mb-10">
                <SectionHeader label="H. HSLC Board Examination Results (Last 3 Years)" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {['Sl.', 'Year', 'Appeared', 'Passed', 'Pass %', 'Distinction / Merit'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.boardResults.map((r, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                                    <td className="px-4 py-2.5 text-slate-700 font-medium">{r.year}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{r.appeared || '—'}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{r.passed || '—'}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{r.passPercent || '—'}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{r.distinction || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── I: Fee Structure ── */}
            <div className="mb-10">
                <SectionHeader label="I. Fee Structure (Academic Year 2026–27)" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-10 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Sl.</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Fee Head</th>
                                <th className="w-40 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Amount (₹)</th>
                                <th className="w-40 px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.feeStructure.map((fee, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{fee.head}</td>
                                    <td className="px-4 py-2.5 text-slate-800 font-medium">{fee.amount || '—'}</td>
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">{fee.remarks || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 px-4 py-3 text-xs text-amber-800 leading-relaxed rounded-r">
                    <strong>Note:</strong> Fee once paid is non-refundable. The school does not collect any capitation fee or donation. For detailed fee information, please contact the school office.
                </div>
            </div>

            {/* ── J: Committees ── */}
            <div className="mb-10">
                <SectionHeader label="J. Statutory Committees" />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {data.committees.map((c, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                                    <td className="w-2/5 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">{c.name}</td>
                                    <td className="px-4 py-2.5 text-slate-700">
                                        {c.fileUrl
                                            ? <DownloadLink href={c.fileUrl} />
                                            : <span className="text-slate-500">{c.details || <span className="italic text-slate-300">—</span>}</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Declaration ── */}
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
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
            </div>

            {/* ── Footer ── */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                Last updated: {data.lastUpdated} &nbsp;·&nbsp; <a href="https://www.bms04.com" className="text-red-700 hover:underline">www.bms04.com</a> &nbsp;·&nbsp; Bethel Mission School, Champhai, Mizoram &nbsp;·&nbsp; Affiliated to MBSE
            </div>
        </div>
    );
};

export default MandatoryDisclosurePage;
