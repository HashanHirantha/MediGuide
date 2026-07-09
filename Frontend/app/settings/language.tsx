import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import i18n from '../../i18n';

export default function LanguageSettingsScreen() {
  const { locale, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English (United States)', icon: 'globe' },
    { code: 'si', label: 'සිංහල (Sinhala)', icon: 'map-pin' },
    { code: 'ta', label: 'தமிழ் (Tamil)', icon: 'map' },
  ];

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.language') || 'Language'}</Text>
        <Text style={globalStyles.pageDescription}>{i18n.t('settings.select_language') || 'Select your preferred language.'}</Text>

        <View style={[globalStyles.card, { marginTop: 20 }]}>
          {languages.map((lang, index) => (
            <React.Fragment key={lang.code}>
              <TouchableOpacity 
                style={globalStyles.row}
                onPress={() => setLanguage(lang.code)}
              >
                <View style={[
                  globalStyles.iconContainer, 
                  locale === lang.code ? { backgroundColor: colors.primary + '20' } : {}
                ]}>
                  <Feather 
                    name={lang.icon as any} 
                    size={20} 
                    color={locale === lang.code ? colors.primary : colors.iconDark} 
                  />
                </View>
                <View style={globalStyles.rowTextContainer}>
                  <Text style={[
                    globalStyles.rowTitle,
                    locale === lang.code ? { color: colors.primary, fontWeight: '700' } : {}
                  ]}>
                    {lang.label}
                  </Text>
                </View>
                {locale === lang.code && (
                  <Feather name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              {index < languages.length - 1 && (
                <View style={[globalStyles.divider, { marginLeft: 72 }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
