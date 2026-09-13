import React, { useEffect, useState } from 'react';
import { Play, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';

interface CaseDetailsViewProps {
  selectedCaseId: number | null;
  onSelectCase: (id: number) => void;
  setActiveTab: (tab: string) => void;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({ selectedCaseId, onSelectCase, setActiveTab }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningWorkflow, setRunningWorkflow] = useState<boolean>(false);
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});

  const loadCases = async () => {
    setLoading(true);
    try {
      const caseList = await api.getCases();
      setCases(caseList);

      const targetId = selectedCaseId || (caseList.length > 0 ? caseList[0].id : null);
      if (targetId) {
        onSelectCase(targetId);
        const detail = await api.getCase(targetId);
        setActiveCase(detail);
        const evs = await api.getCaseEvents(targetId);
        setEvents(evs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [selectedCaseId]);

  const handleRunWorkflow = async (caseId: number) => {
    setRunningWorkflow(true);
    try {
      await api.runAgentOnCase(caseId);
      await loadCases();
      setActiveTab('trace');
    } catch (e) {
      console.error(e);
    } finally {
      setRunningWorkflow(false);
    }
  };

  const toggleEventExpand = (id: number) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-slate-800 text-slate-200 border-slate-700';
    }
    if (status === 'resolved') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (status === 'escalated') {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (status === 'awaiting_approval') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-1">
            Audit Trail &bull; Incident Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
            Case Resolution Tracker
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-slate-600 mt-1">
            Audit real-time transactional resolution events, state transitions, and database ledger verifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case List Sidebar (4 cols) */}
        <div className="lg:col-span-4 rounded-lg border border-slate-200/90 p-4 bg-white shadow-subtle space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-slate-800">
              Logged Cases
            </span>
            <span className="font-mono text-xs text-slate-500">{cases.length} Total</span>
          </div>

          {loading ? (
            <div className="space-y-2 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-md bg-slate-100 skeleton-mono" />
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center font-serif italic text-xs text-slate-400">
              No support cases logged yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {cases.map((c) => {
                const isSelected = activeCase?.id === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCase(c.id)}
                    className={`w-full text-left p-3 rounded-md border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                        : 'bg-white text-slate-900 border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {c.case_number}
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] tracking-wide uppercase font-semibold ${getStatusBadge(c.case_status, isSelected)}`}>
                        {c.case_status}
                      </span>
                    </div>
                    <p className={`font-serif font-medium text-xs truncate mt-1 ${isSelected ? 'text-slate-100' : 'text-slate-800'}`}>
                      {c.title}
                    </p>
                    <span className={`font-mono text-[10px] uppercase block mt-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Case Timeline Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeCase ? (
            <div className="rounded-lg border border-slate-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-5">
              {/* Case Header Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-800 font-semibold border border-violet-200">
                      {activeCase.case_number}
                    </span>
                    <h2 className="font-serif text-base sm:text-lg font-bold tracking-tight text-slate-900">
                      {activeCase.title}
                    </h2>
                  </div>
                  <p className="font-serif italic text-xs text-slate-500 mt-1">{activeCase.description}</p>
                </div>

                <button
                  onClick={() => handleRunWorkflow(activeCase.id)}
                  disabled={runningWorkflow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white font-mono text-xs tracking-wide uppercase font-medium hover:bg-slate-800 transition-colors shadow-subtle disabled:opacity-50"
                >
                  <Play size={12} fill="currentColor" />
                  <span>{runningWorkflow ? 'Executing...' : 'Re-Run Pipeline'}</span>
                </button>
              </div>

              {/* Resolution Timeline */}
              <div className="space-y-3.5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                  Deterministic Audit Log ({events.length} Events)
                </span>

                {events.length === 0 ? (
                  <div className="p-8 rounded-md border border-slate-200 bg-slate-50 text-center font-serif italic text-slate-500 text-xs">
                    No resolution events recorded yet for this case. Click <strong>Re-Run Pipeline</strong> to trigger execution.
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {events.map((ev, idx) => {
                      const isExpanded = Boolean(expandedEvents[ev.id]);
                      return (
                        <div key={ev.id} className="relative pl-8">
                          <div className="absolute left-0.5 top-2.5 w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>

                          <div className="rounded-lg border border-slate-200/80 p-3.5 bg-slate-50/60 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-serif font-bold text-xs text-slate-900">{ev.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium">
                                  {ev.event_type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleEventExpand(ev.id)}
                                  className="font-mono text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                                >
                                  <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <pre className="rounded-md border border-slate-300 bg-slate-900 text-slate-100 p-3.5 font-mono text-[11px] overflow-x-auto leading-relaxed select-text mt-2">
                                {JSON.stringify(ev.detail_json, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-lg border border-slate-200/90 bg-white text-center font-serif italic text-slate-400 text-xs shadow-subtle">
              Select a support case from the sidebar to inspect its deterministic ledger trail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
