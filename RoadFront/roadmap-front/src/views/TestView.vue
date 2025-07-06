<template>
  <div class="test-page">
    <button class="back-btn" @click="$router.back()">← Назад</button>
    <h1>Тест по теме: {{ topicLabel }}</h1>
    <div v-if="loading" class="loading">Генерируется тест...</div>
    <div v-else-if="error" class="error">Ошибка: {{ error }}</div>
    <div v-else-if="questions.length && !testPassed">
      <div class="test-question">{{ questions[currentStep] }}</div>
      <input v-model="answers[currentStep]" placeholder="Ваш ответ..." class="test-input" />
      <button class="main-btn" @click="submitTest">Ответить</button>
      <div v-if="result === false" class="test-fail">Неверно, попробуйте ещё.</div>
    </div>
    <div v-else-if="testPassed" class="test-success">
      Тест успешно пройден! Тема засчитана.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const topicId = route.query.topicId
const topicLabel = route.query.topicLabel
const loading = ref(true)
const error = ref(null)
const questions = ref([])
const answers = ref([])
const currentStep = ref(0)
const testPassed = ref(false)
const result = ref(null)

async function fetchTest() {
  loading.value = true
  error.value = null
  try {
    // Запрос к backend для генерации нескольких вопросов через GPT
    const res = await axios.post('http://localhost:8000/api/gpt-generate-test/', {
      topic_id: topicId,
      topic_label: topicLabel,
      count: 3 // Запросить 3 вопроса
    })
    questions.value = res.data.questions
    answers.value = Array(questions.value.length).fill('')
    currentStep.value = 0
    testPassed.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function markTopicDone() {
  const token = localStorage.getItem('token')
  if (!token) return
  const subjectId = route.query.subjectId || route.params.subjectId
  console.log('subjectId for PATCH:', subjectId)
  if (!subjectId) {
    console.warn('subjectId не найден!')
    return
  }
  // Получаем уже выполненные темы из localStorage или из query (если передаётся)
  let completedTopics = []
  try {
    const progressRaw = localStorage.getItem('completedTopics_' + subjectId)
    if (progressRaw) {
      completedTopics = JSON.parse(progressRaw)
    }
  } catch (e) {
    // Ошибка чтения localStorage игнорируется
  }
  // Добавляем текущую тему, если её ещё нет
  if (!completedTopics.includes(topicId)) {
    completedTopics.push(topicId)
  }
  localStorage.setItem('completedTopics_' + subjectId, JSON.stringify(completedTopics))
  try {
    await axios.patch('http://localhost:8000/api/user-syllabuses/', {
      syllabus_id: subjectId,
      completed_topics: completedTopics,
      total_topics: null // пусть сервер сам считает общее число тем
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  } catch (e) {
    console.error('Ошибка при отметке темы как выполненной:', e)
  }
}

async function submitTest() {
  const answer = answers.value[currentStep.value]
  const questionText = questions.value[currentStep.value]
  try {
    const res = await axios.post('http://localhost:8000/api/gpt-check-test/', {
      topic_id: topicId,
      answer: answer,
      question: questionText
    })
    if (res.data.correct) {
      if (currentStep.value < questions.value.length - 1) {
        currentStep.value++
      } else {
        testPassed.value = true
        await markTopicDone() // Автоматически отмечаем тему как выполненной
      }
    } else {
      result.value = false
    }
  } catch {
    result.value = false
  }
}

onMounted(fetchTest)
</script>

<style scoped>
.test-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px #5656d622;
}
.test-question {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.test-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #b3b3e6;
  margin: 0.7rem 0;
  font-size: 1rem;
  display: block;
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
.loading {
  color: #5656D6;
}
.error {
  color: #d32f2f;
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
