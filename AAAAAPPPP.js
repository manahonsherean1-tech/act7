import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@sticky_notes';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setNotes(JSON.parse(data));
    });
  }, []);

  const syncStorage = async (updatedNotes) => {
    setNotes(updatedNotes);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  };

  const handleSaveNote = () => {
    if (!title.trim() || !body.trim()) return;
    if (editingId) {
      syncStorage(notes.map(n => n.id === editingId ? { ...n, title, body } : n));
      setEditingId(null);
    } else {
      syncStorage([{ id: Date.now().toString(), title, body }, ...notes]);
    }
    setTitle('');
    setBody('');
  };

  const startEdit = (note) => {
    setTitle(note.title);
    setBody(note.body);
    setEditingId(note.id);
  };

  const removeNote = (id) => syncStorage(notes.filter(n => n.id !== id));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quick Notes</Text>
      <TextInput style={styles.input} placeholder="Note Title" value={title} onChangeText={setTitle} />
      <TextInput style={[styles.input, { height: 70 }]} placeholder="Note Content..." multiline value={body} onChangeText={setBody} />
      <Button title={editingId ? "Save Changes" : "Create Note"} onPress={handleSaveNote} />
      <FlatList
        style={{ marginTop: 15 }}
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteBody}>{item.body}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEdit(item)}><Text style={styles.link}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => removeNote(item.id)}><Text style={[styles.link, { color: 'red' }]}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fffbe6' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#d9d9d9', backgroundColor: '#fff', padding: 10, borderRadius: 6, marginBottom: 10 },
  noteCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#faad14' },
  noteTitle: { fontSize: 17, fontWeight: 'bold' },
  noteBody: { marginTop: 4, color: '#555' },
  actions: { flexDirection: 'row', marginTop: 10, gap: 15 },
  link: { color: '#1890ff', fontWeight: '600' }
});