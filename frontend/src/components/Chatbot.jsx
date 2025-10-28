import React, { useState } from 'react';
import './Chatbot.css'; // We'll create this for styling

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm the project assistant. Ask me anything about the Auto Expense Management System!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const getResponse = (question) => {
    const q = question.toLowerCase();
    // Expense Management
    if (q.includes('add') && q.includes('expense') && !q.includes('edit') && !q.includes('delete')) {
      return "You can add an expense by filling the form with amount, category, and description. Alternatively, use voice input by speaking details or upload a receipt image for OCR extraction.";
    } else if (q.includes('edit') && q.includes('expense')) {
      return "Editing expenses is not currently supported. This feature is planned for future updates.";
    } else if (q.includes('delete') && q.includes('expense')) {
      return "Deleting expenses is not currently supported. This feature is planned for future updates.";
    } else if (q.includes('video')) {
      return "No, currently there's no option to add a video while adding an expense. You can add a description or scan image receipts for automatic data extraction.";
    } else if ((q.includes('upload') && q.includes('image')) || q.includes('receipt')) {
      return "Yes, you can upload an image of your receipt on the Expense page for automatic scanning and data extraction.";
    } else if (q.includes('receipt') && q.includes('scan')) {
      return "Receipt scanning uses OCR technology to extract amount and category from uploaded images. Upload a receipt image on the Expense page.";
    } else if (q.includes('voice') && q.includes('command')) {
      return "Yes, you can add expenses using voice commands. Click the voice button on the Expense page and speak details like 'I spent 50 dollars on food'.";
    } else if (q.includes('recurring') && q.includes('expense')) {
      return "Recurring expenses are not currently supported. This feature is planned for future updates.";
    } else if (q.includes('categor') && !q.includes('custom') && !q.includes('other')) {
      return "Available categories: Food, Transport, Entertainment, Utilities, Shopping, Health, Education, Other.";
    } else if (q.includes('other') && q.includes('categor')) {
      return "The 'Other' category is for expenses that don't fit into the predefined categories like Food, Transport, Entertainment, etc.";
    } else if (q.includes('custom') && q.includes('categor')) {
      return "Custom categories are not currently supported. Use the predefined categories.";
    } else if (q.includes('budget') || (q.includes('monthly') && q.includes('amount'))) {
      return "You can add a monthly budget on the Dashboard page by entering an additional amount (e.g., your monthly income) in the 'Add Monthly Budget' form. This updates your remaining budget.";
    } else if (q.includes('note') || q.includes('description')) {
      return "Yes, you can add notes or descriptions when adding an expense.";
    } else if (q.includes('multiple') && q.includes('receipt')) {
      return "Attaching multiple receipts to one expense is not currently supported.";
    // Dashboard & Reports
    } else if (q.includes('dashboard') && !q.includes('report')) {
      return "The dashboard shows an overview of your expenses, including statistics, recent expenses, and a reports preview.";
    } else if (q.includes('monthly') && q.includes('summary')) {
      return "You can view monthly spending summaries on the Dashboard and generate detailed reports.";
    } else if (q.includes('download') || q.includes('export')) {
      return "Reports can be generated and viewed, but direct download/export is not currently supported.";
    } else if (q.includes('report') && q.includes('type')) {
      return "You can generate reports on spending patterns and categories.";
    } else if (q.includes('compare') && q.includes('month')) {
      return "Comparing expenses between months is available in the reports section.";
    } else if (q.includes('chart') || q.includes('graph')) {
      return "Yes, the dashboard and reports include charts and graphs for visualization.";
    } else if (q.includes('saving') || q.includes('balance')) {
      return "Tracking savings or balance is not directly supported; focus on expense tracking.";
    // Notifications & Reminders
    } else if (q.includes('notification') && !q.includes('turn off')) {
      return "You receive notifications for important updates, such as expense reminders or budget alerts.";
    } else if (q.includes('alert') && q.includes('overspend')) {
      return "Overspending alerts are not currently supported.";
    } else if (q.includes('reminder')) {
      return "Setting reminders for bills or payments is not currently supported.";
    } else if (q.includes('turn off') && q.includes('notification')) {
      return "Notification settings are not customizable yet.";
    } else if (q.includes('email') && q.includes('summary')) {
      return "Email summaries are not currently supported.";
    // Voice & AI Features
    } else if (q.includes('voice') && q.includes('work')) {
      return "Voice input uses the browser's speech recognition to extract expense details.";
    } else if (q.includes('language') && q.includes('voice')) {
      return "Voice input supports English (en-US).";
    } else if (q.includes('add') && q.includes('speak')) {
      return "Yes, speak details like 'I spent 50 dollars on food' to add expenses.";
    } else if (q.includes('offline') && q.includes('voice')) {
      return "Voice input requires an internet connection for speech recognition.";
    } else if (q.includes('accurate') && q.includes('voice')) {
      return "Voice recognition accuracy depends on clarity and browser support.";
    // Data & Analytics
    } else if (q.includes('total') && q.includes('categor')) {
      return "You can view totals per category in the dashboard stats and reports.";
    } else if (q.includes('highest') && q.includes('categor')) {
      return "Reports show spending by category to identify the highest.";
    } else if (q.includes('filter')) {
      return "Filtering by date or amount is available in reports.";
    } else if (q.includes('visualize') || q.includes('graph')) {
      return "Expenses are visualized using charts in the dashboard and reports.";
    } else if (q.includes('trend')) {
      return "Spending trends can be seen in reports and dashboard overviews.";
    // Account & Security
    } else if (q.includes('sign up')) {
      return "Click 'Signup' to create an account with email and password.";
    } else if (q.includes('forget') && q.includes('password')) {
      return "Password reset is not implemented yet; contact support.";
    } else if (q.includes('update') && q.includes('email')) {
      return "Updating email or username is not currently supported.";
    } else if (q.includes('safe') || q.includes('encrypt')) {
      return "Your data is stored securely, but encryption details are not specified.";
    } else if (q.includes('multiple') && q.includes('user')) {
      return "Each account is for a single user; shared accounts are not recommended.";
    // App Features & Settings
    } else if (q.includes('main') && q.includes('feature')) {
      return "Key features: Add expenses via form/voice/scan, dashboard stats, reports, notifications, user management.";
    } else if (q.includes('first') && q.includes('use')) {
      return "Sign up, log in, then start adding expenses on the Expense page.";
    } else if (q.includes('help') || q.includes('tutorial')) {
      return "Help is available via this chatbot; tutorials are not built-in.";
    } else if (q.includes('theme') || q.includes('dark')) {
      return "Theme switching (dark/light mode) is not currently supported.";
    } else if (q.includes('profile')) {
      return "Manage your profile on the User page.";
    } else if (q.includes('currenc')) {
      return "Multiple currencies are not supported; assumes default currency.";
    } else if (q.includes('multilingual')) {
      return "Currently, the app is only available in English. Multilingual support is not implemented yet.";
    } else if (q.includes('sync')) {
      return "Data syncing across devices is not supported.";
    } else if (q.includes('delete') && q.includes('account')) {
      return "Account deletion is not currently supported.";
    } else if (q.includes('workflow') || (q.includes('explain') && q.includes('app'))) {
      return "The app's workflow: 1. Sign up or log in. 2. Add expenses manually, via voice commands, or by scanning receipts. 3. View expense summaries and stats on the Dashboard. 4. Generate detailed reports. 5. Manage your profile and receive notifications.";
    } else {
      return "I'm here to help with questions about the Auto Expense Management System. Try asking about adding expenses, features like voice input or receipt scanning, or other app functionalities!";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const botResponse = { text: getResponse(input), sender: 'bot' };
    setMessages(prev => [...prev, botResponse]);
    setInput('');
  };

  return (
    <>
      {!isOpen && (
        <div className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </div>
      )}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span>Project Assistant</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
