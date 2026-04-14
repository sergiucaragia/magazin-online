import { createAdminClient } from './server';

const BUCKET = 'product-images';

/**
 * Carica un'immagine prodotto su Supabase Storage.
 * Restituisce la URL pubblica dell'immagine.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const supabase = createAdminClient();

  const ext = file.name.split('.').pop();
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Upload fallito: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Elimina un'immagine prodotto da Supabase Storage dato il suo path.
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  const supabase = createAdminClient();

  // Estrai il path relativo dalla URL pubblica
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(`/${BUCKET}/`);
  if (pathParts.length < 2) return;

  const path = pathParts[1];
  await supabase.storage.from(BUCKET).remove([path]);
}
