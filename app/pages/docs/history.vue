<template>
  <div class="doc-container">
    <div class="header-group">
      <h2 class="gradient-text">GET /history</h2>
      <p>특정 소유자 또는 사용자의 이전 AI 피팅 요청 목록을 조회합니다.</p>
    </div>

    <section class="doc-section glass">
      <h3>설명</h3>
      <p>피팅 작업의 페이지네이션된 목록을 가져옵니다. <code>userId</code> 필터링을 지원하여 특정 사용자의 이력만 표시하거나, 필터가 없는 경우 해당 파트너의 모든 작업을 표시합니다.</p>
    </section>

    <section class="doc-section">
      <h3>쿼리 파라미터</h3>
      <table class="glass">
        <thead>
          <tr><th>파라미터</th><th>타입</th><th>필수 여부</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr><td>userId</td><td>String</td><td>아니오</td><td>특정 사용자의 작업을 필터링합니다.</td></tr>
        </tbody>
      </table>
    </section>

    <section class="doc-section">
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
    </section>
  </div>
</template>

<style scoped>
.doc-container { display: flex; flex-direction: column; gap: 3rem; padding-bottom: 4rem; }
.header-group h2 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.header-group p { color: var(--text-muted); font-size: 1.1rem; }
.doc-section h3 { margin-bottom: 1.5rem; color: var(--secondary-color); font-size: 1.25rem; }
table { width: 100%; border-collapse: collapse; overflow: hidden; }
th { text-align: left; padding: 1.2rem; background: rgba(255, 255, 255, 0.03); color: var(--primary-color); font-size: 0.85rem; text-transform: uppercase; }
td { padding: 1.2rem; border-top: 1px solid var(--border-color); font-size: 0.95rem; }
pre { padding: 1.5rem; overflow-x: auto; color: #a5d6ff; }
</style>
