<template>
  <div class="studio-fitting-container">
    <div class="upload-grid">
      <!-- Image Upload Section -->
      <div class="upload-card glass">
        <div class="card-header">
          <h3>의상 사진 업로드</h3>
          <p class="card-subtitle">전면 사진은 필수이며, 후면 사진 업로드 시 추가 포즈가 활성화됩니다.</p>
        </div>

        <div class="upload-areas">
          <!-- Front Photo -->
          <div class="upload-item">
            <label class="upload-label">전면 의상 사진 (필수)</label>
            <div 
              class="drop-zone" 
              :class="{ 'has-image': frontImage }"
              @click="$refs.frontInput.click()"
            >
              <input 
                type="file" 
                ref="frontInput" 
                hidden 
                accept="image/*" 
                @change="handleFileUpload($event, 'front')"
              >
              <template v-if="frontImage">
                <img :src="frontImage" class="preview-img" alt="Front Preview">
                <button class="remove-btn" @click.stop="frontImage = null">×</button>
              </template>
              <div v-else class="upload-placeholder">
                <div class="icon">📁</div>
                <span>클릭하여 사진 선택</span>
              </div>
            </div>
          </div>

          <!-- Back Photo -->
          <div class="upload-item">
            <label class="upload-label">후면 의상 사진 (선택)</label>
            <div 
              class="drop-zone" 
              :class="{ 'has-image': backImage }"
              @click="$refs.backInput.click()"
            >
              <input 
                type="file" 
                ref="backInput" 
                hidden 
                accept="image/*" 
                @change="handleFileUpload($event, 'back')"
              >
              <template v-if="backImage">
                <img :src="backImage" class="preview-img" alt="Back Preview">
                <button class="remove-btn" @click.stop="backImage = null">×</button>
              </template>
              <div v-else class="upload-placeholder">
                <div class="icon">📁</div>
                <span>클릭하여 사진 선택</span>
              </div>
            </div>
          </div>
        </div>

        <div class="upload-footer">
          <button 
            class="btn-primary" 
            :disabled="!frontImage || generating"
            @click="generatePoses"
          >
            {{ generating ? '처리 중...' : (frontImage && backImage ? '4개 포즈 생성하기' : '2개 포즈 생성하기') }}
          </button>
        </div>
      </div>

      <!-- Pose Guide Section -->
      <div class="guide-card glass">
        <div class="card-header">
          <h3>포즈 선택 영역</h3>
          <span class="badge" :class="backImage ? 'badge-success' : 'badge-warning'">
            {{ backImage ? '모든 포즈 가능' : '전면 포즈만 가능' }}
          </span>
        </div>
        <p class="card-subtitle" style="margin-bottom: 1rem;">
          각 포즈에 원하는 모델이나 포즈 예시를 선택/업로드하세요.
        </p>

        <div class="guide-grid">
          <div 
            v-for="pose in poses" 
            :key="pose.id" 
            class="pose-item"
            :class="{ disabled: (pose.type === 'back' && !backImage) || (pose.type === 'front' && !frontImage) }"
          >
            <div class="pose-thumb" @click="handlePoseClick(pose)">
              <div class="pose-overlay" v-if="pose.type === 'front' && !frontImage">
                <div class="icon">🔒</div>
                <span>전면 사진 필요</span>
              </div>
              <div class="pose-overlay" v-else-if="pose.type === 'back' && !backImage">
                <div class="icon">🔒</div>
                <span>후면 사진 필요</span>
              </div>
              <template v-else>
                <img v-if="pose.customImage" :src="pose.customImage" class="preview-img" />
                <div v-else class="silhouette-placeholder">
                  <div class="icon">👤</div>
                  <span>포즈 설정</span>
                </div>
              </template>
              <div class="pose-label">{{ pose.id }}</div>
            </div>
            <div class="pose-info">
              <span class="pose-name">{{ pose.name }}</span>
              <span class="pose-desc">{{ pose.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Result / Prompt Section -->
    <div v-if="showResults" class="results-section">
      <div class="result-card glass">
        <div class="section-header">
          <h3>생성 결과</h3>
        </div>

        <div class="results-grid">
          <div v-for="res in results" :key="res.id" class="result-img-wrapper">
            <img :src="res.url" :alt="res.id" class="preview-img" />
            <div class="result-tag">{{ res.id }}</div>
          </div>
        </div>
        
        <div class="prompt-section">
          <h3>수정 프롬프트 입력</h3>
          <p class="subtitle">결과물이 마음에 들지 않으신가요? 원하는 수정 사항을 입력해보세요.</p>
          <div class="input-with-btn">
            <input type="text" v-model="editPrompt" placeholder="예: 바지 기장을 조금 더 길게 해주세요" class="prompt-input" />
            <button class="btn-secondary" @click="submitPrompt">수정 요청</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input for custom pose -->
    <input type="file" ref="poseInput" hidden accept="image/*" @change="handlePoseUpload" />

    <!-- Pose Selection Modal -->
    <div v-if="showPoseModal" class="modal-backdrop" @click.self="closePoseModal">
      <div class="modal-content glass">
        <div class="modal-header">
          <h3>{{ activePoseForUpload?.name }} 설정</h3>
          <button class="close-btn" @click="closePoseModal">×</button>
        </div>
        <div class="modal-body">
          <div class="pose-options-section">
            <h4>추천 모델/포즈 선택</h4>
            <div class="example-poses-grid">
              <div 
                v-for="(img, idx) in examplePoses" 
                :key="idx"
                class="example-pose-item"
                @click="selectExamplePose(img)"
              >
                <img :src="img" />
              </div>
            </div>
          </div>
          
          <div class="divider"><span>OR</span></div>
          
          <div class="pose-upload-section">
            <h4>직접 사진 업로드</h4>
            <button class="btn-secondary" style="width: 100%;" @click="$refs.poseInput.click()">
              내 디바이스에서 사진 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const frontImage = ref(null);
const backImage = ref(null);
const generating = ref(false);
const showResults = ref(false);

const poseInput = ref(null);
const activePoseForUpload = ref(null);
const showPoseModal = ref(false);

const editPrompt = ref('');

const poses = ref([
  { id: 'Pose A', name: '정면 기본', desc: '모델이 정면을 응시하는 기본 포즈', type: 'front', customImage: null },
  { id: 'Pose B', name: '정면 측면', desc: '몸을 약간 틀어 역동성을 준 포즈', type: 'front', customImage: null },
  { id: 'Pose C', name: '후면 기본', desc: '뒷모습을 보여주는 기본 포즈', type: 'back', customImage: null },
  { id: 'Pose D', name: '후면 디테일', desc: '등판 디테일을 강조한 포즈', type: 'back', customImage: null },
]);

const examplePoses = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
];

const handleFileUpload = (event, type) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'front') frontImage.value = e.target.result;
      else backImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  // Reset input
  event.target.value = '';
};

const handlePoseClick = (pose) => {
  if (pose.type === 'front' && !frontImage.value) {
    alert('전면 의상 사진을 먼저 업로드해주세요.');
    return;
  }
  if (pose.type === 'back' && !backImage.value) {
    alert('후면 의상 사진을 먼저 업로드해주세요.');
    return;
  }
  
  activePoseForUpload.value = pose;
  showPoseModal.value = true;
};

const closePoseModal = () => {
  showPoseModal.value = false;
  activePoseForUpload.value = null;
};

const selectExamplePose = (imgUrl) => {
  if (activePoseForUpload.value) {
    activePoseForUpload.value.customImage = imgUrl;
  }
  closePoseModal();
};

const handlePoseUpload = (event) => {
  const file = event.target.files?.[0];
  if (file && activePoseForUpload.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      activePoseForUpload.value.customImage = e.target.result;
      closePoseModal();
    };
    reader.readAsDataURL(file);
  }
  event.target.value = '';
};

const generatePoses = () => {
  if (!frontImage.value) return;
  
  generating.value = true;
  // Mock generation delay
  setTimeout(() => {
    generating.value = false;
    showResults.value = true;
  }, 2000);
};

const submitPrompt = () => {
  if (!editPrompt.value.trim()) return;
  generating.value = true;
  setTimeout(() => {
    generating.value = false;
    alert(`프롬프트 "${editPrompt.value}" 반영 완료 (Mock)`);
    editPrompt.value = '';
  }, 1000);
};

const results = computed(() => {
  const list = [
    { id: 'Pose A 결과', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
    { id: 'Pose B 결과', url: 'https://images.unsplash.com/photo-1539109132304-391e55030f9a?w=400' },
  ];
  
  if (backImage.value) {
    list.push(
      { id: 'Pose C 결과', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
      { id: 'Pose D 결과', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' }
    );
  }
  
  return list;
});
</script>

<style scoped>
.studio-fitting-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 992px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

.upload-card, .guide-card, .result-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-main);
}

.card-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.upload-areas {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.upload-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.drop-zone {
  aspect-ratio: 16/9;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--transition);
  background: transparent;
}

.drop-zone:hover:not(.has-image) {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.02);
}

.drop-zone.has-image {
  border-style: solid;
  border-color: var(--border-color);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.upload-placeholder .icon {
  font-size: 2rem;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--input-bg);
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  background: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.badge-warning {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}

.guide-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.pose-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pose-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pose-thumb {
  aspect-ratio: 3/4;
  background: var(--input-bg);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
}

.pose-item:not(.disabled) .pose-thumb:hover {
  border-color: var(--primary-color);
}

.silhouette-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(139, 92, 246, 0.01));
  color: var(--text-muted);
}

.silhouette-placeholder .icon {
  font-size: 3rem;
  opacity: 0.5;
}

.pose-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.pose-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 10;
}

.pose-info {
  display: flex;
  flex-direction: column;
}

.pose-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.pose-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.result-img-wrapper {
  aspect-ratio: 3/4;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.result-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  padding: 20px 15px 10px;
  font-weight: 700;
}

.prompt-section {
  background: var(--input-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.prompt-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.prompt-section .subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.input-with-btn {
  display: flex;
  gap: 1rem;
}

.prompt-input {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.prompt-input:focus {
  border-color: var(--primary-color);
}

.btn-secondary {
  background: transparent;
  color: var(--text-main);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--text-main);
}

.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

:root[data-theme="light"] .modal-content {
  background: rgba(255, 255, 255, 0.95);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pose-options-section h4,
.pose-upload-section h4 {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: var(--text-main);
}

.example-poses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.example-pose-item {
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.example-pose-item:hover {
  border-color: var(--primary-color);
}

.example-pose-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 1rem;
}
</style>
