import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileLayout } from './layouts/MobileLayout';

import Login from './pages/auth/Login';
import Onboarding from './pages/onboarding/Onboarding';
import Dashboard from './pages/home/Dashboard';
import Invoices from './pages/action/Invoices';
import Loans from './pages/credit/Loans';
import Profile from './pages/auth/Profile';
import Repayments from './pages/action/Repayments';
import CreditScorePage from './pages/credit/CreditScore';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Auth route */}
        <Route path="/login" element={<Login />} />

        {/* Onboarding Flow without Bottom Nav */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected App layout */}
        <Route path="/" element={<MobileLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="loans" element={<Loans />} />
          <Route path="repayments" element={<Repayments />} />
          <Route path="credit-score" element={<CreditScorePage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
