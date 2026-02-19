
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate, useLocation } = ReactRouterDOM as any;

interface ResetPasswordPageProps {
  onResetPassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onResetPassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Optional: Check for oobCode presence visually or programmatically
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const oobCode = query.get('oobCode');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!oobCode) {
        setError('Invalid password reset link. Code is missing.');
        return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsSubmitting(true);
    try {
        const result = await onResetPassword(newPassword);
        if (result.success) {
          navigate('/login', { state: { message: result.message } });
        } else {
            setError(result.message || 'An unknown error occurred.');
        }
    } catch (e: any) {
        setError(e.message || 'Failed to reset password.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!oobCode) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-200 p-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Invalid Link</h1>
                <p className="text-slate-600 mt-2">The password reset link is invalid or has expired.</p>
                <button onClick={() => navigate('/login')} className="mt-6 btn btn-primary">Go to Login</button>
            </div>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          <div className="mb-8 text-center">
             <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="mx-auto h-32 mb-4" />
            <h1 className="text-3xl font-bold text-slate-800">Reset Password</h1>
            <p className="text-slate-600 mt-2">Enter a new password for your account.</p>
          </div>
          {error && (
            <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
                <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="new-password">
                    New Password
                </label>
                <input
                    className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                />
                </div>
                <div className="mb-6">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                    Confirm New Password
                </label>
                <input
                    className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                />
                </div>
                <div className="flex items-center justify-between">
                <button
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400"
                    type="submit"
                >
                    {isSubmitting ? 'Resetting...' : 'Set New Password'}
                </button>
                </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
