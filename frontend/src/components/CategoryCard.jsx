import './CategoryCard.css';
import { Monitor, Calculator, Megaphone, ShoppingCart } from 'lucide-react';

const getCategoryIcon = (id) => {
  switch(id) {
    case 'cat-1': return <Monitor size={36} color="#3B82F6" />;
    case 'cat-2': return <Calculator size={36} color="#10B981" />;
    case 'cat-3': return <Megaphone size={36} color="#F59E0B" />;
    case 'cat-4': return <ShoppingCart size={36} color="#EF4444" />;
    default: return <Monitor size={36} color="#6B7280" />;
  }
};

const getCategoryBg = (id) => {
  switch(id) {
    case 'cat-1': return '#DBEAFE';
    case 'cat-2': return '#D1FAE5';
    case 'cat-3': return '#FEF3C7';
    case 'cat-4': return '#FEE2E2';
    default: return '#F3F4F6';
  }
};

export const CategoryCard = ({ category }) => {
  return (
    <div className="category-card">
      <div className="category-icon" style={{ backgroundColor: getCategoryBg(category.id) }}>
        {getCategoryIcon(category.id)}
      </div>
      <h3 className="category-name">{category.name}</h3>
      <p className="job-count">{category.jobCount} việc làm</p>
    </div>
  );
};
