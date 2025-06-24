import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleLogin = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Błąd', 'Wpisz imię i nazwisko');
      return;
    }

    const fullName = `${firstName} ${lastName}`;
    await AsyncStorage.setItem('userName', fullName);
    Alert.alert('Zalogowano', `Witaj, ${fullName}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imię:</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
      <Text style={styles.label}>Nazwisko:</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
      <Button title="Zaloguj się" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  label: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
});
