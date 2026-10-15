import React from 'react';
import {
  Monitor,
  Calculator,
  Megaphone,
  ShoppingCart,
  Building2,
  Compass,
  Briefcase,
  Headphones,
  LayoutGrid
} from 'lucide-react';
import { HIGHLIGHT_CATEGORIES } from '../../data/homeCandidateMockData';
import './HighlightCategoriesHome.css';

const ICON_MAP = {
  Monitor,
  Calculator,
  Megaphone,
  ShoppingCart,
  Building2,
  Compass,
  Briefcase,
  Headphones
};

export const HighlightCategoriesHome = () => {
  return (
    <section className="highlight-categories-section">
      <div className="container">
        <div className="categories-section-head">
          <div className="categories-pill-tag">
            <LayoutGrid size={14} strokeWidth={1.75} />
            <span>Thị trường lao động</span>
          </div>
          <h2 className="categories-section-title">Ngành nghề nổi bật</h2>
          <p className="categories-section-desc">
            Khám phá các lĩnh vực nghề nghiệp thu hút nhiều lượt tuyển dụng và ứng tuyển nhất hiện nay
          </p>
        </div>

        <div className="highlight-categories-grid">
          {HIGHLIGHT_CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || Briefcase;
            return (
              <div key={cat.id} className="category-tile-card">
                <div className="category-tile-icon-box">
                  <IconComponent size={24} strokeWidth={1.75} />
                </div>
                <div className="category-tile-info">
                  <h3 className="category-tile-title">{cat.name}</h3>
                  <span className="category-tile-jobs">{cat.jobCount} việc làm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
