import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

const BUCKET = 'product-images';
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  // Verifica che l'utente sia autenticato come admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: 'Non autorizzato.' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const productId = formData.get('productId') as string | null;

  if (!file) {
    return NextResponse.json({ message: 'Nessun file ricevuto.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ message: 'Formato non supportato. Usa JPG, PNG, WEBP o GIF.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ message: `Il file supera il limite di ${MAX_SIZE_MB}MB.` }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const folder = productId ?? 'tmp';
  const path = `${folder}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Admin client bypassa RLS — funziona indipendentemente dalle policy del bucket
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    console.error('Storage upload error:', error);
    return NextResponse.json({ message: `Upload fallito: ${error.message}` }, { status: 500 });
  }

  const { data: urlData } = adminSupabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
}
