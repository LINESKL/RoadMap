<template>
  <nav class="navbar glassy-navbar">
    <div class="navbar-logo">
      <img src="@/assets/logo1.png" alt="Logo">
    </div>
    <ul class="navbar-menu">
      <li><a href="/">Главная</a></li>
      <li><a href="#">Материалы</a></li>
    </ul>
    <div class="navbar-search">
      <!-- Оставляем только иконку поиска, убираем input -->
      <svg @click="goToSearch" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    <div class="navbar-profile" @click="goToProfile">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5656D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    goToProfile() {
      this.$router.push('/profile');
    },
    goToSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({ name: 'syllabus-search', query: { q: this.searchQuery.trim() } });
      } else {
        this.$router.push({ name: 'syllabus-search' });
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 4px 24px 0 rgba(86,86,214,0.10);
  border-radius: 0 0 2rem 2rem;
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s, box-shadow 0.3s;
}
.glassy-navbar {
  background: rgba(86,86,214,0.10);
  box-shadow: 0 8px 32px 0 rgba(86,86,214,0.13);
  backdrop-filter: blur(16px);
}
.navbar-logo img {
  height: 70px;
  margin-right: 18px;
  filter: drop-shadow(0 2px 8px #5656d633);
  transition: transform 0.2s;
}
.navbar-logo img:hover {
  transform: scale(1.07) rotate(-3deg);
}
.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 10px;
  gap: 8px;
}
.navbar-menu li {
  margin-left: 0;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  padding: 10px 22px;
  border-radius: 18px;
  background: linear-gradient(90deg, #5656D6 60%, #7b7be6 100%);
  box-shadow: 0 2px 8px 0 rgba(86,86,214,0.08);
  font-weight: 600;
  font-size: 1.08rem;
  letter-spacing: 0.03em;
}
.navbar-menu a {
  color: #fff;
  text-decoration: none;
  transition: color 0.2s;
}
.navbar-menu li:hover {
  background: #fff;
  color: #5656D6;
  box-shadow: 0 4px 16px 0 rgba(86,86,214,0.18);
}
.navbar-menu li:hover a {
  color: #5656D6;
}
.navbar-search {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.navbar-search svg {
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  background: linear-gradient(135deg, #5656D6 60%, #7b7be6 100%);
  color: #fff;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(86,86,214,0.08);
  transition: box-shadow 0.2s, background 0.2s, transform 0.2s;
}
.navbar-search svg:hover {
  background: #4343b8;
  box-shadow: 0 4px 16px rgba(86,86,214,0.18);
  transform: scale(1.12) rotate(-8deg);
}
.navbar-profile {
  margin-left: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.navbar-profile svg {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f3f3fa;
  box-shadow: 0 2px 8px rgba(86,86,214,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}
.navbar-profile:hover svg {
  box-shadow: 0 4px 16px rgba(86,86,214,0.18);
  transform: scale(1.09) rotate(5deg);
}
@media (max-width: 900px) {
  .navbar {
    flex-direction: column;
    padding: 10px 8px;
    border-radius: 0 0 1.2rem 1.2rem;
  }
  .navbar-logo img {
    height: 48px;
    margin-bottom: 8px;
  }
  .navbar-menu {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
  }
  .navbar-menu li {
    padding: 8px 12px;
    font-size: 1rem;
    border-radius: 12px;
  }
  .navbar-search svg, .navbar-profile svg {
    width: 32px;
    height: 32px;
    padding: 5px;
  }
}
</style>