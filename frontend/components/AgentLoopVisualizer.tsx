import React, { useState, useEffect } from 'react';
import { Check, Loader2, Play, ArrowRight } from 'lucide-react';

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
    { id: 'understand', number: '01', title: 'UNDERSTAND', desc: 'Parse Intent', activeDesc: 'Extracting customer intent & order records...' },
    { id: 'evidence', number: '02', title: 'EVIDENCE', desc: 'Inventory Check', activeDesc: 'Querying warehouse nodes & return policies...' },
    { id: 'decide', number: '03', title: 'DECIDE', desc: 'Plan Synthesis', activeDesc: 'Evaluating candidate plans & confidence scores...' },
    { id: 'guard', number: '04', title: 'GUARD', desc: 'Safety Bounds', activeDesc: 'Validating ₹15k limit, fraud check & windows...' },
    { id: 'act', number: '05', title: 'ACT', desc: 'Execute DB', activeDesc: 'Executing idempotent database state change...' },
    { id: 'verify', number: '06', title: 'VERIFY', desc: 'State Audit', activeDesc: 'Auditing PostgreSQL ledger records...' },
    { id: 'adapt', number: '07', title: 'ADAPT', desc: 'Close Ticket', activeDesc: 'Stockout detected: adapted to refund...' },
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
    <div className="rounded-lg border border-neutral-200/90 p-5 sm:p-6 bg-white shadow-subtle text-neutral-900 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold tracking-tight text-sm text-neutral-900">
              Deterministic Resolution Pipeline
            </h3>
            <span className="rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-neutral-200 bg-neutral-50 text-neutral-600">
              7-Step Protocol
            </span>
          </div>
          <p className="font-serif italic text-xs text-neutral-500 mt-0.5">
            Finite State Machine: Understand &rarr; Evidence &rarr; Decide &rarr; Guard &rarr; Act &rarr; Audit &rarr; Adapt
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showSimulateButton && !effectiveIsRunning && (
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300 bg-white text-neutral-700 font-mono text-xs tracking-wide uppercase hover:bg-neutral-50 hover:border-neutral-400 transition-all shadow-subtle"
            >
              <Play size={11} fill="currentColor" />
              <span>Replay Pipeline</span>
            </button>
          )}

          <span className="rounded px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-neutral-200 bg-neutral-50 text-neutral-600">
            Idempotency Guard
          </span>
          <span className="rounded px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-neutral-200 bg-neutral-50 text-neutral-600">
            Policy v2.0
          </span>
        </div>
      </div>

      {/* Horizontal Steps Stepper */}
      <div className="overflow-x-auto pt-1">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {steps.map((step, idx) => {
            const isFinished = effectiveIsComplete || (effectiveStepIndex > idx);
            const isActive = effectiveIsRunning && (effectiveStepIndex === idx);

            return (
              <React.Fragment key={step.id}>
                <div className="flex-1 flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                      isFinished
                        ? 'bg-neutral-900 text-white shadow-subtle font-semibold'
                        : isActive
                        ? 'bg-white text-neutral-900 border-2 border-neutral-900 ring-2 ring-neutral-200 font-bold'
                        : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                    }`}
                  >
                    {isFinished ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : isActive ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      step.number
                    )}
                  </div>

                  <span
                    className={`mt-2 font-mono text-[10px] tracking-wider uppercase font-semibold ${
                      isFinished || isActive ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`font-serif text-[10px] italic mt-0.5 leading-tight ${
                      isActive ? 'text-neutral-800 font-medium' : 'text-neutral-400'
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-5 flex items-center justify-center">
                    <ArrowRight
                      size={13}
                      strokeWidth={1.5}
                      className={isFinished ? 'text-neutral-700' : 'text-neutral-200'}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live Pipeline Status Ticker */}
      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded uppercase text-[10px] tracking-wider font-semibold border ${
            effectiveIsRunning
              ? 'bg-neutral-900 text-white border-neutral-900'
              : effectiveIsComplete
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
          }`}>
            {effectiveIsRunning
              ? `STEP ${Math.min(effectiveStepIndex + 1, 7)}/07`
              : effectiveIsComplete
              ? 'COMMITTED'
              : 'STANDBY'}
          </span>
          <span className="font-serif italic text-neutral-600 text-xs">
            {statusMessage ||
              (effectiveIsRunning && steps[effectiveStepIndex]
                ? steps[effectiveStepIndex].activeDesc
                : effectiveIsComplete
                ? 'All 7 deterministic state machine transitions verified against ledger.'
                : 'Select any scenario or submit an issue to execute autonomous resolution.')}
          </span>
        </div>

        <div className="text-[10px] uppercase tracking-wider text-neutral-400">
          State: <span className="font-semibold text-neutral-700">{effectiveIsRunning ? 'EXECUTING' : effectiveIsComplete ? 'RESOLVED' : 'IDLE'}</span>
        </div>
      </div>
    </div>
  );
};
