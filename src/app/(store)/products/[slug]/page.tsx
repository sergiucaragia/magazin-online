import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductDetail } from '@/components/store/ProductDetail';
import type { Product } from '@/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single();

  return {
    title: data ? `${data.name} — Il Mio Negozio` : 'Prodotto non trovato',
    description: data?.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id,name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) notFound();

  return <ProductDetail product={data as Product} />;
}
