<template>
  <div class="settings-page card-style">
    <h1 class="settings-title">Настройки</h1>
    <div class="settings-section">
      <h2>Внешний вид</h2>
      <div class="setting-item">
        <label for="theme">Тема:</label>
        <select id="theme" v-model="theme" @change="applyTheme">
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </div>
      <div class="setting-item">
        <label for="fontSize">Размер шрифта:</label>
        <select id="fontSize" v-model="fontSize" @change="applyFontSize">
          <option value="small">Маленький</option>
          <option value="medium">Средний</option>
          <option value="large">Большой</option>
        </select>
      </div>
    </div>
    <div class="settings-section">
      <h2>Язык</h2>
      <div class="setting-item">
        <label for="lang">Язык интерфейса:</label>
        <select id="lang" v-model="lang" @change="applyLang">
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
    <div class="settings-section">
      <h2>Уведомления</h2>
      <div class="setting-item">
        <label for="notifications">Уведомления:</label>
        <input id="notifications" type="checkbox" v-model="notifications" @change="applyNotifications" />
        <span>{{ notifications ? 'Включены' : 'Отключены' }}</span>
      </div>
    </div>
    <div class="settings-section">
      <h2>Прочее</h2>
      <button class="main-btn" @click="resetSettings">Сбросить настройки</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsView',
  data() {
    return {
      theme: localStorage.getItem('theme') || 'light',
      lang: localStorage.getItem('lang') || 'ru',
      fontSize: localStorage.getItem('fontSize') || 'medium',
      notifications: localStorage.getItem('notifications') === 'true',
    };
  },
  mounted() {
    this.applyTheme();
    this.applyLang();
    this.applyFontSize();
    this.applyNotifications();
  },
  methods: {
    applyTheme() {
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${this.theme}`);
      localStorage.setItem('theme', this.theme);
    },
    applyLang() {
      localStorage.setItem('lang', this.lang);
    },
    applyFontSize() {
      document.body.classList.remove('font-small', 'font-medium', 'font-large');
      document.body.classList.add(`font-${this.fontSize}`);
      localStorage.setItem('fontSize', this.fontSize);
    },
    applyNotifications() {
      localStorage.setItem('notifications', this.notifications);
    },
    resetSettings() {
      this.theme = 'light';
      this.lang = 'ru';
      this.fontSize = 'medium';
      this.notifications = false;
      this.applyTheme();
      this.applyLang();
      this.applyFontSize();
      this.applyNotifications();
    }
  }
};
</script>

<style scoped>
.settings-page.card-style {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2.5rem 2rem;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(86,86,214,0.08);
}
.settings-title {
  font-size: 2rem;
  font-weight: 700;
  color: #5656D6;
  margin-bottom: 2rem;
  text-align: center;
}
.settings-section {
  margin-bottom: 2rem;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.2rem 1rem;
  box-shadow: 0 2px 8px rgba(86,86,214,0.04);
}
.settings-section h2 {
  font-size: 1.2rem;
  color: #5656D6;
  margin-bottom: 1rem;
  font-weight: 600;
}
.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}
.setting-item label {
  min-width: 120px;
  color: #2d3748;
  font-weight: 500;
}
.setting-item select, .setting-item input[type="checkbox"] {
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  padding: 0.3rem 0.7rem;
  background: #fff;
}
.setting-item span {
  color: #48bb78;
  font-weight: 600;
}
.main-btn {
  padding: 0.7rem 2rem;
  background: #5656D6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.main-btn:hover {
  background: #3333a1;
}
@media (max-width: 600px) {
  .settings-page.card-style {
    padding: 1.2rem 0.5rem;
  }
  .settings-section {
    padding: 0.7rem 0.5rem;
  }
}
</style>
