import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@priority_tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(res => res && setTasks(JSON.parse(res)));
  }, []);

  const updateStorage = async (data) => {
    setTasks(data);
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!taskText.trim()) return;
    if (editId) {
      updateStorage(tasks.map(t => t.id === editId ? { ...t, taskText, priority } : t));
      setEditId(null);
    } else {
      updateStorage([...tasks, { id: Date.now().toString(), taskText, priority }]);
    }
    setTaskText('');
    setPriority('Medium');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Priority Tasks</Text>
      <TextInput style={styles.input} placeholder="Task description..." value={taskText} onChangeText={setTaskText} />
      <View style={styles.prioRow}>
        {['High', 'Medium', 'Low'].map(p => (
          <TouchableOpacity key={p} style={[styles.chip, priority === p && styles.activeChip]} onPress={() => setPriority(p)}>
            <Text style={{ color: priority === p ? '#fff' : '#333' }}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editId ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.taskText}</Text>
              <Text style={styles.badge}>Priority: {item.priority}</Text>
            </View>
            <TouchableOpacity onPress={() => { setTaskText(item.taskText); setPriority(item.priority); setEditId(item.id); }}>
              <Text style={{ color: '#0066cc', marginRight: 12 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateStorage(tasks.filter(t => t.id !== item.id))}>
              <Text style={{ color: 'crimson' }}>Delete</Text>
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
  input: { borderWidth: 1, borderColor: '#bbb', padding: 10, borderRadius: 6, marginBottom: 10 },
  prioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#e9ecef' },
  activeChip: { backgroundColor: '#495057' },
  saveBtn: { marginLeft: 'auto', backgroundColor: '#5c7cfa', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 8 },
  taskTitle: { fontSize: 16, fontWeight: '600' },
  badge: { fontSize: 12, color: '#666', marginTop: 2 }
});