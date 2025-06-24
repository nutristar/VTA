import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import MainScreen from './MainScreen';
import LoginScreen from './LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

// 👇 Типизация навигации
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const loadName = async () => {
      const saved = await AsyncStorage.getItem('userName');
      if (saved) setUserName(saved);
    };
    loadName();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          options={({ navigation }) => ({
            title: 'Transkrypcja',
            headerRight: () => (
              <Text
                style={{
                  marginRight: 15,
                  color: '#007bff',
                  fontWeight: 'bold',
                }}
                onPress={() => navigation.navigate('Login')}
              >
                Login
              </Text>
            ),
          })}
        >
          {(props) => <MainScreen {...props} userName={userName} />}
        </Stack.Screen>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}







// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Button,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import Recorder from './components/Recorder';
// import PermissionsChecker from './components/PermissionsChecker';
// import RNFS from 'react-native-fs';
// import axios from 'axios';
//
// export default function App() {
//   const [audioPath, setAudioPath] = useState(null);
//   const [transcribedText, setTranscribedText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedLanguage, setSelectedLanguage] = useState('pl');
//
//   const handleRecordingFinished = (path) => {
//     console.log('[handleRecordingFinished] Audio recording finished. Path:', path);
//     setAudioPath(path);
//     transcribeAudio(path);
//   };
//
//   const handleStartRecording = () => {
//     // Автоочистка текста перед новой записью
//     setTranscribedText('');
//   };
//
//   const transcribeAudio = async (path) => {
//     console.log('[transcribeAudio] Reading file from:', path);
//     setLoading(true);
//
//     try {
//       const formData = new FormData();
//       formData.append('file', {
//         uri: `file://${path}`,
//         type: 'audio/m4a',
//         name: 'audio.m4a',
//       });
//       formData.append('language', selectedLanguage);
//
// //       const response = await axios.post('http://63.178.37.169:5000/transcribe', formData, {
//       const response = await axios.post('http://192.168.0.80:5000/transcribe', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//
//       console.log('[transcribeAudio] Response:', response.data);
//       setTranscribedText(response.data.text || '[brak tekstu]');
//     } catch (err) {
//       console.error('[transcribeAudio] Error:', err.message, err);
//       Alert.alert('Błąd', 'Nie udało się przesłać nagrania: ' + err.message);
//     }
//
//     setLoading(false);
//   };
//
//   const saveTranscription = async () => {
//     console.log('[saveTranscription] Sending transcription to /save');
//
//     try {
// //       const response = await fetch('http://63.178.37.169:5000/save', {
//       const response = await fetch('http://192.168.0.80:5000/save', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           file_name: 'audio.m4a',
//           text: transcribedText,
//           language: selectedLanguage,
//         }),
//       });
//
//       const result = await response.json();
//       if (response.ok) {
//         console.log('[saveTranscription] Response:', result);
//         Alert.alert('Sukces', 'Tekst został zapisany');
//         setTranscribedText('');
//       } else {
//         throw new Error(result.error || 'Błąd podczas zapisu');
//       }
//     } catch (err) {
//       console.error('[saveTranscription] Error:', err.message);
//       Alert.alert('Błąd', 'Nie udało się zapisać: ' + err.message);
//     }
//   };
//
//   const renderLanguageButton = (lang, label) => (
//     <TouchableOpacity
//       onPress={() => setSelectedLanguage(lang)}
//       style={[
//         styles.languageButton,
//         selectedLanguage === lang && styles.languageButtonSelected,
//       ]}
//     >
//       <Text
//         style={[
//           styles.languageText,
//           selectedLanguage === lang && styles.languageTextSelected,
//         ]}
//       >
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
//
//   return (
//     <View style={styles.container}>
//       <PermissionsChecker />
//       <View style={styles.languageSelector}>
//         {renderLanguageButton('pl', 'PL')}
//         {renderLanguageButton('en', 'EN')}
//       </View>
//
//       <Recorder onFinish={handleRecordingFinished} onStartRecording={handleStartRecording} />
//
//       {loading && <ActivityIndicator size="large" color="#007bff" />}
//
//       {transcribedText !== '' && (
//         <>
//           <TextInput
//             style={styles.textInput}
//             value={transcribedText}
//             onChangeText={setTranscribedText}
//             multiline
//           />
//           <Button title="Wyczyść" onPress={() => setTranscribedText('')} />
//         </>
//       )}
//
//       {transcribedText ? (
//         <Button title="Zapisz tekst" onPress={saveTranscription} />
//       ) : null}
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   languageSelector: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   languageButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginHorizontal: 8,
//     borderRadius: 8,
//     backgroundColor: '#ccc',
//   },
//   languageButtonSelected: {
//     backgroundColor: '#007bff',
//     transform: [{ scale: 1.1 }],
//   },
//   languageText: {
//     fontSize: 16,
//     color: '#000',
//   },
//   languageTextSelected: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#aaa',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     marginVertical: 20,
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
// });


