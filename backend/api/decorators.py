from functools import wraps
from django.http import HttpResponseForbidden

def login_required(function):
    @wraps(function)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden("Bạn cần đăng nhập để sử dụng.")
        return function(request, *args, **kwargs)
    return _wrapped_view

def teacher_required(function):
    @wraps(function)
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, 'teacher'):
            return HttpResponseForbidden("Bạn cần là giáo viên để truy cập vào trang này.")
        return function(request, *args, **kwargs)
    return _wrapped_view

def student_required(function):
    @wraps(function)
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, 'student'):
            return HttpResponseForbidden("Bạn cần là học viên để truy cập vào trang này.")
        return function(request, *args, **kwargs)
    return _wrapped_view

def admin_required(function):
    @wraps(function)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_staff:  # Kiểm tra xem người dùng có phải là admin (is_staff)
            return HttpResponseForbidden("Bạn cần là quản trị viên để truy cập vào trang này.")
        return function(request, *args, **kwargs)
    return _wrapped_view

def staff_required(function):
    @wraps(function)
    def _wrapped_view(request, *args, **kwargs):
        if not (hasattr(request.user, 'teacher') or request.user.is_superuser):
            return HttpResponseForbidden("Bạn cần là giáo viên/giáo vụ để truy cập vào trang này.")
        return function(request, *args, **kwargs)
    return _wrapped_view

# def wifi_required(function):
#     @wraps(function)
#     def _wrapped_view(request, *args, **kwargs):
#         if not request.user.is_wifi:
#             return HttpResponseForbidden("Bạn cần kết nối Wifi để sử dụng.")
#         return function(request, *args, **kwargs)
#     return _wrapped_view