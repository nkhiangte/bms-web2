import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    Users, Eye, Smartphone, Monitor, Tablet, Globe, Calendar, Clock,
    RefreshCw, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck,
    Save, Filter, ArrowUpRight, Search, Activity, Sparkles
} from 'lucide-react';
import { User } from '@/types';

const { Link } = ReactRouterDOM as any;

interface VisitorLogEntry {
    id: string;
    timestamp: string;
    visitorId: string;
    ip?: string;
    country: string;
    countryCode: string;
    city: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    path: string;
    screen?: string;
}

interface AnalyticsData {
    totalVisits: number;
    todayVisits: number;
    uniqueVisitors: number;
    activeNow: number;
    todayDate: string;
    countries: Record<string, { count: number; code: string }>;
    devices: Record<string, number>;
    os: Record<string, number>;
    browsers: Record<string, number>;
    topPages: Record<string, number>;
    recentLogs: VisitorLogEntry[];
}

interface AdminVisitorAnalyticsPageProps {
    user: User;
}

// Country flag emoji helper
function getCountryFlag(code?: string): string {
    if (!code || code.length !== 2) return '🌐';
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Format relative time helper
function formatRelativeTime(iso: string): string {
    try {
        const diffMs = Date.now() - new Date(iso).getTime();
        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 45) return 'Just now';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d ago`;
    } catch {
        return 'Recently';
    }
}

const AdminVisitorAnalyticsPage: React.FC<AdminVisitorAnalyticsPageProps> = ({ user }) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Counter Baseline Editing Form state
    const [editTotalVisits, setEditTotalVisits] = useState<number>(0);
    const [editTodayVisits, setEditTodayVisits] = useState<number>(0);
    const [editUniqueVisitors, setEditUniqueVisitors] = useState<number>(0);

    // Filter and search state for logs
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop' | 'tablet'>('all');

    // Confirmation Modal for Resetting
    const [showResetModal, setShowResetModal] = useState<boolean>(false);

    const fetchAnalytics = async (isSilent: boolean = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            const res = await fetch('/api/admin/visitor-analytics');
            if (res.ok) {
                const json: AnalyticsData = await res.json();
                setData(json);
                setEditTotalVisits(json.totalVisits || 0);
                setEditTodayVisits(json.todayVisits || 0);
                setEditUniqueVisitors(json.uniqueVisitors || 0);
            } else {
                setErrorMessage('Failed to load visitor analytics from server.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error connecting to analytics endpoint.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        // Auto refresh telemetry every 30s
        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSaveBaseline = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const res = await fetch('/api/admin/visitor-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalVisits: Number(editTotalVisits),
                    todayVisits: Number(editTodayVisits),
                    uniqueVisitors: Number(editUniqueVisitors),
                })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setSuccessMessage('Visitor counter baseline updated successfully! Public website is now updated.');
                fetchAnalytics(true);
            } else {
                setErrorMessage(result.error || 'Failed to update counter.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error updating counter baseline.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetToZero = async () => {
        setIsSaving(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const res = await fetch('/api/admin/visitor-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToZero: true, clearLogs: false })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setShowResetModal(false);
                setSuccessMessage('Visitor counter has been reset to 0. It will now count only 100% strictly verified new visitors.');
                fetchAnalytics(true);
            } else {
                setErrorMessage(result.error || 'Failed to reset counter.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error resetting counter.');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate percentages for countries
    const countryList = useMemo(() => {
        if (!data?.countries) return [];
        const entries = Object.entries(data.countries) as [string, { count: number; code: string }][];
        const total = entries.reduce((sum, [, item]) => sum + (item?.count || 0), 0) || 1;
        return entries
            .map(([name, info]) => ({
                name,
                code: info.code,
                count: info.count,
                percentage: Math.round(((info.count || 0) / total) * 100)
            }))
            .sort((a, b) => b.count - a.count);
    }, [data?.countries]);

    // Calculate devices breakdown
    const deviceStats = useMemo(() => {
        if (!data?.devices) return { mobile: 0, desktop: 0, tablet: 0, total: 0 };
        const total = (data.devices.mobile || 0) + (data.devices.desktop || 0) + (data.devices.tablet || 0) || 1;
        return {
            mobile: Math.round(((data.devices.mobile || 0) / total) * 100),
            desktop: Math.round(((data.devices.desktop || 0) / total) * 100),
            tablet: Math.round(((data.devices.tablet || 0) / total) * 100),
            total
        };
    }, [data?.devices]);

    // Filter recent logs
    const filteredLogs = useMemo(() => {
        if (!data?.recentLogs) return [];
        return data.recentLogs.filter(log => {
            const matchesSearch = searchQuery === '' || 
                (log.country && log.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (log.city && log.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (log.browser && log.browser.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (log.os && log.os.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (log.path && log.path.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesDevice = deviceFilter === 'all' || log.deviceType === deviceFilter;
            return matchesSearch && matchesDevice;
        });
    }, [data?.recentLogs, searchQuery, deviceFilter]);

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
                <p className="text-slate-600 font-medium">Loading Visitor Analytics &amp; Telemetry...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Real-Time Tracking Active
                        </span>
                        <span className="text-xs text-slate-400">• Bethel Mission School</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-sky-600" />
                        <span>Website Visitor Analytics &amp; Counter</span>
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Monitor live visitors, device types, geographical locations, and manage the official home page visitor counter baseline.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setIsRefreshing(true);
                            fetchAnalytics();
                        }}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
                    </button>

                    <Link
                        to="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition"
                    >
                        <span>View Live on Site</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <span className="font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Hits */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Page Hits</span>
                        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
                        {data?.totalVisits?.toLocaleString() || 0}
                    </div>
                    <div className="mt-1 text-xs text-sky-600 font-medium">All-time website visits</div>
                </div>

                {/* Today's Visits */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Visits</span>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
                        {data?.todayVisits?.toLocaleString() || 0}
                    </div>
                    <div className="mt-1 text-xs text-amber-600 font-medium">Recorded today ({data?.todayDate})</div>
                </div>

                {/* Active Online Now */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Online Now</span>
                        <div className="relative p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute top-2.5 right-2.5" />
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-emerald-600 font-mono">
                        {data?.activeNow || 0} Online
                    </div>
                    <div className="mt-1 text-xs text-emerald-600 font-medium">Concurrent active browsing sessions</div>
                </div>

                {/* Unique Devices */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Devices</span>
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                            <Smartphone className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
                        {data?.uniqueVisitors?.toLocaleString() || 0}
                    </div>
                    <div className="mt-1 text-xs text-purple-600 font-medium">Distinct visitor devices</div>
                </div>
            </div>

            {/* ── SECTION 1: COUNTER BASELINE & CONTROL PANEL ── */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
                    <div>
                        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-sky-400" />
                            <span>Administrative Counter Configuration</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                            Adjust Counter Starting Baseline or Reset to 0
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                            Here you can adjust the public numbers to reflect official historical statistics (from Google Analytics, previous website hosting, etc.), or reset it to strictly count verified hits from 0.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition self-start md:self-center"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Counter to 0</span>
                    </button>
                </div>

                {/* Form to update values */}
                <form onSubmit={handleSaveBaseline} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Total Page Hits Baseline
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={editTotalVisits}
                            onChange={(e) => setEditTotalVisits(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="e.g. 48260"
                        />
                        <p className="text-[11px] text-slate-400">Total displayed on odometer</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Today's Visits Baseline
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={editTodayVisits}
                            onChange={(e) => setEditTodayVisits(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="e.g. 342"
                        />
                        <p className="text-[11px] text-slate-400">Count for today's date</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Unique Visitors Baseline
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={editUniqueVisitors}
                            onChange={(e) => setEditUniqueVisitors(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="e.g. 12480"
                        />
                        <p className="text-[11px] text-slate-400">Unique user machines</p>
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition shadow-lg disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{isSaving ? 'Saving Updates...' : 'Apply & Save Baseline'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* ── SECTION 2: GEOGRAPHY & DEVICE BREAKDOWN ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Geolocation / Country breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-sky-600" />
                            <h3 className="font-extrabold text-slate-900 text-lg">Visitors by Country</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">Global Distribution</span>
                    </div>

                    <div className="space-y-3.5">
                        {countryList.length === 0 ? (
                            <p className="text-sm text-slate-500 py-4 text-center">No country records yet.</p>
                        ) : (
                            countryList.slice(0, 7).map((c) => (
                                <div key={c.name} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                                            <span className="text-xl leading-none">{getCountryFlag(c.code)}</span>
                                            <span>{c.name}</span>
                                            {c.code === 'IN' && (
                                                <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold">
                                                    Mizoram &amp; India
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-slate-900">{c.count.toLocaleString()}</span>
                                            <span className="text-xs text-slate-400 ml-1.5">({c.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-sky-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(4, c.percentage))}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Device & Technology Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-extrabold text-slate-900 text-lg">Devices &amp; Platforms</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">User Environment</span>
                    </div>

                    {/* Device Bars */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <Smartphone className="w-6 h-6 text-sky-600 mx-auto" />
                            <div className="mt-2 text-xl font-black text-slate-900">{deviceStats.mobile}%</div>
                            <div className="text-xs font-semibold text-slate-500">Mobile Phone</div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <Monitor className="w-6 h-6 text-indigo-600 mx-auto" />
                            <div className="mt-2 text-xl font-black text-slate-900">{deviceStats.desktop}%</div>
                            <div className="text-xs font-semibold text-slate-500">Desktop / PC</div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <Tablet className="w-6 h-6 text-amber-600 mx-auto" />
                            <div className="mt-2 text-xl font-black text-slate-900">{deviceStats.tablet}%</div>
                            <div className="text-xs font-semibold text-slate-500">Tablet / iPad</div>
                        </div>
                    </div>

                    {/* Operating Systems */}
                    <div className="pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Operating Systems</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(data?.os || {}).map(([name, count]) => (
                                <span key={name} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <span>{name}:</span>
                                    <span className="font-mono font-bold text-slate-900">{count.toLocaleString()}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Browsers */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Browsers</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(data?.browsers || {}).map(([name, count]) => (
                                <span key={name} className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-xs font-semibold text-sky-800 flex items-center gap-1.5">
                                    <span>{name}:</span>
                                    <span className="font-mono font-bold text-sky-950">{count.toLocaleString()}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SECTION 3: LIVE RECENT VISITORS LOG TABLE ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                            <span>Live Visitor Logs</span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                {filteredLogs.length} Records
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Recent user visits with device types, browser, and geographic location.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search country, city, browser..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 sm:w-60"
                            />
                        </div>

                        {/* Device filter buttons */}
                        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                            {(['all', 'mobile', 'desktop'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setDeviceFilter(filter)}
                                    className={`px-3 py-1 rounded-lg capitalize font-bold transition ${
                                        deviceFilter === filter
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                <th className="py-3.5 px-4">Time</th>
                                <th className="py-3.5 px-4">Country &amp; Region</th>
                                <th className="py-3.5 px-4">Device / OS</th>
                                <th className="py-3.5 px-4">Browser</th>
                                <th className="py-3.5 px-4">Page Visited</th>
                                <th className="py-3.5 px-4 text-right">Visitor ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">
                                        No recent visitor logs match your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.slice(0, 50).map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{formatRelativeTime(log.timestamp)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base leading-none">{getCountryFlag(log.countryCode)}</span>
                                                <span>{log.country || 'India'}</span>
                                                <span className="text-[11px] text-slate-400 font-normal">
                                                    ({log.city || 'Mizoram'})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {log.deviceType === 'mobile' ? (
                                                    <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                                                ) : log.deviceType === 'tablet' ? (
                                                    <Tablet className="w-3.5 h-3.5 text-amber-600" />
                                                ) : (
                                                    <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                                                )}
                                                <span className="capitalize font-bold text-slate-700">{log.deviceType}</span>
                                                <span className="text-slate-400">• {log.os}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                                                {log.browser}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-sky-700 whitespace-nowrap font-medium">
                                            {log.path || '/'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                                            {log.visitorId.slice(0, 12)}...
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset to Zero Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 rounded-full bg-rose-100">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Reset Visitor Counter?</h3>
                        </div>

                        <p className="text-sm text-slate-600">
                            This will reset the total visitor counter and today's counter to <strong>0</strong>. 
                            From now on, only 100% strictly verified hits from new website visitors will be tallied.
                        </p>

                        <div className="flex justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowResetModal(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleResetToZero}
                                disabled={isSaving}
                                className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20"
                            >
                                {isSaving ? 'Resetting...' : 'Yes, Reset to 0'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVisitorAnalyticsPage;
