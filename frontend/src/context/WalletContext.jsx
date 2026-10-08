import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getWallet,
  depositTokens as serviceDeposit,
  consumeTokens as serviceConsume,
} from '../services/walletService.js';

const WalletContext = createContext(null);

/**
 * Provider quản lý trạng thái Ví Token toàn cục cho ứng dụng.
 * Đồng bộ số dư token tức thì giữa Header, Trang Ví, và các Modal trừ token.
 */
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState({
    userId: 'USR-UV-01',
    balance: 150,
    totalDeposited: 250,
    totalConsumed: 100,
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
  }, [fetchWalletData]);

  // Hành động nạp token
  const deposit = useCallback(async (packageId, orderId = null) => {
    const res = await serviceDeposit('USR-UV-01', packageId, orderId);
    setWallet(res.wallet);
    return res;
  }, []);

  // Hành động tiêu token
  const consume = useCallback(async (featureKey) => {
    const res = await serviceConsume('USR-UV-01', featureKey);
    if (res.success && res.wallet) {
      setWallet(res.wallet);
    }
    return res;
  }, []);

  const value = {
    wallet,
    balance: wallet?.balance ?? 0,
    loading,
    refreshWallet: fetchWalletData,
    deposit,
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
    throw new Error('useWallet phải được sử dụng bên trong WalletProvider');
  }
  return context;
};
