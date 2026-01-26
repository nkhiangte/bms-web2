import React, { useState, useEffect } from "react";
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useLocation, useNavigate } = ReactRouterDOM as any;

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  onGoogleSignIn: () => Promise<{ success: boolean; message?: string }>;
  error: string;
  notification: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onGoogleSignIn,
  error: authError,
  notification: propNotification,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    const messageFromState = state?.message;
    const messageFromStorage = sessionStorage.getItem('loginMessage');

    if (messageFromState) {
        setNotification(messageFromState);
    } else if (messageFromStorage) {
        setNotification(messageFromStorage);
        sessionStorage.removeItem('loginMessage');
    } else {
        setNotification(propNotification);
    }
  }, [propNotification, location.state]);

  useEffect(() => {
    setFormError(authError);
    if (authError) {
      const timer = setTimeout(() => setFormError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setNotification("");
    setLoading(true);
    
    try {
        const result = await onLogin(email, password);
        if (result && result.success) {
            // FIX: Explicitly push the user into the portal dashboard.
            // Using replace ensures they can't go back to the login page.
            navigate('/portal/dashboard', { replace: true });
        } else if (result && result.message) {
            setFormError(result.message);
        }
    } catch (err: any) {
        setFormError(err.message || "An unexpected error occurred during login.");
    } finally {
        setLoading(false);
    }
  };
  
  const handleGoogleClick = async () => {
    setFormError("");
    setNotification("");
    setLoading(true);
    try {
      const result = await onGoogleSignIn();
      if (result && result.success) {
        navigate('/portal/dashboard', { replace: true });
      } else if (result && result.message) {
        setFormError(result.message);
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          <div className="mb-8 text-center">
            <img
              src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png"
              alt="Bethel Mission School Logo"
              className="mx-auto h-32 mb-4"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Portal Login</h1>
          </div>

          {formError && (
            <p
              className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm"
              role="alert"
            >
              {formError}
            </p>
          )}
          {notification && !formError && (
            <p
              className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm"
              role="alert"
            >
              {notification}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
              <div className="mb-4">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  id="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="inline-block align-baseline font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </fieldset>
          </form>

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-sm">Or</span>
                <div className="flex-grow border-t border-slate-300"></div>
            </div>

            <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-50 transition-all duration-300 shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Sign in with Google
            </button>

          <div className="text-center mt-6 text-sm text-slate-700">
            <p className="mb-2">
                Teacher or Admin?{' '}
                <Link to="/signup" className="font-bold text-sky-600 hover:text-sky-800">Register Here</Link>
            </p>
            <p>
                Parent or Student?{' '}
                <Link to="/parent-registration" className="font-bold text-sky-600 hover:text-sky-800">Create Account</Link>
            </p>
            <p className="mt-4">
              <Link to="/" className="font-bold text-sm text-slate-600 hover:text-slate-800">
                    &larr; Back to Website Home
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-slate-700 text-xs mt-6">
          &copy;{new Date().getFullYear()} Bethel Mission School. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
