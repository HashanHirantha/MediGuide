import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';

const faqs = [
  {
    id: 1,
    question: 'How do I book an appointment?',
    answer: 'Navigate to the "Doctors" tab, select a specialist or search for one, choose an available date and time slot, and confirm your booking.',
  },
  {
    id: 2,
    question: 'How does the AI Symptom Checker work?',
    answer: 'Our AI analyzes your symptoms and medical history to predict potential conditions and recommend the appropriate specialist. Please note this is not a clinical diagnosis.',
  },
  {
    id: 3,
    question: 'Is my health data secure?',
    answer: 'Yes, your data is securely encrypted. We use industry-standard protocols, and you can also protect the app using biometric authentication from the Security Settings.',
  },
  {
    id: 4,
    question: 'Can I cancel an appointment?',
    answer: 'Yes, go to the "History" or "Appointments" tab, select your upcoming appointment, and tap "Cancel". Please cancel at least 24 hours in advance.',
  }
];

export default function HelpScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email') {
      Linking.openURL('mailto:support@mediguide.com');
    } else {
      Linking.openURL('tel:+94705665091');
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={[globalStyles.content, { paddingBottom: 40 }]}>
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.help') || 'Help & Support'}</Text>
        <Text style={globalStyles.pageDescription}>
          {i18n.t('settings.help_desc') || 'Find answers to common questions or reach out to our team.'}
        </Text>

        <Text style={[globalStyles.sectionTitle, { marginTop: 24 }]}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={globalStyles.card}>
          {faqs.map((faq, index) => (
            <View key={faq.id}>
              <TouchableOpacity
                style={[globalStyles.row, { paddingVertical: 16 }]}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={[globalStyles.rowTextContainer, { marginLeft: 0 }]}>
                  <Text style={[globalStyles.rowTitle, { color: expandedId === faq.id ? colors.primary : colors.textPrimary }]}>
                    {faq.question}
                  </Text>
                </View>
                <Feather 
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={expandedId === faq.id ? colors.primary : colors.iconDark} 
                />
              </TouchableOpacity>
              
              {expandedId === faq.id && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                  <Text style={[globalStyles.rowSubtitle, { lineHeight: 20 }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
              
              {index < faqs.length - 1 && <View style={[globalStyles.divider, { marginLeft: 0 }]} />}
            </View>
          ))}
        </View>

        <Text style={[globalStyles.sectionTitle, { marginTop: 24 }]}>CONTACT US</Text>
        <View style={globalStyles.card}>
          <TouchableOpacity style={globalStyles.row} onPress={() => handleContact('email')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="mail" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Email Support</Text>
              <Text style={globalStyles.rowSubtitle}>support@mediguide.com</Text>
            </View>
            <Feather name="external-link" size={16} color={colors.iconLight} />
          </TouchableOpacity>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          <TouchableOpacity style={globalStyles.row} onPress={() => handleContact('phone')}>
            <View style={globalStyles.iconContainer}>
              <Feather name="phone" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Call Us</Text>
              <Text style={globalStyles.rowSubtitle}>+94 566 5091</Text>
            </View>
            <Feather name="external-link" size={16} color={colors.iconLight} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
