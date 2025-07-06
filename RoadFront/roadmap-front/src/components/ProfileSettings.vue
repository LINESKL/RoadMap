<template>
  <div class="settings-page">
    <aside class="sidebar">
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Tasks</a></li>
        <li><a href="#">Users</a></li>
        <li><a href="#">APIs</a></li>
        <li><a href="#">Subscription</a></li>
        <li><a href="#">Settings</a></li>
        <li><a href="#">Help & Support</a></li>
      </ul>
    </aside>
    <main class="settings-content">
      <header>
        <h1>Settings</h1>
        <nav>
          <ul>
            <li><a href="#">General</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Payment</a></li>
            <li><a href="#">Subscription</a></li>
            <li><a href="#" class="active">Account</a></li>
          </ul>
        </nav>
      </header>
      <section class="profile-settings">
        <h2>Your Profile</h2>
        <p>Please update your profile settings here</p>
        <form>
          <label>
            Username
            <input type="text" value="slothui.com/X-AE-A-19" />
          </label>
          <label>
            Phone Number
            <input type="text" value="+44 (158) 008-9987" />
          </label>
          <label>
            Profile Picture
            <div class="profile-picture">
              <img src="https://via.placeholder.com/100" alt="Profile" />
              <button>Edit</button>
              <button>Delete</button>
            </div>
          </label>
          <label>
            Biography
            <textarea>Hi there! 👋 I'm X-AE-A-19, an AI enthusiast and fitness aficionado...</textarea>
          </label>
          <label>
            Notifications
            <div>
              <input type="checkbox" checked /> Email Notification
              <input type="checkbox" checked /> Sound Notification
            </div>
          </label>
        </form>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'ProfileSettings'
}
</script>

<style scoped>
.settings-page {
  display: flex;
}

.sidebar {
  width: 250px;
  background-color: #6c63ff;
  color: white;
  padding: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  margin: 10px 0;
}

.sidebar ul li a {
  color: white;
  text-decoration: none;
}

.settings-content {
  flex: 1;
  padding: 20px;
}

.settings-content header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-content nav ul {
  list-style: none;
  display: flex;
  gap: 10px;
}

.settings-content nav ul li a {
  text-decoration: none;
  color: #6c63ff;
}

.settings-content nav ul li a.active {
  font-weight: bold;
}

.profile-settings form {
  display: grid;
  gap: 20px;
}

.profile-settings label {
  display: block;
}

.profile-picture {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
