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
  Image,
} from 'react-native';
import {launchCamera, ImagePickerResponse} from 'react-native-image-picker';
import Recorder from './components/Recorder';
import PermissionsChecker from './components/PermissionsChecker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Интерфейс пропсов
interface MainScreenProps {
  name?: string;
}

const MainScreen: React.FC<MainScreenProps> = ({ name }) => {
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'pl' | 'en'>('pl');

  const handleStartRecording = () => {
    setTranscribedText('');
    setPhotoUri(null);
  };

  const handleRecordingFinished = (path: string) => {
    console.log('[handleRecordingFinished] Audio path:', path);
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
    setLoading(true);
    const userName = name || (await AsyncStorage.getItem('userName'));

    try {
      const formData = new FormData();
      formData.append('text', transcribedText);
      formData.append('language', selectedLanguage);
      formData.append('user', userName || 'Anonim');
      formData.append('file_name', 'audio.m4a');

      if (photoUri) {
        formData.append('photo', {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);
      }

      const response = await axios.post('http://192.168.0.80:5000/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Sukces', 'Dane zostały zapisane');
        setTranscribedText('');
        setPhotoUri(null);
      } else {
        throw new Error(response.data.error || 'Błąd zapisu');
      }
    } catch (err: any) {
      Alert.alert('Błąd', 'Nie udało się zapisać: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = () => {
    launchCamera(
      {mediaType: 'photo', saveToPhotos: true},
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Błąd', 'Nie udało się otworzyć aparatu.');
        } else if (response.assets && response.assets[0].uri) {
          setPhotoUri(response.assets[0].uri);
          Alert.alert('Sukces', 'Zdjęcie gotowe do wysłania.');
        }
      },
    );
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
          {photoUri && (
            <Image source={{uri: photoUri}} style={styles.thumbnail} />
          )}
          <View style={styles.buttonWrapper}>
            <Button title="Zrób zdjęcie" onPress={handleTakePhoto} />
            <View style={{marginTop: 10}} />
            <Button title="Zapisz tekst i zdjęcie" onPress={saveTranscription} />
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
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
  },
});
