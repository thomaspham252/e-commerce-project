-- =====================================================================
-- TÊN DỰ ÁN : JOB PORTAL DATABASE V3
-- HỆ QUẢN TRỊ: MySQL 8.0+ / MariaDB 10.5+
-- CHARSET    : utf8mb4 / utf8mb4_unicode_ci (Hỗ trợ Tiếng Việt & Emoji)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Khởi tạo Database
CREATE DATABASE IF NOT EXISTS `job_portal_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `job_portal_db`;

-- =====================================================================
-- 1. PHÂN HỆ TÀI KHOẢN VÀ HỒ SƠ (ACCOUNTS & PROFILES)
-- =====================================================================

-- 1.1. Bảng users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID định danh tài khoản người dùng',
  `email` VARCHAR(255) NOT NULL COMMENT 'Địa chỉ email dùng để đăng nhập (duy nhất)',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã được mã hóa (Bcrypt/Argon2)',
  `role` ENUM('candidate', 'employer', 'admin') NOT NULL COMMENT 'Vai trò người dùng: Ứng viên, Nhà tuyển dụng, Quản trị viên',
  `status` ENUM('active', 'locked') NOT NULL DEFAULT 'active' COMMENT 'Trạng thái tài khoản: đang hoạt động hoặc bị khóa',
  `email_verified` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Email đã được xác minh',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo tài khoản',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu thông tin đăng ký, đăng nhập, phân quyền và quản lý trạng thái tài khoản';

CREATE TABLE `email_verifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `sent_at` DATETIME NOT NULL,
  `failed_attempts` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email_verifications_user_id` (`user_id`),
  CONSTRAINT `fk_email_verifications_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mã xác minh email đã được băm và thời hạn sử dụng';

-- 1.2. Bảng candidate_profiles
DROP TABLE IF EXISTS `candidate_profiles`;
CREATE TABLE `candidate_profiles` (
  `user_id` INT NOT NULL COMMENT 'Khóa chính đồng thời là FK 1-1 liên kết với users.id (chỉ dành cho role = candidate)',
  `full_name` VARCHAR(255) NOT NULL COMMENT 'Họ và tên đầy đủ của ứng viên',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Số điện thoại liên hệ của ứng viên',
  `dob` DATE DEFAULT NULL COMMENT 'Ngày tháng năm sinh của ứng viên',
  `address` VARCHAR(500) DEFAULT NULL COMMENT 'Địa chỉ sinh sống hiện tại',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT 'Đường dẫn URL ảnh đại diện của ứng viên',
  `summary` TEXT DEFAULT NULL COMMENT 'Giới thiệu bản thân, mục tiêu nghề nghiệp tóm tắt',
  `is_searchable` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Cho phép nhà tuyển dụng tìm kiếm thấy hồ sơ này (1: Có, 0: Không)',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_candidate_profiles_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng hồ sơ chi tiết của ứng viên (Quan hệ 1-1 với bảng users, Backend kiểm tra users.role = candidate)';

-- 1.3. Bảng cvs
DROP TABLE IF EXISTS `cvs`;
CREATE TABLE `cvs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID định danh của file CV',
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên sở hữu CV (tham chiếu candidate_profiles.user_id)',
  `file_url` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn URL lưu trữ file CV (PDF/Docx)',
  `file_name` VARCHAR(255) DEFAULT NULL COMMENT 'Tên file CV gốc khi ứng viên tải lên',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Đánh dấu CV mặc định của ứng viên (1: Mặc định, 0: Thường)',
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tải CV lên hệ thống',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cvs_id_candidate` (`id`, `candidate_id`) COMMENT 'Index kép để bảng applications ràng buộc CV thuộc đúng ứng viên',
  KEY `idx_cvs_candidate_id` (`candidate_id`),
  CONSTRAINT `fk_cvs_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu danh sách CV của ứng viên. Không ghi đè/xóa file đã gửi; upload bản mới sẽ tạo bản ghi mới. Mỗi ứng viên tối đa 1 CV có is_default = 1';

-- 1.4. Bảng skills
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID định danh kỹ năng',
  `name` VARCHAR(100) NOT NULL COMMENT 'Tên kỹ năng (VD: Java, ReactJS, Giao tiếp, Tiếng Anh)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_skills_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng từ điển danh mục kỹ năng dùng chung cho cả Hồ sơ ứng viên và Tin tuyển dụng';

-- 1.5. Bảng candidate_skills
DROP TABLE IF EXISTS `candidate_skills`;
CREATE TABLE `candidate_skills` (
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên (tham chiếu candidate_profiles.user_id)',
  `skill_id` INT NOT NULL COMMENT 'ID kỹ năng (tham chiếu skills.id)',
  `level` VARCHAR(50) DEFAULT NULL COMMENT 'Mức độ thành thạo (VD: Cơ bản, Trung bình, Thành thạo)',
  `years_exp` DECIMAL(4,1) DEFAULT NULL COMMENT 'Số năm kinh nghiệm với kỹ năng này (VD: 1.5 năm)',
  PRIMARY KEY (`candidate_id`, `skill_id`),
  KEY `idx_candidate_skills_skill_id` (`skill_id`),
  CONSTRAINT `fk_candidate_skills_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_candidate_skills_skill_id`
    FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng trung gian lưu các kỹ năng, trình độ và số năm kinh nghiệm của từng ứng viên';

-- 1.6. Bảng companies
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID định danh doanh nghiệp',
  `owner_id` INT NOT NULL COMMENT '[CHỐT] ID tài khoản chủ sở hữu doanh nghiệp (users.role = employer). Nếu chốt 1 chủ 1 DN thì thêm UNIQUE cho cột này',
  `name` VARCHAR(255) NOT NULL COMMENT 'Tên thương hiệu / tên hiển thị của doanh nghiệp',
  `legal_name` VARCHAR(255) DEFAULT NULL COMMENT 'Tên pháp lý đầy đủ trên giấy phép kinh doanh',
  `tax_code` VARCHAR(14) DEFAULT NULL COMMENT 'Mã số thuế của doanh nghiệp (10 hoặc 13 chữ số + dấu gạch ngang)',
  `description` TEXT DEFAULT NULL COMMENT 'Mô tả giới thiệu chi tiết về doanh nghiệp, văn hóa công ty',
  `logo` VARCHAR(500) DEFAULT NULL COMMENT 'Đường dẫn URL ảnh logo của doanh nghiệp',
  `website` VARCHAR(255) DEFAULT NULL COMMENT 'Địa chỉ website chính thức của doanh nghiệp',
  `address` VARCHAR(500) DEFAULT NULL COMMENT 'Địa chỉ trụ sở làm việc của doanh nghiệp',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT 'Vĩ độ trên bản đồ (phục vụ hiển thị Map / tìm việc gần đây)',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT 'Kinh độ trên bản đồ (phục vụ hiển thị Map / tìm việc gần đây)',
  `industry` VARCHAR(100) DEFAULT NULL COMMENT 'Lĩnh vực hoạt động chính (VD: Công nghệ thông tin, Tài chính)',
  `size` VARCHAR(50) DEFAULT NULL COMMENT 'Quy mô nhân sự (VD: 10-50 nhân viên, 100-500 nhân viên)',
  `business_license_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL file ảnh/PDF giấy phép đăng ký kinh doanh để xác minh',
  `verification_status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái xác minh doanh nghiệp bởi Admin',
  `verified_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm được Admin xác minh',
  `verified_by` INT DEFAULT NULL COMMENT 'ID của Admin thực hiện xác minh (users.role = admin)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_companies_tax_code` (`tax_code`),
  KEY `idx_companies_owner_id` (`owner_id`),
  KEY `idx_companies_verified_by` (`verified_by`),
  CONSTRAINT `fk_companies_owner_id`
    FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_companies_verified_by`
    FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng thông tin doanh nghiệp của Nhà tuyển dụng. Backend kiểm tra owner_id có role = employer và verified_by có role = admin';

-- =====================================================================
-- 2. PHÂN HỆ TUYỂN DỤNG (RECRUITMENT & APPLICATIONS)
-- =====================================================================

-- 2.1. Bảng jobs
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID định danh tin tuyển dụng',
  `company_id` INT NOT NULL COMMENT 'ID doanh nghiệp đăng tin tuyển dụng',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề công việc tuyển dụng',
  `description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết công việc và trách nhiệm',
  `requirements` TEXT DEFAULT NULL COMMENT 'Yêu cầu chuyên môn, kinh nghiệm và phúc lợi',
  `salary_min` DECIMAL(15,2) DEFAULT NULL COMMENT 'Mức lương tối thiểu (NULL nếu lương thỏa thuận)',
  `salary_max` DECIMAL(15,2) DEFAULT NULL COMMENT 'Mức lương tối đa (NULL nếu lương thỏa thuận)',
  `salary_unit` ENUM('hour', 'month', 'project') NOT NULL DEFAULT 'month' COMMENT 'Đơn vị tính lương: theo giờ, theo tháng hoặc theo dự án',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Khu vực / Địa điểm làm việc',
  `job_type` VARCHAR(50) DEFAULT NULL COMMENT 'Hình thức làm việc (Full-time, Part-time, Remote, Hybrid, Intern)',
  `level` VARCHAR(50) DEFAULT NULL COMMENT 'Cấp bậc (Intern, Fresher, Junior, Middle, Senior, Manager)',
  `vacancies` INT NOT NULL DEFAULT 1 COMMENT 'Số lượng nhân sự cần tuyển',
  `working_schedule` VARCHAR(255) DEFAULT NULL COMMENT 'Thời gian làm việc (VD: Thứ 2 - Thứ 6, 8:30 - 17:30)',
  `deadline` DATE DEFAULT NULL COMMENT 'Hạn chót nhận hồ sơ ứng tuyển',
  `status` ENUM('draft', 'pending_review', 'open', 'closed', 'rejected', 'expired') NOT NULL DEFAULT 'draft' COMMENT 'Trạng thái tin tuyển dụng',
  `is_highlighted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Tin được làm nổi bật/bôi đậm (quyền lợi từ gói dịch vụ)',
  `is_prioritized` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Tin được ưu tiên đẩy lên đầu kết quả tìm kiếm (quyền lợi gói)',
  `reviewed_by` INT DEFAULT NULL COMMENT 'ID của Admin đã duyệt hoặc từ chối tin',
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm Admin duyệt tin',
  `rejection_reason` TEXT DEFAULT NULL COMMENT 'Lý do Admin từ chối duyệt tin tuyển dụng (nếu bị rejected)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo tin tuyển dụng',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật tin gần nhất',
  PRIMARY KEY (`id`),
  KEY `idx_jobs_company_id` (`company_id`),
  KEY `idx_jobs_reviewed_by` (`reviewed_by`),
  KEY `idx_jobs_title` (`title`),
  KEY `idx_jobs_location` (`location`),
  KEY `idx_jobs_status` (`status`),
  CONSTRAINT `fk_jobs_company_id`
    FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_jobs_reviewed_by`
    FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu trữ tin tuyển dụng. Lưu ý [CHỐT]: job_post_limit của gói là số tin miễn phí trong gói; vượt quá hạn mức sẽ trừ vào ví token';

-- 2.2. Bảng job_skills
DROP TABLE IF EXISTS `job_skills`;
CREATE TABLE `job_skills` (
  `job_id` INT NOT NULL COMMENT 'ID tin tuyển dụng (tham chiếu jobs.id)',
  `skill_id` INT NOT NULL COMMENT 'ID kỹ năng yêu cầu (tham chiếu skills.id)',
  PRIMARY KEY (`job_id`, `skill_id`),
  KEY `idx_job_skills_skill_id` (`skill_id`),
  CONSTRAINT `fk_job_skills_job_id`
    FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_job_skills_skill_id`
    FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng trung gian liên kết các kỹ năng yêu cầu của một tin tuyển dụng';

-- 2.3. Bảng wishlists
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên lưu tin (tham chiếu candidate_profiles.user_id)',
  `job_id` INT NOT NULL COMMENT 'ID tin tuyển dụng được lưu (tham chiếu jobs.id)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ứng viên bấm lưu tin',
  PRIMARY KEY (`candidate_id`, `job_id`),
  KEY `idx_wishlists_job_id` (`job_id`),
  CONSTRAINT `fk_wishlists_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlists_job_id`
    FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu danh sách việc làm yêu thích / quan tâm của ứng viên';

-- 2.4. Bảng applications
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID định danh hồ sơ ứng tuyển',
  `job_id` INT NOT NULL COMMENT 'ID tin tuyển dụng mà ứng viên nộp vào',
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên nộp hồ sơ',
  `cv_id` INT NOT NULL COMMENT '[CHỐT] ID bản CV được dùng để nộp (bắt buộc nộp CV, thuộc đúng ứng viên)',
  `cover_letter` TEXT DEFAULT NULL COMMENT 'Thư giới thiệu đính kèm khi nộp đơn ứng tuyển',
  `status` ENUM('pending', 'viewed', 'invited', 'rejected', 'hired') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái đơn ứng tuyển (hired = đã tuyển; chi tiết phỏng vấn ở interview_invitations)',
  `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm nộp đơn ứng tuyển',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật trạng thái đơn gần nhất',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_applications_job_candidate` (`job_id`, `candidate_id`),
  KEY `idx_applications_candidate_id` (`candidate_id`),
  KEY `idx_applications_job_id` (`job_id`),
  KEY `idx_applications_cv_candidate` (`cv_id`, `candidate_id`),
  CONSTRAINT `fk_applications_job_id`
    FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_applications_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_applications_cv_owner`
    FOREIGN KEY (`cv_id`, `candidate_id`) REFERENCES `cvs` (`id`, `candidate_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu thông tin nộp đơn ứng tuyển của ứng viên vào công việc. Có khóa ngoại kép đảm bảo CV nộp vào thuộc đúng quyền sở hữu của ứng viên đó';

-- 2.5. Bảng application_status_history
DROP TABLE IF EXISTS `application_status_history`;
CREATE TABLE `application_status_history` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID lịch sử chuyển trạng thái',
  `application_id` INT NOT NULL COMMENT 'ID đơn ứng tuyển (tham chiếu applications.id)',
  `from_status` ENUM('pending', 'viewed', 'invited', 'rejected', 'hired') DEFAULT NULL COMMENT 'Trạng thái trước khi thay đổi (NULL nếu mới tạo)',
  `to_status` ENUM('pending', 'viewed', 'invited', 'rejected', 'hired') NOT NULL COMMENT 'Trạng thái mới sau khi thay đổi',
  `changed_by` INT NOT NULL COMMENT 'ID người dùng thực hiện thay đổi trạng thái',
  `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thay đổi trạng thái',
  `note` TEXT DEFAULT NULL COMMENT 'Ghi chú kèm theo khi chuyển trạng thái (nếu có)',
  PRIMARY KEY (`id`),
  KEY `idx_app_status_history_app_id` (`application_id`),
  KEY `idx_app_status_history_changed_by` (`changed_by`),
  CONSTRAINT `fk_app_status_history_application_id`
    FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_status_history_changed_by`
    FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu vết lịch sử thay đổi trạng thái của từng hồ sơ ứng tuyển (Audit log cho quy trình tuyển dụng)';

-- 2.6. Bảng interview_invitations
DROP TABLE IF EXISTS `interview_invitations`;
CREATE TABLE `interview_invitations` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID lời mời phỏng vấn',
  `application_id` INT NOT NULL COMMENT 'ID đơn ứng tuyển nhận lời mời phỏng vấn',
  `scheduled_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian hẹn phỏng vấn dự kiến',
  `location` VARCHAR(500) DEFAULT NULL COMMENT 'Địa điểm phỏng vấn trực tiếp hoặc đường link họp Online (Google Meet/Zoom)',
  `notes` TEXT DEFAULT NULL COMMENT 'Dặn dò thêm cho ứng viên khi đi phỏng vấn',
  `status` ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending' COMMENT 'Phản hồi của ứng viên đối với lời mời phỏng vấn',
  PRIMARY KEY (`id`),
  KEY `idx_interview_invitations_app_id` (`application_id`),
  CONSTRAINT `fk_interview_invitations_application_id`
    FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý lịch hẹn, địa điểm và trạng thái phản hồi lời mời phỏng vấn của ứng viên';

-- 2.7. Bảng candidate_profile_views
DROP TABLE IF EXISTS `candidate_profile_views`;
CREATE TABLE `candidate_profile_views` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID lượt xem hồ sơ ứng viên',
  `subscription_id` INT NOT NULL COMMENT 'ID gói đăng ký dịch vụ đang sử dụng để mở khóa/xem hồ sơ',
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên được xem hồ sơ',
  `viewed_by` INT NOT NULL COMMENT 'ID tài khoản nhà tuyển dụng thực hiện xem',
  `viewed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm mở xem hồ sơ lần đầu trong gói',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profile_views_sub_candidate` (`subscription_id`, `candidate_id`) COMMENT '[CHỐT] Xem lại cùng 1 hồ sơ trong cùng 1 gói đăng ký sẽ không bị trừ thêm lượt',
  KEY `idx_profile_views_candidate_id` (`candidate_id`),
  KEY `idx_profile_views_viewed_by` (`viewed_by`),
  CONSTRAINT `fk_profile_views_subscription_id`
    FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_profile_views_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_profile_views_viewed_by`
    FOREIGN KEY (`viewed_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng theo dõi lượt nhà tuyển dụng mở xem hồ sơ ứng viên để kiểm soát giới hạn cv_view_limit của gói dịch vụ';

-- =====================================================================
-- 3. PHÂN HỆ ĐÁNH GIÁ DOANH NGHIỆP (COMPANY REVIEWS)
-- =====================================================================

-- 3.1. Bảng company_reviews
DROP TABLE IF EXISTS `company_reviews`;
CREATE TABLE `company_reviews` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID bài đánh giá doanh nghiệp',
  `company_id` INT NOT NULL COMMENT 'ID doanh nghiệp được đánh giá',
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên viết đánh giá',
  `rating` SMALLINT NOT NULL COMMENT 'Điểm đánh giá sao (từ 1 đến 5 sao)',
  `content` TEXT DEFAULT NULL COMMENT 'Nội dung nhận xét chi tiết về doanh nghiệp',
  `status` ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible' COMMENT 'Trạng thái hiển thị bài đánh giá (visible: hiển thị, hidden: bị ẩn bởi Admin)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi đánh giá',
  PRIMARY KEY (`id`),
  KEY `idx_company_reviews_company_id` (`company_id`),
  KEY `idx_company_reviews_candidate_id` (`candidate_id`),
  CONSTRAINT `chk_company_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
  CONSTRAINT `fk_company_reviews_company_id`
    FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_company_reviews_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu đánh giá và chấm điểm (1-5 sao) của ứng viên dành cho doanh nghiệp';

-- 3.2. Bảng review_replies
DROP TABLE IF EXISTS `review_replies`;
CREATE TABLE `review_replies` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID phản hồi đánh giá',
  `review_id` INT NOT NULL COMMENT 'ID bài đánh giá được phản hồi (mỗi đánh giá tối đa 1 phản hồi)',
  `employer_id` INT NOT NULL COMMENT 'ID tài khoản nhà tuyển dụng đại diện doanh nghiệp trả lời',
  `content` TEXT NOT NULL COMMENT 'Nội dung phản hồi của doanh nghiệp',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm phản hồi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_review_replies_review_id` (`review_id`),
  KEY `idx_review_replies_employer_id` (`employer_id`),
  CONSTRAINT `fk_review_replies_review_id`
    FOREIGN KEY (`review_id`) REFERENCES `company_reviews` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_review_replies_employer_id`
    FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu phản hồi chính thức của doanh nghiệp đối với đánh giá của ứng viên (Quan hệ 1-1 với company_reviews)';

-- =====================================================================
-- 4. PHÂN HỆ TRÒ CHUYỆN & TRỢ LÝ ẢO AI (CHAT & AI CHATBOT)
-- =====================================================================

-- 4.1. Bảng conversations
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID cuộc trò chuyện trực tiếp',
  `candidate_id` INT NOT NULL COMMENT 'ID ứng viên tham gia cuộc trò chuyện',
  `employer_id` INT NOT NULL COMMENT 'ID nhà tuyển dụng tham gia cuộc trò chuyện',
  `job_id` INT DEFAULT NULL COMMENT 'ID tin tuyển dụng khởi nguồn cuộc trò chuyện (có thể NULL)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm bắt đầu cuộc trò chuyện',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conversations_pair` (`candidate_id`, `employer_id`) COMMENT '[CHỐT] Mỗi cặp Ứng viên - Nhà tuyển dụng chỉ có 1 phòng chat chung, tránh tạo trùng',
  KEY `idx_conversations_employer_id` (`employer_id`),
  KEY `idx_conversations_job_id` (`job_id`),
  CONSTRAINT `fk_conversations_candidate_id`
    FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conversations_employer_id`
    FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conversations_job_id`
    FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý phòng chat trực tiếp giữa cặp Ứng viên và Nhà tuyển dụng';

-- 4.2. Bảng messages
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID tin nhắn',
  `conversation_id` INT NOT NULL COMMENT 'ID cuộc trò chuyện chứa tin nhắn này',
  `sender_id` INT NOT NULL COMMENT 'ID người gửi tin nhắn (Backend kiểm tra thuộc cuộc trò chuyện)',
  `content` TEXT NOT NULL COMMENT 'Nội dung tin nhắn văn bản',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Trạng thái đã xem (1: Đã đọc, 0: Chưa đọc)',
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi tin nhắn',
  PRIMARY KEY (`id`),
  KEY `idx_messages_conv_sent` (`conversation_id`, `sent_at`),
  KEY `idx_messages_sender_id` (`sender_id`),
  CONSTRAINT `fk_messages_conversation_id`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender_id`
    FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu chi tiết lịch sử tin nhắn trao đổi giữa Ứng viên và Nhà tuyển dụng';

-- 4.3. Bảng chatbot_sessions
DROP TABLE IF EXISTS `chatbot_sessions`;
CREATE TABLE `chatbot_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID phiên trò chuyện với Chatbot AI',
  `user_id` INT NOT NULL COMMENT 'ID người dùng sở hữu phiên chat',
  `title` VARCHAR(255) DEFAULT NULL COMMENT 'Tiêu đề tóm tắt của phiên hỏi đáp với Chatbot',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm khởi tạo phiên chat',
  PRIMARY KEY (`id`),
  KEY `idx_chatbot_sessions_user_id` (`user_id`),
  CONSTRAINT `fk_chatbot_sessions_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu các phiên hội thoại (Sessions) giữa người dùng và Trợ lý ảo Chatbot AI';

-- 4.4. Bảng chatbot_messages
DROP TABLE IF EXISTS `chatbot_messages`;
CREATE TABLE `chatbot_messages` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID tin nhắn trong phiên Chatbot',
  `session_id` INT NOT NULL COMMENT 'ID phiên hội thoại Chatbot',
  `role` ENUM('user', 'bot') NOT NULL COMMENT 'Người phát ngôn tin nhắn: người dùng (user) hoặc trợ lý ảo (bot)',
  `type` ENUM('text', 'job_suggestion', 'action') NOT NULL DEFAULT 'text' COMMENT 'Phân loại tin nhắn để Frontend render giao diện tương ứng',
  `content` TEXT NOT NULL COMMENT 'Nội dung văn bản hiển thị của tin nhắn',
  `metadata` JSON DEFAULT NULL COMMENT 'Dữ liệu mở rộng dạng JSON (VD: bộ lọc đã chọn, URL điều hướng nút bấm)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo tin nhắn',
  PRIMARY KEY (`id`),
  KEY `idx_chatbot_messages_session_id` (`session_id`),
  CONSTRAINT `fk_chatbot_messages_session_id`
    FOREIGN KEY (`session_id`) REFERENCES `chatbot_sessions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu nội dung tin nhắn hỏi đáp với Chatbot, hỗ trợ cả văn bản thuần, thẻ gợi ý việc làm và nút hành động';

-- 4.5. Bảng chatbot_suggested_jobs
DROP TABLE IF EXISTS `chatbot_suggested_jobs`;
CREATE TABLE `chatbot_suggested_jobs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID bản ghi gợi ý việc làm',
  `message_id` INT NOT NULL COMMENT 'ID tin nhắn phản hồi của Bot chứa danh sách gợi ý này',
  `job_id` INT NOT NULL COMMENT 'ID công việc cụ thể được Bot gợi ý',
  `relevance_score` DECIMAL(5,2) DEFAULT NULL COMMENT 'Điểm đánh giá mức độ phù hợp do AI/Bot chấm (nếu có)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo gợi ý',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_chatbot_suggested_msg_job` (`message_id`, `job_id`) COMMENT 'Tránh 1 tin nhắn của Bot gợi ý trùng lặp cùng 1 công việc',
  KEY `idx_chatbot_suggested_job_id` (`job_id`),
  CONSTRAINT `fk_chatbot_suggested_message_id`
    FOREIGN KEY (`message_id`) REFERENCES `chatbot_messages` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chatbot_suggested_job_id`
    FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng liên kết tin nhắn của Chatbot với các công việc cụ thể để Frontend join với bảng jobs hiển thị dạng Card có thể click';

-- 4.6. Bảng chatbot_message_feedbacks
DROP TABLE IF EXISTS `chatbot_message_feedbacks`;
CREATE TABLE `chatbot_message_feedbacks` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID đánh giá phản hồi của Bot',
  `message_id` INT NOT NULL COMMENT 'ID tin nhắn trả lời của Bot được người dùng đánh giá (tối đa 1 đánh giá/tin nhắn)',
  `user_id` INT NOT NULL COMMENT 'ID người dùng thực hiện đánh giá',
  `rating` ENUM('like', 'dislike') NOT NULL COMMENT 'Loại đánh giá: Hữu ích (like) hoặc Không hữu ích (dislike)',
  `reason` TEXT DEFAULT NULL COMMENT 'Lý do chi tiết khi người dùng bấm Dislike (VD: Không đúng ngành nghề, Lương thấp)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi phản hồi đánh giá',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_chatbot_feedbacks_message_id` (`message_id`),
  KEY `idx_chatbot_feedbacks_user_id` (`user_id`),
  CONSTRAINT `fk_chatbot_feedbacks_message_id`
    FOREIGN KEY (`message_id`) REFERENCES `chatbot_messages` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chatbot_feedbacks_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu phản hồi Like/Dislike của người dùng cho từng câu trả lời của Chatbot nhằm cải thiện chất lượng gợi ý AI';

-- =====================================================================
-- 5. PHÂN HỆ GÓI ĐĂNG KÝ, KHUYẾN MÃI, ĐƠN HÀNG & THANH TOÁN
-- =====================================================================

-- 5.1. Bảng packages
DROP TABLE IF EXISTS `packages`;
CREATE TABLE `packages` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID gói dịch vụ thành viên (Subscription Package)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Tên gói dịch vụ (VD: Basic, Pro, Enterprise)',
  `price` DECIMAL(15,2) NOT NULL COMMENT 'Giá bán niêm yết của gói (VNĐ)',
  `duration_days` INT NOT NULL COMMENT 'Thời hạn sử dụng gói tính theo số ngày (VD: 30 ngày, 90 ngày, 365 ngày)',
  `job_post_limit` INT DEFAULT NULL COMMENT '[CHỐT] Số lượng tin tuyển dụng được đăng miễn phí trong gói',
  `cv_view_limit` INT DEFAULT NULL COMMENT 'Số lượng hồ sơ ứng viên tối đa được mở xem (theo dõi qua candidate_profile_views)',
  `included_tokens` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng Token được tặng kèm ngay khi mua gói (nếu có)',
  `can_highlight_jobs` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Quyền lợi làm nổi bật tin tuyển dụng (1: Có, 0: Không)',
  `can_prioritize_jobs` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Quyền lợi ưu tiên hiển thị tin lên đầu (1: Có, 0: Không)',
  `can_search_candidates` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Quyền lợi tìm kiếm trong kho hồ sơ ứng viên (1: Có, 0: Không)',
  `can_direct_contact` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Quyền lợi chủ động nhắn tin trực tiếp với ứng viên (1: Có, 0: Không)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái gói đang mở bán hay đã ngừng kinh doanh',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng cấu hình danh mục các gói dịch vụ định kỳ dành cho Nhà tuyển dụng';

-- 5.2. Bảng token_packages
DROP TABLE IF EXISTS `token_packages`;
CREATE TABLE `token_packages` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID gói nạp Token lẻ',
  `tokens` INT NOT NULL COMMENT 'Số lượng Token nhận được khi mua gói này',
  `price` DECIMAL(15,2) NOT NULL COMMENT 'Giá tiền của gói nạp Token (VNĐ)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái gói nạp đang mở bán (1: Có, 0: Ngừng bán)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng danh mục các mệnh giá gói nạp Token mua lẻ';

-- 5.3. Bảng promotions
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID chương trình / mã khuyến mãi',
  `code` VARCHAR(50) NOT NULL COMMENT 'Mã giảm giá nhập khi thanh toán (duy nhất, VD: WELCOME2026)',
  `discount_type` ENUM('percent', 'fixed_amount') NOT NULL COMMENT 'Hình thức giảm giá: theo phần trăm (percent) hoặc số tiền cố định (fixed_amount)',
  `discount_value` DECIMAL(15,2) NOT NULL COMMENT 'Giá trị giảm (số % hoặc số tiền VNĐ tương ứng với discount_type)',
  `min_order_amount` DECIMAL(15,2) DEFAULT NULL COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng mã khuyến mãi',
  `max_discount_amount` DECIMAL(15,2) DEFAULT NULL COMMENT 'Số tiền giảm tối đa (áp dụng khi giảm theo phần trăm)',
  `start_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm bắt đầu có hiệu lực của mã',
  `end_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm kết thúc hiệu lực của mã',
  `usage_limit` INT DEFAULT NULL COMMENT 'Tổng số lượt sử dụng tối đa trên toàn hệ thống',
  `per_user_limit` INT DEFAULT NULL COMMENT 'Số lượt sử dụng tối đa cho mỗi tài khoản người dùng',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái kích hoạt mã khuyến mãi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý mã giảm giá (Voucher/Coupon) áp dụng khi mua gói dịch vụ hoặc nạp Token';

-- 5.4. Bảng orders (Tạo trước promotion_usages để đáp ứng khóa ngoại)
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID đơn hàng',
  `order_code` VARCHAR(50) NOT NULL COMMENT 'Mã đơn hàng hiển thị cho khách và đối soát cổng thanh toán (duy nhất)',
  `user_id` INT NOT NULL COMMENT 'ID người dùng tạo đơn hàng',
  `order_type` ENUM('subscription', 'token') NOT NULL COMMENT 'Loại đơn hàng: mua gói thành viên (subscription) hoặc mua lẻ token (token)',
  `package_id` INT DEFAULT NULL COMMENT 'ID gói thành viên (có giá trị khi order_type = subscription)',
  `token_package_id` INT DEFAULT NULL COMMENT 'ID gói nạp token (có giá trị khi order_type = token)',
  `subtotal` DECIMAL(15,2) NOT NULL COMMENT 'Tổng tiền gốc trước khi áp dụng giảm giá',
  `discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền được giảm từ mã khuyến mãi',
  `total_amount` DECIMAL(15,2) NOT NULL COMMENT 'Số tiền thực tế khách phải thanh toán (subtotal - discount_amount)',
  `promotion_id` INT DEFAULT NULL COMMENT 'ID mã khuyến mãi đã áp dụng cho đơn hàng (nếu có)',
  `product_snapshot` JSON NOT NULL COMMENT 'Bản chụp (Snapshot) lưu cứng giá và quyền lợi của gói tại thời điểm mua',
  `status` ENUM('pending', 'paid', 'fulfilled', 'cancelled', 'failed', 'refunded') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái xử lý của đơn hàng',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo đơn hàng',
  `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm thanh toán thành công',
  `fulfilled_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm hệ thống đã cấp gói/cộng token thành công (chỉ cấp 1 lần duy nhất)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orders_order_code` (`order_code`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_package_id` (`package_id`),
  KEY `idx_orders_token_package_id` (`token_package_id`),
  KEY `idx_orders_promotion_id` (`promotion_id`),
  CONSTRAINT `chk_order_amounts` CHECK (`subtotal` >= 0 AND `discount_amount` >= 0 AND `discount_amount` <= `subtotal`),
  CONSTRAINT `chk_order_total` CHECK (`total_amount` = `subtotal` - `discount_amount`),
  CONSTRAINT `fk_orders_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_package_id`
    FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_token_package_id`
    FOREIGN KEY (`token_package_id`) REFERENCES `token_packages` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_promotion_id`
    FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu thông tin đơn hàng mua gói dịch vụ hoặc nạp Token, kèm snapshot quyền lợi tại thời điểm giao dịch';

-- 5.5. Bảng promotion_usages
DROP TABLE IF EXISTS `promotion_usages`;
CREATE TABLE `promotion_usages` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID lịch sử dùng mã khuyến mãi',
  `promotion_id` INT NOT NULL COMMENT 'ID mã khuyến mãi được sử dụng',
  `user_id` INT NOT NULL COMMENT 'ID người dùng đã sử dụng mã',
  `order_id` INT NOT NULL COMMENT 'ID đơn hàng áp dụng mã (mỗi đơn hàng dùng tối đa 1 mã)',
  `used_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm áp dụng mã thành công',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotion_usages_order_id` (`order_id`),
  KEY `idx_promotion_usages_promo_user` (`promotion_id`, `user_id`),
  KEY `idx_promotion_usages_user_id` (`user_id`),
  CONSTRAINT `fk_promotion_usages_promotion_id`
    FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_promotion_usages_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_promotion_usages_order_id`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng ghi nhận lịch sử sử dụng mã khuyến mãi thực tế theo từng đơn hàng (thay thế cho cột đếm used_count tĩnh)';

-- 5.6. Bảng payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID giao dịch thanh toán',
  `order_id` INT NOT NULL COMMENT 'ID đơn hàng thực hiện thanh toán',
  `amount` DECIMAL(15,2) NOT NULL COMMENT 'Số tiền giao dịch qua cổng thanh toán',
  `gateway` VARCHAR(50) DEFAULT NULL COMMENT 'Tên cổng thanh toán sử dụng (VD: VNPay, MoMo, ZaloPay, VietQR)',
  `transaction_code` VARCHAR(100) DEFAULT NULL COMMENT 'Mã giao dịch tham chiếu trả về từ cổng thanh toán',
  `status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái giao dịch thanh toán',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm khởi tạo lượt thanh toán',
  `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm cổng thanh toán xác nhận thành công (IPN/Webhook)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payments_gateway_tx_code` (`gateway`, `transaction_code`),
  KEY `idx_payments_order_id` (`order_id`),
  CONSTRAINT `fk_payments_order_id`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu lịch sử các lần giao dịch qua cổng thanh toán (Một đơn hàng có thể có nhiều lần thử thanh toán lại nếu thất bại)';

-- 5.7. Bảng subscriptions
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID gói đăng ký đang kích hoạt của nhà tuyển dụng',
  `employer_id` INT NOT NULL COMMENT 'ID tài khoản nhà tuyển dụng sở hữu gói',
  `package_id` INT NOT NULL COMMENT 'ID gói dịch vụ đăng ký',
  `order_id` INT NOT NULL COMMENT 'ID đơn hàng đã thanh toán thành công sinh ra gói này (1-1)',
  `start_at` TIMESTAMP NOT NULL COMMENT 'Thời điểm bắt đầu hiệu lực của gói dịch vụ',
  `end_at` TIMESTAMP NOT NULL COMMENT 'Thời điểm hết hạn của gói dịch vụ',
  `status` ENUM('active', 'cancelled', 'expired') NOT NULL DEFAULT 'active' COMMENT 'Trạng thái gói đăng ký hiện tại',
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL COMMENT '[CHỐT] Thời điểm hủy gói (Nhóm cần chốt: hủy là dùng tiếp đến end_at hay kết thúc hiệu lực ngay)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subscriptions_order_id` (`order_id`),
  KEY `idx_subscriptions_employer_id` (`employer_id`),
  KEY `idx_subscriptions_package_id` (`package_id`),
  CONSTRAINT `fk_subscriptions_employer_id`
    FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_package_id`
    FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_order_id`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý thời hạn và trạng thái gói dịch vụ của Nhà tuyển dụng (Chỉ được cấp sau khi đơn hàng thanh toán thành công)';

-- =====================================================================
-- 6. PHÂN HỆ VÍ TOKEN & LỊCH SỬ GIAO DỊCH TOKEN (TOKEN SYSTEM)
-- =====================================================================

-- 6.1. Bảng token_wallets
DROP TABLE IF EXISTS `token_wallets`;
CREATE TABLE `token_wallets` (
  `user_id` INT NOT NULL COMMENT 'ID người dùng sở hữu ví Token (Quan hệ 1-1 với bảng users)',
  `balance` INT NOT NULL DEFAULT 0 COMMENT 'Số dư Token hiện tại trong ví (bắt buộc lớn hơn hoặc bằng 0)',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `chk_token_wallets_balance` CHECK (`balance` >= 0),
  CONSTRAINT `fk_token_wallets_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý số dư ví Token của người dùng';

-- 6.2. Bảng token_transactions
DROP TABLE IF EXISTS `token_transactions`;
CREATE TABLE `token_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID biến động số dư Token',
  `wallet_id` INT NOT NULL COMMENT 'ID ví Token (tham chiếu token_wallets.user_id)',
  `type` ENUM('welcome', 'purchase', 'spend', 'refund', 'adjustment') NOT NULL COMMENT 'Loại giao dịch: Tặng tân thủ, Mua thêm, Chi tiêu, Hoàn trả, Admin điều chỉnh',
  `amount` INT NOT NULL COMMENT 'Số lượng Token biến động (Cộng vào ví = số dương, Trừ khỏi ví = số âm)',
  `balance_after` INT NOT NULL COMMENT 'Số dư ví ngay sau khi thực hiện giao dịch này',
  `idempotency_key` VARCHAR(100) NOT NULL COMMENT 'Khóa chống xử lý trùng lặp giao dịch (VD: welcome:{user_id}, order:{order_id})',
  `order_id` INT DEFAULT NULL COMMENT 'ID đơn hàng liên quan (dành cho giao dịch mua gói/nạp token)',
  `ref_type` VARCHAR(50) DEFAULT NULL COMMENT 'Loại đối tượng tham chiếu mềm khi chi tiêu/hoàn trả (VD: job, application)',
  `ref_id` INT DEFAULT NULL COMMENT 'ID của đối tượng tham chiếu mềm tương ứng với ref_type',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi nhận biến động số dư',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_tx_idempotency_key` (`idempotency_key`),
  KEY `idx_token_tx_wallet_id` (`wallet_id`),
  KEY `idx_token_tx_order_id` (`order_id`),
  KEY `idx_token_tx_ref` (`ref_type`, `ref_id`),
  CONSTRAINT `fk_token_tx_wallet_id`
    FOREIGN KEY (`wallet_id`) REFERENCES `token_wallets` (`user_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_token_tx_order_id`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng sổ cái (Ledger) lưu toàn bộ lịch sử cộng/trừ Token. Lưu ý: Cập nhật ví + ghi giao dịch + hành động nghiệp vụ phải nằm trong cùng 1 Database Transaction';

-- =====================================================================
-- 7. TRIGGER KIỂM TRA RÀNG BUỘC LOẠI SẢN PHẨM TRONG ĐƠN HÀNG (ORDERS)
-- =====================================================================
-- Lưu ý kỹ thuật MySQL: MySQL không cho phép dùng cột có Foreign Key
-- (package_id, token_package_id) bên trong mệnh đề CHECK (Lỗi MySQL 3823).
-- Do đó, ràng buộc chk_order_product_type được chuyển thành Trigger dưới đây.

DELIMITER $$

DROP TRIGGER IF EXISTS `trg_orders_before_insert_check_type`$$
CREATE TRIGGER `trg_orders_before_insert_check_type`
BEFORE INSERT ON `orders`
FOR EACH ROW
BEGIN
  IF NOT (
    (NEW.order_type = 'subscription' AND NEW.package_id IS NOT NULL AND NEW.token_package_id IS NULL) OR
    (NEW.order_type = 'token' AND NEW.token_package_id IS NOT NULL AND NEW.package_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'chk_order_product_type: Đơn subscription phải có package_id (token_package_id = NULL) và ngược lại cho đơn token.';
  END IF;
END$$

DROP TRIGGER IF EXISTS `trg_orders_before_update_check_type`$$
CREATE TRIGGER `trg_orders_before_update_check_type`
BEFORE UPDATE ON `orders`
FOR EACH ROW
BEGIN
  IF NOT (
    (NEW.order_type = 'subscription' AND NEW.package_id IS NOT NULL AND NEW.token_package_id IS NULL) OR
    (NEW.order_type = 'token' AND NEW.token_package_id IS NOT NULL AND NEW.package_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'chk_order_product_type: Đơn subscription phải có package_id (token_package_id = NULL) và ngược lại cho đơn token.';
  END IF;
END$$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;