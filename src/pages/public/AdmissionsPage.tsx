import React, { useState, useEffect, FormEvent } from 'react';
import { Download, CheckCircle2, FileText, Phone, GraduationCap } from 'lucide-react';
import { db } from '@/firebaseConfig';
import { WhatsappIcon } from '@/components/Icons';
import { GRADES_LIST, DEFAULT_FEE_STRUCTURE, DEFAULT_ADMISSION_SETTINGS, FEE_SET_GRADES } from '@/constants';
import { User, FeeStructure, AdmissionSettings, FeeHead } from '@/types';

interface AdmissionsPageProps {
    user: User | null;
    feeStructure?: FeeStructure;
    admissionSettings?: AdmissionSettings;
}

const WHATSAPP_NUMBER = '919862148342';

const AdmissionsPage: React.FC<AdmissionsPageProps> = ({
    feeStructure = DEFAULT_FEE_STRUCTURE,
    admissionSettings = DEFAULT_ADMISSION_SETTINGS,
}) => {
    const [studentName, setStudentName] = useState('');
    const [applyingClass, setApplyingClass] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [formError, setFormError] = useState('');
    const [prospectusUrl, setProspectusUrl] = useState<string | null>(null);

    useEffect(() => {
        db.collection('website_content')
            .doc('about_documents')
            .get()
            .then(doc => {
                if (doc.exists && Array.isArray(doc.data()?.items)) {
                    const items = doc.data()!.items as Array<{ category?: string; title?: string; url?: string }>;
                    const found = items.find(
                        item =>
                            item.url &&
                            (item.category === 'School Prospectus' ||
                                (item.title || '').toLowerCase().includes('prospectus'))
                    );
                    if (found?.url) setProspectusUrl(found.url);
                }
            })
            .catch(() => {});
    }, []);

    const handleDownloadProspectus = () => {
        if (prospectusUrl) {
            const link = document.createElement('a');
            link.href = prospectusUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.download = 'BMS_Champhai_Prospectus_2027.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const prospectusHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Bethel Mission School, Champhai - Admission Prospectus</title>
<style>
  body { font-family: Arial, sans-serif; color: #0B1F3A; max-width: 780px; margin: 32px auto; padding: 24px; line-height: 1.6; }
  .header { background: #0B1F3A; color: #FFFFFF; padding: 24px; border-bottom: 4px solid #C9A84C; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; }
  .motto { color: #DFC06B; font-style: italic; margin: 6px 0 0; }
  h2 { color: #0B1F3A; border-bottom: 2px solid #C9A84C; padding-bottom: 4px; margin-top: 24px; font-size: 18px; }
  ul { padding-left: 20px; }
  .box { background: #F4F7FB; border: 1px solid #C9A84C; padding: 14px; border-radius: 6px; margin-top: 12px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Bethel Mission School, Champhai</h1>
    <p>Nursery to Class X | English Medium | Est. 1996 | MBSE Affiliated</p>
    <p class="motto">"Service to God &amp; Men"</p>
  </div>
  <h2>Classes Offered</h2>
  <p>Nursery, Kindergarten, and Class I to Class X under the Mizoram Board of School Education (MBSE).</p>
  <h2>Documents Required</h2>
  <ul>
    <li>Birth Certificate (mandatory for Nursery &amp; Primary)</li>
    <li>Transfer Certificate &amp; Last Report Card (Class II onwards)</li>
    <li>Passport-Size Photographs (3 copies)</li>
    <li>Aadhaar Card Copy (Student &amp; Parent/Guardian)</li>
  </ul>
  <div class="box">
    <strong>Admissions Contact:</strong><br/>
    Bethel Veng, Champhai, Mizoram - 796321<br/>
    Phone / WhatsApp: +91 9862148342 | Email: bms@bms04.com
  </div>
</body>
</html>`;
        const blob = new Blob([prospectusHtml], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'BMS_Champhai_Prospectus_2027.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    };

    const handleWhatsAppSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!studentName.trim()) {
            setFormError('Please enter the student name.');
            return;
        }
        if (!applyingClass) {
            setFormError('Please select the class applying for.');
            return;
        }
        if (!parentPhone.trim()) {
            setFormError('Please enter parent phone number.');
            return;
        }

        const formattedClass = applyingClass.startsWith('Class ') ? applyingClass : `Class ${applyingClass}`;
        const message = [
            `Hello, I want admission for ${formattedClass} at Bethel Mission School`,
            `Student Name: ${studentName.trim()}`,
            `Parent Phone: ${parentPhone.trim()}`,
        ].join('\n');

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tuitionGroups = [
        { label: 'Pre-Primary & Primary', grades: FEE_SET_GRADES.set1, heads: feeStructure?.set1?.heads || DEFAULT_FEE_STRUCTURE.set1.heads },
        { label: 'Upper Primary & Middle', grades: FEE_SET_GRADES.set2, heads: feeStructure?.set2?.heads || DEFAULT_FEE_STRUCTURE.set2.heads },
        { label: 'High School', grades: FEE_SET_GRADES.set3, heads: feeStructure?.set3?.heads || DEFAULT_FEE_STRUCTURE.set3.heads },
    ];

    const newOneTime: FeeHead[] = admissionSettings?.feeStructure?.newStudent?.oneTime || DEFAULT_ADMISSION_SETTINGS.feeStructure.newStudent.oneTime;
    const newAnnual: FeeHead[] = admissionSettings?.feeStructure?.newStudent?.annual || DEFAULT_ADMISSION_SETTINGS.feeStructure.newStudent.annual;
    const existingOneTime: FeeHead[] = admissionSettings?.feeStructure?.existingStudent?.oneTime || DEFAULT_ADMISSION_SETTINGS.feeStructure.existingStudent.oneTime;
    const existingAnnual: FeeHead[] = admissionSettings?.feeStructure?.existingStudent?.annual || DEFAULT_ADMISSION_SETTINGS.feeStructure.existingStudent.annual;

    const newAdmissionTotal = [...newOneTime, ...newAnnual].reduce((s, h) => s + h.amount, 0);
    const existingAdmissionTotal = [...existingOneTime, ...existingAnnual].reduce((s, h) => s + h.amount, 0);

    const documentsRequired = [
        {
            title: 'Birth Certificate',
            detail: 'Original or attested copy (mandatory for Nursery, Kindergarten & new admissions).',
        },
        {
            title: 'Transfer Certificate (TC) & Report Card',
            detail: 'Previous school TC and latest progress report (for Class II admissions onwards).',
        },
        {
            title: 'Passport-Size Photographs',
            detail: '3 recent color passport-size photographs of the student.',
        },
        {
            title: 'Aadhaar Card Copy',
            detail: 'Copy of Aadhaar card of the student and parent / guardian.',
        },
    ];

    return (
        <div className="bg-white text-[#0B1F3A]">
            {/* ── HEADER BANNER + PROSPECTUS BUTTON ── */}
            <section className="bg-[#0B1F3A] text-white py-12 sm:py-16 border-b-2 border-[#C9A84C]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#DFC06B] mb-2">
                        Session {admissionSettings?.academicYearLabel || '2026-27'} &middot; Nursery to Class X
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                        Admissions
                    </h1>
                    <div className="w-20 h-1 bg-[#C9A84C] mx-auto my-4 rounded-full" />
                    <p className="text-sm sm:text-lg text-white/85 max-w-2xl mx-auto">
                        Simple admission process for families across Champhai and Mizoram. Review fee details, keep documents ready, and apply directly on WhatsApp.
                    </p>

                    <div className="mt-7 flex justify-center">
                        <button
                            type="button"
                            onClick={handleDownloadProspectus}
                            className="w-full sm:w-auto max-w-xs inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold rounded-lg transition-colors shadow-lg text-sm sm:text-base cursor-pointer"
                        >
                            <Download className="w-4 h-4 flex-shrink-0" />
                            <span>Download Prospectus</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── SIMPLE 3-FIELD WHATSAPP ADMISSION FORM ── */}
            <section className="py-12 sm:py-16 bg-[#F4F7FB] border-b border-[#0B1F3A]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-8 shadow-sm">
                        <div className="text-center mb-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B]">
                                Quick Admission Inquiry
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1">
                                Apply via WhatsApp
                            </h2>
                            <p className="text-sm text-[#0B1F3A]/75 mt-1.5">
                                Enter 3 simple details below to send your admission request directly to our office.
                            </p>
                        </div>

                        <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="adm-student-name" className="block text-sm font-bold text-[#0B1F3A] mb-1.5">
                                    Student Name
                                </label>
                                <input
                                    id="adm-student-name"
                                    type="text"
                                    value={studentName}
                                    onChange={e => setStudentName(e.target.value)}
                                    placeholder="Enter student full name"
                                    required
                                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-lg bg-white border border-[#0B1F3A]/25 text-[#0B1F3A] text-sm focus:outline-none focus:border-[#0B1F3A]"
                                />
                            </div>

                            <div>
                                <label htmlFor="adm-class" className="block text-sm font-bold text-[#0B1F3A] mb-1.5">
                                    Class Applying For
                                </label>
                                <select
                                    id="adm-class"
                                    value={applyingClass}
                                    onChange={e => setApplyingClass(e.target.value)}
                                    required
                                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-lg bg-white border border-[#0B1F3A]/25 text-[#0B1F3A] text-sm focus:outline-none focus:border-[#0B1F3A]"
                                >
                                    <option value="">Select Class (Nursery &ndash; Class X)</option>
                                    {GRADES_LIST.map(grade => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="adm-parent-phone" className="block text-sm font-bold text-[#0B1F3A] mb-1.5">
                                    Parent Phone Number
                                </label>
                                <input
                                    id="adm-parent-phone"
                                    type="tel"
                                    value={parentPhone}
                                    onChange={e => setParentPhone(e.target.value)}
                                    placeholder="e.g. 9862148342"
                                    required
                                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-lg bg-white border border-[#0B1F3A]/25 text-[#0B1F3A] text-sm font-tabular focus:outline-none focus:border-[#0B1F3A]"
                                />
                            </div>

                            {formError && (
                                <p className="text-xs font-bold text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C] px-3 py-2 rounded-lg">
                                    {formError}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full min-h-[50px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-base transition-colors shadow-sm cursor-pointer"
                            >
                                <WhatsappIcon className="w-5 h-5 flex-shrink-0" />
                                <span>Apply on WhatsApp</span>
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ── FEE STRUCTURE TABLE ── */}
            <section className="py-14 sm:py-18 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Transparent Fees
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                            Fee Structure Table
                        </h2>
                        <div className="gold-rule mt-3" />
                    </div>

                    {/* Table 1: Monthly Tuition & Exam Fees by Class */}
                    <div className="rounded-xl border border-[#0B1F3A]/15 overflow-hidden shadow-sm mb-8">
                        <div className="bg-[#0B1F3A] text-white px-5 py-3.5 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-[#DFC06B]" />
                            <h3 className="font-bold text-base">Monthly Tuition &amp; Term Examination Fees</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold text-[#0B1F3A]">Section</th>
                                        <th className="px-4 py-3 text-left font-bold text-[#0B1F3A]">Classes</th>
                                        <th className="px-4 py-3 text-right font-bold text-[#0B1F3A]">Tuition Fee (Monthly)</th>
                                        <th className="px-4 py-3 text-right font-bold text-[#0B1F3A]">Exam Fee (Per Term)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#0B1F3A]/10">
                                    {tuitionGroups.map(group => {
                                        const monthly = group.heads
                                            .filter(h => h.type === 'monthly')
                                            .reduce((s, h) => s + h.amount, 0);
                                        const term = group.heads
                                            .filter(h => h.type === 'term')
                                            .reduce((s, h) => s + h.amount, 0);
                                        return (
                                            <tr key={group.label} className="hover:bg-[#F4F7FB]/70">
                                                <td className="px-4 py-3.5 font-bold text-[#0B1F3A]">{group.label}</td>
                                                <td className="px-4 py-3.5 text-[#0B1F3A]/80">{group.grades.join(', ')}</td>
                                                <td className="px-4 py-3.5 text-right font-extrabold text-[#0B1F3A] font-tabular">
                                                    &#8377;{monthly.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-bold text-[#8E6D1B] font-tabular">
                                                    &#8377;{term.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 2: Admission & Session Charges (New vs Existing Student) */}
                    <div className="rounded-xl border border-[#0B1F3A]/15 overflow-hidden shadow-sm">
                        <div className="bg-[#0B1F3A] text-white px-5 py-3.5 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#DFC06B]" />
                            <h3 className="font-bold text-base">Session Admission Charges</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-[#F4F7FB] border-b border-[#0B1F3A]/15">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold text-[#0B1F3A]">Fee Component</th>
                                        <th className="px-4 py-3 text-left font-bold text-[#0B1F3A]">Frequency</th>
                                        <th className="px-4 py-3 text-right font-bold text-[#0B1F3A]">New Admission</th>
                                        <th className="px-4 py-3 text-right font-bold text-[#0B1F3A]">Existing Student</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#0B1F3A]/10">
                                    {newOneTime.map(head => {
                                        const matchExisting = existingOneTime.find(
                                            e => e.id === head.id || e.name.toLowerCase() === head.name.toLowerCase()
                                        );
                                        return (
                                            <tr key={`ot-${head.id}`} className="hover:bg-[#F4F7FB]/70">
                                                <td className="px-4 py-3 font-medium text-[#0B1F3A]">{head.name}</td>
                                                <td className="px-4 py-3 text-[#0B1F3A]/70 text-xs font-semibold">One-Time</td>
                                                <td className="px-4 py-3 text-right font-bold text-[#0B1F3A] font-tabular">
                                                    &#8377;{head.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-[#0B1F3A] font-tabular">
                                                    &#8377;{(matchExisting?.amount ?? 0).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {newAnnual.map(head => {
                                        const matchExisting = existingAnnual.find(
                                            e => e.id === head.id || e.name.toLowerCase() === head.name.toLowerCase()
                                        );
                                        return (
                                            <tr key={`an-${head.id}`} className="hover:bg-[#F4F7FB]/70">
                                                <td className="px-4 py-3 font-medium text-[#0B1F3A]">{head.name}</td>
                                                <td className="px-4 py-3 text-[#0B1F3A]/70 text-xs font-semibold">Annual</td>
                                                <td className="px-4 py-3 text-right font-bold text-[#0B1F3A] font-tabular">
                                                    &#8377;{head.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-[#0B1F3A] font-tabular">
                                                    &#8377;{(matchExisting?.amount ?? 0).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-[#FBF6E8] border-t-2 border-[#C9A84C]">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-3.5 font-extrabold text-[#0B1F3A]">
                                            Total Admission Cost (Excluding Textbooks &amp; Uniform)
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-extrabold text-[#0B1F3A] text-base font-tabular">
                                            &#8377;{newAdmissionTotal.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-extrabold text-[#8E6D1B] text-base font-tabular">
                                            &#8377;{existingAdmissionTotal.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DOCUMENTS REQUIRED LIST & PROSPECTUS CTA ── */}
            <section className="py-14 sm:py-18 bg-[#F4F7FB] border-t border-[#0B1F3A]/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Checklist for Parents
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                            Documents Required
                        </h2>
                        <div className="gold-rule mt-3" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documentsRequired.map(doc => (
                            <div
                                key={doc.title}
                                className="bg-white rounded-xl border border-[#0B1F3A]/15 p-5 shadow-sm flex items-start gap-3.5"
                            >
                                <CheckCircle2 className="w-6 h-6 text-[#8E6D1B] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-extrabold text-[#0B1F3A] text-base">{doc.title}</h3>
                                    <p className="text-sm text-[#0B1F3A]/75 mt-1 leading-relaxed">{doc.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Prospectus & Office Help Box */}
                    <div className="mt-10 bg-[#0B1F3A] text-white rounded-2xl border border-[#C9A84C] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-extrabold text-white">Need the School Prospectus or Help?</h3>
                            <p className="text-sm text-white/80 mt-1">
                                Download our Admission Prospectus or call our Champhai school office.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleDownloadProspectus}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-sm rounded-lg transition-colors cursor-pointer"
                            >
                                <Download className="w-4 h-4 flex-shrink-0" />
                                <span>Download Prospectus</span>
                            </button>
                            <a
                                href="tel:+919862148342"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 bg-white hover:bg-[#F4F7FB] text-[#0B1F3A] font-bold text-sm rounded-lg transition-colors font-tabular"
                            >
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>+91 9862148342</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdmissionsPage;
