import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';

// Admin Imports
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminJobs } from '../pages/admin/AdminJobs';
import { AdminCompanies } from '../pages/admin/AdminCompanies';

// Employer Imports
import { EmployerLayout } from '../layouts/EmployerLayout';
import { EmployerDashboard } from '../pages/employer/EmployerDashboard';
import { EmployerJobs } from '../pages/employer/EmployerJobs';
import { EmployerCreateJob } from '../pages/employer/EmployerCreateJob';
import { EmployerApplications } from '../pages/employer/EmployerApplications';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dang-nhap" element={<AuthPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
        </Route>

        {/* Employer Routes */}
        <Route element={<EmployerLayout />}>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/jobs/create" element={<EmployerCreateJob />} />
          <Route path="/employer/applications" element={<EmployerApplications />} />
        </Route>
      </Routes>
    </Router>
  );
};

