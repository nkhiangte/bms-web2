import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SyncIcon, CheckIcon, XIcon } from '@/components/Icons';

interface CaptchaProps {
  id?: string;
  onVerify?: (isValid: boolean) => void;
  className?: string;
  autoValidate?: boolean;
}

// Generate random safe characters (excluding ambiguous ones like 0, O, I, l, 1)
const CHAR_SET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';

export const Captcha: React.FC<CaptchaProps> = ({
  id = 'captcha-input',
  onVerify,
  className = '',
  autoValidate = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [mode, setMode] = useState<'text' | 'math'>('text');
  const [mathAnswer, setMathAnswer] = useState<number>(0);

  // Generate new captcha code
  const generateNewChallenge = useCallback(() => {
    setUserInput('');
    setIsVerified(null);
    if (onVerify) onVerify(false);

    if (mode === 'math') {
      const num1 = Math.floor(Math.random() * 20) + 1;
      const num2 = Math.floor(Math.random() * 15) + 1;
      const isPlus = Math.random() > 0.3;
      if (isPlus) {
        setCaptchaCode(`${num1} + ${num2} = ?`);
        setMathAnswer(num1 + num2);
      } else {
        const higher = Math.max(num1, num2);
        const lower = Math.min(num1, num2);
        setCaptchaCode(`${higher} - ${lower} = ?`);
        setMathAnswer(higher - lower);
      }
    } else {
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
      }
      setCaptchaCode(code);
    }
  }, [mode, onVerify]);

  // Draw captcha onto canvas
  useEffect(() => {
    generateNewChallenge();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !captchaCode) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add background noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(
        Math.random() * 180
      )}, ${Math.floor(Math.random() * 180)}, 0.25)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Add interference lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(
        Math.random() * 150
      )}, ${Math.floor(Math.random() * 150)}, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Draw characters with individual distortion
    const chars = captchaCode.split('');
    const charWidth = width / (chars.length + 1);

    chars.forEach((char, index) => {
      ctx.save();
      const x = (index + 0.6) * charWidth;
      const y = height / 2 + (Math.random() * 6 - 3);

      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Random font styling
      const fonts = ['bold 22px Courier New', 'bold 22px Arial', 'bold 22px Georgia', 'bold 22px Verdana'];
      ctx.font = fonts[Math.floor(Math.random() * fonts.length)];

      const colors = ['#0f172a', '#1e3a8a', '#065f46', '#831843', '#3b0764', '#1e293b'];
      ctx.fillStyle = colors[index % colors.length];
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, -8, 8);
      ctx.restore();
    });
  }, [captchaCode]);

  // Validate user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    if (autoValidate) {
      if (!val) {
        setIsVerified(null);
        if (onVerify) onVerify(false);
        return;
      }

      let valid = false;
      if (mode === 'math') {
        const parsed = parseInt(val.trim(), 10);
        valid = parsed === mathAnswer;
      } else {
        // Case-insensitive comparison for convenience while keeping security
        valid = val.trim().toLowerCase() === captchaCode.toLowerCase();
      }

      setIsVerified(valid);
      if (onVerify) onVerify(valid);
    }
  };

  // Text-to-speech audio challenge
  const playAudioChallenge = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    let textToSpeak = '';
    if (mode === 'math') {
      textToSpeak = `Security question: ${captchaCode.replace('?', '')}`;
    } else {
      textToSpeak = `Security code: ${captchaCode.split('').join(' ')}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Security Verification (CAPTCHA)
        </label>
        <button
          type="button"
          onClick={() => setMode(m => (m === 'text' ? 'math' : 'text'))}
          className="text-[11px] text-sky-600 hover:text-sky-800 underline font-medium"
        >
          {mode === 'text' ? 'Switch to Math Challenge' : 'Switch to Character Code'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2.5">
        {/* Captcha Canvas */}
        <div className="relative border border-slate-300 rounded-md overflow-hidden bg-white flex items-center justify-center shadow-inner h-11">
          <canvas
            ref={canvasRef}
            width={180}
            height={44}
            className="w-full sm:w-[180px] h-[44px] block select-none pointer-events-none"
            aria-label="CAPTCHA image"
          />
        </div>

        {/* Action buttons (Refresh & Audio) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={generateNewChallenge}
            className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-200/70 border border-slate-300 rounded-md transition-colors shadow-sm"
            title="Get a new challenge"
            aria-label="Get a new challenge"
          >
            <SyncIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={playAudioChallenge}
            disabled={isSpeaking}
            className={`p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-200/70 border border-slate-300 rounded-md transition-colors shadow-sm ${
              isSpeaking ? 'animate-pulse text-sky-600 bg-sky-50' : ''
            }`}
            title="Play audio challenge"
            aria-label="Play audio challenge"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Input box */}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder={mode === 'math' ? 'Enter the calculated answer' : 'Type the characters above'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-md shadow-sm outline-none transition-colors pr-9 ${
            isVerified === true
              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
              : isVerified === false && userInput.length > 0
              ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-400'
              : 'border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
          }`}
          required
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
          {isVerified === true && <CheckIcon className="w-4 h-4 text-emerald-600" />}
          {isVerified === false && userInput.length > 0 && (
            <XIcon className="w-4 h-4 text-rose-500" />
          )}
        </div>
      </div>

      <p className="mt-1 text-[11px] text-slate-500">
        {isVerified === true ? (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            ✓ Verification successful
          </span>
        ) : isVerified === false && userInput.length > 0 ? (
          <span className="text-rose-600 font-medium">
            Incorrect code or answer. Please try again or click refresh.
          </span>
        ) : (
          'Case-insensitive. Click refresh if the code is hard to read.'
        )}
      </p>
    </div>
  );
};

export default Captcha;
