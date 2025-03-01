import pandas as pd
import numpy as np
import random
import string
from .models import Student, Classroom, Teacher, Score
from django.contrib.auth.hashers import make_password
from django.core.files.storage import default_storage

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from django.conf import settings

cloudinary.config( 
    cloud_name = settings.CLOUDINARY_NAME, 
    api_key = settings.CLOUDINARY_API_KEY, 
    api_secret = settings.CLOUDINARY_API_SECRET, #
    secure=True
)

def generate_password(length=8):
    chars = string.ascii_letters + string.digits 
    return ''.join(random.choices(chars, k=length))

def make_user(input_file, output_file, role="student"):
    df = pd.read_excel(input_file)

    # Xử lý dữ liệu
    prefix = "ST" if role == "student" else "TC"
    # Tạo username với tiền tố phù hợp
    df['username'] = df['STT'].astype(str).apply(lambda x: f"{prefix}{x.zfill(6)}")
    df.drop(columns=['STT'], inplace=True)
    df['Giới tính'] = df['Giới tính'].replace({'Nam': 'M', 'Nữ': 'F'}).fillna('O')
    df['Ngày sinh'] = pd.to_datetime(df['Ngày sinh'], errors='coerce', dayfirst=True)
    df['password'] = [generate_password() for _ in range(len(df))]
    df['username'] = None
    # Tạo từng sinh viên (không dùng bulk_create)
    for _, row in df.iterrows():
        if role == "student":
            if Student.objects.filter(username=row['username']).exists():
                continue
            student = Student(
                name=row['Họ tên'],
                username='temp_username',
                password=make_password(row['password']),  # Mã hóa mật khẩu
                gender=row['Giới tính'],
                dob=row['Ngày sinh'],
                phone_number=row['Số điện thoại']
            )
            student.full_clean()  # Kiểm tra lỗi trước khi lưu
            student.save()
            student.username = f"ST{str(student.id).zfill(6)}"
            student.save()  # Lưu từng bản ghi riêng lẻ
            df.loc[df['Họ tên'] == row['Họ tên'], 'username'] = student.username
        else:
            if Teacher.objects.filter(username=row['username']).exists():
                continue
            teacher = Teacher(
                name=row['Họ tên'],
                username='temp_username',
                password=make_password(row['password']),  # Mã hóa mật khẩu
                gender=row['Giới tính'],
                dob=row['Ngày sinh'],
                phone_number=row['Số điện thoại']
            )
            teacher.full_clean()  # Kiểm tra lỗi trước khi lưu
            teacher.save()  
            teacher.username = f"TC{str(teacher.id).zfill(6)}"
            teacher.save()
            df.loc[df['Họ tên'] == row['Họ tên'], 'username'] = teacher.username

    with default_storage.open(output_file, 'wb') as f:
        df.to_excel(f, index=False)

    with default_storage.open(output_file, 'rb') as f:
        upload_result = cloudinary.uploader.upload(f, resource_type="raw")

    print("File uploaded to:", upload_result["secure_url"])
    default_storage.delete(output_file)
    return upload_result["secure_url"]
    
def get_student(file):
    df = pd.read_excel(file, dtype=str)
    student_ids = [str(x).strip() for x in df['username'].values]
    return student_ids

def get_student_excel(classroom_id, output_file):
    classroom = None
    try:
        classroom = Classroom.objects.get(id=classroom_id)
    except Classroom.DoesNotExist:
        print(f"Lớp học với ID {classroom_id} không tồn tại.")
        return
    
    students = classroom.students.all()
    data = [{
        "Họ tên": student.name,
        "Username": student.username,
        "Giới tính": student.gender,
        "Ngày sinh": student.dob.strftime('%d/%m/%Y') if student.dob else "",
        "Số điện thoại": student.phone_number,
        "Điểm": Score.objects.filter(student=student, classroom=classroom).first().score if Score.objects.filter(student=student, classroom=classroom).exists() else None
    } for student in students]
    
    df = pd.DataFrame(data)
    with default_storage.open(output_file, 'wb') as f:
        df.to_excel(f, index=False)

    with default_storage.open(output_file, 'rb') as f:
        upload_result = cloudinary.uploader.upload(f, resource_type="raw")

    print("File uploaded to:", upload_result["secure_url"])
    default_storage.delete(output_file)
    return upload_result["secure_url"]