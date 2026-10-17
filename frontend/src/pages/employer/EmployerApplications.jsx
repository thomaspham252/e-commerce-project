import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const EmployerApplications = () => {
  const applications = [
    { id: 1, applicantName: 'Nguyễn Văn A', jobTitle: 'Frontend Developer', date: '08/10/2026', status: 'Đã ứng tuyển' },
    { id: 2, applicantName: 'Trần Thị B', jobTitle: 'Frontend Developer', date: '07/10/2026', status: 'Đang xem xét' },
    { id: 3, applicantName: 'Lê Văn C', jobTitle: 'Backend Node.js', date: '05/10/2026', status: 'Phỏng vấn' },
  ];

  const columns = [
    { header: 'Ứng viên', accessor: 'applicantName', width: '25%' },
    { header: 'Vị trí ứng tuyển', accessor: 'jobTitle', width: '25%' },
    { header: 'Ngày ứng tuyển', accessor: 'date', width: '15%' },
    { header: 'Trạng thái', accessor: 'status', width: '15%', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Thao tác', 
      width: '20%',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Xem CV</button>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Cập nhật</button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý hồ sơ ứng viên</h2>
      </div>

      <DataTable columns={columns} data={applications} placeholder="Tìm kiếm tên ứng viên..." />
    </>
  );
};
