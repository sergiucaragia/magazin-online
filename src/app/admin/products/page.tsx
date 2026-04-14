import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { T } from '@/components/T';
import type { Product } from '@/types';

export const metadata = { title: 'Produse — Admin' };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(id,name,slug)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900"><T k="products" /></h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <T k="newProduct" />
        </Link>
      </div>
      <ProductsTable products={(products as Product[]) ?? []} />
    </div>
  );
}
