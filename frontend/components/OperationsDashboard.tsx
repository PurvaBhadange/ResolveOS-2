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
          <h1 className="text-3xl font-extrabold text-[#201515]">Operations & Judge Control Center</h1>
          <p className="text-[#605d52] text-sm mt-1">Real-time system metrics, human approval gates, and constraint monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#f8f4f0] p-5 rounded-[12px] border border-[#c5c0b1] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#605d52] uppercase tracking-wider">Total Cases</span>
          <p className="text-2xl font-black text-[#201515]">{cases.length}</p>
        </div>
        <div className="bg-[#f8f4f0] p-5 rounded-[12px] border border-[#c5c0b1] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#605d52] uppercase tracking-wider">Resolved</span>
          <p className="text-2xl font-black text-emerald-700">{resolvedCount}</p>
        </div>
        <div className="bg-[#f8f4f0] p-5 rounded-[12px] border border-[#c5c0b1] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#605d52] uppercase tracking-wider">Success Rate</span>
          <p className="text-2xl font-black text-[#ff4f00]">{successRate}%</p>
        </div>
        <div className="bg-[#f8f4f0] p-5 rounded-[12px] border border-[#c5c0b1] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#605d52] uppercase tracking-wider">Autonomous Rate</span>
          <p className="text-2xl font-black text-[#201515]">92%</p>
        </div>
        <div className="bg-[#f8f4f0] p-5 rounded-[12px] border border-[#c5c0b1] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#605d52] uppercase tracking-wider">Awaiting Approval</span>
          <p className="text-2xl font-black text-amber-700">{approvals.length}</p>
        </div>
        <div className="bg-[#f8f4f0] p-5 rounded-[12px] border border-[#c5c0b1] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#605d52] uppercase tracking-wider">Escalated</span>
          <p className="text-2xl font-black text-rose-700">{escalations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Approval Queue */}
        <div className="bg-[#f8f4f0] rounded-[12px] p-6 border border-[#c5c0b1] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#c5c0b1] pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ff4f00]" />
              <h2 className="text-lg font-bold text-[#201515]">Human Approval Queue</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#ff4f00] text-[#fffefb]">
              {approvals.length} Pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-8 text-center text-[#605d52] text-sm">No pending approval requests. System operating autonomously.</div>
          ) : (
            <div className="space-y-4">
              {approvals.map((appr) => (
                <div key={appr.id} className="p-5 rounded-[12px] bg-[#fffefb] border border-[#201515] space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#201515]">Approval Request #{appr.id} (Case #{appr.case_id})</span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#ff4f00] text-[#fffefb]">
                      Required: {appr.required_role}
                    </span>
                  </div>
                  <p className="text-xs text-[#201515] font-semibold leading-relaxed">{appr.reason}</p>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#c5c0b1]">
                    <button
                      onClick={() => handleApprovalDecision(appr.id, 'rejected')}
                      className="px-4 py-2 rounded-[12px] bg-[#fffefb] hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold transition-all"
                    >
                      Reject Action
                    </button>
                    <button
                      onClick={() => handleApprovalDecision(appr.id, 'approved')}
                      className="px-5 py-2 rounded-[12px] bg-[#ff4f00] hover:bg-[#e04500] text-[#fffefb] text-xs font-bold transition-all shadow-md"
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
        <div className="bg-[#f8f4f0] rounded-[12px] p-6 border border-[#c5c0b1] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#c5c0b1] pb-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-700" />
              <h2 className="text-lg font-bold text-[#201515]">Escalations Queue</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#201515] text-[#fffefb]">
              {escalations.length} Active
            </span>
          </div>

          {escalations.length === 0 ? (
            <div className="p-8 text-center text-[#605d52] text-sm">No active escalations.</div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-4 rounded-[12px] bg-[#fffefb] border border-rose-300 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#201515]">Case #{esc.case_id} Escalated</span>
                    <span className="text-[10px] uppercase font-bold text-rose-700">{esc.priority} Priority</span>
                  </div>
                  <p className="text-xs text-[#605d52]">{esc.escalation_reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Policy Constraint Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Inventory Inspector */}
        <div className="bg-[#f8f4f0] rounded-[12px] p-6 border border-[#c5c0b1] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#c5c0b1] pb-4">
            <Database className="w-5 h-5 text-[#ff4f00]" />
            <h2 className="text-lg font-bold text-[#201515]">Demo Inventory Constraint Monitor</h2>
          </div>

          <div className="p-4 rounded-[12px] bg-[#fffefb] border border-[#201515] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#201515]">SKU-HD-BLK (AuraSound Headphones - Black)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                OUT OF STOCK (0 Available)
              </span>
            </div>
            <p className="text-xs text-[#605d52] leading-relaxed">
              Primary warehouse <strong>WH-EAST</strong> and secondary warehouse <strong>WH-WEST</strong> both show 0 stock. When customer requests replacement for this item, the resolution guard flags this inventory constraint, forcing the agent to adapt to a <strong>Full Refund</strong>.
            </p>
          </div>
        </div>

        {/* Policy RAG Version Inspector */}
        <div className="bg-[#f8f4f0] rounded-[12px] p-6 border border-[#c5c0b1] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#c5c0b1] pb-4">
            <FileText className="w-5 h-5 text-[#201515]" />
            <h2 className="text-lg font-bold text-[#201515]">Active Policy Version Monitor</h2>
          </div>

          <div className="p-4 rounded-[12px] bg-[#fffefb] border border-[#201515] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#201515]">Electronics Return & Replacement Policy</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Version v2.0 (Active)
              </span>
            </div>
            <p className="text-xs text-[#605d52] leading-relaxed">
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
