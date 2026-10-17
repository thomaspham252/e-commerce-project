import './StatCard.css';

export const StatCard = ({ title, value, icon, trend, trendLabel }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value">{value}</div>
        </div>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
      {(trend || trendLabel) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {trendLabel && <span className="stat-card-trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};
