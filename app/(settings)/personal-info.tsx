import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function PersonalInfoScreen() {
  const [data, setData] = useState({
    name: 'Adaugo Okonkwo',
    phone: '+234 803 123 4567',
    email: 'adaugo@example.com',
    dob: '12/04/1990',
    address: '15 Admiralty Way',
    city: 'Lekki',
    state: 'Lagos',
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Personal Information" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppInput label="Full Name" value={data.name} onChangeText={(t) => setData({...data, name: t})} />
        <AppInput label="Phone Number" value={data.phone} onChangeText={(t) => setData({...data, phone: t})} keyboardType="phone-pad" />
        <AppInput label="Email Address" value={data.email} onChangeText={(t) => setData({...data, email: t})} editable={false} />
        <AppInput label="Date of Birth" value={data.dob} onChangeText={(t) => setData({...data, dob: t})} />
        <AppInput label="Street Address" value={data.address} onChangeText={(t) => setData({...data, address: t})} />
        <View style={styles.row}>
          <View style={{flex: 1}}><AppInput label="City" value={data.city} onChangeText={(t) => setData({...data, city: t})} /></View>
          <View style={{flex: 1}}><AppInput label="State" value={data.state} onChangeText={(t) => setData({...data, state: t})} /></View>
        </View>
        <AppButton label="Save Changes" onPress={() => {}} style={{marginTop: 10}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24, paddingBottom: 60 },
  row: { flexDirection: 'row', gap: 12 },
});
