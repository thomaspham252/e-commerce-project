import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployerJobs = () => {
  const navigate = useNavigate();
  
  const jobs = [
    { id: 1, title: 'Frontend Developer (React)', applicants: 12, location: 'Hà Nội', salary: '25 triệu', status: 'Đã duyệt', date: '08/10/2026', deadline: '31/10/2026' },
    { id: 2, title: 'Backend Node.js', applicants: 5, location: 'Hà Nội', salary: 'Thỏa thuận', status: 'Chờ duyệt', date: '07/10/2026', deadline: '15/11/2026' },
  ];

  const columns = [
    { header: 'Tên công việc', accessor: 'title', width: '30%' },
    { header: 'Ứng viên', accessor: 'applicants', width: '10%', render: (row) => <strong>{row.applicants}</strong> },
    { header: 'Địa điểm', accessor: 'location', width: '15%' },
    { header: 'Trạng thái', accessor: 'status', width: '15%', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Hạn nộp', accessor: 'deadline', width: '15%' },
    { 
      header: 'Thao tác', 
      width: '15%',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Sửa</button>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#EF4444', borderColor: '#EF4444' }}>Xóa</button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tin tuyển dụng của tôi</h2>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => navigate('/employer/jobs/create')}
        >
          <PlusCircle size={18} /> Đăng tin mới
        </button>
      </div>

      <DataTable columns={columns} data={jobs} placeholder="Tìm kiếm tin tuyển dụng của bạn..." />
    </>
  );
};
