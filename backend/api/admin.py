from django.contrib import admin
from django.contrib import admin
from .models import Teacher, Student, Group, User

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'name', 'email', 'type', 'is_staff', 'is_active', 'is_superuser')  # Hiển thị các trường của User
    search_fields = ('username', 'name', 'email')  # Tìm kiếm theo username, name, email
    list_filter = ('type', 'is_staff', 'is_active', 'is_superuser')  # Bộ lọc theo type, is_staff, is_active, is_superuser

admin.site.register(User, UserAdmin)

# Đăng ký model Teacher
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_face_auth', 'get_groups')  # Hiển thị tên, trạng thái xác thực khuôn mặt, và nhóm
    search_fields = ('name',)  # Tìm kiếm theo tên
    list_filter = ('is_face_auth',)  # Bộ lọc theo trạng thái xác thực khuôn mặt

    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])  # Hiển thị các nhóm mà giáo viên này quản lý
    get_groups.short_description = 'Groups'  # Đặt tên hiển thị cho cột

admin.site.register(Teacher, TeacherAdmin)

# Đăng ký model Student
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_face_auth', 'get_groups')  # Hiển thị tên, trạng thái xác thực khuôn mặt, và nhóm
    search_fields = ('name',)  # Tìm kiếm theo tên
    list_filter = ('is_face_auth',)  # Bộ lọc theo trạng thái xác thực khuôn mặt

    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])  # Hiển thị các nhóm mà học viên này tham gia
    get_groups.short_description = 'Groups'  # Đặt tên hiển thị cho cột

admin.site.register(Student, StudentAdmin)

# Đăng ký model Group (nếu cần quản lý nhóm)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_teachers', 'get_students')  # Hiển thị tên nhóm, các giáo viên và học viên của nhóm
    search_fields = ('name',)  # Tìm kiếm theo tên nhóm

    def get_teachers(self, obj):
        return ", ".join([teacher.name for teacher in obj.teachers.all()])  # Hiển thị các giáo viên của nhóm
    get_teachers.short_description = 'Teachers'

    def get_students(self, obj):
        return ", ".join([student.name for student in obj.students.all()])  # Hiển thị các học viên của nhóm
    get_students.short_description = 'Students'

admin.site.register(Group, GroupAdmin)
