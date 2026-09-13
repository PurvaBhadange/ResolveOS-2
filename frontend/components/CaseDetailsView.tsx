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

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-1">
            Audit Trail &bull; Incident Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-black">
            Case Resolution Tracker
          </h1>
          <p className="text-sm font-serif italic text-neutral-700 mt-1">
            Audit real-time transactional resolution events, state transitions, and database ledger verifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Case List Sidebar (4 cols) */}
        <div className="lg:col-span-4 border-2 border-black p-5 bg-white space-y-4 h-fit rounded-2xl">
          <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
            <span className="font-display font-bold uppercase text-xs tracking-wider text-black">
              Logged Cases
            </span>
            <span className="font-mono text-xs font-bold text-black">{cases.length} Total</span>
          </div>

          {loading ? (
            <div className="space-y-2 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 skeleton-mono rounded-xl" />
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center font-serif italic text-xs text-neutral-500">
              No support cases logged yet.
            </div>
          ) : (
            <div className="space-y-2">
              {cases.map((c) => {
                const isSelected = activeCase?.id === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCase(c.id)}
                    className={`w-full text-left p-3.5 border-2 transition-colors duration-100 rounded-xl ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-black hover:text-white group'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="font-bold">
                        {c.case_number}
                      </span>
                      <span className="border border-current px-1.5 py-0.5 text-[10px] tracking-widest uppercase font-bold rounded-md">
                        {c.case_status}
                      </span>
                    </div>
                    <p className="font-serif font-semibold text-xs truncate mt-1">
                      {c.title}
                    </p>
                    <span className="font-mono text-[10px] uppercase text-neutral-500 group-hover:text-neutral-300 block mt-1.5">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Case Timeline Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeCase ? (
            <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-6 rounded-2xl">
              {/* Case Header Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs px-2 py-0.5 bg-black text-white font-bold border border-black rounded-md">
                      {activeCase.case_number}
                    </span>
                    <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-black">
                      {activeCase.title}
                    </h2>
                  </div>
                  <p className="font-serif italic text-xs text-neutral-600 mt-1">{activeCase.description}</p>
                </div>

                <button
                  onClick={() => handleRunWorkflow(activeCase.id)}
                  disabled={runningWorkflow}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-black text-white font-mono text-xs tracking-wider uppercase font-bold hover:bg-white hover:text-black transition-colors duration-100 disabled:opacity-50 rounded-lg"
                >
                  <Play size={12} fill="currentColor" />
                  <span>{runningWorkflow ? 'Executing...' : 'Re-Run Pipeline'}</span>
                </button>
              </div>

              {/* Resolution Timeline */}
              <div className="space-y-4">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-black block">
                  Deterministic Audit Log ({events.length} Events Recorded)
                </span>

                {events.length === 0 ? (
                  <div className="p-8 border-2 border-black bg-neutral-50 text-center font-serif italic text-neutral-600 text-xs rounded-xl">
                    No resolution events recorded yet for this case. Click <strong>Re-Run Pipeline</strong> to trigger execution.
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-black">
                    {events.map((ev, idx) => {
                      const isExpanded = Boolean(expandedEvents[ev.id]);
                      return (
                        <div key={ev.id} className="relative pl-10">
                          <div className="absolute left-1 top-2.5 w-6 h-6 border-2 border-black bg-black text-white font-mono text-[11px] font-bold flex items-center justify-center rounded-full">
                            {idx + 1}
                          </div>

                          <div className="border-2 border-black p-4 bg-white space-y-2 rounded-xl">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-serif font-bold text-sm text-black">{ev.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 border border-black bg-neutral-100 text-black font-semibold rounded-md">
                                  {ev.event_type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleEventExpand(ev.id)}
                                  className="font-mono text-xs tracking-wider uppercase border border-black px-2 py-0.5 bg-white text-black hover:bg-black hover:text-white transition-colors duration-100 flex items-center gap-1 rounded-md"
                                >
                                  <span>{isExpanded ? 'Hide JSON' : 'Inspect JSON'}</span>
                                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <pre className="border-2 border-black bg-black text-white p-4 font-mono text-[11px] overflow-x-auto leading-relaxed select-text mt-3 rounded-xl">
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
            <div className="p-16 border-2 border-black bg-white text-center font-serif italic text-neutral-500 text-sm rounded-2xl">
              Select a support case from the sidebar to inspect its deterministic ledger trail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
