import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon } from '@/components/Icons';
import SchoolDataAiPanel from '@/components/SchoolDataAiPanel';
import { SchoolAiSnapshotInput } from '@/utils/aiDataSnapshot';
import { User } from '@/types';

const { Link, useNavigate } = ReactRouterDOM as any;

interface SchoolDataAiPageProps {
  user: User;
  snapshotInput: SchoolAiSnapshotInput;
}

const SchoolDataAiPage: React.FC<SchoolDataAiPageProps> = ({ user, snapshotInput }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
          title="Go to Home"
        >
          <HomeIcon className="w-5 h-5" />
          Home
        </Link>
      </div>

      <SchoolDataAiPanel snapshotInput={snapshotInput} user={user} mode="page" />
    </div>
  );
};

export default SchoolDataAiPage;
