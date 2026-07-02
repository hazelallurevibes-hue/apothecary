import { supabase } from './supabaseClient';

export async function fetchVendorStory(vendorId) {
  const { data, error } = await supabase.from('vendors').select('story_slides, name').eq('id', vendorId).maybeSingle();
  if (error) throw new Error(error.message);
  const slides = Array.isArray(data?.story_slides) ? data.story_slides : [];
  return { slides: slides.slice(0, 3), name: data?.name };
}

export async function saveVendorStory(vendorId, slides) {
  const trimmed = (slides || []).slice(0, 3).map((s) => ({
    title: (s.title || '').slice(0, 80),
    body: (s.body || '').slice(0, 400),
    image_url: s.image_url || null,
  }));
  const { error } = await supabase.from('vendors').update({ story_slides: trimmed }).eq('id', vendorId);
  if (error) throw new Error(error.message);
  return trimmed;
}