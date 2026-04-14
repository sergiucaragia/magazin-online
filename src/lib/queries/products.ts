import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/types';

const PAGE_SIZE = 24;

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  gender?: string;
  page?: number;
};

/**
 * Recupera i prodotti con filtri e paginazione.
 */
export async function fetchProducts(filters: ProductFilters = {}): Promise<{
  products: Product[];
  total: number;
}> {
  const supabase = createClient();
  const { search, categoryId, gender, page = 1 } = filters;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('products')
    .select('*, category:categories(id,name,slug)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) query = query.ilike('name', `%${search}%`);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (gender) query = query.eq('gender', gender);

  const { data, error, count } = await query;
  if (error) throw error;

  return { products: (data as Product[]) ?? [], total: count ?? 0 };
}

/**
 * Recupera un singolo prodotto per slug.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id,name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data as Product;
}

/**
 * Recupera tutte le categorie.
 */
export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data as Category[]) ?? [];
}
