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
from .models import Student
from django.contrib.auth.hashers import make_password


@csrf_exempt
def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image = request.FILES['image']
        file_path = default_storage.save(f"images/{image.name}", image)
        return JsonResponse({'status': True})
    return JsonResponse({'status': False, 'message': 'No image provided'}, status=400)

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
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
@student_required
def face_auth(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image_file = request.FILES['image']

        fs = FileSystemStorage(location='checkin/')
        filename = fs.save(image_file.name, image_file)
        file_url = fs.url(filename)

        image = Image.open(image_file)

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

@csrf_exempt
def logout(request):
    if request.method == 'POST':
        auth_logout(request)
        return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})
    return JsonResponse({'error': 'Invalid method'}, status=405)