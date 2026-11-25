import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@assignments';

export default function App() {
  const [list, setList] = useState([]);
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => val && setList(JSON.parse(val)));
  }, []);

  const saveList = async (newData) => {
    setList(newData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const handleSave = () => {
    if (!subject.trim() || !dueDate.trim()) return;
    if (editId) {
      saveList(list.map(item => item.id === editId ? { ...item, subject, dueDate } : item));
      setEditId(null);
    } else {
      saveList([...list, { id: Date.now().toString(), subject, dueDate }]);
    }
    setSubject('');
    setDueDate('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Homework & Deadlines</Text>
      <TextInput style={styles.input} placeholder="Course / Activity (e.g., CS 302 Lab)" value={subject} onChangeText={setSubject} />
      <TextInput style={styles.input} placeholder="Due Date (e.g., Nov 30)" value={dueDate} onChangeText={setDueDate} />
      <Button title={editId ? "Update Assignment" : "Add Assignment"} onPress={handleSave} />
      <FlatList
        style={{ marginTop: 15 }}
        data={list}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.date}>Due: {item.dueDate}</Text>
            </View>
            <TouchableOpacity onPress={() => { setSubject(item.subject); setDueDate(item.dueDate); setEditId(item.id); }}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => saveList(list.filter(i => i.id !== item.id))}>
              <Text style={styles.delBtn}>Done</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#eef2ff', borderRadius: 8, marginBottom: 8 },
  subject: { fontSize: 16, fontWeight: 'bold' },
  date: { color: '#4338ca', fontSize: 13 },
  editBtn: { color: '#d97706', marginRight: 12 },
  delBtn: { color: '#059669', fontWeight: 'bold' }
});