import { JOBS, CATEGORIES, EMPLOYERS } from './mockData';
import { JOB_DETAILS, COMPANY_PROFILES, CVS, APPLICATIONS } from './candidateData';

export const jobService = {
  getJobs: async (keyword = "", location = "") => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredJobs = [...JOBS];

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(
        job => job.title.toLowerCase().includes(lowerKeyword) || job.companyName.toLowerCase().includes(lowerKeyword)
      );
    }

    if (location) {
      const lowerLocation = location.toLowerCase();
      filteredJobs = filteredJobs.filter(
        job => job.location.toLowerCase().includes(lowerLocation)
      );
    }

    return filteredJobs;
  },

  getCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return CATEGORIES;
  },

  getCompanies: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return EMPLOYERS;
  },

  getJobById: async (jobId) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const job = JOBS.find(item => item.id === jobId);
    if (!job) return null;

    return {
      ...job,
      ...JOB_DETAILS[jobId],
      company: {
        name: job.companyName,
        logo: job.companyLogo,
        ...COMPANY_PROFILES[job.companyName]
      }
    };
  },

  getJobsByIds: async (jobIds) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const wanted = new Set(jobIds);
    return JOBS.filter(job => wanted.has(job.id));
  },

  getRelatedJobs: async (jobId, limit = 3) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JOBS.filter(job => job.id !== jobId).slice(0, limit);
  },

  getCvs: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return CVS;
  },

  getApplications: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return APPLICATIONS;
  }
};
