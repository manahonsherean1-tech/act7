import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@classic_todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);

  // READ: Load data on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) setTodos(JSON.parse(saved));
      } catch (e) { console.error(e); }
    };
    loadTodos();
  }, []);

  // Helper to persist state
  const saveTodos = async (newList) => {
    try {
      setTodos(newList);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) { console.error(e); }
  };

  // CREATE or UPDATE
  const handleSave = () => {
    if (!text.trim()) return;
    if (editId) {
      const updated = todos.map(t => t.id === editId ? { ...t, title: text } : t);
      saveTodos(updated);
      setEditId(null);
    } else {
      const newTodo = { id: Date.now().toString(), title: text, completed: false };
      saveTodos([...todos, newTodo]);
    }
    setText('');
  };

  // UPDATE (Toggle status)
  const toggleComplete = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos(updated);
  };

  // DELETE
  const deleteTodo = (id) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daily To-Do List</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Enter task..." value={text} onChangeText={setText} />
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={styles.btnText}>{editId ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleComplete(item.id)}>
              <Text style={[styles.itemText, item.completed && styles.done]}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setText(item.title); setEditId(item.id); }}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.del}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f9f9f9' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, backgroundColor: '#fff' },
  btn: { backgroundColor: '#007bff', padding: 12, marginLeft: 8, borderRadius: 6, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 6, alignItems: 'center' },
  itemText: { fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: '#888' },
  edit: { color: '#ff9800', marginHorizontal: 10 },
  del: { color: '#f44336' }
});