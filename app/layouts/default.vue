<template>
  <div class="layout-wrapper">
    <nav class="navbar glass">
      <div class="nav-container">
        <NuxtLink to="/" class="logo">
          <span class="gradient-text">AI Fitting</span> 포털
        </NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/test" class="nav-item">체험 센터</NuxtLink>
          <div class="dropdown">
            <span class="nav-item">API 가이드</span>
            <div class="dropdown-content glass">
              <NuxtLink to="/docs/upload">업로드 API</NuxtLink>
              <NuxtLink to="/docs/result">결과 조회 API</NuxtLink>
              <NuxtLink to="/docs/history">이력 조회 API</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="content">
      <slot />
    </main>

    <footer class="footer">
      <p>&copy; 2026 AI Fitting Service. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  z-index: 1000;
  padding: 1rem 2rem;
  border-radius: 20px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 900;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-item {
  font-weight: 500;
  color: var(--text-muted);
  transition: var(--transition);
  cursor: pointer;
}

.nav-item:hover, .router-link-active {
  color: var(--text-main);
}

.content {
  flex: 1;
  padding-top: 8rem;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  margin-top: 1rem;
  padding: 0.5rem;
  overflow: hidden;
}

.dropdown:hover .dropdown-content {
  display: flex;
  flex-direction: column;
}

.dropdown-content a {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: var(--transition);
}

.dropdown-content a:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
