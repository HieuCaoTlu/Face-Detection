## Cấu Trúc Dự Án

- **Backend**: Django API chạy trên port 8000
- **Frontend**: React (Vite) ứng dụng chạy trên port 5000
- **Database**: PostgresSQL chạy trên port 5432

## Các Lớp Cơ Sở Đã Thêm
- **Classroom**: Quản lý lớp học.
- **Student**: Quản lý thông tin học viên.
- **Teacher**: Quản lý thông tin giảng viên.
- **FaceAuthLog**: Lưu trữ lịch sử xác thực khuôn mặt.
- **EmbeddingData**: Lưu trữ dữ liệu huấn luyện
- **Report**: Lưu trữ danh sách khiếu nại điểm danh
- **Score**: Lưu trữ danh sách điểm theo lớp của sinh viên

## Cách khởi động dự án
```bash
docker compose up --build # xây dựng docker và cài đặt package tự động
localhost:8000 # url backend
localhost:5000 # url frontend
localhost:5432 # url database
```

# Tài khoản thử nghiệm (Admin, Sinh viên, Giáo viên)
- admin | 1 
- stu2 | trunghieu7a1
- nam | trunghieu7a1

## Các API đã xây dựng
1. Về xác thực người dùng
- Đăng nhập - POST - Body(raw) - nhận username và password ```localhost:8000/login/```
- Đăng ký - POST - Body(raw) - nhận name, username và password ```localhost:8000/register/```
- Đăng xuất - POST - ```localhost:8000/logout/```

2. Về chức năng quản lý
- CRUD Classroom - GET/POST/PUT/DELETE: 
    + GET (admin - trả về mọi lớp, teacher - trả về mọi lớp của GV): ```localhost:8000/classroom/```
    + GET (trả về thông tin của 1 lớp): ```localhost:8000/classroom/<:id/```
    + POST (tạo lớp - chỉ GV được xài) - Body(raw) - nhận name: ```localhost:8000/classroom/```
    + PUT (sửa tên lớp - chỉ GV được xài) - Body(raw) - nhận name: ```localhost:8000/classroom/<:id/```
    + DELETE (xóa lớp - chỉ GV được xài): ```localhost:8000/classroom/<:id/```
- Thêm sinh viên vào lớp - POST - Body(raw) - nhận student_id và classroom_id: ```localhost:8000/attendance/```

3. Về chức năng sử dụng AI
- Xác thực khuôn mặt và trả về nhãn - POST - form-data {image: `ảnh`}: ```localhost:8000/face_auth/```
- Huấn luyện lại mô hình với tập ảnh và nhãn mới - POST - form-data {images: `ảnh`, label:`tên nhãn`}: ```localhost:8000/upload/```

# Optional (Backup dữ liệu từ CSDL):
```bash
docker exec -it postgres_service bash #truy cập bash của postgres
pg_dump -U myuser -d mydatabase -F p -f /var/lib/postgresql/data/backup.sql #tạo backup
docker cp postgres_service:/var/lib/postgresql/data/backup.sql ./backup.sql #copy backup ra thư mục làm việc ngoài docker
```