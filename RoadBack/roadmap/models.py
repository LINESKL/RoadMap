from djongo import models

class Syllabus(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    file_path = models.CharField(max_length=500, unique=True)  # Путь к загруженному файлу
    upload_date = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

class Subject(models.Model):
    id = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    progress = models.IntegerField(default=0)
    syllabus = models.ForeignKey(Syllabus, on_delete=models.CASCADE, null=True, related_name='subjects')  # Связь с силлабусом

    class Meta:
        abstract = True  # Абстрактная модель для MongoDB

class Node(models.Model):
    id = models.CharField(max_length=50, unique=True)
    subject_id = models.CharField(max_length=50)
    label = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    video = models.URLField(blank=True, null=True)
    material = models.TextField(blank=True, null=True)
    assignment = models.TextField(blank=True, null=True)
    position_x = models.IntegerField(default=400)
    position_y = models.IntegerField(default=300)
    style = models.JSONField(default=dict(backgroundColor="#fff", color="#5656D6", padding="10px", borderRadius="10px"))
    children = models.JSONField(default=list)

    class Meta:
        abstract = True