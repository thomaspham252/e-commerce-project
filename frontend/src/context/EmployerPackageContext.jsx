import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentSubscription,
  getEmployerPackages,
  subscribePackage as serviceSubscribe,
  checkPackagePermission as serviceCheckPermission,
  incrementJobPostUsage as serviceIncrementUsage,
} from '../services/employerPackageService.js';

const EmployerPackageContext = createContext(null);

/**
 * Provider quản lý trạng thái Gói dịch vụ Nhà tuyển dụng toàn cục.
 * Đồng bộ tình trạng gói hiện tại, kiểm tra giới hạn tin đăng và quyền chat realtime.
 */
export const EmployerPackageProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const [subData, pkgsData] = await Promise.all([
        getCurrentSubscription('EMP-001'),
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
  }, [fetchSubscription]);

  // Hành động kích hoạt mua/gia hạn gói
  const purchasePackage = useCallback(async (packageId, orderId = null) => {
    const res = await serviceSubscribe('EMP-001', packageId, orderId);
    if (res.success && res.subscription) {
      setSubscription(res.subscription);
    }
    return res;
  }, []);

  // Kiểm tra quyền hạn (hết tin đăng, hết hạn, chat realtime)
  const checkPermission = useCallback(async (actionType) => {
    return await serviceCheckPermission('EMP-001', actionType);
  }, []);

  // Tăng số lượng tin đã đăng
  const incrementUsage = useCallback(async () => {
    const updated = await serviceIncrementUsage('EMP-001');
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
