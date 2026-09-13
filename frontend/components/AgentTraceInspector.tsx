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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-1">
            Diagnostic Ledger &bull; Raw System Payloads
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-neutral-900">
            Execution Trace Inspector
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Step-by-step diagnostic audit log and cryptographic JSON payloads for Case #{selectedCaseId || '1'}.
          </p>
        </div>

        {activeCase && (
          <div className="border border-violet-200 bg-violet-50 text-violet-900 px-4 py-2 text-right rounded-lg shadow-xs">
            <span className="text-[10px] font-mono tracking-widest uppercase text-violet-600 block font-semibold">
              Active Case Key
            </span>
            <span className="text-xs font-mono font-bold">
              {activeCase.case_number}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal Stepper Progress */}
      <div className="border border-neutral-200 p-4 bg-white rounded-xl shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center text-center p-3 border rounded-lg transition-all duration-150 ${
                    hasEvent
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-200 shadow-xs'
                      : 'bg-neutral-50/60 text-neutral-400 border-neutral-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 border flex items-center justify-center font-mono font-bold text-[10px] mb-1.5 rounded-full ${
                      hasEvent
                        ? 'border-emerald-300 bg-emerald-200/80 text-emerald-900'
                        : 'border-neutral-300 bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-mono text-[10px] tracking-wider uppercase font-bold">{step.label}</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 max-w-[90px] leading-tight">
                    {step.desc}
                  </span>
                </div>

                {idx < graphSteps.length - 1 && (
                  <ArrowRight size={14} className={hasEvent ? 'text-emerald-500' : 'text-neutral-300'} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event List (4 cols) */}
        <div className="lg:col-span-4 border border-neutral-200 rounded-xl p-4 bg-white shadow-xs space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="font-mono font-bold uppercase text-xs tracking-wider text-neutral-700">
              Execution Events
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">{events.length}</span>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No events recorded for this case.
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-all duration-150 ${
                    selectedEventId === ev.id
                      ? 'bg-violet-50 text-violet-950 border-violet-300 ring-2 ring-violet-200/60 shadow-xs'
                      : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="font-bold px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700">
                      {ev.event_type}
                    </span>
                    <span className="text-neutral-500">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-medium text-xs truncate">
                    {ev.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payload Detail (8 cols) */}
        <div className="lg:col-span-8 border border-neutral-200 rounded-xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          {selectedEvent ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md inline-block mb-1 font-bold">
                    {selectedEvent.event_type} AUDIT RECORD
                  </span>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {selectedEvent.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                    EVENT #{selectedEvent.id}
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 border border-neutral-300 bg-white text-neutral-800 font-mono text-xs tracking-wider uppercase font-bold hover:bg-neutral-50 rounded-md transition-colors shadow-xs"
                  >
                    {copied ? <Check size={12} strokeWidth={2.5} className="text-emerald-600" /> : <Copy size={12} strokeWidth={2} />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-700 mb-2 block">
                  Structured Ledger JSON Payload
                </span>
                <pre className="border border-neutral-800 bg-neutral-950 text-emerald-400 p-5 text-xs font-mono overflow-x-auto leading-relaxed select-text rounded-lg shadow-inner">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-neutral-500 text-sm">
              Select an event to inspect its structured JSON payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
