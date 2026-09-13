import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

// ─── 3D Flip KPI Card ─────────────────────────────────────────────────────────
const FlipKpiCard: React.FC<{
  label: string;
  value: string | number;
  backLabel: string;
  backDetail: string;
  className?: string;
}> = ({ label, value, backLabel, backDetail, className = '' }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`flip-card h-24 ${className}`}
      onClick={() => setFlipped((f) => !f)}
      title="Click to flip"
    >
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`} style={{ transform: flipped ? 'rotateY(180deg)' : '' }}>
        {/* Front */}
        <div className="flip-card-front bg-white border-r border-black/10 rounded-none">
          <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block mb-1">{label}</span>
          <span className="font-display text-2xl sm:text-3xl font-bold text-black">{value}</span>
        </div>
        {/* Back */}
        <div className="flip-card-back bg-black text-white rounded-none">
          <span className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 block mb-1">{backLabel}</span>
          <span className="font-serif italic text-sm text-white leading-snug">{backDetail}</span>
        </div>
      </div>
    </div>
  );
};

export const OperationsDashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [activePolicy, setActivePolicy] = useState<any | null>(null);
  const [headphonesInventory, setHeadphonesInventory] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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
    setActionLoadingId(approvalId);
    try {
      await api.submitApprovalDecision(approvalId, decision);
      await loadOpsData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const resolvedCount = cases.filter(c => c.case_status === 'resolved').length;
  const successRate = cases.length > 0 ? Math.round((resolvedCount / cases.length) * 100) : 100;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-1">
            Enterprise Governance &bull; Supervisory Review
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-black">
            Operations Console
          </h1>
          <p className="text-sm font-serif italic text-neutral-700 mt-1">
            Operational queues, cryptographic supervisor authorizations, and multi-warehouse constraint policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadOpsData}
            className="px-4 py-2 border-2 border-black bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-100 rounded-lg"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* KPI Metrics Row — hover or click to flip */}
      <div className="border-2 border-black bg-white rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 divide-x divide-black text-left">
          <FlipKpiCard
            label="Total Logged"
            value={cases.length}
            backLabel="All Cases"
            backDetail="All dispute cases ingested by the resolution engine since deployment."
          />
          <FlipKpiCard
            label="Auto-Committed"
            value={resolvedCount}
            backLabel="Autonomous Resolution"
            backDetail="Cases resolved end-to-end without human intervention within policy guardrails."
          />
          <FlipKpiCard
            label="Resolution SLA"
            value={`${successRate}%`}
            backLabel="Success Rate"
            backDetail="Ratio of auto-committed cases to total cases logged in the current session."
          />
          <FlipKpiCard
            label="Pending HITL"
            value={approvals.length}
            backLabel="Awaiting Authorization"
            backDetail="High-value transactions exceeding ₹15,000 requiring senior ops approval."
          />
          <FlipKpiCard
            label="Escalated Tier-2"
            value={escalations.length}
            backLabel="Policy Boundary Cases"
            backDetail="Cases outside auto-resolution policy windows routed to human specialist queue."
            className="col-span-2 lg:col-span-1"
          />
        </div>
      </div>


      {/* Main Operations Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Human Approval Queue */}
        <div className="border-2 border-black p-4 sm:p-8 bg-white space-y-5 rounded-2xl">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Pending Approval Queue
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white font-bold rounded-md">
              {approvals.length} Required
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-12 text-center font-serif italic text-neutral-500 text-xs">
              No approval requests pending. All transactions within auto-resolution thresholds.
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((appr) => {
                const isBusy = actionLoadingId === appr.id;
                return (
                  <div key={appr.id} className="p-4 border-2 border-black bg-neutral-50 space-y-3 rounded-xl">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-black">
                        Case #{appr.case_id} &bull; Request #{appr.id}
                      </span>
                      <span className="border border-black px-1.5 py-0.5 text-[10px] tracking-widest uppercase bg-white text-black font-semibold rounded-md">
                        Role: {appr.required_role}
                      </span>
                    </div>

                    <p className="font-serif text-xs text-neutral-800 leading-relaxed">
                      {appr.reason}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pt-2 border-t border-black/20">
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                        disabled={isBusy}
                        className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-white text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-black hover:text-white transition-colors duration-100 disabled:opacity-50 rounded-lg text-center"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'approved')}
                        disabled={isBusy}
                        className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-black text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-white hover:text-black transition-colors duration-100 disabled:opacity-50 rounded-lg text-center"
                      >
                        Authorize Settlement &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Escalations Queue */}
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-5 rounded-2xl">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Escalation Triage Queue
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white font-bold rounded-md">
              {escalations.length} Active
            </span>
          </div>

          {escalations.length === 0 ? (
            <div className="p-12 text-center font-serif italic text-neutral-500 text-xs">
              No active escalations recorded. System routing functioning within constraints.
            </div>
          ) : (
            <div className="space-y-4">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-4 border-2 border-black bg-neutral-50 space-y-2 rounded-xl">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-black">
                      Escalation #{esc.id} (Case #{esc.case_id})
                    </span>
                    <span className="border border-black px-1.5 py-0.5 text-[10px] uppercase font-bold bg-white text-black rounded-md">
                      Tier-2 Specialist
                    </span>
                  </div>
                  <p className="font-serif text-xs text-neutral-800 leading-relaxed">{esc.reason}</p>
                  <span className="font-mono text-[10px] text-neutral-500 block">
                    Logged: {new Date(esc.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Constraints & Policy Inspectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Constraint Monitor */}
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Inventory Constraint Ledger
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-neutral-100 text-black font-semibold rounded-md">
              SKU: AURASOUND-BLK
            </span>
          </div>

          <div className="p-4 border-2 border-black bg-neutral-50 space-y-2 rounded-xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-black">AuraSound Headphones (Matte Black)</span>
              <span className="border border-black px-2 py-0.5 uppercase bg-black text-white font-bold rounded-md">
                0 Units (Out of Stock)
              </span>
            </div>
            <p className="font-serif italic text-xs text-neutral-700 leading-relaxed pt-1">
              Primary warehouse <strong>WH-EAST</strong> and secondary warehouse <strong>WH-WEST</strong> both record zero units available. When customer requests replacement for this SKU, policy engine enforces automatic replenishment replanning to a <strong>Full UPI Refund</strong>.
            </p>
          </div>
        </div>

        {/* Policy Rules Version Monitor */}
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-4 rounded-2xl">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Policy Engine Guardrails
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white font-bold rounded-md">
              v2.0 Active
            </span>
          </div>

          <div className="p-4 border-2 border-black bg-neutral-50 space-y-2 text-xs rounded-xl">
            <span className="font-mono font-bold uppercase tracking-wider text-black block">
              Electronics Return &amp; Replacement Rules
            </span>
            <div className="space-y-1.5 font-serif italic text-neutral-700 leading-relaxed pt-1">
              <p>&bull; <strong>Return Window Constraint</strong>: 15 days from verified carrier delivery timestamp.</p>
              <p>&bull; <strong>Safety Cap Threshold</strong>: ₹15,000.00 (Claims exceeding limit enforce cryptographic halt for supervisory sign-off).</p>
              <p>&bull; <strong>Stockout Replanning</strong>: Mandatory replanning to immediate UPI / card reversal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
