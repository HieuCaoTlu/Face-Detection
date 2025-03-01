# Hướng Dẫn Cài Đặt và Sử Dụng Dự Án 📘

## Tài Khoản Thử Nghiệm 🚀
- Admin: admin | trunghieu7a1
- Giảng viên và Sinh viên: Vui lòng tạo tài khoản qua giao diện Admin.


## Cài Đặt Dự Án 🛠️
### Trước Khi Khởi Động Backend:
1. Tạo file .env trong thư mục root/backend (cùng cấp với manage.py).
2. Cấu Hình Cloudinary: Tạo tài khoản Cloudinary và điền các thông tin vào file .env:
```bash
CLOUDINARY_NAME=abc
CLOUDINARY_API_KEY=abc
CLOUDINARY_API_SECRET=abc
```

### Cách Khởi Động Dự Án 🏃‍♂️
```bash
docker compose up --build # Xây dựng Docker và cài đặt package tự động
```
- Backend: localhost:8000
- Frontend: localhost:5173
- Database: localhost:5432


## Các Tính Năng Chính của Hệ Thống 🏫
### 1. Người Dùng 👤
- Đăng Nhập: Truy cập vào hệ thống để sử dụng các tính năng.
- Đổi Mật Khẩu: Cho phép thay đổi mật khẩu người dùng.
### 2. Admin 👨‍🏫
- Quản Lý Tài Khoản: Tạo tài khoản Giảng viên và Sinh viên bằng Excel, sửa thông tin tài khoản.
- Quản Lý Lớp Học: Tạo lớp học, xem ca học và danh sách sinh viên trong lớp.
- In Danh Sách Sinh Viên: Xuất danh sách sinh viên trong lớp học.
### 3. Sinh Viên 🧑‍🎓
- Cài Đặt Xác Thực Sinh Học: Cài đặt xác thực sinh học qua khuôn mặt.
- Xem Môn Học Cần Điểm Danh: Xem danh sách các môn học cần điểm danh.
- Điểm Danh Bằng Khuôn Mặt: Điểm danh tự động qua nhận diện khuôn mặt.
- Thời Khóa Biểu: Xem lịch học và thời gian các môn học.
- Kiểm Tra Điểm Số và Lịch Sử Điểm Danh: Xem điểm số và lịch sử điểm danh của sinh viên.
### 4. Giáo Viên 👩‍🏫
- Quản Lý Lớp Học: Quản lý các lớp học đã được tạo.
- Xem Danh Sách Ca Học và Sinh Viên: Xem thông tin về các ca học và sinh viên trong lớp.
- Thống Kê Điểm Danh: Thống kê điểm danh của sinh viên dưới dạng file Excel.
- Nhập Điểm Cho Sinh Viên: Cập nhật điểm số cho sinh viên.
### 5. Lưu Dữ Liệu từ SQL 💾
- Lưu trữ dữ liệu từ cơ sở dữ liệu PostgreSQL bằng lệnh:
```bash
docker exec -i postgres pg_dump -U myuser -d mydatabase -F p > backup.sql
```


## Giao Diện và Thiết Kế 🌑
- Nền Đen Trắng: Giao diện đơn giản với tông màu đen và trắng.
- Responsive 90%: Hệ thống tương thích với các thiết bị di động và máy tính bảng.


Chúc bạn sử dụng hệ thống hiệu quả! 🎉