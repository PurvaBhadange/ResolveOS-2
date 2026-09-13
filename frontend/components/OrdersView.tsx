import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
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
    <div className="space-y-5 pb-12">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified purchase history, logistics tracking, and post-delivery dispute management.
          </p>
        </div>
        {!loading && orders.length > 0 && (
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded border border-slate-200">
            {orders.length} Total Orders
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <div className="h-4 w-48 bg-slate-200 rounded skeleton" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-md skeleton" />
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle p-12 text-center space-y-3">
          <Package className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no past orders recorded under this account. Orders placed through verified checkout will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-subtle overflow-hidden">
          {/* Table for Desktop */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/90 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Logistics Carrier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const carrier = getCarrierName(order);
                  const isDelivered = order.order_status === 'delivered';
                  const isCancelled = order.order_status === 'cancelled';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order Number & Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-medium text-slate-900 block">
                          {order.order_number}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block truncate max-w-[200px]">
                          {order.items?.[0]?.variant?.title || 'Electronics Purchase'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{carrier}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                          {order.shipment?.tracking_number || 'Not dispatched'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                          {isCancelled && <XCircle className="w-3 h-3" />}
                          {!isDelivered && !isCancelled && <Clock className="w-3 h-3" />}
                          {order.order_status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        ₹{order.total_amount}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleReportIssue(order.order_number)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all shadow-subtle"
                        >
                          <span>Resolution</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
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
