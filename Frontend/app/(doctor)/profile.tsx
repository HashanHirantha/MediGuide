import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../constants/globalStyles';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/theme';

export default function DoctorProfile() {
  const { signOut } = useAuth();
  
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.pageTitle}>Profile</Text>
        <Text style={globalStyles.pageDescription}>Doctor profile settings coming soon...</Text>
        
        <TouchableOpacity 
          style={[globalStyles.button, { marginTop: 40, backgroundColor: colors.error, alignSelf: 'stretch', marginHorizontal: 20 }]}
          onPress={signOut}
        >
          <Text style={globalStyles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
