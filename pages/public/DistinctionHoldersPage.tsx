

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon, UserIcon } from '../../components/Icons';
import { DISTINCTION_HOLDERS_BY_YEAR } from '../../constants';
import { DistinctionHolder } from '../../types';

const HolderCard: React.FC<{ holder: DistinctionHolder; isLarge?: boolean }> = ({ holder, isLarge }) => {
    const containerHeight = isLarge ? 'h-84' : 'h-56';
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform transform hover:-translate-y-2">
            <div className={`w-full ${containerHeight} bg-slate-200 flex items-center justify-center`}>
                <img src={holder.imageUrl} alt={holder.name} className="w-full h-full object-contain" />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800">{holder.name}</h3>
                <p className="text-sm text-slate-600">{holder.parentage}</p>
            </div>
        </div>
    );
};

const DistinctionHoldersPage: React.FC = () => {
    const { year } = useParams<{ year: string }>();
    const navigate = useNavigate();
    const holders = (year && DISTINCTION_HOLDERS_BY_YEAR[year]) || [];
    const numericYear = year ? parseInt(year, 10) : 0;

    return (
        <div className="bg-slate-50 py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                         <button
                            onClick={() => navigate('/achievements/academic')}
                            className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            Back to Academic Achievements
                        </button>
                    </div>

                    <div className="text-center mb-12">
                         <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Distinction Holders ({year})</h1>
                         <p className="mt-2 text-lg text-slate-600">Celebrating the academic excellence of our top students.</p>
                    </div>

                    {holders && holders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {holders.map((holder, index) => (
                                <HolderCard key={index} holder={holder} isLarge={numericYear >= 2017} />
                            ))}
                        </div>
                    ) : (
                         <div className="bg-white py-16 text-center rounded-lg shadow-md">
                            <UserIcon className="w-16 h-16 mx-auto text-slate-400" />
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">Information Coming Soon</h2>
                            <p className="text-slate-600 mt-2">
                                Details for the distinction holders of {year} are not yet available.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DistinctionHoldersPage;
