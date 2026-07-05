import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

export type Article = Database['public']['Tables']['articles']['Row'];
export type Bookmark = Database['public']['Tables']['user_article_bookmarks']['Row'];

export const articleService = {
  /**
   * Fetch articles with optional category and search query filters.
   */
  async fetchArticles(category?: string | null, searchQuery?: string) {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Article[];
  },

  /**
   * Get a single article by ID.
   */
  async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Article;
  },

  /**
   * Get all bookmarked articles for a user.
   */
  async getBookmarkedArticles(userId: string) {
    const { data, error } = await supabase
      .from('user_article_bookmarks')
      .select(`
        article_id,
        articles (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map to just return the articles array
    return data
      .map((b: any) => b.articles)
      .filter((a: any) => a != null) as Article[];
  },

  /**
   * Check if a specific article is bookmarked by the user.
   */
  async isBookmarked(userId: string, articleId: string) {
    const { data, error } = await supabase
      .from('user_article_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle();
      
    if (error) throw error;
    return !!data;
  },

  /**
   * Toggle bookmark for an article.
   * Returns true if bookmarked, false if unbookmarked.
   */
  async toggleBookmark(userId: string, articleId: string) {
    const isBookmarked = await this.isBookmarked(userId, articleId);
    
    if (isBookmarked) {
      // Unbookmark
      const { error } = await supabase
        .from('user_article_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId);
        
      if (error) throw error;
      return false;
    } else {
      // Bookmark
      const { error } = await supabase
        .from('user_article_bookmarks')
        .insert([{ user_id: userId, article_id: articleId }]);
        
      if (error) throw error;
      return true;
    }
  }
};
