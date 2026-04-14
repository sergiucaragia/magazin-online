'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/lib/i18n/useT';
import type { Category, Product } from '@/types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const GENDER_DB_VALUES = ['Uomo', 'Donna', 'Unisex'] as const;

type ImageEntry = {
  // URL già caricato (prodotto esistente) oppure null se nuovo
  url: string | null;
  // File locale da caricare (nuovo upload)
  file: File | null;
  // Preview locale (objectURL o URL remoto)
  preview: string;
};

type Props = {
  product?: Product;
  categories: Category[];
};

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const { t, tGender } = useT();
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    gender: product?.gender ?? 'Unisex',
    stock: product?.stock?.toString() ?? '0',
    is_active: product?.is_active ?? true,
    sizes: product?.sizes ?? [],
    colors: product?.colors ?? [],
  });

  // Inizializza le immagini esistenti
  const [images, setImages] = useState<ImageEntry[]>(() => {
    const existing = product?.images ?? [];
    if (existing.length > 0) {
      return existing.map((url) => ({ url, file: null, preview: url }));
    }
    // Compatibilità: se c'è solo image_url (vecchio schema)
    if (product?.image_url) {
      return [{ url: product.image_url, file: null, preview: product.image_url }];
    }
    return [];
  });

  const [colorInput, setColorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Gestione form ──────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addColor = () => {
    const color = colorInput.trim();
    if (color && !form.colors.includes(color)) {
      setForm((prev) => ({ ...prev, colors: [...prev.colors, color] }));
    }
    setColorInput('');
  };

  const removeColor = (color: string) => {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }));
  };

  // ── Gestione immagini ──────────────────────────────────────────────────────────

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newEntries: ImageEntry[] = files.map((file) => ({
      url: null,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newEntries]);
    // Reset input per permettere di selezionare gli stessi file di nuovo
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const entry = prev[index];
      // Libera memoria objectURL
      if (entry.file) URL.revokeObjectURL(entry.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Sposta un'immagine in posizione 0 (cover)
  const setCover = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  // Carica una singola immagine via API route e restituisce la URL
  const uploadImage = async (entry: ImageEntry, productId: string): Promise<string> => {
    if (!entry.file) return entry.url!; // già caricata, restituisci URL esistente

    const formData = new FormData();
    formData.append('file', entry.file);
    formData.append('productId', productId);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? 'Upload fallito.');
    return json.url as string;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const productId = product?.id ?? crypto.randomUUID();

      // Carica tutte le immagini nuove in parallelo
      const uploadedUrls = await Promise.all(
        images.map((entry) => uploadImage(entry, productId))
      );

      // Prima immagine = cover
      const image_url = uploadedUrls[0] ?? null;

      const slug = form.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const payload = {
        name: form.name,
        slug,
        description: form.description || null,
        price: parseFloat(form.price),
        category_id: form.category_id || null,
        gender: form.gender,
        stock: parseInt(form.stock),
        is_active: form.is_active,
        sizes: form.sizes,
        colors: form.colors,
        images: uploadedUrls,
        image_url,
      };

      if (isEdit) {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert({ ...payload, id: productId });
        if (insertError) throw new Error(insertError.message);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? t.genericError);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {t.productImages}
          </label>
          <span className="text-xs text-gray-400">
            {t.imageCoverHint}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {images.map((entry, index) => (
            <div key={index} className="relative group w-24 h-24 flex-shrink-0">
              <img
                src={entry.preview}
                alt={`${t.imageAlt} ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-xl border-2 transition-all ${
                  index === 0 ? 'border-black' : 'border-transparent'
                }`}
              />

              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  COVER
                </span>
              )}

              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    title={t.setCoverTitle}
                    className="bg-white rounded-full p-1 hover:bg-yellow-50"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  title={t.removeImageTitle}
                  className="bg-white rounded-full p-1 hover:bg-red-50"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">{t.addImage}</span>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />

        {images.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">{t.noImagesAdded}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.productName}</label>
        <input
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          placeholder={t.productNamePlaceholder}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
          placeholder={t.descriptionPlaceholder}
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.priceLabel}</label>
          <input
            name="price"
            type="number"
            required
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="29.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockLabel}</label>
          <input
            name="stock"
            type="number"
            required
            min="0"
            value={form.stock}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      {/* Category & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.categoryLabel}</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="">{t.noCategory}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.genderLabel}</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {GENDER_DB_VALUES.map((dbVal) => (
              <option key={dbVal} value={dbVal}>{tGender(dbVal)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.availableSizes}</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                form.sizes.includes(size)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.availableColors}</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
            placeholder={t.colorPlaceholder}
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="button"
            onClick={addColor}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {t.addColor}
          </button>
        </div>
        {form.colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.colors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full"
              >
                {color}
                <button type="button" onClick={() => removeColor(color)}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
          className="w-4 h-4 rounded accent-black"
        />
        <span className="text-sm font-medium text-gray-700">{t.visibleInCatalog}</span>
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.saving}</>
            : isEdit ? t.saveChanges : t.createProduct}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
