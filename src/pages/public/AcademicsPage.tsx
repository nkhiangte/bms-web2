import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BookOpen, Award, Layers, ChevronRight, ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';
import { db } from '@/firebaseConfig';
import EditableContent from '@/components/EditableContent';
import { GRADES_LIST } from '@/constants';
import { User, Grade, GradeDefinition, Syllabus, SyllabusTopic, HSLCResultSummary } from '@/types';
import { normalizeSubjectName } from '@/utils';

const { Link } = ReactRouterDOM as any;

interface AcademicsPageProps {
    user: User | null;
    syllabus: Syllabus[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

const STATIC_HSLC_RESULTS = [
    { year: 2025, appeared: 41, passed: 38, passPercentage: '92.68%', distinction: 9, firstDivision: 15, secondDivision: 13, thirdDivision: 1 },
    { year: 2024, appeared: 37, passed: 36, passPercentage: '97.30%', distinction: 17, firstDivision: 18, secondDivision: 1, thirdDivision: 0 },
    { year: 2023, appeared: 46, passed: 43, passPercentage: '93.48%', distinction: 11, firstDivision: 14, secondDivision: 16, thirdDivision: 2 },
    { year: 2022, appeared: 42, passed: 42, passPercentage: '100%', distinction: 17, firstDivision: 18, secondDivision: 6, thirdDivision: 1 },
    { year: 2021, appeared: 34, passed: 34, passPercentage: '100%', distinction: 21, firstDivision: 13, secondDivision: 0, thirdDivision: 0 },
    { year: 2020, appeared: 38, passed: 37, passPercentage: '97.37%', distinction: 8, firstDivision: 17, secondDivision: 9, thirdDivision: 3 },
    { year: 2019, appeared: 30, passed: 30, passPercentage: '100%', distinction: 14, firstDivision: 11, secondDivision: 5, thirdDivision: 0 },
    { year: 2018, appeared: 33, passed: 33, passPercentage: '100%', distinction: 25, firstDivision: 7, secondDivision: 1, thirdDivision: 0 },
    { year: 2017, appeared: 45, passed: 44, passPercentage: '97.78%', distinction: 17, firstDivision: 22, secondDivision: 5, thirdDivision: 0 },
    { year: 2016, appeared: 21, passed: 21, passPercentage: '100%', distinction: 6, firstDivision: 13, secondDivision: 1, thirdDivision: 1 },
    { year: 2015, appeared: 28, passed: 28, passPercentage: '100%', distinction: 8, firstDivision: 16, secondDivision: 3, thirdDivision: 1 },
    { year: 2014, appeared: 30, passed: 30, passPercentage: '100%', distinction: 3, firstDivision: 15, secondDivision: 6, thirdDivision: 6 },
    { year: 2013, appeared: 20, passed: 20, passPercentage: '100%', distinction: 4, firstDivision: 9, secondDivision: 3, thirdDivision: 4 },
    { year: 2012, appeared: 11, passed: 11, passPercentage: '100%', distinction: 6, firstDivision: 3, secondDivision: 2, thirdDivision: 0 },
    { year: 2011, appeared: 11, passed: 11, passPercentage: '100%', distinction: 0, firstDivision: 4, secondDivision: 4, thirdDivision: 3 },
    { year: 2010, appeared: 10, passed: 10, passPercentage: '100%', distinction: 3, firstDivision: 5, secondDivision: 2, thirdDivision: 0 },
    { year: 2009, appeared: 14, passed: 14, passPercentage: '100%', distinction: 4, firstDivision: 7, secondDivision: 2, thirdDivision: 1 },
    { year: 2008, appeared: 6, passed: 6, passPercentage: '100%', distinction: 2, firstDivision: 3, secondDivision: 1, thirdDivision: 0 },
];

const TOP_RANKERS = [
    { name: 'Esther Tingbiakmuani', rank: '4th Rank', year: 2023, imgSrc: '/assets/school/esther.jpg' },
    { name: 'Manngaihsangi', rank: '10th Rank', year: 2020, imgSrc: '/assets/school/manngaih.jpg' },
    { name: 'C.L. Kimteii', rank: '10th Rank', year: 2019, imgSrc: '/assets/school/bms-logo-color.png' },
    { name: 'R. Lalrinmawii', rank: '10th Rank', year: 2019, imgSrc: '/assets/school/bms-logo-color.png' },
];

const ResultChart: React.FC<{ results: HSLCResultSummary[] }> = ({ results }) => {
    const reversedResults = [...results].reverse();
    return (
        <div className="rounded-xl p-6 sm:p-8 bg-[#132D52] border border-[#C9A84C]/35 shadow-sm">
            <h3 className="text-lg sm:text-xl font-extrabold text-center mb-5 text-white">
                HSLC Results Analysis (2008&ndash;{results[0]?.year || 'Present'})
            </h3>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-7 text-xs text-white/85">
                {[
                    ['bg-[#C9A84C]', 'Distinction'],
                    ['bg-white', 'I Division'],
                    ['bg-[#DFC06B]/70', 'II Division'],
                    ['bg-[#2C528A]', 'III Division'],
                    ['bg-[#8E6D1B]', 'Failed'],
                ].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded ${color}`} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-start items-end gap-2 md:gap-3 overflow-x-auto pb-4 px-1">
                {reversedResults.map(result => {
                    const failed = result.appeared - result.passed;
                    const segments = [
                        { h: (result.thirdDivision / result.appeared) * 100, color: 'bg-[#2C528A]' },
                        { h: (result.secondDivision / result.appeared) * 100, color: 'bg-[#DFC06B]/70' },
                        { h: (result.firstDivision / result.appeared) * 100, color: 'bg-white' },
                        { h: (result.distinction / result.appeared) * 100, color: 'bg-[#C9A84C]' },
                    ];
                    let offset = 0;
                    return (
                        <div key={result.year} className="flex flex-col items-center flex-shrink-0 text-center w-12 text-white">
                            <div className="font-tabular font-bold mb-1 text-[#DFC06B] text-[10px]">{result.passPercentage}</div>
                            <div className="w-full h-48 rounded-t-lg relative group bg-[#07162B] border border-white/15">
                                {segments.map((seg, i) => {
                                    const b = offset;
                                    offset += seg.h;
                                    return seg.h > 0 ? <div key={i} style={{ height: `${seg.h}%`, bottom: `${b}%` }} className={`absolute w-full ${seg.color}`} /> : null;
                                })}
                                {failed > 0 && <div style={{ height: `${(failed / result.appeared) * 100}%`, bottom: `${offset}%` }} className="absolute w-full bg-[#8E6D1B]" />}
                                <div className="absolute bottom-full mb-2 w-40 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2 z-10 shadow-2xl bg-[#07162B] border border-[#C9A84C] text-white/90">
                                    <div className="font-bold mb-1 text-white font-tabular">{result.year}</div>
                                    <div className="font-tabular">Appeared: {result.appeared}</div>
                                    <div className="font-tabular">Passed: {result.passed}</div>
                                    <hr className="my-1 border-white/15" />
                                    <div className="font-tabular text-[#DFC06B]">Dist: {result.distinction}</div>
                                    <div className="font-tabular text-white">I Div: {result.firstDivision}</div>
                                    <div className="font-tabular text-white/80">II Div: {result.secondDivision}</div>
                                    {failed > 0 && <div className="font-tabular text-[#C9A84C]">Failed: {failed}</div>}
                                </div>
                            </div>
                            <div className="mt-1.5 font-tabular font-bold text-white/80 text-[11px]">{result.year}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AcademicsPage: React.FC<AcademicsPageProps> = ({ user, syllabus, gradeDefinitions }) => {
    const [selectedGrade, setSelectedGrade] = useState<Grade>(Grade.X);
    const [hslcResults, setHslcResults] = useState<HSLCResultSummary[]>([]);

    useEffect(() => {
        const unsub = db.collection('hslc_results')
            .orderBy('year', 'desc')
            .onSnapshot(
                snap => {
                    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as HSLCResultSummary));
                    const merged = [...results];
                    STATIC_HSLC_RESULTS.forEach(sr => {
                        if (!merged.find(m => m.year === sr.year)) {
                            merged.push({ id: `static-${sr.year}`, ...sr } as HSLCResultSummary);
                        }
                    });
                    setHslcResults(merged.sort((a, b) => b.year - a.year));
                },
                () => {
                    setHslcResults(STATIC_HSLC_RESULTS.map(sr => ({ id: `static-${sr.year}`, ...sr } as HSLCResultSummary)));
                }
            );
        return () => unsub();
    }, []);

    const subjectsForSelectedGrade = useMemo(() => {
        return gradeDefinitions?.[selectedGrade]?.subjects || [];
    }, [selectedGrade, gradeDefinitions]);

    const syllabusSummaryForGrade = useMemo(() => {
        const gradeSyllabus = (syllabus || []).filter(s => s.grade === selectedGrade);
        return subjectsForSelectedGrade.map(subDef => {
            const normName = normalizeSubjectName(subDef.name);
            const matched = gradeSyllabus.find(s => normalizeSubjectName(s.subject) === normName);
            const topics: SyllabusTopic[] = matched?.topics || [];
            const totalTopics = topics.length;
            const completed = topics.filter(t => t.status === 'Completed').length;
            const inProgress = topics.filter(t => t.status === 'In Progress').length;
            const progress = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
            return {
                subject: subDef.name,
                topics,
                totalTopics,
                completed,
                inProgress,
                progress,
            };
        });
    }, [selectedGrade, syllabus, subjectsForSelectedGrade]);

    const distinctionYears = hslcResults.filter(r => r.distinction > 0);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="bg-white text-[#0B1F3A]">
            {/* ── PAGE HEADER & SECTION NAVIGATION ── */}
            <section className="bg-[#0B1F3A] text-white py-12 sm:py-16 border-b-2 border-[#C9A84C]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#DFC06B] mb-2">
                        Nursery to Class X &middot; MBSE Curriculum
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                        <EditableContent id="academics_title" defaultContent="Academics" type="text" user={user} />
                    </h1>
                    <div className="w-20 h-1 bg-[#C9A84C] mx-auto my-4 rounded-full" />
                    <p className="text-sm sm:text-lg text-white/85 max-w-2xl mx-auto">
                        <EditableContent
                            id="academics_subtitle"
                            defaultContent="Structured MBSE curriculum, live class-wise syllabus progress, and proven HSLC board achievements."
                            type="text"
                            user={user}
                        />
                    </p>

                    {/* Quick Jump Buttons */}
                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => scrollToSection('curriculum')}
                            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[#132D52] hover:bg-[#1C3D6E] border border-[#C9A84C]/50 text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                            <Layers className="w-4 h-4 text-[#DFC06B]" />
                            <span>Our Curriculum</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('syllabus')}
                            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[#132D52] hover:bg-[#1C3D6E] border border-[#C9A84C]/50 text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4 text-[#DFC06B]" />
                            <span>Syllabus &amp; Textbooks</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('achievements')}
                            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] text-sm font-extrabold transition-colors cursor-pointer"
                        >
                            <Award className="w-4 h-4" />
                            <span>Academic Achievements</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── SECTION 1: OUR CURRICULUM ── */}
            <section id="curriculum" className="py-12 sm:py-16 bg-white scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                            Subjects Offered
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                            Our Curriculum (Nursery &ndash; Class X)
                        </h2>
                        <div className="gold-rule mt-3 mb-4" />
                        <p className="text-sm sm:text-base text-[#0B1F3A]/75">
                            Comprehensive subject offerings prescribed by the Mizoram Board of School Education (MBSE) tailored for every learning stage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                        {GRADES_LIST.map(grade => {
                            const gradeDef = gradeDefinitions?.[grade];
                            return (
                                <div
                                    key={grade}
                                    className="bg-[#F4F7FB] rounded-xl border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-5 sm:p-6 flex flex-col justify-between shadow-sm"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <h3 className="text-lg font-extrabold text-[#0B1F3A]">{grade}</h3>
                                            <span className="font-tabular text-xs font-bold text-[#8E6D1B]">
                                                {gradeDef?.subjects?.length || 0} subjects
                                            </span>
                                        </div>
                                        {Array.isArray(gradeDef?.subjects) && gradeDef.subjects.length > 0 ? (
                                            <ul className="space-y-1.5 text-sm text-[#0B1F3A]/85">
                                                {gradeDef.subjects.map(sub => (
                                                    <li key={sub.name} className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0" />
                                                        <span>{sub.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[#0B1F3A]/60 italic">Curriculum details coming soon.</p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[#0B1F3A]/10">
                                        <Link
                                            to={`/syllabus/${encodeURIComponent(grade)}`}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors"
                                        >
                                            <span>Open {grade} Syllabus</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SECTION 2: SYLLABUS PROGRESS & TEXTBOOKS ── */}
            <section id="syllabus" className="py-12 sm:py-16 bg-[#F4F7FB] border-y border-[#0B1F3A]/10 scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-8">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B] mb-2">
                                Live Course Tracker
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                                Syllabus &amp; Textbooks
                            </h2>
                            <div className="gold-rule mt-3 mb-4" />
                            <p className="text-sm sm:text-base text-[#0B1F3A]/75 max-w-2xl mx-auto">
                                Select a class below to inspect live subject completion and topic progress, or view prescribed textbooks.
                            </p>
                        </div>

                        {/* Class Selector Strip */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {GRADES_LIST.map(grade => {
                                const isSelected = selectedGrade === grade;
                                return (
                                    <button
                                        key={grade}
                                        type="button"
                                        onClick={() => setSelectedGrade(grade)}
                                        className={`px-3.5 py-2 min-h-[42px] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#0B1F3A] text-[#DFC06B] border border-[#C9A84C]'
                                                : 'bg-white text-[#0B1F3A] border border-[#0B1F3A]/20 hover:border-[#C9A84C]'
                                        }`}
                                    >
                                        {grade}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected Class Syllabus Cards */}
                        <div className="bg-white rounded-2xl border border-[#0B1F3A]/15 p-5 sm:p-7 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#0B1F3A]/10">
                                <div>
                                    <h3 className="text-xl font-extrabold text-[#0B1F3A]">
                                        {selectedGrade} Syllabus Overview
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#0B1F3A]/70 mt-0.5 font-tabular">
                                        {syllabusSummaryForGrade.length} subjects tracked
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        to={`/syllabus/${encodeURIComponent(selectedGrade)}`}
                                        className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#0B1F3A] hover:bg-[#132D52] text-white text-xs sm:text-sm font-bold transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-[#DFC06B]" />
                                        <span>Full {selectedGrade} Syllabus</span>
                                    </Link>
                                    <Link
                                        to="/textbooks"
                                        className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg border border-[#0B1F3A] hover:bg-[#0B1F3A] text-[#0B1F3A] hover:text-white text-xs sm:text-sm font-bold transition-colors"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        <span>Prescribed Textbooks</span>
                                    </Link>
                                </div>
                            </div>

                            {syllabusSummaryForGrade.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {syllabusSummaryForGrade.map(item => (
                                        <div key={item.subject} className="p-4 rounded-xl bg-[#F4F7FB] border border-[#0B1F3A]/12">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <h4 className="font-bold text-[#0B1F3A] text-sm sm:text-base">{item.subject}</h4>
                                                <span className="font-tabular text-xs font-extrabold text-[#8E6D1B]">
                                                    {item.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-2 border border-[#0B1F3A]/15 overflow-hidden">
                                                <div
                                                    className="bg-[#C9A84C] h-2 rounded-full transition-all"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-[#0B1F3A]/70 font-tabular">
                                                <span>
                                                    {item.totalTopics > 0
                                                        ? `${item.completed} of ${item.totalTopics} topics completed`
                                                        : 'Topics pending update'}
                                                </span>
                                                {item.inProgress > 0 && (
                                                    <span className="font-semibold text-[#0B1F3A]">
                                                        {item.inProgress} in progress
                                                    </span>
                                                )}
                                            </div>
                                            {item.topics.length > 0 && (
                                                <ul className="mt-3 pt-2.5 border-t border-[#0B1F3A]/10 space-y-1">
                                                    {item.topics.slice(0, 3).map((t, idx) => (
                                                        <li key={idx} className="flex items-center justify-between gap-2 text-xs text-[#0B1F3A]/85">
                                                            <span className="flex items-center gap-1.5 min-w-0">
                                                                <CheckCircle2
                                                                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                                                                        t.status === 'Completed'
                                                                            ? 'text-[#8E6D1B]'
                                                                            : 'text-[#0B1F3A]/30'
                                                                    }`}
                                                                />
                                                                <span className="truncate">{t.name}</span>
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-[#0B1F3A]/65 flex-shrink-0">
                                                                {t.status}
                                                            </span>
                                                        </li>
                                                    ))}
                                                    {item.topics.length > 3 && (
                                                        <li className="text-[11px] font-bold text-[#8E6D1B] pt-0.5">
                                                            +{item.topics.length - 3} more topics in full syllabus
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-[#0B1F3A]/65 py-6">
                                    No subjects listed for {selectedGrade} yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 3: ACADEMIC ACHIEVEMENTS (MBSE HSLC EXCELLENCE) ── */}
            <section id="achievements" className="py-12 sm:py-16 bg-[#0B1F3A] text-white scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#DFC06B] mb-2">
                            Legacy of Excellence
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                            Academic Achievements (MBSE HSLC Results)
                        </h2>
                        <div className="gold-rule mt-3 mb-4" />
                        <p className="text-sm sm:text-base text-white/80">
                            Consistent 100% pass years, state top-10 merit rank holders, and over 160 distinctions in MBSE HSLC Board Examinations.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* MBSE Top Rank Holders */}
                        <div className="rounded-xl p-6 sm:p-8 bg-[#132D52] border border-[#C9A84C]/35">
                            <h3 className="text-xl font-extrabold text-center mb-6 text-white">MBSE State Top Rank Holders</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {TOP_RANKERS.map(r => (
                                    <div key={r.name} className="text-center">
                                        <img
                                            src={r.imgSrc}
                                            alt={r.name}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/bms-logo-color.png'; }}
                                            className="rounded-lg w-full h-auto object-cover aspect-[4/5] border border-[#C9A84C]/35 bg-[#07162B]"
                                        />
                                        <p className="mt-3 font-bold text-sm text-white">{r.name}</p>
                                        <p className="text-sm font-bold text-[#DFC06B]">{r.rank}</p>
                                        <p className="font-tabular text-xs mt-0.5 text-white/65">{r.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Results Analysis Chart */}
                        {hslcResults.length > 0 && <ResultChart results={hslcResults} />}

                        {/* Distinguished HSLC Graduates */}
                        <div className="rounded-xl p-6 sm:p-8 bg-[#132D52] border border-[#C9A84C]/35">
                            <h3 className="text-xl font-extrabold text-center mb-2 text-white">Distinguished HSLC Graduates</h3>
                            <p className="text-center text-sm mb-6 text-white/75">
                                Tap any year to view students who achieved Distinction in the MBSE HSLC Examination
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {distinctionYears.map(result => (
                                    <Link
                                        key={result.year}
                                        to={`/achievements/academic/distinction-holders/${result.year}`}
                                        className="group flex flex-col items-center justify-center rounded-xl p-3.5 transition-all bg-[#07162B] border border-white/15 hover:border-[#C9A84C]"
                                    >
                                        <span className="font-tabular text-lg font-extrabold text-white">{result.year}</span>
                                        <span className="mt-1 text-xs font-bold text-[#DFC06B] font-tabular">{result.distinction} dist.</span>
                                        <span className="mt-1 text-[11px] text-white/65 group-hover:text-white inline-flex items-center gap-0.5">
                                            View <ArrowUpRight className="w-3 h-3" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Year-by-Year Results Table */}
                        <div className="rounded-xl p-6 sm:p-8 bg-[#132D52] border border-[#C9A84C]/35">
                            <h3 className="text-xl font-extrabold text-center mb-6 text-white">Detailed HSLC Results by Year</h3>
                            <div className="overflow-x-auto rounded-lg border border-white/15">
                                <table className="min-w-full">
                                    <thead className="bg-[#07162B]">
                                        <tr>
                                            {['Year', 'Appeared', 'Passed', 'Pass %', 'Distinction', 'I Div', 'II Div', 'III Div'].map(h => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#DFC06B]"
                                                    style={{ textAlign: h === 'Year' ? 'left' : 'center' }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hslcResults.map((result, i) => (
                                            <tr key={result.year} className={`border-t border-white/10 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                                <td className="px-4 py-3 font-tabular font-bold">
                                                    {result.distinction > 0 ? (
                                                        <Link to={`/achievements/academic/distinction-holders/${result.year}`} className="hover:underline text-[#DFC06B]">
                                                            {result.year}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-white/85">{result.year}</span>
                                                    )}
                                                </td>
                                                {[
                                                    result.appeared,
                                                    result.passed,
                                                    result.passPercentage,
                                                    result.distinction,
                                                    result.firstDivision,
                                                    result.secondDivision,
                                                    result.thirdDivision,
                                                ].map((v, j) => (
                                                    <td
                                                        key={j}
                                                        className={`px-4 py-3 text-center text-sm font-tabular ${j === 2 ? 'text-[#DFC06B] font-bold' : 'text-white/85'}`}
                                                    >
                                                        {v}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AcademicsPage;
