import React, { useState } from 'react';
import { Search, Package, RefreshCw, Truck, AlertTriangle, ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';
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

  const loadPreset = (preset: 'stockout' | 'high_value' | 'expired' | 'cancel') => {
    if (preset === 'stockout') {
      setOrderNumber('ORD-2026-8801');
      setIssueTitle('Headphones arrived damaged - Request replacement');
      setIssueDescription('My AuraSound headphones arrived yesterday with a cracked left ear cup and sound distortion. I want a replacement.');
    } else if (preset === 'high_value') {
      setOrderNumber('ORD-2026-8802');
      setIssueTitle('Damaged Smartwatch Bundle - Request refund ($499.98)');
      setIssueDescription('Apex Smartwatch arrived defective with touchscreen unresponsiveness. Requesting full refund of $499.98.');
    } else if (preset === 'expired') {
      setOrderNumber('ORD-2026-8803');
      setIssueTitle('Return wireless earbuds - Delivered 40 days ago');
      setIssueDescription('Requesting return and refund for Pulse Earbuds delivered 40 days ago.');
    } else if (preset === 'cancel') {
      setOrderNumber('ORD-2026-8804');
      setIssueTitle('Cancel order before shipment - ErgoMech Keyboard');
      setIssueDescription('Please cancel order ORD-2026-8804 before shipment and issue refund.');
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Order details first
      const order = await api.getOrderByNumber(orderNumber.trim());
      if (!order) {
        throw new Error(`Order number ${orderNumber} not found.`);
      }

      // 2. Submit Support Case
      const newCase = await api.createCase({
        customer_id: order.customer_id,
        order_id: order.id,
        title: issueTitle,
        description: issueDescription,
        category: 'return_refund',
      });

      onCaseCreated(newCase.id);
      setActiveTab('cases');
    } catch (err: any) {
      setError(err.message || 'Failed to submit support issue.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'damaged', title: 'Damaged / Defective Item', icon: AlertTriangle, desc: 'Cracked, non-functional or broken on delivery' },
    { id: 'returns', title: 'Returns & Refunds', icon: RefreshCw, desc: 'Return window policies and refund status' },
    { id: 'shipping', title: 'Shipping & Delivery', icon: Truck, desc: 'Tracking orders, missing packages & delays' },
    { id: 'orders', title: 'Order Modifications', icon: Package, desc: 'Cancel or update unfulfilled orders' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Zapier-Inspired Hero Section (Warm Cream Canvas + Deep Coffee Ink Accent + Zapier Orange CTA) */}
      <div className="bg-[#f8f4f0] text-[#201515] rounded-[12px] p-8 sm:p-12 border border-[#c5c0b1] shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#201515] text-[#fffefb] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" /> Autonomous Customer Resolution Engine
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#201515] leading-tight">
            Instant, Verifiable Customer Issue Resolution
          </h1>

          <p className="text-[#605d52] text-base sm:text-lg leading-relaxed">
            ResolveOS independently verifies order records, policy return windows, and warehouse stock levels to execute transactional business resolutions instantly with zero manual delay.
          </p>

          {/* Interactive Demo Scenario Quick Launcher */}
          <div className="pt-3 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#201515] block">
              1-Click Demo Scenarios to Test:
            </span>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadPreset('stockout')}
                className="px-4 py-2.5 rounded-[12px] bg-[#ff4f00] hover:bg-[#e04500] text-[#fffefb] font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>1. Stockout Adaptation</span>
                <span className="text-[10px] opacity-80">(ORD-2026-8801)</span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('high_value')}
                className="px-4 py-2.5 rounded-[12px] bg-[#201515] hover:bg-[#2f2a26] text-[#fffefb] font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>2. High-Value $200+ Approval</span>
                <span className="text-[10px] opacity-80">(ORD-2026-8802)</span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('expired')}
                className="px-4 py-2.5 rounded-[12px] bg-[#fffefb] hover:bg-[#f8f4f0] text-[#201515] border border-[#201515] font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>3. Expired Return Window</span>
                <span className="text-[10px] opacity-70">(ORD-2026-8803)</span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('cancel')}
                className="px-4 py-2.5 rounded-[12px] bg-[#fffefb] hover:bg-[#f8f4f0] text-[#201515] border border-[#c5c0b1] font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>4. Pre-Shipment Cancel</span>
                <span className="text-[10px] opacity-70">(ORD-2026-8804)</span>
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
              className={`cursor-pointer p-6 rounded-[12px] border transition-all ${
                isSelected
                  ? 'bg-[#201515] text-[#fffefb] border-[#201515] shadow-lg'
                  : 'bg-[#f8f4f0] text-[#201515] border-[#c5c0b1] hover:border-[#201515]'
              }`}
            >
              <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center mb-4 ${
                isSelected ? 'bg-[#ff4f00] text-[#fffefb]' : 'bg-[#fffefb] text-[#201515] border border-[#c5c0b1]'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">{cat.title}</h3>
              <p className={`text-xs mt-1.5 ${isSelected ? 'text-[#c5c0b1]' : 'text-[#605d52]'}`}>{cat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Issue Submission Form */}
      <div className="bg-[#f8f4f0] rounded-[12px] p-6 sm:p-10 border border-[#c5c0b1] shadow-sm">
        <div className="border-b border-[#c5c0b1] pb-6 mb-6">
          <h2 className="text-2xl font-bold text-[#201515]">Submit Resolution Request</h2>
          <p className="text-[#605d52] text-sm mt-1">Enter your order details and issue summary to initiate autonomous agent processing.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitIssue} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#201515] mb-2">Order Number</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-8801"
                className="w-full px-4 py-3 rounded-[12px] bg-[#fffefb] border border-[#201515] focus:outline-none focus:ring-2 focus:ring-[#ff4f00] text-[#201515] font-semibold"
              />
              <span className="text-xs text-[#939084] mt-1.5 block">Demo Orders: ORD-2026-8801, ORD-2026-8802, ORD-2026-8803, ORD-2026-8804</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#201515] mb-2">Issue Title</label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief title of the problem"
                className="w-full px-4 py-3 rounded-[12px] bg-[#fffefb] border border-[#201515] focus:outline-none focus:ring-2 focus:ring-[#ff4f00] text-[#201515] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#201515] mb-2">Detailed Issue Description</label>
            <textarea
              required
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what happened and what outcome you desire..."
              className="w-full px-4 py-3 rounded-[12px] bg-[#fffefb] border border-[#201515] focus:outline-none focus:ring-2 focus:ring-[#ff4f00] text-[#201515] font-semibold"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[12px] bg-[#ff4f00] hover:bg-[#e04500] text-[#fffefb] font-bold text-sm transition-all disabled:opacity-50 shadow-md"
            >
              {loading ? 'Processing Resolution...' : 'Submit Resolution Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
