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

@csrf_exempt
def upload_images(request):
    if request.method == 'POST' and request.FILES.getlist('images'):
        images = request.FILES.getlist('images')
        images_paths = []
        label = request.POST.get('label')
        for image in images:
            images_path = default_storage.save(f"train/{image.name}", image)
            images_paths.append(images_path)
        
        result = train(images_paths, label)

        return JsonResponse({'label': label, 'files': images_paths})
    return JsonResponse({'status': False, 'message': 'No images provided'}, status=400)

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Missing username or password'}, status=400)

        try:
            hashed_password = make_password(password)
            student = Student(name=name, username=username, password=hashed_password)
            student.full_clean()
            student.save()
            return JsonResponse({'status': 'success'})
        except ValidationError as e:
            return JsonResponse({'error': 'wrong'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid method'}, status=401)    

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            role = 'student' if hasattr(user, 'student') else 'teacher'
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
        data = json.loads(request.body)
        name = data.get('name')
        start_time = data.get('start_time', None)
        end_time = data.get('start_time', None)
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
        data = json.loads(request.body)
        classroom_id = data.get('classroom_id')
        student_id = data.get('student_id')
        classroom = Classroom.objects.get(id=classroom_id)
        student = Student.objects.get(id=student_id)
        classroom.students.add(student)
        return JsonResponse({'status': 'success'})

