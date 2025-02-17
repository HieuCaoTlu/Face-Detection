from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.http import JsonResponse
import json
from django.contrib.auth import authenticate, login as auth_login

@csrf_exempt  # Bỏ qua CSRF token cho API này
def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image = request.FILES['image']
        # Lưu ảnh vào server (tùy chọn)
        file_path = default_storage.save(f"images/{image.name}", image)
        # Trả về phản hồi JSON với True
        return JsonResponse({'status': True})
    return JsonResponse({'status': False, 'message': 'No image provided'}, status=400)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        auth_login(request, user)
        return JsonResponse({'status': True})
    return JsonResponse({'status': False})