import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { User } from '@/types';
import { SchoolAiSnapshotInput } from '@/utils/aiDataSnapshot';
import SchoolDataAiPanel from '@/components/SchoolDataAiPanel';

const { useLocation, useNavigate } = ReactRouterDOM as any;

interface SchoolDataAiDrawerProps {
  user: User;
  snapshotInput: SchoolAiSnapshotInput;
}

const SchoolDataAiDrawer: React.FC<SchoolDataAiDrawerProps> = ({ user, snapshotInput }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthorized = user.role === 'admin' || user.role === 'user' || user.role === 'warden';
  const isAlreadyOnAiPage = location.pathname === '/portal/ai-assistant';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isAuthorized || isAlreadyOnAiPage) {
    return null;
  }

  return (
    <>
      {/* Floating Quick-Query Button inside Staff/Admin/Warden Portal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-30 print-hidden inline-flex items-center gap-2 rounded-full bg-[#142B49] hover:bg-[#1d3e69] text-white px-4 py-3 text-sm font-semibold shadow-xl border border-amber-300/40 transition-transform hover:-translate-y-0.5 cursor-pointer"
        title="Ask AI about school data (students, PEN, fees, staff, hostel)"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Ask AI Data</span>
      </button>

      {/* Slide-Over Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-[1px] print-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="AI School Data Assistant"
        >
          <div className="flex-1" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition"
              title="Close assistant (Esc)"
              aria-label="Close AI Data Assistant"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 min-h-0">
              <SchoolDataAiPanel
                snapshotInput={snapshotInput}
                user={user}
                mode="drawer"
                onOpenFullPage={() => {
                  setIsOpen(false);
                  navigate('/portal/ai-assistant');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchoolDataAiDrawer;
