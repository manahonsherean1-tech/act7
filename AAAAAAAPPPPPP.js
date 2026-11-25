import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@journal_entries';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [thought, setThought] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => raw && setEntries(JSON.parse(raw)));
  }, []);

  const persist = async (updated) => {
    setEntries(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  const handleRecord = () => {
    if (!thought.trim()) return;
    if (editId) {
      persist(entries.map(e => e.id === editId ? { ...e, thought } : e));
      setEditId(null);
    } else {
      const today = new Date().toLocaleDateString();
      persist([{ id: Date.now().toString(), date: today, thought }, ...entries]);
    }
    setThought('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daily Journal</Text>
      <TextInput style={styles.input} placeholder="Write a reflection..." value={thought} onChangeText={setThought} multiline />
      <TouchableOpacity style={styles.btn} onPress={handleRecord}>
        <Text style={styles.btnText}>{editId ? 'Update Entry' : 'Save Entry'}</Text>
      </TouchableOpacity>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.body}>{item.thought}</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => { setThought(item.thought); setEditId(item.id); }}>
                <Text style={{ color: '#0284c7' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => persist(entries.filter(e => e.id !== item.id))}>
                <Text style={{ color: '#e11d48' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fdf2f8' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 8, padding: 12, height: 80, marginBottom: 10 },
  btn: { backgroundColor: '#db2777', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  entry: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10 },
  date: { fontSize: 12, color: '#9d174d', fontWeight: 'bold' },
  body: { fontSize: 15, marginVertical: 6 },
  row: { flexDirection: 'row', gap: 15 }
});