import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { EmailVerificationPage } from '../pages/EmailVerificationPage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dang-nhap" element={<AuthPage />} />
        <Route path="/xac-thuc-email" element={<EmailVerificationPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </Router>
  );
};
