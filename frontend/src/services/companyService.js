import { apiClient, cleanParams } from './apiClient';
import { COMPANY_PROFILES, DEFAULT_AWARDS, DEFAULT_PHOTOS } from './candidateData';
import { FEATURED_COMPANIES } from '../data/homeCandidateMockData';
import { mapBackendJob } from './jobService';

export const mapBackendCompany = (c) => {
  const profile = COMPANY_PROFILES[c.name] || {};
  return {
    id: c.id,
    name: c.name,
    legalName: c.legalName || c.name,
    logo: c.logo || profile.logoUrl || null,
    logoUrl: c.logo || profile.logoUrl || null,
    initials: (c.name || 'CP').slice(0, 3).toUpperCase(),
    industry: c.industry || profile.industry || 'Công nghệ thông tin',
    size: c.size || profile.size || '100 - 499 nhân viên',
    address: c.address || profile.address || 'Hà Nội & TP. HCM',
    location: c.address || profile.address || 'Việt Nam',
    description: c.description || profile.description || 'Doanh nghiệp công nghệ hàng đầu tại Việt Nam.',
    website: c.website || profile.website || 'https://jobviet.vn',
    verificationStatus: c.verificationStatus || 'VERIFIED',
    openJobsCount: c.openJobsCount ?? (c.openJobs ? c.openJobs.length : 0),
    rating: c.rating || profile.rating || 4.8,
    reviewCount: c.reviewCount ?? profile.reviewCount ?? 0,
    recommendRate: c.recommendRate || profile.recommendRate || 98,
    model: profile.model || 'Sản phẩm (Product)',
    workingSchedule: profile.workingSchedule || 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
    overtime: profile.overtime || 'Không có OT / Trả lương làm thêm giờ đầy đủ',
    awards: profile.awards || DEFAULT_AWARDS,
    photos: profile.photos || DEFAULT_PHOTOS,
    offices: profile.offices || [
      {
        city: 'Trụ sở chính',
        address: c.address || 'Việt Nam',
        isPrimary: true,
        lat: 10.8542,
        lng: 106.7865
      }
    ],
    ratingBreakdown: c.ratingBreakdown || { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 },
    openJobs: (c.openJobs || []).map(mapBackendJob),
    reviews: c.reviews || []
  };
};

export const companyService = {
  getCompaniesPaged: async (filters = {}) => {
    try {
      const { keyword = '', industry = '', location = '', page = 0, size = 12 } = filters;
      const response = await apiClient.get('/companies', {
        params: cleanParams({ keyword, industry, location, page, size }),
      });

      const data = response.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      return {
        content: list.map(mapBackendCompany),
        page: data?.page || 0,
        size: data?.size || size,
        totalElements: data?.totalElements || list.length,
        totalPages: data?.totalPages || 1,
      };
    } catch (err) {
      console.warn('Lỗi khi lấy danh sách công ty từ backend, chuyển sang mock data:', err);
      // Fallback sang FEATURED_COMPANIES
      const fallbackList = FEATURED_COMPANIES.map((comp) => {
        const profile = COMPANY_PROFILES[comp.name] || {};
        return {
          id: comp.id,
          name: comp.name,
          legalName: comp.name,
          logo: comp.logoUrl,
          logoUrl: comp.logoUrl,
          initials: comp.initials,
          industry: comp.sectorName || profile.industry || 'Công nghệ thông tin',
          size: profile.size || '100 - 499 nhân viên',
          address: comp.location,
          location: comp.location,
          description: profile.description || 'Doanh nghiệp uy tín đồng hành phát triển cùng nhân tài.',
          website: profile.website || 'https://jobviet.vn',
          verificationStatus: 'VERIFIED',
          openJobsCount: comp.openJobsCount || 3,
          rating: profile.rating || 4.8,
          reviewCount: profile.reviewCount || 25,
          recommendRate: profile.recommendRate || 98,
        };
      });

      return {
        content: fallbackList,
        page: 0,
        size: 12,
        totalElements: fallbackList.length,
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
          return mapBackendCompany(response.data);
        }
      } catch (err) {
        console.warn(`Không tìm thấy công ty ${companyId} từ backend, kiểm tra mock data:`, err);
      }
    }

    // Mock fallback
    const foundFeatured = FEATURED_COMPANIES.find(
      (c) => String(c.id) === String(companyId) || c.name.toLowerCase() === String(companyId).toLowerCase()
    );

    const companyName = foundFeatured ? foundFeatured.name : 'FPT Software';
    const profile = COMPANY_PROFILES[companyName] || COMPANY_PROFILES['FPT Software'] || {};

    return mapBackendCompany({
      id: companyId,
      name: companyName,
      legalName: companyName,
      logo: foundFeatured?.logoUrl || null,
      industry: foundFeatured?.sectorName || profile.industry,
      size: profile.size,
      address: foundFeatured?.location || profile.address,
      description: profile.description,
      website: profile.website,
      verificationStatus: 'VERIFIED',
      openJobsCount: foundFeatured?.openJobsCount || 5,
      rating: profile.rating || 4.8,
      reviewCount: profile.reviewCount || 28,
      recommendRate: profile.recommendRate || 99,
      ratingBreakdown: { 5: 22, 4: 5, 3: 1, 2: 0, 1: 0 },
      openJobs: [],
      reviews: [
        {
          id: 101,
          candidateName: 'Nguyễn Văn An',
          candidateAvatar: null,
          rating: 5,
          content: 'Môi trường làm việc cực kỳ chuyên nghiệp, văn phòng hiện đại và đồng nghiệp thân thiện. Chế độ đãi ngộ rất tốt, văn hóa trao quyền và khuyến khích đổi mới sáng tạo.',
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          reply: {
            id: 201,
            employerName: 'Đại diện Doanh nghiệp',
            content: 'Cảm ơn bạn đã luôn đồng hành và đóng góp tích cực cho sự phát triển của công ty!',
            createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
          }
        },
        {
          id: 102,
          candidateName: 'Trần Thị Bình',
          candidateAvatar: null,
          rating: 5,
          content: 'Dự án quy mô lớn, công nghệ mới nhất. Quy trình phát triển Agile/Scrum bài bản, học hỏi được rất nhiều từ các anh chị Tech Lead.',
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
          reply: null
        }
      ]
    });
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

