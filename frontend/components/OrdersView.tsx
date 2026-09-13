import React, { useEffect, useState } from 'react';
import { Package, Truck, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

interface OrdersViewProps {
  onSelectOrder: (orderNumber: string) => void;
  setActiveTab: (tab: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onSelectOrder, setActiveTab }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Default customer account
    api.getCustomerOrders(1)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleReportIssue = (orderNumber: string) => {
    onSelectOrder(orderNumber);
    setActiveTab('help');
  };

  // Helper to get realistic carrier based on tracking number
  const getCarrierName = (order: any) => {
    const tracking = order.shipment?.tracking_number || '';
    if (tracking.includes('BLUEDART')) return 'Blue Dart Express';
    if (tracking.includes('DELHIVERY')) return 'Delhivery Surface';
    if (tracking.includes('EKART')) return 'Ekart Logistics';
    return order.shipment?.carrier || 'Blue Dart Express';
  };

  return (
    <div className="space-y-6 pb-16">
      {/* View Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-1">
            Customer Ledger &bull; Manifest Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-black">
            Customer Orders
          </h1>
          <p className="text-sm font-serif italic text-neutral-700 mt-1">
            Verified purchase history, logistics tracking records, and post-delivery dispute intake.
          </p>
        </div>
        {!loading && orders.length > 0 && (
          <span className="font-mono text-xs tracking-widest uppercase border-2 border-black px-3 py-1 bg-black text-white font-bold rounded-md">
            {orders.length} Verified Records
          </span>
        )}
      </div>

      {loading ? (
        <div className="border-2 border-black p-8 bg-white space-y-4 rounded-2xl">
          <div className="h-5 w-48 skeleton-mono" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton-mono" />
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="border-2 border-black p-12 text-center bg-white space-y-3 rounded-2xl">
          <Package size={32} strokeWidth={1.5} className="mx-auto text-black" />
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-black">
            No Orders On File
          </h3>
          <p className="font-serif italic text-xs text-neutral-600 max-w-sm mx-auto">
            There are no past orders recorded under this customer key. Verified transactions will appear here.
          </p>
        </div>
      ) : (
        <div className="border-2 border-black bg-white overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-white border-b-2 border-black font-mono text-[11px] uppercase tracking-widest">
                <tr>
                  <th className="py-3 px-4">Order ID / SKU</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Logistics Carrier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settled Total</th>
                  <th className="py-3 px-4 text-right">Dispute Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {orders.map((order) => {
                  const carrier = getCarrierName(order);
                  const isDelivered = order.order_status === 'delivered';
                  const isCancelled = order.order_status === 'cancelled';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-black hover:text-white transition-colors duration-100 group"
                    >
                      {/* Order Number & Items */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-xs block">
                          {order.order_number}
                        </span>
                        <span className="font-serif italic text-xs text-neutral-600 group-hover:text-neutral-300 mt-0.5 block truncate max-w-[220px]">
                          {order.items?.[0]?.variant?.title || 'Electronics Purchase'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-mono text-xs">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-serif font-semibold text-xs">
                          <Truck size={14} strokeWidth={1.5} />
                          <span>{carrier}</span>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-400 block mt-0.5">
                          {order.shipment?.tracking_number || 'Not dispatched'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2 py-0.5 border border-current font-mono text-[10px] tracking-widest uppercase font-bold rounded-md">
                          {order.order_status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right font-mono text-sm font-bold">
                        ₹{order.total_amount}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleReportIssue(order.order_number)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black bg-white text-black font-mono text-[11px] tracking-wider uppercase font-bold rounded-lg group-hover:border-white group-hover:bg-white group-hover:text-black hover:bg-neutral-200 transition-colors duration-100"
                        >
                          <span>Dispute</span>
                          <ArrowRight size={12} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
