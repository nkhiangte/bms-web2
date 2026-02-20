import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { HomeIcon, BackIcon, DocumentPlusIcon, SearchIcon, FolderIcon } from '@/components/Icons';

const { Link, useNavigate } = ReactRouterDOM as any;

const ActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; link: string; }> = ({ title, description, icon, link }) => (
    <Link to={link} className="group block p-6 bg-slate-50 rounded-lg text-slate-800 hover:bg-white hover:text-sky-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-sky-300">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-colors">{icon}</div>
            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
        </div>
    </Link>
);

const TransferManagementPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                    <BackIcon className="w-5 h-5" />
                    Back
                </button>
                <Link
                    to="/portal/dashboard"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    title="Go to Home/Dashboard"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </Link>
            </div>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Transfer Certificate System</h1>
                <p className="text-slate-600 mt-1">Manage all student transfer processes and documentation.</p>
            </div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    title="Register Transfer Certificate" 
                    description="Generate a new TC for a student." 
                    icon={<DocumentPlusIcon className="w-8 h-8"/>} 
                    link="/portal/transfers/generate" 
                />
                <ActionCard 
                    title="All TC Records" 
                    description="View, search, and print existing TCs." 
                    icon={<FolderIcon className="w-8 h-8"/>} 
                    link="/portal/transfers/records" 
                />
            </div>
        </div>
    );
};

export default TransferManagementPage;