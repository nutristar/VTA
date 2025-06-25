
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_GET = 'http://192.168.0.80:5000/cheking_person';
const REFRESH_INTERVAL = 10000;

type RoomItem = {
  id: number;
  pokoj: number;
  tech_problem: string | null;
  it_problem: string | null;
  cleaning: string | null;
  ready: string | null;
  status: string | null;
  timestamp: string;
  user: string | null;
};

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem('userName');
      setUserName(storedUser); // сохраним для фильтрации/отображения, если нужно

      const response = await axios.get(API_GET, {
        params: { user: storedUser }, // 👈 передаём имя как query-параметр
      });

      setRooms(response.data);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych pokoi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }: { item: RoomItem }) => (
    <View style={styles.item}>
      <Text style={styles.room}>Pokój: {item.pokoj}</Text>
      <Text>TECH: {item.tech_problem || '-'}</Text>
      <Text>IT: {item.it_problem || '-'}</Text>
      <Text>Czyszczenie: {item.cleaning || '-'}</Text>
      <Text
        style={{
          color:
            item.ready?.toLowerCase() === 'yes'
              ? 'green'
              : item.ready?.toLowerCase() === 'no'
              ? 'red'
              : 'black',
        }}
      >
        Gotowe: {item.ready || '-'}
      </Text>
      <Text>Status: {item.status || '-'}</Text>
      <Text>Osoba: {item.user || '-'}</Text>
      <Text>Czas: {new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje pokoje</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 8,
  },
  room: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
