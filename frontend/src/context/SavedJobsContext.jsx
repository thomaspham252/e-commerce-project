import { createContext, useState, useContext, useEffect } from 'react';

const SavedJobsContext = createContext();

const STORAGE_KEY = 'jobviet.savedJobIds';

export const useSavedJobs = () => {
  const context = useContext(SavedJobsContext);
  if (!context) {
    return {
      savedJobIds: new Set(),
      toggleSaveJob: () => {},
      isJobSaved: () => false,
    };
  }
  return context;
};

// Đọc danh sách đã lưu từ localStorage ngay khi khởi tạo state,
// nhờ vậy tin đã lưu không bị mất khi người dùng tải lại trang.
const readStoredIds = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
};

export const SavedJobsProvider = ({ children }) => {
  const [savedJobIds, setSavedJobIds] = useState(readStoredIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedJobIds]));
    } catch {
      // Bỏ qua khi trình duyệt chặn localStorage (chế độ ẩn danh, hết dung lượng)
    }
  }, [savedJobIds]);

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
