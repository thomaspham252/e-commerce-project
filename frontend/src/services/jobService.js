import { apiClient, cleanParams } from './apiClient';
import { formatSalaryRange } from '../utils/formatSalary';
import { formatDate, formatTimeAgo } from '../utils/formatDate';
import { JOBS, CATEGORIES, EMPLOYERS } from './mockData';
import { JOB_DETAILS, COMPANY_PROFILES, CVS, APPLICATIONS } from './candidateData';

export const mapBackendJob = (item) => ({
  id: item.id,
  title: item.title,
  companyId: item.companyId,
  companyName: item.companyName,
  logoUrl: item.companyLogo || null,
  companyLogo: item.companyLogo || null,
  salary: formatSalaryRange(item.salaryMin, item.salaryMax),
  salaryMin: item.salaryMin,
  salaryMax: item.salaryMax,
  location: item.location || 'Chưa cập nhật',
  jobType: item.jobType || 'Toàn thời gian',
  level: item.level || 'Junior',
  experience: item.level || 'Không yêu cầu',
  vacancies: item.vacancies || 1,
  quantity: item.vacancies || 1,
  workingSchedule: item.workingSchedule || 'Thứ 2 - Thứ 6',
  timeAgo: formatTimeAgo(item.createdAt),
  postedDate: formatDate(item.createdAt),
  createdAt: item.createdAt,
  deadline: formatDate(item.deadline),
  badgeType: item.isHighlighted ? 'hot' : 'new',
  badgeText: item.isHighlighted ? 'Hot' : 'Mới',
  isHot: Boolean(item.isHighlighted),
  isNew: true,
  views: 120 + ((item.id * 17) % 85),
  applicants: item.applicationCount || 0,
  matchPercentage: item.matchPercentage || null,
  matchedSkills: item.matchedSkills || [],
  skills: item.skills ? (Array.isArray(item.skills) ? item.skills : item.skills.split(',').map(s => s.trim()).filter(Boolean)) : [item.title.split(' ')[0], item.level || 'Junior', 'Teamwork', 'Git'].filter(Boolean),
  description: Array.isArray(item.description)
    ? item.description
    : (item.description ? item.description.split(/\r?\n|\\n/).filter(Boolean) : ['Trao đổi chi tiết công việc trong buổi phỏng vấn.']),
  requirements: Array.isArray(item.requirements)
    ? item.requirements
    : (item.requirements ? item.requirements.split(/\r?\n|\\n/).filter(Boolean) : ['Đáp ứng các yêu cầu chuyên môn tương ứng với vị trí.']),
  benefits: [
    'Chế độ đãi ngộ cạnh tranh, thưởng dự án và tháng 13',
    'Đóng bảo hiểm đầy đủ theo quy định của pháp luật',
    'Môi trường làm việc trẻ trung, năng động và cởi mở',
    'Cơ hội đào tạo chuyên sâu và lộ trình thăng tiến rõ ràng',
  ],
  company: {
    id: item.companyId,
    name: item.companyName,
    logo: item.companyLogo || null,
    industry: item.companyIndustry || 'IT - Phần mềm',
    description: item.companyDescription || 'Doanh nghiệp uy tín đồng hành phát triển cùng người lao động.',
    website: item.companyWebsite || 'https://jobviet.vn',
    size: item.companySize || '100 - 499 nhân viên',
    founded: '2015',
    address: item.location || 'Việt Nam',
  },
});

export const jobService = {
  /** Lấy danh sách việc làm có đầy đủ metadata phân trang và bộ lọc chi tiết */
  getJobsPaged: async (filters = {}) => {
    try {
      const {
        keyword = '',
        location = '',
        jobType = '',
        level = '',
        minSalary = null,
        maxSalary = null,
        sort = 'latest',
        page = 0,
        size = 9,
      } = filters;

      const response = await apiClient.get('/jobs', {
        params: cleanParams({
          keyword,
          location,
          jobType,
          level,
          minSalary,
          maxSalary,
          sort,
          page,
          size,
        }),
      });

      const data = response.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      return {
        content: list.map(mapBackendJob),
        page: data?.page || 0,
        size: data?.size || size,
        totalElements: data?.totalElements || list.length,
        totalPages: data?.totalPages || 1,
      };
    } catch (err) {
      console.warn('Lỗi khi gọi getJobsPaged từ backend:', err);
      return {
        content: JOBS.map((j) => ({
          ...j,
          companyLogo: j.companyLogo || j.logoUrl,
          timeAgo: 'Mới đăng',
          skills: [j.title.split(' ')[0], 'Git'],
          description: ['Mô tả công việc mẫu'],
          requirements: ['Yêu cầu công việc mẫu'],
          benefits: ['Chế độ đãi ngộ tốt'],
          company: { name: j.companyName, logo: j.companyLogo, address: j.location },
        })),
        page: 0,
        size: 9,
        totalElements: JOBS.length,
        totalPages: 1,
      };
    }
  },

  /** Lấy nhanh một vài việc làm mới nhất cho trang chủ (mặc định 6 tin) */
  getLatestJobs: async (limit = 6) => {
    const res = await jobService.getJobsPaged({ sort: 'latest', page: 0, size: limit });
    return res.content;
  },

  /** Lấy danh sách việc làm công khai (trả về mảng việc làm cho các component cần mảng đơn giản) */
  getJobs: async (keyword = '', location = '', sort = 'latest', page = 0, size = 12) => {
    const res = await jobService.getJobsPaged({ keyword, location, sort, page, size });
    return res.content;
  },

  /** Lấy chi tiết tin tuyển dụng theo ID từ backend (có fallback sang mock data) */
  getJobById: async (jobId) => {
    const numId = Number(jobId);
    if (!Number.isNaN(numId)) {
      try {
        const response = await apiClient.get(`/jobs/${numId}`);
        if (response.data) {
          return mapBackendJob(response.data);
        }
      } catch (err) {
        console.warn(`Không tìm thấy tin ${jobId} từ backend, kiểm tra mock data`, err);
      }
    }

    const mock = JOBS.find((item) => String(item.id) === String(jobId));
    if (!mock) return null;

    return {
      ...mock,
      ...JOB_DETAILS[jobId],
      company: {
        name: mock.companyName,
        logo: mock.companyLogo,
        ...COMPANY_PROFILES[mock.companyName],
      },
    };
  },

  getJobsByIds: async (jobIds) => {
    const wanted = new Set(jobIds.map(String));
    try {
      const all = await jobService.getJobs('', '', 'latest', 0, 50);
      return all.filter((job) => wanted.has(String(job.id)));
    } catch {
      return JOBS.filter((job) => wanted.has(String(job.id)));
    }
  },

  getRelatedJobs: async (jobId, limit = 4) => {
    try {
      const res = await apiClient.get('/jobs/' + jobId + '/related', { params: { limit } });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapBackendJob);
      }
    } catch (err) {
      console.warn('Lỗi gợi ý việc làm:', err);
    }
    try {
      const all = await jobService.getJobs('', '', 'latest', 0, 10);
      return all.filter((job) => String(job.id) !== String(jobId)).slice(0, limit);
    } catch {
      return JOBS.filter((job) => String(job.id) !== String(jobId)).slice(0, limit);
    }
  },

  getCategories: async () => {
    return CATEGORIES;
  },

  getCompanies: async () => {
    return EMPLOYERS;
  },

  getCvs: async () => {
    return CVS;
  },

  getApplications: async () => {
    return APPLICATIONS;
  },
};
