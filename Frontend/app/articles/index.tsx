import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { globalStyles } from '../../constants/globalStyles';
import { colors, radius, spacing } from '../../constants/theme';
import i18n from '../../i18n';
import { articleService, Article } from '../../services/articleService';
import { useAuth } from '../../hooks/useAuth';

const CATEGORIES = ['All', 'Seasonal', 'Preventive Care', 'Lifestyle'];

export default function ArticlesScreen() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'bookmarks'>('discover');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      if (activeTab === 'discover') {
        const data = await articleService.fetchArticles(
          activeCategory === 'All' ? null : activeCategory,
          searchQuery
        );
        setArticles(data);
      } else if (profile?.id) {
        const data = await articleService.getBookmarkedArticles(profile.id);
        // If there's a search query, filter bookmarks locally
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          setBookmarkedArticles(data.filter(a => a.title.toLowerCase().includes(lowerQuery)));
        } else {
          setBookmarkedArticles(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, activeCategory, searchQuery, profile?.id]);

  useEffect(() => {
    setLoading(true);
    fetchArticles();
  }, [fetchArticles]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArticles();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchArticles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  const currentList = activeTab === 'discover' ? articles : bookmarkedArticles;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('articles.title') || 'Health Articles'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs (Discover / Bookmarks) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]} 
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            {i18n.t('articles.discover') || 'Discover'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]} 
          onPress={() => setActiveTab('bookmarks')}
        >
          <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.activeTabText]}>
            {i18n.t('articles.bookmarks') || 'Bookmarks'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={globalStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.buttonDark} />
        }
      >
        <View style={globalStyles.content}>
          {/* Search */}
          <View style={globalStyles.searchContainer}>
            <Feather name="search" size={20} color={colors.iconLight} style={globalStyles.searchIcon} />
            <TextInput
              style={globalStyles.searchInput}
              placeholder={i18n.t('articles.search_placeholder') || 'Search articles...'}
              placeholderTextColor={colors.iconLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={20} color={colors.iconLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories (Only for Discover) */}
          {activeTab === 'discover' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    globalStyles.filterChip,
                    activeCategory === category ? globalStyles.filterChipActive : globalStyles.filterChipInactive,
                  ]}
                  onPress={() => setActiveCategory(category)}
                >
                  <Text
                    style={[
                      globalStyles.filterText,
                      activeCategory === category ? globalStyles.filterTextActive : globalStyles.filterTextInactive,
                    ]}
                  >
                    {category === 'All' ? (i18n.t('articles.all') || 'All') : 
                     category === 'Seasonal' ? (i18n.t('articles.seasonal') || 'Seasonal') : 
                     category === 'Preventive Care' ? (i18n.t('articles.preventive') || 'Preventive Care') : 
                     (i18n.t('articles.lifestyle') || 'Lifestyle')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.buttonDark} style={{ marginTop: 40 }} />
          ) : currentList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color={colors.subtleBorderMed} />
              <Text style={styles.emptyText}>
                {activeTab === 'discover' 
                  ? (i18n.t('articles.no_articles') || 'No articles found.') 
                  : (i18n.t('articles.no_bookmarks') || 'You haven\'t bookmarked any articles yet.')}
              </Text>
            </View>
          ) : (
            currentList.map(article => (
              <TouchableOpacity 
                key={article.id} 
                style={styles.articleCard}
                onPress={() => router.push(`/articles/${article.id}` as any)}
                activeOpacity={0.8}
              >
                {article.image_url ? (
                  <Image source={{ uri: article.image_url }} style={styles.articleImage} />
                ) : (
                  <View style={[styles.articleImage, { backgroundColor: colors.subtleBorder }]} />
                )}
                
                <View style={styles.articleContent}>
                  <View style={styles.tagRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{article.category}</Text>
                    </View>
                    <Text style={styles.readTime}>
                      <Feather name="clock" size={12} color={colors.textTertiary} /> {article.read_time_minutes} {i18n.t('articles.min_read') || 'min read'}
                    </Text>
                  </View>
                  
                  <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.buttonDark,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  activeTabText: {
    color: colors.buttonDark,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  articleCard: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  articleImage: {
    width: '100%',
    height: 160,
  },
  articleContent: {
    padding: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.glassWhite,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  readTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 6,
    lineHeight: 24,
  },
  articleSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
