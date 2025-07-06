from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
from .parser import extract_text_from_docx, structure_data_with_gpt, save_to_mongodb
from .db import db
import json
import bcrypt
import jwt
from datetime import datetime, timedelta
import openai
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

MONGO_USERS_COLLECTION = db['users']

SECRET_KEY = settings.SECRET_KEY
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_DAYS = 7

@csrf_exempt
def get_subjects(request):
    try:
        syllabus_data = list(db['syllabus'].find())
        subjects = []
        for item in syllabus_data:
            subjects.append({
                'id': item['id'],
                'title': item['roadmap']['subject']['label'],
                'description': item['roadmap']['subject']['description'],
                'progress': item['roadmap']['subject'].get('progress', 0)
            })
        return JsonResponse({'subjects': subjects}, safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def get_roadmap(request, subject_id):
    try:
        syllabus = db['syllabus'].find_one({'id': subject_id})
        if not syllabus:
            return JsonResponse({'status': 'error', 'message': 'Subject not found'}, status=404)

        roadmap = syllabus['roadmap']

        response_data = {
            'roadmap': {
                'subject': roadmap['subject'],
                'weeks': roadmap['weeks'],
                'subtopics': roadmap['subtopics']
            }
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def extract_youtube_id(url):
    if not url:
        return None
    if 'youtube.com/watch?v=' in url:
        return url.split('v=')[1].split('&')[0]
    if 'youtu.be/' in url:
        return url.split('youtu.be/')[1].split('?')[0]
    return None

def calculate_progress(weeks):
    completed = sum(1 for week in weeks if week.get('completed', False))
    return round((completed / len(weeks)) * 100) if weeks else 0


@csrf_exempt
def upload_syllabus(request):
    if request.method == 'POST':
        if 'syllabus_file' in request.FILES:
            syllabus_file = request.FILES['syllabus_file']
            file_path = os.path.join(settings.MEDIA_ROOT, 'syllabus_files', syllabus_file.name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'wb+') as destination:
                for chunk in syllabus_file.chunks():
                    destination.write(chunk)
            try:
                text = extract_text_from_docx(file_path)
                structured_data = structure_data_with_gpt(text)
                save_to_mongodb(structured_data, db, file_path)
                return JsonResponse({'status': 'ok', 'message': 'Силлабус успешно обработан и сохранён в базу данных!'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'error': f'Ошибка обработки: {str(e)}'}, status=500)
        else:
            return JsonResponse({'status': 'error', 'error': 'Пожалуйста, выберите файл для загрузки.'}, status=400)
    return JsonResponse({'status': 'error', 'error': 'POST required'}, status=405)


def view_db(request):
    syllabus = list(db['syllabus'].find())

    for item in syllabus:
        item['_id'] = str(item['_id'])

    return render(request, 'view_db.html', {'syllabus': syllabus})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            user = MONGO_USERS_COLLECTION.find_one({'username': username})
            if not user or not bcrypt.checkpw(password.encode(), user['password'].encode()):
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
            
            payload = {
                'username': user['username'],
                'exp': datetime.utcnow() + timedelta(days=JWT_EXP_DELTA_DAYS)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
            return JsonResponse({
                'status': 'ok', 
                'token': token, 
                'user': {
                    'username': user['username'], 
                    'email': user.get('email', '')
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=405)

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            if MONGO_USERS_COLLECTION.find_one({'username': username}):
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            user_doc = {
                'username': username,
                'email': email,
                'password': hashed_pw,
                'role': 'user',
                'created_at': datetime.utcnow()
            }
            MONGO_USERS_COLLECTION.insert_one(user_doc)
            return JsonResponse({
                'status': 'ok', 
                'user': {
                    'username': username, 
                    'email': email, 
                    'role': 'user'
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=405)

@csrf_exempt
def profile(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user = MONGO_USERS_COLLECTION.find_one({'username': payload['username']})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        if request.method == 'GET':
            # Возвращаем все настройки
            return JsonResponse({
                'username': user['username'],
                'email': user.get('email', ''),
                'avatarUrl': user.get('avatarUrl', ''),
                'publicProfile': user.get('publicProfile', True),
                'hideEmail': user.get('hideEmail', False),
                'hideProgress': user.get('hideProgress', False),
                'twoFactor': user.get('twoFactor', False),
            })
        elif request.method == 'PUT':
            # Обновление профиля и настроек
            if request.content_type and request.content_type.startswith('multipart'):
                data = request.POST
                files = request.FILES
            else:
                data = json.loads(request.body)
                files = None
            update = {}
            if 'username' in data:
                update['username'] = data['username']
            if 'email' in data:
                update['email'] = data['email']
            if 'publicProfile' in data:
                update['publicProfile'] = data['publicProfile'] in [True, 'true', 'True', 1, '1']
            if 'hideEmail' in data:
                update['hideEmail'] = data['hideEmail'] in [True, 'true', 'True', 1, '1']
            if 'hideProgress' in data:
                update['hideProgress'] = data['hideProgress'] in [True, 'true', 'True', 1, '1']
            if 'twoFactor' in data:
                update['twoFactor'] = data['twoFactor'] in [True, 'true', 'True', 1, '1']
            if 'password' in data and data['password']:
                update['password'] = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
            # Аватар (сохраняем base64 или url, если есть)
            if files and 'avatar' in files:
                avatar_file = files['avatar']
                avatar_path = os.path.join(settings.MEDIA_ROOT, 'avatars', avatar_file.name)
                os.makedirs(os.path.dirname(avatar_path), exist_ok=True)
                with open(avatar_path, 'wb+') as dest:
                    for chunk in avatar_file.chunks():
                        dest.write(chunk)
                update['avatarUrl'] = '/media/avatars/' + avatar_file.name
            MONGO_USERS_COLLECTION.update_one({'username': user['username']}, {'$set': update})
            user = MONGO_USERS_COLLECTION.find_one({'username': update.get('username', user['username'])})
            return JsonResponse({
                'username': user['username'],
                'email': user.get('email', ''),
                'avatarUrl': user.get('avatarUrl', ''),
                'publicProfile': user.get('publicProfile', True),
                'hideEmail': user.get('hideEmail', False),
                'hideProgress': user.get('hideProgress', False),
                'twoFactor': user.get('twoFactor', False),
            })
        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token expired'}, status=401)
    except Exception as e:
        return JsonResponse({'error': 'Invalid token or server error: ' + str(e)}, status=401)

@csrf_exempt
def profile_api(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user = MONGO_USERS_COLLECTION.find_one({'username': payload['username']})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        if request.method == 'GET':
            return JsonResponse({
                'username': user['username'],
                'email': user.get('email', ''),
                'firstName': user.get('firstName', ''),
                'lastName': user.get('lastName', ''),
                'bio': user.get('bio', ''),
                'phone': user.get('phone', ''),
            })
        
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Валидация
            if not data.get('username') or not data.get('email'):
                return JsonResponse({'error': 'Username and email are required'}, status=400)
            
            # Проверяем уникальность username и email (кроме текущего пользователя)
            existing_user = MONGO_USERS_COLLECTION.find_one({
                '$and': [
                    {'$or': [
                        {'username': data['username']},
                        {'email': data['email']}
                    ]},
                    {'username': {'$ne': user['username']}}
                ]
            })
            
            if existing_user:
                return JsonResponse({'error': 'Username or email already exists'}, status=400)
            
            # Обновляем профиль
            update_data = {
                'username': data['username'],
                'email': data['email'],
                'firstName': data.get('firstName', ''),
                'lastName': data.get('lastName', ''),
                'bio': data.get('bio', ''),
                'phone': data.get('phone', ''),
            }
            
            MONGO_USERS_COLLECTION.update_one(
                {'username': user['username']},
                {'$set': update_data}
            )
            
            return JsonResponse(update_data)
        
        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

@csrf_exempt
def syllabus_list_api(request):
    if request.method == 'GET':
        syllabus = list(db['syllabus'].find())
        for item in syllabus:
            item['_id'] = str(item['_id'])
            # Преобразуем дату в строку для фронта
            if 'upload_date' in item:
                item['upload_date'] = str(item['upload_date'])
        return JsonResponse({'syllabuses': syllabus}, safe=False)
    return JsonResponse({'error': 'GET required'}, status=405)

@csrf_exempt
def syllabus_search(request):
    """API для поиска силлабусов"""
    if request.method == 'GET':
        query = request.GET.get('q', '').strip()
        if not query:
            return JsonResponse({'results': []})
        
        try:
            # Поиск по названию предмета и описанию
            search_filter = {
                '$or': [
                    {'roadmap.subject.label': {'$regex': query, '$options': 'i'}},
                    {'roadmap.subject.description': {'$regex': query, '$options': 'i'}},
                ]
            }
            
            syllabuses = list(db['syllabus'].find(search_filter).limit(20))
            results = []
            
            for syllabus in syllabuses:
                results.append({
                    'id': syllabus['id'],
                    'title': syllabus['roadmap']['subject']['label'],
                    'description': syllabus['roadmap']['subject']['description'],
                    'upload_date': str(syllabus.get('upload_date', '')),
                    'processed': syllabus.get('processed', False)
                })
            
            return JsonResponse({'results': results})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'GET required'}, status=405)

@csrf_exempt
def user_syllabuses_api(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user = MONGO_USERS_COLLECTION.find_one({'username': payload['username']})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        if request.method == 'GET':
            user_syllabus_ids = [item['syllabus_id'] for item in user.get('user_progress', [])]
            syllabuses = list(db['syllabus'].find({'id': {'$in': user_syllabus_ids}})) if user_syllabus_ids else []
            for item in syllabuses:
                item['_id'] = str(item['_id'])
                if 'upload_date' in item:
                    item['upload_date'] = str(item['upload_date'])
                # Вставляем user_progress для фронта
                up = next((up for up in user.get('user_progress', []) if up['syllabus_id'] == item['id']), None)
                item['user_progress'] = up if up else {}
            return JsonResponse({'syllabuses': syllabuses, 'user': {'user_progress': user.get('user_progress', [])}}, safe=False)
        elif request.method == 'POST':
            data = json.loads(request.body)
            syllabus_id = data.get('syllabus_id')
            if not syllabus_id:
                return JsonResponse({'error': 'syllabus_id required'}, status=400)
            # Добавить syllabus_id в user_progress, если его там нет
            user_progress = user.get('user_progress', [])
            if not any(item['syllabus_id'] == syllabus_id for item in user_progress):
                user_progress.append({'syllabus_id': syllabus_id, 'progress': 0, 'tests': {}})
                MONGO_USERS_COLLECTION.update_one({'username': user['username']}, {'$set': {'user_progress': user_progress}})
            return JsonResponse({'status': 'ok'})
        elif request.method == 'PATCH':
            data = json.loads(request.body)
            syllabus_id = data.get('syllabus_id')
            completed_topics = data.get('completed_topics', [])
            if not syllabus_id:
                return JsonResponse({'error': 'syllabus_id required'}, status=400)
            user_progress = user.get('user_progress', [])
            updated = False
            # Получаем реальное количество тем из базы
            syllabus = db['syllabus'].find_one({'id': syllabus_id})
            total = 1
            if syllabus and 'roadmap' in syllabus and 'subtopics' in syllabus['roadmap']:
                total = len(syllabus['roadmap']['subtopics'])
            for item in user_progress:
                if item['syllabus_id'] == syllabus_id:
                    item['completed_topics'] = completed_topics
                    item['progress'] = round((len(completed_topics) / total) * 100) if total else 0
                    updated = True
            if not updated:
                user_progress.append({'syllabus_id': syllabus_id, 'completed_topics': completed_topics, 'progress': 0, 'tests': {}})
            MONGO_USERS_COLLECTION.update_one({'username': user['username']}, {'$set': {'user_progress': user_progress}})
            return JsonResponse({'status': 'ok'})
        elif request.method == 'DELETE':
            # Новый метод для отписки от курса
            data = json.loads(request.body)
            syllabus_id = data.get('syllabus_id')
            if not syllabus_id:
                return JsonResponse({'error': 'syllabus_id required'}, status=400)
            
            user_progress = user.get('user_progress', [])
            # Удаляем курс из прогресса пользователя
            user_progress = [item for item in user_progress if item['syllabus_id'] != syllabus_id]
            
            MONGO_USERS_COLLECTION.update_one(
                {'username': user['username']}, 
                {'$set': {'user_progress': user_progress}}
            )
            return JsonResponse({'status': 'ok', 'message': 'Unsubscribed successfully'})
        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

@csrf_exempt
def gpt_generate_test(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body)
        topic_label = data.get('topic_label')
        count = int(data.get('count', 1))
        if not topic_label:
            return JsonResponse({'error': 'topic_label required'}, status=400)
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        prompt = (
            f"Сгенерируй {count} тестовых вопроса с коротким ответом по теме: '{topic_label}'. "
            "Формат: каждый вопрос и ответ на отдельной строке, строго так: Вопрос: ... Ответ: ...\n"
            "Не нумеруй вопросы, не добавляй лишних символов, только шаблон."
        )
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message['content'].strip()
        print('GPT RAW:', content)  # Лог для отладки
        questions = []
        answers = []
        # Новый парсер: выделяем все пары Вопрос: ... Ответ: ...
        import re
        qa_pairs = re.findall(r'Вопрос:(.*?)\s*Ответ:(.*?)(?=\nВопрос:|$)', content, re.DOTALL)
        questions = [q.strip() for q, a in qa_pairs]
        answers = [a.strip() for q, a in qa_pairs]
        if not questions:
            # fallback: один вопрос
            if 'Ответ:' in content:
                q, a = content.split('Ответ:', 1)
                questions = [q.replace('Вопрос:', '').strip()]
                answers = [a.strip()]
            else:
                questions = [content]
                answers = ['']
        print('QUESTIONS:', questions)
        print('ANSWERS:', answers)
        request.session['gpt_test_answers'] = answers
        return JsonResponse({'questions': questions})
    except Exception as e:
        print('GPT error:', e)
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def gpt_check_test(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body)
        user_answer = data.get('answer', '').strip()
        correct_answer = request.session.get('gpt_test_answer', '').strip()
        # GPT-подсказка для проверки
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        prompt = f"Проверь, является ли следующий ответ эквивалентным правильному.\nВопрос: {data.get('question', '')}\nПравильный ответ: {correct_answer}\nОтвет пользователя: {user_answer}\nОтветь только 'Да' или 'Нет'."
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        gpt_reply = response.choices[0].message['content'].strip().lower()
        is_correct = gpt_reply.startswith('да')
        return JsonResponse({'correct': is_correct})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def upload_avatar(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user = MONGO_USERS_COLLECTION.find_one({'username': payload['username']})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        if 'avatar' not in request.FILES:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        avatar_file = request.FILES['avatar']
        
        # Validate file size (5MB max)
        if avatar_file.size > 5 * 1024 * 1024:
            return JsonResponse({'error': 'File too large'}, status=400)
        
        # Validate file type
        if not avatar_file.content_type.startswith('image/'):
            return JsonResponse({'error': 'Invalid file type'}, status=400)
        
        # Generate unique filename
        filename = f"avatars/{user['username']}_{int(time.time())}.{avatar_file.name.split('.')[-1]}"
        
        # Save file
        saved_path = default_storage.save(filename, ContentFile(avatar_file.read()))
        avatar_url = f"/media/{saved_path}"
        
        # Update user in database
        MONGO_USERS_COLLECTION.update_one(
            {'username': user['username']},
            {'$set': {'avatar': avatar_url}}
        )
        
        return JsonResponse({'avatar_url': avatar_url})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

