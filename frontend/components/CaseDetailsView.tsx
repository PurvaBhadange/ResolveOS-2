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
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-[#c5c0b1]/40 pb-5">
        <div>
          <span className="zapier-eyebrow block mb-1">REAL-TIME TIMELINE</span>
          <h1 className="text-3xl font-semibold text-[#201515]">Support Case Resolution Tracker</h1>
          <p className="text-[#605d52] text-base mt-1">Track real-time autonomous agent progress and decision timelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List Sidebar */}
        <div className="zapier-card p-5 space-y-3 h-fit">
          <span className="zapier-eyebrow block text-xs px-2 text-[#939084]">ALL SUPPORT CASES</span>
          {loading ? (
            <div className="p-4 text-sm text-[#939084]">Loading cases...</div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  activeCase?.id === c.id
                    ? 'bg-[#201515] text-[#fffefb] border-[#201515] shadow-md'
                    : 'bg-[#fffefb] hover:bg-[#f8f4f0] border-[#c5c0b1]/60 text-[#201515]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold tracking-tight">{c.case_number}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    c.case_status === 'resolved' ? 'bg-emerald-600 text-white' :
                    c.case_status === 'escalated' ? 'bg-rose-600 text-white' :
                    c.case_status === 'awaiting_approval' ? 'bg-[#ff4f00] text-white' : 'bg-[#605d52] text-white'
                  }`}>
                    {c.case_status}
                  </span>
                </div>
                <p className="font-semibold text-base truncate">{c.title}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Active Case Timeline Detail */}
        <div className="lg:col-span-2 space-y-6">
          {activeCase ? (
            <div className="zapier-card p-6 sm:p-10 space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c5c0b1]/40 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-[#201515]">{activeCase.title}</h2>
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#201515] text-[#fffefb]">
                      {activeCase.case_number}
                    </span>
                  </div>
                  <p className="text-[#605d52] text-base mt-2">{activeCase.description}</p>
                </div>

                <button
                  onClick={() => handleRunAgent(activeCase.id)}
                  disabled={runningAgent}
                  className="zapier-btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {runningAgent ? 'Running Agent...' : 'Trigger Agent Execution'}
                </button>
              </div>

              {/* Resolution Event Stream */}
              <div>
                <span className="zapier-eyebrow block text-xs mb-6 text-[#939084]">RESOLUTION EVENT STREAM</span>

                {events.length === 0 ? (
                  <div className="p-8 bg-[#fffefb] rounded-xl text-center text-[#605d52] text-base border border-[#c5c0b1]">
                    No resolution events recorded yet. Click <strong className="text-[#201515]">Trigger Agent Execution</strong> to run the LangGraph state machine.
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#c5c0b1]">
                    {events.map((ev, idx) => (
                      <div key={ev.id} className="relative pl-10">
                        <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                          ev.event_type === 'OUTCOME' ? 'bg-emerald-600 text-white' :
                          ev.event_type === 'ADAPTATION' ? 'bg-[#ff4f00] text-white' :
                          ev.event_type === 'ACTION' ? 'bg-[#201515] text-white' :
                          ev.event_type === 'VERIFICATION' ? 'bg-sky-700 text-white' : 'bg-[#605d52] text-white'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="bg-[#fffefb] rounded-xl p-5 border border-[#c5c0b1] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#201515] text-base">{ev.title}</span>
                            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-[#f8f4f0] text-[#201515] border border-[#c5c0b1]">
                              {ev.event_type}
                            </span>
                          </div>

                          <pre className="bg-[#201515] text-[#5eead4] p-4 rounded-lg border border-[#2f2a26] text-xs font-mono overflow-x-auto leading-relaxed">
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
            <div className="p-12 zapier-card text-center text-[#939084] text-base">
              Select a support case to view its resolution timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
