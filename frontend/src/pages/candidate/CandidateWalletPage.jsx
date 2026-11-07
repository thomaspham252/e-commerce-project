import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

import { useWallet } from '../../context/WalletContext.jsx';
import { getAuthSession } from '../../services/apiClient.js';
import {
  getTokenPackages,
  getTokenTransactions,
  getDepositHistory,
  getServiceFees,
  purchaseUtilityCombo,
} from '../../services/walletService.js';
import { getCandidateBenefits } from '../../services/candidateBenefitService.js';
import { createPaymentOrder } from '../../services/paymentService.js';

import { WalletBalanceCard } from '../../components/wallet/WalletBalanceCard.jsx';
import { TokenPackagesGrid } from '../../components/wallet/TokenPackagesGrid.jsx';
import { TokenTransactionList } from '../../components/wallet/TokenTransactionList.jsx';
import { DepositHistoryList } from '../../components/wallet/DepositHistoryList.jsx';
import { ServiceFeeTable } from '../../components/wallet/ServiceFeeTable.jsx';
import { TokenConsumeModal } from '../../components/wallet/TokenConsumeModal.jsx';
import { CandidateUtilityCombos } from '../../components/wallet/CandidateUtilityCombos.jsx';
import { CandidateMyPackages } from '../../components/wallet/CandidateMyPackages.jsx';
import { ComboPurchaseModal } from '../../components/wallet/ComboPurchaseModal.jsx';

import './CandidateWalletPage.css';

/**
 * Trang Quản lý ví token của ứng viên (Candidate Wallet Page).
 * Trung tâm điều khiển số dư token, nạp tiền VietQR SePay,
 * tra cứu lịch sử biến động và trải nghiệm các tính năng tuyển dụng trả phí.
 */
export const CandidateWalletPage = () => {
  const navigate = useNavigate();

  // Kiểm tra đăng nhập: nếu đã đăng xuất thì lập tức điều hướng về trang đăng nhập
  useEffect(() => {
    const checkAuth = () => {
      const session = getAuthSession();
      if (!session) {
        navigate('/dang-nhap');
      }
    };
    checkAuth();
    window.addEventListener('auth-session-changed', checkAuth);
    return () => window.removeEventListener('auth-session-changed', checkAuth);
  }, [navigate]);
  const { wallet, balance, loading: walletLoading, consume, refreshWallet } = useWallet();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'deposits' | 'fees'
  const [packages, setPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [serviceFees, setServiceFees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [benefits, setBenefits] = useState(null);

  // Trạng thái modal mua combo tiện ích ứng tuyển
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [comboSubmitting, setComboSubmitting] = useState(false);

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

  // Tải dữ liệu ban đầu từ Database
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [pkgs, txs, deps, fees, bnf] = await Promise.all([
        getTokenPackages(),
        getTokenTransactions(),
        getDepositHistory(),
        getServiceFees(),
        getCandidateBenefits(),
      ]);
      setPackages(pkgs);
      setTransactions(txs);
      setDeposits(deps);
      setServiceFees(fees);
      setBenefits(bnf);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang ví từ DB:', err);
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
        serviceName: `Nạp ${pkg.tokens} token ${
          pkg.bonusTokens > 0 ? `(+${pkg.bonusTokens} tặng kèm)` : ''
        }`,
        amount: pkg.priceVND,
        tokenPackageId: pkg.id,
        userId: wallet.userId,
        userName: wallet.userName,
        userEmail: wallet.userEmail,
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
          `Đã kích hoạt tính năng "${modalConfig.featureName}" thành công. Đã trừ ${modalConfig.tokenCost} token.`,
          'success'
        );
        setModalConfig((prev) => ({ ...prev, isOpen: false, loading: false }));

        // Cập nhật lại lịch sử biến động và số dư
        const updatedTxs = await getTokenTransactions();
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
      const filtered = await getTokenTransactions(null, filters);
      setTransactions(filtered);
    } catch (err) {
      console.error('Lỗi khi lọc lịch sử:', err);
    }
  };

  // 5. Nạp thêm token từ thẻ số dư -> cuộn xuống phần gói nạp
  const handleDepositClick = () => {
    if (activeTab !== 'overview') {
      setActiveTab('overview');
      setTimeout(() => {
        const elem = document.getElementById('token-deposit-section');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      const elem = document.getElementById('token-deposit-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // 6. Mở modal xác nhận mua combo tiện ích
  const handleSelectCombo = (combo) => {
    setSelectedCombo(combo);
    setIsComboModalOpen(true);
  };

  // 7. Xác nhận thực hiện mua combo tiện ích
  const handleConfirmPurchaseCombo = async (combo) => {
    try {
      setComboSubmitting(true);
      const res = await purchaseUtilityCombo(combo.id);

      if (res.success) {
        showToast(
          res.message || `Đã kích hoạt combo "${combo.name}" thành công!`,
          'success'
        );
        setIsComboModalOpen(false);
        setSelectedCombo(null);

        // Cập nhật lại số dư ví toàn cục ngay lập tức
        if (refreshWallet) {
          await refreshWallet();
        }

        // Cập nhật lại danh sách lịch sử biến động và quyền lợi
        const [updatedTxs, updatedBnf] = await Promise.all([
          getTokenTransactions(),
          getCandidateBenefits(),
        ]);
        setTransactions(updatedTxs);
        setBenefits(updatedBnf);
        // Chuyển ngay sang tab "Gói tiện ích của tôi" để ứng viên xem các quyền lợi vừa kích hoạt
        setActiveTab('my-packages');
      } else {
        showToast(res.message || 'Không thể kích hoạt combo. Vui lòng kiểm tra lại.', 'error');
      }
    } catch (err) {
      console.error('Lỗi khi mua combo:', err);
      showToast('Có lỗi xảy ra khi thực hiện mua combo tiện ích', 'error');
    } finally {
      setComboSubmitting(false);
    }
  };

  // 8. Chuyển hướng nạp tiền khi thiếu số dư trong modal combo
  const handleNavigateDepositFromCombo = () => {
    setIsComboModalOpen(false);
    handleDepositClick();
  };

  // Lấy chi phí mở khóa liên hệ NTD từ danh sách biểu phí
  const unlockFeeItem = serviceFees.find((f) => f.featureKey === 'UNLOCK_CONTACT');
  const unlockCost = unlockFeeItem?.tokenCost || 30;

  // Lấy ngày nạp gần nhất từ đơn nạp tiền hoặc giao dịch DEPOSIT
  const lastSuccessfulDeposit = deposits.find(
    (d) => d.status === 'SUCCESS' || d.status === 'PAID' || d.status === 'FULFILLED'
  );
  let lastDepositDateFormatted = '—';
  const rawDate = lastSuccessfulDeposit?.paidAt || lastSuccessfulDeposit?.createdAt;
  if (rawDate) {
    const d = new Date(rawDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    lastDepositDateFormatted = `${day}/${month}/${year}`;
  } else {
    const depositTx = transactions.find((t) => t.type === 'DEPOSIT');
    if (depositTx?.createdAt) {
      const d = new Date(depositTx.createdAt);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      lastDepositDateFormatted = `${day}/${month}/${year}`;
    }
  }

  return (
    <div className="candidate-wallet-page">
      {/* Thông báo Toast */}
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
          <span className="wallet-breadcrumb-current">Ví token</span>
        </nav>

        {/* Tiêu đề trang - giống EmployerPricingPage */}
        <div className="wallet-page-header">
          <div>
            <h1 className="wallet-page-title">Ví Token Của Tôi</h1>
            <p className="wallet-page-subtitle">
              Dùng token để mở liên hệ nhà tuyển dụng, đẩy CV lên đầu và gắn huy hiệu nổi bật.
            </p>
          </div>
        </div>

        {/* Khối số dư khả dụng */}
        <div className="wallet-balance-section">
          <WalletBalanceCard
            balance={balance}
            totalDeposited={wallet?.totalDeposited || 0}
            totalConsumed={wallet?.totalConsumed || 0}
            lastDepositDate={lastDepositDateFormatted}
            unlockCost={unlockCost}
            onDepositClick={handleDepositClick}
            onViewFeesClick={() => setActiveTab('fees')}
            loading={walletLoading}
          />
        </div>

        {/* Thanh chuyển tab phân hệ */}
        <div className="wallet-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`wallet-tab-btn ${activeTab === 'overview' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('overview')}
            id="tab-btn-overview"
          >
            Nạp token
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'my-packages'}
            className={`wallet-tab-btn ${activeTab === 'my-packages' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('my-packages')}
            id="tab-btn-my-packages"
          >
            Gói tiện ích của tôi
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'fees'}
            className={`wallet-tab-btn ${activeTab === 'fees' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('fees')}
            id="tab-btn-fees"
          >
            Biểu phí tiện ích
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'transactions'}
            className={`wallet-tab-btn ${activeTab === 'transactions' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('transactions')}
            id="tab-btn-transactions"
          >
            Lịch sử biến động
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'deposits'}
            className={`wallet-tab-btn ${activeTab === 'deposits' ? 'wallet-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('deposits')}
            id="tab-btn-deposits"
          >
            Lịch sử nạp tiền
          </button>
        </div>

        {/* Nội dung các Tab */}
        <div className="wallet-tab-content">
          {/* TAB 1: Nạp token & Tổng quan */}
          {activeTab === 'overview' && (
            <div className="wallet-tab-pane" id="token-deposit-section">
              <TokenPackagesGrid
                packages={packages}
                onProceedPayment={handleProceedPayment}
                loading={loadingData}
              />

              <div className="wallet-recent-transactions-preview">
                <div className="recent-tx-header">
                  <h3>Giao dịch gần nhất</h3>
                  <button
                    type="button"
                    className="btn-view-all-tx"
                    onClick={() => setActiveTab('transactions')}
                  >
                    Xem tất cả ({transactions.length})
                  </button>
                </div>
                <TokenTransactionList
                  transactions={transactions.slice(0, 3)}
                  loading={loadingData}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Gói tiện ích của tôi - Chi tiết các quyền lợi đã kích hoạt */}
          {activeTab === 'my-packages' && (
            <div className="wallet-tab-pane">
              <CandidateMyPackages
                benefits={benefits}
                transactions={transactions}
                balance={balance}
                onViewFeesClick={() => setActiveTab('fees')}
                onDepositClick={handleDepositClick}
              />
            </div>
          )}

          {/* TAB 3: Biểu phí tiện ích - Bảng giá combo tiện ích tuyển dụng cố định */}
          {activeTab === 'fees' && (
            <div className="wallet-tab-pane">
              <CandidateUtilityCombos
                onSelectCombo={handleSelectCombo}
                balance={balance}
                benefits={benefits}
                onViewMyPackagesClick={() => setActiveTab('my-packages')}
              />
            </div>
          )}

          {/* TAB 4: Lịch sử biến động token */}
          {activeTab === 'transactions' && (
            <div className="wallet-tab-pane">
              <div className="section-intro">
                <h2>Lịch sử biến động</h2>
                <p>Theo dõi các giao dịch cộng và trừ token trong tài khoản.</p>
              </div>
              <TokenTransactionList
                transactions={transactions}
                onFilterChange={handleFilterTransactions}
                loading={loadingData}
              />
            </div>
          )}

          {/* TAB 5: Lịch sử nạp tiền */}
          {activeTab === 'deposits' && (
            <div className="wallet-tab-pane">
              <DepositHistoryList
                depositOrders={deposits}
                loading={loadingData}
                onRefresh={loadInitialData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận mua combo tiện ích ứng tuyển */}
      <ComboPurchaseModal
        isOpen={isComboModalOpen}
        combo={selectedCombo}
        currentBalance={balance}
        loading={comboSubmitting}
        onClose={() => {
          setIsComboModalOpen(false);
          setSelectedCombo(null);
        }}
        onConfirm={handleConfirmPurchaseCombo}
        onNavigateDeposit={handleNavigateDepositFromCombo}
      />

      {/* Modal trừ token dùng chung */}
      <TokenConsumeModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmConsume}
        featureName={modalConfig.featureName}
        featureDescription={modalConfig.featureDescription}
        tokenCost={modalConfig.tokenCost}
        currentBalance={balance}
        onNavigateDeposit={() => {
          handleDepositClick();
        }}
        loading={modalConfig.loading}
      />
    </div>
  );
};
