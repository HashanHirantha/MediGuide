import { supabase } from '../lib/supabase';

/**
 * Resolves an article's image URL.
 * 
 * Priority order:
 *   1. Full HTTP/HTTPS URL (e.g., Unsplash)
 *   2. Supabase Storage path
 *   3. Deterministic medical fallback based on category or ID
 */
export function getArticleImageUrl(article: {
  id?: string;
  image_url?: string | null;
  category?: string;
} | null | undefined): string {
  // Safe default fallback
  const fallbackUrl = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80';

  if (!article) return fallbackUrl;

  if (article.image_url) {
    // If it's already a full URL, return it
    if (article.image_url.startsWith('http://') || article.image_url.startsWith('https://')) {
      return article.image_url;
    }
    
    // Otherwise, assume it's a Supabase storage path in the 'patients' bucket (or whatever bucket you use)
    const { data } = supabase.storage.from('patients').getPublicUrl(article.image_url);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }

  // Fallbacks based on category if image_url is null or empty
  const category = (article.category || '').toLowerCase();
  
  if (category.includes('seasonal') || category.includes('flu')) {
    return 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=600&q=80';
  }
  if (category.includes('preventive')) {
    return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80';
  }
  if (category.includes('lifestyle') || category.includes('diet')) {
    return 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80';
  }

  return fallbackUrl;
}
