from django.core.management.base import BaseCommand
from roadmap.parser import parse_thematic_plan, convert_to_roadmap_structure, save_to_mongodb
from roadmap.db import db

class Command(BaseCommand):
    help = 'Process a syllabus file and save to MongoDB'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the syllabus DOCX file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        self.stdout.write(f"Обработка файла: {file_path}")
        try:
            thematic_plan = parse_thematic_plan(file_path)
            roadmap_data = convert_to_roadmap_structure(thematic_plan)
            save_to_mongodb(roadmap_data, db)
            self.stdout.write(self.style.SUCCESS('Силлабус успешно обработан и сохранён!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка: {str(e)}'))