#Packge Utils
from django.utils.timezone import localdate, localtime
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.core.files.storage import default_storage
from datetime import datetime
import json
import os
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

#Package xử lí Auth và Account
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.hashers import make_password

#Package của xử lí ảnh
from PIL import Image
from io import BytesIO

#Package xử lí HTTP
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View

#Package của dự án
from .ai import *
from .decorators import *
from .models import *

class BaseView(View):
    @method_decorator(csrf_exempt, name='dispatch')
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

class RequiredLoginView(View):
    @method_decorator(csrf_exempt, name='dispatch')
    @method_decorator(login_required, name='dispatch')
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

class ApplyFaceAuthView(RequiredLoginView):
    def post(self, request):
        user = CustomUser.objects.get(id=request.user.id)
        label = user.name
        if not user:
            return JsonResponse({'error': 'Invaild user'}, status=400)
        if not user.name or not request.FILES.getlist('images'):
            return JsonResponse({'error': 'Invaild data and images provided'}, status=400)
        images = request.FILES.getlist('images')
        images_paths = []
        for image in images:
            images_path = default_storage.save(f"train/{image.name}", image)
            images_paths.append(images_path)
        result = train(images_paths, label)
        user.face_auth = True
        user.save()
        if hasattr(user, 'teacher'):
            teacher = Teacher.objects.get(id=request.user.id)
            return JsonResponse({'train':result, 'teacher':teacher.info()})
        elif hasattr(user, 'student'):
            student = Student.objects.get(id=request.user.id)
            return JsonResponse({'train':result, 'student':student.info()})
        else:
            return JsonResponse({'train':result, 'user':user.info()})

class StudentView(RequiredLoginView):
    def get(self, request, student_id=None):
        if student_id:
            try:
                student = Student.objects.get(id=student_id)
                return JsonResponse({'student': student.info()})
            except Student.DoesNotExist:
                return JsonResponse({'error': 'Student not found'}, status=404)
        if request.user.is_superuser:
            students = Student.objects.all()
            return JsonResponse({'students': [student.info() for student in students]})
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    @method_decorator(admin_required, name='dispatch')
    def post(self, request):
        '''
            Lấy thông tin cơ bản của sinh viên
            Kiểm tra xem username có bị trùng lặp hay không
            Lấy tệp ảnh của sinh viên để mang đi huấn luyện mô hình
            Trả về thông tin sinh viên và kết quả huấn luyện
        '''
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')
        if not username or not password:
            return JsonResponse({'error': 'Missing username or password'}, status=400)
        try:
            if Student.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            hashed_password = make_password(password)
            student = Student(name=name, username=username, password=hashed_password)
            student.full_clean()
            student.save()
            return JsonResponse({'status': 'success', 'student': student.info()})
        except ValidationError as e:
            return JsonResponse({'error': e}, status=400)

    @method_decorator(admin_required, name='dispatch')
    def put(self, request, student_id):
        data = json.loads(request.body)
        try:
            student = Student.objects.get(id=student_id)
            student.name = data.get('name', student.name)
            student.save()
            return JsonResponse({'status': 'success', 'student': student.info()})
        except Student.DoesNotExist:
            return JsonResponse({'error': 'Student not found'}, status=404)
    
    @method_decorator(admin_required, name='dispatch')
    def delete(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            student.delete()
            return JsonResponse({'status': 'success'})
        except Student.DoesNotExist:
            return JsonResponse({'error': 'Student not found'}, status=404)

class TeacherView(RequiredLoginView):
    def get(self, request, teacher_id=None):
        if teacher_id:
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                return JsonResponse({'teacher': teacher.info()})
            except Teacher.DoesNotExist:
                return JsonResponse({'error': 'Teacher not found'}, status=404)
        if request.user.is_superuser:
            teachers = Teacher.objects.all()
            return JsonResponse({'teachers': [teacher.info() for teacher in teachers]})
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    @method_decorator(admin_required, name='dispatch')
    def post(self, request):
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')
        if not username or not password:
            return JsonResponse({'error': 'Missing username or password'}, status=400)
        try:
            hashed_password = make_password(password)
            teacher = Teacher(name=name, username=username, password=hashed_password)
            teacher.full_clean()
            teacher.save()
            return JsonResponse({'status': 'success', 'teacher': teacher.info()})
        except ValidationError as e:
            return JsonResponse({'error': 'wrong'}, status=400)
    
    @method_decorator(admin_required, name='dispatch')
    def put(self, request, teacher_id):
        data = json.loads(request.body)
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            teacher.name = data.get('name', teacher.name)
            teacher.save()
            return JsonResponse({'status': 'success', 'teacher': teacher.info()})
        except Teacher.DoesNotExist:
            return JsonResponse({'error': 'Teacher not found'}, status=404)
    
    @method_decorator(admin_required, name='dispatch')
    def delete(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            teacher.delete()
            return JsonResponse({'status': 'success'})
        except Teacher.DoesNotExist:
            return JsonResponse({'error': 'Teacher not found'}, status=404)
class ChangePasswordView(RequiredLoginView):
    def post(self, request):
        data = {
            'old_password':request.POST.get('old_password'),
            'new_password1':request.POST.get('new_password'),
            'new_password2':request.POST.get('new_password'),
        }
        fm = PasswordChangeForm(user=request.user, data=data)
        if fm.is_valid():
            fm.save()
            update_session_auth_hash(request, fm.user)
            print('Successfully change password')
            return JsonResponse({'status':'true'})
        else:
            return JsonResponse({'status':'false'},status=400)

        
        # if not old_password or not new_password:
        #     return JsonResponse({'error': 'Missing old or new password'}, status=400)
        
        # user = CustomUser.objects.get(id=request.user.id)
        # # Kiểm tra mật khẩu cũ
        # if user.check_password(old_password):
        #     # Đặt mật khẩu mới
        #     user.set_password(new_password)
        #     user.save()
        #     # Đăng nhập lại người dùng với mật khẩu mới
        #     user = authenticate(username=user.username, password=new_password)
        #     update_session_auth_hash(request, user)
        #     print('Đổi mật khẩu thành công!')
        #     return JsonResponse({'status': 'success'})
        # else:
        #     return JsonResponse({'error': 'Invalid old password'}, status=400)

class LoginView(BaseView):
    def post(self, request):
        try:
            username = request.POST.get('username')
            password = request.POST.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            role = None
            if hasattr(user, 'teacher'):
                role = 'teacher'
            elif hasattr(user, 'student'):
                role = 'student'
            elif user.is_superuser:
                role = 'admin'
            return JsonResponse({'status': 'success', 'role': role})
        else:
            return JsonResponse({'error': 'Invalid username or password'}, status=400)

class FaceAuthView(RequiredLoginView):
    def post(self, request):
        if not request.FILES.get('image') or not hasattr(request.user, 'student'):
            return JsonResponse({'error': 'No image uploaded or invaild authentication'}, status=400)
        image_file = request.FILES['image']
        fs = FileSystemStorage(location='checkin/')
        filename = fs.save(image_file.name, image_file)
        file_url = fs.url(filename)
        image = Image.open(image_file)
        image = image.convert('RGB')
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        result = predict(image)
        student = Student.objects.get(id=request.user.id)
        is_valid = True if result == student.name else False
        class_session_id = request.POST.get('class_session_id', None)
        os.remove(os.path.join('checkin/', filename))
        checkin = False
        if class_session_id and is_valid:
            class_session = ClassSession.objects.get(id=class_session_id)
            student = Student.objects.get(id=request.user.id)
            face_auth_log = FaceAuthLog(image_data=buffered.getvalue(),student=student, class_session=class_session, is_valid=is_valid)
            face_auth_log.save()
            checkin = True
        return JsonResponse({'valid':is_valid, 'result':result, 'name':request.user.name, 'checkin':checkin,})

class LogoutView(RequiredLoginView):
    def post(self, request):
        auth_logout(request)
        return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})

class ClassroomView(RequiredLoginView):
    def get(self, request, classroom_id=None):
        if classroom_id:
            try:
                classroom = Classroom.objects.get(id=classroom_id)
                class_sessions = ClassSession.objects.filter(classroom=classroom)
                return JsonResponse({'classroom': classroom.info(), 'class_sessions':[class_session.info() for class_session in class_sessions]})
            except Classroom.DoesNotExist:
                return JsonResponse({'error': 'Classroom not found'}, status=404)
        else:
            classrooms = None
            if hasattr(request.user, 'teacher'):
                teacher = Teacher.objects.get(id=request.user.id)
                classrooms = Classroom.objects.filter(teacher=teacher)
            elif hasattr(request.user, 'student'):
                student = Student.objects.get(id=request.user.id)
                classrooms = Classroom.objects.filter(students=student)
            else:
                classrooms = Classroom.objects.all()
            result = []
            for classroom in classrooms:
                temp = classroom.info()
                class_sessions = ClassSession.objects.filter(classroom=classroom)
                temp['class_sessions'] = [class_session.info() for class_session in class_sessions]
                result.append(temp)
            return JsonResponse({'classrooms': result})

    @method_decorator(staff_required, name='dispatch')
    def post(self, request):
        data = json.loads(request.body)
        name = data.get("name")
        class_sessions = data.get("sessions", [])
        if len(class_sessions) > 10:
            return JsonResponse({"error": "Cannot create more than 10 sessions"}, status=400)
        user = request.user
        classroom = Classroom.objects.create(name=name, teacher=user)
        session_objects = []
        for class_session in class_sessions:
            day_of_week = class_session.get("day_of_week")
            start_time = class_session.get("start_time")
            end_time = class_session.get("end_time")
            session_objects.append(
                ClassSession(
                    classroom=classroom,
                    day_of_week=day_of_week,
                    start_time=start_time,
                    end_time=end_time
                )
            )
        ClassSession.objects.bulk_create(session_objects)
        return JsonResponse({
                "status": "success",
                "classroom": classroom.info(),
                "sessions": [session.info() for session in classroom.classsession_set.all()]
        })

    @method_decorator(staff_required, name='dispatch')
    def put(self, request, classroom_id):
        data = json.loads(request.body)
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            classroom.name = data.get('name', classroom.name)
            classroom.start_time = data.get('start_time', classroom.start_time)
            classroom.end_time = data.get('end_time', classroom.end_time)
            classroom.save()
            return JsonResponse({'status': 'success', 'classroom': classroom.info()})
        except Classroom.DoesNotExist:
            return JsonResponse({'error': 'Classroom not found'}, status=404)

    @method_decorator(staff_required, name='dispatch')
    def delete(self, request, classroom_id):
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            classroom.delete()
            return JsonResponse({'status': 'success'})
        except Classroom.DoesNotExist:
            return JsonResponse({'error': 'Classroom not found'}, status=404)

class AttendanceView(RequiredLoginView):
    @method_decorator(staff_required, name='dispatch')
    def post(self, request):
        classroom_id =  request.POST.get('classroom_id', None)
        student_ids = request.POST.get('student_ids', None)
        student_ids = [int(s.strip()) for s in student_ids.split(",") if s.strip().isdigit()]
        
        classroom = Classroom.objects.get(id=classroom_id)
        students = Student.objects.filter(id__in=student_ids)
        existing_students = classroom.students.all()
        new_students = [s for s in students if s not in existing_students]
        if new_students:
            classroom.students.add(*new_students)
        for student in students:
            score = Score(student=student, classroom=classroom)
            score.full_clean()
            score.save()
        return JsonResponse({'status': 'success', 'classroom':classroom.info()})

class ScoreView(RequiredLoginView):
    def get(self, request, classroom_id=None):
        if hasattr(request.user, 'student'):
            student = Student.objects.get(id=request.user.id)
            scores = Score.objects.filter(student=student)
            return JsonResponse({'status': 'success', 'scores':[score.info() for score in scores]})
        if (hasattr(request.user, 'teacher') or request.user.is_superuser) and classroom_id:
            teacher = Teacher.objects.get(id=request.user.id)
            classroom = Classroom.objects.get(id=classroom_id, teacher=teacher)
            students = classroom.students.all()
            result = []
            fulfill = True
            for student in students:
                score = Score.objects.filter(student=student, classroom=classroom).first()
                if not score:
                    score = Score(student=student, classroom=classroom)
                    score.full_clean()
                    score.save()
                    fulfill = False
                if score.score == -1:
                    fulfill = False
                result.append({
                    'student': student.name,
                    'score': score.score,
                    'student_id': student.id
                })
            return JsonResponse({'fulfill': fulfill, 'scores':result})
        return JsonResponse({'error':'wrong'}, status=404)

    @method_decorator(staff_required, name='dispatch')
    def post(self, request):
        classroom_id = request.POST.get('classroom_id')
        student_ids = request.POST.get('student_ids')
        student_ids = [int(s.strip()) for s in student_ids.split(",") if s.strip().isdigit()]
        raw_scores = request.POST.get('scores')
        raw_scores = [float(s.strip()) for s in raw_scores.split(",") if s.strip().isnumeric()]
        classroom = Classroom.objects.get(id=classroom_id)
        for (student_id, new_score) in zip(student_ids,raw_scores):
            student = Student.objects.get(id=student_id)
            score = Score.objects.get(student=student, classroom=classroom)
            score.score = new_score
            score.save()
        return JsonResponse({'status':'true'})
        
    @method_decorator(staff_required, name='dispatch')
    def put(self, request, classroom_id, student_id):
        classroom = Classroom.objects.get(id=classroom_id)
        student = Student.objects.get(id=student_id)
        score = Score.objects.get(classroom=classroom, student=student)
        raw_score = json.loads(request.body).get('score')
        if raw_score is None:
            return JsonResponse({'status':'Invalid Input'},status=404)
        else:
            score.score = float(raw_score)
            score.save()
            return JsonResponse({'status':'true', 'score':score.info()})

class UserView(RequiredLoginView):
    def get(self, request):
        user = CustomUser.objects.get(id=request.user.id)
        if not user:
            return JsonResponse({'error':'Người dùng không tồn tại'},status=400)
        return JsonResponse(user.info(), status=200)

class ClassSessionView(RequiredLoginView):
    @method_decorator(student_required, name='dispatch')
    def get(self, request):
        day_param = request.GET.get('day', 'true').lower()
        day = day_param in ['true', '1', 'yes']
        student = Student.objects.get(id=request.user.id)
        classrooms = Classroom.objects.filter(students=student)
        class_sessions = None
        today_date = localdate()
        print(today_date)
        if day:
            today = datetime.today().isoweekday() + 1
            print(f"Hôm nay là: {dict(ClassSession.DAYS_OF_WEEK).get(today, 'Unknown')}")
            class_sessions = ClassSession.objects.filter(day_of_week=today, classroom__in=classrooms)
        else:
            class_sessions = ClassSession.objects.filter(classroom__in=classrooms)
        class_sessions_data = []
        for class_session in class_sessions:
            face_auth = FaceAuthLog.objects.filter(student=student, class_session=class_session, created_at__date=today_date).first()
            checkin = True if face_auth else False
            info = class_session.info()
            info['checkin'] = checkin
            class_sessions_data.append(info)
        return JsonResponse({'status': 'success', 'class_sessions': class_sessions_data})

class DeleteAll(RequiredLoginView):
    @method_decorator(staff_required, name='dispatch')
    def post(self, request):
        EmbeddingData.objects.all().delete()
        CustomUser.objects.update(face_auth=False)
        return JsonResponse({"message": "Đã xóa toàn bộ embeddings và reset face_auth."}, status=200)