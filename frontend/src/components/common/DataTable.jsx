import './DataTable.css';
import { Search } from 'lucide-react';

export const DataTable = ({ columns, data, onRowClick, searchable = true, placeholder = "Tìm kiếm..." }) => {
  return (
    <div className="data-table-container">
      {searchable && (
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder={placeholder} />
          </div>
          <div className="data-table-actions">
            {/* Filter buttons can go here */}
          </div>
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
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
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
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple pagination footer placeholder */}
      <div className="data-table-pagination">
        <span>Hiển thị 1 - {data.length} trong {data.length} kết quả</span>
        <div className="pagination-controls">
          <button className="btn btn-outline" disabled>Trang trước</button>
          <button className="btn btn-outline" disabled>Trang sau</button>
        </div>
      </div>
    </div>
  );
};
