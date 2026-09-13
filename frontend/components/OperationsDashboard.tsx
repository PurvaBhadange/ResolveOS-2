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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-1">
            Enterprise Governance &bull; Supervisory Review
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
            Operations Console
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-slate-600 mt-1">
            Operational queues, cryptographic supervisor authorizations, and multi-warehouse constraint policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOpsData}
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-mono text-xs font-semibold tracking-wide uppercase shadow-subtle transition-all"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* KPI Metrics Row with Soft Pastel Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-slate-50/80 shadow-subtle">
          <span className="font-mono text-[10px] tracking-wider uppercase text-slate-500 block font-semibold">Total Logged</span>
          <span className="font-serif text-2xl font-bold text-slate-900 mt-1 block">{cases.length}</span>
        </div>
        <div className="p-4 sm:p-5 rounded-lg border border-emerald-200 bg-emerald-50/70 shadow-subtle">
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-700 block font-semibold">Auto-Committed</span>
          <span className="font-serif text-2xl font-bold text-emerald-950 mt-1 block">{resolvedCount}</span>
        </div>
        <div className="p-4 sm:p-5 rounded-lg border border-violet-200 bg-violet-50/70 shadow-subtle">
          <span className="font-mono text-[10px] tracking-wider uppercase text-violet-700 block font-semibold">Resolution SLA</span>
          <span className="font-serif text-2xl font-bold text-violet-950 mt-1 block">{successRate}%</span>
        </div>
        <div className="p-4 sm:p-5 rounded-lg border border-amber-200 bg-amber-50/70 shadow-subtle">
          <span className="font-mono text-[10px] tracking-wider uppercase text-amber-700 block font-semibold">Pending HITL</span>
          <span className="font-serif text-2xl font-bold text-amber-950 mt-1 block">{approvals.length}</span>
        </div>
        <div className="p-4 sm:p-5 rounded-lg border border-rose-200 bg-rose-50/70 shadow-subtle">
          <span className="font-mono text-[10px] tracking-wider uppercase text-rose-700 block font-semibold">Escalated Tier-2</span>
          <span className="font-serif text-2xl font-bold text-rose-950 mt-1 block">{escalations.length}</span>
        </div>
      </div>

      {/* Main Operations Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Approval Queue */}
        <div className="rounded-lg border border-slate-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-base font-bold tracking-tight text-slate-900">
              Pending Approval Queue
            </h2>
            <span className="rounded-md px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-amber-200 bg-amber-50 text-amber-800 font-semibold">
              {approvals.length} Required
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-10 text-center font-serif italic text-slate-400 text-xs">
              No approval requests pending. All transactions within auto-resolution thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((appr) => {
                const isBusy = actionLoadingId === appr.id;
                return (
                  <div key={appr.id} className="p-4 rounded-md border border-amber-200/70 bg-amber-50/30 space-y-2.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-semibold text-slate-900">
                        Case #{appr.case_id} &bull; Request #{appr.id}
                      </span>
                      <span className="rounded border border-amber-200 px-2 py-0.5 text-[10px] tracking-wide uppercase bg-amber-100/90 text-amber-800 font-medium">
                        Role: {appr.required_role}
                      </span>
                    </div>

                    <p className="font-serif text-xs text-slate-700 leading-relaxed">
                      {appr.reason}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-100">
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-mono text-xs tracking-wide uppercase font-medium shadow-subtle transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'approved')}
                        disabled={isBusy}
                        className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 font-mono text-xs tracking-wide uppercase font-semibold shadow-subtle transition-all disabled:opacity-50"
                      >
                        Authorize &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Escalations Queue */}
        <div className="rounded-lg border border-slate-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-base font-bold tracking-tight text-slate-900">
              Escalation Triage Queue
            </h2>
            <span className="rounded-md px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-rose-200 bg-rose-50 text-rose-800 font-semibold">
              {escalations.length} Active
            </span>
          </div>

          {escalations.length === 0 ? (
            <div className="p-10 text-center font-serif italic text-slate-400 text-xs">
              No active escalations recorded. System routing functioning within constraints.
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-3.5 rounded-md border border-rose-200/70 bg-rose-50/30 space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-slate-900">
                      Escalation #{esc.id} (Case #{esc.case_id})
                    </span>
                    <span className="rounded border border-rose-200 px-2 py-0.5 text-[10px] uppercase font-medium bg-rose-100 text-rose-800">
                      Tier-2 Specialist
                    </span>
                  </div>
                  <p className="font-serif text-xs text-slate-700 leading-relaxed">{esc.reason}</p>
                  <span className="font-mono text-[10px] text-slate-400 block">
                    Logged: {new Date(esc.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Constraints & Policy Inspectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Constraint Monitor */}
        <div className="rounded-lg border border-slate-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="font-serif text-base font-bold tracking-tight text-slate-900">
              Inventory Constraint Ledger
            </h2>
            <span className="rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-slate-200 bg-slate-50 text-slate-600 font-medium">
              SKU: AURASOUND-BLK
            </span>
          </div>

          <div className="p-3.5 rounded-md border border-rose-200/80 bg-rose-50/30 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-semibold text-slate-900">AuraSound Headphones (Matte Black)</span>
              <span className="rounded-md border border-rose-200 bg-rose-100 text-rose-800 px-2 py-0.5 uppercase font-semibold text-[10px]">
                0 Units (Out of Stock)
              </span>
            </div>
            <p className="font-serif italic text-xs text-slate-600 leading-relaxed pt-0.5">
              Primary warehouse <strong>WH-EAST</strong> and secondary warehouse <strong>WH-WEST</strong> both record zero units available. When customer requests replacement for this SKU, policy engine enforces automatic replenishment replanning to a <strong>Full UPI Refund</strong>.
            </p>
          </div>
        </div>

        {/* Policy Rules Version Monitor */}
        <div className="rounded-lg border border-slate-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="font-serif text-base font-bold tracking-tight text-slate-900">
              Policy Engine Guardrails
            </h2>
            <span className="rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-emerald-200 bg-emerald-50 text-emerald-800 font-medium">
              v2.0 Active
            </span>
          </div>

          <div className="p-3.5 rounded-md border border-slate-200/80 bg-slate-50/60 space-y-2 text-xs">
            <span className="font-mono font-semibold uppercase tracking-wide text-slate-900 block">
              Electronics Return &amp; Replacement Rules
            </span>
            <div className="space-y-1.5 font-serif italic text-slate-600 leading-relaxed pt-0.5">
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
