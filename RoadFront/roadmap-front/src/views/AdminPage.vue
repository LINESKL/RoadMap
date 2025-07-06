<template>
  <div class="admin-page">
    <h1 class="admin-title">Админ-панель: Загрузка и управление силлабусами</h1>
    <div class="admin-upload card-style">
      <h2>Загрузить новый силлабус (.docx)</h2>
      <form @submit.prevent="uploadSyllabus">
        <input type="file" accept=".docx" @change="onFileChange" required />
        <button type="submit" class="main-btn" :disabled="uploading">Загрузить</button>
      </form>
      <div v-if="uploadMessage" class="success-message">{{ uploadMessage }}</div>
      <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
    </div>
    <div class="admin-list card-style">
      <h2>Загруженные силлабусы</h2>
      <input v-model="search" placeholder="Поиск по названию..." class="search-input" />
      <div v-if="loading" class="admin-loading">Загрузка...</div>
      <div v-else>
        <table class="syllabus-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Дата загрузки</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="syllabus in filteredSyllabuses" :key="syllabus.id">
              <td>{{ syllabus.roadmap.subject.label }}</td>
              <td>{{ syllabus.roadmap.subject.description }}</td>
              <td>{{ formatDate(syllabus.upload_date) }}</td>
              <td>
                <button class="main-btn" @click="selectSyllabus(syllabus)">Просмотр</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredSyllabuses.length === 0" class="admin-empty">Нет силлабусов</div>
      </div>
    </div>
    <div v-if="selectedSyllabus" class="admin-preview card-style">
      <h2>Структура роадмапа: {{ selectedSyllabus.roadmap.subject.label }}</h2>
      <button class="main-btn" @click="selectedSyllabus = null">Закрыть</button>
      <pre class="roadmap-json">{{ selectedSyllabus.roadmap }}</pre>
    </div>
  </div>
</template>

<script>
const API_URL = 'http://localhost:8000';
export default {
  name: 'AdminPage',
  data() {
    return {
      file: null,
      uploading: false,
      uploadMessage: '',
      uploadError: '',
      syllabuses: [],
      loading: true,
      search: '',
      selectedSyllabus: null
    };
  },
  computed: {
    filteredSyllabuses() {
      if (!this.search) return this.syllabuses;
      return this.syllabuses.filter(s =>
        s.roadmap.subject.label.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  methods: {
    onFileChange(e) {
      this.file = e.target.files[0];
    },
    async uploadSyllabus() {
      if (!this.file) return;
      this.uploading = true;
      this.uploadMessage = '';
      this.uploadError = '';
      const formData = new FormData();
      formData.append('syllabus_file', this.file);
      try {
        const response = await fetch(`${API_URL}/upload/`, {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          this.uploadMessage = 'Силлабус успешно загружен и обработан!';
          this.file = null;
          this.fetchSyllabuses();
        } else {
          const data = await response.text();
          this.uploadError = data || 'Ошибка загрузки';
        }
      } catch (e) {
        this.uploadError = 'Ошибка сети';
      }
      this.uploading = false;
    },
    async fetchSyllabuses() {
      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/api/syllabus-list/`);
        if (response.ok) {
          const data = await response.json();
          this.syllabuses = data.syllabuses || [];
        } else {
          this.syllabuses = [];
        }
      } catch (e) {
        this.syllabuses = [];
      }
      this.loading = false;
    },
    selectSyllabus(syllabus) {
      this.selectedSyllabus = syllabus;
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString('ru-RU');
    }
  },
  mounted() {
    this.fetchSyllabuses();
  }
};
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
}
.admin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #5656D6;
  margin-bottom: 2rem;
  text-align: center;
}
.card-style {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(86,86,214,0.08);
  padding: 2rem 2rem;
  margin-bottom: 2rem;
}
.admin-upload form {
  display: flex;
  gap: 1rem;
  align-items: center;
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
.main-btn:disabled {
  background: #b3b3e6;
  cursor: not-allowed;
}
.main-btn:hover:not(:disabled) {
  background: #3333a1;
}
.success-message {
  color: #48bb78;
  margin-top: 1rem;
}
.error-message {
  color: #d33;
  margin-top: 1rem;
}
.admin-list {
  overflow-x: auto;
}
.syllabus-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.syllabus-table th, .syllabus-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}
.syllabus-table th {
  background: #f8fafc;
  color: #5656D6;
  font-weight: 700;
}
.syllabus-table tr:hover {
  background: #f3f3fa;
}
.search-input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 1rem;
}
.admin-loading {
  color: #5656D6;
  text-align: center;
  margin: 1rem 0;
}
.admin-empty {
  color: #999;
  text-align: center;
  margin: 1rem 0;
}
.admin-preview {
  position: fixed;
  top: 10vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: 700px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(86,86,214,0.18);
  padding: 2rem 2rem;
}
.roadmap-json {
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1rem;
  font-size: 0.95rem;
  overflow-x: auto;
  margin-top: 1rem;
}
</style>
