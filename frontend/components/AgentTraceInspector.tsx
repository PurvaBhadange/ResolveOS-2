import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw, Layers, Database, Zap } from 'lucide-react';
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
    { key: 'GOAL', label: '1. UNDERSTAND', desc: 'Intent & Entity Extraction' },
    { key: 'EVIDENCE', label: '2. EVIDENCE', desc: 'RAG & Relational State' },
    { key: 'DECISION', label: '3. DECIDE', desc: 'Scored Candidate Plans' },
    { key: 'ACTION', label: '4. ACT', desc: 'Idempotent Business Action' },
    { key: 'VERIFICATION', label: '5. VERIFY', desc: 'Independent DB Verification' },
    { key: 'ADAPTATION', label: '6. ADAPT', desc: 'Autonomous Replanning' },
    { key: 'OUTCOME', label: '7. RESOLVE', desc: 'Audited Final State' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow-uppercase text-body-mid">State Machine Audit</span>
          <div className="flex items-center gap-2.5 mt-1">
            <Cpu className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Agent Trace Inspector
            </h1>
          </div>
          <p className="text-body text-sm mt-1">
            Visual step-by-step audit of the 7-node LangGraph loop for Case #{selectedCaseId || '1'}.
          </p>
        </div>

        {activeCase && (
          <div className="bg-canvas-soft px-4 py-2.5 rounded-md border border-[#e8e2d8] shadow-soft-card text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-body-mid block">Inspected Case</span>
            <span className="text-sm font-bold text-ink">{activeCase.case_number}</span>
          </div>
        )}
      </div>

      {/* Visual LangGraph State Machine Horizontal Pipeline - card-dark matching DESIGN.md */}
      <div className="bg-ink text-canvas rounded-md p-6 sm:p-8 shadow-soft-card overflow-x-auto border border-ink-soft">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center text-center p-3.5 rounded-md transition-all ${
                    hasEvent
                      ? 'bg-ink-soft border border-primary/50 text-canvas'
                      : 'opacity-40 text-mute border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                      hasEvent
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-ink-mid text-mute'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-xs font-bold tracking-tight ${
                      hasEvent ? 'text-primary' : 'text-mute'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-mute mt-1 max-w-[95px] leading-tight">
                    {step.desc}
                  </span>
                </div>

                {idx < graphSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-ink-mid shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event List Sidebar */}
        <div className="bg-canvas-soft rounded-md p-4 border border-[#e8e2d8] shadow-soft-card space-y-2 h-fit">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="eyebrow-uppercase text-body-mid text-[11px]">Agent Event Stream</span>
            <span className="text-xs font-bold text-ink bg-canvas px-2 py-0.5 rounded-full border border-mute/40">
              {events.length}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-body-mid">No agent events logged.</div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-3.5 rounded-md cursor-pointer transition-all border ${
                  selectedEventId === ev.id
                    ? 'bg-ink text-canvas border-ink shadow-sm'
                    : 'bg-canvas hover:bg-[#faf6f1] border-[#e8e2d8] text-ink'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold tracking-tight">{ev.event_type}</span>
                  <span className="text-[10px] opacity-75">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="font-semibold text-xs truncate">{ev.title}</p>
              </div>
            ))
          )}
        </div>

        {/* Payload Detail */}
        <div className="lg:col-span-2 bg-canvas-soft rounded-md p-6 sm:p-7 border border-[#e8e2d8] shadow-soft-card space-y-5">
          {selectedEvent ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8e2d8] pb-4">
                <div>
                  <span className="eyebrow-uppercase text-primary text-xs block">
                    {selectedEvent.event_type} EVENT
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight mt-0.5">
                    {selectedEvent.title}
                  </h2>
                </div>
                <span className="text-xs text-body-mid font-mono bg-canvas px-2.5 py-1 rounded-sm border border-mute/50">
                  Node Event ID #{selectedEvent.id}
                </span>
              </div>

              <div>
                <span className="eyebrow-uppercase text-body-mid text-xs block mb-2">
                  Structured Decision Payload (JSON)
                </span>
                <pre className="bg-ink text-canvas-soft p-5 rounded-md text-xs font-mono overflow-x-auto leading-relaxed border border-ink-soft shadow-inner selection:bg-primary/30">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-body-mid text-sm bg-canvas rounded-md border border-[#e8e2d8]">
              Select an event from the stream to view structured payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
