import { useForm } from 'react-hook-form';
import './JobForm.css';

export const JobForm = ({ initialData, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: '',
      category: '',
      level: '',
      quantity: 1,
      experience: '',
      location: '',
      type: 'Toàn thời gian',
      salary: '',
      description: '',
      requirements: '',
      benefits: '',
      deadline: '',
    }
  });

  return (
    <form className="job-form" onSubmit={handleSubmit(onSubmit)}>
      {/* SECTION 1: Thông tin công việc */}
      <div className="form-section">
        <h3 className="section-title">Thông tin công việc</h3>
        
        <div className="form-row">
          <div className="form-group full-width">
            <label>Tên công việc <span className="required">*</span></label>
            <input 
              type="text" 
              className={errors.title ? 'error' : ''}
              placeholder="VD: Frontend Developer" 
              {...register('title', { required: 'Vui lòng nhập tên công việc' })} 
            />
            {errors.title && <span className="error-message">{errors.title.message}</span>}
          </div>
        </div>

        <div className="form-row three-cols">
          <div className="form-group">
            <label>Ngành nghề <span className="required">*</span></label>
            <select className={errors.category ? 'error' : ''} {...register('category', { required: 'Vui lòng chọn ngành nghề' })}>
              <option value="">Chọn ngành nghề</option>
              <option value="IT - Phần mềm">IT - Phần mềm</option>
              <option value="Marketing">Marketing</option>
              <option value="Kinh doanh">Kinh doanh / Bán hàng</option>
              <option value="Thiết kế">Thiết kế (Design)</option>
            </select>
            {errors.category && <span className="error-message">{errors.category.message}</span>}
          </div>

          <div className="form-group">
            <label>Cấp bậc</label>
            <select {...register('level')}>
              <option value="Intern">Thực tập sinh (Intern)</option>
              <option value="Fresher">Mới tốt nghiệp (Fresher)</option>
              <option value="Junior">Nhân viên (Junior)</option>
              <option value="Senior">Chuyên viên (Senior)</option>
              <option value="Manager">Quản lý (Manager)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số lượng tuyển</label>
            <input type="number" min="1" {...register('quantity')} />
          </div>
        </div>
      </div>

      {/* SECTION 2: Địa điểm & Hình thức */}
      <div className="form-section">
        <h3 className="section-title">Địa điểm & Hình thức</h3>
        <div className="form-row three-cols">
          <div className="form-group">
            <label>Địa điểm làm việc <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="VD: Quận 1, TP.HCM"
              className={errors.location ? 'error' : ''}
              {...register('location', { required: 'Vui lòng nhập địa điểm' })} 
            />
            {errors.location && <span className="error-message">{errors.location.message}</span>}
          </div>
          
          <div className="form-group">
            <label>Hình thức làm việc</label>
            <select {...register('type')}>
              <option value="Toàn thời gian">Toàn thời gian</option>
              <option value="Bán thời gian">Bán thời gian</option>
              <option value="Làm từ xa (Remote)">Làm từ xa (Remote)</option>
              <option value="Hybrid">Linh hoạt (Hybrid)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Mức lương</label>
            <input type="text" placeholder="VD: 15 - 20 triệu / Thỏa thuận" {...register('salary')} />
          </div>
        </div>
      </div>

      {/* SECTION 3: Nội dung */}
      <div className="form-section">
        <h3 className="section-title">Chi tiết công việc</h3>
        <div className="form-group full-width">
          <label>Mô tả công việc <span className="required">*</span></label>
          <textarea 
            rows="5" 
            placeholder="Mô tả các nhiệm vụ và công việc cần làm..."
            className={errors.description ? 'error' : ''}
            {...register('description', { required: 'Vui lòng nhập mô tả công việc' })}
          ></textarea>
          {errors.description && <span className="error-message">{errors.description.message}</span>}
        </div>

        <div className="form-group full-width">
          <label>Yêu cầu ứng viên</label>
          <textarea rows="4" placeholder="Kinh nghiệm, kỹ năng cần thiết..." {...register('requirements')}></textarea>
        </div>

        <div className="form-group full-width">
          <label>Quyền lợi</label>
          <textarea rows="4" placeholder="Chế độ đãi ngộ, bảo hiểm, thưởng..." {...register('benefits')}></textarea>
        </div>
      </div>

      {/* SECTION 4: Thời gian */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label>Hạn nộp hồ sơ <span className="required">*</span></label>
            <input 
              type="date" 
              className={errors.deadline ? 'error' : ''}
              {...register('deadline', { required: 'Vui lòng chọn hạn nộp hồ sơ' })} 
            />
            {errors.deadline && <span className="error-message">{errors.deadline.message}</span>}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" disabled={isLoading}>Hủy</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Đang lưu...' : (initialData ? 'Cập nhật tin' : 'Đăng tin tuyển dụng')}
        </button>
      </div>
    </form>
  );
};
