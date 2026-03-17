<template>
  <div class="layout-wrapper">
    <nav class="navbar glass">
      <div class="nav-container">
        <NuxtLink to="/" class="logo">
          <span class="gradient-text">AI Fitting</span> 포털
        </NuxtLink>
        <div class="nav-links">
          <div class="dropdown" :class="{ 'is-open': isDropdownOpen, 'no-hover': isHome }">
            <a href="#" class="nav-item" @click.prevent.stop="handleExperienceClick">체험하기</a>
            <div class="dropdown-content glass shadow-premium">
              <NuxtLink to="/test/tryon" class="dropdown-item">나한테 피팅해보기</NuxtLink>
              <NuxtLink to="/test/studio" class="dropdown-item">스튜디오용 피팅</NuxtLink>
            </div>
          </div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from '#app';

const theme = useState('theme', () => 'light');
const route = useRoute();
const router = useRouter();
const isDropdownOpen = ref(false);

const isHome = computed(() => {
  const p = route.path;
  // baseURL이 반영된 경로와 그렇지 않은 경로 모두 체크하여 홈 페이지 판별 안정성 확보
  return p === '/' || p === '' || p === '/ai-fitting-guide' || p === '/ai-fitting-guide/';
});

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  if (import.meta.client) {
    localStorage.setItem('theme', theme.value);
  }
};

const handleExperienceClick = (e) => {
  // 모바일 환경에서 기본 네비게이션이 가로채는 것을 방지하기 위해 명시적으로 전파 중단 및 기본 동작 방지
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  if (isHome.value) {
    // 홈에서는 /test 페이지로 이동 (드롭다운 열지 않음)
    isDropdownOpen.value = false;
    router.push('/test');
  } else {
    // 체험 페이지(/test/*)에서는 드롭다운만 토글 (페이지 이동 없음)
    isDropdownOpen.value = !isDropdownOpen.value;
  }
};

// Reset dropdown on route change or click outside
watch(() => route.path, () => {
  isDropdownOpen.value = false;
});

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    theme.value = saved;
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      isDropdownOpen.value = false;
    }
  });
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
  max-width: 1400px;
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
  max-width: 1400px;
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
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  margin-top: 0.5rem;
  padding: 0.5rem;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  z-index: 1001;
}

/* Bridge the gap between trigger and menu to maintain hover state */
.dropdown-content::before {
  content: "";
  position: absolute;
  top: -0.5rem;
  left: 0;
  width: 100%;
  height: 0.5rem;
}

/* Only enable hover behavior on devices that support hover (PCs) */
@media (hover: hover) {
  .dropdown:not(.no-hover):hover .dropdown-content {
    display: flex;
  }
}

/* On mobile or when explicitly toggled via click */
.dropdown.is-open .dropdown-content {
  display: flex !important;
}

.dropdown-item {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: var(--transition);
  text-decoration: none;
  white-space: nowrap;
}

.dropdown-item:hover, .dropdown-item.router-link-active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
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

  .dropdown-content {
    position: absolute;
    top: calc(100% + 1rem); /* Move it a bit down on mobile */
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-color);
  }
}
</style>
