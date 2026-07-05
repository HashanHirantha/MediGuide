import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { globalStyles } from '../../constants/globalStyles';
import { colors, radius, spacing } from '../../constants/theme';
import { articleService, Article } from '../../services/articleService';
import { useAuth } from '../../hooks/useAuth';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        if (!id || typeof id !== 'string') return;
        
        const data = await articleService.getArticleById(id);
        setArticle(data);

        if (profile?.id) {
          const bookmarked = await articleService.isBookmarked(profile.id, id);
          setIsBookmarked(bookmarked);
        }
      } catch (error) {
        console.error('Failed to fetch article details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id, profile?.id]);

  const handleToggleBookmark = async () => {
    if (!profile?.id || !article) return;
    
    setBookmarking(true);
    try {
      const newStatus = await articleService.toggleBookmark(profile.id, article.id);
      setIsBookmarked(newStatus);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={colors.buttonDark} />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, styles.center]}>
        <Text style={styles.errorText}>Article not found.</Text>
        <TouchableOpacity style={globalStyles.resetButton} onPress={() => router.back()}>
          <Text style={globalStyles.resetButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Absolute Back Button */}
      <View style={styles.absoluteHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleToggleBookmark}
          disabled={bookmarking}
        >
          <MaterialCommunityIcons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? colors.primary : colors.black} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        {article.image_url ? (
          <Image source={{ uri: article.image_url }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: colors.subtleBorder }]} />
        )}

        {/* Content Container */}
        <View style={styles.contentContainer}>
          <View style={styles.tagRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
            <Text style={styles.readTime}>
              <Feather name="clock" size={12} color={colors.textTertiary} /> {article.read_time_minutes} min read
            </Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>
          
          {/* Simple Markdown/Text Rendering */}
          <View style={styles.body}>
            {article.content.split('\n\n').map((paragraph, index) => {
              // Very basic markdown parsing for headings (###)
              if (paragraph.startsWith('### ')) {
                return (
                  <Text key={index} style={styles.heading3}>
                    {paragraph.replace('### ', '')}
                  </Text>
                );
              }
              // For bullet points
              if (paragraph.startsWith('- ')) {
                const points = paragraph.split('\n');
                return (
                  <View key={index} style={styles.bulletList}>
                    {points.map((point, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{point.replace('- ', '')}</Text>
                      </View>
                    ))}
                  </View>
                );
              }
              
              // Standard paragraph
              return (
                <Text key={index} style={styles.paragraph}>
                  {paragraph}
                </Text>
              );
            })}
          </View>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {article.tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  absoluteHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassWhiteBright,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassWhiteBright,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  coverImage: {
    width: '100%',
    height: 350,
  },
  contentContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: colors.authCardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  readTime: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 20,
    lineHeight: 34,
  },
  body: {
    marginTop: 10,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 20,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginTop: 10,
    marginBottom: 15,
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 20,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 10,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
    gap: 10,
  },
  tagChip: {
    backgroundColor: colors.glassWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagChipText: {
    fontSize: 14,
    color: colors.textTertiary,
  }
});
