## Cấu Trúc Dự Án

- **Backend**: Django API chạy trên port 8000
- **Frontend**: React (Vite) ứng dụng chạy trên port 5000

## Các Lớp Cơ Sở Đã Thêm
- **Group**: Quản lý nhóm học viên.
- **Student**: Quản lý thông tin học viên.
- **Teacher**: Quản lý thông tin giảng viên.
- **FaceAuthLog**: Lưu trữ lịch sử xác thực khuôn mặt.

## Cách khởi động dự án
```bash
docker compose up --build # xây dựng docker cho backend và frontend
localhost:8000 # url backend
localhost:5000 # url frontend
```

# Tài khoản thử nghiệm
- admin | 1
- hieu6 | trunghieu7a1

## Các API đã xây dựng
- Đăng nhập - POST - Body(raw) - nhận username và password ```localhost:8000/login/```
- Đăng ký - POST - Body(raw) - nhận name, username và password ```localhost:8000/register/```
- Đăng xuất - POST - ```localhost:8000/logout/```
- Xác thực khuôn mặt và trả về nhãn - POST - form-data {image: `ảnh`} ```localhost:8000/face_auth/```
