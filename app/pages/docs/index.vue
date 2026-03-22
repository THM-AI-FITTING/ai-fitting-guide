<template>
  <div class="docs-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-sticky">
        <h3 class="sidebar-title">내 피팅해보기 (Basic)</h3>
        <nav class="sidebar-nav">
          <a href="#upload" :class="{ active: activeSection === 'upload' }" @click.prevent="scrollTo('upload')">
            <span class="method post">POST</span> /upload
          </a>
        </nav>

        <h3 class="sidebar-title" style="margin-top: 2rem;">스튜디오 (Studio)</h3>
        <nav class="sidebar-nav">
          <a href="#studio-upload" :class="{ active: activeSection === 'studio-upload' }" @click.prevent="scrollTo('studio-upload')">
            <span class="method post">POST</span> /studio/upload
          </a>
        </nav>

        <h3 class="sidebar-title" style="margin-top: 2rem;">공통 (Common)</h3>
        <nav class="sidebar-nav">
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
      <!-- Security Notice -->
      <div class="security-notice glass">
        <div class="notice-icon">⚠️</div>
        <div class="notice-text">
          <p><strong>보안 알림:</strong> 저희 가상 피팅 API는 보안을 위해 파트너사 서버(Backend)에서 호출하는 것을 권장합니다.</p>
          <p>클라이언트에서 직접 호출 시 API Key 탈취 및 데이터 변조의 위험이 있으며, 이로 인한 부정 사용량에 대해서는 책임지지 않습니다.</p>
        </div>
      </div>

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
          <h3>요청 예시</h3>
          <div class="code-wrapper glass" :class="{ 'collapsed': !expandedBlocks.upload }">
            <div class="code-header" @click="toggleBlock('upload')">
              <div class="lang-tabs" @click.stop>
                <button :class="{ active: selectedLangs.upload === 'js' }" @click="selectedLangs.upload = 'js'">JavaScript</button>
                <button :class="{ active: selectedLangs.upload === 'java' }" @click="selectedLangs.upload = 'java'">Java</button>
              </div>
              <div class="code-actions">
                <button class="copy-btn" @click.stop="copyCode(selectedLangs.upload === 'js' ? 'upload-code-js' : 'upload-code-java')">Copy</button>
                <div class="toggle-icon">{{ expandedBlocks.upload ? '▲' : '▼' }}</div>
              </div>
            </div>
            
            <pre v-if="selectedLangs.upload === 'js'" id="upload-code-js"><code class="language-javascript">const formData = new FormData();
formData.append('person', personFileInput.files[0]);
formData.append('product', productFileInput.files[0]);
formData.append('userId', 'user_123');

const response = await fetch('https://api.yourservice.com/fitting/upload', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
  body: formData
});

const data = await response.json();
console.log(data);</code></pre>

            <pre v-if="selectedLangs.upload === 'java'" id="upload-code-java"><code class="language-java">// Using Java 11+ HttpClient
import java.net.http.*;
import java.nio.file.Path;

var client = HttpClient.newHttpClient();
var multipartBody = MultipartBodyPublisher.newBuilder()
    .addPart("person", Path.of("person.jpg"))
    .addPart("product", Path.of("product.jpg"))
    .addPart("userId", "user_123")
    .build();

var request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.yourservice.com/fitting/upload"))
    .header("x-api-key", "YOUR_API_KEY")
    .header("Content-Type", "multipart/form-data; boundary=" + multipartBody.getBoundary())
    .POST(multipartBody.asPublisher())
    .build();

var response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());</code></pre>
          </div>
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

      <!-- Studio Upload Section -->
      <section id="studio-upload" class="doc-section">
        <div class="header-group">
          <h2 class="gradient-text">POST /studio/upload</h2>
          <p>새로운 스튜디오(고급 AI 피팅) 작업을 시작합니다.</p>
        </div>

        <div class="doc-block glass">
          <h3>설명</h3>
          <p>기본 AI 피팅 외에, 포즈 유지, 부분 적용, 프롬프트 기반 커스텀 피팅 등을 지원하는 스튜디오 피팅 API입니다. <code>poseGroupId</code>와 <code>slot</code> 등을 활용하여 연관된 작업물을 하나로 묶어 관리할 수 있습니다.</p>
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
              <tr><td>poseGroupId</td><td>String</td><td>예</td><td>관련된 피팅 작업들을 묶어주는 고유 그룹 식별자</td></tr>
              <tr><td>slot</td><td>String</td><td>예</td><td>뷰 타입/슬롯. 기본 포즈: <code>a</code>, <code>b</code>(Front), <code>c</code>, <code>d</code>(Back) 또는 커스텀 <code>e</code></td></tr>
              <tr><td>person</td><td>File</td><td>예</td><td>입력 인물/마네킹 이미지 (필수)</td></tr>
              <tr><td>product</td><td>File</td><td>예</td><td>적용할 의류/상품 이미지 (필수)</td></tr>
              <tr><td>userId</td><td>String</td><td>아니오</td><td>이력 추적 및 토큰 격리를 위한 파트너 측 엔드 유저 식별자</td></tr>
              <tr><td>prompt</td><td>String</td><td>아니오</td><td>커스텀 피팅 시 AI 생성에 참조할 디테일 텍스트 프롬프트</td></tr>
              <tr><td>aspectRatio</td><td>String</td><td>아니오</td><td>결과 해상도 비율 (예: <code>2:3</code>(기본), <code>3:4</code>, <code>9:16</code>, <code>1:1</code> 등)</td></tr>
              <tr><td>imageSize</td><td>String</td><td>아니오</td><td>결과 리스케일 옵션 (예: <code>1K</code>, <code>2K</code>, <code>4K</code>)</td></tr>
              <tr><td>model</td><td>String</td><td>아니오</td><td>특정 모델/알고리즘을 강제할 때 사용하는 프리셋 키</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>요청 예시</h3>
          <div class="code-wrapper glass" :class="{ 'collapsed': !expandedBlocks.studioUpload }">
            <div class="code-header" @click="toggleBlock('studioUpload')">
              <div class="lang-tabs" @click.stop>
                <button :class="{ active: selectedLangs.studioUpload === 'js' }" @click="selectedLangs.studioUpload = 'js'">JavaScript</button>
                <button :class="{ active: selectedLangs.studioUpload === 'java' }" @click="selectedLangs.studioUpload = 'java'">Java</button>
              </div>
              <div class="code-actions">
                <button class="copy-btn" @click.stop="copyCode(selectedLangs.studioUpload === 'js' ? 'studio-upload-code-js' : 'studio-upload-code-java')">Copy</button>
                <div class="toggle-icon">{{ expandedBlocks.studioUpload ? '▲' : '▼' }}</div>
              </div>
            </div>
            
            <pre v-if="selectedLangs.studioUpload === 'js'" id="studio-upload-code-js"><code class="language-javascript">const formData = new FormData();
formData.append('poseGroupId', 'group_abcd123');
formData.append('slot', 'a');
formData.append('person', personFileInput.files[0]);
formData.append('product', productFileInput.files[0]);
formData.append('userId', 'user_123');
formData.append('aspectRatio', '3:4');
formData.append('prompt', 'modern, stylish, high-resolution');

const response = await fetch('https://api.yourservice.com/studio/upload', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
  body: formData
});

const data = await response.json();
console.log(data);</code></pre>

            <pre v-if="selectedLangs.studioUpload === 'java'" id="studio-upload-code-java"><code class="language-java">// Using Java 11+ HttpClient
import java.net.http.*;
import java.nio.file.Path;

var client = HttpClient.newHttpClient();
var multipartBody = MultipartBodyPublisher.newBuilder()
    .addPart("poseGroupId", "group_abcd123")
    .addPart("slot", "a")
    .addPart("person", Path.of("person.jpg"))
    .addPart("product", Path.of("product.jpg"))
    .addPart("userId", "user_123")
    .addPart("aspectRatio", "3:4")
    .build();

var request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.yourservice.com/studio/upload"))
    .header("x-api-key", "YOUR_API_KEY")
    .header("Content-Type", "multipart/form-data; boundary=" + multipartBody.getBoundary())
    .POST(multipartBody.asPublisher())
    .build();

var response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());</code></pre>
          </div>
        </div>

        <div class="doc-block">
          <h3>응답 예시</h3>
          <pre class="glass"><code>{
  "requestId": "req_20260201_xyz987",
  "status": "PROCESSING",
  "message": "스튜디오 작업 접수 완료"
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
          <h3>Polling 예시</h3>
          <div class="code-wrapper glass" :class="{ 'collapsed': !expandedBlocks.polling }">
            <div class="code-header" @click="toggleBlock('polling')">
              <div class="lang-tabs" @click.stop>
                <button :class="{ active: selectedLangs.polling === 'js' }" @click="selectedLangs.polling = 'js'">JavaScript</button>
                <button :class="{ active: selectedLangs.polling === 'java' }" @click="selectedLangs.polling = 'java'">Java</button>
              </div>
              <div class="code-actions">
                <button class="copy-btn" @click.stop="copyCode(selectedLangs.polling === 'js' ? 'polling-code-js' : 'polling-code-java')">Copy</button>
                <div class="toggle-icon">{{ expandedBlocks.polling ? '▲' : '▼' }}</div>
              </div>
            </div>

            <pre v-if="selectedLangs.polling === 'js'" id="polling-code-js"><code class="language-javascript">const pollResult = async (requestId) => {
  const checkStatus = async () => {
    const res = await fetch(`https://api.yourservice.com/result?requestId=${requestId}`, {
      headers: { 'x-api-key': 'YOUR_API_KEY' }
    });
    const data = await res.json();
    
    if (data.status === 'DONE') {
      console.log('Result:', data.resultUrl);
    } else {
      setTimeout(checkStatus, 3000);
    }
  };
  checkStatus();
};</code></pre>

            <pre v-if="selectedLangs.polling === 'java'" id="polling-code-java"><code class="language-java">// Using Java 11+ HttpClient
public void pollResult(String requestId) throws Exception {
    var client = HttpClient.newHttpClient();
    var uri = URI.create("https://api.yourservice.com/result?requestId=" + requestId);
    
    while (true) {
        var request = HttpRequest.newBuilder()
            .uri(uri)
            .header("x-api-key", "YOUR_API_KEY")
            .GET()
            .build();
            
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // Parse JSON response (e.g., using Jackson or Gson)
        if (response.body().contains("\"DONE\"")) {
            System.out.println("Processing complete");
            break;
        }
        Thread.sleep(3000);
    }
}</code></pre>
          </div>
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
          <div class="info-alert glass" style="border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.05);">
            <span class="info-icon">⚠️</span>
            <p><strong>[주의] 토큰 기반 페이징 전용:</strong> 본 API는 대규모 트래픽 및 DynamoDB의 성능 최적화를 위해 전통적인 오프셋 방식(page, offset)을 <strong>지원하지 않습니다</strong>. 이전 응답에서 제공된 <code>nextId</code>와 <code>nextSort</code> 값을 반드시 다음 요청의 <code>lastId</code>와 <code>lastSort</code> 파라미터로 그대로 전달하여 다음 페이지를 조회해야 합니다. (값이 null이면 마지막 페이지입니다.)</p>
          </div>
        </div>

        <div class="doc-block">
          <h3>쿼리 파라미터</h3>
          <table class="glass">
            <thead>
              <tr><th>파라미터</th><th>타입</th><th>필수 여부</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td>userId</td><td>String</td><td>아니오</td><td>특정 사용자의 작업을 필터링합니다.</td></tr>
              <tr><td>size</td><td>Number</td><td>아니오</td><td>한 페이지에 가져올 항목 수 (기본값: 10).</td></tr>
              <tr><td>sort</td><td>String</td><td>아니오</td><td>정렬 순서 (<code>desc</code> 또는 <code>asc</code>, 기본값: <code>desc</code>).</td></tr>
              <tr><td>lastId</td><td>String</td><td>아니오</td><td>이전 응답의 <code>nextId</code> 값을 전달합니다.</td></tr>
              <tr><td>lastSort</td><td>String</td><td>아니오</td><td>이전 응답의 <code>nextSort</code> 값을 전달합니다.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>응답 구조</h3>
          <table class="glass">
            <thead>
              <tr><th>필드</th><th>타입</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td>items</td><td>Array</td><td>작업 이력 목록.</td></tr>
              <tr><td>nextId</td><td>String</td><td>다음 페이지 조회를 위한 ID 토큰 (마지막 페이지인 경우 null).</td></tr>
              <tr><td>nextSort</td><td>String</td><td>다음 페이지 조회를 위한 정렬 토큰 (마지막 페이지인 경우 null).</td></tr>
            </tbody>
          </table>
        </div>

        <div class="doc-block">
          <h3>페이징 요청 예시</h3>
          <div class="code-wrapper glass" :class="{ 'collapsed': !expandedBlocks.history }">
            <div class="code-header" @click="toggleBlock('history')">
              <div class="lang-tabs" @click.stop>
                <button :class="{ active: selectedLangs.history === 'js' }" @click="selectedLangs.history = 'js'">JavaScript</button>
                <button :class="{ active: selectedLangs.history === 'java' }" @click="selectedLangs.history = 'java'">Java</button>
              </div>
              <div class="code-actions">
                <button class="copy-btn" @click.stop="copyCode(selectedLangs.history === 'js' ? 'history-code-js' : 'history-code-java')">Copy</button>
                <div class="toggle-icon">{{ expandedBlocks.history ? '▲' : '▼' }}</div>
              </div>
            </div>

            <pre v-if="selectedLangs.history === 'js'" id="history-code-js"><code class="language-javascript">// 다음 페이지 조회를 위한 함수 예시
const fetchNextPage = async (userId, lastId = null, lastSort = null) => {
  let url = `https://api.yourservice.com/fitting/history?userId=${userId}&size=10`;
  
  if (lastId && lastSort) {
    url += `&lastId=${lastId}&lastSort=${lastSort}`;
  }

  const response = await fetch(url, {
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  
  const data = await response.json();
  console.log('Items:', data.items);
  
  if (data.nextId) {
    console.log('Next page available');
    // data.nextId, data.nextSort를 사용하여 다음 호출 가능
  }
};</code></pre>

            <pre v-if="selectedLangs.history === 'java'" id="history-code-java"><code class="language-java">// Using Java 11+ HttpClient
public void fetchHistory(String userId, String lastId, String lastSort) throws Exception {
    var client = HttpClient.newHttpClient();
    String url = "https://api.yourservice.com/fitting/history?userId=" + userId + "&size=10";
    
    if (lastId != null && lastSort != null) {
        url += "&lastId=" + lastId + "&lastSort=" + lastSort;
    }

    var request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header("x-api-key", "YOUR_API_KEY")
        .GET()
        .build();
        
    var response = client.send(request, HttpResponse.BodyHandlers.ofString());
    // Parse response.body() to get nextId and nextSort for subsequent calls
    System.out.println(response.body());
}</code></pre>
          </div>
        </div>

        <div class="doc-block">
          <h3>응답 예시</h3>
          <pre class="glass"><code>{
  "items": [
    {
      "requestId": "req_20260201_002",
      "userId": "user_123",
      "status": "DONE",
      "resultUrl": "https://s3.amazonaws.com/...",
      "createdAt": "2026-02-01T07:20:00Z"
    },
    {
      "requestId": "req_20260201_001",
      "userId": "user_123",
      "status": "DONE",
      "resultUrl": "https://s3.amazonaws.com/...",
      "createdAt": "2026-02-01T07:15:20Z"
    }
  ],
  "nextId": "req_20260201_001",
  "nextSort": "2026-02-01T07:15:20Z"
}</code></pre>
        </div>
      </section>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast glass">
        클립보드에 복사됨
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const activeSection = ref('upload')
const sections = ['upload', 'studio-upload', 'result', 'history']

const expandedBlocks = ref({
  upload: true,
  studioUpload: true,
  polling: true,
  history: true
})

const selectedLangs = ref({
  upload: 'js',
  studioUpload: 'js',
  polling: 'js',
  history: 'js'
})

const showToast = ref(false)
let toastTimeout = null

const highlightAll = () => {
  nextTick(() => {
    const blocks = document.querySelectorAll('pre code')
    blocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  })
}

// Watch for changes in expanded blocks or language selection to re-highlight
watch([expandedBlocks, selectedLangs], () => {
  highlightAll()
}, { deep: true })

const toggleBlock = (blockId) => {
  expandedBlocks.value[blockId] = !expandedBlocks.value[blockId]
  if (expandedBlocks.value[blockId]) {
    highlightAll()
  }
}

const copyCode = (id) => {
  const el = document.getElementById(id)
  if (el) {
    const code = el.innerText
    navigator.clipboard.writeText(code).then(() => {
      showToast.value = true
      if (toastTimeout) clearTimeout(toastTimeout)
      toastTimeout = setTimeout(() => {
        showToast.value = false
      }, 2000)
    })
  }
}

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
  highlightAll()
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
  gap: 4rem;
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
  color: #24292e; /* Darker color for light background */
  background: #f8f9fa; /* Off-white gray background */
  border-radius: 12px;
  font-family: 'Fira Code', monospace;
  line-height: 1.5;
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
}

code {
  color: var(--primary-color);
  background: rgba(0, 0, 0, 0.05); /* Subtle gray instead of blue */
  padding: 2px 4px;
  border-radius: 4px;
}

.code-wrapper {
  position: relative;
  overflow: hidden;
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--border-color);
}

.lang-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.copy-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.code-wrapper pre {
  margin: 0;
  border: none;
  background: #f8f9fa; /* Consistent off-white gray */
  border-radius: 0;
}

.code-wrapper pre code.hljs {
  padding: 1.5rem;
  background: transparent;
}

/* Dark mode overrides for code blocks if needed */
:root[data-theme="dark"] .code-wrapper pre,
:root[data-theme="dark"] pre.glass,
:root[data-theme="dark"] .hljs {
  background: rgba(0, 0, 0, 0.3) !important;
  color: #a5d6ff !important;
}

/* Highlight.js specific adjustments */
.hljs {
  background: transparent !important;
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

/* Security Notice */
.security-notice {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  border-left: 4px solid #f59e0b;
  background: rgba(245, 158, 11, 0.05);
  align-items: center;
}

.notice-icon {
  font-size: 2rem;
}

.notice-text p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-main);
  line-height: 1.6;
}

.notice-text p strong {
  color: #f59e0b;
}

/* Collapsible Code */
.code-wrapper {
  transition: all 0.3s ease;
}

.code-wrapper.collapsed pre {
  display: none;
}

.code-header {
  cursor: pointer;
}

.code-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-icon {
  font-size: 0.8rem;
  color: var(--text-muted);
  width: 20px;
  text-align: center;
}

.lang-tag small {
  font-weight: 400;
  opacity: 0.7;
  margin-left: 0.5rem;
  text-transform: none;
}

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.8rem 1.5rem;
  background: var(--surface-color);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.lang-tabs {
  display: flex;
  gap: 0.8rem;
}

.lang-tabs button {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s;
  min-width: 100px;
}

.lang-tabs button:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.lang-tabs button.active {
  color: var(--primary-color);
  background: rgba(56, 189, 248, 0.1);
  border-color: var(--primary-color);
}

.info-alert {
  display: flex;
  gap: 1.2rem;
  padding: 1.5rem;
  background: rgba(56, 189, 248, 0.05);
  border-left: 4px solid var(--primary-color);
  margin-top: 1.5rem;
  align-items: flex-start;
}

.info-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.info-alert p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-main);
  line-height: 1.6;
}

.info-alert strong {
  color: var(--primary-color);
}
</style>
