# 🎓 RoadMap - Персональные учебные маршруты

![RoadMap Banner](https://img.shields.io/badge/RoadMap-Educational%20Platform-5656D6?style=for-the-badge&logo=graduation-cap)

## 📖 О проекте

**RoadMap** - это инновационная образовательная платформа, которая помогает создавать и изучать персональные учебные маршруты. Проект состоит из веб-приложения и мобильного приложения, обеспечивая удобный доступ к обучению на любом устройстве.

### ✨ Основные возможности

- 📚 **Создание курсов** - Интуитивный редактор для создания структурированных учебных программ
- 🗺️ **Интерактивные роадмапы** - Визуальное представление учебного процесса с Vue Flow диаграммами
- 📊 **Отслеживание прогресса** - Детальная статистика изучения материалов
- 🔍 **Поиск курсов** - Умный поиск и фильтрация доступных курсов
- 📱 **Мобильное приложение** - Нативное iOS/Android приложение для обучения в пути
- 🤖 **AI тестирование** - Автоматическая генерация тестов с помощью GPT
- 👥 **Управление пользователями** - Система ролей и персонализации
- 📁 **Загрузка силлабусов** - Импорт курсов из файлов

## 🏗️ Архитектура проекта

```
RoadMap/
├── 🌐 RoadBack/          # Django Backend API
├── 💻 RoadFront/         # Vue.js Web Frontend  
├── 📱 RoadMobile/        # React Native Mobile App
└── 📄 README.md          # Документация проекта
```

## 🛠️ Технологический стек

### Backend (RoadBack)
![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

- **Django 4.x** - Веб-фреймворк для создания REST API
- **MongoDB** - NoSQL база данных для хранения курсов и пользователей
- **PyMongo** - ODM для работы с MongoDB
- **JWT** - Аутентификация и авторизация
- **CORS** - Поддержка кросс-доменных запросов
- **File Upload** - Обработка загрузки силлабусов

### Web Frontend (RoadFront)
![Vue](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

- **Vue.js 3** - Прогрессивный JavaScript фреймворк
- **Vue Router** - Клиентская маршрутизация
- **Axios** - HTTP клиент для API запросов
- **@vue-flow/core** - Интерактивные диаграммы роадмапов
- **CSS Grid/Flexbox** - Современная верстка
- **Animations** - Плавные CSS анимации и переходы

### Mobile App (RoadMobile)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

- **React Native** - Кросс-платформенная разработка
- **Expo SDK 53** - Инструменты для разработки и деплоя
- **Expo Router** - Файловая маршрутизация
- **AsyncStorage** - Локальное хранилище данных
- **Expo Linear Gradient** - Градиенты и анимации
- **Expo Notifications** - Push уведомления

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** v18+ и npm
- **Python** 3.9+ и pip
- **MongoDB** (локально или MongoDB Atlas)
- **Expo CLI** для мобильной разработки

### 1. Клонирование репозитория

```bash
git clone https://github.com/LINESKL/RoadMap
cd RoadMap
```

### 2. Настройка Backend

```bash
cd RoadBack
pip install -r requirements.txt

# Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Запуск сервера разработки
python manage.py runserver 0.0.0.0:8000
```

### 3. Настройка Web Frontend

```bash
cd RoadFront/roadmap-front
npm install

# Запуск в режиме разработки
npm run serve
# или
npm run dev
```

### 4. Настройка Mobile App

```bash
cd RoadMobile

# Установка зависимостей
npm install
npx expo install

# Настройка API URL
# Отредактируйте config/api.js с вашим IP адресом

# Запуск в режиме разработки
npx expo start
```

## 📱 Функционал приложений

### 🌐 Веб-приложение (Vue.js)

#### Администратор/Преподаватель
- ✅ **Загрузка силлабусов** - Импорт курсов из файлов
- ✅ **Создание роадмапов** - Интерактивный редактор с Vue Flow
- ✅ **Управление тестами** - AI-генерация вопросов с GPT
- ✅ **Аналитика** - Статистика по студентам и курсам

#### Студент
- ✅ **Поиск курсов** - Умная фильтрация и добавление
- ✅ **Интерактивные роадмапы** - Визуальное изучение по неделям
- ✅ **Прохождение тестов** - Автоматическая оценка знаний
- ✅ **Профиль** - Персональная статистика и настройки

#### Дизайн особенности
- 🎨 **Стеклянные эффекты** - backdrop-filter и прозрачность
- 📝 **Печатающие анимации** - на страницах логина/регистрации
- 🌈 **Градиенты** - фирменная фиолетовая палитра #5656D6
- 📱 **Адаптивность** - отзывчивый дизайн для всех устройств

### 📱 Мобильное приложение (React Native)

#### Основные экраны
- **🏠 Главная** - Обзор курсов и быстрые действия
- **🔍 Поиск** - Поиск и запись на курсы
- **👤 Профиль** - Управление аккаунтом и настройки

#### Дополнительные функции
- **📊 Статистика** - Детальная аналитика обучения с графиками
- **📥 Загрузки** - Офлайн материалы для изучения
- **⚙️ Настройки** - Уведомления, темная тема, персонализация
- **🗺️ Роадмапы** - Интерактивное изучение курсов по темам

## 🎨 Дизайн система

### Цветовая палитра

```css
/* Основные цвета */
Primary: #5656D6 → #7B68EE (градиент)
Secondary: #7b7be6
Success: #10B981
Warning: #F59E0B  
Error: #EF4444

/* Нейтральные */
Gray-50: #F8FAFC
Gray-200: #E2E8F0
Gray-400: #9CA3AF
Gray-600: #6B7280
Gray-900: #1F2937

/* Специальные эффекты */
Glass: rgba(255, 255, 255, 0.15)
Shadow: rgba(86, 86, 214, 0.08)
```

### Компоненты UI

#### Web (Vue.js)
- **Градиентные карточки** с стеклянными эффектами
- **Анимации печати** для динамического текста
- **Интерактивные диаграммы** с Vue Flow
- **Модальные окна** с backdrop-filter
- **Hover эффекты** с плавными переходами

#### Mobile (React Native)
- **LinearGradient заголовки** с скругленными углами
- **Карточки с тенями** и анимациями
- **Прогресс-бары** с цветовой индикацией
- **Ionicons** для единообразия иконок
- **Switch компоненты** для настроек

## 📊 API Документация

### Аутентификация

```bash
POST /auth/login/           # Вход в систему
POST /auth/register/        # Регистрация пользователя
```

### Курсы и роадмапы

```bash
GET /api/syllabus-list/        # Список всех курсов
GET /api/user-syllabuses/      # Курсы пользователя
POST /api/user-syllabuses/     # Запись на курс
DELETE /api/user-syllabuses/   # Отписка от курса
GET /roadmap/{id}/             # Детали роадмапа
POST /api/upload-syllabus/     # Загрузка силлабуса
```

### Поиск и тесты

```bash
GET /api/syllabus-search/?q={query}  # Поиск курсов
GET /api/tests/{id}/                 # Получение теста
POST /api/tests/{id}/submit/         # Отправка ответов
```

### Профиль

```bash
GET /api/profile/              # Данные профиля
PUT /api/profile/              # Обновление профиля
GET /api/statistics/           # Статистика пользователя
```

## 🔧 Конфигурация

### Переменные окружения Backend

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.10.9

# MongoDB
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=roadmap_db

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_EXP_DELTA_DAYS=7

# File Upload
MAX_UPLOAD_SIZE=50MB
ALLOWED_FILE_TYPES=.json,.txt,.pdf
```

### Настройки Frontend

#### Vue.js конфигурация
```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
}
```

#### React Native конфигурация
```javascript
// config/api.js
export const API_BASE_URL = Platform.select({
  ios: 'http://192.168.10.9:8000',
  android: 'http://10.0.2.2:8000', 
  web: 'http://localhost:8000',
});
```

## 🧪 Тестирование

```bash
# Backend тесты
cd RoadBack
python manage.py test

# Frontend тесты  
cd RoadFront/roadmap-front
npm run test:unit

# Mobile тесты
cd RoadMobile
npm test
```

## 📦 Сборка и деплой

### Web приложение (Vue.js)

```bash
cd RoadFront/roadmap-front
npm run build
# Деплой на Vercel, Netlify или AWS S3
```

### Mobile приложение

```bash
cd RoadMobile

# iOS сборка
npx expo build:ios

# Android сборка  
npx expo build:android

# Или с EAS Build
npx eas build --platform all
```

### Backend

```bash
cd RoadBack

# Подготовка к production
pip install gunicorn
gunicorn RoadBack.wsgi:application

# Docker (опционально)
docker build -t roadmap-backend .
docker run -p 8000:8000 roadmap-backend
```

## 🌟 Особенности реализации

### Vue.js Frontend
- **Composition API** для современного кода
- **Vue Flow** для интерактивных диаграмм роадмапов
- **CSS анимации** с ключевыми кадрами
- **Стеклянные эффекты** с backdrop-filter
- **Адаптивный дизайн** с медиа-запросами

### React Native Mobile
- **Expo Router** для файловой навигации
- **AsyncStorage** для локального хранения
- **LinearGradient** для красивых градиентов
- **Notifications** для push уведомлений
- **Platform.select** для платформо-специфичного кода

### Django Backend
- **MongoDB** как основная база данных
- **JWT** токены для безопасности
- **File Upload** для загрузки силлабусов
- **CORS** для кросс-доменных запросов
- **RESTful API** для всех операций

## 🤝 Участие в разработке

1. **Fork** репозитория
2. Создайте **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** изменения (`git commit -m 'Add amazing feature'`)
4. **Push** в branch (`git push origin feature/amazing-feature`)
5. Откройте **Pull Request**

### Стандарты кода

- **ESLint** для JavaScript/TypeScript/Vue
- **Prettier** для форматирования
- **PEP 8** для Python кода
- **Conventional Commits** для сообщений коммитов
- **Vue Style Guide** для Vue.js компонентов

## 📝 Структура проекта

```
RoadMap/
├── RoadBack/                   # Django Backend
│   ├── roadmap/               # Основное приложение
│   ├── RoadBack/              # Настройки Django
│   └── requirements.txt       # Python зависимости
│
├── RoadFront/                 # Vue.js Frontend
│   └── roadmap-front/
│       ├── src/
│       │   ├── components/    # Переиспользуемые компоненты
│       │   ├── views/         # Страницы приложения
│       │   ├── router/        # Настройки маршрутизации
│       │   └── assets/        # Статические ресурсы
│       ├── public/            # Публичные файлы
│       └── package.json       # Node.js зависимости
│
├── RoadMobile/                # React Native Mobile
│   ├── app/                   # Экраны приложения
│   ├── components/            # Переиспользуемые компоненты
│   ├── config/                # Конфигурация
│   ├── assets/                # Иконки и изображения
│   └── package.json           # Node.js зависимости
│
└── README.md                  # Документация
```

## 🏆 Достижения проекта

- 🎯 **Полнофункциональная платформа** обучения
- 📱 **Кросс-платформенность** (Web + Mobile)
- 🎨 **Современный UI/UX** дизайн
- 🤖 **AI интеграция** для генерации тестов
- 📊 **Аналитика** и отслеживание прогресса
- 🔒 **Безопасность** с JWT аутентификацией

## 📞 Контакты и поддержка

- **Email**: priveth06@gmail.com
- **Telegram**: @lineski
- **GitHub**: [RoadMap Repository](https://github.com/LINESKL/RoadMap)


---

<div align="center">

**Создано с ❤️ для современного образования**

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)
![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

![Stars](https://img.shields.io/github/stars/yourusername/RoadMap?style=social)
![Forks](https://img.shields.io/github/forks/yourusername/RoadMap?style=social)
![Issues](https://img.shields.io/github/issues/yourusername/RoadMap)
![License](https://img.shields.io/github/license/yourusername/RoadMap)

</div>