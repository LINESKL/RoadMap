<template>
  <div class="syllabus-search-page">
    <h1 class="syllabus-title">Поиск и добавление силлабусов</h1>
    <input v-model="search" placeholder="Поиск по названию..." class="search-input" />
    <div v-if="loading" class="syllabus-loading">Загрузка...</div>
    <div v-else>
      <table class="syllabus-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="syllabus in filteredSyllabuses" :key="syllabus.id">
            <td>{{ syllabus.roadmap.subject.label }}</td>
            <td>{{ syllabus.roadmap.subject.description }}</td>
            <td>
              <button class="main-btn" @click="addSyllabus(syllabus.id)" :disabled="isAdded(syllabus.id)">
                {{ isAdded(syllabus.id) ? 'Добавлено' : 'Добавить' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredSyllabuses.length === 0" class="syllabus-empty">Нет силлабусов</div>
    </div>
  </div>
</template>

<script>
const API_URL = 'http://localhost:8000';
export default {
  name: 'SyllabusSearch',
  data() {
    return {
      syllabuses: [],
      userSyllabuses: [],
      loading: true,
      search: ''
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
    async fetchAllSyllabuses() {
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
    async fetchUserSyllabuses() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/user-syllabuses/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          this.userSyllabuses = data.syllabuses.map(s => s.id) || [];
        } else {
          this.userSyllabuses = [];
        }
      } catch (e) {
        this.userSyllabuses = [];
      }
    },
    isAdded(id) {
      return this.userSyllabuses.includes(id);
    },
    async addSyllabus(id) {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/user-syllabuses/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ syllabus_id: id })
        });
        if (response.ok) {
          this.userSyllabuses.push(id);
        }
      } catch (e) {
        // Ошибка добавления силлабуса, можно вывести уведомление
      }
    }
  },
  async mounted() {
    await this.fetchAllSyllabuses();
    await this.fetchUserSyllabuses();
  }
};
</script>

<style scoped>
.syllabus-search-page {
  max-width: 900px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(86,86,214,0.08);
  padding: 2rem 2rem;
}
.syllabus-title {
  font-size: 2rem;
  font-weight: 700;
  color: #5656D6;
  margin-bottom: 2rem;
  text-align: center;
}
.search-input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 1rem;
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
.main-btn {
  padding: 0.5rem 1.5rem;
  background: #5656D6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.main-btn:disabled {
  background: #b3b3e6;
  cursor: not-allowed;
}
.main-btn:hover:not(:disabled) {
  background: #3333a1;
}
.syllabus-loading {
  color: #5656D6;
  text-align: center;
  margin: 1rem 0;
}
.syllabus-empty {
  color: #999;
  text-align: center;
  margin: 1rem 0;
}
</style>
