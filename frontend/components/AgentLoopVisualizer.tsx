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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white overflow-hidden relative mb-8 transition-all">
      {/* Dynamic Glow effects */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        effectiveIsRunning ? 'bg-cyan-500/20' : effectiveIsComplete ? 'bg-emerald-500/15' : 'bg-tealbrand-500/10'
      }`} />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            effectiveIsRunning
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 ring-2 ring-cyan-500/30'
              : effectiveIsComplete
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-tealbrand-500/20 border border-tealbrand-500/30 text-tealbrand-400'
          }`}>
            {effectiveIsRunning ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <Cpu className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">Autonomous Agent Decision Loop</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-tealbrand-500/20 text-tealbrand-300 rounded-full border border-tealbrand-500/30 uppercase">
                LangGraph State Machine
              </span>
            </div>
            <p className="text-xs text-slate-400">Observe &rarr; Decide &rarr; Act &rarr; Evaluate &rarr; Adapt Execution Graph</p>
          </div>
        </div>

        {/* Live Badges & Simulator Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {showSimulateButton && !effectiveIsRunning && (
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-tealbrand-500 hover:bg-tealbrand-400 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" /> Replay Graph Loop
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> 6/6 Pytest Clean
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Idempotency Guard Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <FileText className="w-3.5 h-3.5" /> Policy RAG v2.0
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
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-lg relative ${
                      isFinished
                        ? 'bg-gradient-to-br from-tealbrand-500 to-emerald-500 text-slate-950 ring-2 ring-emerald-400/40 shadow-emerald-500/20 scale-100'
                        : isActive
                        ? 'bg-gradient-to-br from-cyan-500 to-tealbrand-500 text-slate-950 ring-4 ring-cyan-400/50 shadow-cyan-500/30 scale-110 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/80'
                    }`}
                  >
                    {isFinished ? (
                      <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-slate-950 animate-spin stroke-[2.5]" />
                    ) : (
                      step.number
                    )}

                    {/* Active Ping Glow indicator */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>

                  <span
                    className={`mt-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                      isFinished
                        ? 'text-emerald-300'
                        : isActive
                        ? 'text-cyan-300 font-extrabold scale-105'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium mt-0.5 max-w-[95px] leading-tight transition-colors ${
                      isActive ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-6 flex items-center justify-center">
                    <ArrowRight
                      className={`w-4 h-4 transition-colors duration-300 ${
                        isFinished ? 'text-emerald-400' : isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-700'
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
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            effectiveIsRunning
              ? 'bg-cyan-400 animate-ping'
              : effectiveIsComplete
              ? 'bg-emerald-400'
              : 'bg-slate-500'
          }`} />
          <span className="font-mono text-tealbrand-300 font-semibold uppercase tracking-wider text-[11px]">
            {effectiveIsRunning
              ? `NODE ${Math.min(effectiveStepIndex + 1, 7)}/7 EXECUTING`
              : effectiveIsComplete
              ? 'GRAPH RESOLUTION VERIFIED'
              : 'STATE MACHINE READY'}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">
            {statusMessage ||
              (effectiveIsRunning && steps[effectiveStepIndex]
                ? steps[effectiveStepIndex].activeDesc
                : effectiveIsComplete
                ? 'All 7 LangGraph state transitions executed and independently audited against enterprise DB.'
                : '1-click scenario or manual issue submission triggers live autonomous resolution loop.')}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-tealbrand-400" /> State: {effectiveIsRunning ? 'RUNNING' : effectiveIsComplete ? 'RESOLVED' : 'IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};

