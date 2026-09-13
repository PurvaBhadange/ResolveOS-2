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
          <h1 className="text-3xl font-extrabold text-[#201515]">My Orders</h1>
          <p className="text-[#605d52] text-sm mt-1">View purchase history, shipment tracking, and instant support options.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#605d52] text-sm">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-[#f8f4f0] rounded-[12px] text-center text-[#605d52] border border-[#c5c0b1]">
          No orders found for this account.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#f8f4f0] rounded-[12px] p-6 border border-[#c5c0b1] shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c5c0b1] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#605d52]">Order Number</span>
                  <h3 className="font-bold text-[#201515] text-lg">{order.order_number}</h3>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#605d52]">Date</span>
                  <p className="text-[#201515] text-sm font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#605d52]">Total</span>
                  <p className="text-[#201515] text-lg font-black">${order.total_amount}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : order.order_status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {order.order_status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {order.order_status === 'processing' && <Clock className="w-3.5 h-3.5" />}
                    {order.order_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-sm text-[#605d52]">
                  <Truck className="w-4 h-4 text-[#201515]" />
                  <span>Carrier: <strong className="text-[#201515]">FedEx / UPS</strong></span>
                  <span>•</span>
                  <span>Payment: <strong className="text-[#201515]">{order.payment_status}</strong></span>
                </div>

                <button
                  onClick={() => handleReportIssue(order.order_number)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#fffefb] bg-[#ff4f00] hover:bg-[#e04500] px-4 py-2 rounded-[12px] transition-all shadow-sm"
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
