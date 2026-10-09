import { createContext, useContext, useEffect, useState } from 'react';
import { jobService } from '../services/jobService';
import { APPLICATION_STATUS } from '../services/candidateData';

const ApplicationsContext = createContext();

// Hồ sơ do người dùng tự gửi được lưu riêng ở localStorage rồi ghép với dữ liệu
// seed từ service, nhờ vậy ứng tuyển xong tải lại trang vẫn thấy hồ sơ của mình.
const STORAGE_KEY = 'jobviet.myApplications';
const WITHDRAWN_KEY = 'jobviet.withdrawnApplicationIds';

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    return {
      applications: [],
      loading: false,
      hasApplied: () => false,
      addApplication: () => {},
      withdrawApplication: () => {},
    };
  }
  return context;
};

const readStored = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bỏ qua khi trình duyệt chặn localStorage (chế độ ẩn danh, hết dung lượng)
  }
};

const formatToday = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
};

export const ApplicationsProvider = ({ children }) => {
  const [seeded, setSeeded] = useState([]);
  const [mine, setMine] = useState(() => readStored(STORAGE_KEY, []));
  const [withdrawnIds, setWithdrawnIds] = useState(() => readStored(WITHDRAWN_KEY, []));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      try {
        const data = await jobService.getApplications();
        if (active) setSeeded(data);
      } catch (err) {
        console.error('Không tải được lịch sử ứng tuyển', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadApplications();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeStored(STORAGE_KEY, mine);
  }, [mine]);

  useEffect(() => {
    writeStored(WITHDRAWN_KEY, withdrawnIds);
  }, [withdrawnIds]);

  // Hồ sơ mới nhất lên đầu; hồ sơ đã rút thì ẩn đi
  const applications = [...mine, ...seeded].filter(item => !withdrawnIds.includes(item.id));

  const hasApplied = (jobId) => {
    return applications.some(item => item.jobId === jobId);
  };

  const addApplication = ({ job, cvName, coverLetter }) => {
    const newApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      location: job.location,
      salary: job.salary,
      cvName,
      coverLetter,
      appliedAt: formatToday(),
      status: APPLICATION_STATUS.SUBMITTED,
      note: 'Hồ sơ đã được gửi, chờ nhà tuyển dụng xem xét.'
    };

    setMine(prev => [newApplication, ...prev]);
    return newApplication;
  };

  const withdrawApplication = (applicationId) => {
    setMine(prev => prev.filter(item => item.id !== applicationId));
    setWithdrawnIds(prev => (prev.includes(applicationId) ? prev : [...prev, applicationId]));
  };

  return (
    <ApplicationsContext.Provider
      value={{ applications, loading, hasApplied, addApplication, withdrawApplication }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};
