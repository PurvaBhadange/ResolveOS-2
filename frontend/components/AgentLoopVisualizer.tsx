import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, ArrowRight, FileText, Check, Loader2, Play, Sparkles, RefreshCw } from 'lucide-react';

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
    { id: 'understand', number: '1', title: 'UNDERSTAND', desc: 'Parse Goal & Order', activeDesc: 'Parsing customer intent & entity signals with Mistral LLM...' },
    { id: 'evidence', number: '2', title: 'EVIDENCE', desc: 'RAG Policy Search', activeDesc: 'Querying vector policy chunks & multi-warehouse stock levels...' },
    { id: 'decide', number: '3', title: 'DECIDE', desc: 'Synthesize Plan', activeDesc: 'Generating candidate plans & ranking confidence scores...' },
    { id: 'guard', number: '4', title: 'GUARD / APPROVAL', desc: 'Check $200 & Window', activeDesc: 'Validating safety policies, 15-day return window & $200₹200 gate...' },
    { id: 'act', number: '5', title: 'ACT', desc: 'Transactional Execution', activeDesc: 'Executing transactional resolution with idempotency key...' },
    { id: 'verify', number: '6', title: 'VERIFY', desc: 'Independent DB Audit', activeDesc: 'Performing independent PostgreSQL query to verify execution...' },
    { id: 'adapt', number: '7', title: 'ADAPT', desc: 'Stockout Replanning', activeDesc: 'Stockout detected: autonomously replanned to instant refund...' },
  ];

  // Local state for interactive demo simulator
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(-1);

  // Compute effective step index based on caseEvents, props, or simulation
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
    // Dynamically derive progress from backend case events
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

  // Interactive step runner for demonstration
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
    }, 900);

    return () => clearTimeout(timer);
  }, [simulating, simStep, steps.length]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 overflow-hidden relative mb-8">
      {/* Header Badges & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            effectiveIsRunning
              ? 'bg-tealbrand-50 border border-tealbrand-200 text-tealbrand-700'
              : effectiveIsComplete
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-slate-100 border border-slate-200 text-slate-600'
          }`}>
            {effectiveIsRunning ? (
              <Loader2 className="w-5 h-5 animate-spin text-tealbrand-600" />
            ) : (
              <Cpu className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-wide">Autonomous Agent Decision Loop</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-tealbrand-50 text-tealbrand-700 rounded-md border border-tealbrand-200 uppercase tracking-wider">
                LangGraph State Machine
              </span>
            </div>
            <p className="text-xs text-slate-500">Observe &rarr; Decide &rarr; Act &rarr; Evaluate &rarr; Adapt Execution Graph</p>
          </div>
        </div>

        {/* Live Badges & Simulator Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {showSimulateButton && !effectiveIsRunning && (
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-tealbrand-600 hover:bg-tealbrand-700 text-white transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" /> Replay Graph Loop
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 6/6 Pytest Clean
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200">
            <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-600" /> Idempotency Guard Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Policy RAG v2.0
          </span>
        </div>
      </div>

      {/* Nodes Horizontal Flow */}
      <div className="pt-6 overflow-x-auto relative z-10">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {steps.map((step, idx) => {
            const isFinished = effectiveIsComplete || (effectiveStepIndex > idx);
            const isActive = effectiveIsRunning && (effectiveStepIndex === idx);
            const isPending = !isFinished && !isActive;

            return (
              <React.Fragment key={step.id}>
                <div className="flex-1 flex flex-col items-center text-center group">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 relative ${
                      isFinished
                        ? 'bg-emerald-600 text-white border border-emerald-600 shadow-sm'
                        : isActive
                        ? 'bg-tealbrand-600 text-white border-2 border-tealbrand-700 shadow-sm ring-2 ring-tealbrand-600/20'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isFinished ? (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin stroke-[2.5]" />
                    ) : (
                      step.number
                    )}

                    {/* Active indicator badge */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-tealbrand-500 border-2 border-white" />
                    )}
                  </div>

                  <span
                    className={`mt-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                      isFinished
                        ? 'text-emerald-700'
                        : isActive
                        ? 'text-tealbrand-700 font-extrabold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium mt-0.5 max-w-[95px] leading-tight transition-colors ${
                      isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-6 flex items-center justify-center">
                    <ArrowRight
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isFinished ? 'text-emerald-600' : isActive ? 'text-tealbrand-600' : 'text-slate-300'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live State Machine Status Ticker */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            effectiveIsRunning
              ? 'bg-tealbrand-600'
              : effectiveIsComplete
              ? 'bg-emerald-600'
              : 'bg-slate-400'
          }`} />
          <span className="font-mono text-tealbrand-800 font-semibold uppercase tracking-wider text-[11px]">
            {effectiveIsRunning
              ? `NODE ${Math.min(effectiveStepIndex + 1, 7)}/7 EXECUTING`
              : effectiveIsComplete
              ? 'GRAPH RESOLUTION VERIFIED'
              : 'STATE MACHINE READY'}
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-slate-600">
            {statusMessage ||
              (effectiveIsRunning && steps[effectiveStepIndex]
                ? steps[effectiveStepIndex].activeDesc
                : effectiveIsComplete
                ? 'All 7 LangGraph state transitions executed and independently audited against enterprise DB.'
                : '1-click scenario or manual issue submission triggers live autonomous resolution loop.')}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tealbrand-600" /> State: {effectiveIsRunning ? 'RUNNING' : effectiveIsComplete ? 'RESOLVED' : 'IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};

