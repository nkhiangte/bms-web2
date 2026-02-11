

import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Corrected imports to use GoogleGenAI and Type from @google/genai.
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Grade, GradeDefinition, User, ConductEntry } from '../types';
import { GRADES_LIST } from '../constants';
import { BackIcon, HomeIcon, SparklesIcon, SpinnerIcon } from '../components/Icons';

const { Link, useNavigate } = ReactRouterDOM as any;

interface InsightsPageProps {
    students: Student[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
    conductLog: ConductEntry[];
    user: User;
}

interface AnalysisResult {
    riskLevel: 'Low Risk' | 'Needs Monitoring' | 'At Risk';
    summary: string;
    strengths: string[];
    weaknesses: string[];
}

// FIX: Replaced deprecated SchemaType with Type.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        riskLevel: { type: Type.STRING, enum: ['Low Risk', 'Needs Monitoring', 'At Risk'] },
        summary: { type: Type.STRING, description: "A 2-3 sentence summary of the student's performance and risk level." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of subjects or areas where the student is performing well." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of subjects or areas needing improvement." }
    },
    required: ['riskLevel', 'summary', 'strengths', 'weaknesses']
};


const AnalysisCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const riskStyles = {
        'At Risk': { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800' },
        'Needs Monitoring': { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800' },
        'Low Risk': { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800' },
    };
    const style = riskStyles[result.riskLevel] || riskStyles['Needs Monitoring'];

    return (
        <div className={`mt-4 p-4 border-l-4 rounded-r-lg ${style.bg} ${style.border}`}>
            <p className={`font-bold text-lg ${style.text}`}>{result.riskLevel}</p>
            <p className="mt-2 text-sm text-slate-700">{result.summary}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-semibold text-emerald-700">Strengths</h4>
                    <ul className="list-disc list-inside mt-1 text-slate-600">
                        {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-red-700">Areas for Improvement</h4>
                    <ul className="list-disc list-inside mt-1 text-slate-600">
                        {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const InsightsPage: React.FC<InsightsPageProps> = ({ students, gradeDefinitions, conductLog, user }) => {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
    const [analyses, setAnalyses] = useState<Record<string, AnalysisResult | { error: string }>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const classStudents = useMemo(() => {
        if (!selectedGrade) return [];
        return students.filter(s => s.grade === selectedGrade).sort((a, b) => a.rollNo - b.rollNo);
    }, [students, selectedGrade]);
    
    const generateAnalysis = async (studentToAnalyze: Student) => {
        setLoadingStates(prev => ({ ...prev, [studentToAnalyze.id]: true }));
        setAnalyses(prev => {
            const newAnalyses = {...prev};
            delete newAnalyses[studentToAnalyze.id];
            return newAnalyses;
        });

        const studentConduct = conductLog.filter(c => c.studentId === studentToAnalyze.id);
        const studentGradeDef = gradeDefinitions[studentToAnalyze.grade];

        // Sanitize data for the prompt
        const academicData = (studentToAnalyze.academicPerformance || []).map(exam => ({
            name: exam.name,
            results: exam.results.map(r => ({
                subject: r.subject,
                marks: r.marks,
                examMarks: r.examMarks,
                activityMarks: r.activityMarks,
                grade: r.grade,
            }))
        }));

        const conductData = studentConduct.map(c => ({
            type: c.type,
            category: c.category,
            description: c.description.substring(0, 100) // Truncate long descriptions
        }));

        const prompt = `
            You are an expert academic advisor analyzing student data to identify academic risk.
            The school follows these rules:
            - For classes III-VIII, a student fails a subject if their exam marks (summative) are less than 20 out of 60. Failing in more than one subject means the student fails the term.
            - For classes IX-X, a student fails a subject if their total marks are less than 33 out of 100. Failing in more than one subject means the student fails the term.
            
            **Student Data:**
            ${JSON.stringify({ grade: studentToAnalyze.grade, academicPerformance: academicData, conductLog: conductData }, null, 2)}

            **Class Curriculum (Full Marks):**
            ${JSON.stringify(studentGradeDef, null, 2)}

            **Analysis Instructions:**
            1.  **Risk Level:** Determine the student's academic risk level. Choose one: 'Low Risk', 'Needs Monitoring', 'At Risk'. 'At Risk' is for students who are failing terms or showing a sharp decline. 'Needs Monitoring' is for students with borderline scores or a slight decline.
            2.  **Summary:** Provide a concise, 2-3 sentence summary explaining the risk level. Mention performance trends (improving, declining, stable).
            3.  **Strengths:** List 2-3 subjects where the student is performing well or showing improvement.
            4.  **Areas for Improvement:** List 2-3 subjects where the student is struggling or has low scores. Be specific if they are failing subjects based on the rules.

            Return your analysis ONLY in the specified JSON format.
        `;

        try {
            // FIX: Updated Gemini API initialization and call to follow latest guidelines.
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            // FIX: Correctly parse JSON from the response.text property.
            const resultJson = JSON.parse(response.text);
            setAnalyses(prev => ({...prev, [studentToAnalyze.id]: resultJson}));
        } catch (error) {
            console.error("Error generating analysis:", error);
            setAnalyses(prev => ({...prev, [studentToAnalyze.id]: { error: "Failed to generate analysis. Please try again." }}));
        } finally {
            setLoadingStates(prev => ({ ...prev, [studentToAnalyze.id]: false }));
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5" /> Back</button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home"><HomeIcon className="w-5 h-5" /> Home</Link>
            </div>
             <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="w-10 h-10 text-teal-600"/>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">AI-Powered Academic Insights</h1>
                    <p className="text-slate-600 mt-1">Select a class to analyze student performance and identify those at risk.</p>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border rounded-lg">
                <label htmlFor="grade-select" className="block text-sm font-bold text-slate-700">Select Class to Analyze</label>
                <select id="grade-select" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)} className="mt-1 w-full max-w-xs form-select">
                    <option value="">-- Choose Class --</option>
                    {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>

            <div className="mt-6 space-y-4">
                {selectedGrade ? (
                    classStudents.length > 0 ? (
                        classStudents.map(student => (
                            <div key={student.id} className="p-4 border rounded-lg bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800">{student.name}</p>
                                        <p className="text-sm text-slate-600">Roll No: {student.rollNo}</p>
                                    </div>
                                    <button 
                                        onClick={() => generateAnalysis(student)}
                                        disabled={loadingStates[student.id]}
                                        className="btn btn-secondary"
                                    >
                                        {loadingStates[student.id] ? <SpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                                        <span>{loadingStates[student.id] ? 'Analyzing...' : 'Generate Analysis'}</span>
                                    </button>
                                </div>
                                {analyses[student.id] && ('error' in analyses[student.id] ? (
                                    <p className="mt-4 text-red-600 font-semibold">{(analyses[student.id] as {error: string}).error}</p>
                                ) : (
                                    <AnalysisCard result={analyses[student.id] as AnalysisResult} />
                                ))}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-600 py-8">No students found in this class.</p>
                    )
                ) : (
                    <p className="text-center text-slate-600 py-8">Please select a class to begin.</p>
                )}
            </div>
        </div>
    );
};

export default InsightsPage;