from datetime import datetime
from django.contrib.auth.hashers import is_password_usable, make_password
from django.db import models
from django.utils.translation import gettext_lazy as _
from io import BytesIO
from PIL import Image
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField
import pytz
from django.utils.timezone import now

class BaseModelManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at=None)

class BaseModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    objects = BaseModelManager()
    all_objects = models.Manager()

    def save(self, *args, **kwargs):
        vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
        if not self.created_at:
            self.created_at = now().astimezone(vietnam_tz)
        self.updated_at = now().astimezone(vietnam_tz)
        super().save(*args, **kwargs)

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
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    name = models.CharField(max_length=255, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    face_auth = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.name if self.name else self.username

    def info(self):
        return {
            'name': self.name,
            'username': self.username,
            'gender': self.gender,
            'phone_number': self.phone_number,
            'dob': self.dob,
            'id': self.id,
            'face_auth': self.face_auth,
        }

class Student(CustomUser):
    def info(self):
        data = super().info()
        data['role'] = 'student'
        return data

class Teacher(CustomUser):
    def info(self):
        data = super().info()
        data['role'] = 'teacher'
        return data

class Classroom(BaseModel):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teachers')
    students = models.ManyToManyField(Student, related_name='students', blank=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    def __str__(self):
        return self.name

    def info(self):
        students = self.students.all()
        return {
            'name': self.name,
            'teacher': self.teacher.name,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'id': self.id,
        }

class Report(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='reports')
    log_face = models.ForeignKey('FaceAuthLog', on_delete=models.CASCADE, related_name='reports')
    problem = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.log_face.student.name} - {self.log_face.created_at}"

    class Meta:
        db_table = "reports"
        ordering = ("-created_at",)

class Score(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, related_name="scores", blank=True, null=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, related_name="scores", blank=True, null=True)
    score = models.FloatField(default=-1)

    def check_info(self):
        stu = self.student.name if self.student is not None else 'No Student'
        clr = self.classroom.name if self.classroom is not None else 'No Classroom'
        return (stu, clr)

    def __str__(self):
        stu, clr = self.check_info()
        return f"{stu} - {clr} - {self.score}"
    
    class Meta:
        db_table = "scores"
        ordering = ("-created_at",)

    def info(self):
        stu, clr = self.check_info()
        return {
            'student': stu,
            'classroom': clr,
            'score': self.score,
            'id': self.id
        }

class EmbeddingData(models.Model):
    embedding = ArrayField(models.FloatField(), size=512, blank=True, null=True)
    label = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.embedding[:2]} {self.label}"

class ClassSession(BaseModel):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='classroom')
    DAYS_OF_WEEK = [
        (2, 'Monday'),
        (3, 'Tuesday'),
        (4, 'Wednesday'),
        (5, 'Thursday'),
        (6, 'Friday'),
        (7, 'Saturday'),
        (8, 'Sunday'),
    ]
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.classroom.name} - {dict(self.DAYS_OF_WEEK).get(self.day_of_week, "Unknown")} ({self.start_time} - {self.end_time})"

    def info(self):
        return {
            'id': self.id,
            'day_of_week': dict(self.DAYS_OF_WEEK).get(self.day_of_week, 'Unknown'),
            'start_time': self.start_time.strftime("%H:%M"),
            'end_time': self.end_time.strftime("%H:%M"),
            'classroom_id': self.classroom.id,
            'classroom': self.classroom.name
        }

class FaceAuthLog(BaseModel):
    image_data = models.BinaryField(blank=True, null=True)
    is_valid = models.BooleanField(default=False)
    class_session = models.ForeignKey(ClassSession, on_delete=models.SET_NULL, related_name='attendance_logs', null=True, blank=True)  # Không mất dữ liệu
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, related_name='facial_auth_logs', null=True, blank=True)  # Không mất dữ liệu

    def __str__(self):
        return f"{self.created_at}"
    
    class Meta:
        db_table = "face_auth_logs"
        ordering = ("-created_at",)

    def get_image(self):
        if self.image_data:
            # Chuyển từ binary thành ảnh PIL
            image = Image.open(BytesIO(self.image_data))
            return image
        return None
