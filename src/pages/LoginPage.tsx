import React, { useState, useEffect } from "react";
import * as ReactRouterDOM from 'react-router-dom';
import { auth, firebase, db } from '../firebaseConfig';

const { Link, useLocation } = ReactRouterDOM as any;

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
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();

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
        if (!result?.success && result?.message) {
            setFormError(result.message);
        }
        // Navigation is handled by App.tsx route guard once onAuthStateChanged fires
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
      if (!result?.success && result?.message) {
        setFormError(result.message);
      }
      // Navigation is handled by App.tsx route guard once onAuthStateChanged fires
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setNotification("");
    setLoading(true);

    try {
      // Cross-verify with students database
      const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
      const phoneSuffix = cleanPhone(phoneNumber).slice(-10);
      
      const studentsSnapshot = await db.collection('students').get();
      let isVerifiedBySchool = false;
      
      for (const doc of studentsSnapshot.docs) {
          const s = doc.data();
          const studentContactSuffix = cleanPhone(s.contact || s.contactNumber || '').slice(-10);
          if (studentContactSuffix.length === 10 && studentContactSuffix === phoneSuffix) {
              isVerifiedBySchool = true;
              break;
          }
      }

      if (!isVerifiedBySchool) {
          // Check staff just in case
          const staffSnapshot = await db.collection('staff').get();
          for (const doc of staffSnapshot.docs) {
              const st = doc.data();
              const staffContactSuffix = cleanPhone(st.contactNumber || '').slice(-10);
              if (staffContactSuffix.length === 10 && staffContactSuffix === phoneSuffix) {
                  isVerifiedBySchool = true;
                  break;
              }
          }
      }

      if (!isVerifiedBySchool) {
          setFormError("This mobile number is not found in the school's database. Please enter a registered number.");
          setLoading(false);
          return;
      }

      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible'
        });
      }
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await auth.signInWithPhoneNumber(formattedPhone, appVerifier);
      
      (window as any).confirmationResult = confirmationResult;
      setShowOtpInput(true);
      setNotification(`OTP sent to ${formattedPhone}`);
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'Failed to send OTP. Please check the phone number.');
      if ((window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(window as any).confirmationResult) return;
    
    setFormError("");
    setLoading(true);

    try {
      await (window as any).confirmationResult.confirm(otp);
      // Navigation is handled by App.tsx route guard once onAuthStateChanged fires
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bms-login-page min-h-screen bg-[#0B1F3A] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-[#C9A84C] px-6 sm:px-8 pt-8 pb-8">
          <div className="mb-6 text-center">
            <img
              src="/assets/school/bms-logo-color.png"
              alt="Bethel Mission School Logo"
              className="mx-auto h-24 sm:h-28 w-auto mb-3 object-contain"
            />
            <p className="text-xs font-bold uppercase tracking-widest text-[#8E6D1B]">
              Bethel Mission School &middot; Champhai
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1">
              Portal Login
            </h1>
            <p className="text-xs text-[#0B1F3A]/70 italic mt-1">
              "Service to God &amp; Men"
            </p>
          </div>
          
          <div className="flex bg-[#F4F7FB] border border-[#0B1F3A]/15 p-1 rounded-xl mb-6">
              <button 
                  type="button"
                  onClick={() => { setLoginMethod('email'); setShowOtpInput(false); }}
                  className={`flex-1 min-h-[44px] py-2 text-sm font-bold rounded-lg transition-all ${
                    loginMethod === 'email'
                      ? 'bg-[#0B1F3A] text-white shadow-sm'
                      : 'text-[#0B1F3A]/70 hover:text-[#0B1F3A]'
                  }`}
              >
                  Email / Password
              </button>
              <button 
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setShowOtpInput(false); }}
                  className={`flex-1 min-h-[44px] py-2 text-sm font-bold rounded-lg transition-all ${
                    loginMethod === 'phone'
                      ? 'bg-[#0B1F3A] text-white shadow-sm'
                      : 'text-[#0B1F3A]/70 hover:text-[#0B1F3A]'
                  }`}
              >
                  Phone OTP
              </button>
          </div>

          {formError && (
            <div
              className="bg-[#0B1F3A] border-2 border-[#C9A84C] text-white px-4 py-3 rounded-xl mb-4 shadow-sm text-sm font-medium flex items-start gap-2.5"
              role="alert"
            >
              <span className="text-[#DFC06B] font-extrabold flex-shrink-0">!</span>
              <span>{formError}</span>
            </div>
          )}
          {notification && !formError && (
            <div
              className="bg-[#FBF6E8] border border-[#C9A84C] text-[#0B1F3A] px-4 py-3 rounded-xl mb-4 shadow-sm text-sm font-semibold"
              role="alert"
            >
              {notification}
            </div>
          )}

          <div id="recaptcha-container"></div>

          {loginMethod === 'email' ? (
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
              <div className="mb-4">
                <label
                  className="block text-[#0B1F3A] text-sm font-bold mb-1.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="appearance-none border border-[#0B1F3A]/25 rounded-lg w-full min-h-[48px] py-3 px-4 bg-white text-[#0B1F3A] leading-tight focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30"
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
                  className="block text-[#0B1F3A] text-sm font-bold mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="appearance-none border border-[#0B1F3A]/25 rounded-lg w-full min-h-[48px] py-3 px-4 bg-white text-[#0B1F3A] leading-tight focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30"
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
                    className="inline-block align-baseline font-bold text-sm text-[#8E6D1B] hover:text-[#0B1F3A] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="w-full min-h-[48px] bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold py-3 px-4 rounded-lg focus:outline-none transition-colors shadow-md disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </fieldset>
          </form>
          ) : (
            !showOtpInput ? (
                  <form onSubmit={handlePhoneSubmit}>
                      <fieldset disabled={loading}>
                          <div className="mb-6">
                              <label className="block text-[#0B1F3A] text-sm font-bold mb-1.5" htmlFor="phone">
                                  Mobile Number
                              </label>
                              <div className="flex">
                                  <span className="inline-flex items-center px-3.5 text-sm font-bold text-white bg-[#0B1F3A] border border-r-0 border-[#0B1F3A] rounded-l-lg">
                                      +91
                                  </span>
                                  <input
                                      type="tel"
                                      id="phone"
                                      className="appearance-none border border-[#0B1F3A]/25 rounded-r-lg rounded-l-none w-full min-h-[48px] py-3 px-4 bg-white text-[#0B1F3A] leading-tight focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 font-tabular"
                                      placeholder="10-digit mobile number"
                                      value={phoneNumber}
                                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                      maxLength={10}
                                      required
                                  />
                              </div>
                              <p className="text-xs text-[#0B1F3A]/70 mt-2">We'll send an OTP to verify your registered number.</p>
                          </div>
                          <button
                              className="w-full min-h-[48px] bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold py-3 px-4 rounded-lg focus:outline-none transition-colors shadow-md disabled:opacity-50"
                              type="submit"
                              disabled={loading || phoneNumber.length < 10}
                          >
                              {loading ? "Sending OTP..." : "Get OTP"}
                          </button>
                      </fieldset>
                  </form>
            ) : (
                  <form onSubmit={handleOtpSubmit}>
                      <fieldset disabled={loading}>
                          <div className="mb-6">
                              <label className="block text-[#0B1F3A] text-sm font-bold mb-1.5" htmlFor="otp">
                                  Enter OTP
                              </label>
                              <input
                                  id="otp"
                                  type="text"
                                  className="appearance-none border border-[#0B1F3A]/25 rounded-lg w-full min-h-[48px] py-3 px-4 bg-white text-[#0B1F3A] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 font-tabular"
                                  placeholder="6-digit code"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                  maxLength={6}
                                  required
                                  autoFocus
                              />
                               <div className="flex justify-between items-center mt-2">
                                  <button 
                                      type="button" 
                                      onClick={() => setShowOtpInput(false)}
                                      className="text-sm font-bold text-[#8E6D1B] hover:text-[#0B1F3A] transition-colors"
                                  >
                                      Change Mobile Number
                                  </button>
                              </div>
                          </div>
                          <button
                              className="w-full min-h-[48px] bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold py-3 px-4 rounded-lg focus:outline-none transition-colors shadow-md disabled:opacity-50"
                              type="submit"
                              disabled={loading || otp.length < 6}
                          >
                              {loading ? "Verifying..." : "Verify & Log In"}
                          </button>
                      </fieldset>
                  </form>
            )
          )}

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-[#0B1F3A]/15"></div>
                <span className="flex-shrink mx-4 text-[#0B1F3A]/60 text-xs font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-[#0B1F3A]/15"></div>
            </div>

            <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full min-h-[48px] flex items-center justify-center gap-3 bg-white border border-[#0B1F3A]/30 text-[#0B1F3A] font-bold py-3 px-4 rounded-lg hover:bg-[#F4F7FB] hover:border-[#C9A84C] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5 text-[#0B1F3A]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                <span>Sign in with Google</span>
            </button>

          <div className="text-center mt-6 text-sm text-[#0B1F3A]/85 space-y-2">
            <p>
                Teacher or Admin?{' '}
                <Link to="/signup" className="font-bold text-[#8E6D1B] hover:text-[#0B1F3A] underline underline-offset-2">
                  Register Here
                </Link>
            </p>
            <p>
                Parent or Student?{' '}
                <Link to="/parent-registration" className="font-bold text-[#8E6D1B] hover:text-[#0B1F3A] underline underline-offset-2">
                  Create Account
                </Link>
            </p>
            <p className="pt-3 border-t border-[#0B1F3A]/10">
              <Link to="/" className="inline-flex items-center justify-center min-h-[40px] font-bold text-sm text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors">
                    &larr; Back to Website Home
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/75 text-xs mt-5">
          &copy; {new Date().getFullYear()} Bethel Mission School, Champhai. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
