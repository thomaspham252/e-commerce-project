import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getWallet,
  consumeTokens as serviceConsume,
} from '../services/walletService.js';

const WalletContext = createContext(null);

/**
 * Provider quản lý trạng thái Ví Token toàn cục cho ứng dụng.
 * Đồng bộ số dư token tức thì giữa Header, Trang Ví, và các Modal trừ token với Database MySQL.
 */
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState({
    userId: null,
    balance: 0,
    totalDeposited: 0,
    totalConsumed: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getWallet();
      setWallet(data);
    } catch (err) {
      console.error('Không thể tải thông tin ví token:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();

    // Lắng nghe thay đổi phiên đăng nhập để tải lại ví của user tương ứng
    const handleAuthChange = () => {
      fetchWalletData();
    };
    window.addEventListener('auth-session-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-session-changed', handleAuthChange);
    };
  }, [fetchWalletData]);

  // Hành động tiêu token
  const consume = useCallback(async (featureKey) => {
    const res = await serviceConsume(wallet?.userId, featureKey);
    if (res.success && res.wallet) {
      setWallet((prev) => ({
        ...prev,
        balance: res.wallet.balance,
        totalConsumed: (prev.totalConsumed || 0) + (res.transaction ? Math.abs(res.transaction.amount) : 0),
      }));
    }
    return res;
  }, [wallet?.userId]);

  const value = {
    wallet,
    balance: wallet?.balance ?? 0,
    loading,
    refreshWallet: fetchWalletData,
    consume,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

/**
 * Custom hook useWallet để truy cập số dư và các hành động nạp/tiêu token.
 */
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    return {
      wallet: { userId: null, balance: 0, totalDeposited: 0, totalConsumed: 0 },
      balance: 0,
      loading: false,
      refreshWallet: () => {},
      consume: async () => ({ success: false }),
    };
  }
  return context;
};
