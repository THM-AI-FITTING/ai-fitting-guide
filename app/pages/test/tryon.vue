<template>
  <div class="test-container">
    <ImageZoomModal :show="isZoomModalOpen" :image-url="zoomUrl" @close="isZoomModalOpen = false" />
    <div class="header-group">
      <h2 class="gradient-text">나한테 피팅해보기</h2>
      <p>본인의 이미지를 업로드하여 AI 피팅 엔진을 테스트해보세요.</p>
    </div>

    <!-- PERSONAL FITTING CONTENT -->
    <div class="tab-content">
      <div class="config-panel glass">
        <div class="input-group">
          <label>
            API Key
            <span class="required">* 필수 입력 값입니다.</span>
          </label>
          <input ref="apiKeyInput" v-model="apiKey" :class="{ 'error': showApiKeyError }" type="password"
            placeholder="인증을 위한 API Key를 입력하세요" @input="showApiKeyError = false" />
        </div>
      </div>

      <div ref="uploadGrid" class="upload-grid">
        <div class="upload-card glass" :class="{ 'has-file': personFile }">
          <div class="card-header">
            <h3>인물 이미지</h3>
            <button class="btn-guide-trigger" @click.stop="showGuideModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              가이드 보기
            </button>
          </div>
          <div class="drop-zone" @click="$refs.personInput.click()">
            <div class="image-wrapper" v-if="personPreview" @dblclick.stop="openZoomModal(personPreview)">
              <img :src="personPreview" class="preview" />
              <div class="zoom-overlay" @click.stop="openZoomModal(personPreview)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
            </div>
            <div v-else class="placeholder">
              <span>+</span>
              <p>인물 사진 선택</p>
            </div>
            <div class="aide-overlay" v-if="!personPreview">
              <svg class="silhouette-svg" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M44 12 L56 16 C57 17 59 21 59 21 C59 24 68 27 70 29 C71 30 70 38 67 52 C65 62 70 72 68 125 C68 128 56 128 56 125 L53 95 L50 95 L47 95 L44 125 C44 128 32 128 32 125 C30 72 35 62 33 52 C30 38 29 30 30 29 C32 27 41 24 41 21 C41 21 42 16 44 12 Z"
                  stroke="currentColor" stroke-width="0.75" stroke-dasharray="3 3" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M50 12 V125" stroke="currentColor" stroke-width="0.3" stroke-dasharray="2 2" opacity="0.3" />
              </svg>
              <div class="aide-text">실루엣 안에 몸을 맞춰주세요</div>
            </div>
          </div>
          <input ref="personInput" type="file" hidden accept=".jpg,.jpeg,.png"
            @change="handleFileChange($event, 'person')" />
        </div>

        <div class="upload-card glass" :class="{ 'has-file': productFile || productUrl || !personFile }">
          <h3>의류 이미지</h3>
          <div class="drop-zone" @click="$refs.productInput.click()">
            <div class="image-wrapper" v-if="productPreview || productUrl || (!productFile && !productUrl)"
              @dblclick.stop="openZoomModal(productPreview || productUrl || DEFAULT_PRODUCT_URL)">
              <img :src="productPreview || productUrl || DEFAULT_PRODUCT_URL" class="preview" />
              <div class="zoom-overlay" @click.stop="openZoomModal(productPreview || productUrl || DEFAULT_PRODUCT_URL)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <div class="change-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>의류 사진 선택</span>
              </div>
            </div>
            <div v-else class="placeholder">
              <span>+</span>
              <p>의류 사진 선택</p>
            </div>
          </div>
          <input ref="productInput" type="file" hidden accept=".jpg,.jpeg,.png"
            @change="handleFileChange($event, 'product')" />

          <div class="url-divider">
            <span>OR</span>
          </div>

          <div class="url-input-container">
            <input v-model="productUrl" type="text"
              placeholder="예시: https://cdn-img.thehandsome.com/studio/goods/NL/2G/SS/NL2G1WJC106WF1_DN_W01.jpg?rs=684X1032"
              @input="productFile = null; productPreview = null" />
          </div>
        </div>

        <div class="result-card glass">
          <h3>결과물</h3>
          <div class="result-zone">
            <div v-if="loading" class="loader-container">
              <div class="loader"></div>
              <p>{{ statusMessage }}</p>
            </div>
            <div class="image-wrapper" v-else-if="resultUrl" @dblclick.stop="openZoomModal(resultUrl)">
              <img :src="resultUrl" class="preview" />
              <div class="zoom-overlay" @click.stop="openZoomModal(resultUrl)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
            </div>
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

      <!-- Best Shot Guide Modal -->
      <div v-if="showGuideModal" class="modal-backdrop" @click.self="showGuideModal = false">
        <div class="guide-modal-content glass">
          <button class="btn-close-circle" @click="showGuideModal = false">×</button>

          <div class="guide-header">
            <div class="guide-icon">📸</div>
            <h2 class="gradient-text">가상 피팅 베스트 샷 가이드</h2>
            <p>사용자님의 사진에 따라 결과물이 80% 이상 결정됩니다!</p>
          </div>

          <div class="guide-grid">
            <div class="guide-section yes">
              <div class="section-label">✅ YES! 이런 사진이 좋아요</div>
              <div class="guide-items">
                <div class="guide-item">
                  <div class="item-icon">👤</div>
                  <div class="item-text">
                    <strong>정면 혹은 살짝 비스듬한 포즈</strong>
                    <span>얼굴과 몸이 정면을 향할수록 핏이 정확합니다.</span>
                  </div>
                </div>
                <div class="guide-item">
                  <div class="item-icon">👐</div>
                  <div class="item-text">
                    <strong>팔을 몸에서 살짝 띄운 자세</strong>
                    <span>팔이 몸을 가리지 않아야 실루엣이 왜곡되지 않습니다.</span>
                  </div>
                </div>
                <div class="guide-item">
                  <div class="item-icon">🏠</div>
                  <div class="item-text">
                    <strong>깔끔하고 심플한 배경</strong>
                    <span>단색의 벽지나 복잡하지 않은 배경을 추천합니다.</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="guide-section no">
              <div class="section-label">❌ NO! 이런 사진은 피해주세요</div>
              <div class="guide-items">
                <div class="guide-item">
                  <div class="item-icon">🔄</div>
                  <div class="item-text">
                    <strong>과도한 측면/뒷모습</strong>
                    <span>얼굴 각도가 너무 돌아가면 합성이 어렵습니다.</span>
                  </div>
                </div>
                <div class="guide-item">
                  <div class="item-icon">👜</div>
                  <div class="item-text">
                    <strong>물체에 가려진 전신</strong>
                    <span>가방이나 소품으로 몸이 가려지지 않게 해주세요.</span>
                  </div>
                </div>
                <div class="guide-item">
                  <div class="item-icon">🌑</div>
                  <div class="item-text">
                    <strong>너무 어두운 조명</strong>
                    <span>역광이거나 그림자가 심하면 색감이 왜곡됩니다.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="tips-box">
            <h3>💡 멋진 피팅 샷을 만드는 꿀팁!</h3>
            <ul>
              <li>정면을 바라보고 팔을 살짝 벌려 서주세요.</li>
              <li>가방이나 소품 없이 몸의 라인이 잘 보이게 찍어주세요.</li>
              <li>밝은 조명 아래에서 배경이 심플한 곳을 추천해요!</li>
              <li>현재 시스템은 인물 위주로 자동 크롭하여 최상의 샷을 만들어드립니다.</li>
            </ul>
          </div>

          <div class="guide-footer">
            <button class="btn-primary" @click="showGuideModal = false">가이드 확인 완료</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
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

const DEFAULT_PRODUCT_URL = 'https://cdn-img.thehandsome.com/studio/goods/NL/2G/SS/NL2G1WJC106WF1_DN_W01.jpg?rs=684X1032';

// Zoom Modal State
const isZoomModalOpen = ref(false);
const zoomUrl = ref('');

const openZoomModal = (url) => {
  zoomUrl.value = url;
  isZoomModalOpen.value = true;
};

const showErrorModal = ref(false);
const errorMessage = ref('');
const showApiKeyError = ref(false);
const personInput = ref(null);
const productInput = ref(null);
const apiKeyInput = ref(null);
const uploadGrid = ref(null); 
const showGuideModal = ref(false);

const scrollToCard = (index) => {
  if (uploadGrid.value && window.innerWidth <= 992) {
    const cards = uploadGrid.value.querySelectorAll('.upload-card, .result-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  } else if (index === 2 && window.innerWidth > 992) {
    const resultCard = uploadGrid.value.querySelector('.result-card');
    if (resultCard) {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

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

const isReady = computed(() => personFile.value && baseUrl.value);
const MAX_FILE_SIZE = 20 * 1024 * 1024; 

const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 2048;
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.8);
      };
    };
  });
};

const handleFileChange = async (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = '지원되지 않는 파일 형식입니다.\n\nJPG 또는 PNG 형식의 이미지만 업로드할 수 있습니다.';
    showErrorModal.value = true;
    e.target.value = ''; 
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = `파일 크기가 너무 큽니다 (권장: 10MB 이하, 최대 20MB).\n더 작은 이미지를 선택하거나 이미지를 압축해 주세요.`;
    showErrorModal.value = true;
    e.target.value = ''; 
    return;
  }

  statusMessage.value = '이미지 최적화 중...';
  const reader = new FileReader();
  reader.onload = (e) => {
    if (type === 'person') personPreview.value = e.target.result;
    else productPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  try {
    const compressedFile = await compressImage(file);
    if (type === 'person') {
      personFile.value = compressedFile;
      scrollToCard(1);
    } else {
      productFile.value = compressedFile;
      productUrl.value = '';
      scrollToCard(1);
    }
  } catch (err) {
    if (type === 'person') personFile.value = file;
    else { productFile.value = file; productUrl.value = ''; }
  }
};

const startFitting = async () => {
  if (!apiKey.value) {
    showApiKeyError.value = true;
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
  scrollToCard(2);

  try {
    const formData = new FormData();
    formData.append('person', personFile.value);
    if (productFile.value) formData.append('product', productFile.value);
    else formData.append('product', productUrl.value || DEFAULT_PRODUCT_URL);
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
        clearInterval(timer);
        loading.value = false;
        let msg = data.message || 'AI 피팅 실패';
        const separatorIndex = msg.indexOf(':');
        if (separatorIndex !== -1) msg = msg.substring(separatorIndex + 1).trim();
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
  gap: 1.5rem;
  padding-bottom: 4rem;
}

.header-group h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header-group p {
  color: var(--text-muted);
}

.config-panel {
  padding: 1.2rem 1.5rem;
  display: flex;
  width: 100%;
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
  font-size: 16px;
}

.input-group input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
  animation: shake 0.4s cubic-bezier(.36, .07, .19, .97) both;
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

.upload-card,
.result-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-guide-trigger {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a78bfa;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-guide-trigger:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: var(--primary-color);
  color: white;
}

.drop-zone,
.result-zone {
  aspect-ratio: 3/4;
  flex: 1;
  width: 100%;
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

.drop-zone:hover {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.02);
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zoom-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  z-index: 10;
}

.zoom-overlay:hover {
  background: var(--primary-color);
  transform: scale(1.1);
}

.drop-zone:hover .zoom-overlay,
.result-zone:hover .zoom-overlay {
  opacity: 1;
}

.change-overlay {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.drop-zone:hover .change-overlay {
  background: var(--primary-color);
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 4px 15px var(--primary-glow);
}

.placeholder {
  text-align: center;
  color: var(--text-muted);
}

.placeholder span {
  font-size: 2rem;
}

.loader-container {
  text-align: center;
}

.loader-container p {
  word-break: keep-all;
  line-height: 1.5;
  color: var(--text-muted);
}

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

.url-divider::before,
.url-divider::after {
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
  font-size: 16px;
  outline: none;
  transition: var(--transition);
}

.url-input-container input:focus {
  border-color: var(--primary-color);
}

.aide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 5;
  transition: opacity 0.3s ease;
}

.silhouette-svg {
  width: 60%;
  height: auto;
  color: var(--primary-color);
  opacity: 0.5;
  filter: drop-shadow(0 0 2px var(--primary-glow));
}

.aide-text {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
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

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-icon { font-size: 3rem; margin-bottom: 1rem; }
.modal-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #ff6b6b; }
.modal-message { color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5; white-space: pre-wrap; }
.btn-modal { background: var(--primary-color); color: white; border: none; padding: 0.8rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

.guide-modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 95%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.btn-close-circle {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.guide-header { text-align: center; margin-bottom: 2rem; }
.guide-header h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
.guide-header p { color: var(--text-muted); font-size: 0.95rem; }

.guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.guide-section { padding: 1.8rem; border-radius: 16px; border: 1px solid var(--border-color); }
.guide-section.yes { background: rgba(74, 222, 128, 0.04); border-color: rgba(74, 222, 128, 0.15); }
.guide-section.no { background: rgba(251, 113, 133, 0.04); border-color: rgba(251, 113, 133, 0.15); }
.section-label { font-weight: 700; font-size: 1rem; margin-bottom: 1.2rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--border-color); }
.guide-section.yes .section-label { color: #4ade80; }
.guide-section.no .section-label { color: #fb7185; }

.guide-items { display: flex; flex-direction: column; gap: 1.2rem; }
.guide-item { display: flex; gap: 1rem; align-items: flex-start; }
.item-icon { width: 40px; height: 40px; background: var(--bg-color); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; border: 1px solid var(--border-color); }
.item-text { display: flex; flex-direction: column; gap: 0.2rem; }
.item-text strong { font-size: 0.95rem; color: var(--text-main); }
.item-text span { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }

.tips-box { background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.8rem; margin-bottom: 2rem; }
.tips-box h3 { color: #a78bfa; font-size: 1rem; margin-bottom: 1rem; }
.tips-box ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.tips-box li { font-size: 0.9rem; color: var(--text-muted); padding-left: 1.2rem; position: relative; line-height: 1.6; }
.tips-box li::before { content: '✦'; position: absolute; left: 0; color: var(--primary-color); font-size: 0.7rem; }

.guide-footer { text-align: center; }

@media (max-width: 992px) {
  .upload-grid {
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    gap: 1rem;
    padding-bottom: 1.5rem;
  }
  .upload-card, .result-card {
    flex: 0 0 100%;
    scroll-snap-align: center;
  }
}
</style>
