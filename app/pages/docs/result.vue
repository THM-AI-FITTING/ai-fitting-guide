<template>
  <div class="doc-container">
    <div class="header-group">
      <h2 class="gradient-text">GET /result</h2>
      <p>AI 피팅 작업의 상태와 생성된 이미지를 조회합니다.</p>
    </div>

    <section class="doc-section glass">
      <h3>설명</h3>
      <p>업로드 API에서 받은 <code>requestId</code>를 사용하여 엔드포인트를 폴링합니다. 작업의 현재 상태와 완료 시 최종 결과 URL을 반환합니다.</p>
    </section>

    <section class="doc-section">
      <h3>쿼리 파라미터</h3>
      <table class="glass">
        <thead>
          <tr><th>파라미터</th><th>타입</th><th>필수 여부</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr><td>requestId</td><td>String</td><td>예</td><td>업로드 요청에서 반환된 ID.</td></tr>
        </tbody>
      </table>
    </section>

    <section class="doc-section">
      <h3>응답 예시 (완료)</h3>
      <pre class="glass"><code>{
  "requestId": "req_1",
  "userId": "user_123",
  "status": "DONE",
  "resultUrl": "...",
  "createdAt": "2026-02-01T07:15:20Z",
  "message": "처리 완료"
}</code></pre>
    </section>

    <section class="doc-section">
      <h3>응답 예시 (진행 중)</h3>
      <pre class="glass"><code>{
  "requestId": "req_2026...",
  "status": "PROCESSING",
  "message": "작업 중"
}</code></pre>
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
pre { padding: 1.5rem; overflow-x: auto; color: #a5d6ff; margin-bottom: 1rem; }
</style>
