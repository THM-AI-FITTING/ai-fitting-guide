<template>
  <div class="docs-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-sticky">
        <h3 class="sidebar-title">API Reference</h3>
        <nav class="sidebar-nav">
          <a href="#upload" :class="{ active: activeSection === 'upload' }" @click.prevent="scrollTo('upload')">
            <span class="method post">POST</span> /upload
          </a>
          <a href="#result" :class="{ active: activeSection === 'result' }" @click.prevent="scrollTo('result')">
            <span class="method get">GET</span> /result
          </a>
          <a href="#history" :class="{ active: activeSection === 'history' }" @click.prevent="scrollTo('history')">
            <span class="method get">GET</span> /history
          </a>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="docs-content">
      <!-- Upload Section -->
      <section id="upload" class="doc-section">
        <div class="header-group">
          <h2 class="gradient-text">POST /upload</h2>
          <p>이미지를 업로드하여 새로운 AI 피팅 작업을 시작합니다.</p>
        </div>

        <div class="doc-block glass">
          <h3>설명</h3>
          <p>인물 이미지와 의류 이미지를 수신하여 고유한 <code>requestId</code>를 생성하고 비동기 피팅 프로세스를 시작합니다. 이미지는 자동으로 전처리되어 S3에 안전하게 저장됩니다.</p>
        </div>

        <div class="doc-block">
          <h3>요청 헤더</h3>
          <table class="glass">
            <thead>
              <tr><th>키</th><th>필수 여부</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td>x-api-key</td><td>예</td><td>인증을 위한 파트너 API 키입니다.</td></tr>
              <tr><td>Content-Type</td><td>예</td><td><code>multipart/form-data</code>여야 합니다.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>Form Data 파라미터</h3>
          <table class="glass">
            <thead>
              <tr><th>파라미터</th><th>타입</th><th>필수 여부</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td>person</td><td>File</td><td>예</td><td>인물 사진 (상반신 또는 전신).</td></tr>
              <tr><td>product</td><td>File</td><td>예</td><td>의류/상품 이미지.</td></tr>
              <tr><td>userId</td><td>String</td><td>아니오</td><td>이력 추적을 위한 최종 사용자 식별자.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>응답 예시</h3>
          <pre class="glass"><code>{
  "requestId": "req_20260201_abcdefg",
  "status": "PROCESSING",
  "message": "접수 완료"
}</code></pre>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Result Section -->
      <section id="result" class="doc-section">
        <div class="header-group">
          <h2 class="gradient-text">GET /result</h2>
          <p>AI 피팅 작업의 상태와 생성된 이미지를 조회합니다.</p>
        </div>

        <div class="doc-block glass">
          <h3>설명</h3>
          <p>업로드 API에서 받은 <code>requestId</code>를 사용하여 엔드포인트를 폴링합니다. 작업의 현재 상태와 완료 시 최종 결과 URL을 반환합니다.</p>
        </div>

        <div class="doc-block">
          <h3>쿼리 파라미터</h3>
          <table class="glass">
            <thead>
              <tr><th>파라미터</th><th>타입</th><th>필수 여부</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td>requestId</td><td>String</td><td>예</td><td>업로드 요청에서 반환된 ID.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>응답 예시 (완료)</h3>
          <pre class="glass"><code>{
  "requestId": "req_1",
  "userId": "user_123",
  "status": "DONE",
  "resultUrl": "...",
  "createdAt": "2026-02-01T07:15:20Z",
  "message": "처리 완료"
}</code></pre>
        </div>

        <div class="doc-block">
          <h3>응답 예시 (진행 중)</h3>
          <pre class="glass"><code>{
  "requestId": "req_2026...",
  "status": "PROCESSING",
  "message": "작업 중"
}</code></pre>
        </div>
      </section>

      <div class="divider"></div>

      <!-- History Section -->
      <section id="history" class="doc-section">
        <div class="header-group">
          <h2 class="gradient-text">GET /history</h2>
          <p>특정 소유자 또는 사용자의 이전 AI 피팅 요청 목록을 조회합니다.</p>
        </div>

        <div class="doc-block glass">
          <h3>설명</h3>
          <p>피팅 작업의 페이지네이션된 목록을 가져옵니다. <code>userId</code> 필터링을 지원하여 특정 사용자의 이력만 표시하거나, 필터가 없는 경우 해당 파트너의 모든 작업을 표시합니다.</p>
        </div>

        <div class="doc-block">
          <h3>쿼리 파라미터</h3>
          <table class="glass">
            <thead>
              <tr><th>파라미터</th><th>타입</th><th>필수 여부</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td>userId</td><td>String</td><td>아니오</td><td>특정 사용자의 작업을 필터링합니다.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>응답 예시</h3>
          <pre class="glass"><code>[
  {
    "requestId": "req_1",
    "userId": "user_123",
    "status": "DONE",
    "resultUrl": "...",
    "createdAt": "2026-02-01T07:15:20Z"
  },
  {
    "requestId": "req_2",
    "userId": "user_123",
    "status": "PROCESSING",
    "createdAt": "2026-02-01T07:20:00Z"
  }
]</code></pre>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeSection = ref('upload')
const sections = ['upload', 'result', 'history']

const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const yOffset = -120 // Adjust for fixed navbar
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    activeSection.value = id
    // Update URL without jump
    history.replaceState(null, null, `#${id}`)
  }
}

const handleScroll = () => {
  const scrollPosition = window.scrollY + 150
  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const top = element.offsetTop
      const height = element.offsetHeight
      if (scrollPosition >= top && scrollPosition < top + height) {
        activeSection.value = section
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Check hash on load
  const hash = window.location.hash.replace('#', '')
  if (sections.includes(hash)) {
    setTimeout(() => scrollTo(hash), 100)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.docs-layout {
  display: flex;
  gap: 4rem;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

/* Sidebar Styling */
.sidebar {
  width: 260px;
  flex-shrink: 0;
}

.sidebar-sticky {
  position: sticky;
  top: 8rem;
}

.sidebar-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  padding-left: 1rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-nav a {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--text-muted);
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid transparent;
}

.sidebar-nav a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.sidebar-nav a.active {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.method {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.method.post { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.method.get { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

/* Content Styling */
.docs-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rem;
}

.doc-section {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.header-group h2 {
  font-size: 3rem;
  margin-bottom: 0.8rem;
}

.header-group p {
  color: var(--text-muted);
  font-size: 1.2rem;
}

.doc-block h3 {
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
  font-size: 1.25rem;
}

.doc-block p {
  color: var(--text-muted);
  line-height: 1.8;
}

.doc-block.glass {
  padding: 2rem;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, var(--border-color), transparent);
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
}

th {
  text-align: left;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  color: var(--primary-color);
  font-size: 0.85rem;
  text-transform: uppercase;
}

td {
  padding: 1.2rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.95rem;
}

pre {
  padding: 1.5rem;
  overflow-x: auto;
  color: #a5d6ff;
  font-family: 'Fira Code', monospace;
  line-height: 1.5;
  font-size: 0.9rem;
}

code {
  color: var(--primary-color);
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .docs-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: sticky;
    top: 6rem;
    z-index: 10;
    background: var(--bg-color);
    padding: 1rem 0;
  }
  .sidebar-sticky {
    top: 0;
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .sidebar-nav a {
    white-space: nowrap;
  }
  .sidebar-title {
    display: none;
  }
}
</style>
