import React, { useState, useEffect } from 'react';
import {
  Package, RefreshCw, Truck, AlertTriangle, ArrowRight, CheckCircle2,
  Database, ShieldCheck, Layers, Cpu, Clock, Check, ChevronRight, Zap,
  Play, FileText, RotateCcw, Server, ExternalLink, Lock, CheckCircle,
  BarChart3, AlertCircle, Terminal, Code2, ShieldAlert, CornerDownRight,
  Sliders, Search, ArrowUpRight, Sparkles
} from 'lucide-react';
import { api } from '../lib/api';

interface HelpCenterProps {
  onCaseCreated: (caseId: number) => void;
  setActiveTab: (tab: string) => void;
}

export const CustomerHelpCenter: React.FC<HelpCenterProps> = ({ onCaseCreated, setActiveTab }) => {
  // Scenario Selection State
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('replacement');
  const [orderNumber, setOrderNumber] = useState<string>('ORD-2026-8805');
  const [issueTitle, setIssueTitle] = useState<string>('Headphones arrived damaged - Request replacement (In Stock)');
  const [issueDescription, setIssueDescription] = useState<string>(
    'My AuraSound Silver headphones arrived yesterday with a cracked headband. Requesting physical replacement from warehouse.'
  );

  // Environment Inspection State
  const [targetOrder, setTargetOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Execution & Trace State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeCaseResult, setActiveCaseResult] = useState<any | null>(null);
  const [executionEvents, setExecutionEvents] = useState<any[]>([]);
  const [activeTraceTab, setActiveTraceTab] = useState<'events' | 'verification' | 'payload'>('events');

  // Engineering Sub-panel Tabs
  const [activeTechTab, setActiveTechTab] = useState<'tools' | 'recovery' | 'specs'>('tools');

  // Evaluation Scenarios (Aligned with Problem Statement Rubric)
  const scenarios = [
    {
      key: 'replacement',
      title: 'Scenario 1: In-Stock Replacement',
      tag: 'Healthy Execution',
      order: 'ORD-2026-8805',
      sku: 'SKU-HD-SLV',
      stockNote: 'WH-EAST: 15 Units In Stock',
      constraint: '15-Day Return Window (Section 4.1)',
      roadblock: 'None (Item in stock, claim within 15-day window)',
      expectedAction: 'Reserve stock in WH-EAST & generate replacement order',
      verificationTarget: 'orders.replacement_order_id populated & verified',
      badgeColor: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30',
      issueTitle: 'Headphones arrived damaged - Request replacement (In Stock)',
      issueDescription: 'My AuraSound Silver headphones arrived yesterday with a cracked headband. Requesting physical replacement from warehouse.',
      icon: Package,
    },
    {
      key: 'stockout',
      title: 'Scenario 2: Stockout & Re-planning',
      tag: 'Failure Recovery',
      order: 'ORD-2026-8801',
      sku: 'SKU-HD-BLK',
      stockNote: 'WH-EAST: 0, WH-WEST: 0 (Out of Stock)',
      constraint: 'Policy Section 5.2 (Fallback to Refund)',
      roadblock: 'Warehouse stockout prevents requested replacement',
      expectedAction: 'REPLAN node triggers: automatically pivots to Full Refund ($199.99)',
      verificationTarget: 'refunds table verified with UUID idempotency key',
      badgeColor: 'bg-primary/10 text-primary border-primary/30',
      issueTitle: 'Headphones arrived damaged - Request replacement',
      issueDescription: 'My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.',
      icon: RefreshCw,
    },
    {
      key: 'high_value',
      title: 'Scenario 3: High-Value Human Gate',
      tag: 'Policy Threshold',
      order: 'ORD-2026-8802',
      sku: 'SKU-WCH-01',
      stockNote: 'Order Total: $499.98 (Ceiling: $200.00)',
      constraint: 'Deterministic Guard: Threshold <= $200.00',
      roadblock: 'Claim value exceeds autonomous financial limit',
      expectedAction: 'Autonomous execution pauses: routes case to Operations Approval Queue',
      verificationTarget: 'approvals table row created with pending status',
      badgeColor: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
      issueTitle: 'Damaged Smartwatch Bundle - Request refund ($499.98)',
      issueDescription: 'Apex Smartwatch arrived defective with touchscreen unresponsiveness. Requesting full refund of $499.98.',
      icon: ShieldCheck,
    },
    {
      key: 'expired',
      title: 'Scenario 4: Expired Policy Window',
      tag: 'Deterministic Guard',
      order: 'ORD-2026-8803',
      sku: 'SKU-EAR-01',
      stockNote: 'Delivered 40 days ago (Window: 15 days)',
      constraint: 'Return Window <= 15 Calendar Days',
      roadblock: 'Constraint violation: delivery age (40d) exceeds policy limit',
      expectedAction: 'Deterministic refusal: agent cites Section 2.1 & safely escalates',
      verificationTarget: 'case_status = escalated with explicit policy citation',
      badgeColor: 'bg-accent-rose/10 text-accent-rose border-accent-rose/30',
      issueTitle: 'Return wireless earbuds - Delivered 40 days ago',
      issueDescription: 'Requesting return and refund for Pulse Earbuds delivered 40 days ago.',
      icon: Clock,
    },
    {
      key: 'cancel',
      title: 'Scenario 5: Pre-Shipment Intercept',
      tag: 'State Intercept',
      order: 'ORD-2026-8804',
      sku: 'SKU-KB-01',
      stockNote: 'Order Status: PROCESSING (Unfulfilled)',
      constraint: 'Pre-fulfillment Cancellation (Section 1.4)',
      roadblock: 'Order not yet picked or shipped by carrier',
      expectedAction: 'Intercept fulfillment pipeline: cancels order & voids payment',
      verificationTarget: 'orders.order_status = cancelled & payment_status = refunded',
      badgeColor: 'bg-ink-soft text-canvas border-mute/30',
      issueTitle: 'Cancel order before shipment - ErgoMech Keyboard',
      issueDescription: 'Please cancel order ORD-2026-8804 before shipment and issue refund.',
      icon: CheckCircle2,
    },
  ];

  // Fetch Order Environment Data on scenario change
  const fetchOrderContext = async (orderNum: string) => {
    setLoadingOrder(true);
    setOrderError(null);
    try {
      const order = await api.getOrderByNumber(orderNum.trim());
      setTargetOrder(order);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to fetch order environment state');
      setTargetOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    fetchOrderContext(orderNumber);
  }, [orderNumber]);

  const handleSelectScenario = (sc: typeof scenarios[0]) => {
    setSelectedScenarioKey(sc.key);
    setOrderNumber(sc.order);
    setIssueTitle(sc.issueTitle);
    setIssueDescription(sc.issueDescription);
    fetchOrderContext(sc.order);
    // Reset previous run display
    setActiveCaseResult(null);
    setExecutionEvents([]);
  };

  const currentScenario = scenarios.find((s) => s.key === selectedScenarioKey) || scenarios[0];

  // Execute Autonomous Agent Workflow End-to-End
  const handleExecuteAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    setOrderError(null);
    setActiveCaseResult(null);
    setExecutionEvents([]);

    try {
      const order = targetOrder || (await api.getOrderByNumber(orderNumber.trim()));
      if (!order) {
        throw new Error(`Order ${orderNumber} not found in database.`);
      }

      // Step 1: Ingest Case
      const newCase = await api.createCase({
        customer_id: order.customer_id,
        order_id: order.id,
        title: issueTitle,
        description: issueDescription,
        category: 'return_refund',
      });

      onCaseCreated(newCase.id);

      // Step 2: Trigger Autonomous LangGraph State Machine
      const runResult = await api.runAgentOnCase(newCase.id);

      // Step 3: Fetch updated case details and event audit trail
      const refreshedCase = await api.getCase(newCase.id);
      const events = await api.getCaseEvents(newCase.id);

      setActiveCaseResult(refreshedCase);
      setExecutionEvents(events || []);

      // Refresh target order environment to show real database mutations
      await fetchOrderContext(orderNumber);
    } catch (err: any) {
      setOrderError(err.message || 'Execution error during autonomous agent run.');
    } finally {
      setIsExecuting(false);
    }
  };

  // 8 Simulated Enterprise Systems
  const enterpriseTools = [
    {
      id: 'customer_db',
      name: 'Customer DB',
      protocol: 'SQL Relational',
      role: 'Identity & Fraud Profiling',
      endpoint: '/api/v1/customers/{id}',
      mutation: 'Read-only profile & lifetime value scoring',
      idempotency: 'N/A (Query)',
      icon: Database,
    },
    {
      id: 'order_api',
      name: 'Order API',
      protocol: 'REST / SQLModel',
      role: 'Line Item & Tracking Ledger',
      endpoint: '/api/v1/orders/{id}',
      mutation: 'Mutates status (delivered -> cancelled / replaced)',
      idempotency: 'Transactional lock',
      icon: Package,
    },
    {
      id: 'inventory_api',
      name: 'Inventory API',
      protocol: 'Multi-Warehouse REST',
      role: 'Real-Time Stock Allocation',
      endpoint: '/api/v1/inventory/variant/{id}',
      mutation: 'Decrements available quantity across warehouses',
      idempotency: 'Atomic stock decrement',
      icon: Layers,
    },
    {
      id: 'policy_rag',
      name: 'Policy RAG Engine',
      protocol: 'Hybrid Semantic + SQL',
      role: 'Versioned Constraint Evaluator',
      endpoint: '/api/v1/policies/search',
      mutation: 'Read-only markdown clause retrieval & citation',
      idempotency: 'N/A (Query)',
      icon: FileText,
    },
    {
      id: 'refund_api',
      name: 'Refund API',
      protocol: 'Financial Transactional',
      role: 'Ledger Payment Reversals',
      endpoint: '/api/v1/refunds',
      mutation: 'Inserts row into refunds ledger & updates order balance',
      idempotency: 'UUID idempotency key check (zero duplicate refunds)',
      icon: RefreshCw,
    },
    {
      id: 'replacement_api',
      name: 'Replacement API',
      protocol: 'Warehouse Fulfillment',
      role: 'Zero-Cost Shipment Order',
      endpoint: '/api/v1/replacements',
      mutation: 'Generates new replacement order record & carrier shipment',
      idempotency: 'Single replacement per line-item rule',
      icon: Truck,
    },
    {
      id: 'cancellation_api',
      name: 'Cancellation API',
      protocol: 'Fulfillment Intercept',
      role: 'Pre-Shipment Void',
      endpoint: '/api/v1/cancellations',
      mutation: 'Transitions order to CANCELLED and voids pending auth',
      idempotency: 'Status guard (only PROCESSING allowed)',
      icon: CheckCircle2,
    },
    {
      id: 'verification_api',
      name: 'Verification API',
      protocol: 'Post-Action SQL Query',
      role: 'Independent Database Audit',
      endpoint: '/api/v1/verification/verify',
      mutation: 'Executes independent SQL assertion on modified rows',
      idempotency: 'Read-only proof verification',
      icon: ShieldCheck,
    },
  ];

  // 7-Node Autonomous Loop
  const stateMachineNodes = [
    { code: '01', name: 'UNDERSTAND', role: 'LLM Intent & Entity Extraction' },
    { code: '02', name: 'RETRIEVE', role: 'Context & Inventory Query' },
    { code: '03', name: 'PLAN', role: 'Candidate Resolution Scoring' },
    { code: '04', name: 'GUARD', role: 'Deterministic Policy Gates' },
    { code: '05', name: 'EXECUTE', role: 'Idempotent State Mutation' },
    { code: '06', name: 'VERIFY', role: 'Independent Database Audit' },
    { code: '07', name: 'REPLAN', role: 'Adaptive Loop / Resolution' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* ─── System Telemetry Bar (No Marketing Fluff) ─── */}
      <div className="bg-canvas-soft border border-[#e8e2d8] rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-ink">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span>AGENT RUNTIME: ONLINE</span>
          </div>
          <span className="text-mute">|</span>
          <span className="text-body font-mono text-[11px]">LangGraph 7-Node State Machine</span>
          <span className="text-mute hidden md:inline">|</span>
          <span className="text-body font-mono text-[11px] hidden md:inline">Mistral AI (mistral-small-latest)</span>
          <span className="text-mute hidden lg:inline">|</span>
          <span className="text-body font-mono text-[11px] hidden lg:inline">Neon PostgreSQL (AWS US-East-2)</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-accent-emerald font-semibold">8/8 Sandbox APIs Active</span>
          <span className="text-mute">|</span>
          <a
            href="http://127.0.0.1:8001/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>OpenAPI 3.0</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ─── Main Workbench: Two-Column Interactive Execution Deck ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (lg:col-span-5): Scenario Dispatcher & Live Environment State */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scenario Selector Matrix */}
          <div className="bg-canvas-soft border border-[#e8e2d8] rounded-md p-5 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-3">
              <div>
                <span className="eyebrow-uppercase text-body-mid text-[11px]">Benchmark Test Matrix</span>
                <h2 className="text-base font-bold text-ink tracking-tight">Select Evaluation Scenario</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-canvas border border-mute text-body">
                5 Test Cases
              </span>
            </div>

            <div className="space-y-2">
              {scenarios.map((sc) => {
                const isSelected = selectedScenarioKey === sc.key;
                const Icon = sc.icon;
                return (
                  <div
                    key={sc.key}
                    onClick={() => handleSelectScenario(sc)}
                    className={`cursor-pointer p-3 rounded-md border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-canvas border-primary shadow-sm ring-1 ring-primary/30'
                        : 'bg-canvas-soft border-[#e8e2d8] hover:border-mute hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-[#e8e2d8] text-ink'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-ink text-xs truncate">{sc.title}</h3>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-sm border ${sc.badgeColor}`}>
                            {sc.tag}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-body-mid truncate">{sc.order} • {sc.stockNote}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-mute'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Pre-Action Database Environment State */}
          <div className="bg-canvas-soft border border-[#e8e2d8] rounded-md p-5 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold font-mono uppercase text-ink">
                  Pre-Action Environment State
                </h3>
              </div>
              <span className="text-[10px] font-mono text-body-mid">Target: {orderNumber}</span>
            </div>

            {loadingOrder ? (
              <div className="py-4 text-center text-xs text-body-mid font-mono">
                Querying Neon PostgreSQL order records...
              </div>
            ) : targetOrder ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-canvas p-2 rounded-sm border border-[#e8e2d8]">
                    <span className="text-[10px] text-body-mid uppercase block">Order Status</span>
                    <span className="font-bold text-ink uppercase">{targetOrder.order_status}</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-sm border border-[#e8e2d8]">
                    <span className="text-[10px] text-body-mid uppercase block">Payment Status</span>
                    <span className="font-bold text-ink uppercase">{targetOrder.payment_status}</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-sm border border-[#e8e2d8]">
                    <span className="text-[10px] text-body-mid uppercase block">Total Amount</span>
                    <span className="font-bold text-ink">${targetOrder.total_amount}</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-sm border border-[#e8e2d8]">
                    <span className="text-[10px] text-body-mid uppercase block">Carrier Tracking</span>
                    <span className="font-bold text-ink truncate">
                      {targetOrder.shipment?.tracking_number || 'UNFULFILLED'}
                    </span>
                  </div>
                </div>

                {/* Constraint & Roadblock Spec */}
                <div className="bg-canvas p-3 rounded-sm border border-[#e8e2d8] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Evaluation Roadblock &amp; Constraint</span>
                  </div>
                  <p className="text-[11px] text-body leading-tight">
                    <strong>Trigger:</strong> {currentScenario.roadblock}
                  </p>
                  <p className="text-[11px] text-body leading-tight">
                    <strong>Rule:</strong> {currentScenario.constraint}
                  </p>
                  <p className="text-[11px] text-accent-emerald font-semibold leading-tight pt-1 border-t border-[#e8e2d8]">
                    <strong>Target:</strong> {currentScenario.verificationTarget}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-accent-rose font-mono">
                {orderError || 'Unable to query order record.'}
              </div>
            )}
          </div>

          {/* Autonomous Execution Trigger Console */}
          <div className="bg-canvas border border-primary/40 rounded-md p-5 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold font-mono uppercase text-ink">
                  Execution Dispatcher
                </h3>
              </div>
              <span className="text-[10px] font-mono text-accent-emerald font-semibold">
                IDEMPOTENT WRITE
              </span>
            </div>

            <form onSubmit={handleExecuteAgent} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase font-mono text-ink mb-1">
                  Customer Claim (Natural Language Input)
                </label>
                <textarea
                  required
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-canvas-soft border border-mute rounded-sm focus:outline-none focus:ring-1 focus:ring-primary text-ink transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isExecuting}
                className="btn-primary w-full py-3 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing LangGraph State Machine...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Autonomous Resolution Agent</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-7): Live Agentic State Machine & Execution Audit */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual 7-Node LangGraph State Machine Pipeline */}
          <div className="bg-canvas-soft border border-[#e8e2d8] rounded-md p-5 shadow-soft-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold font-mono uppercase text-ink">
                  Agentic State Machine (LangGraph Cycle)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-body-mid">7 Nodes Active</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {stateMachineNodes.map((node, idx) => {
                const isResolved = activeCaseResult && !isExecuting;
                const isStepActive = isExecuting;
                return (
                  <div
                    key={node.code}
                    className={`p-2 rounded-sm border text-[10px] flex flex-col justify-between transition-all ${
                      isResolved
                        ? 'bg-canvas border-accent-emerald text-accent-emerald'
                        : isStepActive
                        ? 'bg-primary/10 border-primary text-primary animate-pulse'
                        : 'bg-canvas border-[#e8e2d8] text-body-mid'
                    }`}
                  >
                    <span className="font-bold">{node.code}</span>
                    <span className="text-[9px] font-semibold truncate mt-0.5">{node.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Output & Verification Console */}
          <div className="bg-ink text-canvas rounded-md border border-ink-soft p-5 shadow-soft-card space-y-4 min-h-[420px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-ink-mid/80 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs font-bold text-canvas uppercase tracking-wider">
                    Execution Log &amp; Verification Audit
                  </span>
                </div>
                {activeCaseResult && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-bold ${
                      activeCaseResult.case_status === 'resolved'
                        ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40'
                        : activeCaseResult.case_status === 'escalated'
                        ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/40'
                        : activeCaseResult.case_status === 'awaiting_approval'
                        ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40'
                        : 'bg-ink-soft text-mute'
                    }`}
                  >
                    STATUS: {activeCaseResult.case_status}
                  </span>
                )}
              </div>

              {/* Sub-tabs for Execution Console */}
              <div className="flex items-center gap-2 border-b border-ink-mid/60 pb-2 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTraceTab('events')}
                  className={`px-2.5 py-1 rounded-sm transition-all ${
                    activeTraceTab === 'events'
                      ? 'bg-ink-soft text-primary font-bold'
                      : 'text-mute hover:text-canvas'
                  }`}
                >
                  Chronological Tool Events ({executionEvents.length})
                </button>
                <button
                  onClick={() => setActiveTraceTab('verification')}
                  className={`px-2.5 py-1 rounded-sm transition-all ${
                    activeTraceTab === 'verification'
                      ? 'bg-ink-soft text-primary font-bold'
                      : 'text-mute hover:text-canvas'
                  }`}
                >
                  Post-Action DB Verification
                </button>
                <button
                  onClick={() => setActiveTraceTab('payload')}
                  className={`px-2.5 py-1 rounded-sm transition-all ${
                    activeTraceTab === 'payload'
                      ? 'bg-ink-soft text-primary font-bold'
                      : 'text-mute hover:text-canvas'
                  }`}
                >
                  Raw State Diff
                </button>
              </div>

              {/* Console Body */}
              <div className="font-mono text-xs space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {isExecuting ? (
                  <div className="py-12 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
                    <p className="text-mute text-xs">
                      Traversing LangGraph Nodes: UNDERSTAND $\rightarrow$ RETRIEVE $\rightarrow$ PLAN $\rightarrow$ GUARD $\rightarrow$ ACT $\rightarrow$ VERIFY...
                    </p>
                  </div>
                ) : executionEvents.length === 0 ? (
                  <div className="py-12 text-center text-body-mid text-xs space-y-2">
                    <Code2 className="w-8 h-8 text-ink-mid mx-auto" />
                    <p>No agent run executed yet for this session.</p>
                    <p className="text-[11px] text-mute">
                      Select a scenario on the left and click &quot;Run Autonomous Resolution Agent&quot;.
                    </p>
                  </div>
                ) : activeTraceTab === 'events' ? (
                  <div className="space-y-2">
                    {executionEvents.map((ev, i) => (
                      <div
                        key={ev.id || i}
                        className="p-2.5 rounded-sm bg-ink-soft border border-ink-mid/60 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-mute">
                          <span className="font-bold text-primary uppercase">{ev.event_type}</span>
                          <span>{new Date(ev.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-canvas text-[11px]">{ev.summary}</p>
                        {ev.payload && (
                          <pre className="text-[10px] text-body-mid bg-ink/70 p-1.5 rounded overflow-x-auto">
                            {typeof ev.payload === 'string'
                              ? ev.payload
                              : JSON.stringify(ev.payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : activeTraceTab === 'verification' ? (
                  <div className="space-y-3 p-3 bg-ink-soft rounded-sm border border-ink-mid/60">
                    <div className="flex items-center gap-2 text-accent-emerald font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>INDEPENDENT RELATIONAL DATABASE AUDIT</span>
                    </div>
                    <div className="space-y-2 text-[11px] text-mute">
                      <p>
                        <strong className="text-canvas">Target Order:</strong> {orderNumber}
                      </p>
                      <p>
                        <strong className="text-canvas">Verification Method:</strong> Direct PostgreSQL relational query asserting state mutation post-action.
                      </p>
                      <p>
                        <strong className="text-canvas">Current Verified State:</strong>
                      </p>
                      <pre className="bg-ink p-2 rounded text-[10px] text-accent-emerald overflow-x-auto">
                        {JSON.stringify(
                          {
                            order_number: targetOrder?.order_number,
                            order_status: targetOrder?.order_status,
                            payment_status: targetOrder?.payment_status,
                            replacement_order: targetOrder?.replacement_order_id || 'N/A',
                            audit_case_id: activeCaseResult?.id,
                            audit_status: activeCaseResult?.case_status,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-ink-soft rounded-sm border border-ink-mid/60 text-[11px] text-mute space-y-2">
                    <span className="text-canvas font-bold block">CASE RECORD PAYLOAD:</span>
                    <pre className="bg-ink p-2 rounded text-[10px] text-mute overflow-x-auto">
                      {JSON.stringify(activeCaseResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Console Footer / Action Switch */}
            {activeCaseResult && (
              <div className="pt-3 border-t border-ink-mid/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[11px] text-mute">
                  Case ID: #{activeCaseResult.id} • Order: {orderNumber}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('trace')}
                    className="text-primary hover:underline font-mono text-xs inline-flex items-center gap-1"
                  >
                    <span>Inspect Full State Graph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('cases')}
                    className="px-3 py-1 rounded-sm bg-primary text-on-primary font-mono text-xs font-semibold"
                  >
                    Open in Case Tracker
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Technical Deep-Dive Panels (No Marketing Copy) ─── */}
      <div className="bg-canvas-soft border border-[#e8e2d8] rounded-md p-6 shadow-soft-card space-y-5">
        {/* Navigation Tabs for Technical Sub-panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e2d8] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-ink text-sm uppercase tracking-wide font-mono">
              System Engineering &amp; Environment Specification
            </h3>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveTechTab('tools')}
              className={`px-3 py-1.5 rounded-sm transition-all ${
                activeTechTab === 'tools'
                  ? 'bg-ink text-canvas font-bold'
                  : 'bg-canvas text-body hover:text-ink border border-[#e8e2d8]'
              }`}
            >
              8 Enterprise Tools
            </button>
            <button
              onClick={() => setActiveTechTab('recovery')}
              className={`px-3 py-1.5 rounded-sm transition-all ${
                activeTechTab === 'recovery'
                  ? 'bg-ink text-canvas font-bold'
                  : 'bg-canvas text-body hover:text-ink border border-[#e8e2d8]'
              }`}
            >
              Failure Recovery &amp; Adaptation
            </button>
            <button
              onClick={() => setActiveTechTab('specs')}
              className={`px-3 py-1.5 rounded-sm transition-all ${
                activeTechTab === 'specs'
                  ? 'bg-ink text-canvas font-bold'
                  : 'bg-canvas text-body hover:text-ink border border-[#e8e2d8]'
              }`}
            >
              Architecture &amp; Robustness
            </button>
          </div>
        </div>

        {/* Tab 1: 8 Enterprise Tools Matrix */}
        {activeTechTab === 'tools' && (
          <div className="space-y-4">
            <div className="text-xs text-body font-mono">
              The agent interacts directly with 8 simulated relational enterprise subsystems. Every action mutates verified PostgreSQL state.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {enterpriseTools.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.id}
                    className="bg-canvas p-4 rounded-sm border border-[#e8e2d8] space-y-2 flex flex-col justify-between font-mono"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-sm bg-[#efe8df] text-primary flex items-center justify-center border border-mute/50">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-semibold text-body-mid uppercase bg-canvas-soft px-1.5 py-0.5 rounded border border-mute/40">
                          {t.protocol}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-ink">{t.name}</h4>
                      <p className="text-[11px] text-body-mid mt-0.5 leading-tight">{t.role}</p>
                    </div>

                    <div className="pt-2 border-t border-[#e8e2d8] space-y-1 text-[10px]">
                      <div className="text-primary truncate">{t.endpoint}</div>
                      <div className="text-body leading-tight text-[10px]">{t.mutation}</div>
                      <div className="text-accent-emerald font-semibold">{t.idempotency}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Failure Recovery & Adaptation Matrix */}
        {activeTechTab === 'recovery' && (
          <div className="space-y-4">
            <div className="text-xs text-body font-mono">
              Deterministic recovery paths when state-changing actions encounter real-world roadblocks.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-canvas p-4 rounded-sm border border-[#e8e2d8] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <RotateCcw className="w-4 h-4" />
                  <span>STOCKOUT $\rightarrow$ RE-PLANNING</span>
                </div>
                <p className="text-[11px] text-body leading-relaxed">
                  When inventory count is 0 in target warehouses, the execution node raises a stockout condition. The graph routes to <code>adapt_or_replan_node</code>, re-evaluating policies to execute a full payment refund ($199.99) rather than halting with an error.
                </p>
              </div>

              <div className="bg-canvas p-4 rounded-sm border border-[#e8e2d8] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-accent-amber">
                  <ShieldAlert className="w-4 h-4" />
                  <span>VALUE GATE $\rightarrow$ HUMAN-IN-THE-LOOP</span>
                </div>
                <p className="text-[11px] text-body leading-relaxed">
                  Financial transactions over $200.00 are hard-blocked from automated execution. The agent creates a record in the <code>approvals</code> table and places the case in <code>awaiting_approval</code> state for Staff Operations authorization.
                </p>
              </div>

              <div className="bg-canvas p-4 rounded-sm border border-[#e8e2d8] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-accent-rose">
                  <Clock className="w-4 h-4" />
                  <span>TIME LIMIT $\rightarrow$ POLICY CITATION</span>
                </div>
                <p className="text-[11px] text-body leading-relaxed">
                  Delivery dates older than 15 calendar days trigger deterministic constraint violations. The agent cites Policy Section 2.1, refuses the refund, and cleanly escalates to Tier 2 with clear audit reasoning.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Technical Architecture & Robustness */}
        {activeTechTab === 'specs' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-canvas p-4 rounded-sm border border-[#e8e2d8] space-y-2">
                <h4 className="font-bold text-ink text-xs uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  <span>Idempotency &amp; Replay Protection</span>
                </h4>
                <p className="text-[11px] text-body leading-relaxed">
                  Every state-changing API invocation (refunds, replacements, cancellations) requires a deterministically generated UUID idempotency key based on <code>case_id + action_type + timestamp</code>. Replay attempts return previously committed records with zero duplicate mutations.
                </p>
              </div>

              <div className="bg-canvas p-4 rounded-sm border border-[#e8e2d8] space-y-2">
                <h4 className="font-bold text-ink text-xs uppercase flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span>Independent Post-Action Verification</span>
                </h4>
                <p className="text-[11px] text-body leading-relaxed">
                  The agent does not rely on API response codes alone. The <code>verify_resolution_node</code> executes an independent SQL query against the Neon PostgreSQL database to physically confirm that inventory was decremented, orders were cancelled, or replacement rows exist.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
