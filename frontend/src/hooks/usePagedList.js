import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/apiClient';

const EMPTY_PAGE = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };

/**
 * Tải danh sách phân trang từ backend.
 * fetcher({ ...filters, keyword, page, size }) phải trả về PageResponse.
 * Từ khóa được debounce 400ms; đổi bộ lọc/từ khóa sẽ quay về trang đầu.
 */
export const usePagedList = (fetcher, filters = {}, size = 10) => {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, filterKey]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher({ ...JSON.parse(filterKey), keyword: debouncedKeyword, page, size })
      .then((res) => {
        if (!active) return;
        setResult(res);
        setError('');
      })
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // fetcher là hàm service cố định, không cần đưa vào deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, filterKey, page, size, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    rows: result.content,
    loading,
    error,
    keyword,
    setKeyword,
    reload,
    pagination: { ...result, page, size, onPageChange: setPage },
  };
};
