import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAuthSession } from '../services/apiClient';
import { candidateService } from '../services/candidateService';

const ApplicationsContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    return {
      applications: [],
      loading: false,
      error: null,
      hasApplied: () => false,
      addApplication: async () => {},
      withdrawApplication: async () => {},
      reload: async () => {},
    };
  }
  return context;
};

const isCandidate = () => getAuthSession()?.role?.toString().toUpperCase() === 'CANDIDATE';

/** Lịch sử ứng tuyển của ứng viên đang đăng nhập, lấy từ backend (/api/candidate/applications). */
export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!isCandidate()) {
      setApplications([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setApplications(await candidateService.getApplications());
      setError(null);
    } catch (err) {
      console.error('Không tải được lịch sử ứng tuyển', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    // Đăng nhập / đăng xuất / đổi tài khoản → tải lại danh sách
    window.addEventListener('auth-session-changed', reload);
    return () => window.removeEventListener('auth-session-changed', reload);
  }, [reload]);

  const hasApplied = (jobId) => applications.some(item => String(item.jobId) === String(jobId));

  /** Nộp đơn; lỗi từ backend (đã ứng tuyển, tin hết hạn...) được ném ra cho trang xử lý. */
  const addApplication = async ({ jobId, cvId, coverLetter }) => {
    const created = await candidateService.apply({ jobId, cvId, coverLetter });
    setApplications(prev => [created, ...prev]);
    return created;
  };

  const withdrawApplication = async (applicationId) => {
    await candidateService.withdraw(applicationId);
    setApplications(prev => prev.filter(item => item.id !== applicationId));
  };

  return (
    <ApplicationsContext.Provider
      value={{ applications, loading, error, hasApplied, addApplication, withdrawApplication, reload }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};
