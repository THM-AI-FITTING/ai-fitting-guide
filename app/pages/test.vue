<template>
  <div class="test-container">
    <div class="header-group">
      <h2 class="gradient-text">체험 센터</h2>
      <p>본인의 이미지를 업로드하여 AI 피팅 엔진을 테스트해보세요.</p>
    </div>

    <div class="config-panel glass">
      <div class="input-group">
        <label>API Base URL</label>
        <input v-model="baseUrl" type="text" placeholder="https://....execute-api.ap-northeast-2.amazonaws.com/prod" />
      </div>
      <div class="input-group">
        <label>API Key</label>
        <input v-model="apiKey" type="password" placeholder="API Key를 입력하세요" />
      </div>
    </div>

    <div class="upload-grid">
      <div class="upload-card glass" :class="{ 'has-file': personFile }">
        <h3>인물 이미지</h3>
        <div class="drop-zone" @click="$refs.personInput.click()">
          <img v-if="personPreview" :src="personPreview" class="preview" />
          <div v-else class="placeholder">
            <span>+</span>
            <p>인물 사진 선택</p>
          </div>
        </div>
        <input ref="personInput" type="file" hidden @change="handleFileChange($event, 'person')" />
      </div>

      <div class="upload-card glass" :class="{ 'has-file': productFile }">
        <h3>의류 이미지</h3>
        <div class="drop-zone" @click="$refs.productInput.click()">
          <img v-if="productPreview" :src="productPreview" class="preview" />
          <div v-else class="placeholder">
            <span>+</span>
            <p>의류 사진 선택</p>
          </div>
        </div>
        <input ref="productInput" type="file" hidden @change="handleFileChange($event, 'product')" />
      </div>

      <div class="result-card glass">
        <h3>결과물</h3>
        <div class="result-zone">
          <div v-if="loading" class="loader-container">
            <div class="loader"></div>
            <p>{{ statusMessage }}</p>
          </div>
          <img v-else-if="resultUrl" :src="resultUrl" class="preview" />
          <div v-else class="placeholder">
            <p>결과가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn-primary" :disabled="!isReady || loading" @click="startFitting">
        {{ loading ? '처리 중...' : 'AI 피팅 시작' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const baseUrl = ref('');
const apiKey = ref('test_api_key');
const personFile = ref(null);
const productFile = ref(null);
const personPreview = ref(null);
const productPreview = ref(null);
const resultUrl = ref(null);
const loading = ref(false);
const statusMessage = ref('');
const requestId = ref(null);

const isReady = computed(() => personFile.value && productFile.value && baseUrl.value);

const handleFileChange = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (type === 'person') {
      personFile.value = file;
      personPreview.value = e.target.result;
    } else {
      productFile.value = file;
      productPreview.value = e.target.result;
    }
  };
  reader.readAsDataURL(file);
};

const startFitting = async () => {
  if (!isReady.value) return;

  loading.value = true;
  statusMessage.value = '이미지 업로드 중...';
  resultUrl.value = null;

  try {
    const formData = new FormData();
    formData.append('person', personFile.value);
    formData.append('product', productFile.value);
    formData.append('userId', 'guide_test_' + Math.floor(Math.random() * 1000));

    const res = await fetch(`${baseUrl.value}/upload`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey.value },
      body: formData
    });

    const data = await res.json();
    if (data.requestId) {
      requestId.value = data.requestId;
      pollResult();
    } else {
      throw new Error(data.message || '업로드 실패');
    }
  } catch (err) {
    alert('에러: ' + err.message);
    loading.value = false;
  }
};

const pollResult = async () => {
  statusMessage.value = 'AI 이미지 생성 중... 잠시만 기다려주세요';
  
  const timer = setInterval(async () => {
    try {
      const res = await fetch(`${baseUrl.value}/result?requestId=${requestId.value}`, {
        headers: { 'x-api-key': apiKey.value }
      });
      const data = await res.json();

      if (data.status === 'DONE' || data.status === 'COMPLETED') {
        resultUrl.value = data.resultUrl || data.resultImageUrl;
        loading.value = false;
        clearInterval(timer);
      } else if (data.status === 'ERROR') {
        throw new Error('AI 피팅 실패');
      }
    } catch (err) {
      alert(err.message);
      loading.value = false;
      clearInterval(timer);
    }
  }, 3000);
};
</script>

<style scoped>
.test-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 4rem;
}

.header-group h2 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.header-group p { color: var(--text-muted); }

.config-panel {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
}

.input-group input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  outline: none;
  transition: var(--transition);
}

.input-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.upload-card, .result-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drop-zone, .result-zone {
  aspect-ratio: 3/4;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: var(--transition);
  position: relative;
}

.drop-zone:hover { border-color: var(--primary-color); background: rgba(255, 255, 255, 0.02); }

.preview { width: 100%; height: 100%; object-fit: cover; }

.placeholder { text-align: center; color: var(--text-muted); }
.placeholder span { font-size: 2rem; }

.loader-container { text-align: center; }
.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.action-bar { display: flex; justify-content: center; margin-top: 1rem; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 992px) {
  .upload-grid { grid-template-columns: 1fr; }
  .config-panel { grid-template-columns: 1fr; }
}
</style>
