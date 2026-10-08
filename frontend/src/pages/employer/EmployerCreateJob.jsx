import { JobForm } from '../../components/common/JobForm';
import { useNavigate } from 'react-router-dom';

export const EmployerCreateJob = () => {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log('Dữ liệu form:', data);
    alert('Đăng tin thành công! Tin của bạn đang chờ duyệt.');
    navigate('/employer/jobs');
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Đăng tin tuyển dụng mới</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Điền thông tin chi tiết để thu hút ứng viên phù hợp nhất.
          </p>
        </div>
      </div>
      
      <JobForm onSubmit={handleSubmit} isLoading={false} />
    </>
  );
};
