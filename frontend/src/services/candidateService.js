import { apiClient } from './apiClient';
import { formatSalaryRange } from '../utils/formatSalary';
import { APPLICATION_STATUS } from './candidateData';

/** Trạng thái đơn ở backend → nhãn hiển thị cho ứng viên. */
const STATUS_LABEL = {
  PENDING: APPLICATION_STATUS.SUBMITTED,
  VIEWED: APPLICATION_STATUS.REVIEWING,
  INVITED: APPLICATION_STATUS.INTERVIEW,
  REJECTED: APPLICATION_STATUS.REJECTED,
  HIRED: APPLICATION_STATUS.HIRED,
};

/** Đơn chỉ rút được khi NTD chưa ra quyết định (khớp với backend). */
const WITHDRAWABLE = ['PENDING', 'VIEWED'];

const pad = (v) => String(v).padStart(2, '0');

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ngày ${formatDate(iso)}`;
};

const buildNote = (a) => {
  switch (a.status) {
    case 'PENDING':
      return 'Hồ sơ đã được gửi, chờ nhà tuyển dụng xem xét.';
    case 'VIEWED':
      return 'Nhà tuyển dụng đã xem hồ sơ của bạn.';
    case 'INVITED': {
      if (!a.interviewAt) return 'Bạn được mời phỏng vấn.';
      const where = a.interviewLocation ? ` tại ${a.interviewLocation}` : '';
      return `Phỏng vấn lúc ${formatDateTime(a.interviewAt)}${where}.`;
    }
    case 'REJECTED':
      return 'Hồ sơ chưa phù hợp với vị trí này.';
    case 'HIRED':
      return 'Chúc mừng! Bạn đã được nhận vào vị trí này.';
    default:
      return '';
  }
};

export const mapApplication = (a) => ({
  id: a.id,
  jobId: a.jobId,
  jobTitle: a.jobTitle,
  companyId: a.companyId,
  companyName: a.companyName,
  companyLogo: a.companyLogo || null,
  location: a.location || 'Chưa cập nhật',
  salary: formatSalaryRange(a.salaryMin, a.salaryMax),
  cvName: a.cvFileName || `CV #${a.cvId}`,
  coverLetter: a.coverLetter,
  appliedAt: formatDate(a.appliedAt),
  appliedAtRaw: a.appliedAt,
  rawStatus: a.status,
  status: STATUS_LABEL[a.status] || a.status,
  canWithdraw: WITHDRAWABLE.includes(a.status),
  note: buildNote(a),
});

export const mapCv = (cv) => ({
  id: cv.id,
  name: cv.fileName || `CV #${cv.id}`,
  fileUrl: cv.fileUrl,
  isDefault: cv.isDefault,
  updatedAt: formatDate(cv.uploadedAt),
});

export const candidateService = {
  getCvs: async () => {
    const { data } = await apiClient.get('/candidate/cvs');
    return data.map(mapCv);
  },
  getApplications: async () => {
    const { data } = await apiClient.get('/candidate/applications');
    return data.map(mapApplication);
  },
  apply: async ({ jobId, cvId, coverLetter }) => {
    const { data } = await apiClient.post('/candidate/applications', { jobId, cvId, coverLetter });
    return mapApplication(data);
  },
  withdraw: async (applicationId) => {
    await apiClient.delete(`/candidate/applications/${applicationId}`);
  },
};
