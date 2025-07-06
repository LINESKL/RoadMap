<template>
  <div class="settings-root no-sidebar">
    <main class="settings-main">
      <div class="settings-tabs">
        <button v-for="t in tabs" :key="t.key" :class="{active: tab===t.key}" @click="tab=t.key">{{ t.label }}</button>
      </div>
      <section v-if="tab==='account'" class="settings-section">
        <h2>Профиль</h2>
        <form class="profile-form" @submit.prevent="saveProfile">
          <div class="profile-avatar-block">
            <img :src="avatarPreview || user.avatarUrl || defaultAvatar" class="profile-avatar-lg" alt="avatar" />
            <div class="avatar-actions">
              <label class="edit-btn">
                <i class="fas fa-edit"></i> Edit
                <input type="file" accept="image/*" @change="onAvatarChange" hidden />
              </label>
              <button v-if="user.avatarUrl || avatarPreview" class="delete-btn" @click="deleteAvatar"><i class="fas fa-trash"></i> Delete</button>
            </div>
          </div>
          <div class="form-fields">
            <div class="form-row">
              <label>Username <span class="tooltip" title="Ваш уникальный никнейм">?</span></label>
              <input v-model="editUsername" required />
            </div>
            <div class="form-row">
              <label>Email <span class="tooltip" title="Ваш email для входа и уведомлений">?</span></label>
              <input v-model="editEmail" type="email" required />
            </div>
            <div class="form-row">
              <label>Phone Number <span class="tooltip" title="Ваш номер телефона для связи">?</span></label>
              <input v-model="editPhone" type="tel" placeholder="+7..." />
            </div>
            <div class="form-row">
              <label>Biography <span class="tooltip" title="Расскажите о себе">?</span></label>
              <textarea v-model="editBio" maxlength="325" rows="3" placeholder="Расскажите о себе..." />
            </div>
            <div class="form-row">
              <label>New Password <span class="tooltip" title="Оставьте пустым, если не менять">?</span></label>
              <input v-model="editPassword" type="password" placeholder="Оставьте пустым, если не менять" />
            </div>
            <div class="form-row form-checkboxes-row">
              <label class="custom-checkbox-inline">
                <input type="checkbox" v-model="notifications.email" />
                <span class="checkmark"></span>
                Email Notification
              </label>
              <label class="custom-checkbox-inline">
                <input type="checkbox" v-model="notifications.push" />
                <span class="checkmark"></span>
                Sound Notification
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="main-btn">Сохранить</button>
              <button type="button" class="main-btn cancel-btn" @click="cancelEdit">Отмена</button>
            </div>
            <div v-if="editError" class="error-message">{{ editError }}</div>
            <div v-if="editSuccess" class="success-message">Профиль обновлён!</div>
          </div>
        </form>
      </section>
      <section v-if="tab==='security'" class="settings-section">
        <h2>Безопасность</h2>
        <form class="security-form">
          <div class="form-row form-checkboxes-row">
            <label class="custom-checkbox-inline">
              <input type="checkbox" v-model="security.twoFactor" />
              <span class="checkmark"></span>
              Двухфакторная аутентификация
            </label>
          </div>
          <div class="form-row">
            <button class="main-btn" @click="resetPassword">Сбросить пароль</button>
          </div>
        </form>
      </section>
      <section v-if="tab==='notifications'" class="settings-section">
        <h2>Уведомления</h2>
        <form class="notifications-form">
          <div class="form-row form-checkboxes-row">
            <label class="custom-checkbox-inline">
              <input type="checkbox" v-model="notifications.email" />
              <span class="checkmark"></span>
              Email-уведомления
            </label>
            <label class="custom-checkbox-inline">
              <input type="checkbox" v-model="notifications.push" />
              <span class="checkmark"></span>
              Push-уведомления
            </label>
          </div>
        </form>
      </section>
      <section v-if="tab==='privacy'" class="settings-section">
        <h2>Приватность</h2>
        <form class="privacy-form">
          <div class="form-row form-checkboxes-row">
            <label class="custom-checkbox-inline">
              <span class="privacy-label">Публичный профиль</span>
              <input type="checkbox" v-model="privacy.publicProfile" />
              <span class="checkmark"></span>
            </label>
            <label class="custom-checkbox-inline">
              <span class="privacy-label">Скрыть email</span>
              <input type="checkbox" v-model="privacy.hideEmail" />
              <span class="checkmark"></span>
            </label>
            <label class="custom-checkbox-inline">
              <span class="privacy-label">Скрыть прогресс</span>
              <input type="checkbox" v-model="privacy.hideProgress" />
              <span class="checkmark"></span>
            </label>
          </div>
        </form>
      </section>
    </main>
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
        { key: 'security', label: 'Безопасность' },
        { key: 'notifications', label: 'Уведомления' },
        { key: 'privacy', label: 'Приватность' },
      ],
      user: {
        username: '',
        email: '',
        avatarUrl: '',
        phone: '',
        bio: '',
      },
      defaultAvatar: 'https://ui-avatars.com/api/?name=User',
      editUsername: '',
      editEmail: '',
      editPhone: '',
      editBio: '',
      editPassword: '',
      editError: '',
      editSuccess: false,
      avatarFile: null,
      avatarPreview: null,
      notifications: {
        email: true,
        push: false,
      },
      privacy: {
        publicProfile: true,
        hideEmail: false,
        hideProgress: false,
      },
      security: {
        twoFactor: false,
      },
      loading: true,
      error: '',
    };
  },
  async mounted() {
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
          this.privacy.publicProfile = data.publicProfile;
          this.privacy.hideEmail = data.hideEmail;
          this.privacy.hideProgress = data.hideProgress;
          this.security.twoFactor = data.twoFactor;
          this.notifications.email = data.notifications?.email ?? true;
          this.notifications.push = data.notifications?.push ?? false;
        } else {
          this.error = data.error || 'Ошибка получения профиля';
        }
      }
    } catch (e) {
      this.error = 'Ошибка сети';
    }
    this.loading = false;
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.user = null;
      this.$router.push('/login');
    },
    onAvatarChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.avatarFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.avatarPreview = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    deleteAvatar() {
      this.avatarFile = null;
      this.avatarPreview = null;
      this.user.avatarUrl = '';
    },
    async saveProfile() {
      this.editError = '';
      this.editSuccess = false;
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('username', this.editUsername);
      formData.append('email', this.editEmail);
      formData.append('phone', this.editPhone);
      formData.append('bio', this.editBio);
      formData.append('password', this.editPassword);
      formData.append('publicProfile', this.privacy.publicProfile);
      formData.append('hideEmail', this.privacy.hideEmail);
      formData.append('hideProgress', this.privacy.hideProgress);
      formData.append('twoFactor', this.security.twoFactor);
      formData.append('notifications', JSON.stringify(this.notifications));
      if (this.avatarFile) {
        formData.append('avatar', this.avatarFile);
      } else if (!this.user.avatarUrl) {
        formData.append('avatar', ''); // удалить аватар
      }
      try {
        const response = await fetch(`${API_URL}/auth/profile/`, {
          method: 'PUT',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });
        const data = await response.json();
        if (!response.ok) {
          this.editError = data.error || 'Ошибка обновления профиля';
          this.showToast(this.editError, 'error');
        } else {
          this.user.username = this.editUsername;
          this.user.email = this.editEmail;
          this.user.phone = this.editPhone;
          this.user.bio = this.editBio;
          if (data.avatarUrl) this.user.avatarUrl = data.avatarUrl;
          this.privacy.publicProfile = data.publicProfile;
          this.privacy.hideEmail = data.hideEmail;
          this.privacy.hideProgress = data.hideProgress;
          this.security.twoFactor = data.twoFactor;
          this.notifications.email = data.notifications?.email ?? true;
          this.notifications.push = data.notifications?.push ?? false;
          this.editSuccess = true;
          this.editPassword = '';
          this.avatarFile = null;
          this.avatarPreview = null;
          this.showToast('Профиль обновлён!', 'success');
          // Для навбара: сохранить url в localStorage
          if (this.user.avatarUrl) {
            localStorage.setItem('avatarUrl', this.user.avatarUrl);
          }
        }
      } catch (e) {
        this.editError = 'Ошибка сети';
        this.showToast(this.editError, 'error');
      }
    },
    showToast(msg, type) {
      const toast = document.createElement('div');
      toast.className = 'profile-toast ' + (type === 'error' ? 'profile-toast-error' : 'profile-toast-success');
      toast.innerText = msg;
      document.body.appendChild(toast);
      setTimeout(() => { toast.classList.add('show'); }, 10);
      setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
    },
    cancelEdit() {
      this.editUsername = this.user.username;
      this.editEmail = this.user.email;
      this.editPhone = this.user.phone;
      this.editBio = this.user.bio;
      this.editPassword = '';
      this.avatarFile = null;
      this.avatarPreview = null;
    },
    resetPassword() {
      this.showToast('Ссылка для сброса пароля отправлена на ваш email!', 'success');
    },
  },
};
</script>

<style scoped>
.settings-root.no-sidebar {
  background: linear-gradient(120deg, #f8fafd 0%, #e9eafd 100%);
  min-height: 100vh;
  padding-top: 40px;
}
.settings-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem 3rem 1rem;
}
.settings-tabs {
  display: flex;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
  justify-content: center;
}
.settings-tabs button {
  background: none;
  border: none;
  font-size: 1.35rem;
  font-weight: 700;
  color: #b3b3e6;
  padding: 0.7rem 2.2rem 0.7rem 2.2rem;
  border-radius: 18px 18px 0 0;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  position: relative;
  letter-spacing: 0.01em;
}
.settings-tabs button.active {
  color: #6c63ff;
  background: #fff;
  box-shadow: 0 2px 8px #e0eaff33;
}
.settings-tabs button.active:after {
  content: '';
  display: block;
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  width: 40%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, #6c63ff 40%, #a084ee 100%);
}
.settings-section {
  background: #fff;
  border-radius: 2.2rem;
  box-shadow: 0 4px 32px #e0eaff33;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  margin: 0 auto;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
  min-width: 0;
}
.settings-section h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #23223a;
  margin-bottom: 1.5rem;
  letter-spacing: 0.01em;
}
.profile-form, .privacy-form, .security-form, .notifications-form {
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-row label {
  font-size: 1.08rem;
  color: #6c63ff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.form-row input, .form-row textarea, .form-row select {
  border: none;
  border-radius: 14px;
  padding: 0.8rem 1.2rem;
  font-size: 1.08rem;
  background: #f7f7fb;
  transition: box-shadow 0.2s, border 0.2s;
  box-shadow: 0 2px 8px #e0eaff11;
  color: #23223a;
}
.form-row input:focus, .form-row textarea:focus, .form-row select:focus {
  outline: none;
  border: 2px solid #6c63ff;
  background: #fff;
  box-shadow: 0 2px 12px #6c63ff22;
}
.form-row input::placeholder, .form-row textarea::placeholder {
  color: #b3b3e6;
  opacity: 1;
}
.form-checkboxes-row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 0.5rem;
}
.custom-checkbox-inline {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  font-weight: 600;
  color: #6c63ff;
  cursor: pointer;
  user-select: none;
  font-size: 1.13rem;
  transition: color 0.2s;
}
.custom-checkbox-inline input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.checkmark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border 0.2s, background 0.2s;
  box-sizing: border-box;
  position: relative;
}
.custom-checkbox-inline input[type="checkbox"]:checked + .checkmark {
  background: #6c63ff;
  border: 2px solid #6c63ff;
}
.checkmark:after {
  content: '';
  display: none;
}
.custom-checkbox-inline input[type="checkbox"]:checked + .checkmark:after {
  display: block;
  content: '';
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: none;
  position: absolute;
}
.custom-checkbox-inline input[type="checkbox"]:checked + .checkmark:before {
  content: '\2713';
  color: #fff;
  font-size: 1.3rem;
  position: absolute;
  left: 6px;
  top: 2px;
}
.privacy-label {
  min-width: 180px;
  color: #6c63ff;
  font-weight: 700;
  font-size: 1.13rem;
  margin-right: 10px;
  display: inline-block;
}
@media (max-width: 900px) {
  .settings-main {
    padding: 1.2rem 0.5rem;
  }
  .settings-section {
    padding: 1.2rem 0.5rem;
    flex-direction: column;
    gap: 1.2rem;
  }
  .form-checkboxes-row {
    gap: 1rem;
  }
  .privacy-label {
    min-width: 120px;
  }
}
</style>
