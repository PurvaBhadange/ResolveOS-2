import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

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
            className="px-4 py-2 border-2 border-black bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-100"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="border-2 border-black bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x-2 divide-black text-left">
          <div className="p-5">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block">Total Logged</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-black mt-1 block">{cases.length}</span>
          </div>
          <div className="p-5">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block">Auto-Committed</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-black mt-1 block">{resolvedCount}</span>
          </div>
          <div className="p-5">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block">Resolution SLA</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-black mt-1 block">{successRate}%</span>
          </div>
          <div className="p-5">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block">Pending HITL</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-black mt-1 block">{approvals.length}</span>
          </div>
          <div className="p-5">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 block">Escalated Tier-2</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-black mt-1 block">{escalations.length}</span>
          </div>
        </div>
      </div>

      {/* Main Operations Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Human Approval Queue */}
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Pending Approval Queue
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white font-bold">
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
                  <div key={appr.id} className="p-4 border-2 border-black bg-neutral-50 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-black">
                        Case #{appr.case_id} &bull; Request #{appr.id}
                      </span>
                      <span className="border border-black px-1.5 py-0.5 text-[10px] tracking-widest uppercase bg-white text-black font-semibold">
                        Role: {appr.required_role}
                      </span>
                    </div>

                    <p className="font-serif text-xs text-neutral-800 leading-relaxed">
                      {appr.reason}
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/20">
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                        disabled={isBusy}
                        className="px-4 py-2 border-2 border-black bg-white text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-black hover:text-white transition-colors duration-100 disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'approved')}
                        disabled={isBusy}
                        className="px-4 py-2 border-2 border-black bg-black text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-white hover:text-black transition-colors duration-100 disabled:opacity-50"
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
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Escalation Triage Queue
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white font-bold">
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
                <div key={esc.id} className="p-4 border-2 border-black bg-neutral-50 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-black">
                      Escalation #{esc.id} (Case #{esc.case_id})
                    </span>
                    <span className="border border-black px-1.5 py-0.5 text-[10px] uppercase font-bold bg-white text-black">
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
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Inventory Constraint Ledger
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-neutral-100 text-black font-semibold">
              SKU: AURASOUND-BLK
            </span>
          </div>

          <div className="p-4 border-2 border-black bg-neutral-50 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-black">AuraSound Headphones (Matte Black)</span>
              <span className="border border-black px-2 py-0.5 uppercase bg-black text-white font-bold">
                0 Units (Out of Stock)
              </span>
            </div>
            <p className="font-serif italic text-xs text-neutral-700 leading-relaxed pt-1">
              Primary warehouse <strong>WH-EAST</strong> and secondary warehouse <strong>WH-WEST</strong> both record zero units available. When customer requests replacement for this SKU, policy engine enforces automatic replenishment replanning to a <strong>Full UPI Refund</strong>.
            </p>
          </div>
        </div>

        {/* Policy Rules Version Monitor */}
        <div className="border-2 border-black p-6 sm:p-8 bg-white space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-black">
              Policy Engine Guardrails
            </h2>
            <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white font-bold">
              v2.0 Active
            </span>
          </div>

          <div className="p-4 border-2 border-black bg-neutral-50 space-y-2 text-xs">
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
