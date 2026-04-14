'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/lib/i18n/useT';
import type { Order } from '@/types';

type Props = { orders: Order[] };

export function OrdersTable({ orders }: Props) {
  const router = useRouter();
  const { t } = useT();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleStatus = async (order: Order) => {
    setUpdatingId(order.id);
    const newStatus = order.status === 'pending' ? 'completed' : 'pending';
    const supabase = createClient();
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    router.refresh();
    setUpdatingId(null);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
        {t.noOrders}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        return (
          <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{order.customer_name}</p>
                  <span className="text-xs text-gray-400 font-mono">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {order.customer_email} · {order.customer_phone}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleString('ro-RO')}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="font-semibold text-gray-900">€{order.total_amount.toFixed(2)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStatus(order); }}
                  disabled={updatingId === order.id}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-60 ${
                    order.status === 'pending'
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {order.status === 'pending' ? t.pending : t.completed}
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t bg-gray-50 px-4 py-4 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                    {t.shippingAddressLabel}
                  </p>
                  <p className="text-sm text-gray-700">{order.shipping_address}</p>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      {t.orderedProducts}
                    </p>
                    <ul className="space-y-1.5">
                      {order.order_items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between text-sm bg-white rounded-lg px-3 py-2 border"
                        >
                          <span className="text-gray-700">
                            {item.product_name}
                            {item.selected_size ? ` · ${item.selected_size}` : ''}
                            {item.selected_color ? ` · ${item.selected_color}` : ''}
                            {' '}<span className="text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="font-medium">
                            €{(item.product_price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
