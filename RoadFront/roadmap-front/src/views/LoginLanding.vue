<template>
  <div class="login-landing">
    <div class="login-left">
      <div class="club-info">
        <div class="club-title">RIVERSIDE HIGH SCHOOL<br>COMPUTER CLUB</div>
        <div class="graphic-design">GRAPHIC<br>DESIGN</div>
        <div class="for-beginners">FOR BEGINNERS</div>
        <div class="event-details">
          <div>AUGUST 29, 2018</div>
          <div>4:30-6:00 PM</div>
          <div>ROOM 204</div>
        </div>
      </div>
      <img class="login-illustration" src="@/assets/boy-graphic.png" alt="boy with book" />
    </div>
    <div class="login-right">
      <div class="login-box">
        <img src="@/assets/logo.png" class="login-logo" alt="RoadMap logo" />
        <h1 class="login-title">Вход</h1>
        <form @submit.prevent="login">
          <label class="login-label">Имя пользователя</label>
          <div class="login-input-wrapper">
            <input v-model="username" type="text" placeholder="Введите имя пользователя" required />
            <span class="login-icon"><i class="fa fa-user"></i></span>
          </div>
          <label class="login-label">Пароль</label>
          <div class="login-input-wrapper">
            <input v-model="password" type="password" placeholder="Введите пароль" required />
            <span class="login-icon"><i class="fa fa-lock"></i></span>
          </div>
          <button class="login-btn" :disabled="loading">Войти</button>
        </form>
        <div class="login-register">
          Нет аккаунта? <router-link to="/register">Зарегистрируйтесь!</router-link>
        </div>
        <div v-if="error" class="login-error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const login = async () => {
  error.value = ''
  loading.value = true
  try {
    const response = await axios.post('http://localhost:8000/auth/login/', {
      username: username.value,
      password: password.value
    })
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
      router.push('/')
    } else {
      error.value = 'Неверный логин или пароль'
    }
  } catch (e) {
    error.value = 'Ошибка входа: ' + (e.response?.data?.error || 'Проверьте данные')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-landing {
  display: flex;
  min-height: 100vh;
  background: #23234f;
}
.login-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 2rem 3rem 5vw;
  background: #23234f;
  color: #fff;
  position: relative;
}
.club-info {
  margin-bottom: 2.5rem;
}
.club-title {
  font-size: 1.1rem;
  letter-spacing: 0.08em;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}
.graphic-design {
  font-size: 3.2rem;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0.01em;
}
.for-beginners {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 1.2rem 0 2.5rem 0;
  opacity: 0.8;
}
.event-details {
  font-size: 1.1rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}
.login-illustration {
  width: 340px;
  max-width: 90vw;
  margin-top: 2.5rem;
  margin-left: 1rem;
}
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.login-box {
  width: 100%;
  max-width: 410px;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px rgba(86,86,214,0.10);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-logo {
  width: 70px;
  margin-bottom: 1.2rem;
}
.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #5656D6;
  margin-bottom: 1.5rem;
}
.login-label {
  font-size: 1.1rem;
  color: #23234f;
  margin-bottom: 0.3rem;
  margin-top: 1.1rem;
  font-weight: 600;
  display: block;
}
.login-input-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 0.7rem;
}
.login-input-wrapper input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.1rem;
  outline: none;
  background: #f7f9fb;
  color: #23234f;
  transition: border 0.2s;
}
.login-input-wrapper input:focus {
  border: 1.5px solid #5656D6;
}
.login-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5656D6;
  font-size: 1.2rem;
  opacity: 0.7;
}
.login-btn {
  width: 100%;
  margin-top: 1.2rem;
  padding: 0.8rem 0;
  background: linear-gradient(90deg, #5656D6 60%, #6b46c1 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(86,86,214,0.08);
}
.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.login-register {
  margin-top: 1.5rem;
  font-size: 1.05rem;
  color: #5656D6;
}
.login-register a {
  color: #5656D6;
  font-weight: 600;
  text-decoration: underline;
}
.login-error {
  color: #e53e3e;
  margin-top: 1rem;
  font-size: 1.05rem;
  text-align: center;
}
@media (max-width: 900px) {
  .login-landing {
    flex-direction: column;
  }
  .login-left, .login-right {
    flex: unset;
    width: 100%;
    padding: 2rem 1rem;
    min-height: unset;
  }
  .login-illustration {
    width: 220px;
    margin: 1.5rem auto 0 auto;
    display: block;
  }
  .login-box {
    padding: 1.5rem 0.7rem 1.2rem 0.7rem;
  }
}
</style>
