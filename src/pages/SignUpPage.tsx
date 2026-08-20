import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Captcha from '@/components/Captcha';
import { 
  UserIcon, MailIcon, LockClosedIcon, EyeIcon, 
  CheckCircleIcon, BackIcon, SpinnerIcon, ShieldCheckIcon 
} from '@/components/Icons';

const { Link, useNavigate } = ReactRouterDOM as any;

interface SignUpPageProps {
  onSignUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    if (!isCaptchaValid) {
      setError('Please complete the CAPTCHA security verification before registering.');
      return;
    }

    setLoading(true);

    try {
      const result = await onSignUp(name.trim(), email.trim(), password);

      if (result.success) {
        setSuccessMessage('Account registered successfully! Your account is pending administrator approval.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Registration submitted! Please await admin approval before logging in.' } 
          });
        }, 3000);
      } else {
        setError(result.message || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
            <div className="w-12 h-12 bg-sky-700 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheckIcon className="w-7 h-7 text-amber-300" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bethel Mission School
          </h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Staff & Teacher Portal Registration
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-lg flex items-start gap-2 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-start gap-2 animate-fade-in">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold">{successMessage}</p>
                <p className="text-xs text-emerald-700 mt-1">Redirecting to login page...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. John Lalremruata"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MailIcon className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="teacher@bethelmission.edu.in"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockClosedIcon className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockClosedIcon className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* CAPTCHA Verification */}
            <div className="pt-1">
              <Captcha
                id="signup-captcha"
                onVerify={(valid) => setIsCaptchaValid(valid)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isCaptchaValid}
              className={`w-full py-2.5 px-4 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                loading || !isCaptchaValid
                  ? 'bg-slate-400 cursor-not-allowed opacity-80'
                  : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800'
              }`}
            >
              {loading ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="text-center mt-6 pt-4 border-t border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-sky-600 hover:text-sky-800">
                Log In
              </Link>
            </p>
            <p>
              Are you a Parent or Guardian?{' '}
              <Link to="/parent-registration" className="font-bold text-sky-600 hover:text-sky-800">
                Parent Registration
              </Link>
            </p>
            <p className="pt-2">
              <Link to="/" className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800">
                <BackIcon className="w-3.5 h-3.5" /> Back to School Home
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Bethel Mission School. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
