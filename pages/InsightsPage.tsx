import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
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

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        riskLevel: { type: Type.STRING, enum: ['Low Risk', 'Needs Monitoring', 'At Risk'] },
        summary: { type: Type.STRING, description: "A summary of performance." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['riskLevel', 'summary', 'strengths', 'weaknesses']
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
        const studentConduct = conductLog.filter(c => c.studentId === studentToAnalyze.id);
        const prompt = `Analyze student data for ${studentToAnalyze.name} in ${studentToAnalyze.grade}. Academic Performance: ${JSON.stringify(studentToAnalyze.academicPerformance)}. Conduct: ${JSON.stringify(studentConduct)}. Provide a risk assessment.`;

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            const resultJson = JSON.parse(response.text || '{}');
            setAnalyses(prev => ({...prev, [studentToAnalyze.id]: resultJson}));
        } catch (error) {
            console.error("Error generating analysis:", error);
            setAnalyses(prev => ({...prev, [studentToAnalyze.id]: { error: "Failed to generate analysis." }}));
        } finally {
            setLoadingStates(prev => ({ ...prev, [studentToAnalyze.id]: false }));
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5" /> Back</button>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3"><SparklesIcon className="w-8 h-8 text-sky-600"/> AI Student Insights</h1>
            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700">Select Class</label>
                <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)} className="form-select max-w-xs">
                    <option value="">-- Choose --</option>
                    {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
            <div className="space-y-4">
                {classStudents.map(student => (
                    <div key={student.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <span>{student.name} (Roll: {student.rollNo})</span>
                        <button onClick={() => generateAnalysis(student)} disabled={loadingStates[student.id]} className="btn btn-primary text-xs">
                            {loadingStates[student.id] ? <SpinnerIcon className="w-4 h-4"/> : <SparklesIcon className="w-4 h-4"/>} Analyze
                        </button>
                        {analyses[student.id] && <div className="mt-2 text-xs">Analysis present.</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InsightsPage;