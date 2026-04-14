'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useT } from '@/lib/i18n/useT';
import type { CheckoutFormData } from '@/types';

export function CheckoutClient() {
  const { t } = useT();
  const { items, totalPrice, clearCart } = useCartStore();
  const [form, setForm] = useState<CheckoutFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">{t.cartIsEmpty}</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">{t.backToCatalogLink}</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">{t.orderSent}</h1>
        <p className="text-gray-500 mt-2">{t.thankYou}</p>
        <Link href="/" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          {t.backToCatalogLink}
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) throw new Error(t.stockError);
        throw new Error(data.message ?? t.orderError);
      }
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? t.genericError);
    } finally {
      setLoading(false);
    }
  };

  const total = totalPrice();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t.continueShopping}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.orderSummary}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t.yourData}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
            <input name="customer_name" type="text" required value={form.customer_name} onChange={handleChange} placeholder={t.namePlaceholder} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
            <input name="customer_email" type="email" required value={form.customer_email} onChange={handleChange} placeholder={t.emailPlaceholder} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
            <input name="customer_phone" type="tel" required value={form.customer_phone} onChange={handleChange} placeholder={t.phonePlaceholder} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.shippingAddress}</label>
            <textarea name="shipping_address" required value={form.shipping_address} onChange={handleChange} placeholder={t.addressPlaceholder} rows={3} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.sending}</> : `${t.sendOrder} — €${total.toFixed(2)}`}
          </button>

          <p className="text-xs text-center text-gray-400">{t.noPayment}</p>
        </form>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.selectedProducts}</h2>
          <ul className="divide-y border rounded-xl overflow-hidden">
            {items.map((item) => (
              <li key={`${item.product.id}-${item.selected_size}-${item.selected_color}`} className="flex gap-3 p-4 bg-white">
                {item.product.image_url && (
                  <img src={item.product.image_url} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[item.selected_size, item.selected_color].filter(Boolean).join(' · ')} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">€{(item.product.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-base mt-4 px-1">
            <span>{t.total}</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
