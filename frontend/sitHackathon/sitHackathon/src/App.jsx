import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './auth/login.jsx'
import Dashboard from './dashboard/dashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App
