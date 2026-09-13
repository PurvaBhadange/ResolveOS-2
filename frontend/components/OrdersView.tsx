import React, { useEffect, useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

interface OrdersViewProps {
  onSelectOrder: (orderNumber: string) => void;
  setActiveTab: (tab: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onSelectOrder, setActiveTab }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Default to Sarah Jenkins (Customer 1)
    api.getCustomerOrders(1)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleReportIssue = (orderNumber: string) => {
    onSelectOrder(orderNumber);
    setActiveTab('help');
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-[#c5c0b1]/40 pb-5">
        <div>
          <span className="zapier-eyebrow block mb-1">PURCHASE HISTORY</span>
          <h1 className="text-3xl font-semibold text-[#201515]">My Orders</h1>
          <p className="text-[#605d52] text-base mt-1">View purchase history, shipment tracking, and support options.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#939084] text-base zapier-card">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 zapier-card text-center text-[#605d52] text-base">
          No orders found for this account.
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="zapier-card p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c5c0b1]/40 pb-5">
                <div>
                  <span className="zapier-eyebrow block text-xs mb-1 text-[#939084]">ORDER NUMBER</span>
                  <h3 className="font-semibold text-[#201515] text-xl">{order.order_number}</h3>
                </div>
                <div>
                  <span className="zapier-eyebrow block text-xs mb-1 text-[#939084]">ORDER DATE</span>
                  <p className="text-[#201515] text-base font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="zapier-eyebrow block text-xs mb-1 text-[#939084]">TOTAL VALUE</span>
                  <p className="text-[#201515] text-xl font-bold">${order.total_amount}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold capitalize ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : order.order_status === 'cancelled'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {order.order_status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {order.order_status === 'processing' && <Clock className="w-3.5 h-3.5" />}
                    {order.order_status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3 text-sm text-[#605d52]">
                  <Truck className="w-4 h-4 text-[#201515]" />
                  <span>Fulfillment: <strong className="text-[#201515]">Standard Delivery</strong></span>
                  <span>•</span>
                  <span>Payment: <strong className="text-[#201515]">{order.payment_status}</strong></span>
                </div>

                <button
                  onClick={() => handleReportIssue(order.order_number)}
                  className="zapier-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  Report Issue / Return <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
