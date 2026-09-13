import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, XCircle, FileText, Database, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Operations Governance &amp; Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational queues, human approval authorization gates, and warehouse constraint policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOpsData}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-subtle"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-left">
          <div className="p-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Cases</span>
            <span className="text-xl font-semibold text-slate-900 mt-1 block">{cases.length}</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Auto-Resolved</span>
            <span className="text-xl font-semibold text-emerald-700 mt-1 block">{resolvedCount}</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Resolution Rate</span>
            <span className="text-xl font-semibold text-slate-900 mt-1 block">{successRate}%</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-xl font-semibold text-amber-600 mt-1 block">{approvals.length}</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Escalated Tickets</span>
            <span className="text-xl font-semibold text-rose-600 mt-1 block">{escalations.length}</span>
          </div>
        </div>
      </div>

      {/* Main Operations Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Approval Queue */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-slate-900">Pending Approval Queue</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {approvals.length} Required
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No approval requests pending. All transactions within auto-resolution thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((appr) => {
                const isBusy = actionLoadingId === appr.id;
                return (
                  <div key={appr.id} className="p-3.5 rounded-md bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 font-mono">
                        Case #{appr.case_id} &bull; Request #{appr.id}
                      </span>
                      <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Authority: {appr.required_role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-normal">
                      {appr.reason}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'approved')}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-subtle disabled:opacity-50"
                      >
                        Authorize Transaction
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Escalations Queue */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-semibold text-slate-900">Escalated Tickets Queue</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200">
              {escalations.length} Active
            </span>
          </div>

          {escalations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No active escalations recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-3.5 rounded-md bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 font-mono">
                      Escalation #{esc.id} (Case #{esc.case_id})
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                      Tier-2 Support
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-normal">{esc.reason}</p>
                  <span className="text-[10px] text-slate-400 block font-mono">
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
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900">Inventory Constraint Monitor</h2>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              SKU: AURASOUND-BLK
            </span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-900">AuraSound Headphones (Matte Black)</span>
              <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                0 In Stock (Out of Stock)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Primary warehouse <strong>WH-EAST</strong> and secondary warehouse <strong>WH-WEST</strong> both show 0 units available. When customer requests replacement for this SKU, the rule engine automatically adapts to a <strong>Full UPI Refund</strong>.
            </p>
          </div>
        </div>

        {/* Policy Rules Version Monitor */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900">Policy Rules Monitor</h2>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              v2.0 Active
            </span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-semibold text-slate-900 block">Electronics Return &amp; Replacement Rules</span>
            <div className="space-y-1 text-slate-600 leading-normal">
              <p>&bull; <strong>Return Cutoff Window</strong>: 15 days from verified delivery date.</p>
              <p>&bull; <strong>Auto-Refund Safety Cap</strong>: ₹15,000.00 (Exceeding values require supervisor review).</p>
              <p>&bull; <strong>Out-of-Stock Fallback</strong>: Mandatory replanning to immediate UPI / card refund.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
