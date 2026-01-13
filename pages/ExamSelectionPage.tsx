import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, DocumentReportIcon } from '../components/Icons';
import { TERMINAL_EXAMS } from '../constants';

const ExamCard: React.FC<{ title: string; link: string; }> = ({ title, link }) => (
    <Link to={link} className="group block p-8 bg-slate-50 rounded-lg text-center text-slate-800 hover:bg-white hover:text-sky-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-sky-300">
        <DocumentReportIcon className="w-16 h-16 mx-auto text-sky-500 group-hover:text-sky-600 transition-colors" />
        <span className="text-xl mt-4 block font-bold">{title}</span>
    </Link>
);

const ExamSelectionPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Examinations</h1>
                <p className="text-slate-600 mt-1">Select an examination term to proceed.</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {TERMINAL_EXAMS.map(exam => (
                    <ExamCard
                        key={exam.id}
                        title={exam.name}
                        link={`/portal/exams/${exam.id}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExamSelectionPage;
