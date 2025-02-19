from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Student, Teacher
from django.contrib import admin

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username',)

class CustomUserAdmin(admin.ModelAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserCreationForm
    list_display = ('username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')

class StudentForm(UserCreationForm):
    class Meta:
        model = Student
        fields = ('username', 'password2')
    
class StudentAdmin(admin.ModelAdmin):
    form = StudentForm
    list_display = ('username', 'is_staff', 'is_active','id')
    list_filter = ('is_staff', 'is_active')

class TeacherForm(UserCreationForm):
    class Meta:
        model = Teacher
        fields = ('username', 'password2','name')
    
class TeacherAdmin(admin.ModelAdmin):
    form = TeacherForm
    list_display = ('username', 'is_staff', 'is_active','name')
    list_filter = ('is_staff', 'is_active','name')