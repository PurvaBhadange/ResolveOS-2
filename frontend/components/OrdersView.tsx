import React, { useEffect, useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

interface OrdersViewProps {
  onSelectOrder: (orderNumber: string) => void;
  setActiveTab: (tab: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onSelectOrder, setActiveTab }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = () => {
    setLoading(true);
    // Default to Sarah Jenkins (Customer 1)
    api.getCustomerOrders(1)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReportIssue = (orderNumber: string) => {
    onSelectOrder(orderNumber);
    setActiveTab('help');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow-uppercase text-body-mid">Purchase Records</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">My Orders</h1>
          <p className="text-body text-sm mt-1">
            Review simulated purchase history, fulfillment status, and file autonomous returns.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-canvas-soft hover:bg-[#efe8df] text-ink border border-mute text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-body" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-body-mid text-sm bg-canvas-soft rounded-md border border-[#e8e2d8]">
          Loading customer orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-canvas-soft rounded-md text-center text-body border border-[#e8e2d8]">
          No orders found for this customer account.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-canvas-soft rounded-md p-6 border border-[#e8e2d8] shadow-soft-card space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e2d8] pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-body-mid">Order Number</span>
                  <h3 className="font-bold text-ink text-lg tracking-tight mt-0.5">{order.order_number}</h3>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-body-mid">Order Date</span>
                  <p className="text-ink text-sm font-medium mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-body-mid">Total Amount</span>
                  <p className="text-ink text-lg font-bold mt-0.5">${order.total_amount}</p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      order.order_status === 'delivered'
                        ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30'
                        : order.order_status === 'cancelled'
                        ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/30'
                        : 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30'
                    }`}
                  >
                    {order.order_status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {order.order_status === 'processing' && <Clock className="w-3.5 h-3.5" />}
                    {order.order_status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3 text-xs text-body">
                  <Truck className="w-4 h-4 text-body-mid" />
                  <span>Carrier: <strong className="text-ink">FedEx / UPS Express</strong></span>
                  <span>•</span>
                  <span>Payment: <strong className="text-ink capitalize">{order.payment_status}</strong></span>
                </div>

                <button
                  onClick={() => handleReportIssue(order.order_number)}
                  className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 shadow-sm"
                >
                  <span>Report Issue / Return</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
