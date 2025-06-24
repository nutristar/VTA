import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Recorder from './components/Recorder';
import PermissionsChecker from './components/PermissionsChecker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Интерфейс пропсов
interface MainScreenProps {
  name?: string;
}

const MainScreen: React.FC<MainScreenProps> = ({ name }) => {
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'pl' | 'en'>('pl');

  const handleStartRecording = () => {
    setTranscribedText('');
  };

  const handleRecordingFinished = (path: string) => {
    console.log('[handleRecordingFinished] Audio path:', path);
    setAudioPath(path);
    transcribeAudio(path);
  };

  const transcribeAudio = async (path: string) => {
    setLoading(true);

    try {
      const userName = name || (await AsyncStorage.getItem('userName'));
      const formData = new FormData();
      formData.append('file', {
        uri: `file://${path}`,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any); // ← TS fix для FormData в React Native

      formData.append('language', selectedLanguage);
      formData.append('user', userName || 'Anonim');

      const response = await axios.post('http://192.168.0.80:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTranscribedText(response.data.text || '[brak tekstu]');
    } catch (err: any) {
      console.error('[transcribeAudio] Error:', err.message);
      Alert.alert('Błąd', 'Nie udało się przetworzyć nagrania.');
    } finally {
      setLoading(false);
    }
  };

  const saveTranscription = async () => {
    const userName = name || (await AsyncStorage.getItem('userName'));

    try {
      const response = await fetch('http://192.168.0.80:5000/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: 'audio.m4a',
          text: transcribedText,
          language: selectedLanguage,
          user: userName || 'Anonim',
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Sukces', 'Tekst został zapisany');
        setTranscribedText('');
      } else {
        throw new Error(result.error || 'Błąd zapisu');
      }
    } catch (err: any) {
      Alert.alert('Błąd', 'Nie udało się zapisać: ' + err.message);
    }
  };

  const renderLanguageButton = (lang: 'pl' | 'en', label: string) => (
    <TouchableOpacity
      key={lang}
      onPress={() => setSelectedLanguage(lang)}
      style={[
        styles.languageButton,
        selectedLanguage === lang && styles.languageButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.languageText,
          selectedLanguage === lang && styles.languageTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PermissionsChecker />
      <View style={styles.languageSelector}>
        {renderLanguageButton('pl', 'PL')}
        {renderLanguageButton('en', 'EN')}
      </View>

      <Recorder onFinish={handleRecordingFinished} onStartRecording={handleStartRecording} />

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {transcribedText !== '' && (
        <>
          <TextInput
            style={styles.textInput}
            value={transcribedText}
            onChangeText={setTranscribedText}
            multiline
          />
          <View style={styles.buttonWrapper}>
            <Button title="Zapisz tekst" onPress={saveTranscription} />
          </View>
        </>
      )}
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  languageButtonSelected: {
    backgroundColor: '#007bff',
    transform: [{ scale: 1.1 }],
  },
  languageText: {
    fontSize: 16,
    color: '#000',
  },
  languageTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
