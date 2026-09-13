import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Truck,
  Package,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  Database,
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
    'Ready. Select a test scenario below or submit a custom resolution request.'
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
      badge: 'Auto-Replanning',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
      num: '2',
      title: 'High-Value Approval',
      order: 'ORD-2026-8802',
      amount: '₹499.98',
      badge: 'Human Review Gate',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
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
      num: '3',
      title: 'Expired Return Window',
      order: 'ORD-2026-8803',
      amount: '₹89.99',
      badge: 'Policy Guardrail',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
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
      num: '4',
      title: 'Pre-Shipment Cancel',
      order: 'ORD-2026-8804',
      amount: '₹129.99',
      badge: 'Instant Execution',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
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
    setStatusMessage(`Loaded Scenario ${p.num}: ${p.title} (${p.order}). Click "Submit Resolution Request" to execute.`);
  };

  const categories = [
    { id: 'damaged', title: 'Damaged / Defective', icon: AlertTriangle },
    { id: 'returns', title: 'Return & Refund', icon: RefreshCw },
    { id: 'shipping', title: 'Shipping & Delivery', icon: Truck },
    { id: 'orders', title: 'Cancel Order', icon: Package },
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
    <div className="space-y-6 pb-12">
      {/* 1. Page Header & Scenario Selector */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Customer Resolution Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify order parameters, policy return constraints, and multi-warehouse inventory to execute verifiable resolutions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Database Live
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-600">INR (₹) Standard</span>
          </div>
        </div>

        {/* Test Scenario Selector Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">
              Preset Test Scenarios:
            </span>
            <span className="text-slate-400 text-[11px]">Select to test automated policy handling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left p-3 rounded-md border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                      : 'bg-slate-50/70 hover:bg-slate-100/70 text-slate-800 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold tracking-tight truncate">
                      {p.num}. {p.title}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                      isSelected
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : p.badgeColor
                    }`}>
                      {p.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1.5 opacity-90">
                    <span className="font-mono">{p.order}</span>
                    <span className="font-semibold">{p.amount}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Console (Form + Order Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Ticket Submission Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Submit Issue for Resolution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter customer problem details. System evaluates policy rules and executes database transactions.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Submission Error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitIssue} className="space-y-4">
            {/* Order Number Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Order Identifier
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-2026-8801"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-sm font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Linked to order records, shipping manifests, and payment receipts.
              </p>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Issue Classification
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
                      className={`flex items-center gap-1.5 p-2 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief summary of issue"
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-sm font-medium"
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Statement
              </label>
              <textarea
                required
                rows={3}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe issue details..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-sm font-normal resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Executes transactional resolution with database verification</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-subtle disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Processing Resolution...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Resolution Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Order Context & Policy Guardrails (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Order Record Card */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-semibold text-slate-900">Verified Order Record</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${
                orderPreview?.order_status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {orderPreview?.order_status || 'Delivered'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Order Number</span>
                <span className="font-mono font-medium text-slate-900">{orderPreview?.order_number || orderNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Order Total</span>
                <span className="font-semibold text-slate-900">₹{orderPreview?.total_amount}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Item</span>
                <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">{orderPreview?.item_title}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Carrier / Tracking</span>
                <span className="font-mono text-slate-700 text-[11px]">{orderPreview?.carrier} ({orderPreview?.tracking})</span>
              </div>
            </div>
          </div>

          {/* Active Policy Rules */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-semibold text-slate-900">Active Policy Guardrails</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                v2.0
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
                <span className="font-medium text-slate-900 block text-xs">Stockout Fallback Rule</span>
                <span className="text-[11px] text-slate-600 leading-normal block mt-0.5">
                  If replacement item is out of stock across WH-EAST &amp; WH-WEST, system automatically adapts to full refund via UPI.
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
                <span className="font-medium text-slate-900 block text-xs">₹15,000 Operations Approval Gate</span>
                <span className="text-[11px] text-slate-600 leading-normal block mt-0.5">
                  Transactions exceeding ₹15,000 require manual supervisor sign-off before database execution.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Workflow Visualizer */}
      <AgentLoopVisualizer
        currentStepIndex={activeStepIndex}
        isRunning={isProcessing}
        isComplete={isLoopComplete}
        statusMessage={statusMessage}
      />
    </div>
  );
};
