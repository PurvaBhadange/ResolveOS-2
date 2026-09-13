import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Truck,
  Package,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { AgentLoopVisualizer } from './AgentLoopVisualizer';

interface HelpCenterProps {
  onCaseCreated: (caseId: number) => void;
  setActiveTab: (tab: string) => void;
  prefillOrderNumber?: string;
}

export const CustomerHelpCenter: React.FC<HelpCenterProps> = ({
  onCaseCreated,
  setActiveTab,
  prefillOrderNumber = 'ORD-2026-8801',
}) => {
  const [orderNumber, setOrderNumber] = useState<string>(prefillOrderNumber);
  const [selectedCategory, setSelectedCategory] = useState<string>('damaged');
  const [issueTitle, setIssueTitle] = useState<string>('Headphones arrived damaged - Request replacement');
  const [issueDescription, setIssueDescription] = useState<string>(
    'My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active scenario preset tracker
  const [activePreset, setActivePreset] = useState<string>('stockout');

  // Dynamic state machine loop states
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isLoopComplete, setIsLoopComplete] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Ready. Select a test scenario below or submit an issue to execute autonomous resolution.'
  );

  // Order preview state
  const [orderPreview, setOrderPreview] = useState<any | null>({
    order_number: 'ORD-2026-8801',
    total_amount: '199.99',
    order_status: 'delivered',
    item_title: 'AuraSound Headphones - Matte Black',
    carrier: 'Blue Dart Express',
    tracking: 'BLUEDART-8801-IN',
  });

  const stepDescriptions = [
    '01/07 [UNDERSTAND]: Extracting customer intent & analyzing order records...',
    '02/07 [EVIDENCE]: Querying warehouse stock levels & policy return rules...',
    '03/07 [DECIDE]: Evaluating plan candidates & ranking confidence scores...',
    '04/07 [GUARD]: Checking ₹15,000 threshold, fraud risk & policy return windows...',
    '05/07 [ACT]: Executing transactional state change with idempotency key...',
    '06/07 [VERIFY]: Re-querying PostgreSQL database to independently audit outcome...',
    '07/07 [ADAPT]: Validating resolution adaptation & closing support ticket...',
  ];

  const presets = [
    {
      id: 'stockout',
      num: '01',
      title: 'Stockout Adaptation',
      order: 'ORD-2026-8801',
      amount: '₹199.99',
      badge: 'Auto-Replanning',
      badgeStyle: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
      activeCardStyle: 'bg-emerald-100/80 text-emerald-950 border-emerald-400 ring-2 ring-emerald-300/40',
      inactiveCardStyle: 'bg-emerald-50/50 hover:bg-emerald-50/90 text-emerald-950 border-emerald-200/80',
      desc: 'Headphones delivered damaged. Warehouse stock is 0, so system automatically adapts replacement request to an instant UPI refund.',
      category: 'damaged',
      issueTitle: 'Headphones arrived damaged - Request replacement',
      issueDesc: 'My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.',
      preview: {
        order_number: 'ORD-2026-8801',
        total_amount: '199.99',
        order_status: 'delivered',
        item_title: 'AuraSound Headphones - Matte Black',
        carrier: 'Blue Dart Express',
        tracking: 'BLUEDART-8801-IN',
      }
    },
    {
      id: 'high_value',
      num: '02',
      title: 'High-Value Approval',
      order: 'ORD-2026-8802',
      amount: '₹499.98',
      badge: 'HITL Gate',
      badgeStyle: 'bg-amber-100/90 text-amber-800 border-amber-300',
      activeCardStyle: 'bg-amber-100/80 text-amber-950 border-amber-400 ring-2 ring-amber-300/40',
      inactiveCardStyle: 'bg-amber-50/50 hover:bg-amber-50/90 text-amber-950 border-amber-200/80',
      desc: 'Smartwatch Bundle exceeds safety limit (₹15,000). System halts execution and routes ticket to Operations Approval Queue.',
      category: 'damaged',
      issueTitle: 'Damaged Smartwatch Bundle - Request refund (₹499.98)',
      issueDesc: 'Apex Smartwatch arrived defective with touchscreen unresponsiveness. Requesting full refund of ₹499.98.',
      preview: {
        order_number: 'ORD-2026-8802',
        total_amount: '499.98',
        order_status: 'delivered',
        item_title: 'Apex Fit Pro Smartwatch (Obsidian Black)',
        carrier: 'Delhivery Surface',
        tracking: 'DELHIVERY-8802-IN',
      }
    },
    {
      id: 'expired',
      num: '03',
      title: 'Expired Return Window',
      order: 'ORD-2026-8803',
      amount: '₹89.99',
      badge: 'Policy Guardrail',
      badgeStyle: 'bg-rose-100/90 text-rose-800 border-rose-300',
      activeCardStyle: 'bg-rose-100/80 text-rose-950 border-rose-400 ring-2 ring-rose-300/40',
      inactiveCardStyle: 'bg-rose-50/50 hover:bg-rose-50/90 text-rose-950 border-rose-200/80',
      desc: 'Earbuds delivered 40 days ago. Policy engine enforces 15-day return cutoff and safely routes case to tier-2 support team.',
      category: 'returns',
      issueTitle: 'Return wireless earbuds - Delivered 40 days ago',
      issueDesc: 'Requesting return and refund for Pulse Earbuds delivered 40 days ago.',
      preview: {
        order_number: 'ORD-2026-8803',
        total_amount: '89.99',
        order_status: 'delivered',
        item_title: 'Pulse True Wireless Earbuds (White)',
        carrier: 'Ekart Logistics',
        tracking: 'EKART-8803-IN',
      }
    },
    {
      id: 'cancel',
      num: '04',
      title: 'Pre-Shipment Cancel',
      order: 'ORD-2026-8804',
      amount: '₹129.99',
      badge: 'Immediate Action',
      badgeStyle: 'bg-sky-100/90 text-sky-800 border-sky-300',
      activeCardStyle: 'bg-sky-100/80 text-sky-950 border-sky-400 ring-2 ring-sky-300/40',
      inactiveCardStyle: 'bg-sky-50/50 hover:bg-sky-50/90 text-sky-950 border-sky-200/80',
      desc: 'Unfulfilled keyboard order in processing state. System verifies order is not yet packed and immediately voids shipment and issues refund.',
      category: 'orders',
      issueTitle: 'Cancel order before shipment - ErgoMech Keyboard',
      issueDesc: 'Please cancel order ORD-2026-8804 before shipment and issue refund.',
      preview: {
        order_number: 'ORD-2026-8804',
        total_amount: '129.99',
        order_status: 'processing',
        item_title: 'ErgoMech RGB Mechanical Keyboard',
        carrier: 'Pending Fulfillment',
        tracking: 'Not Shipped',
      }
    }
  ];

  const handleSelectPreset = (p: (typeof presets)[0]) => {
    setActivePreset(p.id);
    setOrderNumber(p.order);
    setSelectedCategory(p.category);
    setIssueTitle(p.issueTitle);
    setIssueDescription(p.issueDesc);
    setOrderPreview(p.preview);
    setActiveStepIndex(-1);
    setIsLoopComplete(false);
    setStatusMessage(`Loaded Scenario ${p.num}: ${p.title} (${p.order}). Click "Execute Resolution" to run.`);
  };

  const categories = [
    { id: 'damaged', title: 'Damaged Item', icon: AlertTriangle, activeColor: 'bg-rose-50 border-rose-300 text-rose-900' },
    { id: 'returns', title: 'Return Request', icon: RefreshCw, activeColor: 'bg-amber-50 border-amber-300 text-amber-900' },
    { id: 'shipping', title: 'Delivery Issue', icon: Truck, activeColor: 'bg-sky-50 border-sky-300 text-sky-900' },
    { id: 'orders', title: 'Order Cancel', icon: Package, activeColor: 'bg-violet-50 border-violet-300 text-violet-900' },
  ];

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsProcessing(true);
    setError(null);
    setIsLoopComplete(false);
    setActiveStepIndex(0);
    setStatusMessage(stepDescriptions[0]);

    // Cycle through visual stepper smoothly
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < 4) {
        setActiveStepIndex(step);
        setStatusMessage(stepDescriptions[step]);
      } else {
        clearInterval(stepInterval);
      }
    }, 380);

    try {
      // 1. Fetch Order details to get numeric order_id
      const order = await api.getOrderByNumber(orderNumber.trim());
      if (!order || !order.id) {
        throw new Error(`Order "${orderNumber}" not found. Please verify the order number.`);
      }

      setOrderPreview({
        order_number: order.order_number,
        total_amount: order.total_amount,
        order_status: order.order_status,
        item_title: order.items?.[0]?.variant?.title || 'Order Item',
        carrier: order.shipment?.carrier || 'Blue Dart Express',
        tracking: order.shipment?.tracking_number || 'N/A',
      });

      setActiveStepIndex(3);
      setStatusMessage(stepDescriptions[3]);

      // 2. Create support case
      const newCase = await api.createCase({
        customer_id: order.customer_id,
        order_id: order.id,
        title: issueTitle,
        description: issueDescription,
        category: selectedCategory || 'return_refund',
      });

      clearInterval(stepInterval);

      // Step 5: Act
      setActiveStepIndex(4);
      setStatusMessage(stepDescriptions[4]);

      // Execute resolution workflow
      await api.runAgentOnCase(newCase.id);

      // Step 6: Verify
      setActiveStepIndex(5);
      setStatusMessage(stepDescriptions[5]);
      await new Promise((r) => setTimeout(r, 400));

      // Step 7: Adapt
      setActiveStepIndex(6);
      setStatusMessage(stepDescriptions[6]);
      await new Promise((r) => setTimeout(r, 400));

      // Complete
      setActiveStepIndex(7);
      setIsLoopComplete(true);
      setStatusMessage('Resolution completed and verified against database. Redirecting to Case Tracker...');
      await new Promise((r) => setTimeout(r, 650));

      onCaseCreated(newCase.id);
      setActiveTab('cases');
    } catch (err: any) {
      clearInterval(stepInterval);
      setActiveStepIndex(-1);
      setError(err.message || 'Failed to submit resolution request. Please verify the backend connection.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Pastel Accents */}
      <div className="border-b border-slate-200/90 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-1">
              Autonomous Governance &bull; Dispute Resolution
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
              Customer Resolution Center
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-slate-600 mt-1 max-w-2xl">
              Deterministic intake for customer dispute mitigation, warehouse inventory audit, and verifiable state commitment.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide uppercase">
            <span className="rounded-md border border-emerald-200 px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1.5 shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Synced
            </span>
            <span className="rounded-md border border-slate-200 px-2.5 py-1 bg-slate-50 text-slate-700">
              INR (&bull;) Standard
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Scenarios Strip with Light Pastel Palettes */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-xs tracking-wider uppercase font-semibold text-slate-800">
            Deterministic Test Scenarios
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Select to test automated policy handling
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-left p-3.5 rounded-lg border transition-all shadow-subtle ${
                  isSelected ? p.activeCardStyle : p.inactiveCardStyle
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-bold tracking-wider opacity-80">
                    [{p.num}]
                  </span>
                  <span className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border font-medium ${p.badgeStyle}`}>
                    {p.badge}
                  </span>
                </div>
                <div className="font-serif font-bold text-xs tracking-tight mb-1.5">
                  {p.title}
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] pt-2 border-t border-black/10">
                  <span className="opacity-80">{p.order}</span>
                  <span className="font-semibold">{p.amount}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Two-Column Console (Form + Order Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Ticket Submission Form (7 cols) */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200/90 p-5 sm:p-6 bg-white shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-serif text-base font-bold tracking-tight text-slate-900">
              Dispute Intake Specification
            </h2>
            <p className="font-serif italic text-xs text-slate-500 mt-0.5">
              Submit case parameters for policy evaluation, inventory verification, and database state commitment.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-900 text-xs font-mono flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-rose-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold uppercase tracking-wider block">Execution Error</span>
                <span className="mt-0.5 block font-sans">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitIssue} className="space-y-4">
            {/* Order Number Field */}
            <div>
              <label className="block font-mono text-xs tracking-wider uppercase font-semibold text-slate-700 mb-1">
                Order Identifier *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-8801"
                className="w-full px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:italic placeholder:text-slate-400 shadow-subtle"
              />
              <p className="font-mono text-[10px] text-slate-400 mt-1">
                Audited against warehouse manifests &amp; transactional logs.
              </p>
            </div>

            {/* Category Selector with Pastel States */}
            <div>
              <label className="block font-mono text-xs tracking-wider uppercase font-semibold text-slate-700 mb-1">
                Issue Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-md border text-xs font-mono tracking-wide uppercase transition-all ${
                        isSelected
                          ? `${c.activeColor} font-semibold shadow-subtle ring-1 ring-black/5`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <Icon size={13} strokeWidth={1.5} />
                      <span className="truncate">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block font-mono text-xs tracking-wider uppercase font-semibold text-slate-700 mb-1">
                Dispute Subject *
              </label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief summary of dispute claim"
                className="w-full px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs font-serif font-semibold focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:italic placeholder:text-slate-400 shadow-subtle"
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block font-mono text-xs tracking-wider uppercase font-semibold text-slate-700 mb-1">
                Customer Statement *
              </label>
              <textarea
                required
                rows={3}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Enter verified customer claim statement..."
                className="w-full px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs font-serif resize-none focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:italic placeholder:text-slate-400 shadow-subtle"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="font-mono text-[11px] tracking-wide text-slate-500 flex items-center gap-1.5">
                <Info size={13} strokeWidth={1.5} />
                <span>Deterministic Idempotency Key Guard Active</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 font-mono text-xs tracking-wider uppercase font-semibold shadow-subtle transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Resolution</span>
                    <ArrowRight size={13} strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Order Context & Policy Guardrails (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Order Record Card */}
          <div className="rounded-lg border border-slate-200/90 p-5 bg-white shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-serif font-bold text-xs tracking-wide uppercase text-slate-900">
                Verified Order Manifest
              </span>
              <span className={`rounded-md px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase border font-semibold ${
                orderPreview?.order_status === 'delivered'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}>
                {orderPreview?.order_status || 'DELIVERED'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 uppercase text-[11px]">Order ID</span>
                <span className="font-semibold text-slate-800">{orderPreview?.order_number || orderNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 uppercase text-[11px]">Total Settled</span>
                <span className="font-bold text-slate-900">₹{orderPreview?.total_amount}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 uppercase text-[11px]">Manifest Item</span>
                <span className="font-serif font-medium text-slate-800 text-right max-w-[190px] truncate">
                  {orderPreview?.item_title}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 uppercase text-[11px]">Carrier / AWB</span>
                <span className="rounded px-1.5 py-0.5 text-[10px] border border-sky-200 bg-sky-50 text-sky-800 font-semibold">
                  {orderPreview?.carrier} ({orderPreview?.tracking})
                </span>
              </div>
            </div>
          </div>

          {/* Active Policy Rules with Pastel Highlights */}
          <div className="rounded-lg border border-slate-200/90 p-5 bg-white shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-serif font-bold text-xs tracking-wide uppercase text-slate-900">
                System Policy Guardrails
              </span>
              <span className="rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase border border-slate-200 bg-slate-50 text-slate-600">
                v2.0 STRICT
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-md border border-emerald-200/80 bg-emerald-50/50">
                <span className="font-mono text-xs font-semibold uppercase tracking-wide block text-emerald-900">
                  Stockout Fallback Guard
                </span>
                <span className="font-serif italic text-emerald-800 block mt-0.5 leading-relaxed text-[11px]">
                  If replacement SKU inventory equals zero across regional nodes (WH-EAST &amp; WH-WEST), transaction automatically adapts to immediate UPI credit.
                </span>
              </div>

              <div className="p-3 rounded-md border border-amber-200/80 bg-amber-50/50">
                <span className="font-mono text-xs font-semibold uppercase tracking-wide block text-amber-900">
                  ₹15,000 HITL Approval Gate
                </span>
                <span className="font-serif italic text-amber-800 block mt-0.5 leading-relaxed text-[11px]">
                  Dispute claims exceeding ₹15,000 threshold enforce cryptographic halt and mandate supervisory verification before settlement.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Workflow Visualizer */}
      <AgentLoopVisualizer
        currentStepIndex={activeStepIndex}
        isRunning={isProcessing}
        isComplete={isLoopComplete}
        statusMessage={statusMessage}
      />
    </div>
  );
};
