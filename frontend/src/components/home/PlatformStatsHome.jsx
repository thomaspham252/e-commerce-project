import React from 'react';
import { Briefcase, Building2, Users, ShieldCheck } from 'lucide-react';
import { PLATFORM_STATS } from '../../data/homeCandidateMockData';
import './PlatformStatsHome.css';

const ICON_MAP = {
  Briefcase,
  Building2,
  Users,
  ShieldCheck
};

export const PlatformStatsHome = () => {
  return (
    <section className="platform-stats-section">
      <div className="container">
        <div className="stats-inner-wrapper">
          <div className="stats-grid">
            {PLATFORM_STATS.map((stat) => {
              const IconComponent = ICON_MAP[stat.iconName] || Briefcase;
              return (
                <div key={stat.id} className="stat-item-block">
                  <div className="stat-icon-bubble">
                    <IconComponent size={22} strokeWidth={1.75} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-metric-value">{stat.value}</span>
                    <span className="stat-metric-label">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
