import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { getRecommendedDoctors } from '../services/doctorService';
import { colors, spacing, radius, typography } from '../constants/theme';
import { globalStyles } from '../constants/globalStyles';

interface RecommendedDoctorsProps {
  specialties: string[];
}

const INITIAL_COUNT = 3;

export function RecommendedDoctors({ specialties }: RecommendedDoctorsProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    if (specialties && specialties.length > 0) {
      fetchDoctors();
    }
  }, [specialties.join(',')]);

  const fetchDoctors = async () => {
    setLoading(true);
    setVisibleCount(INITIAL_COUNT);
    const { data, error } = await getRecommendedDoctors(specialties);
    if (!error && data) {
      setDoctors(data);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + INITIAL_COUNT);
  };

  const visibleDoctors = doctors.slice(0, visibleCount);
  const hasMore = visibleCount < doctors.length;

  // ─── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TOP RATED DOCTORS</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.black} />
          <Text style={styles.loadingText}>Finding specialists...</Text>
        </View>
      </View>
    );
  }

  // ─── Empty State ────────────────────────────────────────────
  if (doctors.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TOP RATED DOCTORS</Text>
        <View style={styles.emptyContainer}>
          <Feather name="user-x" size={24} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            No {specialties.join(' / ')} specialists found at this time.
          </Text>
        </View>
      </View>
    );
  }

  // ─── Doctor List ────────────────────────────────────────────
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>TOP RATED DOCTORS</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: '/(tabs)/doctors', params: { specialty: specialties[0] } })
          }
        >
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        {doctors.length} specialist{doctors.length !== 1 ? 's' : ''} available in {specialties.join(', ')}
      </Text>

      {/* Doctor Cards */}
      {visibleDoctors.map((doc, index) => {
        const firstName = doc.profiles?.first_name ?? '';
        const lastName = doc.profiles?.last_name ?? '';
        const imageUri =
          doc.profiles?.profile_image ||
          `https://i.pravatar.cc/150?img=${(index + 30)}`;

        return (
          <TouchableOpacity
            key={doc.id}
            style={styles.doctorCard}
            onPress={() => router.push(`/doctors/${doc.id}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: imageUri }} style={styles.doctorImage} />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                Dr. {firstName} {lastName}
              </Text>
              <Text style={styles.doctorSpecialty}>
                {doc.specialty?.toUpperCase()}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={colors.starColor} />
                  <Text style={styles.ratingValue}>
                    {doc.average_rating?.toFixed(1) ?? '0.0'}
                  </Text>
                  <Text style={styles.reviewCount}>
                    ({doc.total_reviews ?? 0})
                  </Text>
                </View>
                {doc.experience_years > 0 && (
                  <Text style={styles.experience}>
                    {doc.experience_years}y exp
                  </Text>
                )}
              </View>
              {doc.hospital_name && (
                <View style={styles.hospitalRow}>
                  <Feather name="map-pin" size={11} color={colors.textSecondary} />
                  <Text style={styles.hospitalText} numberOfLines={1}>
                    {doc.hospital_name}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() =>
                router.push({
                  pathname: '/doctors/book',
                  params: { doctorId: doc.id },
                })
              }
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          activeOpacity={0.7}
        >
          <Feather name="chevron-down" size={16} color={colors.primary} />
          <Text style={styles.loadMoreText}>
            Load More ({doctors.length - visibleCount} remaining)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  // Doctor Card
  doctorCard: {
    backgroundColor: colors.authCardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  doctorImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  experience: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hospitalText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  bookButton: {
    backgroundColor: colors.buttonDark,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.surface,
  },
  // Load More
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    backgroundColor: colors.primary + '12',
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
