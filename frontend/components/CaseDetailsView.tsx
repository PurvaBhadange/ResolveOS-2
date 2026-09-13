import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Play, ArrowRight } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Case Resolution Tracker</h1>
          <p className="text-slate-500 text-sm">Track real-time autonomous agent progress and decision timelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List Sidebar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">All Support Cases</h3>
          {loading ? (
            <div className="p-4 text-xs text-slate-400">Loading cases...</div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  activeCase?.id === c.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold tracking-tight">{c.case_number}</span>
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                    c.case_status === 'resolved' ? 'bg-emerald-500 text-white' :
                    c.case_status === 'escalated' ? 'bg-rose-500 text-white' :
                    c.case_status === 'awaiting_approval' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {c.case_status}
                  </span>
                </div>
                <p className="font-semibold text-sm truncate">{c.title}</p>
                <span className="text-[11px] opacity-75 mt-1 block">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Active Case Timeline Detail */}
        <div className="lg:col-span-2 space-y-6">
          {activeCase ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{activeCase.title}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200">
                      {activeCase.case_number}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">{activeCase.description}</p>
                </div>

                <button
                  onClick={() => handleRunAgent(activeCase.id)}
                  disabled={runningAgent}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-semibold text-xs transition-all shadow-md shadow-tealbrand-600/20 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  {runningAgent ? 'Running Agent...' : 'Trigger Agent Execution'}
                </button>
              </div>

              {/* Resolution Timeline */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Resolution Event Stream</h3>

                {events.length === 0 ? (
                  <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 text-sm border border-slate-200">
                    No resolution events recorded yet. Click <strong>Trigger Agent Execution</strong> to run the LangGraph state machine.
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {events.map((ev, idx) => (
                      <div key={ev.id} className="relative pl-10">
                        <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                          ev.event_type === 'OUTCOME' ? 'bg-emerald-600 text-white' :
                          ev.event_type === 'ADAPTATION' ? 'bg-indigo-600 text-white' :
                          ev.event_type === 'ACTION' ? 'bg-tealbrand-600 text-white' :
                          ev.event_type === 'VERIFICATION' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {ev.event_type}
                            </span>
                          </div>

                          <pre className="bg-slate-950 text-emerald-300 p-4 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto leading-relaxed">
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
            <div className="p-12 bg-white rounded-3xl text-center text-slate-400 border border-slate-200">
              Select a support case to view its resolution timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
