import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Loader2, Play, FileText, ArrowRight } from 'lucide-react';

export interface LoopStep {
  id: string;
  number: string;
  title: string;
  desc: string;
  activeDesc: string;
}

interface AgentLoopVisualizerProps {
  currentStepIndex?: number; // -1: standby, 0..6: active node, 7: all completed
  isRunning?: boolean;
  isComplete?: boolean;
  statusMessage?: string;
  caseEvents?: any[];
  showSimulateButton?: boolean;
}

export const AgentLoopVisualizer: React.FC<AgentLoopVisualizerProps> = ({
  currentStepIndex,
  isRunning = false,
  isComplete = false,
  statusMessage,
  caseEvents,
  showSimulateButton = true,
}) => {
  const steps: LoopStep[] = [
    { id: 'understand', number: '1', title: 'UNDERSTAND', desc: 'Parse Intent', activeDesc: 'Extracting customer intent and order parameters...' },
    { id: 'evidence', number: '2', title: 'EVIDENCE', desc: 'Policy & Inventory', activeDesc: 'Querying policy rules and multi-warehouse stock...' },
    { id: 'decide', number: '3', title: 'DECIDE', desc: 'Synthesize Plan', activeDesc: 'Ranking candidate plans and resolution actions...' },
    { id: 'guard', number: '4', title: 'GUARD', desc: 'Safety Check', activeDesc: 'Validating safety thresholds and return windows...' },
    { id: 'act', number: '5', title: 'ACT', desc: 'Execute Change', activeDesc: 'Executing transactional resolution with idempotency key...' },
    { id: 'verify', number: '6', title: 'VERIFY', desc: 'Audit Database', activeDesc: 'Querying PostgreSQL database to verify execution...' },
    { id: 'adapt', number: '7', title: 'ADAPT', desc: 'Replanning', activeDesc: 'Stockout detected: automatically adapted to refund...' },
  ];

  const [simulating, setSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(-1);

  let effectiveStepIndex = -1;
  let effectiveIsRunning = isRunning || simulating;
  let effectiveIsComplete = isComplete;

  if (simulating) {
    effectiveStepIndex = simStep;
    effectiveIsComplete = simStep >= steps.length;
  } else if (currentStepIndex !== undefined) {
    effectiveStepIndex = currentStepIndex;
    if (currentStepIndex >= steps.length) {
      effectiveIsComplete = true;
    }
  } else if (caseEvents && caseEvents.length > 0) {
    const eventTypes = caseEvents.map((e) => (e.event_type || '').toUpperCase());
    if (eventTypes.includes('OUTCOME') || eventTypes.includes('ADAPTATION')) {
      effectiveStepIndex = 7;
      effectiveIsComplete = true;
    } else if (eventTypes.includes('VERIFICATION')) {
      effectiveStepIndex = 5;
    } else if (eventTypes.includes('ACTION')) {
      effectiveStepIndex = 4;
    } else if (eventTypes.includes('DECISION')) {
      effectiveStepIndex = 2;
    } else if (eventTypes.includes('EVIDENCE')) {
      effectiveStepIndex = 1;
    } else if (eventTypes.includes('GOAL')) {
      effectiveStepIndex = 0;
    }
  } else if (isComplete) {
    effectiveStepIndex = 7;
    effectiveIsComplete = true;
  }

  const runSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setSimStep(0);
  };

  useEffect(() => {
    if (!simulating) return;
    if (simStep >= steps.length) {
      const timeout = setTimeout(() => {
        setSimulating(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setSimStep((prev) => prev + 1);
    }, 850);

    return () => clearTimeout(timer);
  }, [simulating, simStep, steps.length]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-6 shadow-subtle text-slate-900">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Deterministic Resolution Pipeline
            </h3>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">
              7-Step Process
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Structured state machine: Intent &rarr; Evidence &rarr; Decision &rarr; Guard &rarr; Action &rarr; Audit &rarr; Adaptation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showSimulateButton && !effectiveIsRunning && (
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-subtle"
            >
              <Play className="w-3 h-3 text-slate-600 fill-current" />
              <span>Replay Flow</span>
            </button>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Idempotency Guard</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Policy v2.0</span>
          </span>
        </div>
      </div>

      {/* Horizontal Steps Stepper */}
      <div className="pt-5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[680px] gap-2">
          {steps.map((step, idx) => {
            const isFinished = effectiveIsComplete || (effectiveStepIndex > idx);
            const isActive = effectiveIsRunning && (effectiveStepIndex === idx);

            return (
              <React.Fragment key={step.id}>
                <div className="flex-1 flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isFinished
                        ? 'bg-emerald-600 text-white shadow-subtle'
                        : isActive
                        ? 'bg-slate-900 text-white shadow-subtle ring-2 ring-slate-900/20'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isFinished ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      step.number
                    )}
                  </div>

                  <span
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                      isFinished
                        ? 'text-emerald-700'
                        : isActive
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 leading-tight ${
                      isActive ? 'text-slate-700 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-5 flex items-center justify-center">
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isFinished ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live Pipeline Status Ticker */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            effectiveIsRunning
              ? 'bg-amber-500'
              : effectiveIsComplete
              ? 'bg-emerald-500'
              : 'bg-slate-300'
          }`} />
          <span className="font-mono text-slate-700 text-[11px]">
            {effectiveIsRunning
              ? `STEP ${Math.min(effectiveStepIndex + 1, 7)}/7`
              : effectiveIsComplete
              ? 'VERIFIED'
              : 'READY'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 text-xs">
            {statusMessage ||
              (effectiveIsRunning && steps[effectiveStepIndex]
                ? steps[effectiveStepIndex].activeDesc
                : effectiveIsComplete
                ? 'All 7 workflow transitions completed and verified against database.'
                : 'Select any scenario or submit an issue to trigger the live automated resolution workflow.')}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Status: {effectiveIsRunning ? 'RUNNING' : effectiveIsComplete ? 'RESOLVED' : 'IDLE'}
        </div>
      </div>
    </div>
  );
};
