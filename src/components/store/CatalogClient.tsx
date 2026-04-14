'use client';

import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts, fetchCategories } from '@/lib/queries/products';
import { useT } from '@/lib/i18n/useT';
import { ProductCard } from './ProductCard';
import type { Category } from '@/types';

// Valori DB (sempre italiani) → label tradotta dinamicamente
const GENDER_DB_VALUES = ['Uomo', 'Donna', 'Unisex'];

export function CatalogClient() {
  const { t, tGender } = useT();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', debouncedSearch, categoryId, gender],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts({ search: debouncedSearch, categoryId, gender, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((s, p) => s + p.products.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const hasActiveFilters = categoryId || gender;
  const clearFilters = () => { setCategoryId(''); setGender(''); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Căutare + filtre */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
            hasActiveFilters ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t.filters}
          {hasActiveFilters && (
            <span className="bg-white text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              {[categoryId, gender].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Panou filtre */}
      {filtersOpen && (
        <div className="bg-gray-50 border rounded-xl p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{t.filterBy}</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-gray-500 flex items-center gap-1 hover:text-black">
                <X className="w-3 h-3" /> {t.removeFilters}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                {t.category}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">{t.allCategories}</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                {t.gender}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">{t.allGenders}</option>
                {GENDER_DB_VALUES.map((dbVal) => (
                  <option key={dbVal} value={dbVal}>{tGender(dbVal)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Contor */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          {total} {total === 1 ? t.productFound : t.productsFound}
        </p>
      )}

      {/* Grilă */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">{t.noProductsFound}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasNextPage && (
            <div className="text-center mt-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? t.loading : t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
