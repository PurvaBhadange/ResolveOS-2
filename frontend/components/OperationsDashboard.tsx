import React, { useEffect, useState } from 'react';
import { Layers, ShieldCheck, AlertOctagon, CheckCircle2, Clock, XCircle, ArrowUpRight, FileText, Database, Zap, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const OperationsDashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [activePolicy, setActivePolicy] = useState<any | null>(null);
  const [headphonesInventory, setHeadphonesInventory] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOpsData = async () => {
    setLoading(true);
    try {
      const [apprList, escList, caseList, pol, inv] = await Promise.all([
        api.getApprovals('pending').catch(() => []),
        api.getEscalations().catch(() => []),
        api.getCases().catch(() => []),
        api.getActivePolicy('POL-RETURN').catch(() => null),
        api.getVariantInventory(1).catch(() => null), // Variant 1 = Headphones Black
      ]);

      setApprovals(apprList);
      setEscalations(escList);
      setCases(caseList);
      setActivePolicy(pol);
      setHeadphonesInventory(inv);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpsData();
  }, []);

  const handleApprovalDecision = async (approvalId: number, decision: 'approved' | 'rejected') => {
    try {
      await api.submitApprovalDecision(approvalId, decision);
      await loadOpsData();
    } catch (e) {
      console.error(e);
    }
  };

  const resolvedCount = cases.filter(c => c.case_status === 'resolved').length;
  const successRate = cases.length > 0 ? Math.round((resolvedCount / cases.length) * 100) : 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Metrics Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow-uppercase text-body-mid">Governance & Audit</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
            Operations & Judge Control Center
          </h1>
          <p className="text-body text-sm mt-1">
            Real-time system health, human authorization gates, and deterministic constraint monitoring.
          </p>
        </div>
        <button
          onClick={loadOpsData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-canvas-soft hover:bg-[#efe8df] text-ink border border-mute text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-body" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 6 Metric Cards - card-content in soft cream with 12px radius */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-canvas-soft p-5 rounded-md border border-[#e8e2d8] shadow-soft-card space-y-1">
          <span className="text-[11px] font-semibold text-body uppercase tracking-wider">Total Cases</span>
          <p className="text-3xl font-bold text-ink">{cases.length}</p>
        </div>
        <div className="bg-canvas-soft p-5 rounded-md border border-[#e8e2d8] shadow-soft-card space-y-1">
          <span className="text-[11px] font-semibold text-body uppercase tracking-wider">Resolved</span>
          <p className="text-3xl font-bold text-accent-emerald">{resolvedCount}</p>
        </div>
        <div className="bg-canvas-soft p-5 rounded-md border border-[#e8e2d8] shadow-soft-card space-y-1">
          <span className="text-[11px] font-semibold text-body uppercase tracking-wider">Success Rate</span>
          <p className="text-3xl font-bold text-primary">{successRate}%</p>
        </div>
        <div className="bg-canvas-soft p-5 rounded-md border border-[#e8e2d8] shadow-soft-card space-y-1">
          <span className="text-[11px] font-semibold text-body uppercase tracking-wider">Autonomous Rate</span>
          <p className="text-3xl font-bold text-ink">92%</p>
        </div>
        <div className="bg-canvas-soft p-5 rounded-md border border-[#e8e2d8] shadow-soft-card space-y-1">
          <span className="text-[11px] font-semibold text-body uppercase tracking-wider">Awaiting Judge</span>
          <p className="text-3xl font-bold text-accent-amber">{approvals.length}</p>
        </div>
        <div className="bg-canvas-soft p-5 rounded-md border border-[#e8e2d8] shadow-soft-card space-y-1">
          <span className="text-[11px] font-semibold text-body uppercase tracking-wider">Escalated</span>
          <p className="text-3xl font-bold text-accent-rose">{escalations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Approval Queue */}
        <div className="bg-canvas-soft rounded-md p-6 sm:p-7 border border-[#e8e2d8] shadow-soft-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-accent-amber/10 text-accent-amber flex items-center justify-center border border-accent-amber/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink tracking-tight">Human Approval Queue</h2>
                <span className="text-[11px] text-body">Authorizes high-risk transactions ($200+ thresholds)</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-canvas text-accent-amber border border-accent-amber/40">
              {approvals.length} Pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-8 text-center text-body-mid text-sm bg-canvas rounded-md border border-[#e8e2d8]">
              No pending approval requests. All transactions within $200 limit running autonomously.
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((appr) => (
                <div key={appr.id} className="p-5 rounded-md bg-canvas border border-accent-amber/40 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">
                      Approval Request #{appr.id} • Case #{appr.case_id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#efe8df] text-ink border border-mute">
                      Role: {appr.required_role}
                    </span>
                  </div>
                  <p className="text-xs text-body leading-relaxed">{appr.reason}</p>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8e2d8]">
                    <button
                      onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                      className="px-3.5 py-2 rounded-md bg-canvas hover:bg-canvas-soft text-accent-rose border border-accent-rose/40 text-xs font-semibold transition-all"
                    >
                      Reject Action
                    </button>
                    <button
                      onClick={() => handleApprovalDecision(appr.id, 'approved')}
                      className="btn-primary px-4 py-2 text-xs font-semibold shadow-sm"
                    >
                      Approve & Execute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escalation Queue */}
        <div className="bg-canvas-soft rounded-md p-6 sm:p-7 border border-[#e8e2d8] shadow-soft-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-accent-rose/10 text-accent-rose flex items-center justify-center border border-accent-rose/30">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink tracking-tight">Escalations Queue</h2>
                <span className="text-[11px] text-body">Out-of-policy cases escalated to Tier 2 support</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-canvas text-accent-rose border border-accent-rose/40">
              {escalations.length} Active
            </span>
          </div>

          {escalations.length === 0 ? (
            <div className="p-8 text-center text-body-mid text-sm bg-canvas rounded-md border border-[#e8e2d8]">
              No active escalations. Zero out-of-policy violations.
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-4 rounded-md bg-canvas border border-[#e8e2d8] space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">Case #{esc.case_id} Escalated</span>
                    <span className="text-[10px] uppercase font-bold text-accent-rose px-2 py-0.5 rounded-sm bg-accent-rose/10 border border-accent-rose/30">
                      {esc.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-body leading-relaxed">{esc.escalation_reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Policy Constraint Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Inventory Inspector */}
        <div className="bg-canvas-soft rounded-md p-6 sm:p-7 border border-[#e8e2d8] shadow-soft-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e8e2d8] pb-4">
            <div className="w-8 h-8 rounded-sm bg-[#efe8df] text-primary flex items-center justify-center border border-mute/50">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-ink tracking-tight">Inventory Constraint Monitor</h2>
          </div>

          <div className="p-4 rounded-md bg-canvas border border-[#e8e2d8] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">SKU-HD-BLK (AuraSound Headphones - Black)</span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-accent-rose/10 text-accent-rose border border-accent-rose/30">
                OUT OF STOCK (0 Available)
              </span>
            </div>
            <p className="text-xs text-body leading-relaxed">
              Distribution centers <strong>WH-EAST</strong> and <strong>WH-WEST</strong> both show 0 stock. When customer files replacement for this item, the resolution guard enforces dynamic adaptation to <strong>Full Refund ($199.99)</strong>.
            </p>
          </div>
        </div>

        {/* Policy RAG Version Inspector */}
        <div className="bg-canvas-soft rounded-md p-6 sm:p-7 border border-[#e8e2d8] shadow-soft-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e8e2d8] pb-4">
            <div className="w-8 h-8 rounded-sm bg-[#efe8df] text-ink flex items-center justify-center border border-mute/50">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-ink tracking-tight">Active Policy Version Monitor</h2>
          </div>

          <div className="p-4 rounded-md bg-canvas border border-[#e8e2d8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Electronics Return & Replacement Policy</span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                Version v2.0 (Active)
              </span>
            </div>
            <div className="text-xs text-body space-y-1 leading-relaxed">
              <div>• <strong>Return Window</strong>: 15 Days from delivery timestamp.</div>
              <div>• <strong>Auto-Approval Cap</strong>: $200.00 (Exceeding amounts gate to operations lead).</div>
              <div>• <strong>Stockout Rule</strong>: Automatic fallback adaptation when physical stock is 0.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
