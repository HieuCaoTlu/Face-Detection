from django.urls import path
from .views import *

urlpatterns = [
    # Xác thực khuôn mặt (ok). Kiểm tra địa chỉ Wifi (chưa làm)
    path('face_auth/', face_auth, name='face_auth'),

    # Account - Đăng nhập, đăng xuất, đổi mật khẩu
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change_password/', ChangePasswordView.as_view(), name='change_password'),

    # Classroom Routes - CRUD và thêm nhiều học viên vào lớp
    path('classroom/', ClassroomView.as_view(), name='classroom_list'),
    path('classroom/<int:classroom_id>/', ClassroomView.as_view(), name='classroom_detail'),
    path('attendance/', AttendanceView.as_view(), name='attendance'),

    # Teacher Routes - CRUD
    path('teacher/', TeacherView.as_view(), name='teacher_list'),
    path('teacher/<int:teacher_id>/', TeacherView.as_view(), name='teacher_detail'),

    # Student Routes - CRUD
    path('student/', StudentView.as_view(), name='student_list'),
    path('student/<int:student_id>/', StudentView.as_view(), name='student_detail'),

    #Score Routes - CRU
    path('score/', ScoreView.as_view(), name='score_list'),
    path('score/<int:classroom_id>/', ScoreView.as_view(), name='score_detail'),
    path('score/<int:classroom_id>/<int:student_id>', ScoreView.as_view(), name='score_change')
]