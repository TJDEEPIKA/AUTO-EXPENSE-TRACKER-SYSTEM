import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Expense from "./pages/Expense";
import Report from "./pages/Report";
import User from "./pages/User";
import Salary from "./pages/Salary";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expense />} />  {/* ✅ Add route */}
        <Route path="/reports" element={<Report />} />  {/* Add report route */}
        <Route path="/user" element={<User />} />  {/* Add user route */}
        <Route path="/salary" element={<Salary />} />  {/* Add salary route */}
      </Routes>
      <Chatbot />
    </>
  );
}

export default App;
