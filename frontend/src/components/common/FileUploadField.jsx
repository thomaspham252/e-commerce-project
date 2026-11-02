import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, FileText, CheckCircle2, Loader2, X, RefreshCw, ExternalLink } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import './FileUploadField.css';

/**
 * Component trường tải tệp/ảnh lên tự động cho mọi form.
 * Tải file lên backend, tự động điền đường dẫn URL vào form.
 *
 * @param {string} label - Tiêu đề trường (vd: "Logo doanh nghiệp")
 * @param {string} value - Đường dẫn URL hiện tại (vd: "/uploads/images/abc.png")
 * @param {Function} onChange - Callback cập nhật URL (url: string) => void
 * @param {string} accept - Định dạng file chấp nhận (vd: "image/*" hoặc "image/*,.pdf")
 * @param {boolean} isImage - true nếu là ảnh (hiển thị thumbnail preview)
 * @param {string} helperText - Gợi ý dưới trường
 * @param {string} error - Lỗi xác thực nếu có
 */
export const FileUploadField = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  isImage = true,
  helperText = 'Hỗ trợ PNG, JPG, WebP tối đa 10MB',
  error,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      let result;
      if (isImage) {
        result = await uploadService.uploadImage(file);
      } else {
        result = await uploadService.uploadFile(file);
      }

      if (result?.url) {
        onChange(result.url);
      }
    } catch (err) {
      console.error('Lỗi khi tải file:', err);
      setUploadError(err.message || 'Tải file lên thất bại.');
    } finally {
      setUploading(false);
      // Reset input để có thể chọn lại cùng một file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setUploadError(null);
  };

  const hasValue = Boolean(value && value.trim());

  return (
    <div className="file-upload-field-container">
      <div className="fuf-label-row">
        {label && <label className="fuf-label">{label}</label>}
        <button
          type="button"
          className="fuf-toggle-btn"
          onClick={() => setManualMode(!manualMode)}
        >
          {manualMode ? 'Chọn tệp từ máy' : 'Nhập URL trực tiếp'}
        </button>
      </div>

      {/* Ẩn input file */}
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {manualMode ? (
        /* Chế độ nhập tay URL trực tiếp */
        <input
          type="text"
          className={`itv-input-text ${error ? 'error' : ''}`}
          placeholder="https://... hoặc /images/..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : hasValue ? (
        /* Đã có file/ảnh: hiển thị hộp preview */
        <div className="fuf-preview-box">
          {isImage ? (
            <img
              src={value}
              alt="Preview"
              className="fuf-preview-thumb"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="fuf-preview-file-icon">
              <FileText size={22} />
            </div>
          )}

          <div className="fuf-preview-info">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="fuf-preview-url"
              title={value}
            >
              {value.split('/').pop()}
            </a>
            <span className="fuf-preview-status">
              <CheckCircle2 size={13} /> Đã sẵn sàng
            </span>
          </div>

          <div className="fuf-preview-actions">
            <button
              type="button"
              className="fuf-btn-action"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Tải ảnh khác thay thế"
            >
              <RefreshCw size={13} /> Thay đổi
            </button>
            <button
              type="button"
              className="fuf-btn-action fuf-btn-delete"
              onClick={handleRemove}
              disabled={uploading}
              title="Xóa tệp này"
            >
              <X size={13} /> Xóa
            </button>
          </div>
        </div>
      ) : (
        /* Chưa có file: hiển thị vùng dropzone để click tải lên */
        <div
          className={`fuf-dropzone ${uploading ? 'is-uploading' : ''}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="fuf-icon-circle">
            {uploading ? (
              <Loader2 size={20} className="jobs-spinner" />
            ) : isImage ? (
              <ImageIcon size={20} />
            ) : (
              <Upload size={20} />
            )}
          </div>
          <span className="fuf-prompt-main">
            {uploading ? (
              'Đang tải tệp lên dự án...'
            ) : (
              <>
                <span className="fuf-prompt-highlight">Bấm để chọn tệp</span> hoặc kéo thả vào đây
              </>
            )}
          </span>
          <span className="fuf-prompt-hint">{helperText}</span>
        </div>
      )}

      {(error || uploadError) && (
        <span className="fuf-error-text">{error || uploadError}</span>
      )}
    </div>
  );
};

