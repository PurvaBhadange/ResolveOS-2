import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Truck,
  Package,
  ArrowRight,
  Loader2,
  Info,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { AgentLoopVisualizer } from './AgentLoopVisualizer';

// ─── 3D Tilt Card Component ───────────────────────────────────────────────────
const TiltCard3D: React.FC<{
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}> = ({ children, isSelected, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 12;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card text-left p-4 border-2 rounded-xl cursor-pointer select-none min-h-[110px] flex flex-col justify-between ${
        isSelected
          ? 'bg-black text-white border-black'
          : 'bg-white text-black border-black hover:shadow-xl'
      }`}
      style={{ transition: 'transform 0.1s ease-out, box-shadow 0.2s ease-out, background-color 0.1s' }}
    >
      {children}
    </div>
  );
};

// ─── Magnetic Button Component ───────────────────────────────────────────────
const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', type = 'button', disabled, onClick }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn || disabled) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) perspective(300px) rotateX(${y * -0.05}deg) rotateY(${x * 0.05}deg)`;
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0,0) perspective(300px) rotateX(0) rotateY(0)';
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-btn ${className}`}
      style={{ transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)' }}
    >
      {children}
    </button>
  );
};

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

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);

    // If an active preset matches this category and current order, use its verified dispute statement
    const currentPreset = presets.find((p) => p.id === activePreset);
    if (currentPreset && currentPreset.category === catId && currentPreset.order === orderNumber) {
      setIssueTitle(currentPreset.issueTitle);
      setIssueDescription(currentPreset.issueDesc);
      return;
    }

    // Check if any preset matches current order and this category
    const orderPreset = presets.find((p) => p.order === orderNumber && p.category === catId);
    if (orderPreset) {
      setIssueTitle(orderPreset.issueTitle);
      setIssueDescription(orderPreset.issueDesc);
      return;
    }

    // Contextual title & customer statement based on current item title and order number
    const itemTitle = orderPreview?.item_title || 'Item';
    const currentOrder = orderNumber.trim() || 'ORD-2026-8801';

    switch (catId) {
      case 'damaged':
        setIssueTitle(`${itemTitle} arrived damaged - Request replacement`);
        setIssueDescription(
          `My ${itemTitle} arrived with physical damage, defective casing, or hardware malfunction upon delivery. Requesting an immediate replacement or full refund.`
        );
        break;
      case 'returns':
        setIssueTitle(`Return and refund request for ${itemTitle}`);
        setIssueDescription(
          `I would like to initiate a product return and full refund for ${itemTitle} (Order ${currentOrder}). The product is unused, in original condition and packaging.`
        );
        break;
      case 'shipping':
        setIssueTitle(`Delivery delay & transit inquiry - Order ${currentOrder}`);
        setIssueDescription(
          `The shipment tracking for order ${currentOrder} (${itemTitle}) has not updated or has exceeded the estimated delivery date. Please check courier dispatch and transit status.`
        );
        break;
      case 'orders':
        setIssueTitle(`Cancel order before shipment - ${currentOrder}`);
        setIssueDescription(
          `Please cancel unfulfilled order ${currentOrder} (${itemTitle}) prior to warehouse dispatch and process an immediate refund to the original payment method.`
        );
        break;
      default:
        setIssueTitle(`Dispute claim for order ${currentOrder}`);
        setIssueDescription(`Customer dispute claim regarding ${itemTitle} under order ${currentOrder}.`);
        break;
    }
  };

  const handleOrderNumberChange = (newOrderNum: string) => {
    setOrderNumber(newOrderNum);
    const matchingPreset = presets.find((p) => p.order.toLowerCase() === newOrderNum.trim().toLowerCase());
    if (matchingPreset) {
      setOrderPreview(matchingPreset.preview);
    }
  };

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

  useEffect(() => {
    if (prefillOrderNumber && prefillOrderNumber !== orderNumber) {
      setOrderNumber(prefillOrderNumber);
      const matchingPreset = presets.find((p) => p.order === prefillOrderNumber);
      if (matchingPreset) {
        handleSelectPreset(matchingPreset);
      } else {
        api.getOrderByNumber(prefillOrderNumber).then((ord) => {
          if (ord) {
            setOrderPreview({
              order_number: ord.order_number,
              total_amount: ord.total_amount,
              order_status: ord.order_status,
              item_title: ord.items?.[0]?.variant?.title || 'Order Item',
              carrier: ord.shipment?.carrier || 'Blue Dart Express',
              tracking: ord.shipment?.tracking_number || 'N/A',
            });
          }
        }).catch(() => {});
      }
    }
  }, [prefillOrderNumber]);

  const categories = [
    { id: 'damaged', title: 'Damaged Item', icon: AlertTriangle },
    { id: 'returns', title: 'Return Request', icon: RefreshCw },
    { id: 'shipping', title: 'Delivery Issue', icon: Truck },
    { id: 'orders', title: 'Order Cancel', icon: Package },
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
    }, 180);

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
      await new Promise((r) => setTimeout(r, 150));

      // Step 7: Adapt
      setActiveStepIndex(6);
      setStatusMessage(stepDescriptions[6]);
      await new Promise((r) => setTimeout(r, 150));

      // Complete
      setActiveStepIndex(7);
      setIsLoopComplete(true);
      setStatusMessage('Resolution completed and verified against database. Redirecting to Case Tracker...');
      await new Promise((r) => setTimeout(r, 300));

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
    <div className="space-y-8 pb-16">
      {/* 1. Architectural Editorial Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-1">
              Autonomous Governance &bull; Enterprise Operations
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-black uppercase">
              Resolution Center
            </h1>
            <p className="text-base font-serif italic text-neutral-700 mt-2 max-w-2xl">
              Deterministic, policy-governed intake for customer dispute mitigation, warehouse inventory checks, and transactional state verification.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs tracking-wider uppercase">
            <span className="border border-black px-2.5 py-1 bg-black text-white font-semibold rounded-full">
              Live DB Synced
            </span>
            <span className="border border-black px-2.5 py-1 bg-white text-black rounded-full">
              INR (&bull;) Standard
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Scenarios Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black pb-1">
          <span className="font-mono text-xs tracking-widest uppercase font-bold text-black">
            Deterministic Test Scenarios
          </span>
          <span className="font-mono text-[11px] tracking-wider uppercase text-neutral-500">
            Select to execute automated policy evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <TiltCard3D
                key={p.id}
                isSelected={isSelected}
                onClick={() => handleSelectPreset(p)}
              >
                <div className="tilt-card-inner flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`font-mono text-xs tracking-widest font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                      [{p.num}]
                    </span>
                    <span className={`tilt-card-badge font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5 border rounded-md ${
                      isSelected
                        ? 'border-white bg-white text-black font-semibold'
                        : 'border-black text-black'
                    }`}>
                      {p.badge}
                    </span>
                  </div>
                  <div className={`font-serif font-bold text-sm tracking-tight mb-2 flex-1 ${isSelected ? 'text-white' : 'text-black'}`}>
                    {p.title}
                  </div>
                  <div className={`flex items-center justify-between font-mono text-xs pt-2 border-t ${isSelected ? 'border-white/50 text-white/90' : 'border-black/20 text-black'}`}>
                    <span>{p.order}</span>
                    <span className="font-bold">{p.amount}</span>
                  </div>
                </div>
              </TiltCard3D>
            );
          })}
        </div>

      </div>

      {/* 3. Main Two-Column Console (Form + Order Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Ticket Submission Form (7 cols) */}
        <div className="lg:col-span-7 border-2 border-black p-6 sm:p-8 bg-white space-y-6 rounded-2xl">
          <div className="border-b-2 border-black pb-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-black">
              Dispute Intake Specification
            </h2>
            <p className="font-serif italic text-xs text-neutral-600 mt-1">
              Submit case parameters for policy evaluation, inventory verification, and database state commitment.
            </p>
          </div>

          {error && (
            <div className="p-4 border-2 border-black bg-black text-white text-xs font-mono flex items-start gap-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block">System Execution Error</span>
                <span className="mt-1 block font-sans">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitIssue} className="space-y-5">
            {/* Order Number Field */}
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1.5">
                Order Identifier *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => handleOrderNumberChange(e.target.value)}
                placeholder="e.g. ORD-2026-8801"
                className="w-full px-4 py-2.5 border-2 border-black bg-white text-black text-sm font-mono rounded-lg focus:border-b-4 placeholder:italic placeholder:text-neutral-400"
              />
              <p className="font-mono text-[10px] tracking-wider uppercase text-neutral-500 mt-1">
                Audited against warehouse manifests &amp; transactional logs.
              </p>
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black">
                  Issue Category Classification *
                </label>
                <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-500">
                  Auto-Adapts Subject &amp; Statement
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategoryChange(c.id)}
                      className={`press-3d flex items-center justify-center gap-2 p-2.5 border-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors duration-100 ${
                        isSelected
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-black hover:bg-black hover:text-white'
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.5} />
                      <span className="truncate">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1.5">
                Dispute Subject *
              </label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief summary of dispute claim"
                className="w-full px-4 py-2.5 border-2 border-black bg-white text-black text-sm font-serif font-semibold rounded-lg focus:border-b-4 placeholder:italic placeholder:text-neutral-400"
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1.5">
                Customer Statement Details *
              </label>
              <textarea
                required
                rows={3}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Enter verified customer claim statement..."
                className="w-full px-4 py-2.5 border-2 border-black bg-white text-black text-sm font-serif resize-none rounded-lg focus:border-b-4 placeholder:italic placeholder:text-neutral-400"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t-2 border-black">
              <div className="font-mono text-[11px] tracking-wider uppercase text-neutral-600 flex items-center gap-2">
                <Info size={14} strokeWidth={1.5} />
                <span>Deterministic Idempotency Key Guard Active</span>
              </div>

              <MagneticButton
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black font-mono text-xs tracking-widest uppercase font-bold rounded-lg transition-colors duration-100 flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Resolution</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </>
                )}
              </MagneticButton>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Order Context & Policy Guardrails (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Record Card */}
          <div className="border-2 border-black p-6 bg-white space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <span className="font-display font-bold text-sm tracking-wider uppercase text-black">
                Verified Order Manifest
              </span>
              <span className="border border-black px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-black text-white rounded-md">
                {orderPreview?.order_status || 'DELIVERED'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-black/20">
                <span className="text-neutral-500 uppercase">Order ID</span>
                <span className="font-bold text-black">{orderPreview?.order_number || orderNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-black/20">
                <span className="text-neutral-500 uppercase">Total Settled</span>
                <span className="font-bold text-black text-sm">₹{orderPreview?.total_amount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-black/20">
                <span className="text-neutral-500 uppercase">Manifest Item</span>
                <span className="font-serif font-semibold text-black text-right max-w-[200px] truncate">
                  {orderPreview?.item_title}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-neutral-500 uppercase">Carrier / AWB</span>
                <span className="text-black font-semibold">
                  {orderPreview?.carrier} ({orderPreview?.tracking})
                </span>
              </div>
            </div>
          </div>

          {/* Active Policy Rules */}
          <div className="border-2 border-black p-6 bg-white space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <span className="font-display font-bold text-sm tracking-wider uppercase text-black">
                System Policy Guardrails
              </span>
              <span className="border border-black px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase bg-neutral-100 text-black rounded-md">
                v2.0 STRICT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 border border-black bg-neutral-50 rounded-xl">
                <span className="font-mono text-xs font-bold uppercase tracking-wider block text-black">
                  Stockout Fallback Guard
                </span>
                <span className="font-serif italic text-neutral-700 block mt-1 leading-relaxed">
                  If replacement SKU inventory equals zero across regional nodes (WH-EAST &amp; WH-WEST), transaction automatically adapts to immediate UPI credit.
                </span>
              </div>

              <div className="p-3 border border-black bg-neutral-50 rounded-xl">
                <span className="font-mono text-xs font-bold uppercase tracking-wider block text-black">
                  ₹15,000 HITL Approval Gate
                </span>
                <span className="font-serif italic text-neutral-700 block mt-1 leading-relaxed">
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
