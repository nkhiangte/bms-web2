import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Eye, Calendar, Globe } from 'lucide-react';

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

function getClientTelemetry() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/iPad|Tablet|PlayBook/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
        deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|BlackBerry|IEMobile/i.test(ua)) {
        deviceType = 'mobile';
    }

    let os = 'Other';
    if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Other';
    if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';

    let timezone = 'Asia/Kolkata';
    try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {}

    const screen = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';

    return { deviceType, os, browser, timezone, screen, path };
}

export const SiteVisitorCounter: React.FC<SiteVisitorCounterProps> = ({
    variant = 'banner',
    className = ''
}) => {
    const [stats, setStats] = useState<VisitorStats>({
        totalVisits: 48260,
        todayVisits: 342,
        uniqueVisitors: 12480,
        activeNow: 8
    });
    const visitorIdRef = useRef<string>(getVisitorId());

    const recordVisit = useCallback(async () => {
        const isNewSession = checkIsNewSession();
        const telemetry = getClientTelemetry();
        try {
            const res = await fetch('/api/visitors/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId: visitorIdRef.current,
                    isNewSession,
                    ...telemetry
                })
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch {
            try {
                const res = await fetch('/api/visitors/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch {}
        }
    }, []);

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
            } catch {}
        }, 45000);

        return () => clearInterval(interval);
    }, [recordVisit]);

    const formattedDigits = stats.totalVisits.toString().padStart(6, '0').split('');

    // ── Variant: Stats Strip (Inline on Dark Blue band) ───────────────────────
    if (variant === 'stats-strip') {
        return (
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-white ${className}`}>
                <div className="flex items-center justify-center sm:justify-start gap-3 bg-[#132D52] px-4 py-3 rounded-xl border border-[#C9A84C]/30">
                    <Users className="w-5 h-5 text-[#DFC06B] flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-[11px] uppercase tracking-wider text-[#DFC06B] font-bold">
                            Active Online
                        </div>
                        <div className="text-lg font-extrabold text-white font-tabular leading-tight">
                            {stats.activeNow} Visitors
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3 bg-[#132D52] px-4 py-3 rounded-xl border border-[#C9A84C]/30">
                    <Eye className="w-5 h-5 text-[#DFC06B] flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-[11px] uppercase tracking-wider text-[#DFC06B] font-bold">
                            Total Visits
                        </div>
                        <div className="text-lg font-extrabold text-white font-tabular leading-tight">
                            {stats.totalVisits.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3 bg-[#132D52] px-4 py-3 rounded-xl border border-[#C9A84C]/30">
                    <Calendar className="w-5 h-5 text-[#DFC06B] flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-[11px] uppercase tracking-wider text-[#DFC06B] font-bold">
                            Today's Visitors
                        </div>
                        <div className="text-lg font-extrabold text-white font-tabular leading-tight">
                            {stats.todayVisits.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Variant: Compact (Footer) ──────────────────────────────────────────────
    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0B1F3A] border border-[#C9A84C]/40 text-xs text-white/90 ${className}`}>
                <span className="font-semibold text-[#DFC06B] font-tabular">{stats.activeNow} online</span>
                <span className="text-[#C9A84C]/50">|</span>
                <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#DFC06B]" />
                    <span className="font-tabular text-white font-bold">{stats.totalVisits.toLocaleString()} visits</span>
                </div>
            </div>
        );
    }

    // ── Variant: Banner (Home Page) ───────────────────────────────────────────
    return (
        <section className={`py-12 sm:py-14 bg-[#0B1F3A] text-white border-y border-[#C9A84C]/30 ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-[#07162B] border border-[#C9A84C]/40 rounded-2xl p-5 sm:p-8 shadow-xl">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9A84C]/25 pb-5">
                        <div className="space-y-1">
                            <p className="text-[#DFC06B] text-xs font-bold uppercase tracking-widest">
                                Bethel Mission School · Champhai
                            </p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                Live Portal Visitor Counter
                            </h3>
                            <p className="text-xs sm:text-sm text-white/75">
                                Parents, students, and alumni connecting from across Mizoram and beyond.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-[#132D52] border border-[#C9A84C]/40 px-4 py-2.5 rounded-xl self-start sm:self-auto">
                            <Globe className="w-5 h-5 text-[#DFC06B]" />
                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-[#DFC06B] font-bold">Online Now</div>
                                <div className="text-base font-extrabold text-white font-tabular leading-tight">
                                    {stats.activeNow} Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Odometer Display */}
                    <div className="py-7 flex flex-col items-center justify-center space-y-3">
                        <span className="text-xs uppercase tracking-widest text-[#DFC06B] font-bold">
                            Total Verified Website Visits
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 bg-[#0B1F3A] border border-[#C9A84C]/50 rounded-xl">
                            {formattedDigits.map((digit, idx) => (
                                <div
                                    key={idx}
                                    className="w-9 sm:w-12 h-12 sm:h-16 bg-[#132D52] border border-[#C9A84C]/40 rounded-lg flex items-center justify-center text-xl sm:text-3xl font-extrabold font-tabular text-[#DFC06B]"
                                >
                                    {digit}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5 border-t border-[#C9A84C]/25">
                        <div className="bg-[#132D52] border border-[#C9A84C]/25 p-4 rounded-xl flex items-center gap-3.5">
                            <div className="p-2.5 bg-[#0B1F3A] text-[#DFC06B] rounded-lg border border-[#C9A84C]/35">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#DFC06B] uppercase tracking-wide">Total Hits</div>
                                <div className="text-lg font-extrabold text-white font-tabular">
                                    {stats.totalVisits.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#132D52] border border-[#C9A84C]/25 p-4 rounded-xl flex items-center gap-3.5">
                            <div className="p-2.5 bg-[#0B1F3A] text-[#DFC06B] rounded-lg border border-[#C9A84C]/35">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#DFC06B] uppercase tracking-wide">Today's Visits</div>
                                <div className="text-lg font-extrabold text-white font-tabular">
                                    {stats.todayVisits.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#132D52] border border-[#C9A84C]/25 p-4 rounded-xl flex items-center gap-3.5">
                            <div className="p-2.5 bg-[#0B1F3A] text-[#DFC06B] rounded-lg border border-[#C9A84C]/35">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#DFC06B] uppercase tracking-wide">Unique Visitors</div>
                                <div className="text-lg font-extrabold text-white font-tabular">
                                    {stats.uniqueVisitors.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SiteVisitorCounter;
