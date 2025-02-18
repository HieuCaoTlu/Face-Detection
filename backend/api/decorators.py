from functools import wraps
from django.http import HttpResponseForbidden

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