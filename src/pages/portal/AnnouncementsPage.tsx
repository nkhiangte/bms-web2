
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Notice, User, Grade } from '@/types';
import { BackIcon, HomeIcon, MessageIcon, CalendarIcon, BellIcon, MegaphoneIcon, InboxIcon } from '@/components/Icons';
import { formatDateForDisplay } from '@/utils';

const { Link } = ReactRouterDOM as any;

interface AnnouncementsPageProps {
    user: User;
    notices: Notice[];
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ user, notices }) => {
    // Filter notices relevant to the parent's children
    const relevantNotices = useMemo(() => {
        // Parents should see notices for 'all' or for specific grades their children are in
        // For now, let's just sort and filter by relevance if needed.
        // Actually, normally 'all' is safe, and we can filter by the children's grades if we want to be strict.
        return [...notices].sort((a,b) => b.date.localeCompare(a.date));
    }, [notices]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back to Dashboard
                </Link>
                <Link to="/portal/dashboard" className="text-slate-500 hover:text-slate-700"><HomeIcon className="w-5 h-5"/></Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight flex items-center gap-3">
                         <MegaphoneIcon className="w-8 h-8 text-rose-600"/> Notices & Announcements
                    </h1>
                    <p className="text-slate-600 font-semibold mt-1">Stay updated with the latest news and urgent alerts from the school.</p>
                </div>
            </div>

            {relevantNotices.length > 0 ? (
                <div className="space-y-4">
                    {relevantNotices.map((notice) => (
                        <div key={notice.id} className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                             <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                                            <BellIcon className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{notice.title}</h3>
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
                                                <CalendarIcon className="w-3 h-3"/> {formatDateForDisplay(notice.date)}
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                By {notice.createdBy.name}
                                            </p>
                                        </div>
                                    </div>
                                    {notice.targetGrades === 'all' ? (
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-100 uppercase tracking-tight">Everyone</span>
                                    ) : (
                                        <div className="flex gap-1">
                                            {notice.targetGrades.slice(0, 2).map((g, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">{g}</span>
                                            ))}
                                            {notice.targetGrades.length > 2 && <span className="text-[10px] font-bold text-slate-400">+{notice.targetGrades.length - 2} more</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    {notice.content}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="mt-4 flex justify-end gap-3">
                                    {/* Mock WhatsApp Share functionality */}
                                    <button 
                                        onClick={() => {
                                            const text = `*Notice: ${notice.title}*\n\n${notice.content}\n\nDate: ${formatDateForDisplay(notice.date)}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#128C7E] transition-colors"
                                    >
                                        <MessageIcon className="w-4 h-4"/> Share on WhatsApp
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl">
                    <InboxIcon className="w-16 h-16 text-slate-200 mx-auto mb-4"/>
                    <p className="text-slate-800 text-lg font-semibold">No Announcements Yet</p>
                    <p className="text-slate-500 mt-2">When the school posts notices or alerts, they will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;
