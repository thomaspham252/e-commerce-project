import React from 'react';
import { FileText, Sparkles, Banknote, ArrowRight, Wrench } from 'lucide-react';
import { CANDIDATE_TOOLS } from '../../data/homeCandidateMockData';
import './CandidateToolsHome.css';

const ICON_MAP = {
  FileText,
  Sparkles,
  Banknote
};

export const CandidateToolsHome = () => {
  return (
    <section className="candidate-tools-section" id="candidate-tools-section">
      <div className="container">
        <div className="tools-section-head">
          <div className="tools-pill-tag">
            <Wrench size={14} strokeWidth={1.75} />
            <span>Hành trang nghề nghiệp</span>
          </div>
          <h2 className="tools-section-title">Công cụ đắc lực cho ứng viên</h2>
          <p className="tools-section-desc">
            Trang bị giải pháp hỗ trợ hoàn chỉnh giúp bạn nâng tầm hồ sơ và tự tin tiếp cận nhà tuyển dụng
          </p>
        </div>

        <div className="candidate-tools-grid">
          {CANDIDATE_TOOLS.map((tool) => {
            const IconComponent = ICON_MAP[tool.iconName] || FileText;
            return (
              <div key={tool.id} className="candidate-tool-card">
                <div className="tool-card-icon-wrapper">
                  <IconComponent size={26} strokeWidth={1.75} />
                </div>

                <div className="tool-card-body">
                  <h3 className="tool-card-title">{tool.title}</h3>
                  <p className="tool-card-desc">{tool.description}</p>
                </div>

                <div className="tool-card-footer">
                  <a href={tool.link} className="tool-action-btn">
                    <span>{tool.actionText}</span>
                    <ArrowRight size={15} strokeWidth={1.75} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
