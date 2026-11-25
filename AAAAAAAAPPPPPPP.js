import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@watchlist';

export default function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(d => d && setItems(JSON.parse(d)));
  }, []);

  const persist = async (next) => {
    setItems(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (editId) {
      persist(items.map(i => i.id === editId ? { ...i, title } : i));
      setEditId(null);
    } else {
      persist([...items, { id: Date.now().toString(), title, watched: false }]);
    }
    setTitle('');
  };

  const toggleStatus = (id) => {
    persist(items.map(i => i.id === id ? { ...i, watched: !i.watched } : i));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Watchlist</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Movie or Book title..." value={title} onChangeText={setTitle} />
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={{ color: '#fff' }}>{editId ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <TouchableOpacity onPress={() => toggleStatus(item.id)}>
                <Text style={{ color: item.watched ? 'green' : 'orange', fontSize: 13 }}>
                  {item.watched ? '✓ Watched (Tap to toggle)' : '• To Watch (Tap to toggle)'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { setTitle(item.title); setEditId(item.id); }}>
              <Text style={{ color: '#007bff', marginRight: 10 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => persist(items.filter(i => i.id !== item.id))}>
              <Text style={{ color: 'red' }}>Del</Text>
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
  btn: { backgroundColor: '#111', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 6, marginLeft: 8 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: 'bold' }
});