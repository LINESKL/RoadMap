<template>
  <div class="my-syllabuses-page">
    <h1 class="syllabus-title">Мои курсы</h1>
    <div v-if="loading" class="syllabus-loading">Загрузка...</div>
    <div v-else>
      <table class="syllabus-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Прогресс</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="syllabus in syllabuses" :key="syllabus.id">
            <td>{{ syllabus.roadmap.subject.label }}</td>
            <td>{{ syllabus.roadmap.subject.description }}</td>
            <td>{{ getProgress(syllabus.id) }}%</td>
            <td>
              <button class="main-btn" @click="goToRoadmap(syllabus.id)">Открыть</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="syllabuses.length === 0" class="syllabus-empty">Нет добавленных курсов</div>
    </div>
  </div>
</template>

<script>
const API_URL = 'http://localhost:8000';
export default {
  name: 'MySyllabuses',
  data() {
    return {
      syllabuses: [],
      userProgress: {},
      loading: true
    };
  },
  methods: {
    async fetchUserSyllabuses() {
      const token = localStorage.getItem('token');
      if (!token) return;
      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/api/user-syllabuses/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          this.syllabuses = data.syllabuses || [];
          // Собираем прогресс по каждому курсу
          if (data.syllabuses && data.syllabuses.length > 0) {
            // user_progress хранится только в users, поэтому для реального прогресса нужен отдельный API или хранить в syllabuses
            // Здесь просто 0% для примера
            this.userProgress = Object.fromEntries(data.syllabuses.map(s => [s.id, 0]));
          }
        } else {
          this.syllabuses = [];
        }
      } catch (e) {
        this.syllabuses = [];
      }
      this.loading = false;
    },
    getProgress(id) {
      return this.userProgress[id] || 0;
    },
    goToRoadmap(id) {
      this.$router.push(`/roadmap/${id}`);
    }
  },
  mounted() {
    this.fetchUserSyllabuses();
  }
};
</script>

<style scoped>
.my-syllabuses-page {
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
