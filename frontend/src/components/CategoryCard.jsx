import React from 'react';
import './CategoryCard.css';
import { Icon } from './Icon';

/**
 * Thẻ Ngành nghề tuyển dụng
 * Thiết kế theo phong cách Minimalist Architectural Tile:
 * - Không dùng ô pastel lòe loẹt
 * - Icon chuẩn 28px với strokeWidth 1.75
 * - Viền tinh tế, hover chuyển màu emerald đặc trưng
 */
const getCategoryIconName = (id) => {
  switch (id) {
    case 'cat-1': return 'monitor';
    case 'cat-2': return 'calculator';
    case 'cat-3': return 'megaphone';
    case 'cat-4': return 'shopping-cart';
    default: return 'briefcase';
  }
};

export const CategoryCard = ({ category }) => {
  const iconName = category.iconName || getCategoryIconName(category.id);

  return (
    <div className="category-card">
      <div className="category-icon-wrapper">
        <Icon name={iconName} size="category" className="category-icon" />
      </div>
      <h3 className="category-name">{category.name}</h3>
      <span className="job-count-pill">{category.jobCount?.toLocaleString('vi-VN')} việc làm</span>
    </div>
  );
};
