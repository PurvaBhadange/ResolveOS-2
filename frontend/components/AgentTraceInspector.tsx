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
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#ff4f00]" />
            <h1 className="text-3xl font-extrabold text-[#201515]">Agent Trace Inspector</h1>
          </div>
          <p className="text-[#605d52] text-sm mt-1">Visual step-by-step audit of the LangGraph agentic loop for Case #{selectedCaseId || '1'}.</p>
        </div>

        {activeCase && (
          <div className="bg-[#f8f4f0] px-4 py-2 rounded-[12px] border border-[#c5c0b1] shadow-sm text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#605d52] block">Active Case</span>
            <span className="text-sm font-bold text-[#201515]">{activeCase.case_number}</span>
          </div>
        )}
      </div>

      {/* Visual LangGraph State Machine Horizontal Pipeline */}
      <div className="bg-[#201515] text-[#fffefb] rounded-[12px] p-6 sm:p-8 shadow-xl overflow-x-auto border border-[#36342e]">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div className={`flex flex-col items-center text-center p-3 rounded-[12px] transition-all ${
                  hasEvent ? 'bg-[#2f2a26] border border-[#ff4f00] text-[#fffefb]' : 'opacity-40 text-[#c5c0b1]'
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
                  <ArrowRight className="w-4 h-4 text-[#939084] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event List */}
        <div className="bg-[#f8f4f0] rounded-[12px] p-4 border border-[#c5c0b1] shadow-sm space-y-2 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#605d52] px-3 py-1">Agent Event Stream</h3>
          {events.length === 0 ? (
            <div className="p-4 text-xs text-[#605d52]">No agent events logged.</div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-3.5 rounded-[12px] cursor-pointer transition-all border ${
                  selectedEventId === ev.id
                    ? 'bg-[#201515] text-[#fffefb] border-[#201515] shadow-md'
                    : 'bg-[#fffefb] hover:bg-[#f8f4f0] border-[#c5c0b1] text-[#201515]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold tracking-tight">{ev.event_type}</span>
                  <span className="text-[10px] opacity-75">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="font-bold text-xs truncate">{ev.title}</p>
              </div>
            ))
          )}
        </div>

        {/* Payload Detail */}
        <div className="lg:col-span-2 bg-[#f8f4f0] rounded-[12px] p-6 border border-[#c5c0b1] shadow-sm space-y-4">
          {selectedEvent ? (
            <>
              <div className="flex items-center justify-between border-b border-[#c5c0b1] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#ff4f00] uppercase tracking-wider block">{selectedEvent.event_type} EVENT</span>
                  <h2 className="text-lg font-bold text-[#201515]">{selectedEvent.title}</h2>
                </div>
                <span className="text-xs text-[#605d52] font-mono">ID #{selectedEvent.id}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#605d52] mb-2">Structured Event Payload</h4>
                <pre className="bg-[#201515] text-emerald-300 p-5 rounded-[12px] text-xs font-mono overflow-x-auto leading-relaxed border border-[#36342e] shadow-inner select-text">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-[#605d52] text-sm">Select an event to view structured payload.</div>
          )}
        </div>
      </div>
    </div>
  );
};
