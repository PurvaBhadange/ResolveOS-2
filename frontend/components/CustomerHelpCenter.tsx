import React, { useState } from 'react';
import { Package, RefreshCw, Truck, AlertTriangle, ArrowRight, Sparkles, Zap } from 'lucide-react';
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

  const loadPreset = (preset: 'stockout' | 'high_value' | 'expired' | 'cancel') => {
    if (preset === 'stockout') {
      setOrderNumber('ORD-2026-8801');
      setIssueTitle('Headphones arrived damaged - Request replacement');
      setIssueDescription('My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.');
      setSelectedCategory('damaged');
    } else if (preset === 'high_value') {
      setOrderNumber('ORD-2026-8802');
      setIssueTitle('Damaged Smartwatch Bundle - Request refund ($499.98)');
      setIssueDescription('Apex Smartwatch arrived defective with touchscreen unresponsiveness. Requesting full refund of $499.98.');
      setSelectedCategory('damaged');
    } else if (preset === 'expired') {
      setOrderNumber('ORD-2026-8803');
      setIssueTitle('Return wireless earbuds - Delivered 40 days ago');
      setIssueDescription('Requesting return and refund for Pulse Earbuds delivered 40 days ago.');
      setSelectedCategory('returns');
    } else if (preset === 'cancel') {
      setOrderNumber('ORD-2026-8804');
      setIssueTitle('Cancel order before shipment - ErgoMech Keyboard');
      setIssueDescription('Please cancel order ORD-2026-8804 before shipment and issue refund.');
      setSelectedCategory('orders');
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Order details first to get numeric order_id
      const order = await api.getOrderByNumber(orderNumber.trim());
      if (!order || !order.id) {
        throw new Error(`Order "${orderNumber}" not found. Please check the order number and ensure the backend is running.`);
      }

      // 2. Create support case using real customer_id & order_id from DB
      const newCase = await api.createCase({
        customer_id: order.customer_id,
        order_id: order.id,
        title: issueTitle,
        description: issueDescription,
        category: selectedCategory || 'return_refund',
      });

      // 3. Immediately trigger the autonomous LangGraph agent
      setAgentRunning(true);
      try {
        await api.runAgentOnCase(newCase.id);
      } catch (agentErr) {
        // Agent errors are non-fatal - case still created
        console.warn('Agent run warning:', agentErr);
      } finally {
        setAgentRunning(false);
      }

      // 4. Navigate to Case Tracker to see real-time resolution
      onCaseCreated(newCase.id);
      setActiveTab('cases');
    } catch (err: any) {
      setError(err.message || 'Failed to submit support issue. Make sure the backend is running on port 8001.');
    } finally {
      setLoading(false);
      setAgentRunning(false);
    }
  };

  const categories = [
    { id: 'damaged', title: 'Damaged / Defective Item', icon: AlertTriangle, desc: 'Cracked, non-functional or broken on delivery' },
    { id: 'returns', title: 'Returns & Refunds', icon: RefreshCw, desc: 'Return window policies and refund status' },
    { id: 'shipping', title: 'Shipping & Delivery', icon: Truck, desc: 'Tracking orders, missing packages & delays' },
    { id: 'orders', title: 'Order Modifications', icon: Package, desc: 'Cancel or update unfulfilled orders' },
  ];

  const isProcessing = loading || agentRunning;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-tealbrand-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-tealbrand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tealbrand-500/20 text-tealbrand-300 text-xs font-semibold border border-tealbrand-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Instant Resolution
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How can we resolve your issue today?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            ResolveOS independently verifies order records, policy return windows, and warehouse stock levels to execute transactional business resolutions instantly with zero manual delay.
          </p>

          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-tealbrand-300 block">1-Click Demo Scenarios to Test:</span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => loadPreset('stockout')}
                className="px-3 py-2 rounded-xl bg-tealbrand-500 hover:bg-tealbrand-600 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3" />
                1. Stockout Adaptation <span className="opacity-70 font-mono">(ORD-2026-8801)</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('high_value')}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-all shadow-sm"
              >
                2. High-Value $200+ Approval <span className="opacity-70 font-mono">(ORD-2026-8802)</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('expired')}
                className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-all shadow-sm"
              >
                3. Expired Return Window <span className="opacity-70 font-mono">(ORD-2026-8803)</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('cancel')}
                className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-sm"
              >
                4. Pre-Shipment Cancel <span className="opacity-70 font-mono">(ORD-2026-8804)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Execution State Visualizer */}
      <AgentLoopVisualizer isComplete={true} />

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer p-6 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-white border-tealbrand-600 shadow-lg shadow-tealbrand-600/5 ring-2 ring-tealbrand-600/20'
                  : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isSelected ? 'bg-tealbrand-50 text-tealbrand-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{cat.title}</h3>
              <p className="text-slate-500 text-xs mt-1">{cat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Issue Submission Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Submit Resolution Request</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your order details and the agent will autonomously resolve it end-to-end.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitIssue} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Order Number</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-8801"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tealbrand-600 text-slate-900 font-medium"
              />
              <span className="text-xs text-slate-400 mt-1 block">Try demo order: ORD-2026-8801 (Damaged Headphones) or ORD-2026-8802 (High-Value)</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Title</label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief title of the problem"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tealbrand-600 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Issue Description</label>
            <textarea
              required
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what happened and what outcome you desire..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tealbrand-600 text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-md"
            >
              {agentRunning ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Agent Running...
                </>
              ) : loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating Case...
                </>
              ) : (
                <>
                  Submit &amp; Run Agent
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
