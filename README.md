import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@habit_tracker';

export default function App() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(data => data && setHabits(JSON.parse(data)));
  }, []);

  const persist = async (updated) => {
    setHabits(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      persist(habits.map(h => h.id === editId ? { ...h, name } : h));
      setEditId(null);
    } else {
      persist([...habits, { id: Date.now().toString(), name, streak: 0 }]);
    }
    setName('');
  };

  const incrementStreak = (id) => {
    persist(habits.map(h => h.id === id ? { ...h, streak: h.streak + 1 } : h));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Habit Streak Tracker</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="New habit (e.g., Drink 2L water)" value={name} onChangeText={setName} />
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editId ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.streak}>Streak: {item.streak} days</Text>
            </View>
            <TouchableOpacity style={styles.plusBtn} onPress={() => incrementStreak(item.id)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>+1 Day</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setName(item.name); setEditId(item.id); }}>
              <Text style={{ color: '#d97706', marginHorizontal: 10 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => persist(habits.filter(h => h.id !== item.id))}>
              <Text style={{ color: '#dc2626' }}>Del</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
  btn: { backgroundColor: '#0d9488', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 6, marginLeft: 8 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f0fdfa', borderRadius: 8, marginBottom: 8 },
  habitName: { fontSize: 16, fontWeight: 'bold' },
  streak: { color: '#0f766e', fontSize: 13 },
  plusBtn: { backgroundColor: '#14b8a6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }
});
