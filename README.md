# Hệ thống tìm việc làm trực tuyến

> Đồ án môn **Thương mại điện tử**: nền tảng kết nối **Ứng viên** và **Nhà tuyển dụng**, có thanh toán trực tuyến, chatbot AI và chat thời gian thực.

---

## Giới thiệu

Đồ án xây dựng một website tuyển dụng, nơi:

- **Ứng viên** tìm kiếm, lọc và lưu tin tuyển dụng yêu thích, ứng tuyển, theo dõi lịch sử ứng tuyển, đánh giá doanh nghiệp, được chatbot AI gợi ý việc làm và nhắn tin trực tiếp với nhà tuyển dụng.
- **Nhà tuyển dụng** đăng và quản lý tin tuyển dụng, duyệt ứng viên, theo dõi doanh thu và thống kê. Việc đăng tin sử dụng **token**, mua qua cổng thanh toán **VNPay**.
- **Quản trị viên (Admin)** quản lý người dùng, hồ sơ và tin tuyển dụng trên toàn hệ thống.

Đồ án áp dụng mô hình thương mại điện tử vào lĩnh vực tuyển dụng: tin tuyển dụng tương ứng "sản phẩm", token tương ứng "đơn hàng", wishlist tương ứng "giỏ hàng".

## Vai trò người dùng

| Vai trò | Mô tả |
|---|---|
| Ứng viên | Tìm việc, ứng tuyển, lưu wishlist, đánh giá doanh nghiệp |
| Nhà tuyển dụng (NTD) | Đăng tin, quản lý ứng viên, mua token, xem thống kê |
| Admin | Quản trị toàn bộ người dùng, hồ sơ, tin tuyển dụng |

## Chức năng chính

### Tài khoản
- Đăng ký (gửi email xác nhận), đăng nhập, đăng xuất
- Lấy lại mật khẩu
- Đăng nhập bằng Google (OAuth)
- Cập nhật hồ sơ cá nhân

### Dành cho ứng viên
- Hiển thị tin tuyển dụng mới nhất trên trang chủ
- Xem chi tiết tin tuyển dụng
- Tìm kiếm doanh nghiệp theo tên, ngành nghề
- Lọc tin theo ngành, mức lương, địa điểm, hình thức làm việc
- Sắp xếp tin (mới nhất, lương cao, phù hợp)
- Quản lý wishlist (danh sách tin yêu thích)
- Xem lịch sử ứng tuyển
- Đánh giá doanh nghiệp, xem phản hồi đánh giá

### Dành cho nhà tuyển dụng
- Quản lý tin tuyển dụng (thêm, sửa, gỡ tin, hoàn token khi gỡ)
- Quản lý ứng tuyển: xem danh sách ứng viên, chấp nhận hoặc từ chối
- Quản lý token và thanh toán trực tuyến qua **VNPay**
- Thống kê doanh thu: biểu đồ cột (theo khoảng thời gian tùy chọn) và biểu đồ tròn
- Phản hồi đánh giá của ứng viên

### Dành cho Admin
- Quản lý người dùng, hồ sơ và tin tuyển dụng

### Chức năng bổ sung
- **Chatbot AI** hỗ trợ tìm việc: gọi API **Gemini**, tư vấn và gợi ý dựa trên dữ liệu tin tuyển dụng
- **Chat trực tiếp** giữa ứng viên và nhà tuyển dụng theo thời gian thực bằng **Socket.io**

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Chat realtime | Socket.io |
| Chatbot AI | Google Gemini API |
| Thanh toán | SePay |
| Đăng nhập | Google OAuth |
| Backend | Spring Boot (Java) |
| Frontend | ReactJS (Vite) |
| Cơ sở dữ liệu | MySQL |

## Cài đặt và chạy dự án

### 1. Frontend (ReactJS)
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt toàn bộ thư viện cần thiết (react-router-dom, axios, react-icons, react-toastify, react-hook-form)
npm install

# Khởi động server giao diện (mặc định chạy ở cổng 5173)
npm run dev
```

### 2. Backend (Spring Boot)
1. Mở thư mục `backend/` bằng phần mềm IntelliJ IDEA, Eclipse hoặc IDE hỗ trợ Java.
2. Đợi IDE tự động tải các thư viện (Maven/Gradle) về máy.
3. Cấu hình file `src/main/resources/application.yml` (hoặc `.properties`) để kết nối Database.
4. Chạy class chứa hàm main (`Application.java`) hoặc dùng lệnh `./mvnw spring-boot:run` để khởi động server (mặc định cổng 8080).

### Biến môi trường cần cấu hình

| Biến | Ý nghĩa |
|---|---|
| `DB_...` | Thông tin kết nối cơ sở dữ liệu |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Đăng nhập bằng Google |
| `GEMINI_API_KEY` | Khóa API cho chatbot |

| `MAIL_USER`, `MAIL_PASS` | Tài khoản gửi email xác nhận, lấy lại mật khẩu |

> Không đưa file `.env` lên GitHub. Hãy thêm `.env` vào `.gitignore`.


## Quy ước làm việc nhóm

- Mỗi người làm trên **nhánh riêng** (ví dụ: `feature/auth`, `feature/payment`), không push trực tiếp vào `main`.
- Gộp code qua **Pull Request** và có ít nhất một thành viên xem lại.
- Viết commit rõ ràng, ví dụ: `feat: thêm đăng nhập Google`, `fix: sửa lỗi lọc theo lương`.

## Giấy phép

Dự án phục vụ mục đích học tập trong môn Thương mại điện tử.
