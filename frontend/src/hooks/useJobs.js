import { useState, useEffect, useCallback } from 'react';
import { jobService } from '../services/jobService';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async (keyword = "", location = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobs(keyword, location);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, fetchJobs };
};
