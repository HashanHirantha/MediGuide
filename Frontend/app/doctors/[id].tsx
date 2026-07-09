import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { submitReview } from '../../services/doctorService';
import { useAuth } from '../../hooks/useAuth';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { getDoctorImageUrl } from '../../utils/getDoctorImageUrl';

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
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    const [docRes, revRes, apptRes] = await Promise.all([
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
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('doctor_id', id)
    ]);
    const mockDoc = MOCK_DOCTORS_DETAIL[id];
    setDoctor(docRes.data || mockDoc || MOCK_DOCTORS_DETAIL['1']);
    
    // Only use mock reviews if data is completely null (query failed) and there's mock data available
    setReviews(revRes.data ?? MOCK_REVIEWS);
    setPatientCount(apptRes.count ?? (mockDoc?.total_reviews ?? 0));
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to leave a review.');
      return;
    }
    
    setSubmittingReview(true);
    const { error } = await submitReview({
      patient_id: user.id,
      doctor_id: id,
      rating,
      comment: comment.trim(),
      is_anonymous: isAnonymous,
    });
    
    setSubmittingReview(false);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Thank you for your review!');
      setReviewModalVisible(false);
      setComment('');
      setRating(5);
      setIsAnonymous(false);
      fetchDoctor(); // Refresh stats and reviews
    }
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
            source={{ uri: getDoctorImageUrl(doc) }}
            style={globalStyles.doctorImage}
          />
          <View style={globalStyles.profileInfo}>
            <Text style={globalStyles.profileName}>{name}</Text>
            <View style={globalStyles.specialtyBadge}>
              <Text style={globalStyles.specialtyText}>{(doc.specialty || 'General Practitioner').toUpperCase()}</Text>
            </View>
            <View style={globalStyles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.starColor} />
              <Text style={globalStyles.ratingTextLarge}>{(doc.average_rating ?? 0).toFixed(1)}</Text>
              <Text style={globalStyles.reviewCount}>({doc.total_reviews ?? 0} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={[globalStyles.statsRow, { gap: 12, marginBottom: 20 }]}>
          <View style={globalStyles.statBoxCentered}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.iconDark} />
            <Text style={[globalStyles.statValue, { fontSize: 20, fontWeight: '700' }]}>{doc.experience_years ?? 0}+</Text>
            <Text style={[globalStyles.statLabel, { fontWeight: '600' }]}>Years Exp.</Text>
          </View>
          <View style={globalStyles.statBoxCentered}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.iconDark} />
            <Text style={[globalStyles.statValue, { fontSize: 20, fontWeight: '700' }]}>{patientCount}</Text>
            <Text style={[globalStyles.statLabel, { fontWeight: '600' }]}>Patients</Text>
          </View>
          <View style={globalStyles.statBoxCentered}>
            <MaterialCommunityIcons name="star-outline" size={20} color={colors.iconDark} />
            <Text style={[globalStyles.statValue, { fontSize: 20, fontWeight: '700' }]}>{(doc.average_rating ?? 0).toFixed(1)}</Text>
            <Text style={[globalStyles.statLabel, { fontWeight: '600' }]}>Rating</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>ABOUT</Text>
          <Text style={globalStyles.aboutText}>
            {doc.bio || `${name} is a highly experienced ${doc.specialty || 'General Practitioner'} dedicated to providing exceptional patient care.`}
          </Text>
        </View>

        {/* Details Section */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>DETAILS</Text>
          {[
            { icon: 'briefcase', label: 'Qualification', value: doc.qualification || 'MBBS' },
            { icon: 'map-pin', label: 'Hospital', value: doc.hospital_name || 'Not specified' },
            { icon: 'dollar-sign', label: 'Consultation Fee', value: `LKR ${doc.consultation_fee ?? 0}` },
            { icon: 'calendar', label: 'Available Days', value: doc.available_days || 'Not specified' },
            { icon: 'clock', label: 'Working Hours', value: doc.available_from && doc.available_to ? `${doc.available_from} – ${doc.available_to}` : 'Not specified' },
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
          <View style={[globalStyles.reviewsHeader, { marginBottom: 15 }]}>
            <Text style={globalStyles.sectionTitle}>REVIEWS</Text>
            <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
              <Text style={[globalStyles.seeAll, { color: colors.primary }]}>Write a Review</Text>
            </TouchableOpacity>
          </View>
          {reviews.length === 0 && <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: 10 }}>No reviews yet.</Text>}
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
            <Text style={globalStyles.feeValue}>LKR {doc.consultation_fee ?? 0}</Text>
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

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rate Doctor</Text>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color={colors.starColor}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience (optional)..."
                placeholderTextColor={colors.textTertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity 
                style={styles.anonymousRow} 
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <MaterialCommunityIcons 
                  name={isAnonymous ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.anonymousText}>Post anonymously</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setReviewModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color={colors.surface} />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  anonymousText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});
