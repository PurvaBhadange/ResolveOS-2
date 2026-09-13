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
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200/90 pb-5">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-neutral-500 mb-1">
            Diagnostic Ledger &bull; Raw Payloads
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-neutral-900">
            Execution Trace Inspector
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-neutral-600 mt-1">
            Step-by-step diagnostic audit log and JSON payloads for Case #{selectedCaseId || '1'}.
          </p>
        </div>

        {activeCase && (
          <div className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-right shadow-subtle">
            <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 block">
              Active Case
            </span>
            <span className="text-xs font-mono font-semibold text-neutral-900">
              {activeCase.case_number}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal Stepper Progress */}
      <div className="rounded-lg border border-neutral-200/90 p-4 bg-white shadow-subtle overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center text-center p-2.5 rounded-md border transition-all ${
                    hasEvent
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-subtle'
                      : 'bg-neutral-50/70 text-neutral-400 border-neutral-200/80'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-semibold text-[10px] mb-1 ${
                      hasEvent
                        ? 'bg-white text-neutral-900'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-mono text-[10px] tracking-wide uppercase font-semibold">{step.label}</span>
                  <span className={`font-serif italic text-[10px] mt-0.5 max-w-[85px] leading-tight ${
                    hasEvent ? 'text-neutral-300' : 'text-neutral-400'
                  }`}>
                    {step.desc}
                  </span>
                </div>

                {idx < graphSteps.length - 1 && (
                  <ArrowRight size={13} className={hasEvent ? 'text-neutral-700' : 'text-neutral-300'} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event List (4 cols) */}
        <div className="lg:col-span-4 rounded-lg border border-neutral-200/90 p-3.5 bg-white shadow-subtle space-y-2 h-fit">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2 px-1">
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-neutral-800">
              Execution Events
            </span>
            <span className="font-mono text-xs text-neutral-500">{events.length}</span>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-center font-serif italic text-xs text-neutral-400">
              No events recorded for this case.
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`w-full text-left p-2.5 rounded-md cursor-pointer transition-all border ${
                    selectedEventId === ev.id
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-subtle'
                      : 'bg-white text-neutral-800 border-neutral-200/80 hover:bg-neutral-50/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="font-semibold">{ev.event_type}</span>
                    <span className={selectedEventId === ev.id ? 'text-neutral-300' : 'text-neutral-400'}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-serif font-medium text-xs truncate">
                    {ev.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payload Detail (8 cols) */}
        <div className="lg:col-span-8 rounded-lg border border-neutral-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-4">
          {selectedEvent ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-400 block">
                    {selectedEvent.event_type} AUDIT RECORD
                  </span>
                  <h2 className="font-serif text-base font-bold tracking-tight text-neutral-900">
                    {selectedEvent.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-neutral-500 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5">
                    Event #{selectedEvent.id}
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-mono text-xs tracking-wide uppercase hover:border-neutral-400 shadow-subtle transition-all"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2 block">
                  Structured Ledger JSON Payload
                </span>
                <pre className="rounded-md border border-neutral-300 bg-neutral-900 text-neutral-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed select-text">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-12 text-center font-serif italic text-neutral-400 text-xs">
              Select an event to inspect its structured JSON payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
