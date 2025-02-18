from datetime import datetime
from django.contrib.auth.hashers import is_password_usable, make_password
from django.db import models
from django.utils.translation import gettext_lazy as _
from io import BytesIO
from PIL import Image
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

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
        return self.username

class Student(CustomUser):

    def __str__(self):
        return 'Student'

class FaceAuthLog(BaseModel):
    image_data = models.BinaryField(blank=True, null=True)
    is_valid = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.created_at}"
    
    class Meta:
        db_table = "face_auth_logs"
        ordering = ("-created_at",)

    def get_image(self):
        """
        Hàm để chuyển dữ liệu nhị phân trong trường `image_data`
        thành một đối tượng ảnh PIL.
        """
        if self.image_data:
            # Chuyển từ binary thành ảnh PIL
            image = Image.open(BytesIO(self.image_data))
            return image
        return None