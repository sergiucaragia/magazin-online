import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import { T } from '@/components/T';
import type { Category, Product } from '@/types';

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: 'Editează produsul — Admin' };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6"><T k="editProductTitle" /></h1>
      <ProductForm product={product as Product} categories={(categories as Category[]) ?? []} />
    </div>
  );
}
