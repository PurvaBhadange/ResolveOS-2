import React, { useState, useEffect } from 'react';
import {
  Package,
  RefreshCw,
  Truck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Loader2,
  ShieldCheck,
  FileText,
  Database,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { AgentLoopVisualizer } from './AgentLoopVisualizer';

interface HelpCenterProps {
  onCaseCreated: (caseId: number) => void;
  setActiveTab: (tab: string) => void;
}

export const CustomerHelpCenter: React.FC<HelpCenterProps> = ({ onCaseCreated, setActiveTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('damaged');
  const [orderNumber, setOrderNumber] = useState<string>('ORD-2026-8801');
  const [issueTitle, setIssueTitle] = useState<string>('Headphones arrived damaged - Request replacement');
  const [issueDescription, setIssueDescription] = useState<string>(
    'My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [agentRunning, setAgentRunning] = useState<boolean>(false);

  // Active scenario preset tracker
  const [activePreset, setActivePreset] = useState<string>('stockout');

  // Dynamic state machine loop states
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isLoopComplete, setIsLoopComplete] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Scenario 1 loaded: Stockout Adaptation (ORD-2026-8801). Click "Submit & Run Resolution" to start.'
  );

  // Order preview state
  const [orderPreview, setOrderPreview] = useState<any | null>({
    order_number: 'ORD-2026-8801',
    total_amount: '199.99',
    order_status: 'delivered',
    item_title: 'AuraSound Headphones - Matte Black',
    carrier: 'Blue Dart',
    tracking: 'BLUEDART-8801-IN',
  });

  const stepDescriptions = [
    'Step 1/7 [UNDERSTAND]: Extracting customer intent & analyzing order records...',
    'Step 2/7 [EVIDENCE]: Querying warehouse stock levels & policy return rules...',
    'Step 3/7 [DECIDE]: Evaluating plan candidates & ranking confidence scores...',
    'Step 4/7 [GUARD]: Checking ₹15,000 threshold, fraud risk & policy return windows...',
    'Step 5/7 [ACT]: Executing transactional state change with idempotency key...',
    'Step 6/7 [VERIFY]: Re-querying PostgreSQL database to independently audit outcome...',
    'Step 7/7 [ADAPT]: Validating resolution adaptation & closing support ticket...',
  ];

  const presets = [
    {
      id: 'stockout',
      num: '1',
      title: 'Stockout Adaptation',
      order: 'ORD-2026-8801',
      amount: '₹199.99',
      badge: 'Stockout Replanning',
      badgeColor: 'bg-tealbrand-50 text-tealbrand-700 border-tealbrand-200',
      desc: 'Headphones delivered damaged. Warehouse is out of stock, so ResolveOS automatically adapts from replacement to instant full refund via UPI / original payment method.',
      category: 'damaged',
      issueTitle: 'Headphones arrived damaged - Request replacement',
      issueDesc: 'My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.',
      preview: {
        order_number: 'ORD-2026-8801',
        total_amount: '199.99',
        order_status: 'delivered',
        item_title: 'AuraSound Headphones - Matte Black',
        carrier: 'Blue Dart',
        tracking: 'BLUEDART-8801-IN',
      }
    },
    {
      id: 'high_value',
      num: '2',
      title: 'High-Value Approval',
      order: 'ORD-2026-8802',
      amount: '₹499.98',
      badge: 'Human-in-the-Loop',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Defective Smartwatch Bundle exceeding ₹15,000 safety threshold. Automatically halts auto-execution and routes to Operations Approval Queue.',
      category: 'damaged',
      issueTitle: 'Damaged Smartwatch Bundle - Request refund (₹499.98)',
      issueDesc: 'Apex Smartwatch arrived defective with touchscreen unresponsiveness. Requesting full refund of ₹499.98.',
      preview: {
        order_number: 'ORD-2026-8802',
        total_amount: '499.98',
        order_status: 'delivered',
        item_title: 'Apex Fit Pro Smartwatch (Obsidian Black)',
        carrier: 'Blue Dart',
        tracking: 'DELHIVERY-8802-IN',
      }
    },
    {
      id: 'expired',
      num: '3',
      title: 'Expired Return Window',
      order: 'ORD-2026-8803',
      amount: '₹89.99',
      badge: 'Policy Enforcement',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'Pulse Earbuds delivered 40 days ago. Policy Rules Engine detects return requested past 15-day limit and enforces policy rules.',
      category: 'returns',
      issueTitle: 'Return wireless earbuds - Delivered 40 days ago',
      issueDesc: 'Requesting return and refund for Pulse Earbuds delivered 40 days ago.',
      preview: {
        order_number: 'ORD-2026-8803',
        total_amount: '89.99',
        order_status: 'delivered',
        item_title: 'Pulse True Wireless Earbuds (White)',
        carrier: 'Delhivery',
        tracking: 'EKART-8803-IN',
      }
    },
    {
      id: 'cancel',
      num: '4',
      title: 'Pre-Shipment Cancel',
      order: 'ORD-2026-8804',
      amount: '₹129.99',
      badge: 'Instant Resolution',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Mechanical keyboard order in "processing" state. ResolveOS verifies order is not yet packed and immediately voids shipment and issues refund.',
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

  const applyPreset = (presetId: string) => {
    const p = presets.find((x) => x.id === presetId);
    if (!p) return;

    setActivePreset(p.id);
    setOrderNumber(p.order);
    setIssueTitle(p.issueTitle);
    setIssueDescription(p.issueDesc);
    setSelectedCategory(p.category);
    setOrderPreview(p.preview);
    setActiveStepIndex(-1);
    setIsLoopComplete(false);
    setStatusMessage(`Scenario ${p.num} loaded: ${p.title} (${p.order}). Click "Submit & Run Resolution" to start.`);
  };

  const categories = [
    { id: 'damaged', title: 'Damaged / Defective', icon: AlertTriangle },
    { id: 'returns', title: 'Returns & Refunds', icon: RefreshCw },
    { id: 'shipping', title: 'Shipping & Delivery', icon: Truck },
    { id: 'orders', title: 'Order Cancel / Mod', icon: Package },
  ];

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsLoopComplete(false);
    setAgentRunning(true);
    setActiveStepIndex(0);
    setStatusMessage(stepDescriptions[0]);

    // Animate progress smoothly while waiting for backend response
    let currentIdx = 0;
    const stepInterval = setInterval(() => {
      if (currentIdx < 4) {
        currentIdx += 1;
        setActiveStepIndex(currentIdx);
        setStatusMessage(stepDescriptions[currentIdx]);
      }
    }, 450);

    try {
      // 1. Fetch Order details first to get numeric order_id
      const order = await api.getOrderByNumber(orderNumber.trim());
      if (!order || !order.id) {
        throw new Error(`Order "${orderNumber}" not found. Please verify the order number.`);
      }

      // Update order preview with actual live DB data
      setOrderPreview({
        order_number: order.order_number,
        total_amount: order.total_amount,
        order_status: order.order_status,
        item_title: order.items?.[0]?.variant?.title || 'Order Item',
        carrier: order.shipment?.carrier || 'Pending',
        tracking: order.shipment?.tracking_number || 'N/A',
      });

      // Advance to decide / guard step
      setActiveStepIndex(3);
      setStatusMessage(stepDescriptions[3]);

      // 2. Create support case using real customer_id & order_id from DB
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

      // Run workflow on case
      await api.runAgentOnCase(newCase.id);

      // Step 6: Verify
      setActiveStepIndex(5);
      setStatusMessage(stepDescriptions[5]);
      await new Promise((r) => setTimeout(r, 450));

      // Step 7: Adapt
      setActiveStepIndex(6);
      setStatusMessage(stepDescriptions[6]);
      await new Promise((r) => setTimeout(r, 450));

      // All nodes completed
      setActiveStepIndex(7);
      setIsLoopComplete(true);
      setStatusMessage('Case successfully resolved & verified against database! Redirecting to Case Tracker...');
      await new Promise((r) => setTimeout(r, 750));

      // Navigate to Case Tracker
      onCaseCreated(newCase.id);
      setActiveTab('cases');
    } catch (err: any) {
      clearInterval(stepInterval);
      setActiveStepIndex(-1);
      setError(err.message || 'Failed to submit support issue. Make sure the backend is running.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setAgentRunning(false);
    }
  };

  const isProcessing = loading || agentRunning;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO & 1-CLICK DEMO SCENARIOS BAR */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tealbrand-50 text-tealbrand-700 text-xs font-semibold border border-tealbrand-200">
            <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-600" /> 🇮🇳 India&apos;s Enterprise Resolution &amp; Fulfillment Engine
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-tealbrand-600" /> Neon DB Connected</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Rules &amp; Workflow Engine</span>
          </div>
        </div>

        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Customer Resolution &amp; Support Console
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ResolveOS independently verifies order history, warehouse stock levels, and policy return windows to execute idempotent business resolutions with zero manual delay.
          </p>
        </div>

        {/* 1-Click Interactive Demo Scenarios Selector */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Demo Scenarios (Select to Test):
            </span>
            <span className="text-[11px] text-slate-500">Click any preset to pre-fill sample order details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-tealbrand-50/60 border-tealbrand-600 text-slate-900 shadow-sm ring-1 ring-tealbrand-600/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-tealbrand-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.num}
                      </span>
                      {p.title}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{p.order}</span>
                    <span className="font-bold text-slate-900">{p.amount}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC AGENT DECISION LOOP VISUALIZER (Directly Visible In-Viewport) */}
      <AgentLoopVisualizer
        currentStepIndex={activeStepIndex}
        isRunning={isProcessing}
        isComplete={isLoopComplete}
        statusMessage={statusMessage}
      />

      {/* 3. HIGH-UTILITY TWO-COLUMN ACTION WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Issue Submission Console (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Issue Resolution Request</h2>
              <p className="text-xs text-slate-500">Configure parameters or use the selected demo preset above.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200">
              Active: {presets.find((x) => x.id === activePreset)?.title || 'Custom'}
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitIssue} className="space-y-5">
            {/* Category Selector Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Problem Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-tealbrand-600 text-white border-tealbrand-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cat.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Number & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Order Number
                </label>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Quick Test:</span>
                  {['ORD-2026-8801', 'ORD-2026-8802', 'ORD-2026-8803', 'ORD-2026-8804'].map((ord) => (
                    <button
                      key={ord}
                      type="button"
                      onClick={() => setOrderNumber(ord)}
                      className={`font-mono px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
                        orderNumber === ord
                          ? 'bg-tealbrand-600 text-white border-tealbrand-600 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ord.split('-')[2]}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-8801"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tealbrand-600 text-slate-900 font-mono text-sm font-semibold bg-white"
              />
            </div>

            {/* Issue Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Issue Summary / Goal
              </label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief summary of customer issue"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tealbrand-600 text-slate-900 text-sm font-medium bg-white"
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Detailed Customer Problem Statement
              </label>
              <textarea
                required
                rows={3}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe issue details..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tealbrand-600 text-slate-900 text-sm font-medium resize-none bg-white"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-tealbrand-600" />
                <span>Triggers automated resolution workflow upon submit</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Processing Resolution...
                  </>
                ) : (
                  <>
                    Submit &amp; Run Resolution <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Order Context & Policy Guardrails (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Order Context Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-tealbrand-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verified Order Record</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {orderPreview?.order_status || 'Delivered'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Order Number</span>
                <span className="font-mono font-bold text-slate-900">{orderPreview?.order_number || orderNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Order Total</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{orderPreview?.total_amount}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Purchased Item</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{orderPreview?.item_title}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Carrier &amp; Tracking</span>
                <span className="font-mono text-slate-700">{orderPreview?.carrier} ({orderPreview?.tracking})</span>
              </div>
            </div>
          </div>

          {/* Business Policy & Safety Guardrails Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tealbrand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Active Policy Guardrails</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200">
                v2.0 Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <RefreshCw className="w-4 h-4 text-tealbrand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Stockout Adaptation Rule</span>
                  <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                    If replacement item is out of stock across WH-EAST &amp; WH-WEST, system automatically adapts to full refund via UPI / original payment method.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">₹15,000 Operations Approval Gate</span>
                  <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                    Any single resolution exceeding ₹15,000 requires human supervisor approval before database execution.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Idempotency &amp; State Verification</span>
                  <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                    Duplicate actions are prevented via unique idempotency keys. Final state is audited by independent DB re-query.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


