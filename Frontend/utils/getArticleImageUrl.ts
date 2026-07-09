import { supabase } from '../lib/supabase';

// Simple hash function for consistent seeds
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const HEALTH_IMAGES = [
  'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=600', // Stethoscope
  'https://images.pexels.com/photos/53404/apple-diet-food-health-53404.jpeg?auto=compress&cs=tinysrgb&w=600', // Apple diet
  'https://images.pexels.com/photos/3683053/pexels-photo-3683053.jpeg?auto=compress&cs=tinysrgb&w=600', // Pills
  'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600', // Doctor
  'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=600', // Hospital
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600' // Healthy food
];

/**
 * Resolves an article's image URL.
 */
export function getArticleImageUrl(article: {
  id?: string;
  image_url?: string | null;
  category?: string;
  title?: string;
} | null | undefined): string {
  // Consistent fallback based on article ID or title using our health images array
  const seed = article?.id || article?.title || article?.category || 'medical';
  const hash = hashString(seed);
  const index = hash % HEALTH_IMAGES.length;
  const fallbackUrl = HEALTH_IMAGES[index];

  if (!article) return fallbackUrl;

  if (article.image_url) {
    if (article.image_url.startsWith('http://') || article.image_url.startsWith('https://')) {
      // Unsplash aggressively blocks React Native. Swap them out.
      if (article.image_url.includes('unsplash.com')) {
        return fallbackUrl;
      }
      return article.image_url;
    } else {
      // Supabase storage path
      const { data } = supabase.storage.from('patients').getPublicUrl(article.image_url);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  }

  return fallbackUrl;
}
