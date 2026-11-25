import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@code_snippets';

export default function App() {
  const [snippets, setSnippets] = useState([]);
  const [desc, setDesc] = useState('');
  const [code, setCode] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(res => res && setSnippets(JSON.parse(res)));
  }, []);

  const sync = async (list) => {
    setSnippets(list);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  };

  const handleSave = () => {
    if (!desc.trim() || !code.trim()) return;
    if (editId) {
      sync(snippets.map(s => s.id === editId ? { ...s, desc, code } : s));
      setEditId(null);
    } else {
      sync([...snippets, { id: Date.now().toString(), desc, code }]);
    }
    setDesc('');
    setCode('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dev Snippet Notes</Text>
      <TextInput style={styles.input} placeholder="Description (e.g., Git push)" value={desc} onChangeText={setDesc} />
      <TextInput style={[styles.input, { fontFamily: 'monospace' }]} placeholder="Command / Code" value={code} onChangeText={setCode} />
      <Button title={editId ? "Update Snippet" : "Save Snippet"} onPress={handleSave} />
      <FlatList
        style={{ marginTop: 15 }}
        data={snippets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.desc}>{item.desc}</Text>
            <Text style={styles.codeBox}>{item.code}</Text>
            <View style={{ flexDirection: 'row', gap: 15, marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setDesc(item.desc); setCode(item.code); setEditId(item.id); }}>
                <Text style={{ color: '#0284c7' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sync(snippets.filter(s => s.id !== item.id))}>
                <Text style={{ color: '#dc2626' }}>Delete</Text>
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
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 8 },
  card: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  desc: { fontWeight: 'bold', marginBottom: 4 },
  codeBox: { backgroundColor: '#1e293b', color: '#38bdf8', padding: 8, borderRadius: 4, fontFamily: 'monospace' }
});