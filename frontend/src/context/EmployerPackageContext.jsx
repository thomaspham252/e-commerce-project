import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentSubscription,
  getEmployerPackages,
  subscribePackage as serviceSubscribe,
  checkPackagePermission as serviceCheckPermission,
  incrementJobPostUsage as serviceIncrementUsage,
} from '../services/employerPackageService.js';
import { getAuthSession } from '../services/apiClient.js';

const EmployerPackageContext = createContext(null);

/**
 * Provider quản lý trạng thái Gói dịch vụ Nhà tuyển dụng toàn cục.
 * Đồng bộ tình trạng gói hiện tại, kiểm tra giới hạn tin đăng và quyền chat realtime.
 */
export const EmployerPackageProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chỉ tải gói khi người đang đăng nhập là Nhà tuyển dụng (Provider bọc toàn bộ app)
  const fetchSubscription = useCallback(async () => {
    if (getAuthSession()?.role !== 'EMPLOYER') {
      setSubscription(null);
      setPackages([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [subData, pkgsData] = await Promise.all([
        getCurrentSubscription(),
        getEmployerPackages({ includeInactive: false }),
      ]);
      setSubscription(subData);
      setPackages(pkgsData);
    } catch (err) {
      console.error('Không thể tải thông tin gói tuyển dụng:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    // Đăng nhập / đăng xuất / đổi tài khoản thì tải lại gói
    window.addEventListener('auth-session-changed', fetchSubscription);
    return () => window.removeEventListener('auth-session-changed', fetchSubscription);
  }, [fetchSubscription]);

  // Sau khi thanh toán xong: backend đã kích hoạt gói, tải lại gói hiện tại
  const purchasePackage = useCallback(async () => {
    const res = await serviceSubscribe();
    if (res.success && res.subscription) {
      setSubscription(res.subscription);
    }
    return res;
  }, []);

  // Kiểm tra quyền hạn (hết tin đăng, hết hạn, nhắn tin trực tiếp)
  const checkPermission = useCallback(async (actionType) => {
    const result = await serviceCheckPermission(actionType);
    setSubscription(result.subscription);
    return result;
  }, []);

  // Sau khi đăng tin: tải lại số tin đã dùng từ DB
  const incrementUsage = useCallback(async () => {
    const updated = await serviceIncrementUsage();
    setSubscription(updated);
    return updated;
  }, []);

  const value = {
    subscription,
    packages,
    loading,
    refreshSubscription: fetchSubscription,
    purchasePackage,
    checkPermission,
    incrementUsage,
  };

  return (
    <EmployerPackageContext.Provider value={value}>
      {children}
    </EmployerPackageContext.Provider>
  );
};

/**
 * Custom hook useEmployerPackage để truy cập trạng thái gói tuyển dụng.
 */
export const useEmployerPackage = () => {
  const context = useContext(EmployerPackageContext);
  if (!context) {
    return {
      subscription: null,
      packages: [],
      loading: false,
      refreshSubscription: () => {},
      purchasePackage: async () => ({ success: false }),
      checkPermission: async () => ({ allowed: true }),
      incrementUsage: async () => null,
    };
  }
  return context;
};
