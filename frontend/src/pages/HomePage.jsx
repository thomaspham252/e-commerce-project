import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { CategoryCard } from '../components/CategoryCard';
import { CompanyCard } from '../components/CompanyCard';
import { useJobs } from '../hooks/useJobs';
import { jobService } from '../services/jobService';
import { useState, useEffect } from 'react';
import { Rocket, Shield, Lightbulb } from 'lucide-react';
import './HomePage.css';

export const HomePage = () => {
  const { jobs, loading, error, fetchJobs } = useJobs();
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const [cats, comps] = await Promise.all([
          jobService.getCategories(),
          jobService.getCompanies()
        ]);
        setCategories(cats);
        setCompanies(comps);
      } catch (err) {
        console.error("Failed to load categories or companies", err);
      } finally {
        setLoadingExtras(false);
      }
    };
    fetchExtras();
  }, []);

  const handleSearch = (keyword, location) => {
    fetchJobs(keyword, location);
  };

  return (
    <div className="home-page">
      <SearchBar onSearch={handleSearch} />
      
      {/* Categories Grid */}
      <div className="section-container fade-in">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ngành nghề nổi bật</h2>
            <a href="#" className="view-all">Xem tất cả &rarr;</a>
          </div>
          {loadingExtras ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="category-grid">
              {categories.map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="section-container fade-in" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Việc làm nổi bật</h2>
            <a href="#" className="view-all">Xem tất cả &rarr;</a>
          </div>
        
        {loading && <div className="loading">Đang tải dữ liệu...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Không tìm thấy kết quả phù hợp với tiêu chí của bạn.</p>
            <button className="btn btn-primary mt-4" onClick={() => fetchJobs('', '')}>
              Xem tất cả việc làm
            </button>
          </div>
        )}

        <div className="job-list-grid">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
      </div>

      {/* Features / Why Choose Us */}
      <div className="section-container fade-in" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Vì sao chọn JobViet</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#DBEAFE' }}>
                <Rocket size={32} color="#3B82F6" />
              </div>
              <h3>Ứng tuyển nhanh</h3>
              <p>Tạo CV và ứng tuyển ngay chỉ với 1 cú click. Tiết kiệm thời gian, gia tăng cơ hội.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#D1FAE5' }}>
                <Shield size={32} color="#10B981" />
              </div>
              <h3>Công ty uy tín</h3>
              <p>Hàng ngàn doanh nghiệp hàng đầu đã được xác thực, đảm bảo quyền lợi ứng viên.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#FEF3C7' }}>
                <Lightbulb size={32} color="#F59E0B" />
              </div>
              <h3>Gợi ý thông minh</h3>
              <p>Hệ thống AI tự động đề xuất việc làm phù hợp nhất với kỹ năng và định hướng của bạn.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="section-container fade-in">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-content">
              <h2>Bạn là nhà tuyển dụng?</h2>
              <p>Đăng tin tuyển dụng ngay để tiếp cận hàng triệu ứng viên tiềm năng trên toàn quốc.</p>
              <button className="btn btn-primary cta-btn">Đăng tin tuyển dụng</button>
            </div>
            <div className="cta-image">
              <img src="/images/recruiter-banner.png" alt="Nhà tuyển dụng" style={{ borderRadius: '16px', objectFit: 'cover' }} />
              <div className="cta-floating-card c-1">✨ 2.000 hồ sơ mới/ngày</div>
              <div className="cta-floating-card c-2">⚡ Đăng tin miễn phí</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Companies Grid */}
      <div className="section-container fade-in" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nhà tuyển dụng hàng đầu</h2>
            <a href="#" className="view-all">Xem tất cả &rarr;</a>
          </div>
          {loadingExtras ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="company-grid">
              {companies.map(comp => (
                <CompanyCard key={comp.id} company={comp} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div className="section-container fade-in">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cảm nhận từ ứng viên</h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                id: 1,
                name: "Nguyễn Văn A",
                role: "Product Manager",
                quote: "Nhờ JobViet mà tôi đã tìm được công việc mơ ước chỉ sau 2 tuần. Giao diện rất dễ sử dụng và tính năng gợi ý cực kỳ thông minh.",
                stars: "⭐⭐⭐⭐⭐",
                avatar: "/images/avatar-1.png"
              },
              {
                id: 2,
                name: "Trần Thị B",
                role: "Frontend Developer",
                quote: "Quá tuyệt vời! Tôi nhận được 3 lời mời phỏng vấn chỉ trong vài ngày. Chất lượng các nhà tuyển dụng ở đây rất đáng tin cậy.",
                stars: "⭐⭐⭐⭐",
                avatar: "/images/avatar-2.png"
              },
              {
                id: 3,
                name: "Lê Hoàng C",
                role: "Marketing Executive",
                quote: "Cực kỳ thích tính năng lọc thông minh và UI/UX của JobViet. Trải nghiệm tìm việc chưa bao giờ thú vị và nhanh chóng đến thế.",
                stars: "⭐⭐⭐⭐⭐",
                avatar: "/images/avatar-3.png"
              }
            ].map(test => (
              <div key={test.id} className="testimonial-card">
                <div className="stars">{test.stars}</div>
                <p className="quote">"{test.quote}"</p>
                <div className="author">
                  <img src={test.avatar} alt={test.name} className="avatar" />
                  <div>
                    <h4>{test.name}</h4>
                    <span>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blog / Cẩm nang */}
      <div className="section-container fade-in" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cẩm nang nghề nghiệp</h2>
            <a href="#" className="view-all">Xem tất cả &rarr;</a>
          </div>
          <div className="blog-grid">
            {[
              {
                id: 1,
                title: "Bí quyết viết CV chuẩn ATS chinh phục nhà tuyển dụng",
                date: "10 Tháng 10, 2026",
                category: "Kỹ năng mềm",
                image: "/images/blog-1.png"
              },
              {
                id: 2,
                title: "10 câu hỏi phỏng vấn thường gặp và cách trả lời",
                date: "08 Tháng 10, 2026",
                category: "Phỏng vấn",
                image: "/images/blog-2.png"
              },
              {
                id: 3,
                title: "Lộ trình thăng tiến cho Frontend Developer 2026",
                date: "05 Tháng 10, 2026",
                category: "Định hướng",
                image: "/images/image.png"
              }
            ].map(blog => (
              <div key={blog.id} className="blog-card">
                <div className="blog-cover-wrapper">
                  <img src={blog.image} alt={blog.title} className="blog-cover" />
                </div>
                <div className="blog-content">
                  <span className="badge badge-green" style={{ display: 'inline-block', marginBottom: '12px', backgroundColor: 'var(--color-primary)', color: 'white' }}>{blog.category}</span>
                  <span className="blog-date" style={{ display: 'block' }}>{blog.date}</span>
                  <h3>{blog.title}</h3>
                  <a href="#" className="blog-read-more">Đọc thêm &rarr;</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
