import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/landingPage.jsx'
import LoginPage from './auth/login.jsx'
import OtpVerifyPage from './auth/otpVerify.jsx'
import AadhaarStep from './onBoarding/aadhar.jsx'
import GstStep from './onBoarding/gst.jsx'
import KycReviewStep from './onBoarding/review.jsx'
import Dashboard from './dashboard/dashboard.jsx'
import InvoicesPage from './dashboard/invoices.jsx'
import LoanConfiguration from './dashboard/loan.jsx'
import EmiSchedule from './dashboard/emiSchedule.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp-verify" element={<OtpVerifyPage />} />
      <Route path="/onboarding/aadhaar" element={<AadhaarStep />} />
      <Route path="/onboarding/gst" element={<GstStep />} />
      <Route path="/onboarding/review" element={<KycReviewStep />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/loan" element={<LoanConfiguration />} />
      <Route path = "/emiSchedule" element={<EmiSchedule />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
