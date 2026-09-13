import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Play, ArrowRight, Zap, RefreshCw } from 'lucide-react';
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
  const [runningAgent, setRunningAgent] = useState<boolean>(false);

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

  const handleRunAgent = async (caseId: number) => {
    setRunningAgent(true);
    try {
      await api.runAgentOnCase(caseId);
      await loadCases();
    } catch (e) {
      console.error(e);
    } finally {
      setRunningAgent(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow-uppercase text-body-mid">Resolution Stream</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
            Support Case Resolution Tracker
          </h1>
          <p className="text-body text-sm mt-1">
            Audit real-time LangGraph agent decisions, policy evaluations, and independent database checks.
          </p>
        </div>
        <button
          onClick={loadCases}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-canvas-soft hover:bg-[#efe8df] text-ink border border-mute text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-body" />
          <span>Refresh Cases</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List Sidebar */}
        <div className="bg-canvas-soft rounded-md p-4 border border-[#e8e2d8] shadow-soft-card space-y-2 h-fit">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="eyebrow-uppercase text-body-mid text-[11px]">All Support Cases</span>
            <span className="text-xs font-bold text-ink bg-canvas px-2 py-0.5 rounded-full border border-mute/40">
              {cases.length}
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-body-mid">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center text-xs text-body-mid">No cases submitted yet.</div>
          ) : (
            cases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`p-4 rounded-md cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-ink text-canvas border-ink shadow-sm'
                      : 'bg-canvas hover:bg-[#faf6f1] border-[#e8e2d8] text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold tracking-tight">{c.case_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase tracking-wider ${
                        c.case_status === 'resolved'
                          ? 'bg-accent-emerald text-white'
                          : c.case_status === 'escalated'
                          ? 'bg-accent-rose text-white'
                          : c.case_status === 'awaiting_approval'
                          ? 'bg-accent-amber text-white'
                          : 'bg-ink-soft text-canvas-soft'
                      }`}
                    >
                      {c.case_status}
                    </span>
                  </div>
                  <p className="font-semibold text-sm truncate">{c.title}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-mute/20 text-[11px]">
                    <span className={isSelected ? 'text-canvas-soft/75' : 'text-body-mid'}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span className={isSelected ? 'text-primary font-bold' : 'text-ink-mid font-semibold'}>
                      Category: {c.category || 'general'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Case Timeline Detail */}
        <div className="lg:col-span-2 space-y-6">
          {activeCase ? (
            <div className="bg-canvas-soft rounded-md p-6 sm:p-8 border border-[#e8e2d8] shadow-soft-card space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8e2d8] pb-6">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                      {activeCase.title}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-canvas text-ink border border-mute">
                      {activeCase.case_number}
                    </span>
                  </div>
                  <p className="text-body text-sm leading-relaxed mt-1">{activeCase.description}</p>
                </div>

                <button
                  onClick={() => handleRunAgent(activeCase.id)}
                  disabled={runningAgent}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {runningAgent ? 'Running Agent Loop...' : 'Trigger Agent Execution'}
                </button>
              </div>

              {/* Resolution Timeline */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="eyebrow-uppercase text-body-mid text-xs">Resolution Event Stream</span>
                  <span className="text-xs text-body">
                    {events.length} State Transition{events.length === 1 ? '' : 's'} Recorded
                  </span>
                </div>

                {events.length === 0 ? (
                  <div className="p-8 bg-canvas rounded-md text-center text-body text-sm border border-[#e8e2d8] space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#efe8df] text-primary flex items-center justify-center mx-auto">
                      <Zap className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-ink">No resolution events recorded yet.</p>
                    <p className="text-xs text-body max-w-md mx-auto">
                      Click <strong className="text-primary">Trigger Agent Execution</strong> above to launch the 7-node LangGraph autonomous loop.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#c5c0b1]">
                    {events.map((ev, idx) => (
                      <div key={ev.id} className="relative pl-11">
                        <div
                          className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-canvas ${
                            ev.event_type === 'OUTCOME'
                              ? 'bg-accent-emerald text-white'
                              : ev.event_type === 'ADAPTATION'
                              ? 'bg-accent-indigo text-white'
                              : ev.event_type === 'ACTION'
                              ? 'bg-primary text-on-primary'
                              : ev.event_type === 'VERIFICATION'
                              ? 'bg-ink text-canvas'
                              : 'bg-ink-soft text-canvas'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="bg-canvas rounded-md p-5 border border-[#e8e2d8] shadow-sm space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-ink text-sm sm:text-base">{ev.title}</span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
                                ev.event_type === 'ACTION'
                                  ? 'bg-primary/10 text-primary border border-primary/30'
                                  : ev.event_type === 'ADAPTATION'
                                  ? 'bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/30'
                                  : 'bg-canvas-soft text-ink-mid border border-mute/50'
                              }`}
                            >
                              {ev.event_type}
                            </span>
                          </div>

                          <pre className="bg-ink text-canvas-soft p-4 rounded-md border border-ink-soft text-xs font-mono overflow-x-auto leading-relaxed selection:bg-primary/30">
                            {JSON.stringify(ev.detail_json, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 bg-canvas-soft rounded-md text-center text-body-mid border border-[#e8e2d8]">
              Select a support case from the sidebar to inspect its real-time resolution timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
