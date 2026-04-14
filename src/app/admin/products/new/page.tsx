import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import { T } from '@/components/T';
import type { Category } from '@/types';

export const metadata = { title: 'Produs nou — Admin' };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6"><T k="newProductTitle" /></h1>
      <ProductForm categories={(categories as Category[]) ?? []} />
    </div>
  );
}
