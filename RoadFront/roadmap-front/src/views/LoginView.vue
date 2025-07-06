<template>
  <transition name="fade-slide">
    <div class="auth2-layout" v-show="show">
      <div class="auth2-illustration">
        <div class="auth2-quote-box">
          <div class="auth2-quote-title">
            <span>{{ printedTitle }}</span><span v-if="!titleFinished" class="cursor-blink">|</span>
          </div>
          <div class="auth2-quote-text">
            <span>{{ printedText }}</span><span v-if="!textFinished && titleFinished" class="cursor-blink">|</span>
          </div>
          <div class="auth2-quote-author">
            <span>{{ printedAuthor }}</span><span v-if="!authorFinished && textFinished" class="cursor-blink">|</span>
          </div>
        </div>
        <img class="auth2-boy-img" src="@/assets/login.png" alt="boy with book" />
      </div>
      <div class="auth2-formbox">
        <div class="login-logo">
          <img src="@/assets/logo.png" alt="RoadMap Logo" />
        </div>
        <form @submit.prevent="login">
          <h3>Вход</h3>
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <div class="input-icon">
              <input id="username" v-model="username" required placeholder="Введите имя пользователя" />
              <span class="icon-user"></span>
            </div>
          </div>
          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="input-icon">
              <input id="password" type="password" v-model="password" required placeholder="Введите пароль" />
              <span class="icon-lock"></span>
            </div>
          </div>
          <div v-if="error" class="error-message">{{ error }}</div>
          <button type="submit">Войти</button>
          <div class="auth2-bottom">
            <span>Нет аккаунта?</span> <router-link to="/register">Зарегистрируйтесь!</router-link>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
const API_URL = 'http://localhost:8000'; // адрес вашего Django backend

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: '',
      show: false,
      printedTitle: '',
      printedText: '',
      printedAuthor: '',
      titleToPrint: 'Ж И З Н Ь',
      textToPrint: 'Жизнь – это то, что с тобой происходит, пока ты строишь планы.',
      authorToPrint: 'Джон Леннон',
      titleFinished: false,
      textFinished: false,
      authorFinished: false,
      typingSpeed: 60,
      delayBetweenCycles: 5000
    };
  },
  mounted() {
    setTimeout(() => {
      this.show = true;
      this.typeTitle();
    }, 80);
  },
  methods: {
    async login() {
      this.error = '';
      try {
        const response = await fetch(`${API_URL}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });
        const data = await response.json();
        if (!response.ok) {
          this.error = data.detail || data.error || 'Ошибка входа';
        } else {
          localStorage.setItem('token', data.token);
          this.$router.push('/');
        }
      } catch (e) {
        this.error = 'Ошибка сети';
      }
    },
    typeTitle(i = 0) {
      if (i < this.titleToPrint.length) {
        this.printedTitle += this.titleToPrint[i];
        setTimeout(() => this.typeTitle(i + 1), this.typingSpeed);
      } else {
        this.titleFinished = true;
        setTimeout(() => this.typeText(), 400);
      }
    },
    typeText(i = 0) {
      if (i < this.textToPrint.length) {
        this.printedText += this.textToPrint[i];
        setTimeout(() => this.typeText(i + 1), this.typingSpeed);
      } else {
        this.textFinished = true;
        setTimeout(() => this.typeAuthor(), 400);
      }
    },
    typeAuthor(i = 0) {
      if (i < this.authorToPrint.length) {
        this.printedAuthor += this.authorToPrint[i];
        setTimeout(() => this.typeAuthor(i + 1), this.typingSpeed);
      } else {
        this.authorFinished = true;
        setTimeout(() => {
          this.printedTitle = '';
          this.printedText = '';
          this.printedAuthor = '';
          this.titleFinished = false;
          this.textFinished = false;
          this.authorFinished = false;
          this.typeTitle();
        }, this.delayBetweenCycles);
      }
    }
  }
};
</script>

<style scoped>
.cursor-blink {
  display: inline-block;
  width: 1ch;
  animation: blink 1s steps(1) infinite;
  color: #fff;
  font-weight: 400;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.auth2-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #23234f 0%, #3737a8 100%);
  align-items: center;
  justify-content: center;
}
.auth2-illustration {
  flex: 1.2;
  background: #23234f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 340px;
  position: relative;
}
.auth2-illust-box {
  background: rgba(40, 40, 80, 0.55);
  border-radius: 1.5rem;
  padding: 2.5rem 2rem 2rem 2rem;
  text-align: center;
  color: #fff;
  z-index: 2;
}
.auth2-boy-img {
  position: absolute;
  right: 10%;
  top: 60%;
  transform: translate(60%, -42%);
  width: 500px;
  max-width: 90vw;
  z-index: 10; /* Поверх формы */
  pointer-events: none;
}
.fade-z {
  z-index: 10 !important;
}
.auth2-formbox {
  flex: 1;
  background: #fff;
  border-radius: 2rem 0 0 2rem;
  box-shadow: 0 8px 32px 0 rgba(86,86,214,0.13);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2.5rem 2rem 2.5rem;
  min-width: 340px;
  position: relative;
  z-index: 5;
}
.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.login-logo img {
  height: 100px;
}
form {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h3 {
  font-size: 1.7rem;
  font-weight: 700;
  color: #5656D6;
  margin-bottom: 1.5rem;
  text-align: center;
  width: 100%;
}
.form-group {
  margin-bottom: 1.3rem;
  width: 100%;
}
label {
  display: block;
  margin-bottom: 0.4rem;
  color: #5656D6;
  font-weight: 600;
  text-align: left;
}
.input-icon {
  position: relative;
  width: 100%;
}
.input-icon input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 1.1rem;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  font-size: 1.08rem;
  background: #f7f7fd;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(86,86,214,0.06);
}
.input-icon input:focus {
  border: 1.5px solid #5656D6;
  outline: none;
  background: #ececff;
  box-shadow: 0 0 0 2px #d3d3f7;
}
.input-icon .icon-user {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.2rem;
  height: 1.2rem;
  background: url('data:image/svg+xml;utf8,<svg fill="%235656D6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/></svg>') no-repeat center/contain;
  opacity: 0.7;
}
.input-icon .icon-lock {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.2rem;
  height: 1.2rem;
  background: url('data:image/svg+xml;utf8,<svg fill="%235656D6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 8V6a5 5 0 0 0-10 0v2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-6-2a3 3 0 0 1 6 0v2h-6V6zm8 10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8z"/></svg>') no-repeat center/contain;
  opacity: 0.7;
}
button {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(90deg, #5656D6 60%, #7b7be6 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px 0 rgba(86,86,214,0.10);
  transition: background 0.2s, box-shadow 0.2s;
}
button:hover {
  background: linear-gradient(90deg, #3333a1 60%, #5656D6 100%);
  box-shadow: 0 4px 16px 0 rgba(86,86,214,0.18);
}
.error-message {
  color: #d33;
  margin-bottom: 1rem;
  text-align: center;
}
.auth2-bottom {
  margin-top: 1.5rem;
  text-align: center;
  color: #5656D6;
  font-size: 1rem;
}
.auth2-bottom a {
  color: #5656D6;
  font-weight: 600;
  text-decoration: underline;
}
.auth2-quote-box {
  position: absolute;
  left: 7%;
  
  z-index: 4;
  color: #fff;
  max-width: 400px;
  padding: 2.5rem 1.5rem 2.5rem 0.5rem;
  background: none;
  text-align: left;
}
.auth2-quote-title {
  font-size: 3.2rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  margin-bottom: 1.2rem;
  color: #fff;
}
.auth2-quote-text {
  font-size: 1.75rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: #e0e0ff;
  line-height: 1.5;
}
.auth2-quote-author {
  font-size: 1.1rem;
  font-weight: 300;
  color: #b3b3e6;
  margin-top: 0.5rem;
}
@media (max-width: 900px) {
  .auth2-layout {
    flex-direction: column;
    min-height: 100vh;
  }
  .auth2-illustration, .auth2-formbox {
    border-radius: 0;
    min-width: 0;
    width: 100%;
    padding: 2rem 1rem;
  }
  .auth2-lottie {
    width: 140px;
    height: 140px;
  }
  .auth2-boy-img {
    width: 160px;
    top: 65%;
  }
  .auth2-quote-box {
    position: static;
    max-width: 100vw;
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
    text-align: center;
  }
  .auth2-quote-title {
    font-size: 2.1rem;
    letter-spacing: 0.12em;
  }
  .auth2-quote-text {
    font-size: 1rem;
  }
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.7s cubic-bezier(.77,0,.18,1), transform 0.7s cubic-bezier(.77,0,.18,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
