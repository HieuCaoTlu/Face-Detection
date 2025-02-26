# Cấu Trúc Dự Án

- **Backend**: Django API chạy trên port 8000
- **Frontend**: React (Vite) ứng dụng chạy trên port 5000
- **Database**: PostgresSQL chạy trên port 5432

# Trước khi khởi động Backend
- Vui lòng tạo 1 file .env ở trong thư mục root/backend (cùng cấp với manage.py)
- Tạo tài khoản Cloudinary và lấy các thông tin cần thiết, điền vào ENV như sau:
```bash
CLOUDINARY_NAME=abc
CLOUDINARY_API_KEY=abc
CLOUDINARY_API_SECRET=abc
```

# Các Lớp Cơ Sở Đã Thêm
- **Classroom**: Quản lý lớp học.
- **Student**: Quản lý thông tin học viên.
- **Teacher**: Quản lý thông tin giảng viên.
- **FaceAuthLog**: Lưu trữ lịch sử xác thực khuôn mặt.
- **EmbeddingData**: Lưu trữ dữ liệu huấn luyện
- **Report**: Lưu trữ danh sách khiếu nại điểm danh
- **Score**: Lưu trữ danh sách điểm theo lớp của sinh viên

# Cách khởi động dự án
```bash
docker compose up --build # xây dựng docker và cài đặt package tự động
localhost:8000 # url backend
localhost:5000 # url frontend
localhost:5432 # url database
```

# Tài khoản thử nghiệm (Admin, Sinh viên, Giáo viên)
- admin | trunghieu7a1 
- stu | trunghieu8a1
- tea | trunghieu7a1

# Các API đã xây dựng
Domain: ```localhost:8000/``` (yêu cầu đăng nhập trước khi dùng)
1. Xác thực khuôn mặt 
- face-auth/ POST: form-data với key là images, giá trị là tập ảnh

2. Đăng nhập, đăng ký, đổi mật khẩu
- login/ POST: form-data với key là username, password
- logout/ POST
- change_password/ POST: form-data với key là old_password, new_password

3. Quản lý lớp học:
- classroom/ GET: lấy nhiều lớp hoặc lớp của giáo viên
- classroom/<int:classroom_id>/ GET: lấy thông tin lớp và sinh viên của 1 lớp qua id
- classroom/ POST: tạo lớp học với form-data key gồm name, start_time, end_time
- classroom/<int:classroom_id>/ PUT: chỉnh sửa lớp học với body raw giống POST
- classroom/<int:classroom_id>/ DELETE: xóa lớp học với id tương ứng
- attendance/ POST: thêm nhiều sinh viên vào 1 lớp (ngăn cách bằng dấu phẩy) với form-data gồm classroom_id, student_ids

4. Quản lý sinh viên: student/ 
5. Quản lý giáo viên: teacher/ 
6. Quản lý điểm số: score/ 
7. Quản lý ca học: class_session/ 

# Thêm một vài phương pháp lấy Default Gateway của Linux, Windows
```bash
    ./gateway.sh #Chạy để lấy được gateway.json
    gateway.bat
```

# Optional (Backup dữ liệu từ CSDL):
```bash
docker exec -it postgres bash #truy cập bash của postgres
pg_dump -U myuser -d mydatabase -F p -f /var/lib/postgresql/data/backup.sql #tạo backup
docker cp postgres:/var/lib/postgresql/data/backup.sql ./backup.sql #copy backup ra thư mục làm việc ngoài docker
```