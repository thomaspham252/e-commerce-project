import React, { useEffect, useState } from 'react';
import { publicStatsService } from '../../services/publicStatsService';
import { FiUsers, FiBriefcase, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

/**
 * Thống kê thực tế: Lấy dữ liệu trực tiếp từ API GET /api/public/stats từ backend Spring Boot.
 */
export const EmployerLandingStats = () => {
  const [stats, setStats] = useState({
    candidateCount: 0,
    companyCount: 0,
    jobCount: 0,
    applicationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    publicStatsService.getPublicStats()
      .then((data) => {
        if (isMounted && data) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải thống kê:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const formatNumber = (num) => {
    if (!num || num <= 0) return '0+';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    return `${num.toLocaleString('vi-VN')}+`;
  };

  const statItems = [
    {
      icon: <FiUsers className="stat-card-icon" />,
      value: formatNumber(stats.candidateCount),
      label: 'Hồ sơ Ứng viên sẵn sàng',
      desc: 'Ứng viên đa dạng từFresher đến C-Level'
    },
    {
      icon: <FiBriefcase className="stat-card-icon" />,
      value: formatNumber(stats.companyCount),
      label: 'Doanh nghiệp đồng hành',
      desc: 'Tin tưởng và tuyển dụng cùng JobViet'
    },
    {
      icon: <FiTrendingUp className="stat-card-icon" />,
      value: formatNumber(stats.jobCount),
      label: 'Vị trí việc làm hoạt động',
      desc: 'Cơ hội kết nối ứng viên và doanh nghiệp'
    },
    {
      icon: <FiCheckCircle className="stat-card-icon" />,
      value: formatNumber(stats.applicationCount),
      label: 'Lượt nộp hồ sơ thành công',
      desc: 'Quy trình kết nối trực tiếp, minh bạch'
    }
  ];

  return (
    <section className="employer-stats-section">
      <div className="employer-landing-container">
        <div className="stats-header">
          <span className="stats-tag">DỮ LIỆU THỰC TẾ HỆ THỐNG</span>
          <h2 className="stats-title">Sức mạnh kết nối của nền tảng JobViet</h2>
          <p className="stats-subtitle">
            Hàng nghìn doanh nghiệp đã tin tưởng lựa chọn JobViet làm đối tác tuyển dụng chiến lược.
          </p>
        </div>

        <div className="stats-grid">
          {statItems.map((item, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon-wrapper">{item.icon}</div>
              <div className="stat-value">{loading ? '...' : item.value}</div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

