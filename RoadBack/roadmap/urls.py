from django.urls import path
from .views import upload_syllabus, view_db, get_subjects, get_roadmap, syllabus_list_api, user_syllabuses_api, gpt_generate_test, gpt_check_test
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    #path('process-syllabus/', process_syllabus, name='process_syllabus'),
    path('upload/', upload_syllabus, name='upload_syllabus'),
    path('view-db/', view_db, name='view_db'),
    path('subjects/', get_subjects, name='get_subjects'),
    path('roadmap/<str:subject_id>/', get_roadmap, name='get_roadmap'),
    path('api/syllabus-list/', syllabus_list_api, name='syllabus_list_api'),
    path('api/user-syllabuses/', user_syllabuses_api, name='user_syllabuses_api'),
    # --- User/Auth ---
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/profile/', views.profile, name='profile'),
    # --- API Endpoints ---
    path('api/profile/', views.profile, name='api_profile'),
    path('api/profile/avatar/', views.upload_avatar, name='upload_avatar'),
    path('api/syllabus-search/', views.syllabus_search, name='syllabus_search'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # --- GPT Test API ---
    path('api/gpt-generate-test/', gpt_generate_test, name='gpt_generate_test'),
    path('api/gpt-check-test/', gpt_check_test, name='gpt_check_test'),
]