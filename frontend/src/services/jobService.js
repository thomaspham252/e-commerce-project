import { JOBS, CATEGORIES, EMPLOYERS } from './mockData';

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
  }
};
