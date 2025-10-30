import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Tesseract from "tesseract.js";
import Navbar from "../components/Navbar";
import "./Expense.css";

const Expense = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [editingId, setEditingId] = useState(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [extractedAmount, setExtractedAmount] = useState('');
  const [extractedCategory, setExtractedCategory] = useState('');
  const [extractedDate, setExtractedDate] = useState('');
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalExpense(total);
  }, [expenses]);

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://auto-expense-tracker-system.onrender.com/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // API may return an array or an object - normalize and filter soft-deleted
      const data = Array.isArray(res.data) ? res.data : (res.data.expenses || res.data);
      setExpenses((data || []).filter(item => !item.isDeleted));
    } catch (err) {
      console.error("Error fetching expenses:", err);
      alert("Error loading expenses");
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (editingId) {
        await axios.put(
          `https://auto-expense-tracker-system.onrender.com/api/expenses/${editingId}`,
          { amount: parseFloat(amount), category, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Expense updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(
          "https://auto-expense-tracker-system.onrender.com/api/expenses/add",
          { amount: parseFloat(amount), category, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Expense added successfully!");
      }

      setAmount("");
      setCategory("");
      setDescription("");
      setTranscript('');
      setFinalTranscript('');
      setExtractedAmount('');
      setExtractedCategory('');
      setExtractedDate('');

      fetchExpenses();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Error processing expense";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`https://auto-expense-tracker-system.onrender.com/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Expense deleted successfully!");
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Error deleting expense");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setAmount("");
    setCategory("");
    setDescription("");
    setTranscript('');
    setFinalTranscript('');
    setExtractedAmount('');
    setExtractedCategory('');
  };

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptPart = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptPart += transcriptPart + ' ';
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(interimTranscript);
        if (finalTranscriptPart) {
          setFinalTranscript(prev => prev + finalTranscriptPart);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error !== 'no-speech') {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (!isRecording) {
      setTranscript('');
      setFinalTranscript('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting recording:", err);
        alert("Could not start recording");
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const fullTranscript = finalTranscript + transcript;

  const parseTranscript = (text) => {
    let amountMatch = text.match(/(?:rupees?|rs\.?|₹)\s*(\d+(?:\.\d{1,2})?)/i);
    if (!amountMatch) amountMatch = text.match(/\$(\d+(?:\.\d{1,2})?)/);
    if (!amountMatch) amountMatch = text.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:dollars?|rupees?)/i);
    if (!amountMatch) amountMatch = text.match(/\b(\d+(?:\.\d{1,2})?)\b/);

    const amount = amountMatch ? parseFloat(amountMatch[1]) : '';

    const categoryMap = {
      'food': ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'restaurant', 'cafe'],
      'transport': ['transport', 'taxi', 'uber', 'bus', 'train', 'fuel', 'gas', 'petrol'],
      'entertainment': ['entertainment', 'movie', 'cinema', 'game', 'concert', 'show'],
      'utilities': ['utilities', 'electricity', 'water', 'internet', 'phone', 'bill'],
      'shopping': ['shopping', 'clothes', 'shoes', 'mall', 'store', 'purchase'],
      'health': ['health', 'medicine', 'doctor', 'hospital', 'pharmacy', 'medical'],
      'education': ['education', 'book', 'course', 'tuition', 'school', 'college']
    };

    let category = 'Other';
    const lowerText = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }

    let date = new Date().toISOString().split('T')[0];
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) {
      date = dateMatch[1];
    } else if (lowerText.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      date = yesterday.toISOString().split('T')[0];
    }

    setExtractedAmount(amount);
    setExtractedCategory(category);
    setExtractedDate(date);

    if (amount) setAmount(amount.toString());
    if (category) setCategory(category);
    setDescription(text.trim());
  };

  useEffect(() => {
    if (fullTranscript) parseTranscript(fullTranscript);
  }, [fullTranscript]);

  const handleBillUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log("Scanned Text:", text);

      let amountMatch = text.match(/(?:total|amount|rs|₹|sum)\s*(?:amount)?\s*[:-]?\s*[$₹]?\s*(\d+(?:\.\d{1,2})?)/i);
      if (amountMatch) {
        setAmount(amountMatch[1]);
      } else {
        const allNumbers = text.match(/\d+(\.\d{1,2})?/g) || [];
        if (allNumbers.length > 0) {
          let biggest = Math.max(...allNumbers.map(Number));
          setAmount(biggest.toString());
        }
      }

      const lowerText = text.toLowerCase();
      if (lowerText.includes("food") || lowerText.includes("restaurant")) {
        setCategory("Food");
      } else if (lowerText.includes("travel") || lowerText.includes("taxi")) {
        setCategory("Transport");
      } else if (lowerText.includes("shopping") || lowerText.includes("mall")) {
        setCategory("Shopping");
      } else if (lowerText.includes("medicine") || lowerText.includes("hospital")) {
        setCategory("Health");
      } else {
        setCategory("Other");
      }

      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let heading = "Scanned receipt";
      if (lines.length > 0) {
        for (let line of lines) {
          if (line.length < 50 && line.length > 3 && (line === line.toUpperCase() || line.match(/^[A-Z]/))) {
            heading = line;
            break;
          }
        }
        if (heading === "Scanned receipt" && lines[0]) heading = lines[0];
      }
      setDescription(heading);
      alert("Receipt scanned successfully!");
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Failed to scan receipt. Please try again with a clearer image.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Navbar />
      <div className="expense-container">
        <div className="expense-sidebar-left">
          <div className="expense-card">
            <div className="expense-icon">💸</div>
            <h3>Expense Management</h3>
            <p>Track your daily expenses and manage your spending records.</p>
          </div>

          <div className="expense-card total-card">
            <div className="expense-icon">📊</div>
            <h3>Total Expenses</h3>
            <p className="total-amount">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="total-label">Total expenses recorded</p>
          </div>
        </div>

        <div className="expense-main">
          <div className="expense-form-card">
            <div className="form-header">
              <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>
              <p className="form-subtitle">Manage your expense entries</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows="3"
                />
              </div>

              <div className="voice-controls">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`btn-voice ${isRecording ? 'recording' : ''}`}
                  disabled={loading}
                >
                  {isRecording ? '🛑 Stop Recording' : '🎤 Start Voice Input'}
                </button>
                {fullTranscript && (
                  <div className="transcript-display">
                    <p><strong>Transcript:</strong> {fullTranscript}</p>
                    {extractedAmount && <p><strong>Extracted Amount:</strong> ₹{extractedAmount}</p>}
                    {extractedCategory && <p><strong>Extracted Category:</strong> {extractedCategory}</p>}
                  </div>
                )}
              </div>

              <div className="ocr-controls">
                <label htmlFor="bill-upload" className="btn-ocr">
                  📷 Upload Bill 
                </label>
                <input
                  id="bill-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBillUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </div>

              <div className="button-group">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Processing..." : editingId ? "Update Expense" : "Add Expense"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="expense-list-card">
            <div className="list-header">
              <h3>All Expenses</h3>
              <span className="badge">{expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}</span>
            </div>

            {expensesLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🧾</div>
                <p>No expenses added yet.</p>
                <p className="empty-subtitle">Start by adding your first expense entry above!</p>
              </div>
            ) : (
              <div className="expense-items">
                {expenses
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(expense => (
                    <div key={expense._id} className={`expense-item ${editingId === expense._id ? 'editing' : ''}`}>
                      <div className="expense-info">
                        <span className="expense-category">{expense.category}</span>
                        <span className="expense-amount">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="expense-description">{expense.description || 'No description'}</span>
                        <span className="expense-date">{new Date(expense.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="expense-actions">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="btn-edit"
                          disabled={loading}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="btn-delete"
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="expense-sidebar-right">
          <div className="expense-card">
            <div className="expense-icon">🎙️</div>
            <h3>Voice Input</h3>
            <p>Use voice commands to quickly add expenses. Say things like "Spent 50 rupees on food".</p>
          </div>

          <div className="expense-card">
            <div className="expense-icon">📱</div>
            <h3>OCR Upload</h3>
            <p>Upload bill images to automatically extract amount and category using OCR.</p>
          </div>

          
        </div>
      </div>
    </>
  );
};

export default Expense;
