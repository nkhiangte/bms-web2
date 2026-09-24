import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Download, 
    Volume2, 
    VolumeX, 
    Sparkles, 
    Copy, 
    Check, 
    Share2, 
    Video, 
    Layers, 
    FileText, 
    ExternalLink,
    Smartphone,
    LayoutDashboard,
    CreditCard,
    BookOpen,
    ScanLine,
    Compass,
    Mic,
    Upload,
    Sliders,
    Music,
    Radio,
    RefreshCw,
    Award,
    GraduationCap,
    CheckCircle2
} from 'lucide-react';
import { User } from '@/types';

const { Link } = ReactRouterDOM as any;

const DURATION_SECONDS = 30;

interface AppScene {
    id: number;
    title: string;
    start: number;
    end: number;
    badge: string;
    screenTitle: string;
    headline: string;
    subline: string;
    appFeatures: { label: string; desc: string; icon: string }[];
    bottomCta: string;
    accentColor: string;
}

const APP_SCENES: AppScene[] = [
    {
        id: 1,
        title: "Sleek UI & Instant Navigation",
        start: 0,
        end: 6,
        badge: "EFFORTLESS NAVIGATION",
        screenTitle: "BETHEL SMART APP",
        headline: "ALL SCHOOL NEEDS IN 1 TAP",
        subline: "Clean, Ultra-Fast & Built for School Life",
        appFeatures: [
            { label: "1-Tap Quick Action Dock", desc: "Instant access to exam results, marks & fees", icon: "⚡" },
            { label: "Zero Learning Curve", desc: "Simple interface for parents, students & teachers", icon: "📱" },
            { label: "Real-Time Cloud Sync", desc: "Works on Android, iPhone & Web Portal", icon: "🌐" }
        ],
        bottomCta: "SUPER SMOOTH & INTUITIVE",
        accentColor: "#38bdf8" // Sky blue
    },
    {
        id: 2,
        title: "Exam Results & Digital Report Cards",
        start: 6,
        end: 12,
        badge: "EXAM RESULTS & MARKSHEETS",
        screenTitle: "DIGITAL REPORT CARD",
        headline: "EXAM RESULTS IN 1 CLICK",
        subline: "Subject Marks, Grades, Class Rank & Official PDF",
        appFeatures: [
            { label: "Subject-Wise Marks & Grades", desc: "Detailed marks breakdown with letter grades & %", icon: "🏆" },
            { label: "Class Position & Rank", desc: "Instant ranking, highest marks & teacher remarks", icon: "🥇" },
            { label: "1-Click PDF Report Card", desc: "Official stamped report card ready to download", icon: "📥" }
        ],
        bottomCta: "INSTANT REPORT CARDS ON YOUR PHONE",
        accentColor: "#a855f7" // Purple
    },
    {
        id: 3,
        title: "Teacher Marks Entry & Tabulation",
        start: 12,
        end: 18,
        badge: "TEACHER EXAM PORTAL",
        screenTitle: "MARKS ENTRY & TABULATION",
        headline: "FAST EXAM MARKS ENTRY",
        subline: "Auto-Calculated Grades, Tabulation & Instant Publish",
        appFeatures: [
            { label: "Rapid Marks Input Grid", desc: "Auto-sums totals and assigns grades automatically", icon: "⚡" },
            { label: "1-Click Tabulation Register", desc: "Generate complete class broadsheets & rank lists", icon: "📊" },
            { label: "Instant Result Publish", desc: "Alert parents immediately via app notification", icon: "🚀" }
        ],
        bottomCta: "ZERO PAPERWORK FOR TEACHERS",
        accentColor: "#f59e0b" // Amber / Gold
    },
    {
        id: 4,
        title: "Cashless UPI Fees & Attendance",
        start: 18,
        end: 24,
        badge: "FEES & DAILY ATTENDANCE",
        screenTitle: "FEE PAY & ATTENDANCE",
        headline: "UPI PAY & LIVE ATTENDANCE",
        subline: "10-Second Fee Payment • Daily Homework Alerts",
        appFeatures: [
            { label: "1-Click UPI & QR Payment", desc: "Pay school & hostel fees anytime with instant receipt", icon: "💳" },
            { label: "Live Attendance Tracker", desc: "Instant arrival notifications for parents", icon: "✅" },
            { label: "Daily Homework & Notices", desc: "Syllabus, due dates and teacher notes", icon: "📚" }
        ],
        bottomCta: "SAFE, SIMPLE & TRANSPARENT",
        accentColor: "#10b981" // Emerald
    },
    {
        id: 5,
        title: "Install & Experience Today",
        start: 24,
        end: 30,
        badge: "FREE FOR PARENTS & STUDENTS",
        screenTitle: "GET THE APP TODAY",
        headline: "MANAGE EXAMS & RESULTS TODAY",
        subline: "Available on Web, Android & PWA at bms04.com",
        appFeatures: [
            { label: "Instant Web Login", desc: "Access immediately at bms04.com", icon: "🌐" },
            { label: "Install as Mobile App", desc: "1-click install on phone home screen", icon: "📲" },
            { label: "24/7 Digital School Access", desc: "Champhai's most trusted school management platform", icon: "⭐" }
        ],
        bottomCta: "INSTALL NOW AT BMS04.COM",
        accentColor: "#f43f5e" // Coral / Rose
    }
];

const ENGLISH_VOICEOVER_TEXT = "Managing school exams and results has never been this easy! Meet the all new Bethel Mission School app. Parents and students get instant exam results with subject breakdowns, grades, and official PDF report cards in one click! Teachers can enter marks with automatic tabulation in seconds. Plus cashless UPI fees and live attendance. Open bms04.com and experience seamless result management today!";

const MIZO_VOICEOVER_TEXT = "Exam marksheet leh result buaipui a hahthlak thin em? Bethel Mission School App hmangin exam leh result management hi a awlsam tawh lutuk! Nu leh pa leh zirlaite'n exam result, subject tin mark, grade, leh report card official an phone atangin 1-click-in an download thei nghal! Zirtirtute tan mark chhut luh leh tabulation a awlsam em em bawk. bms04.com-ah lut la, result en ve nghal rawh le!";

interface PromoVideoPageProps {
    user?: User | null;
}

const PromoVideoPage: React.FC<PromoVideoPageProps> = ({ user }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const synthGainRef = useRef<GainNode | null>(null);
    const voiceoverGainRef = useRef<GainNode | null>(null);
    const musicGainRef = useRef<GainNode | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const mediaDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    const voiceoverBufferRef = useRef<AudioBuffer | null>(null);
    const voiceoverSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingProgress, setRecordingProgress] = useState<number>(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'script' | 'mizo' | 'meta-ads'>('preview');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

    // Voiceover settings
    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'mizo'>('en');
    const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Fenrir' | 'Puck' | 'Zephyr'>('Kore');
    const [isGeneratingVoice, setIsGeneratingVoice] = useState<boolean>(false);
    const [voiceoverStatus, setVoiceoverStatus] = useState<string>('Initializing Voiceover...');
    const [voiceoverDuration, setVoiceoverDuration] = useState<number>(0);
    const [voiceoverVolume, setVoiceoverVolume] = useState<number>(1.0);
    const [musicVolume, setMusicVolume] = useState<number>(0.20);
    const [isPlayingVoiceoverSolo, setIsPlayingVoiceoverSolo] = useState<boolean>(false);

    const animationFrameRef = useRef<number | null>(null);
    const lastTimestampRef = useRef<number | null>(null);
    const isPlayingRef = useRef<boolean>(isPlaying);
    isPlayingRef.current = isPlaying;

    // Copy to clipboard helper
    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Initialize Web Audio API graph with separate voiceover & music buses
    const initAudio = useCallback(() => {
        if (audioCtxRef.current) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();

            // Master destination bus
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
            masterGain.connect(ctx.destination);
            masterGainRef.current = masterGain;

            // Stream destination bus for recording
            const mediaDest = ctx.createMediaStreamDestination();
            mediaDestRef.current = mediaDest;

            // Voiceover bus
            const vGain = ctx.createGain();
            vGain.gain.setValueAtTime(voiceoverVolume, ctx.currentTime);
            vGain.connect(masterGain);
            vGain.connect(mediaDest);
            voiceoverGainRef.current = vGain;

            // Music / Synth bus
            const mGain = ctx.createGain();
            mGain.gain.setValueAtTime(musicVolume, ctx.currentTime);
            mGain.connect(masterGain);
            mGain.connect(mediaDest);
            musicGainRef.current = mGain;

            // Individual synth click node
            const synthGain = ctx.createGain();
            synthGain.gain.setValueAtTime(0.12, ctx.currentTime);
            synthGain.connect(mGain);
            synthGainRef.current = synthGain;

            audioCtxRef.current = ctx;
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }, [voiceoverVolume, musicVolume]);

    // Update volume levels on GainNodes
    useEffect(() => {
        if (voiceoverGainRef.current && audioCtxRef.current) {
            voiceoverGainRef.current.gain.setValueAtTime(isMuted ? 0 : voiceoverVolume, audioCtxRef.current.currentTime);
        }
        if (musicGainRef.current && audioCtxRef.current) {
            musicGainRef.current.gain.setValueAtTime(isMuted ? 0 : musicVolume, audioCtxRef.current.currentTime);
        }
    }, [voiceoverVolume, musicVolume, isMuted]);

    // Stop current voiceover playback
    const stopVoiceoverPlayback = useCallback(() => {
        if (voiceoverSourceRef.current) {
            try {
                voiceoverSourceRef.current.stop();
                voiceoverSourceRef.current.disconnect();
            } catch (e) {}
            voiceoverSourceRef.current = null;
        }
    }, []);

    // Play voiceover from an offset in seconds
    const playVoiceoverAt = useCallback((offsetSec: number) => {
        initAudio();
        const ctx = audioCtxRef.current;
        const buffer = voiceoverBufferRef.current;
        const gainNode = voiceoverGainRef.current;
        if (!ctx || !buffer || !gainNode) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        stopVoiceoverPlayback();

        // If offset is within buffer duration, play it
        if (offsetSec < buffer.duration) {
            try {
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(gainNode);
                source.start(0, Math.max(0, offsetSec));
                voiceoverSourceRef.current = source;
            } catch (e) {
                console.warn("Error starting voiceover playback:", e);
            }
        }
    }, [initAudio, stopVoiceoverPlayback]);

    // Fetch and synthesize voiceover using Gemini TTS backend
    const loadVoiceover = useCallback(async (lang: 'en' | 'mizo', voice: string) => {
        initAudio();
        setIsGeneratingVoice(true);
        setVoiceoverStatus(`Generating ${lang === 'en' ? 'English' : 'Mizo'} voiceover (${voice})...`);

        const scriptText = lang === 'en' ? ENGLISH_VOICEOVER_TEXT : MIZO_VOICEOVER_TEXT;

        try {
            const res = await fetch("/api/tts/voiceover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: scriptText,
                    voice: voice,
                    style: "Enthusiastic, clear, energetic mobile app commercial narrator emphasizing exam results",
                }),
            });

            if (!res.ok) {
                throw new Error(`Server returned HTTP ${res.status}`);
            }

            const data = await res.json();
            if (data.audioBase64) {
                const binaryStr = window.atob(data.audioBase64);
                const len = binaryStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }

                if (audioCtxRef.current) {
                    const decodedBuffer = await audioCtxRef.current.decodeAudioData(bytes.buffer);
                    voiceoverBufferRef.current = decodedBuffer;
                    setVoiceoverDuration(decodedBuffer.duration);
                    setVoiceoverStatus(`🎙️ Voiceover Ready & Synced (${decodedBuffer.duration.toFixed(1)}s audio)`);

                    // If currently playing, start voiceover in sync
                    if (isPlayingRef.current) {
                        playVoiceoverAt(currentTime);
                    }
                }
            } else {
                throw new Error("No audio payload returned");
            }
        } catch (err: any) {
            console.error("Voiceover generation failed:", err);
            setVoiceoverStatus("Generation error: " + (err.message || "Failed"));
        } finally {
            setIsGeneratingVoice(false);
        }
    }, [initAudio, currentTime, playVoiceoverAt]);

    // Handle Custom Voiceover file upload
    const handleVoiceoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        initAudio();
        setIsGeneratingVoice(true);
        setVoiceoverStatus(`Loading custom audio: ${file.name}...`);

        try {
            const arrayBuffer = await file.arrayBuffer();
            if (audioCtxRef.current) {
                const decoded = await audioCtxRef.current.decodeAudioData(arrayBuffer);
                voiceoverBufferRef.current = decoded;
                setVoiceoverDuration(decoded.duration);
                setVoiceoverStatus(`🎙️ Custom Audio Loaded (${decoded.duration.toFixed(1)}s)`);

                if (isPlayingRef.current) {
                    playVoiceoverAt(currentTime);
                }
            }
        } catch (err: any) {
            console.error("Failed to decode uploaded audio:", err);
            alert("Could not decode audio. Please upload an MP3, WAV, or AAC file.");
            setVoiceoverStatus("Failed to load custom audio file.");
        } finally {
            setIsGeneratingVoice(false);
        }
    };

    // Auto-generate voiceover on mount
    useEffect(() => {
        loadVoiceover(selectedLanguage, selectedVoice);
        return () => {
            stopVoiceoverPlayback();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Toggle solo preview of voiceover
    const handleToggleSoloVoiceover = () => {
        initAudio();
        if (isPlayingVoiceoverSolo) {
            stopVoiceoverPlayback();
            setIsPlayingVoiceoverSolo(false);
        } else {
            if (!voiceoverBufferRef.current) {
                alert("Voiceover audio is still loading. Please wait a moment.");
                return;
            }
            playVoiceoverAt(0);
            setIsPlayingVoiceoverSolo(true);
        }
    };

    // Play a modern tech synth beat
    const playSynthTick = useCallback((timeSec: number) => {
        if (!audioCtxRef.current || !synthGainRef.current || isMuted) return;
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const beatIndex = Math.floor(timeSec * 4); // 120 BPM upbeat groove
        if ((beatIndex % 4) === 0) {
            // Punchy bass kick
            const osc = ctx.createOscillator();
            const kickGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.12);
            kickGain.gain.setValueAtTime(0.25, ctx.currentTime);
            kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(kickGain);
            kickGain.connect(synthGainRef.current);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
        } else if ((beatIndex % 4) === 2) {
            // Crisp Snare
            const osc = ctx.createOscillator();
            const snareGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            snareGain.gain.setValueAtTime(0.12, ctx.currentTime);
            snareGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.connect(snareGain);
            snareGain.connect(synthGainRef.current);
            osc.start();
            osc.stop(ctx.currentTime + 0.16);
        } else {
            // Hi-hat tick
            const osc = ctx.createOscillator();
            const hatGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            hatGain.gain.setValueAtTime(0.04, ctx.currentTime);
            hatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(hatGain);
            hatGain.connect(synthGainRef.current);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
        }
    }, [isMuted]);

    // Helper: Rounded Rectangle
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };

    // Helper: Wrap text
    const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    };

    // Draw Simulated Interactive Mobile App Mockup Screen with prominent Exam Results
    const drawAppScreenMockup = (ctx: CanvasRenderingContext2D, scene: AppScene, sceneProgress: number, time: number, w: number, h: number) => {
        const mockX = w * 0.06;
        const mockY = h * 0.28;
        const mockW = w * 0.88;
        const mockH = h * 0.52;

        // Phone container shadow & body
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#0f172a';
        roundRect(ctx, mockX, mockY, mockW, mockH, 32);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Outer sleek border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Phone Screen Header Bar
        const headerH = 64;
        ctx.fillStyle = '#1e293b';
        roundRect(ctx, mockX, mockY, mockW, headerH, 32);
        ctx.fill();
        ctx.fillRect(mockX, mockY + 32, mockW, headerH - 32);

        // App Status Bar items: BMS logo, app title & live pulse dot
        ctx.fillStyle = scene.accentColor;
        ctx.beginPath();
        ctx.arc(mockX + 36, mockY + 32, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("BMS", mockX + 36, mockY + 37);

        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(scene.screenTitle, mockX + 62, mockY + 38);

        // Live badge on header
        const livePulse = Math.sin(time * 6) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(34, 197, 94, ${livePulse})`;
        ctx.beginPath();
        ctx.arc(mockX + mockW - 36, mockY + 32, 7, 0, Math.PI * 2);
        ctx.fill();

        // SCENE SPECIFIC DYNAMIC APP UI CONTENT
        const contentY = mockY + headerH + 14;
        const contentW = mockW - 32;
        const contentX = mockX + 16;

        if (scene.id === 1) {
            // SCENE 1: Modern App Home & 1-Tap Navigation with Exam Spotlight
            ctx.fillStyle = '#334155';
            roundRect(ctx, contentX, contentY, contentW, 46, 14);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '500 16px Inter, sans-serif';
            ctx.fillText("🔍 Search results, homework, fees, notices...", contentX + 18, contentY + 28);

            const tileW = (contentW - 16) / 2;
            const tileH = 88;
            const tiles = [
                { title: "Exam Results", sub: "Class 10 Term Results", icon: "🏆", color: "#a855f7", badge: "NEW" },
                { title: "Teacher Marks", sub: "Tabulation Entry", icon: "📝", color: "#38bdf8", badge: "FAST" },
                { title: "1-Click Fees", sub: "UPI & Instant Receipts", icon: "💳", color: "#10b981", badge: "0-QUE" },
                { title: "Attendance", sub: "98% Present Today", icon: "📊", color: "#f59e0b", badge: "LIVE" }
            ];

            tiles.forEach((tile, i) => {
                const tx = contentX + (i % 2) * (tileW + 16);
                const ty = contentY + 60 + Math.floor(i / 2) * (tileH + 12);
                
                const isHighlighted = (Math.floor(time * 2) % 4) === i;
                ctx.fillStyle = isHighlighted ? 'rgba(56, 189, 248, 0.16)' : '#1e293b';
                roundRect(ctx, tx, ty, tileW, tileH, 18);
                ctx.fill();
                ctx.strokeStyle = isHighlighted ? tile.color : 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = isHighlighted ? 2 : 1;
                ctx.stroke();

                ctx.font = '28px sans-serif';
                ctx.fillText(tile.icon, tx + 14, ty + 46);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Inter, sans-serif';
                ctx.fillText(tile.title, tx + 56, ty + 38);
                ctx.fillStyle = '#94a3b8';
                ctx.font = '500 13px Inter, sans-serif';
                ctx.fillText(tile.sub, tx + 56, ty + 60);

                // Little badge on tile
                ctx.fillStyle = tile.color;
                roundRect(ctx, tx + tileW - 46, ty + 10, 38, 18, 9);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(tile.badge, tx + tileW - 27, ty + 23);
                ctx.textAlign = 'left';
            });

            // Bottom animated Dock simulation
            const dockY = mockY + mockH - 68;
            ctx.fillStyle = '#1e293b';
            roundRect(ctx, contentX, dockY, contentW, 52, 16);
            ctx.fill();
            const dockItems = ["🏠 Home", "🏆 Results", "💳 Fees", "👤 Profile"];
            dockItems.forEach((d, i) => {
                const dx = contentX + (i * (contentW / 4)) + (contentW / 8);
                ctx.textAlign = 'center';
                ctx.fillStyle = i === 1 ? '#a855f7' : '#94a3b8';
                ctx.font = i === 1 ? 'bold 15px Inter, sans-serif' : '500 14px Inter, sans-serif';
                ctx.fillText(d, dx, dockY + 32);
            });
            ctx.textAlign = 'left';

        } else if (scene.id === 2) {
            // SCENE 2: EXAM RESULTS & DIGITAL MARKSHEET (Parent / Student View)
            ctx.fillStyle = '#1e293b';
            roundRect(ctx, contentX, contentY, contentW, 64, 16);
            ctx.fill();

            // Student avatar and rank
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(contentX + 36, contentY + 32, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("LR", contentX + 36, contentY + 37);
            ctx.textAlign = 'left';

            ctx.font = 'bold 17px Inter, sans-serif';
            ctx.fillText("Lalrinsanga • Class X (Roll 04)", contentX + 68, contentY + 28);
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.fillText("🏆 FINAL TERM EXAM • 1ST POSITION (93.0%)", contentX + 68, contentY + 48);

            // Detailed Marksheet Card
            const sheetY = contentY + 76;
            const sheetH = 176;
            ctx.fillStyle = '#0f172a';
            roundRect(ctx, contentX, sheetY, contentW, sheetH, 16);
            ctx.fill();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Marksheet Header row
            ctx.fillStyle = '#334155';
            roundRect(ctx, contentX, sheetY, contentW, 30, 16);
            ctx.fill();
            ctx.fillRect(contentX, sheetY + 16, contentW, 14);

            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText("SUBJECT", contentX + 16, sheetY + 20);
            ctx.textAlign = 'center';
            ctx.fillText("MARKS", contentX + contentW * 0.55, sheetY + 20);
            ctx.fillText("GRADE", contentX + contentW * 0.82, sheetY + 20);
            ctx.textAlign = 'left';

            // Subject rows
            const subjects = [
                { name: "Mathematics", marks: "96 / 100", grade: "A+", color: "#22c55e" },
                { name: "General Science", marks: "94 / 100", grade: "A+", color: "#22c55e" },
                { name: "English Language", marks: "89 / 100", grade: "A", color: "#38bdf8" },
                { name: "Mizo (Mother Tongue)", marks: "95 / 100", grade: "A+", color: "#22c55e" }
            ];

            subjects.forEach((sub, i) => {
                const rowY = sheetY + 54 + i * 28;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
                ctx.fillRect(contentX + 8, rowY - 18, contentW - 16, 26);

                ctx.font = '600 14px Inter, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(sub.name, contentX + 16, rowY);

                ctx.textAlign = 'center';
                ctx.font = 'bold 14px monospace';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(sub.marks, contentX + contentW * 0.55, rowY);

                ctx.font = 'bold 13px sans-serif';
                ctx.fillStyle = sub.color;
                ctx.fillText(sub.grade, contentX + contentW * 0.82, rowY);
                ctx.textAlign = 'left';
            });

            // Total Aggregate Score & Distinction Tag
            const totalY = sheetY + sheetH - 24;
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.fillStyle = '#a855f7';
            ctx.fillText("TOTAL: 465 / 500 (93%) • PASSED WITH DISTINCTION", contentX + 16, totalY);

            // 1-Click PDF Report Card Download Button (Prominent Action)
            const pdfBtnY = contentY + 264;
            const pdfGrad = ctx.createLinearGradient(contentX, pdfBtnY, contentX + contentW, pdfBtnY + 54);
            pdfGrad.addColorStop(0, '#7c3aed');
            pdfGrad.addColorStop(1, '#a855f7');
            ctx.fillStyle = pdfGrad;
            roundRect(ctx, contentX, pdfBtnY, contentW, 54, 16);
            ctx.fill();

            // Button glow pulse
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("📥 1-CLICK DOWNLOAD OFFICIAL REPORT CARD (PDF)", contentX + contentW / 2, pdfBtnY + 33);
            ctx.textAlign = 'left';

        } else if (scene.id === 3) {
            // SCENE 3: TEACHER MARKS ENTRY & TABULATION PORTAL
            ctx.fillStyle = '#1e293b';
            roundRect(ctx, contentX, contentY, contentW, 64, 16);
            ctx.fill();

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText("TEACHER WORKSPACE • EXAM TABULATION", contentX + 18, contentY + 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 17px Inter, sans-serif';
            ctx.fillText("Class X • Mathematics • Final Term Entry", contentX + 18, contentY + 48);

            // Marks entry table
            const entryY = contentY + 76;
            const entryH = 160;
            ctx.fillStyle = '#0f172a';
            roundRect(ctx, contentX, entryY, contentW, entryH, 16);
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Table Header
            ctx.fillStyle = '#334155';
            roundRect(ctx, contentX, entryY, contentW, 28, 14);
            ctx.fill();
            ctx.fillRect(contentX, entryY + 14, contentW, 14);

            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText("ROLL", contentX + 14, entryY + 18);
            ctx.fillText("STUDENT NAME", contentX + 60, entryY + 18);
            ctx.textAlign = 'right';
            ctx.fillText("MARKS (100)", contentX + contentW - 20, entryY + 18);
            ctx.textAlign = 'left';

            const students = [
                { roll: "01", name: "Albert Lalremruata", marks: "88", autoGrade: "A" },
                { roll: "02", name: "David Lalhmingmawia", marks: "92", autoGrade: "A+" },
                { roll: "03", name: "Grace Zothansangi", marks: "95", autoGrade: "A+" },
                { roll: "04", name: "Lalrinsanga", marks: "96", autoGrade: "A+" }
            ];

            students.forEach((st, i) => {
                const sY = entryY + 48 + i * 26;
                ctx.font = 'bold 13px monospace';
                ctx.fillStyle = '#f59e0b';
                ctx.fillText(st.roll, contentX + 16, sY);

                ctx.font = '600 13px Inter, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(st.name, contentX + 60, sY);

                // Auto calculated box
                ctx.fillStyle = '#1e293b';
                roundRect(ctx, contentX + contentW - 96, sY - 16, 78, 22, 6);
                ctx.fill();
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${st.marks} [${st.autoGrade}]`, contentX + contentW - 57, sY - 1);
                ctx.textAlign = 'left';
            });

            // 1-Click Publish Results Button
            const pubY = contentY + 248;
            ctx.fillStyle = '#d97706';
            roundRect(ctx, contentX, pubY, contentW, 50, 16);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("🚀 1-CLICK PUBLISH RESULTS TO ALL PARENTS", contentX + contentW / 2, pubY + 31);
            ctx.textAlign = 'left';

            const statY = contentY + 308;
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("✓ Class Average: 89.2% • Automatic Tabulation Broad-Sheet Ready", contentX + contentW / 2, statY);
            ctx.textAlign = 'left';

        } else if (scene.id === 4) {
            // SCENE 4: CASHLESS UPI FEES & LIVE ATTENDANCE
            ctx.fillStyle = '#1e293b';
            roundRect(ctx, contentX, contentY, contentW, 110, 18);
            ctx.fill();

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText("INSTANT SCHOOL & HOSTEL FEE PAYMENT", contentX + 18, contentY + 28);

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 32px Inter, sans-serif';
            ctx.fillText("₹ 2,450.00", contentX + 18, contentY + 68);

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.fillText("✓ Instant Stamped Receipt • UPI, GPay & PhonePe", contentX + 18, contentY + 94);

            const upiY = contentY + 126;
            ctx.fillStyle = '#065f46';
            roundRect(ctx, contentX, upiY, contentW, 54, 16);
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 17px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("⚡ 1-CLICK PAY VIA UPI / QR CODE", contentX + contentW / 2, upiY + 34);
            ctx.textAlign = 'left';

            // Attendance alert card
            const attY = contentY + 196;
            ctx.fillStyle = '#1e293b';
            roundRect(ctx, contentX, attY, contentW, 80, 16);
            ctx.fill();

            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText("✅", contentX + 18, attY + 48);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px Inter, sans-serif';
            ctx.fillText("Live Attendance Alert", contentX + 56, attY + 34);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '500 13px Inter, sans-serif';
            ctx.fillText("Lalrinsanga marked PRESENT at 8:45 AM • 98% Overall", contentX + 56, attY + 56);

        } else {
            // SCENE 5: Download & Start Using Today
            const iconY = contentY + 20;
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(contentX + contentW / 2, iconY + 50, 48, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 44px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("🏆", contentX + contentW / 2, iconY + 65);

            ctx.font = '900 24px Inter, sans-serif';
            ctx.fillText("BETHEL MISSION SCHOOL", contentX + contentW / 2, iconY + 130);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '600 16px Inter, sans-serif';
            ctx.fillText("Effortless Examination & Result Portal", contentX + contentW / 2, iconY + 156);

            const btnY = iconY + 180;
            ctx.fillStyle = '#f43f5e';
            roundRect(ctx, contentX + 20, btnY, contentW - 40, 56, 18);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 18px Inter, sans-serif';
            ctx.fillText("🌐 OPEN NOW: BMS04.COM", contentX + contentW / 2, btnY + 36);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText("Free Account • Works On Any Smartphone", contentX + contentW / 2, btnY + 84);
            ctx.textAlign = 'left';
        }

        // Floating Animated Interactive Cursor / Tap Finger
        const tapX = mockX + mockW * (0.3 + Math.sin(time * 3) * 0.25);
        const tapY = mockY + mockH * (0.45 + Math.cos(time * 2.5) * 0.15);
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(tapX, tapY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = scene.accentColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        const ripSize = (time * 4) % 1;
        ctx.strokeStyle = `rgba(56, 189, 248, ${1 - ripSize})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tapX, tapY, 12 + ripSize * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    // Draw Frame to 9:16 Canvas
    const drawCanvas = useCallback((time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const clampedTime = Math.min(Math.max(time, 0), DURATION_SECONDS);
        const scene = APP_SCENES.find(s => clampedTime >= s.start && clampedTime < s.end) || APP_SCENES[APP_SCENES.length - 1];
        const sceneTime = clampedTime - scene.start;
        const sceneProgress = Math.min(sceneTime / (scene.end - scene.start), 1);

        // 1. Dark Tech Background with Animated Grid
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.5, '#0b1120');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Tech grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Ambient glowing orb behind phone
        const orbX = width / 2 + Math.sin(clampedTime * 1.5) * 80;
        const orbY = height * 0.5 + Math.cos(clampedTime * 1.2) * 90;
        const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 280);
        orbGrad.addColorStop(0, `${scene.accentColor}33`);
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Top Reel Header
        ctx.save();
        
        // Progress bar at very top
        const progWidth = (clampedTime / DURATION_SECONDS) * width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, 0, width, 8);
        const progGrad = ctx.createLinearGradient(0, 0, width, 0);
        progGrad.addColorStop(0, '#38bdf8');
        progGrad.addColorStop(0.5, '#a855f7');
        progGrad.addColorStop(1, '#f43f5e');
        ctx.fillStyle = progGrad;
        ctx.fillRect(0, 0, progWidth, 8);

        // Watermark & Timecode
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText("BETHEL APP • REEL AD", 24, 42);

        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(`00:${String(Math.floor(clampedTime)).padStart(2, '0')} / 00:30`, width - 24, 42);

        // Voiceover On Indicator
        if (voiceoverBufferRef.current && !isMuted) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
            roundRect(ctx, width - 260, 20, 95, 30, 15);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("🎙️ VOICEOVER", width - 212, 40);
        }

        // 3. Main Headlines
        ctx.textAlign = 'center';

        // Scene Badge Pill
        const badgeY = height * 0.08;
        ctx.font = 'bold 20px Inter, sans-serif';
        const badgeText = scene.badge;
        const textMetrics = ctx.measureText(badgeText);
        const pillW = textMetrics.width + 40;
        const pillH = 38;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, (width - pillW) / 2, badgeY - 26, pillW, pillH, 19);
        ctx.fill();
        ctx.strokeStyle = scene.accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = scene.accentColor;
        ctx.fillText(badgeText, width / 2, badgeY);

        // Big Headline
        const headY = height * 0.15;
        ctx.font = '900 48px Inter, Montserrat, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        wrapText(ctx, scene.headline, width / 2, headY, width * 0.9, 54);
        ctx.shadowColor = 'transparent';

        // Subline
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(scene.subline, width / 2, height * 0.24);

        // 4. Center Interactive App UI Mockup
        drawAppScreenMockup(ctx, scene, sceneProgress, clampedTime, width, height);

        // 5. Bottom Callout / Action Bar
        const bottomY = height * 0.83;
        const ctaW = width * 0.88;
        const ctaH = 74;
        const ctaX = (width - ctaW) / 2;

        const ctaGrad = ctx.createLinearGradient(ctaX, bottomY, ctaX + ctaW, bottomY + ctaH);
        ctaGrad.addColorStop(0, scene.accentColor);
        ctaGrad.addColorStop(1, '#0284c7');

        ctx.shadowColor = scene.accentColor;
        ctx.shadowBlur = 24;
        ctx.fillStyle = ctaGrad;
        roundRect(ctx, ctaX, bottomY, ctaW, ctaH, 37);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 28px Inter, sans-serif';
        ctx.fillText(scene.bottomCta, width / 2, bottomY + 47);

        // Footer App download link
        ctx.font = '600 22px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText("📲 Visit bms04.com on your phone • Install in 1-Click", width / 2, height * 0.94);

        ctx.restore();
    }, [isMuted]);

    // Main animation loop
    useEffect(() => {
        const render = (timestamp: number) => {
            if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
            const delta = (timestamp - lastTimestampRef.current) / 1000;
            lastTimestampRef.current = timestamp;

            if (isPlaying) {
                setCurrentTime(prev => {
                    const next = prev + delta;
                    if (next >= DURATION_SECONDS) {
                        // Loop restart: also restart voiceover
                        playVoiceoverAt(0);
                        return 0;
                    }
                    return next;
                });
            }

            drawCanvas(currentTime);
            playSynthTick(currentTime);

            const sIdx = APP_SCENES.findIndex(s => currentTime >= s.start && currentTime < s.end);
            if (sIdx !== -1 && sIdx !== activeSceneIndex) {
                setActiveSceneIndex(sIdx);
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, currentTime, drawCanvas, playSynthTick, activeSceneIndex, playVoiceoverAt]);

    // Jump to specific scene
    const handleSeekToScene = (scene: AppScene) => {
        initAudio();
        setCurrentTime(scene.start);
        if (isPlaying) {
            playVoiceoverAt(scene.start);
        }
    };

    // Toggle Play / Pause
    const handleTogglePlay = () => {
        initAudio();
        if (isPlaying) {
            stopVoiceoverPlayback();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            playVoiceoverAt(currentTime);
        }
    };

    // Toggle Sound
    const handleToggleMute = () => {
        initAudio();
        setIsMuted(!isMuted);
    };

    // Restart
    const handleRestart = () => {
        initAudio();
        setCurrentTime(0);
        setIsPlaying(true);
        playVoiceoverAt(0);
    };

    // Export & Download Video with Voiceover Track Baked In
    const handleExportVideo = async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            alert("Video canvas not ready.");
            return;
        }

        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) {
            alert("Audio context not initialized.");
            return;
        }

        setIsPlaying(false);
        stopVoiceoverPlayback();
        setCurrentTime(0);
        setIsRecording(true);
        setRecordingProgress(0);
        setDownloadUrl(null);

        try {
            // Ensure mediaDest exists and both gain buses are connected
            if (!mediaDestRef.current) {
                mediaDestRef.current = ctx.createMediaStreamDestination();
                if (voiceoverGainRef.current) voiceoverGainRef.current.connect(mediaDestRef.current);
                if (musicGainRef.current) musicGainRef.current.connect(mediaDestRef.current);
            }

            // Capture canvas video at 30 fps
            const canvasStream = canvas.captureStream(30);

            // Get combined audio track (Voiceover + Music)
            const audioTracks = mediaDestRef.current.stream.getAudioTracks();

            // Combined Stream containing both video and audio
            const combinedStream = new MediaStream();
            canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
            if (audioTracks.length > 0) {
                combinedStream.addTrack(audioTracks[0]);
            } else {
                console.warn("No audio track detected from mediaDestRef");
            }

            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : MediaRecorder.isTypeSupported('video/webm')
                ? 'video/webm'
                : 'video/mp4';

            const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 6000000 });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const completeBlob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(completeBlob);
                setDownloadUrl(url);
                setIsRecording(false);

                const a = document.createElement('a');
                a.href = url;
                a.download = `Bethel_App_Exam_Results_Reel_Ad_${selectedLanguage.toUpperCase()}_${new Date().toISOString().split('T')[0]}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            // Start recorder
            recorder.start();

            // Start video playback from 0
            setIsPlaying(true);
            // Start voiceover playback directly from 0 so it records into mediaDest
            playVoiceoverAt(0);

            let recordedSeconds = 0;
            const recordInterval = setInterval(() => {
                recordedSeconds += 1;
                setRecordingProgress(Math.min(Math.round((recordedSeconds / DURATION_SECONDS) * 100), 100));

                if (recordedSeconds >= DURATION_SECONDS) {
                    clearInterval(recordInterval);
                    recorder.stop();
                    stopVoiceoverPlayback();
                    setIsPlaying(false);
                }
            }, 1000);
        } catch (err: any) {
            console.error("Recording error:", err);
            alert("Could not start video export: " + (err.message || "Browser error"));
            setIsRecording(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            <span>Exam & Result Management Spotlight • Facebook & Instagram Reels</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                            30-Second Exam & Result Ad Video
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                            Highlights how easily Bethel Mission School handles <strong className="text-purple-400">examinations, marks entry, auto-tabulation, and instant 1-click digital report cards</strong> with <strong className="text-emerald-400">spoken voiceover audio baked into the media file</strong>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExportVideo}
                            disabled={isRecording || isGeneratingVoice}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
                                isRecording 
                                ? 'bg-amber-600 text-white animate-pulse' 
                                : isGeneratingVoice
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white hover:shadow-purple-900/40'
                            }`}
                        >
                            <Download className="w-4 h-4" />
                            <span>
                                {isRecording 
                                    ? `Recording Media File... (${recordingProgress}%)` 
                                    : isGeneratingVoice
                                    ? 'Generating Voiceover...'
                                    : 'Export 30s Exam Ad (With Voiceover)'}
                            </span>
                        </button>

                        <Link
                            to="/portal/dashboard"
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-700 transition"
                        >
                            <LayoutDashboard className="w-4 h-4 text-sky-400" />
                            <span>Open App Portal</span>
                        </Link>
                    </div>
                </div>

                {/* Main Studio Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: 9:16 Interactive Reel Player Phone Mockup */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="w-full max-w-[360px] bg-slate-900 border-4 border-slate-800 rounded-[44px] p-3.5 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                            {/* Phone Speaker Notch */}
                            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900 rounded-full mr-2"></div>
                                <div className="w-10 h-1.5 bg-slate-700 rounded-full"></div>
                            </div>

                            {/* Canvas 9:16 Viewport */}
                            <div className="relative aspect-[9/16] w-full bg-black rounded-[32px] overflow-hidden shadow-inner group">
                                <canvas
                                    ref={canvasRef}
                                    width={720}
                                    height={1280}
                                    className="w-full h-full object-cover"
                                />

                                {/* Interactive Overlay Controls */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                                {/* Top Right Sound Toggle */}
                                <button
                                    type="button"
                                    onClick={handleToggleMute}
                                    className="absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition cursor-pointer"
                                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                                </button>

                                {/* Center Play/Pause button on hover/tap */}
                                <button
                                    type="button"
                                    onClick={handleTogglePlay}
                                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                                >
                                    <div className="p-4 bg-black/70 rounded-full backdrop-blur-md text-white shadow-xl hover:scale-110 transition-transform">
                                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                                    </div>
                                </button>

                                {/* Instagram / Facebook Reel Simulation Overlays */}
                                <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex items-end justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center font-bold text-[10px] text-white">
                                                BMS
                                            </div>
                                            <span className="font-bold text-xs text-white drop-shadow">bethel.app</span>
                                            <span className="text-[9px] bg-purple-500/80 text-white px-1.5 py-0.5 rounded font-bold">Exam Results</span>
                                        </div>
                                        <p className="text-[10px] text-white/90 line-clamp-1 drop-shadow">
                                            Bethel Mission School App • Instant exam results, marks & report cards
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                                        {currentTime.toFixed(1)}s / 30s
                                    </div>
                                </div>
                            </div>

                            {/* Player Physical Controls */}
                            <div className="mt-4 px-2 flex items-center justify-between gap-2 text-slate-300">
                                <button
                                    type="button"
                                    onClick={handleTogglePlay}
                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRestart}
                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                                    title="Replay from 00:00"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleToggleMute}
                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                                    <span>{isMuted ? 'Muted' : 'Audio On'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Direct Download Link after export */}
                        {downloadUrl && (
                            <div className="mt-4 w-full max-w-[360px] p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2">
                                <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span>30s Exam Ad Video File Ready with Voiceover!</span>
                                </p>
                                <a
                                    href={downloadUrl}
                                    download={`Bethel_App_Exam_Results_Reel_Ad_${selectedLanguage.toUpperCase()}_${new Date().toISOString().split('T')[0]}.webm`}
                                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Video File (.webm / .mp4)</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Scene Breakdown, Voiceover Studio, Controls */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Voiceover Audio Studio Card */}
                        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-white text-base">Voiceover Audio Studio</h3>
                                        <p className="text-xs text-slate-400">Exam-focused narration baked directly into the exported media file.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                        <span>{voiceoverStatus}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Voiceover Controls Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Language selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                        <Radio className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Narration Language</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('en');
                                                loadVoiceover('en', selectedVoice);
                                            }}
                                            disabled={isGeneratingVoice}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                selectedLanguage === 'en'
                                                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                            }`}
                                        >
                                            🇬🇧 English (Exam Focus)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('mizo');
                                                loadVoiceover('mizo', selectedVoice);
                                            }}
                                            disabled={isGeneratingVoice}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                selectedLanguage === 'mizo'
                                                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                            }`}
                                        >
                                            🇲🇿 Mizo Tawng (Exam Focus)
                                        </button>
                                    </div>
                                </div>

                                {/* AI Voice Tone selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        <span>AI Voice Character</span>
                                    </label>
                                    <select
                                        value={selectedVoice}
                                        onChange={(e) => {
                                            const v = e.target.value as any;
                                            setSelectedVoice(v);
                                            loadVoiceover(selectedLanguage, v);
                                        }}
                                        disabled={isGeneratingVoice}
                                        aria-label="Select AI Voice Character"
                                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                    >
                                        <option value="Kore">Kore (Clear, Professional Female)</option>
                                        <option value="Fenrir">Fenrir (Deep, Confident Male)</option>
                                        <option value="Puck">Puck (Upbeat, Energetic Male)</option>
                                        <option value="Zephyr">Zephyr (Warm, Articulate Female)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Volume Mix Sliders */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                            <Mic className="w-3 h-3 text-purple-400" />
                                            <span>Voiceover Level:</span>
                                        </span>
                                        <span className="font-mono text-purple-400 font-bold">{Math.round(voiceoverVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1.5"
                                        step="0.05"
                                        value={voiceoverVolume}
                                        onChange={(e) => setVoiceoverVolume(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                            <Music className="w-3 h-3 text-sky-400" />
                                            <span>Background Beat Level:</span>
                                        </span>
                                        <span className="font-mono text-sky-400 font-bold">{Math.round(musicVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.8"
                                        step="0.02"
                                        value={musicVolume}
                                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons: Regenerate, Solo Test, Upload Custom Voice */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleToggleSoloVoiceover}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        {isPlayingVoiceoverSolo ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5 text-purple-400" />}
                                        <span>{isPlayingVoiceoverSolo ? 'Stop VO Solo' : 'Listen VO Solo'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => loadVoiceover(selectedLanguage, selectedVoice)}
                                        disabled={isGeneratingVoice}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingVoice ? 'animate-spin' : ''}`} />
                                        <span>Re-synthesize Voice</span>
                                    </button>
                                </div>

                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleVoiceoverFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                                        title="Upload an MP3 or WAV file recorded by school staff"
                                    >
                                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Upload Staff Voice (.mp3/.wav)</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 5-Scene Timeline Selector */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white text-base flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-400" />
                                    <span>30-Second Exam & Result Ad Timeline</span>
                                </h3>
                                <span className="text-xs font-mono text-purple-400 bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 rounded-full">
                                    Active: Scene {activeSceneIndex + 1} of 5
                                </span>
                            </div>

                            {/* 5 Scene Timeline Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {APP_SCENES.map((scene, idx) => {
                                    const isActive = activeSceneIndex === idx;
                                    return (
                                        <button
                                            key={scene.id}
                                            type="button"
                                            onClick={() => handleSeekToScene(scene)}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                isActive
                                                ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/30'
                                                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 mb-1">
                                                <span>0{scene.start}s - 0{scene.end}s</span>
                                                <span 
                                                    className="w-2 h-2 rounded-full" 
                                                    style={{ backgroundColor: scene.accentColor }}
                                                />
                                            </div>
                                            <div className="text-xs font-bold text-white line-clamp-1">{scene.title}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Scene Highlights */}
                            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Scene {activeSceneIndex + 1} Featured Functionality
                                    </span>
                                    <span 
                                        className="text-[11px] font-bold px-2 py-0.5 rounded"
                                        style={{ backgroundColor: `${APP_SCENES[activeSceneIndex].accentColor}33`, color: APP_SCENES[activeSceneIndex].accentColor }}
                                    >
                                        {APP_SCENES[activeSceneIndex].badge}
                                    </span>
                                </div>
                                <h4 className="text-lg font-extrabold text-white">{APP_SCENES[activeSceneIndex].headline}</h4>
                                <p className="text-xs text-purple-300 font-medium">{APP_SCENES[activeSceneIndex].subline}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
                                    {APP_SCENES[activeSceneIndex].appFeatures.map((feat, i) => (
                                        <div key={i} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span>{feat.icon}</span>
                                                <span className="line-clamp-1">{feat.label}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-tight">{feat.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Script & Meta Ads Resource Tabs */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                            <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('preview')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        activeTab === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Shot Breakdown
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('script')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        activeTab === 'script' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    English Script
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('mizo')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        activeTab === 'mizo' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Mizo Script
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('meta-ads')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        activeTab === 'meta-ads' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Reel Ad Copy & Kit
                                </button>
                            </div>

                            <div className="p-5">
                                {activeTab === 'preview' && (
                                    <div className="space-y-3">
                                        <div className="text-xs text-slate-400">
                                            The 30-second ad sequence strongly showcases examination workflows and instant result transparency:
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                                                <span className="font-mono text-sky-400">[00:00 - 00:06]</span>
                                                <span className="text-slate-200 font-medium">Sleek Home UI & instant 1-tap navigation dock with Exam badge</span>
                                                <span className="text-sky-400 font-bold">Scene 1</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                                                <span className="font-mono text-purple-400">[00:06 - 00:12]</span>
                                                <span className="text-slate-200 font-medium">Student Marksheet: Math 96, Science 94, Rank #1 & 1-Click PDF Report Card</span>
                                                <span className="text-purple-400 font-bold">Scene 2 (Spotlight)</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                                                <span className="font-mono text-amber-400">[00:12 - 00:18]</span>
                                                <span className="text-slate-200 font-medium">Teacher Exam Portal: Rapid marks entry, auto-grading & 1-click publish</span>
                                                <span className="text-amber-400 font-bold">Scene 3 (Spotlight)</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                                                <span className="font-mono text-emerald-400">[00:18 - 00:24]</span>
                                                <span className="text-slate-200 font-medium">10-Second UPI fee payment & daily attendance notifications</span>
                                                <span className="text-emerald-400 font-bold">Scene 4</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                                                <span className="font-mono text-rose-400">[00:24 - 00:30]</span>
                                                <span className="text-slate-200 font-medium">Open bms04.com and install app on phone home screen</span>
                                                <span className="text-rose-400 font-bold">Scene 5</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'script' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">English Voiceover Script (Exact 30 Seconds)</h4>
                                                <p className="text-xs text-slate-400">Paced for clear, energetic tech commercial audio emphasizing exam results.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(ENGLISH_VOICEOVER_TEXT, 'en_script')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition cursor-pointer"
                                            >
                                                {copiedKey === 'en_script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedKey === 'en_script' ? 'Copied' : 'Copy Script'}</span>
                                            </button>
                                        </div>

                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-sm text-slate-200 leading-relaxed font-mono">
                                            <p><span className="text-sky-400">[00:00 - 00:06]</span> "Managing school exams and results has never been this easy! Meet the all new Bethel Mission School app."</p>
                                            <p><span className="text-purple-400">[00:06 - 00:12]</span> "Parents and students get instant exam results with subject breakdowns, grades, and official PDF report cards in one click!"</p>
                                            <p><span className="text-amber-400">[00:12 - 00:18]</span> "Teachers can enter marks with automatic tabulation in seconds."</p>
                                            <p><span className="text-emerald-400">[00:18 - 00:24]</span> "Plus cashless UPI fees and live attendance."</p>
                                            <p><span className="text-rose-400">[00:24 - 00:30]</span> "Open bms04.com and experience seamless result management today!"</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'mizo' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Mizo Voiceover Script (Exact 30 Seconds)</h4>
                                                <p className="text-xs text-slate-400">Natural Mizo tawng focused on exam results and report cards.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(MIZO_VOICEOVER_TEXT, 'mizo_script')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 rounded-lg transition cursor-pointer"
                                            >
                                                {copiedKey === 'mizo_script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedKey === 'mizo_script' ? 'Copied' : 'Copy Script'}</span>
                                            </button>
                                        </div>

                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-sm text-slate-200 leading-relaxed font-mono">
                                            <p><span className="text-sky-400">[00:00 - 00:06]</span> "Exam marksheet leh result buaipui a hahthlak thin em? Bethel Mission School App hmangin exam leh result management hi a awlsam tawh lutuk!"</p>
                                            <p><span className="text-purple-400">[00:06 - 00:12]</span> "Nu leh pa leh zirlaite'n exam result, subject tin mark, grade, leh report card official an phone atangin 1-click-in an download thei nghal!"</p>
                                            <p><span className="text-amber-400">[00:12 - 00:18]</span> "Zirtirtute tan mark chhut luh leh tabulation a awlsam em em bawk."</p>
                                            <p><span className="text-emerald-400">[00:18 - 00:24]</span> "School fee pawh UPI hmangin second reilote chhungin a pek theih bawk e."</p>
                                            <p><span className="text-rose-400">[00:24 - 00:30]</span> "bms04.com-ah lut la, result en ve nghal rawh le!"</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'meta-ads' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Facebook & Instagram Reels Ad Copy (Exam Focus)</h4>
                                                <p className="text-xs text-slate-400">Optimized for high engagement among parents and educators.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(
                                                    `🏆 No more waiting for paper marksheets! Get your child's exam results instantly on your phone.

The official Bethel Mission School App takes the stress out of examinations and result season. Parents, students, and teachers now have complete digital transparency at their fingertips!

✨ What makes Examination Management so effortless?
📊 Instant Exam Marksheets – Check subject marks, grades, and class rank in seconds
📥 1-Click Official Report Cards – Download stamped PDF progress reports straight to your phone
📝 Teacher Auto-Tabulation – Teachers input marks rapidly with automatic totaling and rank calculation
🚀 1-Click Result Publishing – Results published instantly to parents without paperwork delays
💳 Bonus: Pay school & hostel fees via UPI and track live daily attendance

👉 Experience the app today: https://bms04.com
Works seamlessly on any Android, iPhone, or Web browser!

#BethelMissionSchool #ExamResults #ReportCard #Champhai #Mizoram #SchoolApp #ParentPortal #SmartSchool`,
                                                    'meta_copy'
                                                )}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition cursor-pointer"
                                            >
                                                {copiedKey === 'meta_copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedKey === 'meta_copy' ? 'Copied' : 'Copy Ad Text'}</span>
                                            </button>
                                        </div>

                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 whitespace-pre-line font-sans">
                                            <p className="font-bold text-white text-sm">🏆 No more waiting for paper marksheets! Get your child's exam results instantly on your phone.</p>
                                            <p>The official Bethel Mission School App takes the stress out of examinations and result season. Parents, students, and teachers now have complete digital transparency at their fingertips!</p>
                                            
                                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                                                <div>📊 Instant Exam Marksheets – Check subject marks, grades & class rank</div>
                                                <div>📥 1-Click Official Report Cards – Download stamped PDF progress reports</div>
                                                <div>📝 Teacher Auto-Tabulation – Fast mark input with automatic totals & ranks</div>
                                                <div>🚀 1-Click Result Publishing – No more paper delays or manual registers</div>
                                                <div>💳 1-Click UPI Fee Payments & Live Daily Attendance Tracking</div>
                                            </div>

                                            <p className="text-purple-300 font-semibold">👉 Experience the app today: https://bms04.com</p>
                                            <p className="text-slate-400 text-[11px]">Recommended Meta Ad Settings: Objective: Traffic / Video Views • Target: Parents & Teachers in Mizoram • CTA: "Use App" or "Learn More"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Feature Summary Tiles */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3.5 bg-slate-900 border border-purple-500/30 rounded-xl text-center">
                                <div className="text-xl mb-1">🏆</div>
                                <div className="font-bold text-xs text-white">Instant Marksheet</div>
                                <div className="text-[11px] text-purple-400">Class Rank & Grades</div>
                            </div>
                            <div className="p-3.5 bg-slate-900 border border-purple-500/30 rounded-xl text-center">
                                <div className="text-xl mb-1">📥</div>
                                <div className="font-bold text-xs text-white">PDF Report Cards</div>
                                <div className="text-[11px] text-purple-400">1-Click Download</div>
                            </div>
                            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                <div className="text-xl mb-1">📝</div>
                                <div className="font-bold text-xs text-white">Auto Tabulation</div>
                                <div className="text-[11px] text-slate-400">Rapid Teacher Entry</div>
                            </div>
                            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                <div className="text-xl mb-1">💳</div>
                                <div className="font-bold text-xs text-white">UPI Fee Pay</div>
                                <div className="text-[11px] text-slate-400">Instant PDF Receipts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoVideoPage;
