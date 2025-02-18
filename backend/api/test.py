
# class Classroom(BaseModel):
#     name = models.CharField(max_length=255, unique=True)
#     teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name="group")
#     start_time = models.TimeField(default="00:00:00")
#     end_time = models.TimeField(default="23:59:59")

#     def __str__(self):
#         return self.name

#     class Meta:
#         db_table = "classsroom"
#         ordering = ("-created_at",)

# class FaceAuthLog(BaseModel):
#     student = models.ForeignKey(
#         Student,
#         on_delete=models.CASCADE,
#         related_name="facial_auth_logs",
#         blank=True,
#         null=True,
#     )
#     image_data = models.BinaryField(blank=True, null=True)
#     is_valid = models.BooleanField(default=False)

#     def __str__(self):
#         return f"{self.created_at}"
    
#     class Meta:
#         db_table = "face_auth_logs"
#         ordering = ("-created_at",)

#     def get_image(self):
#         """
#         Hàm để chuyển dữ liệu nhị phân trong trường `image_data`
#         thành một đối tượng ảnh PIL.
#         """
#         if self.image_data:
#             # Chuyển từ binary thành ảnh PIL
#             image = Image.open(BytesIO(self.image_data))
#             return image
#         return None

# class Report(BaseModel):
#     student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="reports")
#     log_face = models.ForeignKey(FaceAuthLog, on_delete=models.CASCADE, related_name="reports")
#     problem = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"{self.log_face.student.name} - {self.log_face.created_at}"
    
#     class Meta:
#         db_table = "reports"
#         ordering = ("-created_at",)

# class Score(BaseModel):
#     student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="scores")
#     classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="scores")
#     score = models.FloatField(default=0)

#     def __str__(self):
#         return f"{self.student.name} - {self.classroom.name}"
    
#     class Meta:
#         db_table = "scores"
#         ordering = ("-created_at",)