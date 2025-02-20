from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.http import JsonResponse
import json
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from .ai import *
from PIL import Image
import os
from io import BytesIO
from .models import FaceAuthLog
from .decorators import *
from .models import *
from django.contrib.auth.hashers import make_password
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
from .models import EmbeddingData
import pandas as pd
import json

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class StudentView(View):
    def get(self, request, student_id=None):
        print('Hi',request.META.get(request.META.get('REMOTE_ADDR', '')))
        if student_id:
            try:
                student = Student.objects.get(id=student_id)
                return JsonResponse({'student': student.info()})
            except Student.DoesNotExist:
                return JsonResponse({'error': 'Student not found'}, status=404)
        if request.user.is_superuser:
            students = Student.objects.all()
            return JsonResponse({'students': [student.info() for student in students]})
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    @method_decorator(admin_required, name='dispatch')
    def post(self, request):
        '''
            Lấy thông tin cơ bản của sinh viên
            Kiểm tra xem username có bị trùng lặp hay không
            Lấy tệp ảnh của sinh viên để mang đi huấn luyện mô hình
            Trả về thông tin sinh viên và kết quả huấn luyện
        '''
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')
        if not username or not password:
            return JsonResponse({'error': 'Missing username or password'}, status=400)
        try:
            if Student.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

            if not request.FILES.getlist('images'):
                return JsonResponse({'error': 'No images provided'}, status=400)
            images = request.FILES.getlist('images')
            images_paths = []
            for image in images:
                images_path = default_storage.save(f"train/{image.name}", image)
                images_paths.append(images_path)
            result = train(images_paths, name)

            hashed_password = make_password(password)
            student = Student(name=name, username=username, password=hashed_password)
            student.full_clean()
            student.save()
            return JsonResponse({'status': 'success', 'student': student.info(), 'train': result})
        except ValidationError as e:
            return JsonResponse({'error': e}, status=400)

    @method_decorator(admin_required, name='dispatch')
    def put(self, request, student_id):
        data = json.loads(request.body)
        try:
            student = Student.objects.get(id=student_id)
            student.name = data.get('name', student.name)
            student.save()
            return JsonResponse({'status': 'success', 'student': student.info()})
        except Student.DoesNotExist:
            return JsonResponse({'error': 'Student not found'}, status=404)
    
    @method_decorator(admin_required, name='dispatch')
    def delete(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            student.delete()
            return JsonResponse({'status': 'success'})
        except Student.DoesNotExist:
            return JsonResponse({'error': 'Student not found'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class TeacherView(View):
    def get(self, request, teacher_id=None):
        if teacher_id:
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                return JsonResponse({'teacher': teacher.info()})
            except Teacher.DoesNotExist:
                return JsonResponse({'error': 'Teacher not found'}, status=404)
        if request.user.is_superuser:
            teachers = Teacher.objects.all()
            return JsonResponse({'teachers': [teacher.info() for teacher in teachers]})
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    @method_decorator(admin_required, name='dispatch')
    def post(self, request):
        data = json.loads(request.body)
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')
        if not username or not password:
            return JsonResponse({'error': 'Missing username or password'}, status=400)
        try:
            hashed_password = make_password(password)
            teacher = Teacher(name=name, username=username, password=hashed_password)
            teacher.full_clean()
            teacher.save()
            return JsonResponse({'status': 'success', 'teacher': teacher.info()})
        except ValidationError as e:
            return JsonResponse({'error': 'wrong'}, status=400)
    
    def put(self, request, teacher_id):
        data = json.loads(request.body)
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            teacher.name = data.get('name', teacher.name)
            teacher.save()
            return JsonResponse({'status': 'success', 'teacher': teacher.info()})
        except Teacher.DoesNotExist:
            return JsonResponse({'error': 'Teacher not found'}, status=404)
    
    @method_decorator(admin_required, name='dispatch')
    def delete(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            teacher.delete()
            return JsonResponse({'status': 'success'})
        except Teacher.DoesNotExist:
            return JsonResponse({'error': 'Teacher not found'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class ChangePasswordView(View):
    def post(self, request):
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        if not old_password or not new_password:
            return JsonResponse({'error': 'Missing old or new password'}, status=400)
        user = CustomUser.objects.get(id=request.user.id)
        if user.check_password(old_password):
            user.set_password(new_password)
            user.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'error': 'Invalid old password'}, status=400)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            password = request.POST.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            role = None
            if hasattr(user, 'teacher'):
                role = 'teacher'
            elif hasattr(user, 'student'):
                role = 'student'
            elif user.is_superuser:
                role = 'admin'
            return JsonResponse({'status': 'success', 'role': role})
        else:
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
@login_required
def face_auth(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image_file = request.FILES['image']

        fs = FileSystemStorage(location='checkin/')
        filename = fs.save(image_file.name, image_file)
        file_url = fs.url(filename)

        image = Image.open(image_file)
        image = image.convert('RGB')

        buffered = BytesIO()
        image.save(buffered, format="JPEG")

        face_auth_log = FaceAuthLog(image_data=buffered.getvalue(),)
        face_auth_log.save()

        result = predict(image)
        os.remove(os.path.join('checkin/', filename))
        return JsonResponse({
            'label': result
        })
    else:
        return JsonResponse({'error': 'No image uploaded or invalid method'}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class LogoutView(View):
    def post(self, request):
        auth_logout(request)
        return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class ClassroomView(View):
    def get(self, request, classroom_id=None):
        if classroom_id:
            try:
                classroom = Classroom.objects.get(id=classroom_id)
                return JsonResponse({'classroom': classroom.info()})
            except Classroom.DoesNotExist:
                return JsonResponse({'error': 'Classroom not found'}, status=404)
        else:
            classrooms = None
            if hasattr(request.user, 'teacher'):
                teacher = Teacher.objects.get(id=request.user.id)
                classrooms = Classroom.objects.filter(teacher=teacher)
            else:
                classrooms = Classroom.objects.all()
            return JsonResponse({'classrooms': [classroom.info() for classroom in classrooms]})

    @method_decorator(teacher_required, name='dispatch')
    def post(self, request):
        name = request.POST.get('name', None)
        start_time = request.POST.get('start_time', None)
        end_time = request.POST.get('end_time', None)
        user = request.user
        classroom = Classroom(name=name, teacher=user)
        classroom.save()
        return JsonResponse({'status': 'success', 'classroom': classroom.info()})

    @method_decorator(teacher_required, name='dispatch')
    def put(self, request, classroom_id):
        data = json.loads(request.body)
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            classroom.name = data.get('name', classroom.name)
            classroom.start_time = data.get('start_time', classroom.start_time)
            classroom.end_time = data.get('end_time', classroom.end_time)
            classroom.save()
            return JsonResponse({'status': 'success', 'classroom': classroom.info()})
        except Classroom.DoesNotExist:
            return JsonResponse({'error': 'Classroom not found'}, status=404)

    @method_decorator(teacher_required, name='dispatch')
    def delete(self, request, classroom_id):
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            classroom.delete()
            return JsonResponse({'status': 'success'})
        except Classroom.DoesNotExist:
            return JsonResponse({'error': 'Classroom not found'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class AttendanceView(View):

    def post(self, request):
        classroom_id =  request.POST.get('classroom_id', None)
        student_ids = request.POST.get('student_ids', None)
        student_ids = [int(s.strip()) for s in student_ids.split(",") if s.strip().isdigit()]
        
        classroom = Classroom.objects.get(id=classroom_id)
        students = Student.objects.filter(id__in=student_ids)
        existing_students = classroom.students.all()
        new_students = [s for s in students if s not in existing_students]
        if new_students:
            classroom.students.add(*new_students)
        return JsonResponse({'status': 'success', 'classroom':classroom.info()})

