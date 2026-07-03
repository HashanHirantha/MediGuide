import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import i18n from '../../i18n';

export default function LanguageSettingsScreen() {
  const { locale, setLanguage } = useLanguage();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.language') || 'Language'}</Text>
        <Text style={globalStyles.pageDescription}>{i18n.t('settings.select_language') || 'Select your preferred language.'}</Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, marginTop: 20, overflow: 'hidden' }}>
          <Picker
            selectedValue={locale}
            onValueChange={(itemValue) => setLanguage(itemValue)}
          >
            <Picker.Item label="English (United States)" value="en" />
            <Picker.Item label="සිංහල (Sinhala)" value="si" />
            <Picker.Item label="தமிழ் (Tamil)" value="ta" />
          </Picker>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
