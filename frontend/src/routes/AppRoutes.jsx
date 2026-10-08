import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';

// Payment Imports (Shared VietQR SePay)
import { PaymentPage } from '../pages/payment/PaymentPage';
import { PaymentResultPage } from '../pages/payment/PaymentResultPage';

// Candidate Imports (Ví Token)
import { CandidateWalletPage } from '../pages/candidate/CandidateWalletPage';

// Admin Imports
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminJobs } from '../pages/admin/AdminJobs';
import { AdminCompanies } from '../pages/admin/AdminCompanies';
import { AdminPayments } from '../pages/admin/AdminPayments';
import { AdminRevenuePage } from '../pages/admin/AdminRevenuePage.jsx';
import { AdminPackagesPage } from '../pages/admin/AdminPackagesPage.jsx';
import { AdminTokenConfigPage } from '../pages/admin/AdminTokenConfigPage.jsx';

// Employer Imports
import { EmployerLayout } from '../layouts/EmployerLayout';
import { EmployerDashboard } from '../pages/employer/EmployerDashboard';
import { EmployerJobs } from '../pages/employer/EmployerJobs';
import { EmployerCreateJob } from '../pages/employer/EmployerCreateJob';
import { EmployerApplications } from '../pages/employer/EmployerApplications';
import { EmployerPricingPage } from '../pages/employer/EmployerPricingPage.jsx';
import { EmployerSubscriptionPage } from '../pages/employer/EmployerSubscriptionPage.jsx';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dang-nhap" element={<AuthPage />} />
        
        {/* Main Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/thanh-toan" element={<PaymentPage />} />
          <Route path="/thanh-toan/:orderId" element={<PaymentPage />} />
          <Route path="/thanh-toan/ket-qua/:orderId" element={<PaymentResultPage />} />
          <Route path="/candidate/wallet" element={<CandidateWalletPage />} />
          <Route path="/ung-vien/vi-token" element={<CandidateWalletPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/revenue" element={<AdminRevenuePage />} />
          <Route path="/admin/packages" element={<AdminPackagesPage />} />
          <Route path="/admin/token-config" element={<AdminTokenConfigPage />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/transactions" element={<AdminPayments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
        </Route>

        {/* Employer Routes */}
        <Route element={<EmployerLayout />}>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/employer/pricing" element={<EmployerPricingPage />} />
          <Route path="/employer/subscription" element={<EmployerSubscriptionPage />} />
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/jobs/create" element={<EmployerCreateJob />} />
          <Route path="/employer/applications" element={<EmployerApplications />} />
        </Route>
      </Routes>
    </Router>
  );
};
