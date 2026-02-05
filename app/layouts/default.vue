<template>
  <div class="layout-wrapper">
    <nav class="navbar glass">
      <div class="nav-container">
        <NuxtLink to="/" class="logo">
          <span class="gradient-text">AI Fitting</span> 포털
        </NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/test" class="nav-item">체험하기</NuxtLink>
          <NuxtLink to="/docs" class="nav-item">API 가이드</NuxtLink>
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'">
            {{ theme === 'dark' ? '☀️' : '🌙' }}
          </button>
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

<script setup>
const theme = useState('theme', () => 'light');

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  // Persist to localStorage
  if (import.meta.client) {
    localStorage.setItem('theme', theme.value);
  }
};

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    theme.value = saved;
  }
  // Remove system preference check to strictly follow "Default is Light" unless saved preference exists.
  // Or, we can support system perference but default to Light if no preference.
  // Since user said "Make default light", I will prioritize that.
  
  // Optional: If you still want to respect system Dark mode if user specifically has it:
  // else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  //   theme.value = 'dark';
  // }
});

useHead({
  htmlAttrs: {
    'data-theme': theme
  }
});
</script>

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
  align-items: center; /* Ensure vertical alignment */
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

.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(15deg);
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

@media (max-width: 768px) {
  .navbar {
    top: 0;
    width: 100%;
    border-radius: 0;
    padding: 1rem;
    backdrop-filter: blur(10px);
    background: var(--surface-color);
  }

  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .content {
    padding-top: 8.5rem; /* Adjusted for taller mobile navbar */
    width: 90%;
  }

  .nav-links {
    gap: 1.5rem;
    /* justify-content: center; */ /* Optional: center links if needed */
  }

  .theme-toggle {
    position: absolute;
    top: 1.2rem;
    right: 1.5rem;
  }
}
</style>
