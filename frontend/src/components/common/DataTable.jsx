import './DataTable.css';
import { Search } from 'lucide-react';

/**
 * Bảng dữ liệu dùng chung.
 * - Không truyền `pagination` / `onSearchChange`: hoạt động như cũ (dữ liệu tĩnh).
 * - `pagination` = { page, size, totalElements, totalPages, onPageChange } (page bắt đầu từ 0, khớp PageResponse của backend).
 * - `filters`: phần tử đặt bên phải ô tìm kiếm (VD: select lọc trạng thái).
 */
export const DataTable = ({
  columns,
  data,
  onRowClick,
  searchable = true,
  placeholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  filters,
  loading = false,
  pagination,
  emptyText = 'Không có dữ liệu',
}) => {
  const from = pagination ? (pagination.totalElements === 0 ? 0 : pagination.page * pagination.size + 1) : 1;
  const to = pagination ? pagination.page * pagination.size + data.length : data.length;
  const total = pagination ? pagination.totalElements : data.length;

  return (
    <div className="data-table-container">
      {(searchable || filters) && (
        <div className="data-table-toolbar">
          {searchable && (
            <div className="data-table-search">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
              />
            </div>
          )}
          <div className="data-table-actions">{filters}</div>
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center empty-state">Đang tải dữ liệu...</td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center empty-state">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-pagination">
        <span>Hiển thị {from} - {to} trong {total} kết quả</span>
        <div className="pagination-controls">
          <button
            className="btn btn-outline"
            disabled={!pagination || pagination.page <= 0 || loading}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            Trang trước
          </button>
          <button
            className="btn btn-outline"
            disabled={!pagination || pagination.page + 1 >= pagination.totalPages || loading}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
};
