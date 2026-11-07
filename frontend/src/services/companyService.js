import { apiClient, cleanParams } from './apiClient';
import { mapBackendJob } from './jobService';

export const mapBackendCompany = (c) => ({
  id: c.id,
  name: c.name,
  legalName: c.legalName || c.name,
  logo: c.logo || null,
  logoUrl: c.logo || null,
  initials: (c.name || 'CP').slice(0, 3).toUpperCase(),
  industry: c.industry || 'Công nghệ thông tin',
  size: c.size || '100 - 499 nhân viên',
  address: c.address || 'Việt Nam',
  location: c.address || 'Việt Nam',
  description: c.description || '',
  website: c.website || '',
  verificationStatus: c.verificationStatus || 'PENDING',
  openJobsCount: c.openJobsCount ?? (c.openJobs ? c.openJobs.length : 0),
  rating: c.rating != null ? Number(c.rating) : null,
  reviewCount: c.reviewCount ?? 0,
  recommendRate: c.recommendRate != null ? Number(c.recommendRate) : null,
  model: c.model || 'Sản phẩm & Dịch vụ',
  workingSchedule: c.workingSchedule || 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
  overtime: c.overtime || 'Theo quy định công ty',
  awards: Array.isArray(c.awards) ? c.awards : [],
  photos: Array.isArray(c.photos) ? c.photos : [],
  offices: Array.isArray(c.offices) && c.offices.length > 0 ? c.offices : [
    {
      city: 'Trụ sở chính',
      address: c.address || 'Việt Nam',
      isPrimary: true,
      lat: 10.8542,
      lng: 106.7865,
    },
  ],
  ratingBreakdown: c.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  openJobs: (c.openJobs || []).map(mapBackendJob),
  reviews: Array.isArray(c.reviews) ? c.reviews : [],
});

export const companyService = {
  getCompaniesPaged: async (filters = {}) => {
    try {
      const {
        keyword = '',
        industry = '',
        location = '',
        companySize = '',
        size: filterSize = '',
        status = '',
        sort = 'latest',
        page = 0,
        pageSize = 8,
      } = filters;

      const sizeParam = filterSize || companySize;
      const response = await apiClient.get('/companies', {
        params: cleanParams({
          keyword,
          industry: industry === 'all' ? '' : industry,
          location: location === 'all' ? '' : location,
          companySize: sizeParam === 'all' ? '' : sizeParam,
          status: status === 'all' ? '' : status,
          sort,
          page,
          size: pageSize,
        }),
      });

      const data = response.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      return {
        content: list.map(mapBackendCompany),
        page: data?.page ?? 0,
        size: data?.size ?? pageSize,
        totalElements: data?.totalElements ?? list.length,
        totalPages: data?.totalPages ?? 1,
      };
    } catch (err) {
      console.warn('Lỗi khi lấy danh sách công ty từ backend:', err);
      return {
        content: [],
        page: 0,
        size: filters.pageSize || 8,
        totalElements: 0,
        totalPages: 1,
      };
    }
  },

  getCompanyById: async (companyId) => {
    const numId = Number(companyId);
    if (!Number.isNaN(numId)) {
      try {
        const response = await apiClient.get(`/companies/${numId}`);
        if (response.data) {
          const comp = mapBackendCompany(response.data);
          // Tải thêm danh sách review thực tế của công ty
          try {
            const revRes = await apiClient.get(`/companies/${numId}/reviews`, {
              params: { page: 0, size: 20 },
            });
            const revData = revRes.data;
            const revList = Array.isArray(revData) ? revData : revData?.content || [];
            comp.reviews = revList;
            comp.reviewCount = revData?.totalElements ?? revList.length;
          } catch {
            // Giữ nguyên reviews từ company
          }
          return comp;
        }
      } catch (err) {
        console.warn(`Không tìm thấy công ty ${companyId} từ backend:`, err);
      }
    }
    return null;
  },

  getCompanyReviews: async (companyId, page = 0, size = 10) => {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reviews`, {
        params: { page, size },
      });
      return response.data;
    } catch {
      return { content: [], page: 0, size, totalElements: 0, totalPages: 1 };
    }
  },

  submitReview: async (companyId, reviewData) => {
    const response = await apiClient.post(`/companies/${companyId}/reviews`, reviewData);
    return response.data;
  },

  submitReply: async (companyId, reviewId, replyData) => {
    const response = await apiClient.post(`/companies/${companyId}/reviews/${reviewId}/reply`, replyData);
    return response.data;
  },
};
