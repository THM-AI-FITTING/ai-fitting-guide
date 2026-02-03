<template>
  <div class="test-container">
    <div class="header-group">
      <h2 class="gradient-text">가상 피팅 체험하기</h2>
      <p>본인의 이미지를 업로드하여 AI 피팅 엔진을 테스트해보세요.</p>
    </div>

    <div class="config-panel glass">
      <div class="input-group">
        <label>
            API Key
            <span class="required">* 필수 입력 값입니다.</span>
        </label>
        <input 
            ref="apiKeyInput"
            v-model="apiKey" 
            :class="{ 'error': showApiKeyError }"
            type="password" 
            placeholder="인증을 위한 API Key를 입력하세요" 
            @input="showApiKeyError = false"
        />
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

      <div class="upload-card glass" :class="{ 'has-file': productFile || productUrl }">
        <h3>의류 이미지</h3>
        <div class="drop-zone" @click="$refs.productInput.click()">
          <img v-if="productPreview || productUrl" :src="productPreview || productUrl" class="preview" />
          <div v-else class="placeholder">
            <span>+</span>
            <p>의류 사진 선택</p>
          </div>
        </div>
        <input ref="productInput" type="file" hidden @change="handleFileChange($event, 'product')" />
        
        <div class="url-divider">
          <span>OR</span>
        </div>

        <div class="url-input-container">
          <input 
            v-model="productUrl" 
            type="text" 
            placeholder="예시: https://cdn-img.thehandsome.com/studio/goods/NL/2G/SS/NL2G1WJC106WF1_DN_W01.jpg?rs=684X1032"
            @input="productFile = null; productPreview = null"
          />
        </div>
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
      <button class="btn-secondary" @click="resetAll" :disabled="loading">
        초기화
      </button>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-backdrop" @click.self="closeErrorModal">
      <div class="modal-content">
        <div class="modal-icon">⚠️</div>
        <h3 class="modal-title">알림</h3>
        <p class="modal-message">{{ errorMessage }}</p>
        <button class="btn-modal" @click="closeErrorModal">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const baseUrl = ref('https://wvoq4gq3ui.execute-api.ap-northeast-2.amazonaws.com/dev/fitting');
const apiKey = ref('');
const personFile = ref(null);
const productFile = ref(null);
const personPreview = ref(null);
const productPreview = ref(null);
const productUrl = ref('');
const resultUrl = ref(null);
const loading = ref(false);
const statusMessage = ref('');
const requestId = ref(null);

// Modal state
const showErrorModal = ref(false);
const errorMessage = ref('');
const showApiKeyError = ref(false);
const apiKeyInput = ref(null); // Template ref for scroll target

const closeErrorModal = () => {
  showErrorModal.value = false;
  errorMessage.value = '';
};

const resetAll = () => {
  personFile.value = null;
  productFile.value = null;
  personPreview.value = null;
  productPreview.value = null;
  productUrl.value = '';
  resultUrl.value = null;
  requestId.value = null;
  loading.value = false;
  statusMessage.value = '';
  showApiKeyError.value = false;
};

// Button should be enabled if files are ready, regardless of API Key (so we can show validation error)
const isReady = computed(() => personFile.value && (productFile.value || productUrl.value) && baseUrl.value);

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
      productUrl.value = ''; // Clear URL if file is selected
    }
  };
  reader.readAsDataURL(file);
};

const startFitting = async () => {
  if (!apiKey.value) {
    showApiKeyError.value = true;
    // Scroll to input
    if (apiKeyInput.value) {
        apiKeyInput.value.focus();
        apiKeyInput.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  if (!isReady.value) return;

  loading.value = true;
  statusMessage.value = '이미지 업로드 중...';
  resultUrl.value = null;

  try {
    const formData = new FormData();
    formData.append('person', personFile.value);
    
    if (productFile.value) {
      formData.append('product', productFile.value);
    } else {
      formData.append('product', productUrl.value);
    }
    
    formData.append('userId', 'guide_test');

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
    errorMessage.value = '에러: ' + err.message;
    showErrorModal.value = true;
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
      } else if (data.status === 'FAILED') {
        clearInterval(timer); // Explicitly stop polling
        loading.value = false;
        
        let msg = data.message || 'AI 피팅 실패';
        // Extract message after the first colon if present
        const separatorIndex = msg.indexOf(':');
        if (separatorIndex !== -1) {
          msg = msg.substring(separatorIndex + 1).trim();
        }
        
        errorMessage.value = msg;
        showErrorModal.value = true;
      } else if (data.status === 'ERROR') {
        throw new Error('AI 피팅 실패');
      }
    } catch (err) {
      errorMessage.value = err.message;
      showErrorModal.value = true;
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
  padding: 1.2rem 1.5rem;
  display: flex;
  width: 100%; /* Make it full width */
}

.input-group {
  width: 100%;
}

.input-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
}

.required {
  color: #ef4444;
  font-size: 0.7rem;
  font-weight: 700;
}

.input-group input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.8rem;
  border-radius: 8px;
  outline: none;
  transition: var(--transition);
}

.input-group input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
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

.url-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.url-divider::before, .url-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.url-divider span {
  padding: 0 1rem;
}

.url-input-container input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.8rem;
  outline: none;
  transition: var(--transition);
}

.url-input-container input:focus {
  border-color: var(--primary-color);
}

.action-bar { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  gap: 1rem;
  margin-top: 1rem; 
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: transparent;
  color: var(--text-muted);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  border-color: var(--text-muted);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ff6b6b;
}

.modal-message {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.btn-modal {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-modal:hover {
  opacity: 0.9;
}

@media (max-width: 992px) {
  .upload-grid { grid-template-columns: 1fr; }
  .config-panel { width: 100%; }
}

@media (max-width: 768px) {
  .header-group h2 { font-size: 1.8rem; }
  
  .upload-card, .result-card {
    padding: 1rem;
  }
  
  .drop-zone {
    aspect-ratio: 4/3; /* slightly shorter on mobile to save vertical space */
  }

  .action-bar {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    text-align: center;
  }
  
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>
