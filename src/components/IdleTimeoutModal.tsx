import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ClockIcon, LogoutIcon, CheckCircleIcon } from '@/components/Icons';

const { useNavigate } = ReactRouterDOM as any;

interface IdleTimeoutModalProps {
  isLoggedIn: boolean;
  onLogout: () => Promise<void> | void;
  idleTimeoutMs?: number; // default: 10 minutes (600,000 ms)
  warningDurationMs?: number; // default: 60 seconds (60,000 ms)
}

export const IdleTimeoutModal: React.FC<IdleTimeoutModalProps> = ({
  isLoggedIn,
  onLogout,
  idleTimeoutMs = 10 * 60 * 1000, // 10 minutes
  warningDurationMs = 60 * 1000, // 1 minute warning
}) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(Math.floor(warningDurationMs / 1000));
  
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  // Reset timer on user activity
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    // Throttle updates to avoid excessive state operations
    if (now - lastActivityRef.current > 1000) {
      lastActivityRef.current = now;
      if (showWarning) {
        setShowWarning(false);
      }
    }
  }, [showWarning]);

  const handleStayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  const handlePerformLogout = useCallback(async (reason: string) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setShowWarning(false);

    try {
      sessionStorage.setItem('loginMessage', reason);
      await onLogout();
      navigate('/login', { state: { message: reason } });
    } catch (err) {
      console.error('Error during automatic idle logout:', err);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [onLogout, navigate]);

  // Set up event listeners for user interaction
  useEffect(() => {
    if (!isLoggedIn) return;

    lastActivityRef.current = Date.now();
    isLoggingOutRef.current = false;

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
    ];

    const onEvent = () => handleUserActivity();

    events.forEach(event => {
      window.addEventListener(event, onEvent, { passive: true });
    });

    // Check idle status every second
    const interval = setInterval(() => {
      if (!isLoggedIn || isLoggingOutRef.current) return;

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      // Inactivity timeout exceeded (10 minutes)
      if (elapsed >= idleTimeoutMs) {
        handlePerformLogout('You have been logged out due to 10 minutes of inactivity.');
        return;
      }

      // Warning threshold exceeded (e.g., 9 minutes)
      const warningThreshold = idleTimeoutMs - warningDurationMs;
      if (elapsed >= warningThreshold) {
        const remainingMs = Math.max(0, idleTimeoutMs - elapsed);
        const remainingSec = Math.ceil(remainingMs / 1000);
        setSecondsRemaining(remainingSec);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, onEvent);
      });
      clearInterval(interval);
    };
  }, [isLoggedIn, idleTimeoutMs, warningDurationMs, handleUserActivity, handlePerformLogout]);

  if (!isLoggedIn || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-amber-200 max-w-md w-full p-6 text-center transform transition-all scale-100">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
          <ClockIcon className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Session Timeout Warning
        </h3>

        <p className="text-sm text-slate-600 mb-4">
          You have been inactive for nearly 10 minutes. For your security and to protect student and school data, you will be automatically logged out in:
        </p>

        {/* Countdown Ring / Box */}
        <div className="my-3 py-2 px-4 bg-amber-50 border border-amber-300 rounded-lg inline-block">
          <span className="text-2xl font-black text-amber-700 tracking-wider">
            {secondsRemaining}s
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Click below or interact with the screen to keep your session active.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="w-full sm:w-auto flex-1 btn btn-primary py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 shadow-md"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Stay Logged In
          </button>
          <button
            type="button"
            onClick={() => handlePerformLogout('You have logged out.')}
            className="w-full sm:w-auto btn btn-secondary py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-100"
          >
            <LogoutIcon className="w-4 h-4" />
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdleTimeoutModal;
