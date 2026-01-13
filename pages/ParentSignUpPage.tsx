
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

interface ParentSignUpPageProps {
  onSignUp: (name: string, email: string, password: string, studentId: string) => Promise<{ success: boolean, message?: string }>;
}

const ParentSignUpPage: React.FC<ParentSignUpPageProps> = ({ onSignUp }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    const result = await onSignUp(name, email, password, studentId);
    if (!result.success) {
        setError(result.message || 'An unknown error occurred.');
    } else {
        setSuccessMessage(result.message || 'Success!');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
            <div className="mb-8 text-center">
                <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="mx-auto h-32 mb-4" />
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Parent/Student Portal</h1>
                <h2 className="text-xl font-semibold text-slate-700">Create Account</h2>
            </div>
            {successMessage ? (
                <div className="text-center">
                     <p className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
                        {successMessage}
                    </p>
                    <Link to="/login" className="mt-4 inline-block align-baseline font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors">
                        &larr; Back to Login
                    </Link>
                </div>
            ) : (
             <>
                {error && (
                <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
                    {error}
                </p>
                )}
            <form onSubmit={handleSubmit}>
                <fieldset disabled={loading}>
                    <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        id="name" type="text" placeholder="Your Full Name"
                        value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} required
                    />
                    </div>
                     <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="studentId">
                            Student ID
                        </label>
                        <input
                            className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            id="studentId"
                            type="text"
                            placeholder="e.g., BMS240101"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                    <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        id="email" type="email" placeholder="your-email@example.com"
                        value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} required
                    />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                    <input
                        className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        id="password" type="password" placeholder="Password"
                        autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    />
                    </div>
                
                    <div className="flex items-center justify-between">
                    <button
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400"
                        type="submit" disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    </div>
                </fieldset>
            </form>
            <div className="text-center mt-6">
                    <p className="text-sm text-slate-700">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-sky-600 hover:text-sky-800 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ParentSignUpPage;
