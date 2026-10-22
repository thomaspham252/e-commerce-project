import { useForm } from 'react-hook-form';
import { JOB_FORM_DEFAULTS } from '../../utils/jobFormValues';
import './JobForm.css';

/** Form tin tuyển dụng. Dùng utils/jobFormValues để chuyển đổi với dữ liệu backend. */
export const JobForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: initialData || JOB_FORM_DEFAULTS,
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
            <input
              type="number"
              min="1"
              className={errors.vacancies ? 'error' : ''}
              {...register('vacancies', { min: { value: 1, message: 'Tối thiểu 1 người' } })}
            />
            {errors.vacancies && <span className="error-message">{errors.vacancies.message}</span>}
          </div>

          <div className="form-group">
            <label>Thời gian làm việc</label>
            <input type="text" placeholder="VD: T2 - T6, 8h30 - 17h30" {...register('workingSchedule')} />
          </div>
        </div>
      </div>

      {/* SECTION 2: Địa điểm & Hình thức */}
      <div className="form-section">
        <h3 className="section-title">Địa điểm, hình thức & mức lương</h3>
        <div className="form-row">
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
            <select {...register('jobType')}>
              <option value="Toàn thời gian">Toàn thời gian</option>
              <option value="Bán thời gian">Bán thời gian</option>
              <option value="Làm từ xa (Remote)">Làm từ xa (Remote)</option>
              <option value="Hybrid">Linh hoạt (Hybrid)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lương tối thiểu (triệu/tháng)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Bỏ trống = Thỏa thuận"
              className={errors.salaryMin ? 'error' : ''}
              {...register('salaryMin', { min: { value: 0, message: 'Lương không được âm' } })}
            />
            {errors.salaryMin && <span className="error-message">{errors.salaryMin.message}</span>}
          </div>
          <div className="form-group">
            <label>Lương tối đa (triệu/tháng)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Bỏ trống = Thỏa thuận"
              className={errors.salaryMax ? 'error' : ''}
              {...register('salaryMax', {
                validate: (v) => {
                  const min = getValues('salaryMin');
                  return v === '' || min === '' || Number(v) >= Number(min) || 'Lương tối đa phải ≥ lương tối thiểu';
                },
              })}
            />
            {errors.salaryMax && <span className="error-message">{errors.salaryMax.message}</span>}
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
            placeholder="Mô tả các nhiệm vụ, công việc cần làm và quyền lợi..."
            className={errors.description ? 'error' : ''}
            {...register('description', { required: 'Vui lòng nhập mô tả công việc' })}
          ></textarea>
          {errors.description && <span className="error-message">{errors.description.message}</span>}
        </div>

        <div className="form-group full-width">
          <label>Yêu cầu ứng viên</label>
          <textarea rows="4" placeholder="Kinh nghiệm, kỹ năng cần thiết..." {...register('requirements')}></textarea>
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
        <button type="button" className="btn btn-outline" disabled={isLoading} onClick={onCancel}>Hủy</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Đang lưu...' : (initialData ? 'Cập nhật tin' : 'Đăng tin tuyển dụng')}
        </button>
      </div>
    </form>
  );
};
