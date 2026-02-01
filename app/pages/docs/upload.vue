<template>
  <div class="doc-container">
    <div class="header-group">
      <h2 class="gradient-text">POST /upload</h2>
      <p>이미지를 업로드하여 새로운 AI 피팅 작업을 시작합니다.</p>
    </div>

    <section class="doc-section glass">
      <h3>설명</h3>
      <p>인물 이미지와 의류 이미지를 수신하여 고유한 <code>requestId</code>를 생성하고 비동기 피팅 프로세스를 시작합니다. 이미지는 자동으로 전처리되어 S3에 안전하게 저장됩니다.</p>
    </section>

    <section class="doc-section">
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
    </section>

    <section class="doc-section">
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
    </section>

    <section class="doc-section">
      <h3>응답 예시</h3>
      <pre class="glass"><code>{
  "requestId": "req_20260201_abcdefg",
  "status": "PROCESSING",
  "message": "접수 완료"
}</code></pre>
    </section>
  </div>
</template>

<style scoped>
.doc-container { display: flex; flex-direction: column; gap: 3rem; padding-bottom: 4rem; }
.header-group h2 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.header-group p { color: var(--text-muted); font-size: 1.1rem; }

.doc-section h3 { margin-bottom: 1.5rem; color: var(--secondary-color); font-size: 1.25rem; }
.doc-section p { color: var(--text-muted); line-height: 1.8; }

table { width: 100%; border-collapse: collapse; overflow: hidden; }
th { text-align: left; padding: 1.2rem; background: rgba(255, 255, 255, 0.03); color: var(--primary-color); font-size: 0.85rem; text-transform: uppercase; }
td { padding: 1.2rem; border-top: 1px solid var(--border-color); font-size: 0.95rem; }

pre { padding: 1.5rem; overflow-x: auto; color: #a5d6ff; font-family: 'Fira Code', monospace; line-height: 1.5; }
code { color: var(--primary-color); }
</style>
