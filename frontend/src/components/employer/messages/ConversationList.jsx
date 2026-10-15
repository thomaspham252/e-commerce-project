import React from 'react';
import { Search, X, MessageSquare, Inbox } from 'lucide-react';
import { ConversationItem } from './ConversationItem';

/**
 * Component hiển thị danh sách hội thoại bên trái
 * Tích hợp tìm kiếm tức thì, bộ lọc Tất cả / Chưa đọc và Empty State
 */
export const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalUnreadCount
}) => {
  return (
    <div className="conversation-list-pane">
      {/* Header của danh sách */}
      <div className="conversation-list-header">
        <div className="list-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} className="brand-icon" />
            <h3 className="list-title">Hội thoại tuyển dụng</h3>
          </div>
          {totalUnreadCount > 0 && (
            <span className="unread-total-pill">
              {totalUnreadCount} chưa đọc
            </span>
          )}
        </div>

        {/* Ô tìm kiếm */}
        <div className="msg-search-box-wrapper">
          <Search size={16} className="msg-search-icon" />
          <input
            type="text"
            className="msg-search-input"
            placeholder="Tìm theo tên ứng viên hoặc vị trí..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="msg-clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tab bộ lọc: Tất cả / Chưa đọc */}
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => onFilterChange('unread')}
          >
            Chưa đọc
            {totalUnreadCount > 0 && (
              <span className="tab-badge">{totalUnreadCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Danh sách các cuộc hội thoại cuộn */}
      <div className="conversation-scroll-area">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        ) : (
          <div className="empty-conversation-state">
            <Inbox size={40} className="empty-icon" />
            <p className="empty-title">
              {searchQuery
                ? 'Không tìm thấy cuộc trò chuyện phù hợp'
                : filter === 'unread'
                ? 'Bạn không có tin nhắn chưa đọc nào'
                : 'Chưa có cuộc hội thoại nào'}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => onSearchChange('')}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
