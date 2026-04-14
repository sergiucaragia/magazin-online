'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, ImageOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/lib/i18n/useT';
import type { Product } from '@/types';

type Props = { products: Product[] };

export function ProductsTable({ products }: Props) {
  const router = useRouter();
  const { t, tGender } = useT();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t.confirmDelete} "${name}"?`)) return;
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    router.refresh();
    setDeletingId(null);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
        {t.noProducts}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">{t.product}</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">{t.category}</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t.sizesColors}</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">{t.price}</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">{t.status}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageOff className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">{tGender(product.gender)}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                {product.category?.name ?? '—'}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="text-xs text-gray-500 space-y-0.5">
                  {product.sizes.length > 0 && <p>{t.sizesLabel}: {product.sizes.join(', ')}</p>}
                  {product.colors.length > 0 && <p>{t.colorsLabel}: {product.colors.join(', ')}</p>}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium">€{product.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {product.is_active ? t.active : t.hidden}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={t.edit}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    aria-label={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
