import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminCompanies = () => {
  const companies = [
    { id: 1, name: 'TechAsia', email: 'contact@techasia.vn', address: 'Quận Cầu Giấy, Hà Nội', status: 'Hoạt động', date: '01/01/2026' },
    { id: 2, name: 'FPT Software', email: 'hr@fpt.com.vn', address: 'Quận 9, TP.HCM', status: 'Hoạt động', date: '15/05/2025' },
    { id: 3, name: 'ScamCompany', email: 'scam@fake.com', address: 'Không rõ', status: 'Chờ duyệt', date: '08/10/2026' },
  ];

  const columns = [
    { header: 'Doanh nghiệp', accessor: 'name', width: '25%' },
    { header: 'Email', accessor: 'email', width: '20%' },
    { header: 'Địa chỉ', accessor: 'address', width: '25%' },
    { header: 'Trạng thái', accessor: 'status', width: '15%', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Thao tác', 
      width: '15%',
      render: (row) => (
        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Chi tiết</button>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý doanh nghiệp</h2>
      </div>

      <DataTable columns={columns} data={companies} placeholder="Tìm kiếm doanh nghiệp..." />
    </>
  );
};
