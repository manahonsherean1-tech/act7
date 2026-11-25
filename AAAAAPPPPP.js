import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@grocery_list';

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(KEY);
      if (json) setItems(JSON.parse(json));
    })();
  }, []);

  const persist = async (list) => {
    setItems(list);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  };

  const saveItem = () => {
    if (!name.trim()) return;
    if (editId) {
      persist(items.map(i => i.id === editId ? { ...i, name, qty } : i));
      setEditId(null);
    } else {
      persist([...items, { id: Date.now().toString(), name, qty }]);
    }
    setName('');
    setQty('1');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery List</Text>
      <View style={styles.form}>
        <TextInput style={[styles.input, { flex: 2 }]} placeholder="Item (e.g. Rice)" value={name} onChangeText={setName} />
        <TextInput style={[styles.input, { flex: 1, marginLeft: 6 }]} placeholder="Qty" value={qty} onChangeText={setQty} />
        <TouchableOpacity style={styles.addBtn} onPress={saveItem}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editId ? 'Save' : '+'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.itemText}>{item.name} ({item.qty})</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => { setName(item.name); setQty(item.qty); setEditId(item.id); }}>
                <Text style={{ color: '#2b8a3e' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => persist(items.filter(i => i.id !== item.id))}>
                <Text style={{ color: '#c92a2a' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  form: { flexDirection: 'row', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
  addBtn: { backgroundColor: '#2b8a3e', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 6, marginLeft: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 16 }
});