<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const roadmap = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedWeek = ref(null)
const selectedTopic = ref(null)
const completedTopics = ref([])
const userProgress = ref(0)

const getTopicsForWeek = (weekId) => {
  if (!roadmap.value?.subtopics) return []
  return roadmap.value.subtopics.filter(topic => topic.week_id === weekId)
}

const selectWeek = (week) => {
  selectedWeek.value = week
  selectedTopic.value = null
}

const selectTopic = (topic) => {
  selectedTopic.value = topic
}

const fetchRoadmap = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`http://localhost:8000/roadmap/${route.params.subjectId}/`)

    if (!response.data?.roadmap) {
      throw new Error('Отсутствует объект roadmap');
    }

    roadmap.value = response.data.roadmap

    if (roadmap.value.weeks?.length) {
      selectWeek(roadmap.value.weeks[0])
    }
  } catch (err) {
    error.value = err.message
    console.error('Ошибка загрузки:', {
      error: err,
      response: err.response?.data
    })
  } finally {
    loading.value = false
  }
}

const fetchUserProgress = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const response = await axios.get('http://localhost:8000/api/user-syllabuses/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.data && response.data.syllabuses) {
      const syllabus = response.data.syllabuses.find(s => s.id === route.params.subjectId)
      if (syllabus && syllabus.user_progress) {
        completedTopics.value = syllabus.user_progress.completed_topics || []
        userProgress.value = syllabus.user_progress.progress || 0
      } else {
        // Fallback: ищем в user_progress пользователя
        const user = response.data.user
        if (user && user.user_progress) {
          const up = user.user_progress.find(up => up.syllabus_id === route.params.subjectId)
          completedTopics.value = up?.completed_topics || []
          userProgress.value = up?.progress || 0
        }
      }
    }
  } catch (e) {
    // silent
  }
}

function isTopicCompleted(topicId) {
  return completedTopics.value.includes(topicId)
}

onMounted(async () => {
  await fetchRoadmap()
  await fetchUserProgress()
})
</script>

<template>
  <div class="roadmap-container">
    <button class="back-btn" @click="$router.back()">← Назад</button>
    <div v-if="loading" class="loading-state">
      <p>Загрузка данных...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>Ошибка загрузки: {{ error }}</p>
      <button @click="fetchRoadmap" class="main-btn">Повторить попытку</button>
    </div>
    <template v-else-if="roadmap">
      <div class="subject-header card-style">
        <h1 class="subject-title">{{ roadmap.subject.label }}</h1>
        <p class="subject-description">{{ roadmap.subject.description }}</p>
        <div class="progress-bar-outer">
          <div class="progress-bar-inner" :style="{ width: userProgress + '%' }"></div>
        </div>
        <div class="progress-label">Прогресс: {{ userProgress }}%</div>
      </div>
      <div class="roadmap-weeks-grid card-style">
        <div
          v-for="week in roadmap.weeks"
          :key="week.id"
          class="week-card"
          :class="{ 'active': selectedWeek?.id === week.id }"
          @click="selectWeek(week)"
        >
          <div class="week-number">Неделя {{ week.week_number }}</div>
          <div class="week-main-topic">{{ week.main_topic }}</div>
          <div class="week-description">{{ week.description }}</div>
        </div>
      </div>
      <div v-if="selectedWeek" class="topics-section card-style">
        <h2 class="topics-title">Темы недели {{ selectedWeek.week_number }}</h2>
        <div class="topics-list-grid">
          <div
            v-for="topic in getTopicsForWeek(selectedWeek.id)"
            :key="topic.id"
            class="topic-tile"
            :class="{ 'active': selectedTopic?.id === topic.id }"
            @click="selectTopic(topic)"
          >
            <span class="topic-label">{{ topic.label }}</span>
            <span v-if="isTopicCompleted(topic.id)" class="completed-checkmark">✔️</span>
          </div>
        </div>
      </div>
      <div v-if="selectedTopic" class="topic-details card-style">
        <h3 class="topic-title">{{ selectedTopic.label }}
          <span v-if="isTopicCompleted(selectedTopic.id)" class="completed-checkmark">✔️</span>
        </h3>
        <p class="topic-description">{{ selectedTopic.description }}</p>
        <div v-if="selectedTopic.material">
          <a :href="selectedTopic.material" target="_blank" class="view-link">Материалы</a>
        </div>
        <div v-if="selectedTopic.assignment">
          <p><b>Задание:</b> {{ selectedTopic.assignment }}</p>
        </div>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: userProgress + '%' }"></div>
        </div>
        <br>
        
        <router-link
          v-if="!isTopicCompleted(selectedTopic.id)"
          :to="{ name: 'test', query: { topicId: selectedTopic.id, topicLabel: selectedTopic.label, subjectId: route.params.subjectId } }"
          class="main-btn test-link-btn"
        >Пройти тест</router-link>
      </div>
    </template>
  </div>
</template>

<style scoped>
.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
  min-height: 100vh;
}
.card-style {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(86,86,214,0.08);
  padding: 2rem 2rem;
  margin-bottom: 2rem;
}
.subject-header {
  text-align: center;
}
.subject-title {
  font-size: 2rem;
  font-weight: 700;
  color: #5656D6;
  margin-bottom: 0.5rem;
}
.subject-description {
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.roadmap-weeks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: #f8fafc;
  box-shadow: none;
  padding: 1.2rem 1rem;
}
.week-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px rgba(86,86,214,0.07);
  padding: 1.2rem 1rem;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.week-card.active, .week-card:hover {
  border: 2px solid #5656D6;
  background: #f3f3fa;
  box-shadow: 0 4px 16px rgba(86,86,214,0.13);
}
.week-number {
  color: #5656D6;
  font-weight: 700;
  font-size: 1.1rem;
}
.week-main-topic {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
}
.week-description {
  color: #4a5568;
  font-size: 0.98rem;
}
.topics-section {
  background: #f8fafc;
  box-shadow: none;
  padding: 1.2rem 1rem;
}
.topics-title {
  color: #5656D6;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.topics-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.topic-tile {
  background: #fff;
  border-radius: 1rem;
  border: 2px solid #e2e8f0;
  padding: 1rem 0.7rem;
  font-weight: 500;
  color: #5656D6;
  cursor: pointer;
  transition: border 0.2s, background 0.2s, color 0.2s;
  text-align: center;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.topic-tile.active, .topic-tile:hover {
  border: 2px solid #5656D6;
  background: #f3f3fa;
  color: #333;
}
.topic-label {
  font-size: 1.05rem;
  font-weight: 600;
}
.topic-details {
  background: #f8fafc;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px rgba(86,86,214,0.13);
  padding: 1.2rem 1.5rem;
  margin-top: 1.2rem;
  width: 100%;
  max-width: 350px;
  animation: fadeIn 0.4s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.view-link {
  color: #6b46c1;
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
  margin-top: 0.5rem;
  display: inline-block;
}
.view-link:hover {
  color: #805ad5;
  text-decoration: underline;
}
.loading-state, .error-state {
  text-align: center;
  color: #5656D6;
  margin: 2rem 0;
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
.progress-container {
  background: #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 8px;
  margin-top: 0.5rem;
}
.progress-bar {
  height: 100%;
  background: #5656D6;
  transition: width 0.2s;
}
.progress-bar-outer {
  width: 100%;
  height: 18px;
  background: #e2e8f0;
  border-radius: 10px;
  margin: 1rem 0 0.5rem 0;
  overflow: hidden;
}
.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #5656D6 60%, #6b46c1 100%);
  border-radius: 10px;
  transition: width 0.4s;
}
.progress-label {
  color: #5656D6;
  font-weight: 600;
  margin-bottom: 1rem;
}
.roadmap-toggle-bar {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.roadmap-toggle-bar .main-btn.active {
  background: #3333a1;
  color: #fff;
  box-shadow: 0 2px 8px rgba(86,86,214,0.13);
}
.map-scroll-area {
  width: 100vw;
  max-width: 100vw;
  min-height: 900px;
  position: relative;
  padding-bottom: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.roadmap-flow {
  min-height: 900px;
  height: 80vh;
  background: rgba(255,255,255,0.45);
  border-radius: 2.5rem;
  box-shadow: 0 8px 32px rgba(86,86,214,0.13);
  margin-bottom: 2rem;
  width: 80vw;
  max-width: 1400px;
  left: 50%;
  right: 0;
  transform: translateX(0);
  overflow-x: auto;
  overflow-y: auto;
  border: 2.5px solid #e0eaff;
  backdrop-filter: blur(16px);
  margin-left: 2vw;
  margin-right: 2vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.node-description {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px rgba(86,86,214,0.13);
  padding: 1.5rem 2rem;
  max-width: 420px;
  margin: 0 auto 2rem auto;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 18px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #5656D6;
  cursor: pointer;
}
.assignment-float {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 600px;
  background: rgba(255,255,255,0.95);
  border: 2.5px solid #5656D6;
  border-top: 8px solid #5656D6;
  box-shadow: 0 8px 32px 0 rgba(86,86,214,0.18), 0 0 0 4px #f3f3fa;
  backdrop-filter: blur(12px);
  border-radius: 1.2rem;
  padding: 1.5rem 1rem;
  margin-top: 1rem;
  z-index: 10;
}
.assignment-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}
.assignment-description {
  color: #4a5568;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.assignment-material {
  color: #6b46c1;
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: underline;
}
.assignment-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #4caf50;
  font-size: 1.5rem;
}
@media (max-width: 900px) {
  .roadmap-container {
    padding: 1rem 0.2rem;
  }
  .card-style {
    padding: 1.2rem 0.5rem;
  }
  .timeline, .topics-section, .topic-details {
    padding: 0.7rem 0.5rem;
  }
}
.duolingo-map-outer {
  width: 100%; /* Исправлено с 100vw */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 900px;
  padding: 2rem 0 4rem 0;
  background: none;
  overflow-x: hidden; /* Добавлено */
}
.duolingo-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%; /* Исправлено с 420px */
  max-width: 420px; /* Центрирование и ограничение ширины */
  position: relative;
}
.duo-week-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.duo-connector {
  width: 6px;
  height: 40px;
  background: linear-gradient(180deg, #5656D6 60%, #b3b3e6 100%);
  border-radius: 3px;
  margin-bottom: 0.2rem;
}
.duo-week-node {
  background: rgba(255,255,255,0.85);
  border: 3px solid #5656D6;
  border-radius: 50px;
  box-shadow: 0 4px 24px #5656d622;
  min-width: 320px;
  min-height: 70px;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 1.18rem;
  font-weight: 700;
  color: #5656D6;
  cursor: pointer;
  position: relative;
  transition: background 0.2s, border 0.2s, box-shadow 0.2s;
}
.duo-week-node.completed {
  background: linear-gradient(90deg, #e0ffe0 60%, #b3f7c6 100%);
  border: 3px solid #4caf50;
  color: #388e3c;
}
.duo-week-node.locked {
  background: #f2f2f2;
  border: 3px solid #cccccc;
  color: #b3b3b3;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}
.duo-week-node.locked .duo-week-title {
  color: #b3b3b3;
}
.duo-week-node .duo-start-btn {
  background: #fff;
  color: #388e3c;
  border-radius: 18px;
  font-size: 1.05rem;
  font-weight: 700;
  padding: 0.2rem 1.1rem;
  margin-left: 1rem;
  border: 2px solid #4caf50;
  box-shadow: 0 2px 8px #4caf5022;
  animation: pop-in 0.5s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes pop-in {
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.duo-week-num-circle {
  background: #5656D6;
  color: #fff;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  margin-right: 1.1rem;
  box-shadow: 0 2px 8px #5656d622;
  border: 3px solid #fff;
  transition: background 0.2s, color 0.2s;
}
.duo-week-node.completed .duo-week-num-circle {
  background: #4caf50;
  color: #fff;
}
.duo-week-node.locked .duo-week-num-circle {
  background: #e0e0e0;
  color: #b3b3b3;
  border: 3px solid #cccccc;
}
.duo-topic-details {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px #5656d622;
  padding: 1.2rem 1.5rem;
  margin-top: 1.2rem;
  width: 100%;
  max-width: 350px;
  animation: fadeIn 0.4s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.test-modal {
  background: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 2px 12px #5656d622;
  padding: 1rem 1.2rem;
  margin-top: 1rem;
}
.test-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #b3b3e6;
  margin: 0.7rem 0;
  font-size: 1rem;
}
.test-success {
  color: #388e3c;
  font-weight: 700;
  margin-top: 0.5rem;
}
.test-fail {
  color: #d32f2f;
  font-weight: 700;
  margin-top: 0.5rem;
}
.back-btn {
  background: #f3f3fa;
  color: #5656D6;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  margin-bottom: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px #5656d622;
  transition: background 0.2s;
}
.back-btn:hover {
  background: #e0eaff;
}
</style>