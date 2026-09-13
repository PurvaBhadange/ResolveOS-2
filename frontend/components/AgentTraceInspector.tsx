import React, { useEffect, useState } from 'react';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { api } from '../lib/api';

interface AgentTraceProps {
  selectedCaseId: number | null;
}

export const AgentTraceInspector: React.FC<AgentTraceProps> = ({ selectedCaseId }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

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
    { key: 'GOAL', label: '01. UNDERSTAND', desc: 'Intent Parsing' },
    { key: 'EVIDENCE', label: '02. EVIDENCE', desc: 'Policy & DB' },
    { key: 'DECISION', label: '03. DECIDE', desc: 'Plan Synthesis' },
    { key: 'ACTION', label: '04. ACT', desc: 'State Change' },
    { key: 'VERIFICATION', label: '05. VERIFY', desc: 'Ledger Audit' },
    { key: 'ADAPTATION', label: '06. ADAPT', desc: 'Replanning' },
    { key: 'OUTCOME', label: '07. RESOLVE', desc: 'Final State' },
  ];

  const handleCopyJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent.detail_json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-1">
            Diagnostic Ledger &bull; Raw System Payloads
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-black">
            Execution Trace Inspector
          </h1>
          <p className="text-sm font-serif italic text-neutral-700 mt-1">
            Step-by-step diagnostic audit log and cryptographic JSON payloads for Case #{selectedCaseId || '1'}.
          </p>
        </div>

        {activeCase && (
          <div className="border-2 border-black bg-black text-white px-4 py-2 text-right rounded-lg">
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">
              Active Case Key
            </span>
            <span className="text-xs font-mono font-bold">
              {activeCase.case_number}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal Stepper Progress */}
      <div className="border-2 border-black p-4 bg-white overflow-x-auto rounded-2xl">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center text-center p-3 border rounded-xl transition-colors duration-100 ${
                    hasEvent
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-400 border-neutral-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 border flex items-center justify-center font-mono font-bold text-[10px] mb-1.5 rounded-md ${
                      hasEvent
                        ? 'border-white bg-white text-black'
                        : 'border-neutral-300 bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-mono text-[10px] tracking-wider uppercase font-bold">{step.label}</span>
                  <span className="font-serif italic text-[10px] mt-0.5 max-w-[90px] leading-tight">
                    {step.desc}
                  </span>
                </div>

                {idx < graphSteps.length - 1 && (
                  <ArrowRight size={14} className={hasEvent ? 'text-black' : 'text-neutral-300'} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Event List (4 cols) */}
        <div className="lg:col-span-4 border-2 border-black p-4 bg-white space-y-3 h-fit rounded-2xl">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-display font-bold uppercase text-xs tracking-wider text-black">
              Execution Events
            </span>
            <span className="font-mono text-xs font-bold text-black">{events.length}</span>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-center font-serif italic text-xs text-neutral-500">
              No events recorded for this case.
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`w-full text-left p-3 border-2 cursor-pointer transition-colors duration-100 rounded-xl ${
                    selectedEventId === ev.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-black hover:text-white group'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="font-bold">{ev.event_type}</span>
                    <span className={selectedEventId === ev.id ? 'text-neutral-400' : 'text-neutral-500 group-hover:text-neutral-400'}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-serif font-bold text-xs truncate">
                    {ev.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payload Detail (8 cols) */}
        <div className="lg:col-span-8 border-2 border-black p-6 sm:p-8 bg-white space-y-6 rounded-2xl">
          {selectedEvent ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block mb-0.5">
                    {selectedEvent.event_type} AUDIT RECORD
                  </span>
                  <h2 className="font-display text-lg font-bold uppercase tracking-tight text-black">
                    {selectedEvent.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-black border border-black px-2 py-0.5 rounded-md">
                    EVENT #{selectedEvent.id}
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-white text-black font-mono text-xs tracking-wider uppercase font-bold hover:bg-black hover:text-white transition-colors duration-100 rounded-lg"
                  >
                    {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-black mb-2 block">
                  Structured Ledger JSON Payload
                </span>
                <pre className="border-2 border-black bg-black text-white p-5 text-xs font-mono overflow-x-auto leading-relaxed select-text rounded-xl">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-16 text-center font-serif italic text-neutral-500 text-sm">
              Select an event to inspect its structured JSON payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
