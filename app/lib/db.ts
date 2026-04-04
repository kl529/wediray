import { supabase } from './supabase';

export type Attendance = 'attending' | 'absent' | 'pending';

export type Wedding = {
  id: string;
  user_id: string;
  groom: string;
  bride: string;
  date: string;
  time: string | null;
  venue: string;
  attendance: Attendance;
  invite_url: string | null;
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('user_id', user.id)
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
  input: Pick<Wedding, 'groom' | 'bride' | 'date' | 'time' | 'venue' | 'attendance' | 'invite_url'>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { data, error } = await supabase
    .from('weddings')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Wedding;
}

export async function updateWedding(
  id: string,
  input: Partial<Pick<Wedding, 'groom' | 'bride' | 'date' | 'time' | 'venue' | 'attendance' | 'invite_url'>>
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

export async function deleteWeddingPhotos(weddingId: string) {
  const photos = await getPhotos(weddingId);
  if (photos.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('wedding-photos')
      .remove(photos.map((p) => p.storage_path));
    if (storageError) throw storageError;
  }
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('wedding_id', weddingId);
  if (dbError) throw dbError;
}

export async function deleteWedding(id: string) {
  await supabase.from('memories').delete().eq('wedding_id', id);
  await deleteWeddingPhotos(id);
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
  if (!user) throw new Error('로그인이 필요합니다.');
  const { data, error } = await supabase
    .from('memories')
    .upsert(
      { ...input, wedding_id: weddingId, user_id: user.id },
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

export async function uploadPhoto(weddingId: string, uri: string, mimeType?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const contentType = mimeType ?? (ext === 'png' ? 'image/png' : 'image/jpeg');
  const filename = `${user.id}/${weddingId}/${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('wedding-photos')
    .upload(filename, arrayBuffer, { contentType });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('photos')
    .insert({ wedding_id: weddingId, user_id: user.id, storage_path: filename })
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

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDateKR(date: string) {
  const [y, m, d] = date.split('-');
  const dayIndex = new Date(`${y}-${m}-${d}T00:00:00`).getDay();
  return `${y}년 ${Number(m)}월 ${Number(d)}일 (${DAY_NAMES[dayIndex]})`;
}

export function formatTimeKR(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h % 12 || 12;
  return `${ampm} ${hour}:${String(m).padStart(2, '0')}`;
}

export function isUpcoming(wedding: Wedding) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return wedding.date >= todayStr;
}
