import { createContext, useState, useContext } from 'react';

const SavedJobsContext = createContext();

export const useSavedJobs = () => {
  return useContext(SavedJobsContext);
};

export const SavedJobsProvider = ({ children }) => {
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const toggleSaveJob = (jobId) => {
    setSavedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const isJobSaved = (jobId) => {
    return savedJobIds.has(jobId);
  };

  return (
    <SavedJobsContext.Provider value={{ savedJobIds, toggleSaveJob, isJobSaved }}>
      {children}
    </SavedJobsContext.Provider>
  );
};
