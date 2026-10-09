import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Trash2, Lock, Unlock } from 'lucide-react';

export const AdminUsers = () => {
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'Ứng viên', status: 'Hoạt động', date: '01/10/2026' },
    { id: 2, name: 'Trần Thị B', email: 'thib@gmail.com', role: 'Ứng viên', status: 'Bị khóa', date: '05/10/2026' },
    { id: 3, name: 'HR TechAsia', email: 'hr@techasia.vn', role: 'Nhà tuyển dụng', status: 'Hoạt động', date: '08/10/2026' },
  ];

  const columns = [
    { header: 'Họ tên', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', accessor: 'role' },
    { header: 'Trạng thái', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Ngày đăng ký', accessor: 'date' },
    { 
      header: 'Thao tác', 
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Chi tiết</button>
          {row.status === 'Bị khóa' ? (
            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#10B981', borderColor: '#10B981' }}><Unlock size={14} /></button>
          ) : (
            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#EF4444', borderColor: '#EF4444' }}><Lock size={14} /></button>
          )}
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#EF4444', borderColor: '#EF4444' }}><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý người dùng</h2>
        <button className="btn btn-primary">Thêm người dùng mới</button>
      </div>

      <DataTable columns={columns} data={users} placeholder="Tìm kiếm theo tên hoặc email..." />
    </>
  );
};
