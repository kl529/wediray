import { supabase } from './supabase';

export type Attendance = 'attending' | 'absent' | 'pending';

export type Wedding = {
  id: string;
  user_id: string;
  groom: string;
  bride: string;
  date: string;
  venue: string;
  attendance: Attendance;
  created_at: string;
};

export type Memory = {
  id: string;
  wedding_id: string;
  user_id: string;
  memo: string | null;
  emotion_tags: string[];
  gift_amount: number | null;
  created_at: string;
};

export type Photo = {
  id: string;
  wedding_id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
};

// ── Weddings ──────────────────────────────────────────────

export async function getWeddings() {
  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data as Wedding[];
}

export async function getWedding(id: string) {
  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Wedding;
}

export async function createWedding(
  input: Pick<Wedding, 'groom' | 'bride' | 'date' | 'venue' | 'attendance'>
) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('weddings')
    .insert({ ...input, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data as Wedding;
}

export async function updateWedding(
  id: string,
  input: Partial<Pick<Wedding, 'groom' | 'bride' | 'date' | 'venue' | 'attendance'>>
) {
  const { data, error } = await supabase
    .from('weddings')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Wedding;
}

export async function deleteWedding(id: string) {
  const { error } = await supabase.from('weddings').delete().eq('id', id);
  if (error) throw error;
}

// ── Memory ───────────────────────────────────────────────

export async function getMemory(weddingId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('wedding_id', weddingId)
    .maybeSingle();
  if (error) throw error;
  return data as Memory | null;
}

export async function upsertMemory(
  weddingId: string,
  input: { memo?: string; emotion_tags?: string[]; gift_amount?: number | null }
) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('memories')
    .upsert(
      { ...input, wedding_id: weddingId, user_id: user!.id },
      { onConflict: 'wedding_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as Memory;
}

// ── Photos ───────────────────────────────────────────────

export async function getPhotos(weddingId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Photo[];
}

export async function uploadPhoto(weddingId: string, uri: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const filename = `${user!.id}/${weddingId}/${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('wedding-photos')
    .upload(filename, arrayBuffer, { contentType });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('photos')
    .insert({ wedding_id: weddingId, user_id: user!.id, storage_path: filename })
    .select()
    .single();
  if (error) throw error;
  return data as Photo;
}

export async function deletePhoto(id: string, storagePath: string) {
  const { error: storageError } = await supabase.storage.from('wedding-photos').remove([storagePath]);
  if (storageError) throw storageError;
  const { error } = await supabase.from('photos').delete().eq('id', id);
  if (error) throw error;
}

export async function getPhotoUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('wedding-photos')
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// ── Helpers ──────────────────────────────────────────────

export function formatDateKR(date: string) {
  const [y, m, d] = date.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function isUpcoming(wedding: Wedding) {
  return wedding.date >= new Date().toISOString().slice(0, 10);
}
