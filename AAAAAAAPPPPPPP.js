import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@expense_notes';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(data => data && setExpenses(JSON.parse(data)));
  }, []);

  const saveExpenses = async (list) => {
    setExpenses(list);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  };

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!label.trim() || isNaN(num)) return;
    if (editId) {
      saveExpenses(expenses.map(e => e.id === editId ? { ...e, label, amount: num } : e));
      setEditId(null);
    } else {
      saveExpenses([...expenses, { id: Date.now().toString(), label, amount: num }]);
    }
    setLabel('');
    setAmount('');
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense Notes (Total: ₱{total.toFixed(2)})</Text>
      <TextInput style={styles.input} placeholder="Expense item (e.g., Lunch)" value={label} onChangeText={setLabel} />
      <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <Button title={editId ? "Update Expense" : "Log Expense"} onPress={handleSave} />
      <FlatList
        style={{ marginTop: 15 }}
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.label}: ₱{item.amount.toFixed(2)}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => { setLabel(item.label); setAmount(String(item.amount)); setEditId(item.id); }}>
                <Text style={{ color: '#2563eb' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => saveExpenses(expenses.filter(e => e.id !== item.id))}>
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
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6, marginBottom: 8 },
  text: { fontSize: 16 }
});