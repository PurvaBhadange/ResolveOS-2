import React, { useEffect, useState } from 'react';
import { Cpu, ArrowRight, Copy, Check } from 'lucide-react';
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
    { key: 'GOAL', label: '1. UNDERSTAND', desc: 'Parse Intent' },
    { key: 'EVIDENCE', label: '2. EVIDENCE', desc: 'Policy & DB' },
    { key: 'DECISION', label: '3. DECIDE', desc: 'Synthesize Plan' },
    { key: 'ACTION', label: '4. ACT', desc: 'Database Action' },
    { key: 'VERIFICATION', label: '5. VERIFY', desc: 'Re-query Audit' },
    { key: 'ADAPTATION', label: '6. ADAPT', desc: 'Replanning' },
    { key: 'OUTCOME', label: '7. RESOLVE', desc: 'Final State' },
  ];

  const handleCopyJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent.detail_json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Execution Trace Inspector
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step diagnostic audit log and JSON payload records for Case #{selectedCaseId || '1'}.
          </p>
        </div>

        {activeCase && (
          <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-subtle text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
              Active Case
            </span>
            <span className="text-xs font-mono font-semibold text-slate-900">
              {activeCase.case_number}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal Stepper Progress */}
      <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-subtle overflow-x-auto">
        <div className="flex items-center justify-between min-w-[680px] gap-2">
          {graphSteps.map((step, idx) => {
            const hasEvent = events.some((e) => e.event_type === step.key);
            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center text-center p-2.5 rounded-md transition-all ${
                    hasEvent
                      ? 'bg-slate-50 border border-slate-200 text-slate-900'
                      : 'opacity-40 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-medium text-[11px] mb-1.5 ${
                      hasEvent
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[11px] font-semibold tracking-tight">{step.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 max-w-[85px] leading-tight">
                    {step.desc}
                  </span>
                </div>

                {idx < graphSteps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event List and Detailed JSON Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg p-3.5 border border-slate-200/90 shadow-subtle space-y-2 h-fit">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Execution Events</span>
            <span className="text-[11px] text-slate-400 font-mono">{events.length}</span>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
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
                      ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-medium">{ev.event_type}</span>
                    <span className={selectedEventId === ev.id ? 'text-slate-300' : 'text-slate-400'}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-xs font-medium truncate ${selectedEventId === ev.id ? 'text-white' : 'text-slate-800'}`}>
                    {ev.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payload Detail (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg p-5 border border-slate-200/90 shadow-subtle space-y-4">
          {selectedEvent ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    {selectedEvent.event_type} EVENT LOG
                  </span>
                  <h2 className="text-sm font-semibold text-slate-900">{selectedEvent.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">Event ID #{selectedEvent.id}</span>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                  Structured JSON Event Payload
                </span>
                <pre className="bg-slate-50 text-slate-800 p-4 rounded-md text-xs font-mono overflow-x-auto leading-relaxed border border-slate-200 select-text">
                  {JSON.stringify(selectedEvent.detail_json, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an event to inspect its structured JSON payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
