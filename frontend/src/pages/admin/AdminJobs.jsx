import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminJobs = () => {
  const jobs = [
    { id: 1, title: 'Frontend Developer (React)', company: 'TechAsia', location: 'Hà Nội', salary: 25000000, status: 'Chờ duyệt', date: '08/10/2026', deadline: '31/10/2026' },
    { id: 2, title: 'Backend Node.js', company: 'FPT Software', location: 'TP.HCM', salary: 30000000, status: 'Đã duyệt', date: '07/10/2026', deadline: '15/11/2026' },
  ];

  const columns = [
    { header: 'Tên công việc', accessor: 'title', width: '25%' },
    { header: 'Doanh nghiệp', accessor: 'company', width: '20%' },
    { header: 'Địa điểm', accessor: 'location', width: '15%' },
    { header: 'Trạng thái', accessor: 'status', width: '15%', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Ngày đăng', accessor: 'date', width: '15%' },
    { 
      header: 'Thao tác', 
      width: '10%',
      render: (row) => (
        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Duyệt</button>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý tin tuyển dụng</h2>
      </div>

      <DataTable columns={columns} data={jobs} placeholder="Tìm kiếm tin tuyển dụng..." />
    </>
  );
};
