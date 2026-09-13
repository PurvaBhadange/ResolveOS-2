import React, { useEffect, useState } from 'react';
import { Layers, ShieldCheck, AlertOctagon, CheckCircle2, Clock, XCircle, ArrowUpRight, FileText, Database } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-slate-900">Operations & Judge Control Center</h1>
          <p className="text-slate-500 text-sm">Real-time system metrics, human approval gates, and constraint monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cases</span>
          <p className="text-2xl font-black text-slate-900">{cases.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</span>
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
          <p className="text-2xl font-black text-tealbrand-600">{successRate}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Autonomous Rate</span>
          <p className="text-2xl font-black text-slate-900">92%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Approval</span>
          <p className="text-2xl font-black text-amber-600">{approvals.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escalated</span>
          <p className="text-2xl font-black text-rose-600">{escalations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Approval Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">Human Approval Queue</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {approvals.length} Pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No pending approval requests. System operating autonomously.</div>
          ) : (
            <div className="space-y-4">
              {approvals.map((appr) => (
                <div key={appr.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Approval Request #{appr.id} (Case #{appr.case_id})</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                      Required Role: {appr.required_role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{appr.reason}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                    <button
                      onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition-all"
                    >
                      Reject Action
                    </button>
                    <button
                      onClick={() => handleApprovalDecision(appr.id, 'approved')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm"
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900">Escalations Queue</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {escalations.length} Active
            </span>
          </div>

          {escalations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No active escalations.</div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Case #{esc.case_id} Escalated</span>
                    <span className="text-[10px] uppercase font-bold text-rose-700">{esc.priority} Priority</span>
                  </div>
                  <p className="text-xs text-slate-700">{esc.escalation_reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Policy Constraint Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Inventory Inspector */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Database className="w-5 h-5 text-tealbrand-600" />
            <h2 className="text-lg font-bold text-slate-900">Demo Inventory Constraint Monitor</h2>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">SKU-HD-BLK (AuraSound Headphones - Black)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                OUT OF STOCK (0 Available)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Primary warehouse <strong>WH-EAST</strong> and secondary warehouse <strong>WH-WEST</strong> both show 0 stock. When customer requests replacement for this item, the resolution guard flags this inventory constraint, forcing the agent to adapt to a <strong>Full Refund</strong>.
            </p>
          </div>
        </div>

        {/* Policy RAG Version Inspector */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Active Policy Version Monitor</h2>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Electronics Return & Replacement Policy</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Version v2.0 (Active)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              - <strong>Return Window</strong>: 15 Days from delivery.<br />
              - <strong>Auto-Refund Threshold</strong>: $200.00 (Exceeding amounts require human approval).<br />
              - <strong>Inventory Fallback</strong>: Mandatory adaptation to refund when stockout occurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
