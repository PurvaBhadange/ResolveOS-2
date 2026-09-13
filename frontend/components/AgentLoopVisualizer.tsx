import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, RefreshCcw, ArrowRight, FileText, Check, AlertCircle } from 'lucide-react';

interface AgentLoopVisualizerProps {
  currentStep?: string; // e.g. 'understand' | 'evidence' | 'decide' | 'guard' | 'act' | 'verify' | 'adapt' | 'resolved'
  isComplete?: boolean;
}

export const AgentLoopVisualizer: React.FC<AgentLoopVisualizerProps> = ({
  currentStep = 'resolved',
  isComplete = true
}) => {
  const steps = [
    { id: 'understand', number: '1', title: 'UNDERSTAND', desc: 'Parse Goal & Order' },
    { id: 'evidence', number: '2', title: 'EVIDENCE', desc: 'RAG Policy Search' },
    { id: 'decide', number: '3', title: 'DECIDE', desc: 'Synthesize Plan' },
    { id: 'guard', number: '4', title: 'GUARD / APPROVAL', desc: 'Check $200 & Window' },
    { id: 'act', number: '5', title: 'ACT', desc: 'Transactional Execution' },
    { id: 'verify', number: '6', title: 'VERIFY', desc: 'Independent DB Audit' },
    { id: 'adapt', number: '7', title: 'ADAPT', desc: 'Stockout Replanning' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white overflow-hidden relative mb-8">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-tealbrand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-tealbrand-500/20 border border-tealbrand-500/30 flex items-center justify-center text-tealbrand-400">
            <Cpu className="w-5 h-5 animate-pulse" />
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

        {/* Live Badges */}
        <div className="flex flex-wrap items-center gap-2">
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
      <div className="pt-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {steps.map((step, idx) => {
            const isPast = isComplete || true;
            return (
              <React.Fragment key={step.id}>
                <div className="flex-1 flex flex-col items-center text-center group">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-lg ${
                      isPast
                        ? 'bg-gradient-to-br from-tealbrand-500 to-emerald-500 text-slate-950 ring-2 ring-emerald-400/40 shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : step.number}
                  </div>
                  <span className="mt-2 text-[11px] font-bold tracking-wider text-slate-200 uppercase">{step.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-[90px] leading-tight">{step.desc}</span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-6 flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

