<template>
  <div class="profile-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-inner">
          <div class="avatar-block">
            <div class="avatar-container">
              <img 
                :src="avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&size=120&background=f8fafc&color=5656d6&bold=true`" 
                alt="avatar" 
                class="avatar-img" 
                @error="onImageError"
              />
              <button class="avatar-edit-btn" @click="triggerAvatarUpload" :disabled="avatarUploading">
                <svg v-if="!avatarUploading" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0-8c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm0-3c-4.4 0-8 3.6-8 8 0 1.4.4 2.7 1 3.8l1.4-1.4c-.4-.7-.6-1.5-.6-2.4 0-3.3 2.7-6 6-6s6 2.7 6 6c0 .9-.2 1.7-.6 2.4l1.4 1.4c.6-1.1 1-2.4 1-3.8 0-4.4-3.6-8-8-8z" fill="currentColor"/>
                  <path d="M15 9c0-1.7-1.3-3-3-3s-3 1.3-3 3c0 .8.3 1.5.8 2.1l4.2-4.2c-.3-.2-.7-.3-1-.3-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1z" fill="currentColor"/>
                </svg>
                <div v-else class="spinner-small"></div>
              </button>
              <input 
                type="file" 
                ref="avatarInput" 
                @change="onAvatarChange" 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                style="display: none;"
              />
            </div>
            <div class="user-meta">
              <h1 class="user-name">{{ user.username || 'Пользователь' }}</h1>
              <p class="user-email">{{ user.email || 'email@example.com' }}</p>
              <div class="user-badges">
                <span class="badge badge-blue">{{ user.role || 'Студент' }}</span>
                <span class="badge badge-green">{{ user.status || 'Активен' }}</span>
              </div>
            </div>
          </div>
        
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-bg1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
              <path d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.totalCourses }}</div>
            <div class="stat-label">Активных курсов</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-bg2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4H15V2C15 1.45 15.45 1 16 1S17 1.45 17 2V4H20C21.1 4 22 4.9 22 6V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V6C2 4.9 2.9 4 4 4H7ZM20 8H4V20H20V8ZM12 11L15.5 14.5L12 18L8.5 14.5L12 11Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.completedCourses }}</div>
            <div class="stat-label">Завершено курсов</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-bg3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.averageProgress }}%</div>
            <div class="stat-label">Средний прогресс</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-bg4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM17 13H11V7H13V11H17V13Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">24ч</div>
            <div class="stat-label">Время изучения</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="profile-main">
      <div class="profile-main-inner">
        <aside class="profile-sidebar">
          <nav>
            <ul>
              <li>
                <button :class="{active: tab==='account'}" @click="tab='account'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" fill="currentColor"/>
                  </svg>
                  Личная информация
                </button>
              </li>
              <li>
                <button :class="{active: tab==='notifications'}" @click="tab='notifications'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
                  </svg>
                  Уведомления
                </button>
              </li>
              <li>
                <button :class="{active: tab==='privacy'}" @click="tab='privacy'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor"/>
                  </svg>
                  Приватность
                </button>
              </li>
              <li>
                <button :class="{active: tab==='security'}" @click="tab='security'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                  </svg>
                  Безопасность
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        <main class="profile-content">
          <!-- Account -->
          <div v-if="tab==='account'" class="panel">
            <h2>Личная информация</h2>
            <form class="profile-form" @submit.prevent="saveProfile">
              <div class="form-row">
                <div class="form-group">
                  <label>Имя пользователя</label>
                  <input v-model="editUsername" type="text" required />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="editEmail" type="email" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Телефон</label>
                  <input v-model="editPhone" type="tel" />
                </div>
                <div class="form-group">
                  <label>Дата рождения</label>
                  <input type="date" />
                </div>
              </div>
              <div class="form-group">
                <label>О себе</label>
                <textarea v-model="editBio" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button class="btn btn-main" type="submit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                  </svg>
                  Сохранить
                </button>
                <button class="btn btn-outline" type="button" @click="cancelEdit">Отмена</button>
              </div>
            </form>
          </div>
          <!-- Notifications -->
          <div v-if="tab==='notifications'" class="panel">
            <h2>Уведомления</h2>
            <div class="setting-row">
              <span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
                Email уведомления
              </span>
              <label class="switch">
                <input type="checkbox" v-model="notifications.email" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
                </svg>
                Push уведомления
              </span>
              <label class="switch">
                <input type="checkbox" v-model="notifications.push" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <!-- Privacy -->
          <div v-if="tab==='privacy'" class="panel">
            <h2>Приватность</h2>
            <div class="setting-row">
              <span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z" fill="currentColor"/>
                </svg>
                Публичный профиль
              </span>
              <label class="switch">
                <input type="checkbox" v-model="privacy.publicProfile" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
                Скрыть email
              </span>
              <label class="switch">
                <input type="checkbox" v-model="privacy.hideEmail" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <!-- Security -->
          <div v-if="tab==='security'" class="panel">
            <h2>Безопасность</h2>
            <div class="security-actions">
              <button class="btn btn-outline" @click="resetPassword">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6H9C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM18 20H6V10H18V20ZM14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16Z" fill="currentColor"/>
                </svg>
                Сменить пароль
              </button>
              <button class="btn btn-danger" @click="logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                </svg>
                Выйти
              </button>
            </div>
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<script>
const API_URL = 'http://localhost:8000';
export default {
  name: 'ProfileView',
  data() {
    return {
      tab: 'account',
      tabs: [
        { key: 'account', label: 'Профиль' },
        { key: 'notifications', label: 'Уведомления' },
        { key: 'privacy', label: 'Приватность' },
        { key: 'security', label: 'Безопасность' },
      ],
      user: {
        username: '',
        email: '',
        phone: '',
        bio: '',
      },
      editUsername: '',
      editEmail: '',
      editPhone: '',
      editBio: '',
      editPassword: '',
      editError: '',
      editSuccess: false,
      notifications: {
        email: true,
        push: false,
      },
      privacy: {
        publicProfile: true,
        hideEmail: false,
      },
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
      },
      loading: true,
      error: '',
      avatarPreview: '',
      avatarUploading: false,
      avatarFile: null
    };
  },
  async mounted() {
    await this.loadProfile();
    await this.loadStats();
  },
  methods: {
    async loadProfile() {
      this.error = '';
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/profile/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.status === 401) {
          this.user = null;
        } else {
          const data = await response.json();
          if (response.ok) {
            this.user = data;
            this.editUsername = data.username;
            this.editEmail = data.email;
            this.editPhone = data.phone || '';
            this.editBio = data.bio || '';
            // Set avatar if exists
            if (data.avatar) {
              this.user.avatar = data.avatar;
            }
          } else {
            this.error = data.error || 'Ошибка получения профиля';
          }
        }
      } catch (e) {
        this.error = 'Ошибка сети';
      }
      this.loading = false;
    },
    async loadStats() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/user-syllabuses/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          this.stats.totalCourses = data.syllabuses?.length || 0;
          this.stats.completedCourses = Math.floor(this.stats.totalCourses * 0.3);
          this.stats.averageProgress = Math.floor(Math.random() * 100);
        }
      } catch (e) {
        console.log('Error loading stats:', e);
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.user = null;
      this.$router.push('/login');
    },
    async saveProfile() {
      this.editError = '';
      this.editSuccess = false;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/profile/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.editUsername,
            email: this.editEmail,
            phone: this.editPhone,
            bio: this.editBio,
            password: this.editPassword || undefined
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.user = { ...this.user, ...data };
          this.editSuccess = true;
          this.editPassword = '';
          setTimeout(() => {
            this.editSuccess = false;
          }, 3000);
        } else {
          this.editError = data.error || 'Ошибка сохранения';
        }
      } catch (e) {
        this.editError = 'Ошибка сети';
      }
    },
    cancelEdit() {
      this.editUsername = this.user.username;
      this.editEmail = this.user.email;
      this.editPhone = this.user.phone;
      this.editBio = this.user.bio;
      this.editPassword = '';
    },
    resetPassword() {
      alert('Ссылка для сброса пароля отправлена на ваш email!');
    },
    onImageError() {
      console.log('Image failed to load, using fallback');
      // Fallback to a simple colored avatar
      this.user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.username || 'User')}&size=120&background=f8fafc&color=5656d6&bold=true`;
    },
    triggerAvatarUpload() {
      if (this.avatarUploading) return;
      this.$refs.avatarInput.click();
    },
    onAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 5МБ');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Выберите изображение');
        return;
      }

      this.avatarUploading = true;

      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        this.avatarPreview = event.target.result;
        console.log('Preview set:', this.avatarPreview ? 'success' : 'failed');
      };
      reader.readAsDataURL(file);

      // Simulate upload (remove this when you have real backend)
      setTimeout(() => {
        this.avatarUploading = false;
        alert('Фото обновлено! (демо режим)');
        // In real app, this.user.avatar = response.avatar_url;
      }, 2000);
    },
    async uploadAvatar(file) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_URL}/api/profile/avatar/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update user avatar URL
      this.user.avatar = data.avatar_url;
      
      // Clear preview since we now have the real URL
      setTimeout(() => {
        this.avatarPreview = '';
      }, 1000);

      alert('Фото профиля обновлено!');
    },
  },
};
</script>

<style scoped>
/* Reset and base */
.profile-page {
  background: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Hero section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0 40px;
  color: white;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-wrap: wrap;
  gap: 40px;
}

.avatar-block {
  display: flex;
  align-items: center;
  gap: 32px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #5656d6;
  border: 2px solid white;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-btn:hover:not(:disabled) {
  background: #4c4fd8;
  transform: scale(1.1);
}

.avatar-edit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-badges {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.badge {
  padding: 4px 14px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}
.badge-blue { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.badge-green { 
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.hero-actions {
  display: flex;
  gap: 16px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-main {
  background: linear-gradient(90deg, #5656d6 0%, #7b68ee 100%);
  color: #fff;
}
.btn-outline {
  background: #fff;
  color: #5656d6;
  border: 2px solid #e2e8f0;
}
.btn-danger {
  background: #ef4444;
  color: #fff;
}
.btn-main:hover, .btn-outline:hover, .btn-danger:hover {
  opacity: 0.9;
}
.stats {
  background: #fff;
  padding: 40px 0;
  border-bottom: 1px solid #e2e8f0;
}
.stats-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  padding: 0 32px;
}
.stat-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(86, 86, 214, 0.1);
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
}
.stat-bg1 { background: #5656d6; }
.stat-bg2 { background: #f59e0b; }
.stat-bg3 { background: #10b981; }
.stat-bg4 { background: #ef4444; }
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}
.stat-label {
  color: #6b7280;
  font-size: 1rem;
}
.profile-main {
  padding: 40px 0;
}
.profile-main-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  padding: 0 32px;
}
.profile-sidebar {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  height: fit-content;
  overflow: hidden;
}
.profile-sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.profile-sidebar button {
  width: 100%;
  background: none;
  border: none;
  padding: 16px 20px;
  text-align: left;
  font-size: 15px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}
.profile-sidebar button:last-child {
  border-bottom: none;
}
.profile-sidebar button:hover {
  background: #f8fafc;
  color: #475569;
}
.profile-sidebar button.active {
  background: #5656d6;
  color: white;
  font-weight: 500;
}
.profile-content {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 32px;
}
.panel h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1e293b;
}
.profile-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.profile-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-form label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}
.profile-form input, .profile-form textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}
.profile-form input:focus, .profile-form textarea:focus {
  outline: none;
  border-color: #5656d6;
  box-shadow: 0 0 0 3px rgba(86, 86, 214, 0.1);
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}
.setting-row:last-child {
  border-bottom: none;
}
.setting-row span {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 28px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #5656d6;
}
input:checked + .slider:before {
  transform: translateX(20px);
}
.security-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
.security-card {
  padding: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
}
.security-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #5656d6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin: 0 auto 20px;
}
.security-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}
.security-description {
  color: #718096;
  margin-bottom: 20px;
}
@media (max-width: 768px) {
  .hero-inner,
  .profile-main-inner {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .avatar-block {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>