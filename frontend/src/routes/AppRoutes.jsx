import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dang-nhap" element={<AuthPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </Router>
  );
};
