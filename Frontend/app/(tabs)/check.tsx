import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import Body from 'react-native-body-highlighter';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import i18n from '../../i18n';
import {
  analyzeSymptoms,
  getRiskColor,
  getRiskBgColor,
  PredictionCondition,
  PredictionResponse,
} from '../../services/geminiService';
import { RecommendedDoctors } from '../../components/RecommendedDoctors';
import { searchSymptoms } from '../../services/symptomService';
import { saveAiCheckHistory, updateAiCheckFeedback } from '../../services/aiCheckHistoryService';
import { sendLocalNotification } from '../../services/notificationService';

// ─── Duration options ────────────────────────────────────────

const DURATION_OPTIONS = [
  'Less than a day',
  '1-2 days',
  '3-5 days',
  '1 week',
  '2+ weeks',
  '1+ month',
];

// ─── Default common symptom chips ────────────────────────────

const DEFAULT_SYMPTOMS = [
  'Headache',
  'Fever',
  'Fatigue',
  'Chest Tightness',
  'Cough',
  'Dizziness',
  'Nausea',
  'Body Aches',
  'Sore Throat',
  'Shortness of Breath',
];

// ─── Feather icon type helper ────────────────────────────────

const VALID_FEATHER_ICONS = [
  'activity', 'heart', 'thermometer', 'eye', 'wind',
  'zap', 'shield', 'alert-triangle', 'clipboard',
] as const;

function getFeatherIcon(name: string): string {
  if (VALID_FEATHER_ICONS.includes(name as any)) return name;
  return 'activity';
}

// ─── Body part to symptom mapping ─────────────────────────────

const MUSCLE_TO_SYMPTOMS: Record<string, string[]> = {
  head: ['Concussion Symptoms', 'Headache', 'Dizziness'],
  neck: ['Whiplash', 'Neck Spasm', 'Stiff Neck'],
  chest: ['Pectoral Strain', 'Rib Contusion', 'Shortness of Breath'],
  abs: ['Abdominal Strain', 'Core Pain', 'Nausea'],
  'upper-back': ['Upper Back Pain', 'Muscle Aches', 'Stiffness'],
  'lower-back': ['Lower Back Pain', 'Sciatica', 'Muscle Spasm'],
  deltoids: ['Shoulder Dislocation', 'Rotator Cuff Pain', 'Shoulder Strain'],
  trapezius: ['Trapezius Strain', 'Neck Stiffness', 'Upper Back Spasm'],
  biceps: ['Bicep Strain', 'Bicep Tendonitis', 'Muscle Cramps'],
  triceps: ['Triceps Strain', 'Elbow Pain', 'Triceps Tendonitis'],
  forearm: ['Forearm Splints', 'Tennis Elbow', 'Grip Weakness'],
  hands: ['Finger Sprain', 'Wrist Sprain', 'Hand Contusion'],
  quadriceps: ['Quad Strain', 'Thigh Contusion (Dead Leg)', 'Quad Tear'],
  hamstring: ['Hamstring Pull', 'Hamstring Tear', 'Leg Cramp'],
  adductors: ['Groin Strain', 'Inner Thigh Pain', 'Adductor Tear'],
  calves: ['Calf Strain', 'Calf Cramp', 'Achilles Tightness'],
  tibialis: ['Shin Splints', 'Anterior Tibialis Pain'],
  knees: ['ACL/MCL Sprain', 'Meniscus Tear', 'Patellar Tendonitis', 'Knee Joint Pain'],
  ankles: ['Ankle Sprain', 'Rolled Ankle', 'Ankle Instability'],
  feet: ['Plantar Fasciitis', 'Foot Fracture', 'Heel Pain'],
  gluteal: ['Glute Strain', 'Piriformis Syndrome', 'Hip Pointer'],
  obliques: ['Oblique Strain', 'Side Pain'],
};

// ─── Component ───────────────────────────────────────────────

export default function SymptomCheckerScreen() {
  const { user, profile } = useAuth();
  const { locale } = useLanguage();
  
  const modelGender = profile?.gender?.toLowerCase() === 'female' ? 'female' : 'male';

  // Symptom state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>(DEFAULT_SYMPTOMS);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [bodySide, setBodySide] = useState<'front' | 'back'>('front');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  // Duration state
  const [selectedDuration, setSelectedDuration] = useState('');

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // ─── Sync Muscles with Symptoms ─────────────────────────────
  
  // If the user manually removes symptom chips, un-highlight the body parts
  useEffect(() => {
    setSelectedMuscles(prevMuscles => 
      prevMuscles.filter(muscleSlug => {
        const mappedSymptoms = MUSCLE_TO_SYMPTOMS[muscleSlug] || [`${muscleSlug} pain`];
        return mappedSymptoms.some(sym => selectedSymptoms.includes(sym));
      })
    );
  }, [selectedSymptoms]);

  // Attachments
  const [attachments, setAttachments] = useState<{ uri: string; base64: string; mimeType: string }[]>([]);

  // Prediction state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  
  // Feedback state
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  
  // Voice recording state
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Notification preferences
  const [emergencyAlertsEnabled, setEmergencyAlertsEnabled] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      import('../../lib/supabase').then(({ supabase }) => {
        supabase.from('profiles').select('notify_emergency').eq('id', profile.id).single()
          .then(({ data }) => {
            if (data) setEmergencyAlertsEnabled(data.notify_emergency ?? true);
          });
      });
    }
  }, [profile?.id]);

  // ─── Step progress ──────────────────────────────────────────

  const getStep = () => {
    if (prediction) return { step: 4, label: 'RESULTS', desc: 'AI analysis complete', percent: 100 };
    if (selectedSymptoms.length > 0 && selectedDuration) return { step: 3, label: 'STEP 3 OF 4', desc: 'Ready to analyze', percent: 75 };
    if (selectedSymptoms.length > 0) return { step: 2, label: 'STEP 2 OF 4', desc: 'Set symptom duration', percent: 50 };
    return { step: 1, label: 'STEP 1 OF 4', desc: 'Select your symptoms', percent: 25 };
  };

  const stepInfo = getStep();

  // ─── Symptom search (debounced) ─────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await searchSymptoms(searchQuery);
        if (data) {
          setSearchResults(data.map((s: any) => s.name).filter((n: string) => !selectedSymptoms.includes(n)));
        }
      } catch (e) {
        console.log('[Check] Symptom search error:', e);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSymptoms]);

  // ─── Emergency Check ────────────────────────────────────────

  const EMERGENCY_KEYWORDS = [
    'chest pain',
    'difficulty breathing',
    'severe bleeding',
    'bleeding',
    'shortness of breath',
    'heart attack',
    'stroke',
    'choking',
    'unconscious',
    'snake',
    'bite',
    'fall',
    'falling',
    'faint',
    'passed out',
    'seizure',
    'head injury',
    'poison',
    'overdose',
    'suicide',
    'burn',
    'broken',
    'fracture',
    'paralysis',
    'vision loss',
    'sudden weakness',
    'crash',
    'accident',
  ];

  const checkEmergency = (symptom: string) => {
    const lower = symptom.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
    if (isEmergency) {
      Alert.alert(
        'EMERGENCY ALERT ⚠️',
        'You have entered a symptom that may require immediate medical attention.\n\nPlease call your local emergency services (e.g., 911 or 1990) or visit the nearest emergency room immediately.',
        [{ text: 'Understood', style: 'destructive' }]
      );
    }
  };

  // ─── Voice Recording ────────────────────────────────────────

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      } else {
        Alert.alert("Permission Required", "Please grant microphone permissions to use voice input.");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Error", "Could not start recording.");
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error("No recording URI");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
      
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase.functions.invoke('gemini-transcribe-symptoms', {
        body: {
          audioBase64: base64,
          mimeType: 'audio/m4a'
        }
      });
      
      if (error) {
        throw new Error(error.message || "Transcription failed");
      }

      const result = data;

      if (result.symptoms && result.symptoms.length > 0) {
        setSelectedSymptoms(prev => {
          const newSymptoms = [...prev];
          result.symptoms.forEach((s: string) => {
            if (!newSymptoms.includes(s)) newSymptoms.push(s);
          });
          return newSymptoms;
        });
        if (prediction) { setPrediction(null); setPredictionError(null); }
      } else {
         Alert.alert("Voice Input", "No medical symptoms could be extracted from your voice clip.");
      }
      
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to process voice input.");
    } finally {
      setRecording(undefined);
      setIsTranscribing(false);
    }
  }

  // ─── Toggle symptom ─────────────────────────────────────────

  const handleMusclePress = (muscle: any) => {
    const mappedSymptoms = MUSCLE_TO_SYMPTOMS[muscle.slug] || [`${muscle.slug} pain`];
    const isCurrentlySelected = selectedMuscles.includes(muscle.slug);
    
    if (isCurrentlySelected) {
      // Deselect muscle
      setSelectedMuscles(prev => prev.filter(m => m !== muscle.slug));
      
      // Remove its mapped symptoms from selectedSymptoms
      setSelectedSymptoms(prev => prev.filter(s => !mappedSymptoms.includes(s)));
      if (prediction) { setPrediction(null); setPredictionError(null); }
    } else {
      // Select muscle
      setSelectedMuscles(prev => [...prev, muscle.slug]);
      
      // Add mapped symptoms if they are not already selected
      const newSymptoms = [...selectedSymptoms];
      let addedAny = false;
      for (const sym of mappedSymptoms) {
        if (!newSymptoms.includes(sym)) {
          newSymptoms.push(sym);
          addedAny = true;
        }
      }
      
      if (addedAny) {
        setSelectedSymptoms(newSymptoms);
        if (prediction) { setPrediction(null); setPredictionError(null); }
      }
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        checkEmergency(symptom);
        return [...prev, symptom];
      }
    });
    // Reset prediction when symptoms change
    if (prediction) {
      setPrediction(null);
      setPredictionError(null);
      setHistoryId(null);
      setFeedbackSubmitted(false);
    }
  };

  // ─── Add custom symptom ─────────────────────────────────────

  const addCustomSymptom = () => {
    const trimmed = searchQuery.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      checkEmergency(trimmed);
      setSelectedSymptoms(prev => [...prev, trimmed]);
      setSearchQuery('');
      setSearchResults([]);
      if (prediction) {
        setPrediction(null);
        setPredictionError(null);
        setHistoryId(null);
        setFeedbackSubmitted(false);
      }
    }
  };

  // ─── Attachments ─────────────────────────────────────────────

  const handlePickImage = async () => {
    if (attachments.length >= 3) {
      Alert.alert('Limit Reached', 'You can only attach up to 3 reports/images.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      setAttachments(prev => [...prev, { uri: asset.uri, base64: asset.base64!, mimeType }]);
    }
  };

  const handlePickDocument = async () => {
    if (attachments.length >= 3) {
      Alert.alert('Limit Reached', 'You can only attach up to 3 reports/images.');
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' as any });
      const mimeType = asset.mimeType || 'application/pdf';
      setAttachments(prev => [...prev, { uri: asset.uri, base64, mimeType }]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Generate prediction ────────────────────────────────────

  const handleGenerate = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms', 'Please select at least one symptom before generating a prediction.');
      return;
    }
    if (!selectedDuration) {
      Alert.alert('Duration Required', 'Please select how long you\'ve been experiencing these symptoms.');
      return;
    }

    console.log('[Check] Generating prediction...');
    console.log('[Check] Symptoms:', selectedSymptoms);
    console.log('[Check] Duration:', selectedDuration);
    console.log('[Check] Profile:', profile?.first_name, profile?.gender, profile?.blood_group);

    setIsAnalyzing(true);
    setPredictionError(null);
    setPrediction(null);
    setHistoryId(null);
    setFeedbackSubmitted(false);

    const languageMap: Record<string, string> = { en: 'English', si: 'Sinhala', ta: 'Tamil' };
    const aiLanguage = languageMap[locale] || 'English';

    const { data, error } = await analyzeSymptoms(
      selectedSymptoms,
      selectedDuration,
      additionalNotes || undefined,
      attachments.length > 0 ? attachments.map(a => ({ base64: a.base64, mime_type: a.mimeType })) : undefined,
      aiLanguage,
      modelGender
    );

    setIsAnalyzing(false);

    if (error) {
      console.error('[Check] Prediction error:', error);
      setPredictionError(error);
      if (error === 'NOT_A_SYMPTOM') {
        Alert.alert('Invalid Input', 'Please input your medical symptoms to proceed.');
      } else {
        Alert.alert('Analysis Failed', error);
      }
      return;
    }

    if (data?.prediction) {
      console.log('[Check] Prediction received successfully');
      console.log('[Check] recommended_specialties:', data.prediction.recommended_specialties);
      console.log('[Check] recommended_specialist:', data.prediction.recommended_specialist);
      setPrediction(data.prediction);
      
      // ── Trigger local emergency alert if risk is High or Critical ──
      const riskLower = data.prediction.overall_risk?.toLowerCase() || '';
      if (emergencyAlertsEnabled && (riskLower.includes('high') || riskLower.includes('critical'))) {
        sendLocalNotification(
          '⚠️ High Risk Alert',
          'Your symptom analysis indicates a high-risk condition. Please seek medical attention immediately.',
          { type: 'emergency_alert' }
        ).catch(err => console.warn('Local notification error:', err));
      }

      // ── Save to history (silent — don't block UI on failure) ──
      if (user?.id) {
        saveAiCheckHistory(
          user.id,
          selectedSymptoms,
          selectedDuration,
          data.prediction,
          additionalNotes || undefined
        ).then(({ data: historyData, error }) => {
          if (error) console.warn('[Check] History save failed:', error);
          else {
            console.log('[Check] Saved to ai_check_history');
            if (historyData) setHistoryId(historyData.id);
          }
        });
      }
    }
  };

  // ─── Feedback ───────────────────────────────────────────────

  const handleFeedback = async (isAccurate: boolean) => {
    if (!historyId) return;
    setFeedbackSubmitted(true);
    const { error } = await updateAiCheckFeedback(historyId, isAccurate);
    if (error) {
      console.warn('Failed to save feedback:', error);
      Alert.alert('Error', 'Failed to save feedback');
      setFeedbackSubmitted(false);
    }
  };

  // ─── Reset ──────────────────────────────────────────────────

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSelectedDuration('');
    setAdditionalNotes('');
    setAttachments([]);
    setPrediction(null);
    setPredictionError(null);
    setSearchQuery('');
  };

  // ─── Derive specialties for doctor recommendations ───────────

  const getDoctorSpecialties = (pred: PredictionResponse): string[] => {
    if (Array.isArray(pred.recommended_specialties) && pred.recommended_specialties.length > 0) {
      return pred.recommended_specialties;
    }
    if (pred.recommended_specialist) {
      return [pred.recommended_specialist];
    }
    return ['General Medicine'];
  };

  // ─── Render ─────────────────────────────────────────────────

  const hasEmergencySymptom = selectedSymptoms.some(s => {
    const lower = s.toLowerCase();
    return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
  });

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>

        {/* Huge Title */}
        <Text style={globalStyles.mainTitle}>{i18n.t('check.title') || 'Symptom Checker'}</Text>
        <Text style={globalStyles.pageDescription}>
          {i18n.t('check.desc') || "Tell us how you're feeling. Our AI analyzes your inputs for potential patterns."}
        </Text>

        {/* Step Progress Card */}
        <View style={globalStyles.cardPadded}>
          <View style={globalStyles.stepContainer}>
            <View style={[globalStyles.progressCircle, stepInfo.percent === 100 && globalStyles.progressCircleDone]}>
              <Text style={[globalStyles.progressText, stepInfo.percent === 100 && globalStyles.progressTextDone]}>
                {stepInfo.percent}%
              </Text>
            </View>
            <View style={globalStyles.stepTextContainer}>
              <Text style={globalStyles.sectionLabel}>{stepInfo.label}</Text>
              <Text style={globalStyles.stepDescription}>{stepInfo.desc}</Text>
            </View>
          </View>
        </View>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <View style={globalStyles.cardPadded}>
            <Text style={globalStyles.sectionTitle}>YOUR SYMPTOMS ({selectedSymptoms.length})</Text>
            <View style={globalStyles.chipsContainer}>
              {selectedSymptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[globalStyles.chip, globalStyles.chipSelected]}
                  onPress={() => toggleSymptom(symptom)}
                  activeOpacity={0.7}
                >
                  <Text style={[globalStyles.chipText, globalStyles.chipTextSelected]}>{symptom}</Text>
                  <Feather name="x" size={14} color={colors.surface} style={globalStyles.chipIcon} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Add Symptom Card */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>{i18n.t('check.add_symptom') || 'ADD SYMPTOM'}</Text>
          <View style={globalStyles.searchInputContainer}>
            <Feather name="search" size={20} color={colors.iconLight} style={globalStyles.searchIcon} />
            <TextInput
              style={globalStyles.searchInput}
              placeholder="e.g., Shortness of breath"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={addCustomSymptom}
              returnKeyType="done"
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={addCustomSymptom} style={globalStyles.addButton}>
                <Feather name="plus" size={18} color={colors.surface} />
              </TouchableOpacity>
            )}
            {searchQuery.trim().length === 0 && (
              <TouchableOpacity 
                onPress={isRecording ? stopRecording : startRecording} 
                style={[
                  globalStyles.addButton, 
                  { backgroundColor: isRecording ? colors.accent : colors.black }
                ]}
              >
                {isTranscribing ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Feather name={isRecording ? "square" : "mic"} size={18} color={colors.surface} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Search results dropdown */}
          {isSearching && (
            <View style={globalStyles.searchLoading}>
              <ActivityIndicator size="small" color={colors.black} />
              <Text style={globalStyles.searchLoadingText}>Searching...</Text>
            </View>
          )}
          {searchResults.length > 0 && (
            <View style={globalStyles.searchResultsContainer}>
              {searchResults.slice(0, 5).map((result) => (
                <TouchableOpacity
                  key={result}
                  style={globalStyles.searchResultItem}
                  onPress={() => {
                    toggleSymptom(result);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <Feather name="plus-circle" size={16} color={colors.black} />
                  <Text style={globalStyles.searchResultText}>{result}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 3D Body Map Card */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>VISUAL SYMPTOM SELECTION</Text>
          <Text style={globalStyles.durationHint}>
            Select your symptoms visually by tapping on a 3D body map.
          </Text>
          
          <TouchableOpacity 
            onPress={() => setShowBodyMap(!showBodyMap)}
            style={{
              backgroundColor: showBodyMap ? colors.primaryDark : colors.primary,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 10,
              gap: 8,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            <Feather name={showBodyMap ? "eye-off" : "user"} size={18} color={colors.surface} />
            <Text style={{ color: colors.surface, fontWeight: '700', fontSize: 14 }}>
              {showBodyMap ? 'Hide 3D Model' : 'Open 3D Model'}
            </Text>
          </TouchableOpacity>
          
          {showBodyMap && (
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity 
                  onPress={() => setBodySide('front')}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: bodySide === 'front' ? colors.primary + '20' : colors.glassWhite }}
                >
                  <Text style={{ color: bodySide === 'front' ? colors.primary : colors.textSecondary, fontWeight: '600' }}>Front</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setBodySide('back')}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: bodySide === 'back' ? colors.primary + '20' : colors.glassWhite }}
                >
                  <Text style={{ color: bodySide === 'back' ? colors.primary : colors.textSecondary, fontWeight: '600' }}>Back</Text>
                </TouchableOpacity>
              </View>
              
              <Body
                data={selectedMuscles.map(muscleSlug => ({
                  slug: muscleSlug as any,
                  intensity: 1,
                  color: colors.primary
                }))}
                onBodyPartPress={(muscle) => handleMusclePress(muscle)}
                gender={modelGender}
                side={bodySide}
                scale={1.2}
              />
              <Text style={[globalStyles.durationHint, { textAlign: 'center', marginTop: 15 }]}>
                Tap on the body part where you feel discomfort to add related symptoms.
              </Text>
            </View>
          )}
        </View>

        {/* Common Observations Card */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>{i18n.t('check.common_obs') || 'COMMON OBSERVATIONS'}</Text>
          <View style={globalStyles.chipsContainer}>
            {commonSymptoms.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  style={[globalStyles.chip, isSelected && globalStyles.chipSelected]}
                  onPress={() => toggleSymptom(symptom)}
                  activeOpacity={0.7}
                >
                  <Text style={[globalStyles.chipText, isSelected && globalStyles.chipTextSelected]}>{symptom}</Text>
                  {isSelected && <Feather name="check" size={14} color={colors.surface} style={globalStyles.chipIcon} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Duration Card */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>{i18n.t('check.duration') || 'DURATION'}</Text>
          <Text style={globalStyles.durationHint}>{i18n.t('check.duration_hint') || 'How long have you been experiencing these symptoms?'}</Text>
          <View style={globalStyles.chipsContainer}>
            {DURATION_OPTIONS.map((option) => {
              const isActive = selectedDuration === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[globalStyles.selectionChip, isActive && globalStyles.selectionChipActive]}
                  onPress={() => {
                    setSelectedDuration(option);
                    if (prediction) { setPrediction(null); setPredictionError(null); }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[globalStyles.selectionChipText, isActive && globalStyles.selectionChipTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Additional Notes */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>{i18n.t('check.notes') || 'ADDITIONAL NOTES (OPTIONAL)'}</Text>
          <TextInput
            style={globalStyles.notesInput}
            placeholder="Any other details? (e.g., recent travel, medication, allergies...)"
            placeholderTextColor={colors.textSecondary}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Attach Reports */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>{i18n.t('check.attach') || 'ATTACH REPORTS (OPTIONAL)'}</Text>
          <Text style={globalStyles.durationHint}>
            Upload up to 3 images or PDFs (e.g., lab results, prescriptions) for AI analysis.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
            <TouchableOpacity style={globalStyles.bookButtonSmall} onPress={handlePickImage}>
              <Text style={globalStyles.bookButtonSmallText}>Add Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.bookButtonSmall} onPress={handlePickDocument}>
              <Text style={globalStyles.bookButtonSmallText}>Add Document</Text>
            </TouchableOpacity>
          </View>
          {attachments.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {attachments.map((att, index) => (
                <View key={index} style={{ position: 'relative' }}>
                  <View style={{ width: 60, height: 60, backgroundColor: colors.glassWhite, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.subtleBorder }}>
                    <Feather name={att.mimeType.includes('pdf') ? 'file-text' : 'image'} size={24} color={colors.textSecondary} />
                  </View>
                  <TouchableOpacity
                    style={{ position: 'absolute', top: -8, right: -8, backgroundColor: colors.errorText, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', zIndex: 2 }}
                    onPress={() => removeAttachment(index)}
                  >
                    <Feather name="x" size={14} color={colors.surface} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Generate Prediction Button */}
        <TouchableOpacity
          style={[
            globalStyles.actionButton,
            (selectedSymptoms.length === 0 || !selectedDuration || isAnalyzing) && globalStyles.disabled,
          ]}
          onPress={handleGenerate}
          disabled={selectedSymptoms.length === 0 || !selectedDuration || isAnalyzing}
          activeOpacity={0.8}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator size="small" color={colors.black} style={{ marginRight: 10 }} />
              <Text style={globalStyles.actionButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Text style={globalStyles.actionButtonText}>{i18n.t('check.generate') || 'Generate Prediction'}</Text>
              <MaterialCommunityIcons name="brain" size={20} color={colors.black} />
            </>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={globalStyles.disclaimer}>
          * This tool is for informational purposes and not a substitute for professional diagnosis.
        </Text>

        {/* Error State */}
        {predictionError && !isAnalyzing && (
          <View style={globalStyles.errorCard}>
            <Feather name="alert-circle" size={20} color={colors.accent} />
            <Text style={globalStyles.errorText}>{predictionError}</Text>
            <TouchableOpacity onPress={handleGenerate} style={globalStyles.retryButton}>
              <Text style={globalStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prediction Results */}
        {prediction && (
          <View style={globalStyles.cardPadded}>
            <View style={globalStyles.insightsHeader}>
              <Text style={globalStyles.insightsTitle}>AI Insights</Text>
              <View style={[
                globalStyles.badge,
                { backgroundColor: getRiskBgColor(prediction.overall_risk) }
              ]}>
                <Text style={[
                  globalStyles.badgeText,
                  { color: getRiskColor(prediction.overall_risk) }
                ]}>
                  {prediction.overall_risk} RISK
                </Text>
              </View>
            </View>
            <Text style={globalStyles.insightsSubtitle}>
              Based on {selectedSymptoms.length} reported symptom{selectedSymptoms.length > 1 ? 's' : ''}
            </Text>

            {hasEmergencySymptom && (
              <View style={[
                globalStyles.errorCard, 
                { backgroundColor: colors.accent, marginBottom: 15, flexDirection: 'column', alignItems: 'flex-start', gap: 5 }
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="alert-triangle" size={20} color={colors.surface} />
                  <Text style={{ color: colors.surface, fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                    EMERGENCY ALERT
                  </Text>
                </View>
                <Text style={{ color: colors.surface, fontSize: 14, lineHeight: 20 }}>
                  Based on your symptoms, we strongly recommend calling emergency services immediately (e.g., 911 or 1990) or visiting the nearest emergency room.
                </Text>
              </View>
            )}

            {prediction.conditions.map((condition, index) => (
              <View key={index} style={globalStyles.insightItem}>
                <View style={globalStyles.insightIconContainer}>
                  <Feather
                    name={getFeatherIcon(condition.icon_name) as any}
                    size={24}
                    color={colors.black}
                  />
                </View>
                <View style={globalStyles.insightDetails}>
                  <Text style={globalStyles.insightName}>{condition.name}</Text>
                  <Text style={[
                    globalStyles.insightPossibility,
                    { color: getRiskColor(condition.risk_level) }
                  ]}>
                    {condition.risk_level.toUpperCase()}
                  </Text>
                </View>
                <Text style={globalStyles.insightPercentage}>{condition.possibility_percent}%</Text>
              </View>
            ))}

            {/* Recommendation */}
            <View style={globalStyles.recommendationContainer}>
              <Feather name="briefcase" size={16} color={colors.black} style={globalStyles.recommendationIcon} />
              <Text style={globalStyles.recommendationText}>
                {prediction.recommendation}
                {prediction.recommended_specialist && (
                  <Text style={globalStyles.linkText}> Recommended: {prediction.recommended_specialist}</Text>
                )}
              </Text>
            </View>

            {/* Feedback Loop */}
            {historyId && !feedbackSubmitted && (
              <View style={{ marginTop: 20, marginBottom: 15, padding: 15, backgroundColor: colors.surfaceAlt, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 10 }}>Was this analysis helpful and accurate?</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <TouchableOpacity onPress={() => handleFeedback(true)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successBg, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}>
                    <Feather name="thumbs-up" size={16} color={colors.successText} />
                    <Text style={{ marginLeft: 6, color: colors.successText, fontWeight: '600' }}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleFeedback(false)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.errorBg, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}>
                    <Feather name="thumbs-down" size={16} color={colors.errorText} />
                    <Text style={{ marginLeft: 6, color: colors.errorText, fontWeight: '600' }}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {feedbackSubmitted && (
              <View style={{ marginTop: 20, marginBottom: 15, padding: 15, alignItems: 'center' }}>
                <Text style={{ color: colors.successText, fontWeight: '600' }}>Thank you for your feedback!</Text>
              </View>
            )}

            {/* New Analysis Button */}
            <TouchableOpacity style={globalStyles.resetButton} onPress={handleReset} activeOpacity={0.7}>
              <Feather name="refresh-cw" size={16} color={colors.surface} />
              <Text style={globalStyles.resetButtonText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recommended Doctors — always shown when there is a prediction */}
        {prediction && (
          <View style={globalStyles.cardPadded}>
            <RecommendedDoctors specialties={getDoctorSpecialties(prediction)} />
          </View>
        )}

        <View style={globalStyles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}
