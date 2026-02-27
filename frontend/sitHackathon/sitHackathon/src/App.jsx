import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landingPage.jsx'
import LoginPage from './auth/login.jsx'
import OtpVerifyPage from './auth/otpVerify.jsx'
import Dashboard from './dashboard/dashboard.jsx'
import LoanConfiguration from './dashboard/loan.jsx'
import EmiSchedule from './dashboard/emiSchedule.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp-verify" element={<OtpVerifyPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/loan" element={<LoanConfiguration />} />
      <Route path = "/emiSchedule" element={<EmiSchedule />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
