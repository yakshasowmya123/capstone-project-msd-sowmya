import React, { useState, useEffect, useRef } from 'react';
import TransactionItem from './TransactionItem.jsx';
import { transactionService } from '../services/transactionService.js';
import { isAuthenticated } from '../services/api.js';

const DashboardPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!isAuthenticated()) {
          setError('Please log in to view your transactions');
          setLoading(false);
          return;
        }
        setLoading(true);
        setError('');
        const fetchedTransactions = await transactionService.fetchTransactions();
        setTransactions(fetchedTransactions);
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() === '' || amount.trim() === '') {
      setError('Please enter both description and amount');
      return;
    }
    if (isEditing) {
      setError('Edit functionality will be implemented soon');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const newTransaction = await transactionService.addTransaction({
        text: text.trim(),
        amount: parseFloat(amount)
      });
      setTransactions([newTransaction, ...transactions]);
      setText('');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const transactionToEdit = transactions.find((t) => t.id === id);
    setText(transactionToEdit.text);
    setAmount(transactionToEdit.amount);
    setIsEditing(true);
    setEditId(id);
  };

  const removeTransaction = async (id) => {
    try {
      setError('');
      const originalTransactions = [...transactions];
      setTransactions(transactions.filter((t) => t._id !== id));
      await transactionService.deleteTransaction(id);
    } catch (err) {
      setTransactions(originalTransactions);
      setError(err.message || 'Failed to delete transaction');
    }
  };

  const quickAddSalary = () => {
    setText('Salary');
    setAmount('');
    amountRef.current?.focus();
  };

  const amounts = transactions.map((t) => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter((item) => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
  const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);

  return (
    <div className="bg-pink-400 min-h-screen flex flex-col items-center py-8 px-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Expense Tracker</h2>
        <div className="mb-6">
          <h4 className="text-gray-600 text-sm uppercase">Your Balance</h4>
          <h1 className="text-3xl font-bold text-gray-800">₹{total}</h1>
        </div>
        <div className="flex justify-between bg-gray-50 p-4 rounded-md shadow-inner mb-6">
          <div className="text-center">
            <h4 className="text-green-500 font-semibold">Income</h4>
            <p className="text-green-600 font-bold">₹{income}</p>
          </div>
          <div className="border-r border-gray-300 mx-4"></div>
          <div className="text-center">
            <h4 className="text-red-500 font-semibold">Expense</h4>
            <p className="text-red-600 font-bold">₹{expense}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <label className="block text-gray-700 mb-1 font-medium">Description</label>
            <button
              type="button"
              onClick={quickAddSalary}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              + Quick Add Salary
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. Salary, Grocery..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Amount <span className="text-sm text-gray-500">(negative for expense, positive for income)</span>
            </label>
            <input
              type="number"
              ref={amountRef}
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : isEditing
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-semibold py-2 rounded-md transition-colors`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </span>
            ) : isEditing ? (
              'Update Transaction'
            ) : (
              'Add Transaction'
            )}
          </button>
        </form>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        <h3 className="text-xl font-bold text-gray-700 mb-3 border-b pb-2">History</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center">No transactions yet</p>
            ) : (
              transactions.map((t) => (
                <TransactionItem
                  key={t._id}
                  transaction={t}
                  removeTransaction={removeTransaction}
                  handleEdit={handleEdit}
                />
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
