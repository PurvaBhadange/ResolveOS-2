import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw, Layers, Database } from 'lucide-react';
import { api } from '../lib/api';

interface AgentTraceProps {
  selectedCaseId: number | null;
}

export const AgentTraceInspector: React.FC<AgentTraceProps> = ({ selectedCaseId }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTrace = async () => {
    if (!selectedCaseId) return;
    setLoading(true);
    try {
      const caseDetail = await api.getCase(selectedCaseId);
      setActiveCase(caseDetail);
      const evs = await api.getCaseEvents(selectedCaseId);
      setEvents(evs);
      if (evs.length > 0) {
        setSelectedEventId(evs[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrace();
  }, [selectedCaseId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const graphSteps = [
    { key: 'GOAL', label: '1. UNDERSTAND', desc: 'Parse Intent & Goal' },
    { key: 'EVIDENCE', label: '2. EVIDENCE', desc: 'RAG & Enterprise DB' },
    { key: 'DECISION', label: '3. DECIDE', desc: 'Scored Plan Candidates' },
    { key: 'ACTION', label: '4. ACT', desc: 'Enterprise State Action' },
    { key: 'VERIFICATION', label: '5. VERIFY', desc: 'Independent DB Re-query' },
    { key: 'ADAPTATION', label: '6. ADAPT', desc: 'Replanning Strategy' },
    { key: 'OUTCOME', label: '7. RESOLVE', desc: 'Final Case Audit' },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-[#c5c0b1]/40 pb-5">
        <div>
          <span className="zapier-eyebrow block mb-1">STATE MACHINE AUDIT GRAPH</span>
          <h1 className="text-3xl font-semibold text-[#201515]">Agent Trace Inspector</h1>
          <p className="text-[#605d52] text-base mt-1">Visual step-by-step audit of the LangGraph agentic loop for Case #{selectedCaseId || '1'}.</p>
        </div>

        {activeCase && (
          <div className="zapier-card px-5 py-2.5 text-right">
            <span className="zapier-eyebrow text-[10px] text-[#939084] block">ACTIVE CASE</span>
            <span className="text-base font-bold text-[#201515]">{activeCase.case_number}</span>
          </div>
        )}
      </div>

      {/* Zapier Polarity-Flipped Dark Hero Pipeline */}
      <div className="zapier-card-dark p-6 sm:p-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div className={`flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                  hasEvent ? 'bg-[#2f2a26] border border-[#ff4f00]/50 text-[#fffefb]' : 'opacity-40 text-[#c5c0b1]'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    hasEvent ? 'bg-[#ff4f00] text-[#fffefb]' : 'bg-[#36342e] text-[#c5c0b1]'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-[#ff4f00] tracking-tight">{step.label}</span>
                  <span className="text-[10px] text-[#c5c0b1] mt-0.5 max-w-[90px] leading-tight">{step.desc}</span>
                </div>

                {idx < graphSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#c5c0b1]/50 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event List */}
        <div className="zapier-card p-5 space-y-3 h-fit">
          <span className="zapier-eyebrow block text-xs px-2 text-[#939084]">AGENT EVENT STREAM</span>
          {events.length === 0 ? (
            <div className="p-4 text-sm text-[#939084]">No agent events logged.</div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedEventId === ev.id
                    ? 'bg-[#201515] text-[#fffefb] border-[#201515] shadow-md'
                    : 'bg-[#fffefb] hover:bg-[#f8f4f0] border-[#c5c0b1]/60 text-[#201515]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold tracking-tight text-[#ff4f00]">{ev.event_type}</span>
                  <span className="text-[10px] opacity-75">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="font-semibold text-sm truncate">{ev.title}</p>
              </div>
            ))
          )}
        </div>

        {/* Payload Detail */}
        <div className="lg:col-span-2 zapier-card p-6 sm:p-8 space-y-5">
          {selectedEvent ? (
            <>
              <div className="flex items-center justify-between border-b border-[#c5c0b1]/40 pb-4">
                <div>
                  <span className="zapier-eyebrow block text-xs text-[#ff4f00] mb-1">{selectedEvent.event_type} EVENT</span>
                  <h2 className="text-xl font-semibold text-[#201515]">{selectedEvent.title}</h2>
                </div>
                <span className="text-xs text-[#939084] font-mono">ID #{selectedEvent.id}</span>
              </div>

              <div>
                <span className="zapier-eyebrow block text-xs text-[#939084] mb-3">STRUCTURED EVENT PAYLOAD</span>
                <pre className="bg-[#201515] text-[#5eead4] p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-[#2f2a26] shadow-inner select-text">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-[#939084] text-base">Select an event to view structured payload.</div>
          )}
        </div>
      </div>
    </div>
  );
};
