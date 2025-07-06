<template>
  <div class="subjects-container">
    <div class="header">
      <h1 class="title">Мои предметы</h1>
      <div class="divider"></div>
    </div>

    <div class="subjects-grid">
      <div
          v-for="subject in subjects"
          :key="subject.id"
          class="subject-card"
          @click="goToRoadmap(subject.id)"
      >
        <div class="card-content">
          <h2 class="subject-title">{{ subject.title }}</h2>
          <p class="subject-description">{{ subject.description }}</p>

          <div class="progress-container">
            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: subject.progress + '%' }"
              ></div>
            </div>
            <span class="progress-value">{{ subject.progress }}%</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="view-link">Перейти к курсу →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// HomeView теперь отображает курсы пользователя (как MySyllabuses)
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const subjects = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    loading.value = true;
    const response = await axios.get('http://localhost:8000/api/user-syllabuses/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data && response.data.syllabuses) {
      // user_progress теперь хранится только в users, ищем прогресс по id
      const user = response.data.user || {};
      const userProgressArr = user.user_progress || [];
      subjects.value = response.data.syllabuses.map(s => {
        const up = userProgressArr.find(up => up.syllabus_id === s.id);
        return {
          id: s.id,
          title: s.roadmap.subject.label,
          description: s.roadmap.subject.description,
          progress: up ? up.progress || 0 : 0
        };
      });
    }
  } catch (error) {
    console.error('Error loading syllabuses:', error)
  } finally {
    loading.value = false;
  }
})

function goToRoadmap(subjectId) {
  router.push(`/roadmap/${subjectId}`)
}
</script>

<style scoped>
.subjects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2.5rem;
}

.title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
  background: #5656D6;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.divider {
  height: 4px;
  width: 80px;
  background: #5656D6;
  border-radius: 2px;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.subject-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.subject-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-content {
  padding: 1.5rem;
  flex-grow: 1;
}

.subject-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subject-description {
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-container {
  margin-top: auto;
}

.progress-bar {
  height: 8px;
  background-color: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #48bb78;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.view-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b46c1;
  transition: color 0.2s;
}

.subject-card:hover .view-link {
  color: #805ad5;
}

</style>