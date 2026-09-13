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
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-500 text-sm">View purchase history, shipment tracking, and support options.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl text-center text-slate-500 border border-slate-200">
          No orders found for this account.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order Number</span>
                  <h3 className="font-bold text-slate-900 text-lg">{order.order_number}</h3>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</span>
                  <p className="text-slate-700 text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</span>
                  <p className="text-slate-900 text-lg font-extrabold">${order.total_amount}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : order.order_status === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.order_status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {order.order_status === 'processing' && <Clock className="w-3.5 h-3.5" />}
                    {order.order_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Carrier: <strong>FedEx / UPS</strong></span>
                  <span>•</span>
                  <span>Payment: <strong>{order.payment_status}</strong></span>
                </div>

                <button
                  onClick={() => handleReportIssue(order.order_number)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-tealbrand-600 hover:text-tealbrand-700 bg-tealbrand-50 hover:bg-tealbrand-100 px-3 py-2 rounded-lg transition-all"
                >
                  Report Issue / Return <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
