from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Student
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
    list_display = ('username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')