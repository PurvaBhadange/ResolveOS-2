import React, { useState } from 'react';
import { Search, Package, RefreshCw, Truck, AlertTriangle, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

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
    <div className="space-y-10 pb-16">
      {/* Zapier-Inspired Hero Band */}
      <div className="zapier-card-dark p-8 sm:p-14 relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4f00]/20 text-[#ff4f00] text-xs font-bold tracking-wider uppercase border border-[#ff4f00]/30">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Instant Resolution
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#fffefb] leading-tight">
            How can we resolve your issue today?
          </h1>
          <p className="text-[#c5c0b1] text-lg sm:text-xl leading-relaxed">
            ResolveOS independently verifies system records, policy rules, and inventory levels to resolve customer issues instantly with zero manual delay.
          </p>

          <div className="pt-4 space-y-3">
            <span className="zapier-eyebrow text-[#c5c0b1] block">SELECT DEMO SCENARIO TO TEST:</span>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadPreset('stockout')}
                className="zapier-btn-primary px-4 py-2.5 text-xs sm:text-sm"
              >
                1. Stockout Adaptation (ORD-2026-8801)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('high_value')}
                className="px-4 py-2.5 rounded-xl bg-[#fffefb] hover:bg-[#f8f4f0] text-[#201515] font-semibold text-xs sm:text-sm transition-all"
              >
                2. High-Value $200+ Approval (ORD-2026-8802)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('expired')}
                className="px-4 py-2.5 rounded-xl bg-[#2f2a26] hover:bg-[#36342e] text-[#fffefb] border border-[#c5c0b1]/30 font-semibold text-xs sm:text-sm transition-all"
              >
                3. Expired Return Window (ORD-2026-8803)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('cancel')}
                className="px-4 py-2.5 rounded-xl bg-[#2f2a26] hover:bg-[#36342e] text-[#fffefb] border border-[#c5c0b1]/30 font-semibold text-xs sm:text-sm transition-all"
              >
                4. Pre-Shipment Cancellation (ORD-2026-8804)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards (Zapier Soft Cream Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer p-6 rounded-xl transition-all ${
                isSelected
                  ? 'bg-[#fffefb] border-2 border-[#ff4f00] shadow-md'
                  : 'zapier-card hover:border-[#201515] hover:bg-[#fffefb]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isSelected ? 'bg-[#ff4f00] text-[#fffefb]' : 'bg-[#201515] text-[#fffefb]'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[#201515] text-lg">{cat.title}</h3>
              <p className="text-[#605d52] text-sm mt-1">{cat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Issue Submission Form */}
      <div className="zapier-card p-8 sm:p-12">
        <div className="border-b border-[#c5c0b1]/40 pb-6 mb-8">
          <span className="zapier-eyebrow block mb-1">AUTOMATED WORKFLOW INITIATION</span>
          <h2 className="text-3xl font-semibold text-[#201515]">Submit Resolution Request</h2>
          <p className="text-[#605d52] text-base mt-1">Enter your order details and requested outcome to initiate autonomous resolution.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitIssue} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#201515] mb-2">Order Number</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-8801"
                className="zapier-input w-full text-base font-medium"
              />
              <span className="text-xs text-[#939084] mt-1.5 block">Try demo order: ORD-2026-8801 (Damaged Headphones) or ORD-2026-8802 (High-Value)</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#201515] mb-2">Issue Title</label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Brief title of the problem"
                className="zapier-input w-full text-base font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#201515] mb-2">Detailed Issue Description</label>
            <textarea
              required
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what happened and what outcome you desire..."
              className="zapier-input w-full text-base font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="zapier-btn-primary inline-flex items-center gap-2 px-8 py-4 text-base disabled:opacity-50"
            >
              {loading ? 'Processing Resolution...' : 'Submit Resolution Request'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
