import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiChevronRight,
  FiLayers,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Coins } from 'lucide-react';

import { useWallet } from '../../context/WalletContext.jsx';
import {
  getTokenPackages,
  getTokenTransactions,
  getDepositHistory,
  getServiceFees,
} from '../../services/walletService.js';
import { createPaymentOrder } from '../../services/paymentService.js';

import { WalletBalanceCard } from '../../components/wallet/WalletBalanceCard.jsx';
import { TokenPackagesGrid } from '../../components/wallet/TokenPackagesGrid.jsx';
import { TokenTransactionList } from '../../components/wallet/TokenTransactionList.jsx';
import { DepositHistoryList } from '../../components/wallet/DepositHistoryList.jsx';
import { ServiceFeeTable } from '../../components/wallet/ServiceFeeTable.jsx';
import { TokenConsumeModal } from '../../components/wallet/TokenConsumeModal.jsx';

import './CandidateWalletPage.css';

/**
 * Trang Quản lý Ví Token của Ứng viên (Candidate Wallet Page).
 * Trung tâm điều khiển số dư token, nạp tiền VietQR SePay,
 * tra cứu lịch sử biến động và trải nghiệm các tính năng tuyển dụng trả phí.
 */
export const CandidateWalletPage = () => {
  const navigate = useNavigate();
  const { wallet, balance, loading: walletLoading, consume } = useWallet();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'deposits' | 'fees'
  const [packages, setPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [serviceFees, setServiceFees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Trạng thái modal trừ token
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    featureKey: '',
    featureName: '',
    featureDescription: '',
    tokenCost: 0,
    loading: false,
  });

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Tải dữ liệu ban đầu
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [pkgs, txs, deps, fees] = await Promise.all([
        getTokenPackages(),
        getTokenTransactions('USR-UV-01'),
        getDepositHistory('USR-UV-01'),
        getServiceFees(),
      ]);
      setPackages(pkgs);
      setTransactions(txs);
      setDeposits(deps);
      setServiceFees(fees);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang ví:', err);
      showToast('Không thể tải dữ liệu ví. Vui lòng thử lại sau.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 1. Thao tác chọn mốc nạp -> tạo đơn SePay và chuyển hướng sang /thanh-toan/:orderId
  const handleProceedPayment = async (pkg) => {
    try {
      setLoadingData(true);
      const order = await createPaymentOrder({
        orderType: 'CANDIDATE_TOKEN',
        serviceName: `Nạp ${pkg.tokens} Token ${
          pkg.bonusTokens > 0 ? `(+${pkg.bonusTokens} tặng kèm)` : ''
        }`,
        amount: pkg.priceVND,
        userId: wallet.userId || 'USR-UV-01',
        userName: wallet.userName || 'Nguyễn Văn An',
        userEmail: wallet.userEmail || 'an.nguyen@gmail.com',
        userRole: 'candidate',
      });

      showToast(`Đã tạo đơn nạp token ${order.orderId}. Đang chuyển sang trang quét mã VietQR...`, 'success');
      setTimeout(() => {
        navigate(`/thanh-toan/${order.orderId}`);
      }, 700);
    } catch (err) {
      console.error('Lỗi khi tạo đơn nạp token:', err);
      showToast('Có lỗi xảy ra khi tạo đơn nạp tiền. Vui lòng thử lại.', 'error');
      setLoadingData(false);
    }
  };

  // 2. Mở modal xác nhận trừ token
  const handleOpenConsumeModal = (feeItem) => {
    setModalConfig({
      isOpen: true,
      featureKey: feeItem.featureKey,
      featureName: feeItem.featureName,
      featureDescription: feeItem.description,
      tokenCost: feeItem.tokenCost,
      loading: false,
    });
  };

  // 3. Thực hiện xác nhận trừ token
  const handleConfirmConsume = async () => {
    try {
      setModalConfig((prev) => ({ ...prev, loading: true }));
      const res = await consume(modalConfig.featureKey);

      if (res.success) {
        showToast(
          `Đã kích hoạt tính năng "${modalConfig.featureName}" thành công! Đã trừ ${modalConfig.tokenCost} Token.`,
          'success'
        );
        setModalConfig((prev) => ({ ...prev, isOpen: false, loading: false }));

        // Cập nhật lại lịch sử biến động
        const updatedTxs = await getTokenTransactions('USR-UV-01');
        setTransactions(updatedTxs);
      } else {
        showToast(res.message || 'Thao tác không thành công', 'error');
        setModalConfig((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Lỗi khi trừ token:', err);
      showToast('Có lỗi xảy ra khi xử lý trừ token', 'error');
      setModalConfig((prev) => ({ ...prev, loading: false }));
    }
  };

  // 4. Lọc lịch sử biến động
  const handleFilterTransactions = async (filters) => {
    try {
      const filtered = await getTokenTransactions('USR-UV-01', filters);
      setTransactions(filtered);
    } catch (err) {
      console.error('Lỗi khi lọc lịch sử:', err);
    }
  };

  // 5. Nạp thêm Token từ thẻ số dư -> cuộn xuống phần gói nạp
  const handleDepositClick = () => {
    setActiveTab('overview');
    const elem = document.getElementById('token-deposit-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="candidate-wallet-page">
      {/* Thông báo Toast nội bộ */}
      {toastMessage && (
        <div className={`wallet-toast-banner wallet-toast-banner--${toastMessage.type}`}>
          {toastMessage.type === 'success' ? (
            <FiCheckCircle className="toast-icon" />
          ) : (
            <FiAlertCircle className="toast-icon" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      <div className="candidate-wallet-container">
        {/* Breadcrumb điều hướng */}
        <nav className="wallet-breadcrumb" aria-label="Breadcrumb">
          <button
            type="button"
            className="wallet-breadcrumb-link"
            onClick={() => navigate('/')}
          >
            <FiHome />
            <span>Trang chủ</span>
          </button>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="wallet-breadcrumb-link">Ứng viên</span>
          <FiChevronRight className="breadcrumb-separator" />
          <span className="wallet-breadcrumb-current">Ví Token</span>
        </nav>

        {/* Tiêu đề trang */}
        <div className="wallet-page-header">
          <div>
            <h1 className="wallet-page-title">
              <Coins className="title-coin-icon text-amber" /> Ví Token Của Tôi
            </h1>
            <p className="wallet-page-subtitle">
              Nạp token tiện lợi với VietQR SePay, linh hoạt sử dụng cho các tiện ích kết nối nhà tuyển dụng và nâng tầm hồ sơ ứng tuyển.
            </p>
          </div>
        </div>

        {/* Thẻ số dư chính (US1 MVP) */}
        <div className="wallet-balance-section">
          <WalletBalanceCard
            balance={balance}
            totalDeposited={wallet?.totalDeposited || 0}
            totalConsumed={wallet?.totalConsumed || 0}
            onDepositClick={handleDepositClick}
            onViewFeesClick={() => setActiveTab('fees')}
            loading={walletLoading}
          />
        </div>

        {/* Thanh chuyển tab phân hệ */}
        <div className="wallet-tabs-nav">
          <button
            type="button"
            className={`wallet-tab-btn ${activeTab === 'overview' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('overview')}
            id="tab-btn-overview"
          >
            <FiLayers />
            <span>Nạp Token & Tổng Quan</span>
          </button>

          <button
            type="button"
            className={`wallet-tab-btn ${
              activeTab === 'transactions' ? 'wallet-tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('transactions')}
            id="tab-btn-transactions"
          >
            <FiClock />
            <span>Lịch Sử Biến Động</span>
          </button>

          <button
            type="button"
            className={`wallet-tab-btn ${
              activeTab === 'deposits' ? 'wallet-tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('deposits')}
            id="tab-btn-deposits"
          >
            <FiCreditCard />
            <span>Lịch Sử Nạp Tiền (SePay)</span>
          </button>

          <button
            type="button"
            className={`wallet-tab-btn ${activeTab === 'fees' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('fees')}
            id="tab-btn-fees"
          >
            <FiFileText />
            <span>Biểu Phí Tiện Ích</span>
          </button>
        </div>

        {/* Nội dung các Tab */}
        <div className="wallet-tab-content">
          {/* TAB 1: Nạp Token & Tổng quan */}
          {activeTab === 'overview' && (
            <div className="wallet-tab-pane" id="token-deposit-section">
              <TokenPackagesGrid
                packages={packages}
                onProceedPayment={handleProceedPayment}
                loading={loadingData}
              />

              <div className="wallet-recent-transactions-preview">
                <div className="recent-tx-header">
                  <h3>Giao Dịch Gần Nhất</h3>
                  <button
                    type="button"
                    className="btn-view-all-tx"
                    onClick={() => setActiveTab('transactions')}
                  >
                    Xem tất cả lịch sử ({transactions.length})
                  </button>
                </div>
                <TokenTransactionList
                  transactions={transactions.slice(0, 3)}
                  loading={loadingData}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Lịch sử biến động token */}
          {activeTab === 'transactions' && (
            <div className="wallet-tab-pane">
              <div className="section-intro">
                <h2>Lịch Sử Biến Động Token</h2>
                <p>Theo dõi mọi giao dịch cộng/trừ token, kiểm tra số dư đối soát và thời gian thực hiện.</p>
              </div>
              <TokenTransactionList
                transactions={transactions}
                onFilterChange={handleFilterTransactions}
                loading={loadingData}
              />
            </div>
          )}

          {/* TAB 3: Lịch sử nạp tiền ngân hàng */}
          {activeTab === 'deposits' && (
            <div className="wallet-tab-pane">
              <DepositHistoryList
                depositOrders={deposits}
                loading={loadingData}
                onRefresh={loadInitialData}
              />
            </div>
          )}

          {/* TAB 4: Bảng giá tiện ích */}
          {activeTab === 'fees' && (
            <div className="wallet-tab-pane">
              <ServiceFeeTable
                serviceFees={serviceFees}
                onTryFeature={handleOpenConsumeModal}
                loading={loadingData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal trừ token dùng chung (US3) */}
      <TokenConsumeModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmConsume}
        featureName={modalConfig.featureName}
        featureDescription={modalConfig.featureDescription}
        tokenCost={modalConfig.tokenCost}
        currentBalance={balance}
        onNavigateDeposit={() => {
          setActiveTab('overview');
          handleDepositClick();
        }}
        loading={modalConfig.loading}
      />
    </div>
  );
};
