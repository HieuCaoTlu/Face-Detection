from django.urls import path
from .views import *

urlpatterns = [
    path('upload/', upload_images, name='upload_image'),
    path('login/', login, name='login'),
    path('face_auth/', face_auth, name='face_auth'),
    path('register/', register, name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('classroom/', ClassroomView.as_view(), name='classroom_list'),
    path('classroom/<int:classroom_id>/', ClassroomView.as_view(), name='classroom_detail'),
    path('attendance/', AttendanceView.as_view(), name='attendance'),
]