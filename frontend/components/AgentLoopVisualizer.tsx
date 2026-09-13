import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, FileText, Check, ArrowRight } from 'lucide-react';

interface AgentLoopVisualizerProps {
  currentStep?: string;
  isComplete?: boolean;
}

export const AgentLoopVisualizer: React.FC<AgentLoopVisualizerProps> = ({
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
    <div className="bg-[#201515] border border-[#36342e] rounded-[12px] p-6 shadow-xl text-[#fffefb] overflow-hidden relative mb-8">
      {/* Zapier Orange Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4f00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#36342e]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#ff4f00]/20 border border-[#ff4f00]/40 flex items-center justify-center text-[#ff4f00]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#fffefb] tracking-tight">Autonomous Agent Decision Loop</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#ff4f00] text-[#fffefb] rounded-full uppercase tracking-wider">
                LangGraph Engine
              </span>
            </div>
            <p className="text-xs text-[#c5c0b1] mt-0.5">Observe → Decide → Act → Evaluate → Adapt Execution Graph</p>
          </div>
        </div>

        {/* Live Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] text-xs font-semibold bg-[#f8f4f0]/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> 6/6 Pytest Clean
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] text-xs font-semibold bg-[#f8f4f0]/10 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Idempotency Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] text-xs font-semibold bg-[#f8f4f0]/10 text-[#ff4f00] border border-[#ff4f00]/30">
            <FileText className="w-3.5 h-3.5" /> Policy RAG v2.0
          </span>
        </div>
      </div>

      {/* Nodes Horizontal Flow */}
      <div className="pt-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {steps.map((step, idx) => {
            const isPast = isComplete;
            return (
              <React.Fragment key={step.id}>
                <div className="flex-1 flex flex-col items-center text-center group">
                  <div
                    className={`w-9 h-9 rounded-[12px] flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                      isPast
                        ? 'bg-[#ff4f00] text-[#fffefb] shadow-[#ff4f00]/30'
                        : 'bg-[#2f2a26] text-[#c5c0b1] border border-[#36342e]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 text-[#fffefb] stroke-[3]" /> : step.number}
                  </div>
                  <span className="mt-2 text.11px font-bold tracking-wider text-[#fffefb] uppercase">{step.title}</span>
                  <span className="text-[10px] text-[#c5c0b1] font-medium mt-0.5 max-w-[90px] leading-tight">{step.desc}</span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="w-5 flex items-center justify-center text-[#605d52]">
                    <ArrowRight className="w-4 h-4 text-[#939084]" />
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
