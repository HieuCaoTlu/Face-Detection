from django.contrib import admin
from .models import *
from django.utils.html import format_html
from io import BytesIO
from PIL import Image
from .forms import *

class FaceAuthLogAdmin(admin.ModelAdmin):
    list_display = ('student_name', 'is_valid', 'image_preview')
    
    def student_name(self, obj):
        return obj.student.name if obj.student else "Unknown"
        
    student_name.short_description = "Student Name"  # Thêm phương thức `image_preview`

    def image_preview(self, obj):
        """Chuyển dữ liệu nhị phân thành ảnh và hiển thị trong Admin."""
        if obj.image_data:
            # Chuyển đổi dữ liệu nhị phân thành hình ảnh PIL
            image = Image.open(BytesIO(obj.image_data))
            
            # Chuyển hình ảnh PIL thành URL hoặc nhúng ảnh vào HTML
            buffered = BytesIO()
            image.save(buffered, format="JPEG")
            img_data = buffered.getvalue()

            # Lưu ảnh dưới dạng base64 để hiển thị trực tiếp trong HTML
            from base64 import b64encode
            img_base64 = b64encode(img_data).decode('utf-8')
            return format_html('<img src="data:image/jpeg;base64,{}" width="50" />'.format(img_base64))

        return "No Image"  # Nếu không có ảnh, hiển thị thông báo khác

    image_preview.allow_tags = True  # Cho phép HTML trong ô hiển thị

# admin.site.register(Teacher)
# admin.site.register(Student)
admin.site.register(FaceAuthLog, FaceAuthLogAdmin)
admin.site.register(Report)
admin.site.register(Score)
admin.site.register(Classroom)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(Teacher, TeacherAdmin)
admin.site.register(EmbeddingData)
admin.site.register(ClassSession)