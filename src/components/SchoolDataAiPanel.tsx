import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Database,
  Users,
  IdCard,
  Briefcase,
  Building2,
  ClipboardList,
  Download,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  Maximize2,
} from 'lucide-react';
import { User } from '@/types';
import {
  buildSchoolAiSnapshot,
  SchoolAiSnapshotInput,
  SchoolDataScope,
} from '@/utils/aiDataSnapshot';

interface AiMetric {
  label: string;
  value: string;
  note?: string;
}

interface AiTable {
  title?: string;
  columns: string[];
  rows: string[][];
}

interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metrics?: AiMetric[];
  table?: AiTable | null;
  followUps?: string[];
  error?: string;
  timestamp: string;
}

interface SchoolDataAiPanelProps {
  snapshotInput: SchoolAiSnapshotInput;
  user: User;
  mode?: 'page' | 'drawer';
  onOpenFullPage?: () => void;
}

const STARTER_PROMPTS = [
  { label: 'Students with PEN', query: 'How many active students have a PEN number and how many are missing PEN?' },
  { label: 'Missing PEN by Class', query: 'Show a class-wise breakdown of active students missing a PEN number.' },
  { label: 'List Missing PEN Students', query: 'List all active students who do not have a PEN number assigned yet.' },
  { label: 'Enrollment & Gender', query: 'Give a class-wise student strength breakdown with male and female counts.' },
  { label: 'Fee Dues Summary', query: 'How many students have pending fee dues and what is the class-wise admission fee status?' },
  { label: 'Staff Breakdown', query: 'Summarize active teaching and non-teaching staff by department and designation.' },
  { label: 'Hostel Residents', query: 'How many hostel residents are active and how are they distributed across dormitories?' },
  { label: 'Pending Admissions', query: 'Summarize online and hostel admission applications by status and class.' },
  { label: 'Inventory Alerts', query: 'List school inventory items that need repair, are lost, or have low stock.' },
];

const csvEscape = (val: string) => {
  const str = String(val ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const renderFormattedText = (text: string) => {
  const lines = String(text || '').split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    const isBullet = /^[-*•]\s+/.test(trimmed);
    const cleanLine = isBullet ? trimmed.replace(/^[-*•]\s+/, '') : line;

    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g).map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={pIdx}>{part}</React.Fragment>;
    });

    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0" />
          <span className="leading-relaxed">{parts}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="leading-relaxed">
        {parts}
      </p>
    );
  });
};

const SchoolDataAiPanel: React.FC<SchoolDataAiPanelProps> = ({
  snapshotInput,
  user,
  mode = 'page',
  onOpenFullPage,
}) => {
  const [scope, setScope] = useState<SchoolDataScope>('current_year');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const snapshot = useMemo(
    () => buildSchoolAiSnapshot(snapshotInput, scope),
    [snapshotInput, scope]
  );

  const cyAgg = snapshot.aggregates.studentsCurrentYearActive;
  const staffAgg = snapshot.aggregates.staff;
  const admAgg = snapshot.aggregates.admissions;
  const hostelAgg = snapshot.aggregates.hostel;

  const pendingOnline = admAgg.onlineByStatus['pending'] || 0;
  const pendingHostel = admAgg.hostelByStatus['pending'] || 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const askQuestion = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? inputValue).trim();
    if (!question || isLoading) return;

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!rawQuestion) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/data-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          scope,
          schoolData: snapshot,
          history: updatedHistory.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }

      const aiMsg: AiMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No response generated.',
        metrics: Array.isArray(data.metrics) ? data.metrics : [],
        table: data.table || null,
        followUps: Array.isArray(data.followUps) ? data.followUps : [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: AiMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: '',
        error: err?.message || 'Unable to query school data. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = (table: AiTable) => {
    const header = table.columns.map(csvEscape).join(',');
    const body = table.rows.map(r => r.map(csvEscape).join(',')).join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(table.title || 'bms-data-export').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTable = async (msgId: string, table: AiTable) => {
    const tsv = [table.columns.join('\t'), ...table.rows.map(r => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedTableId(msgId);
      setTimeout(() => setCopiedTableId(null), 2000);
    } catch {
      // Clipboard fallback not needed
    }
  };

  const isDrawer = mode === 'drawer';

  return (
    <div className={`flex flex-col bg-white ${isDrawer ? 'h-full' : 'rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-h-[76vh]'}`}>
      {/* Header Controls & Scope */}
      <div className={`border-b border-slate-200 bg-gradient-to-r from-[#142B49] via-[#1b3a63] to-[#142B49] text-white ${isDrawer ? 'px-4 py-3.5' : 'px-6 py-5'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-300/30 flex items-center justify-center text-amber-300 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold tracking-tight ${isDrawer ? 'text-base' : 'text-xl sm:text-2xl'}`}>
                AI School Data Assistant
              </h2>
              <p className="text-xs text-slate-300">
                Ask natural questions across live students, PEN, fees, staff, hostel &amp; inventory ({user.displayName || user.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/15">
              <button
                type="button"
                onClick={() => setScope('current_year')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  scope === 'current_year' ? 'bg-white text-[#142B49] shadow-sm' : 'text-slate-200 hover:text-white'
                }`}
              >
                Session {snapshotInput.academicYear}
              </button>
              <button
                type="button"
                onClick={() => setScope('all_years')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  scope === 'all_years' ? 'bg-white text-[#142B49] shadow-sm' : 'text-slate-200 hover:text-white'
                }`}
              >
                All Sessions
              </button>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {isDrawer && onOpenFullPage && (
              <button
                type="button"
                onClick={onOpenFullPage}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-[#142B49] hover:bg-amber-300 transition"
                title="Open full workspace"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Data Coverage Summary Strip */}
        <div className={`grid gap-2 mt-3.5 ${isDrawer ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-5'}`}>
          <button
            type="button"
            onClick={() => askQuestion('Give a class-wise summary of active students for this session.')}
            className="text-left bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-2 transition"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-sky-300" />
              <span>Active Students</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">{cyAgg.total}</div>
          </button>

          <button
            type="button"
            onClick={() => askQuestion('How many students have a PEN number and how many are missing PEN by class?')}
            className="text-left bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-2 transition"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <IdCard className="w-3.5 h-3.5 text-amber-300" />
              <span>Students with PEN</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {cyAgg.withPen} <span className="text-xs font-medium text-amber-200">({cyAgg.penCoveragePercent}%)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => askQuestion('Summarize active staff by teaching/non-teaching and department.')}
            className="text-left bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-2 transition"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
              <span>Active Staff</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">{staffAgg.activeCount}</div>
          </button>

          <button
            type="button"
            onClick={() => askQuestion('Show hostel residents grouped by dormitory.')}
            className="text-left bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-2 transition"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-rose-300" />
              <span>Hostel Residents</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">{hostelAgg.activeResidents}</div>
          </button>

          <button
            type="button"
            onClick={() => askQuestion('List pending online and hostel admission applications.')}
            className={`text-left bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-2 transition ${isDrawer ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <ClipboardList className="w-3.5 h-3.5 text-violet-300" />
              <span>Pending Admissions</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">{pendingOnline + pendingHostel}</div>
          </button>
        </div>
      </div>

      {/* Chat Thread Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/70">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base mb-1.5">
                <Database className="w-5 h-5 text-sky-600" />
                <span>Live Database Ready ({snapshot.meta.includedStudentRows} student records in current view)</span>
              </div>
              <p className="text-sm text-slate-600">
                Ask any question about student IDs (PEN, Aadhaar, Student ID), class strength, gender/category demographics, unpaid fees, staff directory, hostel dormitories, admissions, TC records, or school inventory.
              </p>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Popular Queries — Click to Run
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => askQuestion(item.query)}
                      disabled={isLoading}
                      className="text-left text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 transition disabled:opacity-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-2xl bg-[#142B49] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm text-sm">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm p-4 sm:p-5 space-y-4">
                  {msg.error ? (
                    <div className="flex items-start gap-3 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Query could not be completed</p>
                        <p className="text-xs mt-1 text-red-600">{msg.error}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Metrics Grid */}
                      {msg.metrics && msg.metrics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                          {msg.metrics.map((metric, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                            >
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                {metric.label}
                              </div>
                              <div className="text-lg font-extrabold text-[#142B49] mt-0.5">
                                {metric.value}
                              </div>
                              {metric.note && (
                                <div className="text-[11px] text-slate-500 mt-0.5">{metric.note}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Prose */}
                      <div className="text-sm text-slate-700 space-y-1">
                        {renderFormattedText(msg.content)}
                      </div>

                      {/* Data Table */}
                      {msg.table && msg.table.rows.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-700">
                              {msg.table.title || 'Data Breakdown'} ({msg.table.rows.length} rows)
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyTable(msg.id, msg.table!)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition"
                              >
                                {copiedTableId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadCsv(msg.table!)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 border border-sky-200 rounded-md transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>CSV</span>
                              </button>
                            </div>
                          </div>
                          <div className="overflow-x-auto max-h-80">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                              <thead className="bg-slate-100 sticky top-0">
                                <tr>
                                  {msg.table.columns.map((col, cIdx) => (
                                    <th
                                      key={cIdx}
                                      className="px-3 py-2 text-left font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {msg.table.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50">
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className="px-3 py-2 text-slate-700 whitespace-nowrap"
                                      >
                                        {cell || '—'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Follow-up Prompts */}
                      {msg.followUps && msg.followUps.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Follow-up Questions
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.followUps.map((fq, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => askQuestion(fq)}
                                disabled={isLoading}
                                className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 transition disabled:opacity-50 text-left"
                              >
                                {fq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2.5 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              <span>Analyzing live school records...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Composer */}
      <form
        onSubmit={e => {
          e.preventDefault();
          askQuestion();
        }}
        className="border-t border-slate-200 bg-white p-3 sm:p-4"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask about PEN count, missing PENs, fees, class strength, staff, hostel..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B49] hover:bg-[#1e3d66] disabled:bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolDataAiPanel;
