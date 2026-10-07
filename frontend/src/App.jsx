import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navbar mẫu tạm thời */}
        <header style={{ padding: '20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <h2 style={{ color: 'var(--color-primary)' }}>E-Commerce Shop</h2>
          </div>
        </header>

        {/* Nội dung chính sẽ render theo URL */}
        <main className="container" style={{ padding: '40px 16px', minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={
              <div>
                <h1>Chào mừng đến với cửa hàng!</h1>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  Giao diện đã được dọn dẹp và thiết lập bộ định tuyến (Router) thành công. Hãy bắt đầu code thôi!
                </p>
              </div>
            } />
          </Routes>
        </main>
        
        {/* Footer mẫu tạm thời */}
        <footer style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
          <p>&copy; 2026 E-Commerce Shop. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
