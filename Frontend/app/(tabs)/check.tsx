import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import {
  analyzeSymptoms,
  getRiskColor,
  getRiskBgColor,
  PredictionCondition,
  PredictionResponse,
} from '../../services/geminiService';
import { searchSymptoms } from '../../services/symptomService';

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

// ─── Component ───────────────────────────────────────────────

export default function SymptomCheckerScreen() {
  const { profile } = useAuth();

  // Symptom state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>(DEFAULT_SYMPTOMS);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Duration state
  const [selectedDuration, setSelectedDuration] = useState('');

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Prediction state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

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

  // ─── Toggle symptom ─────────────────────────────────────────

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
    // Reset prediction when symptoms change
    if (prediction) {
      setPrediction(null);
      setPredictionError(null);
    }
  };

  // ─── Add custom symptom ─────────────────────────────────────

  const addCustomSymptom = () => {
    const trimmed = searchQuery.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
      setSearchQuery('');
      setSearchResults([]);
      if (prediction) {
        setPrediction(null);
        setPredictionError(null);
      }
    }
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

    const { data, error } = await analyzeSymptoms(
      selectedSymptoms,
      selectedDuration,
      additionalNotes || undefined
    );

    setIsAnalyzing(false);

    if (error) {
      console.error('[Check] Prediction error:', error);
      setPredictionError(error);
      Alert.alert('Analysis Failed', error);
      return;
    }

    if (data?.prediction) {
      console.log('[Check] Prediction received successfully');
      setPrediction(data.prediction);
    }
  };

  // ─── Reset ──────────────────────────────────────────────────

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSelectedDuration('');
    setAdditionalNotes('');
    setPrediction(null);
    setPredictionError(null);
    setSearchQuery('');
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>

        {/* Huge Title */}
        <Text style={globalStyles.mainTitle}>Symptom Checker</Text>
        <Text style={globalStyles.pageDescription}>
          Tell us how you're feeling. Our AI analyzes your inputs for potential patterns.
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
          <Text style={globalStyles.sectionTitle}>ADD SYMPTOM</Text>
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

        {/* Common Observations Card */}
        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>COMMON OBSERVATIONS</Text>
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
          <Text style={globalStyles.sectionTitle}>DURATION</Text>
          <Text style={globalStyles.durationHint}>How long have you been experiencing these symptoms?</Text>
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
          <Text style={globalStyles.sectionTitle}>ADDITIONAL NOTES (OPTIONAL)</Text>
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
              <Text style={globalStyles.actionButtonText}>Generate Prediction</Text>
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

            {/* New Analysis Button */}
            <TouchableOpacity style={globalStyles.resetButton} onPress={handleReset} activeOpacity={0.7}>
              <Feather name="refresh-cw" size={16} color={colors.surface} />
              <Text style={globalStyles.resetButtonText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={globalStyles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}
