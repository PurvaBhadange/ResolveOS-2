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
    <div className="border-2 border-black p-6 sm:p-8 bg-white text-black space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-display font-bold uppercase tracking-wider text-base text-black">
              Deterministic Pipeline
            </h3>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white">
              7-Step Protocol
            </span>
          </div>
          <p className="font-serif italic text-xs text-neutral-600 mt-0.5">
            Finite State Machine: Understand &rarr; Evidence &rarr; Decide &rarr; Guard &rarr; Act &rarr; Audit &rarr; Adapt
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {showSimulateButton && !effectiveIsRunning && (
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white text-black font-mono text-xs tracking-wider uppercase hover:bg-black hover:text-white transition-colors duration-100"
            >
              <Play size={12} fill="currentColor" />
              <span>Replay Pipeline</span>
            </button>
          )}

          <span className="border border-black px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase bg-neutral-100 text-black">
            Idempotency Guard Active
          </span>
          <span className="border border-black px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase bg-neutral-100 text-black">
            Policy v2.0
          </span>
        </div>
      </div>

      {/* Horizontal Steps Stepper */}
      <div className="overflow-x-auto pt-2">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {steps.map((step, idx) => {
            const isFinished = effectiveIsComplete || (effectiveStepIndex > idx);
            const isActive = effectiveIsRunning && (effectiveStepIndex === idx);

            return (
              <React.Fragment key={step.id}>
                <div className="flex-1 flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 border-2 flex items-center justify-center font-mono text-xs tracking-wider transition-colors duration-100 ${
                      isFinished
                        ? 'bg-black text-white border-black font-bold'
                        : isActive
                        ? 'bg-white text-black border-2 border-black ring-2 ring-black font-bold'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-300'
                    }`}
                  >
                    {isFinished ? (
                      <Check size={16} strokeWidth={2.5} />
                    ) : isActive ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      step.number
                    )}
                  </div>

                  <span
                    className={`mt-2.5 font-mono text-[11px] tracking-widest uppercase font-bold ${
                      isFinished || isActive ? 'text-black' : 'text-neutral-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`font-serif text-[11px] italic mt-0.5 leading-tight ${
                      isActive ? 'text-black font-semibold' : 'text-neutral-500'
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-6 flex items-center justify-center">
                    <ArrowRight
                      size={14}
                      strokeWidth={1.5}
                      className={isFinished ? 'text-black' : 'text-neutral-300'}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live Pipeline Status Ticker */}
      <div className="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 border border-black uppercase text-[10px] tracking-widest font-bold ${
            effectiveIsRunning
              ? 'bg-black text-white'
              : effectiveIsComplete
              ? 'bg-black text-white'
              : 'bg-neutral-100 text-neutral-600'
          }`}>
            {effectiveIsRunning
              ? `STEP ${Math.min(effectiveStepIndex + 1, 7)}/07`
              : effectiveIsComplete
              ? 'COMMITTED'
              : 'STANDBY'}
          </span>
          <span className="font-serif italic text-neutral-700 text-xs">
            {statusMessage ||
              (effectiveIsRunning && steps[effectiveStepIndex]
                ? steps[effectiveStepIndex].activeDesc
                : effectiveIsComplete
                ? 'All 7 deterministic state machine transitions verified against ledger.'
                : 'Select any scenario or submit an issue to execute autonomous resolution.')}
          </span>
        </div>

        <div className="text-[11px] uppercase tracking-widest text-neutral-500">
          State: <span className="font-bold text-black">{effectiveIsRunning ? 'EXECUTING' : effectiveIsComplete ? 'RESOLVED' : 'IDLE'}</span>
        </div>
      </div>
    </div>
  );
};
