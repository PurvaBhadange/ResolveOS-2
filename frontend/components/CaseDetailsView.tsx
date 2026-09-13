import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Play, ArrowRight, ChevronDown, ChevronRight, FileText } from 'lucide-react';
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

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Case Resolution Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit real-time transactional resolution events, state transitions, and verification logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case List Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 shadow-subtle p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-semibold text-slate-900">Support Cases</span>
            <span className="text-[11px] text-slate-400 font-mono">{cases.length} Total</span>
          </div>

          {loading ? (
            <div className="space-y-2 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded skeleton" />
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No support cases logged yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {cases.map((c) => {
                const isSelected = activeCase?.id === c.id;
                const isResolved = c.case_status === 'resolved';
                const isEscalated = c.case_status === 'escalated';
                const isAwaiting = c.case_status === 'awaiting_approval';

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCase(c.id)}
                    className={`w-full text-left p-3 rounded-md border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-mono font-medium ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {c.case_number}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border uppercase ${
                        isSelected
                          ? 'bg-slate-800 text-slate-200 border-slate-700'
                          : isResolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isEscalated
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isAwaiting
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {c.case_status}
                      </span>
                    </div>
                    <p className={`text-xs font-medium truncate ${isSelected ? 'text-slate-100' : 'text-slate-800'}`}>
                      {c.title}
                    </p>
                    <span className={`text-[10px] block mt-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Case Timeline Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeCase ? (
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 sm:p-6 space-y-5">
              {/* Case Header Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {activeCase.case_number}
                    </span>
                    <h2 className="text-base font-semibold text-slate-900">{activeCase.title}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{activeCase.description}</p>
                </div>

                <button
                  onClick={() => handleRunWorkflow(activeCase.id)}
                  disabled={runningWorkflow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-subtle disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{runningWorkflow ? 'Executing...' : 'Re-Run Workflow'}</span>
                </button>
              </div>

              {/* Resolution Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
                  Audit Event Trail ({events.length} Events)
                </span>

                {events.length === 0 ? (
                  <div className="p-8 bg-slate-50 rounded-md text-center text-slate-500 text-xs border border-slate-200">
                    No resolution events recorded yet for this case. Click <strong>Re-Run Workflow</strong> to trigger execution.
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {events.map((ev, idx) => {
                      const isExpanded = Boolean(expandedEvents[ev.id]);
                      return (
                        <div key={ev.id} className="relative pl-8">
                          <div className="absolute left-0.5 top-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-medium flex items-center justify-center">
                            {idx + 1}
                          </div>

                          <div className="bg-slate-50 rounded-md border border-slate-200/80 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 text-xs">{ev.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                                  {ev.event_type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleEventExpand(ev.id)}
                                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5"
                                >
                                  <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <pre className="bg-white text-slate-800 p-3 rounded border border-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed select-text mt-2">
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
            <div className="p-12 bg-white rounded-lg text-center text-slate-400 text-xs border border-slate-200">
              Select a support case to view its resolution audit timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
