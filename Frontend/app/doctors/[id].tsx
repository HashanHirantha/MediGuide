import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';

const MOCK_DOCTORS_DETAIL: Record<string, any> = {
  '1': {
    id: '1',
    profiles: { first_name: 'Sarah', last_name: 'Jenkins', profile_image: 'https://i.pravatar.cc/150?img=47' },
    average_rating: 4.9,
    total_reviews: 127,
    specialty: 'Cardiologist',
    experience_years: 15,
    qualification: 'MD, FACC',
    hospital_name: 'City Heart Institute',
    consultation_fee: 3500,
    bio: 'Dr. Sarah Jenkins is a board-certified cardiologist with over 15 years of experience in interventional and preventive cardiology. She specializes in heart failure management, arrhythmia treatment, and cardiac rehabilitation programs.',
    available_days: 'Mon, Wed, Fri',
    available_from: '09:00',
    available_to: '17:00',
  },
  '2': {
    id: '2',
    profiles: { first_name: 'Michael', last_name: 'Chen', profile_image: 'https://i.pravatar.cc/150?img=11' },
    average_rating: 4.8,
    total_reviews: 98,
    specialty: 'Neurologist',
    experience_years: 12,
    qualification: 'MD, PhD',
    hospital_name: 'NeuroCare Center',
    consultation_fee: 4000,
    bio: 'Dr. Michael Chen is a leading neurologist specializing in movement disorders and neurodegenerative diseases. He has extensive experience in treating Parkinson\'s disease and offers advanced therapeutic options.',
    available_days: 'Tue, Thu, Sat',
    available_from: '10:00',
    available_to: '18:00',
  },
  '3': {
    id: '3',
    profiles: { first_name: 'Emily', last_name: 'Davis', profile_image: 'https://i.pravatar.cc/150?img=32' },
    average_rating: 4.7,
    total_reviews: 215,
    specialty: 'General Medicine',
    experience_years: 8,
    qualification: 'MBBS, MD',
    hospital_name: 'Community Health Clinic',
    consultation_fee: 2500,
    bio: 'Dr. Emily Davis is a compassionate general physician focused on comprehensive adult medicine. She provides routine check-ups, chronic disease management, and preventive care for her patients.',
    available_days: 'Mon, Tue, Wed, Thu, Fri',
    available_from: '08:00',
    available_to: '16:00',
  }
};

const MOCK_REVIEWS = [
  { id: '1', rating: 5, comment: 'Excellent doctor! Very thorough and caring. Explained everything clearly.', is_anonymous: false, profiles: { first_name: 'Alex', last_name: 'Morgan' } },
  { id: '2', rating: 4, comment: 'Very professional and knowledgeable. Highly recommend.', is_anonymous: false, profiles: { first_name: 'Jordan', last_name: 'Lee' } },
];

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    const [docRes, revRes] = await Promise.all([
      supabase
        .from('doctors')
        .select('*, profiles(first_name, last_name, profile_image)')
        .eq('id', id)
        .single(),
      supabase
        .from('reviews')
        .select('*, profiles(first_name, last_name)')
        .eq('doctor_id', id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
    const mockDoc = MOCK_DOCTORS_DETAIL[id] || MOCK_DOCTORS_DETAIL['1'];
    setDoctor(docRes.data || mockDoc);
    setReviews(revRes.data?.length ? revRes.data : MOCK_REVIEWS);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  const mockDoc = MOCK_DOCTORS_DETAIL[id] || MOCK_DOCTORS_DETAIL['1'];
  const doc = doctor || mockDoc;
  const name = `Dr. ${doc.profiles?.first_name} ${doc.profiles?.last_name}`;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>

        {/* Doctor Profile Card */}
        <View style={globalStyles.profileCard}>
          <Image
            source={{ uri: doc.profiles?.profile_image || 'https://i.pravatar.cc/150?img=11' }}
            style={globalStyles.doctorImage}
          />
          <View style={globalStyles.profileInfo}>
            <Text style={globalStyles.profileName}>{name}</Text>
            <View style={globalStyles.specialtyBadge}>
              <Text style={globalStyles.specialtyText}>{doc.specialty?.toUpperCase() || 'CARDIOLOGIST'}</Text>
            </View>
            <View style={globalStyles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.starColor} />
              <Text style={globalStyles.ratingTextLarge}>{doc.average_rating?.toFixed(1) || '4.9'}</Text>
              <Text style={globalStyles.reviewCount}>({doc.total_reviews || 127} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={[globalStyles.statsRow, { gap: 12, marginBottom: 20 }]}>
          <View style={globalStyles.statBoxCentered}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.iconDark} />
            <Text style={[globalStyles.statValue, { fontSize: 20, fontWeight: '700' }]}>{doc.experience_years || 15}+</Text>
            <Text style={[globalStyles.statLabel, { fontWeight: '600' }]}>Years Exp.</Text>
          </View>
          <View style={globalStyles.statBoxCentered}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.iconDark} />
            <Text style={[globalStyles.statValue, { fontSize: 20, fontWeight: '700' }]}>{doc.total_reviews || 127}</Text>
            <Text style={[globalStyles.statLabel, { fontWeight: '600' }]}>Patients</Text>
          </View>
          <View style={globalStyles.statBoxCentered}>
            <MaterialCommunityIcons name="star-outline" size={20} color={colors.iconDark} />
            <Text style={[globalStyles.statValue, { fontSize: 20, fontWeight: '700' }]}>{doc.average_rating?.toFixed(1) || '4.9'}</Text>
            <Text style={[globalStyles.statLabel, { fontWeight: '600' }]}>Rating</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>ABOUT</Text>
          <Text style={globalStyles.aboutText}>
            {doc.bio || `${name} is a highly experienced ${doc.specialty} dedicated to providing exceptional patient care.`}
          </Text>
        </View>

        {/* Details Section */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>DETAILS</Text>
          {[
            { icon: 'briefcase', label: 'Qualification', value: doc.qualification || 'MD, FACC' },
            { icon: 'map-pin', label: 'Hospital', value: doc.hospital_name || 'City Heart Institute' },
            { icon: 'dollar-sign', label: 'Consultation Fee', value: `LKR ${doc.consultation_fee || 3500}` },
            { icon: 'calendar', label: 'Available Days', value: doc.available_days || 'Mon, Wed, Fri' },
            { icon: 'clock', label: 'Working Hours', value: doc.available_from && doc.available_to ? `${doc.available_from} – ${doc.available_to}` : '09:00 – 17:00' },
          ].map((item, idx, arr) => (
            <View key={item.label}>
              <View style={globalStyles.detailRow}>
                <View style={globalStyles.detailIconContainer}>
                  <Feather name={item.icon as any} size={16} color={colors.iconDark} />
                </View>
                <View style={globalStyles.detailTextContainer}>
                  <Text style={globalStyles.detailLabel}>{item.label}</Text>
                  <Text style={globalStyles.detailValue}>{item.value}</Text>
                </View>
              </View>
              {idx < arr.length - 1 && <View style={globalStyles.dividerIndented} />}
            </View>
          ))}
        </View>

        {/* Reviews Section */}
        <View style={globalStyles.cardPadded}>
          <View style={globalStyles.reviewsHeader}>
            <Text style={globalStyles.sectionTitle}>REVIEWS</Text>
            <Text style={globalStyles.seeAll}>See All</Text>
          </View>
          {reviews.map((r) => (
            <View key={r.id} style={globalStyles.reviewItem}>
              <View style={globalStyles.reviewTop}>
                <Text style={globalStyles.reviewAuthor}>
                  {r.is_anonymous ? 'Anonymous' : `${r.profiles?.first_name} ${r.profiles?.last_name}`}
                </Text>
                <View style={globalStyles.reviewRating}>
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Ionicons key={i} name="star" size={12} color={colors.starColor} />
                  ))}
                </View>
              </View>
              {r.comment && <Text style={globalStyles.reviewComment}>{r.comment}</Text>}
            </View>
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Book Now Button */}
      <View style={globalStyles.bottomBarContainer}>
        <View style={globalStyles.bottomBar}>
          <View>
            <Text style={globalStyles.feeLabel}>CONSULTATION FEE</Text>
            <Text style={globalStyles.feeValue}>LKR {doc.consultation_fee || 3500}</Text>
          </View>
          <TouchableOpacity
            style={globalStyles.buttonPrimary}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/doctors/book', params: { doctorId: id } })}
          >
            <Text style={globalStyles.buttonPrimaryText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
