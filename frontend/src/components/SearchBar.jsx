import './SearchBar.css';
import { useState, useEffect } from 'react';

const BANNERS = [
  '/images/banner1.png',
  '/images/banner2.png',
  '/images/banner3.png'
];

export const SearchBar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(keyword, location);
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    onSearch(suggestion, location);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  return (
    <div className="search-hero">
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>
      
      <div className="container search-hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Tìm kiếm công việc<br/>mơ ước của bạn</h1>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Nhập từ khóa việc làm..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-divider"></div>
            <div className="search-input-group">
              <span className="search-icon">📍</span>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-select"
              >
                <option value="">Tất cả địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary search-btn">Tìm kiếm</button>
          </form>
          
          <div className="search-suggestions">
            <span className="suggestion-label">Gợi ý:</span>
            <span className="suggestion-badge" onClick={() => handleSuggestionClick('React')}>React</span>
            <span className="suggestion-badge" onClick={() => handleSuggestionClick('Java')}>Java</span>
            <span className="suggestion-badge" onClick={() => handleSuggestionClick('Designer')}>Designer</span>
          </div>

          <div className="hero-stats">
            <div className="stat-item"><strong>10.000+</strong> việc làm</div>
            <span className="stat-dot">·</span>
            <div className="stat-item"><strong>2.000+</strong> công ty</div>
            <span className="stat-dot">·</span>
            <div className="stat-item"><strong>500K+</strong> ứng viên</div>
          </div>
        </div>
        
        <div className="hero-illustration">
          <div className="banner-slider">
            <img src={BANNERS[currentBanner]} alt={`Banner ${currentBanner + 1}`} className="banner-image" />
            <button className="slider-btn prev-btn" onClick={prevBanner}>&#10094;</button>
            <button className="slider-btn next-btn" onClick={nextBanner}>&#10095;</button>
            <div className="slider-dots">
              {BANNERS.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === currentBanner ? 'active' : ''}`}
                  onClick={() => setCurrentBanner(idx)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#ffffff" fillOpacity="1"></path>
        </svg>
      </div>
    </div>
  );
};
