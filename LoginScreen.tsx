import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import axios from 'axios';

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

  const handleFaceRecognition = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        saveToPhotos: false,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          Alert.alert('Błąd', response.errorMessage || 'Błąd kamery');
        } else if (response.assets && response.assets[0].uri) {
          try {
            const formData = new FormData();
            formData.append('photo', {
              uri: response.assets[0].uri,
              name: 'face.jpg',
              type: 'image/jpeg',
            } as any);

            const res = await axios.post(
              'http://192.168.0.80:5000/face-login',
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
            );

            if (res.data && res.data.name) {
              await AsyncStorage.setItem('userName', res.data.name);
              Alert.alert('Zalogowano', `Witaj, ${res.data.name}`);
              navigation.goBack();
            } else {
              Alert.alert('Nie rozpoznano', 'Nie udało się rozpoznać twarzy.');
            }
          } catch (error: any) {
            Alert.alert('Błąd', error.message || 'Nie można połączyć się z serwerem');
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imię:</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
      <Text style={styles.label}>Nazwisko:</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

      <View style={styles.buttonSpacing}>
        <Button title="Zaloguj się ręcznie" onPress={handleLogin} />
      </View>

      <Button title="Raspóznaj twarz" onPress={handleFaceRecognition} color="#007bff" />
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
  buttonSpacing: {
    marginBottom: 16,
  },
});





// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function LoginScreen({ navigation }) {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');

//   const handleLogin = async () => {
//     if (!firstName || !lastName) {
//       Alert.alert('Błąd', 'Wpisz imię i nazwisko');
//       return;
//     }

//     const fullName = `${firstName} ${lastName}`;
//     await AsyncStorage.setItem('userName', fullName);
//     Alert.alert('Zalogowano', `Witaj, ${fullName}`);
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Imię:</Text>
//       <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
//       <Text style={styles.label}>Nazwisko:</Text>
//       <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
//       <Button title="Zaloguj się" onPress={handleLogin} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   label: { marginBottom: 8 },
//   input: {
//     borderWidth: 1,
//     borderColor: '#888',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 16,
//   },
// });
