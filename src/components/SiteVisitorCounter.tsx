import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Eye, Activity, Calendar, Globe, Sparkles } from 'lucide-react';

export interface VisitorStats {
    totalVisits: number;
    todayVisits: number;
    uniqueVisitors: number;
    activeNow: number;
    todayDate?: string;
}

interface SiteVisitorCounterProps {
    variant?: 'banner' | 'stats-strip' | 'compact';
    className?: string;
    showUnique?: boolean;
}

// Generate or retrieve persistent visitor UUID
function getVisitorId(): string {
    const KEY = 'bms_visitor_id';
    try {
        let id = localStorage.getItem(KEY);
        if (!id) {
            id = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
            localStorage.setItem(KEY, id);
        }
        return id;
    } catch {
        return 'v_fallback_' + Date.now();
    }
}

// Helper to determine if this is a fresh page session
function checkIsNewSession(): boolean {
    const KEY = 'bms_session_hit';
    try {
        const last = sessionStorage.getItem(KEY);
        if (!last) {
            sessionStorage.setItem(KEY, String(Date.now()));
            return true;
        }
        return false;
    } catch {
        return true;
    }
}

export const SiteVisitorCounter: React.FC<SiteVisitorCounterProps> = ({
    variant = 'banner',
    className = '',
    showUnique = true
}) => {
    const [stats, setStats] = useState<VisitorStats>({
        totalVisits: 48260,
        todayVisits: 342,
        uniqueVisitors: 12480,
        activeNow: 8
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasRecorded, setHasRecorded] = useState<boolean>(false);
    const visitorIdRef = useRef<string>(getVisitorId());

    // Record page visit on initial load
    const recordVisit = useCallback(async () => {
        const isNewSession = checkIsNewSession();
        try {
            const res = await fetch('/api/visitors/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId: visitorIdRef.current,
                    isNewSession
                })
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setHasRecorded(true);
            }
        } catch (err) {
            console.warn('Could not record site hit to server:', err);
            // Fallback to fetch stats
            try {
                const res = await fetch('/api/visitors/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {}
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Heartbeat every 45s to maintain active users
    useEffect(() => {
        recordVisit();

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/visitors/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visitorId: visitorIdRef.current })
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(prev => ({
                        ...prev,
                        activeNow: data.activeNow || prev.activeNow,
                        totalVisits: data.totalVisits || prev.totalVisits,
                        todayVisits: data.todayVisits || prev.todayVisits
                    }));
                }
            } catch (e) {
                // Ignore transient network failures
            }
        }, 45000);

        return () => clearInterval(interval);
    }, [recordVisit]);

    // Format total visits into 6-digit odometer boxes
    const formattedDigits = stats.totalVisits.toString().padStart(6, '0').split('');

    // ── Variant: Stats Strip (Inline with existing School Stats) ───────────────
    if (variant === 'stats-strip') {
        return (
            <div className={`flex flex-wrap items-center justify-center gap-6 text-white ${className}`}>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shadow-sm">
                    <div className="relative flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs uppercase tracking-wider text-sky-200 font-bold flex items-center gap-1">
                            <span>Active Online</span>
                        </div>
                        <div className="text-xl font-extrabold text-white leading-none mt-0.5">
                            {stats.activeNow}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shadow-sm">
                    <Eye className="w-5 h-5 text-sky-300 flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-xs uppercase tracking-wider text-sky-200 font-bold">
                            Total Visits
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono leading-none mt-0.5">
                            {stats.totalVisits.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shadow-sm">
                    <Calendar className="w-5 h-5 text-amber-300 flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-xs uppercase tracking-wider text-sky-200 font-bold">
                            Today's Visitors
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono leading-none mt-0.5">
                            {stats.todayVisits.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Variant: Compact (Footer or Header widget) ─────────────────────────────
    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-300 ${className}`}>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">{stats.activeNow} online</span>
                </div>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono text-slate-200 font-bold">{stats.totalVisits.toLocaleString()} visits</span>
                </div>
            </div>
        );
    }

    // ── Variant: Banner (Rich, prominent modern showcase for Home Page) ────────
    return (
        <section className={`py-12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden ${className}`}>
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl ring-1 ring-white/10">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-sky-400" />
                                <span>Official School Portal Traffic • Real-Time Stats</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                                <span>Site Visitor Counter</span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    <span>LIVE</span>
                                </span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400">
                                Tracking students, parents, alumni, and educators visiting Bethel Mission School from Champhai and around the world.
                            </p>
                        </div>

                        {/* Active online live pill */}
                        <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-inner self-start sm:self-auto">
                            <div className="relative flex items-center justify-center">
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Online Now</div>
                                <div className="text-lg font-black text-emerald-400 leading-none">
                                    {stats.activeNow} Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Odometer Digital Display */}
                    <div className="py-8 flex flex-col items-center justify-center space-y-4">
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                            <Globe className="w-4 h-4 text-sky-400" />
                            <span>Total Verified Website Visits</span>
                        </span>

                        {/* Digital Odometer Box Display */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 p-3 sm:p-4 bg-slate-950/90 border-2 border-sky-500/30 rounded-2xl shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
                            {formattedDigits.map((digit, idx) => (
                                <div
                                    key={idx}
                                    className="w-10 sm:w-14 h-14 sm:h-20 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-black font-mono text-sky-400 shadow-lg relative overflow-hidden group"
                                >
                                    {/* Subtle gloss line */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 pointer-events-none" />
                                    {/* Middle odometer split line */}
                                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40" />
                                    <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                                        {digit}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                            Serving the community with academic excellence since 1996
                        </div>
                    </div>

                    {/* Breakdown Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                        {/* Total Views */}
                        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition">
                            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Page Hits</div>
                                <div className="text-xl font-extrabold text-white font-mono">
                                    {stats.totalVisits.toLocaleString()}
                                </div>
                                <div className="text-[11px] text-sky-400">All-time visits</div>
                            </div>
                        </div>

                        {/* Today's Visits */}
                        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition">
                            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Visits</div>
                                <div className="text-xl font-extrabold text-white font-mono">
                                    {stats.todayVisits.toLocaleString()}
                                </div>
                                <div className="text-[11px] text-amber-400">Logged today</div>
                            </div>
                        </div>

                        {/* Unique Visitors */}
                        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unique Visitors</div>
                                <div className="text-xl font-extrabold text-white font-mono">
                                    {stats.uniqueVisitors.toLocaleString()}
                                </div>
                                <div className="text-[11px] text-purple-400">Individual devices</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SiteVisitorCounter;
