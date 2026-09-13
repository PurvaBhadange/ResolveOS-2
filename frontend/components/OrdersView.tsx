import React, { useEffect, useState } from 'react';
import { Package, Truck, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
  const getCarrierInfo = (order: any) => {
    const tracking = order.shipment?.tracking_number || '';
    if (tracking.includes('BLUEDART')) {
      return { name: 'Blue Dart Express', badge: 'bg-sky-50 text-sky-800 border-sky-200' };
    }
    if (tracking.includes('DELHIVERY')) {
      return { name: 'Delhivery Surface', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (tracking.includes('EKART')) {
      return { name: 'Ekart Logistics', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    return { name: order.shipment?.carrier || 'Blue Dart Express', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  return (
    <div className="space-y-5 pb-16">
      {/* View Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-1">
            Customer Ledger &bull; Order Manifest
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-slate-600 mt-1">
            Verified purchase history, logistics tracking records, and post-delivery dispute intake.
          </p>
        </div>
        {!loading && orders.length > 0 && (
          <span className="font-mono text-xs tracking-wide uppercase rounded-md border border-slate-200 px-3 py-1 bg-white text-slate-700 shadow-subtle">
            {orders.length} Total Records
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200/90 p-6 bg-white space-y-4 shadow-subtle">
          <div className="h-4 w-44 bg-slate-200 rounded skeleton-mono" />
          <div className="space-y-2.5 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-md bg-slate-100 skeleton-mono" />
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200/90 p-12 text-center bg-white shadow-subtle space-y-3">
          <Package size={28} strokeWidth={1.5} className="mx-auto text-slate-400" />
          <h3 className="font-serif text-base font-bold tracking-tight text-slate-900">
            No Orders Recorded
          </h3>
          <p className="font-serif italic text-xs text-slate-500 max-w-sm mx-auto">
            There are no past orders on file for this account. Completed checkouts will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200/90 bg-white overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID / Item</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Logistics Carrier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const carrier = getCarrierInfo(order);
                  const isDelivered = order.order_status === 'delivered';
                  const isCancelled = order.order_status === 'cancelled';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Order Number & Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-xs text-slate-900 block">
                          {order.order_number}
                        </span>
                        <span className="font-serif italic text-xs text-slate-500 mt-0.5 block truncate max-w-[220px]">
                          {order.items?.[0]?.variant?.title || 'Electronics Purchase'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-serif font-medium text-xs text-slate-800">
                          <Truck size={14} strokeWidth={1.5} className="text-slate-400" />
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${carrier.badge}`}>
                            {carrier.name}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 block mt-1">
                          {order.shipment?.tracking_number || 'Not dispatched'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[10px] tracking-wide uppercase border font-semibold ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isDelivered && <CheckCircle2 size={12} className="text-emerald-600" />}
                          {isCancelled && <XCircle size={12} className="text-rose-600" />}
                          {!isDelivered && !isCancelled && <Clock size={12} className="text-amber-600" />}
                          <span>{order.order_status}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-slate-900">
                        ₹{order.total_amount}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleReportIssue(order.order_number)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-mono text-xs tracking-wide uppercase shadow-subtle transition-all"
                        >
                          <span>Dispute</span>
                          <ArrowRight size={11} strokeWidth={2} className="text-slate-400" />
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
