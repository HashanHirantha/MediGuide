import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../constants/globalStyles';

export default function DoctorSchedule() {
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.pageTitle}>Schedule</Text>
        <Text style={globalStyles.pageDescription}>Doctor schedule coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}
