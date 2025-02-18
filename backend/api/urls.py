from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_image, name='upload_image'),
    path('login/', views.login, name='login'),
    path('face_auth/', views.face_auth, name='face_auth'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout, name='logout'),
]