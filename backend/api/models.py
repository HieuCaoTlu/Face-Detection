import os
from datetime import datetime

from django.contrib.auth.hashers import is_password_usable, make_password
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.utils.translation import gettext_lazy as _


class BaseModelManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at=None)

class BaseModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    objects = BaseModelManager()
    all_objects = models.Manager()

    def soft_delete(self):
        self.deleted_at = datetime.now()
        self.save()

    def restore(self):
        self.deleted_at = None
        self.save()

    class Meta:
        ordering = ("-created_at",)
        abstract = True

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field must be set")
        user = self.model(
            username=username, email=self.normalize_email(email), **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("type", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)

class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(_("email address"), blank=True, null=True)
    name = models.CharField(max_length=255)
    USER_TYPE_CHOICES = (
        ("admin", "Admin"),
        ("teacher", "Teacher"),
        ("student", "Student"),
    )
    type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not is_password_usable(self.password):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    class Meta:
        db_table = "users"
        ordering = ("-created_at",)

class Group(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name="group")
    start_time = models.TimeField(default="00:00:00")
    end_time = models.TimeField(default="23:59:59")

    def __str__(self):
        return self.name

    class Meta:
        db_table = "groups"
        ordering = ("-created_at",)

class Student(User):
    class_attend = models.ManyToManyField(Group, related_name="students")  # Một học viên có thể thuộc nhiều nhóm
    is_face_auth = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "students"
        ordering = ("-created_at",)

class Teacher(User):
    class_attend = models.ManyToManyField(Group, related_name="teachers")  # Một giáo viên có thể quản lý nhiều nhóm
    is_face_auth = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "teachers"  # Đổi tên bảng cho đúng
        ordering = ("-created_at",)

class FaceAuthLog(BaseModel):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="facial_auth_logs",
        blank=True,
        null=True,
    )
    time = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(
        upload_to='checkin/',
        blank=True,
        null=True,
    )
    is_valid = models.BooleanField()

    def __str__(self):
        return f"{self.student.name} - {self.time}"

    class Meta:
        db_table = "face_auth_logs"
        ordering = ("-time",)
