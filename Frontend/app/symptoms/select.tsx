import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { SymptomCard } from '../../components/SymptomCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useSymptoms } from '../../hooks/useSymptoms';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';

const BODY_PARTS = ['All', 'Head', 'Chest', 'Abdomen', 'Skin', 'Eyes', 'Musculoskeletal', 'Neurological', 'General'];

export default function SymptomSelectScreen() {
  const { symptoms, loading, searchSymptoms } = useSymptoms();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [bodyPart, setBodyPart] = useState('All');

  const handleSearch = (q: string) => {
    setSearch(q);
    searchSymptoms(q);
  };

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filtered = symptoms.filter(
    (s) => bodyPart === 'All' || s.body_part?.toLowerCase() === bodyPart.toLowerCase()
  );

  const handleNext = () => {
    if (selected.length === 0) return;
    router.push({ pathname: '/symptoms/results', params: { symptomIds: selected.join(',') } });
  };

  return (
    <View style={globalStyles.safeArea}>
      <TopBar />
      <View style={globalStyles.container}>
        <View style={globalStyles.headerPadding}>
          <Text style={globalStyles.pageTitle}>Select Symptoms</Text>
          <Input
            value={search}
            onChangeText={handleSearch}
            placeholder="Search symptoms..."
          />
        </View>

      {/* Body Part Filter */}
      <FlatList
        data={BODY_PARTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={globalStyles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[globalStyles.filterChip, bodyPart === item ? globalStyles.filterChipActive : globalStyles.filterChipInactive]}
            onPress={() => setBodyPart(item)}
          >
            <Text style={[globalStyles.filterText, bodyPart === item ? globalStyles.filterTextActive : globalStyles.filterTextInactive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SymptomCard symptom={item} selected={selected.includes(item.id)} onPress={() => toggle(item.id)} />
          )}
          contentContainerStyle={globalStyles.listPadding}
        />
      )}

      <View style={globalStyles.footerBar}>
        <Button
          title={`Predict Disease (${selected.length} symptoms)`}
          onPress={handleNext}
          disabled={selected.length === 0}
        />
      </View>
      </View>
    </View>
  );
}
