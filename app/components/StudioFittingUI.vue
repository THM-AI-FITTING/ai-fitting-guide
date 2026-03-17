<template>
  <div class="studio-redesign-container">
    <!-- Top API Key Section (Matches Personal Tab) -->
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
    
    <div class="studio-body-layout">
      <!-- Left Sidebar: Controls -->
      <div class="studio-sidebar-v2">
        <div class="sidebar-content-v2">
          <!-- Clothing Upload Row (Top & Bottom) -->
          <section class="control-group">
            <div class="group-header">
              <label class="group-title">의류 업로드</label>
            </div>
            
            <div class="upload-slots-row">
              <!-- Top Upload -->
              <div class="upload-area-v2" 
                   :class="{ 'is-disabled': allGenerating, 'dragging': topIsDragging }" 
                   @click="(topImage || allGenerating) ? null : topInput?.click()"
                   @dragover.prevent="topIsDragging = true"
                   @dragleave.prevent="topIsDragging = false"
                   @drop.prevent="onMainDrop($event, 'top')">
                <input type="file" ref="topInput" hidden accept="image/*" @change="handleFileUpload($event, 'top')">
                <template v-if="topImage">
                  <div class="image-preview-v2">
                    <img :src="topImage" class="preview-img" />
                    <button v-if="!allGenerating" class="remove-btn-v2" @click.stop="removeImage('top')"><X :size="14" /></button>
                  </div>
                </template>
                <div v-else class="upload-placeholder-v2">
                  <div class="placeholder-icon"><Upload :size="20" /></div>
                  <span>이미지를 클릭 또는 드래그해서<br>업로드하세요</span>
                  <span class="sub-hint">(전면 사진)</span>
                </div>
              </div>

              <!-- Bottom Upload -->
              <div class="upload-area-v2" 
                   :class="{ 'is-disabled': allGenerating, 'dragging': bottomIsDragging }" 
                   @click="(bottomImage || allGenerating) ? null : bottomInput?.click()"
                   @dragover.prevent="bottomIsDragging = true"
                   @dragleave.prevent="bottomIsDragging = false"
                   @drop.prevent="onMainDrop($event, 'bottom')">
                <input type="file" ref="bottomInput" hidden accept="image/*" @change="handleFileUpload($event, 'bottom')">
                <template v-if="bottomImage">
                  <div class="image-preview-v2">
                    <img :src="bottomImage" class="preview-img" />
                    <button v-if="!allGenerating" class="remove-btn-v2" @click.stop="removeImage('bottom')"><X :size="14" /></button>
                  </div>
                </template>
                <div v-else class="upload-placeholder-v2">
                  <div class="placeholder-icon"><Upload :size="20" /></div>
                  <span>이미지를 클릭 또는 드래그해서<br>업로드하세요</span>
                  <span class="sub-hint">(후면 사진)</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Model Pose Selection -->
          <section class="control-group">
            <div class="group-header custom-header-row">
              <label class="group-title">모델 포즈 선택</label>
            </div>

            <div class="pose-tabs-v2" :class="{ 'is-disabled': allGenerating }">
              <button v-for="t in genderTabs" :key="t.id"
                      class="pose-tab" :class="{ active: currentGender === t.id }"
                      :disabled="allGenerating"
                      @click="currentGender = t.id">
                {{ t.name }}
              </button>
            </div>

            <div class="pose-grid-v2">
              <template v-if="currentGender !== 'custom'">
                <div 
                  v-for="p in filteredPoses" 
                  :key="p.id + '-' + p.productType" 
                  class="pose-card-v2"
                  :class="{ 
                    'active': selectedPoseIds.includes(p.id + '-' + p.productType),
                    'disabled-card': !isPoseClickable(p.type) || allGenerating
                  }"
                  @click="(isPoseClickable(p.type) && !allGenerating) ? togglePoseSelection(p.id + '-' + p.productType) : null"
                  @mouseenter="setHoveredPose($event, p)"
                  @mouseleave="clearHoveredPose"
                >
                  <div class="pose-thumb-v2">
                    <img :src="p.customPersonUrl || getSampleImageUrl(p.id, p.productType)" :alt="p.name" />
                    <button 
                      class="model-change-btn" 
                      :disabled="allGenerating"
                      @click.stop="modalActivePoseId = p.id; modalActiveProductType = p.productType; isCustomModelModalOpen = true"
                    >
                      <span>모델 변경</span>
                    </button>
                    <div v-if="p.status === 'processing' || p.status === 'pending'" class="pose-loading-overlay">
                      <div class="mini-spinner"></div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Custom Model Upload UI -->
              <template v-else>
                <div v-if="customModels.length === 0" 
                     class="custom-upload-full"
                     :class="{ 'dragging': modalIsDragging }"
                     @dragover.prevent="modalIsDragging = true"
                     @dragleave.prevent="modalIsDragging = false"
                     @drop.prevent="onCustomDrop($event); modalIsDragging = false"
                     @click="customFileInput?.click()">
                  <input type="file" ref="customFileInput" hidden accept="image/*" multiple @change="handleCustomModelUpload">
                  <div class="upload-icon-circle"><Upload :size="32" /></div>
                  <p class="upload-msg">이미지를 클릭 또는 드래그해서<br>업로드하세요.</p>
                  <p class="upload-sub">JPG/PNG형식, 파일크기 20MB이하</p>
                </div>

                <template v-else>
                  <div v-for="m in customModels" :key="m.id" 
                       class="custom-model-card"
                       :class="{ 'active': selectedCustomModelId === m.id, 'generating': allGenerating }"
                       @click="!allGenerating ? selectedCustomModelId = m.id : null"
                       @mouseenter="setHoveredCustom($event, m)"
                       @mouseleave="clearHoveredPose">
                    <img :src="m.url" class="custom-model-img" />
                    <button v-if="!allGenerating" class="remove-custom-btn" @click.stop="removeCustomModel(m.id)">
                      <X :size="12" />
                    </button>
                  </div>
                  <!-- Add Button -->
                  <div class="custom-model-add-card" :class="{ 'is-disabled': allGenerating }" @click="!allGenerating ? customFileInput?.click() : null">
                    <input type="file" ref="customFileInput" hidden accept="image/*" multiple @change="handleCustomModelUpload">
                    <Upload :size="24" />
                  </div>
                </template>
              </template>
            </div>
          </section>

          <!-- Prompt Input -->
          <section class="control-group prompt-group">
            <div class="group-header">
              <label class="group-title">생성 옵션 (프롬프트)</label>
            </div>
            <textarea 
              v-model="promptText" 
              class="modern-textarea" 
              :disabled="allGenerating"
              placeholder="예: 실크 소재의 느낌을 살려줘, 배경을 더 밝게 해줘 등"
            ></textarea>
          </section>
        </div>

        <div class="sidebar-footer-v2">
          <div class="generation-options-v2 row-layout" :class="{ 'is-disabled': allGenerating }">
            <div class="popover-wrapper" style="flex: 5;" v-click-outside="() => activePopover = null">
              <button 
                class="popover-trigger-btn" 
                :class="{ active: activePopover === 'model', 'is-disabled': allGenerating }"
                :disabled="allGenerating"
                @click.stop="activePopover = activePopover === 'model' ? null : 'model'"
              >
                <span class="trigger-label">{{ modelOptions.find(m => m.value === selectedModel)?.label }}</span>
                <ChevronDown :size="14" class="chevron" />
              </button>

              <Transition name="popover-fade">
                <div v-if="activePopover === 'model'" class="popover-content quality-popover shadow-premium" @click.stop>
                  <div class="popover-header">모델 선택</div>
                  <div class="quality-list-v2">
                    <button 
                      v-for="m in modelOptions" :key="m.value"
                      class="quality-option-item"
                      :class="{ active: selectedModel === m.value }"
                      @click="selectedModel = m.value; activePopover = null"
                    >
                      <span>{{ m.label }}</span>
                      <Check v-if="selectedModel === m.value" :size="14" />
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <div class="popover-wrapper" style="flex: 3;" v-click-outside="() => activePopover = null">
              <button 
                class="popover-trigger-btn" 
                :class="{ active: activePopover === 'quality', 'is-disabled': isQualityDisabled || allGenerating }"
                :disabled="isQualityDisabled || allGenerating"
                @click.stop="activePopover = activePopover === 'quality' ? null : 'quality'"
              >
                <span class="trigger-label">{{ qualityOptions.find(q => q.value === selectedQuality)?.label || (isQualityDisabled ? '-' : selectedQuality) }}</span>
                <ChevronDown :size="14" class="chevron" />
              </button>

              <Transition name="popover-fade">
                <div v-if="activePopover === 'quality'" class="popover-content quality-popover shadow-premium" @click.stop>
                  <div class="popover-header">품질</div>
                  <div class="quality-list-v2">
                    <button 
                      v-for="q in qualityOptions" :key="q.value"
                      class="quality-option-item"
                      :class="{ active: selectedQuality === q.value }"
                      @click="selectedQuality = q.value; activePopover = null"
                    >
                      <span>{{ q.label }}</span>
                      <Check v-if="selectedQuality === q.value" :size="14" />
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <div class="popover-wrapper" style="flex: 3;" v-click-outside="() => activePopover = null">
              <button 
                class="popover-trigger-btn" 
                :class="{ active: activePopover === 'ratio', 'is-disabled': allGenerating }"
                :disabled="allGenerating"
                @click.stop="activePopover = activePopover === 'ratio' ? null : 'ratio'"
              >
                <span class="trigger-label">{{ aspectRatios.find(r => r.value === selectedAspectRatio)?.label }}</span>
                <ChevronDown :size="14" class="chevron" />
              </button>
              
              <Transition name="popover-fade">
                <div v-if="activePopover === 'ratio'" class="popover-content ratio-popover shadow-premium" @click.stop>
                  <div class="popover-header">화면 비율</div>
                  <div class="ratio-grid-v2">
                    <button 
                      v-for="r in aspectRatios" :key="r.id"
                      class="ratio-card-v2"
                      :class="{ active: selectedAspectRatio === r.value }"
                      @click="selectedAspectRatio = r.value; activePopover = null"
                    >
                      <div class="ratio-icon-box" :class="r.id">
                        <div class="ratio-shape"></div>
                      </div>
                      <span class="ratio-text">{{ r.label }}</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <button 
            class="generate-action-btn"
            :disabled="(!topImage && !bottomImage) || selectedPoseIds.length === 0 || allGenerating"
            @click="generateAllPoses"
          >
            <Sparkles v-if="!allGenerating" :size="20" />
            <div v-else class="mini-spinner-white"></div>
            <span>{{ allGenerating ? '생성 중...' : '지금 생성' }}</span>
          </button>
        </div>
      </div>

      <!-- Right Main Content -->
      <div class="studio-main-v2">
        <div class="main-layout-v2">
          <!-- Result Preview -->
          <div class="preview-stage-v2">
            <div class="preview-card-v2 shadow-premium" :class="{ 'generating-vibe': allGenerating }">
              <div class="slider-header-v2">
                <div class="pose-view-selector-v2">
                  <button 
                    v-for="p in uniquePoseTabs" 
                    :key="p.id"
                    class="view-tab"
                    :class="{ active: viewingPoseId === p.id }"
                    :disabled="!hasHistoryOrIsDone(p.id)"
                    @click="viewingPoseId = p.id"
                  >
                    {{ p.name }}
                  </button>
                </div>
              </div>

              <div v-if="historyList.length > 0" class="result-image-wrapper">
                <div 
                  ref="slideContentRef"
                  class="slider-container-v2"
                  :class="{ 'dragging': isDragging }"
                  @mousedown="onDragStart"
                  @mousemove="onDragMove"
                  @mouseup="onDragEnd"
                  @mouseleave="onDragEnd"
                >
                  <div 
                    class="slider-track-v2" 
                    :style="{ 
                      transform: sliderTransform,
                      transition: isTransitioning ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                    }"
                  >
                    <div v-for="(item, idx) in historyList" :key="idx" class="slide-item-v2">
                      <div class="img-inner-wrap">
                        <div class="img-relative-box" :class="{ 'is-loading-card': item.status !== 'done' }">
                        <template v-if="item.status === 'done'">
                          <img :src="item.url" :key="item.url" class="result-img animate-fade-in" draggable="false" />
                          <div class="result-hover-actions">
                            <button class="hover-action-btn" @click.stop="viewingHistoryUrl = item.url; isImageViewerOpen = true">
                              <Search :size="18" />
                              <span class="btn-label">확대</span>
                            </button>
                            <button class="hover-action-btn wand-btn" @click.stop="setAsBaseImage(item.url)">
                              <Wand2 :size="18" />
                              <span class="btn-label">재생성</span>
                            </button>
                            <button class="hover-action-btn save-btn" @click.stop="downloadImage(item.url)">
                              <Download :size="18" />
                              <span class="btn-label">사진저장</span>
                            </button>
                          </div>
                        </template>
                        <template v-else-if="item.status === 'processing' || item.status === 'pending'">
                          <div class="inline-loader-content">
                            <div class="radiant-loader mini"></div>
                            <p class="loader-text-mini">디자인 중...</p>
                          </div>
                        </template>
                        <template v-else-if="item.status === 'error'">
                          <div class="error-card-content">
                            <AlertCircle :size="32" class="error-icon" />
                            <p class="error-text">생성 실패</p>
                          </div>
                        </template>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button v-if="currentSlideIndex > 0" class="slider-nav-btn prev" @click="prevSlide">
                    <ChevronLeft :size="24" />
                  </button>
                  <button v-if="currentSlideIndex < historyList.length - 1" class="slider-nav-btn next" @click="nextSlide">
                    <ChevronRight :size="24" />
                  </button>

                  <div v-if="historyList.length > 1" class="slider-pagination-v2">
                    <span v-for="(_, idx) in historyList" :key="idx" 
                          class="pagination-dot" :class="{ active: idx === currentSlideIndex }"
                          @click="currentSlideIndex = idx"></span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-preview-v2">
                <div class="empty-overlay">
                  <p class="empty-hint">비어 있음</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <Transition name="fade-fast">
        <div v-if="isImageViewerOpen" class="image-viewer-overlay" @click="isImageViewerOpen = false">
          <div class="image-viewer-layout" @click.stop>
            <button class="viewer-close-btn" @click="isImageViewerOpen = false"><X :size="28" /></button>
            <div class="image-viewer-main" @click="isImageViewerOpen = false">
              <div 
                class="viewer-img-container" 
                :class="{ 'is-zoomed': isExtraZoomed }" 
                @click.stop="handleZoom($event)"
                :style="{ transformOrigin: zoomOrigin }"
              >
                <img v-if="viewingHistoryUrl || displayImageUrl" :src="viewingHistoryUrl || displayImageUrl || undefined" class="viewer-img" />
              </div>
            </div>

            <!-- Side Panel Metadata -->
            <div v-if="currentMetadata" class="viewer-side-panel">
              <div class="side-panel-header">
                <Sparkles :size="16" class="text-indigo-400" />
                <span>데이터 정보</span>
              </div>

              <!-- Source Previews (Matched with Admin) -->
              <div v-if="currentMetadata?.productImageUrl || currentMetadata?.personImageUrl" class="source-previews-section">
                <div v-if="currentMetadata.productImageUrl" class="source-preview-item">
                  <img :src="currentMetadata.productImageUrl" />
                  <span>상품</span>
                </div>
                <div v-if="currentMetadata.personImageUrl" class="source-preview-item">
                  <img :src="currentMetadata.personImageUrl" />
                  <span>인물</span>
                </div>
              </div>

              <div class="meta-section">
                <div class="meta-row model-info">
                  <span class="meta-label">생성 모델</span>
                  <div class="meta-value-group">
                    <span class="meta-value">{{ currentMetadata.model || '-' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="meta-section">
                <div class="meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">화면 비율</span>
                    <span class="meta-value">{{ currentMetadata.aspectRatio || '-' }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">요청 해상도</span>
                    <span class="meta-value">{{ currentMetadata.imageSize || '-' }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">실제 해상도</span>
                    <span class="meta-value">
                      <template v-if="actualImageMeta.width > 0">
                        {{ actualImageMeta.width }} x {{ actualImageMeta.height }}
                      </template>
                      <template v-else>계산 중...</template>
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">파일 크기</span>
                    <span class="meta-value">
                      <template v-if="actualImageMeta.sizeKb > 0">
                        {{ actualImageMeta.sizeKb >= 1024 ? (actualImageMeta.sizeKb / 1024).toFixed(2) + ' MB' : actualImageMeta.sizeKb + ' KB' }}
                      </template>
                      <template v-else-if="actualImageMeta.sizeKb === -1">알 수 없음</template>
                      <template v-else>계산 중...</template>
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">요청 사용자</span>
                    <span class="meta-value">{{ currentMetadata.userId || '-' }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">생성 일시</span>
                    <span class="meta-value">{{ currentMetadata.sysRegDtm || '-' }}</span>
                  </div>
                  <div class="meta-item full-width mt-4">
                    <span class="meta-label">입력 프롬프트</span>
                    <div class="prompt-display">
                      {{ currentMetadata.prompt || '입력된 프롬프트 없음' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Alert Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="alertModal.show" class="alert-overlay-modern" @click="alertModal.show = false">
          <div class="alert-content-modern" @click.stop>
            <div class="alert-icon-box" :class="alertModal.type">
              <AlertCircle v-if="alertModal.type === 'error'" :size="32" />
              <Check v-else :size="32" />
            </div>
            <h3>{{ alertModal.title }}</h3>
            <p>{{ alertModal.message }}</p>
            <button class="alert-close-btn" @click="alertModal.show = false">확인</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toastVisible" class="modern-toast">
          <div class="toast-icon"><Check :size="16" /></div>
          <span class="toast-text">{{ toastMsg }}</span>
        </div>
      </Transition>
    </Teleport>

    <!-- Custom Model Selection Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isCustomModelModalOpen" class="alert-overlay-modern" @click="isCustomModelModalOpen = false">
          <div class="custom-model-modal" @click.stop>
            <div class="modal-header-v2">
              <h3>커스텀 모델 선택</h3>
              <button class="modal-close-v2" @click="isCustomModelModalOpen = false"><X :size="20" /></button>
            </div>
            <div class="modal-body-v2">
              <div v-if="activePoseHistory.length > 0" class="model-slider-wrapper">
                <div class="model-grid-v2">
                  <div 
                    v-for="(h, idx) in activePoseHistory" 
                    :key="idx" 
                    class="model-selection-card"
                    @click="selectCustomModel(h.url)"
                  >
                    <div class="model-thumb">
                      <img :src="h.url" :alt="h.name" />
                    </div>
                    <span class="model-name">{{ h.name }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-history-v2">
                <ImageIcon :size="48" />
                <p>재생성을 위한 생성 내역이 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Pose Preview Tooltip -->
    <Teleport to="body">
      <Transition name="preview-pop">
        <div v-if="hoveredPoseData" class="pose-preview-tooltip" :style="hoverTooltipStyle">
          <div class="preview-tooltip-inner">
            <div class="preview-img-box">
              <img :src="hoveredPoseData.url" alt="Pose Preview" />
            </div>
            <div class="preview-info">
              <span class="pose-name">{{ hoveredPoseData.name }}</span>
              <span class="pose-desc">{{ hoveredPoseData.type === 'front' ? '전면 포즈' : '후면 포즈' }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { 
  Upload, X, Sparkles, Download, ChevronRight, ChevronLeft, ChevronDown, Check, AlertCircle, ImageIcon, Search, Wand2, Key
} from 'lucide-vue-next';
import { useRuntimeConfig, useCookie } from '#app';

// --- State ---
const currentGender = ref('female');
const promptText = ref('');
const selectedAspectRatio = ref('3:4');
const selectedQuality = ref('1K');
const selectedModel = ref('gemini-2.5-flash-image');
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const activePopover = ref<string | null>(null);
const poseGroupId = ref(crypto.randomUUID());
const apiKey = ref('');
const showApiKeyError = ref(false);
const apiKeyInput = ref<HTMLInputElement | null>(null);

const topInput = ref<HTMLInputElement | null>(null);
const bottomInput = ref<HTMLInputElement | null>(null);

const topImage = ref<string | null>(null);
const bottomImage = ref<string | null>(null);
const selectedFiles = reactive<{ top: File | null, bottom: File | null }>({ top: null, bottom: null });

const topIsDragging = ref(false);
const bottomIsDragging = ref(false);
const modalIsDragging = ref(false);
const customFileInput = ref<HTMLInputElement | null>(null);

const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) binding.value();
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) { document.removeEventListener('click', el.clickOutsideEvent); },
};

const aspectRatios = computed(() => [
  { id: 'auto', label: '자동', value: 'auto' },
  { id: 'r1x1', label: '1:1', value: '1:1' },
  { id: 'r3x4', label: '3:4', value: '3:4' },
  { id: 'r2x3', label: '2:3', value: '2:3' },
]);

const modelOptions = [
  { label: '🍌 Nano Banana 2', value: 'gemini-3.1-flash-image-preview' },
  { label: '🍌 Nano Banana Pro', value: 'gemini-3-pro-image-preview' },
  { label: '🍌 Nano Banana', value: 'gemini-2.5-flash-image' },
];

const qualityOptions = computed(() => {
  const base = [
    { label: '1K', value: '1K' },
    { label: '2K', value: '2K' },
    { label: '4K', value: '4K' },
  ];
  if (selectedModel.value === 'gemini-3.1-flash-image-preview' || selectedModel.value === 'gemini-3-pro-image-preview') return base;
  return [{ label: '1K', value: '1K' }, { label: '2K', value: '2K' }];
});

const isQualityDisabled = computed(() => selectedModel.value !== 'gemini-3.1-flash-image-preview' && selectedModel.value !== 'gemini-3-pro-image-preview');

const STUDIO_UPLOAD_URL = 'https://wvoq4gq3ui.execute-api.ap-northeast-2.amazonaws.com/dev/studio/upload';
const STUDIO_RESULT_URL = 'https://wvoq4gq3ui.execute-api.ap-northeast-2.amazonaws.com/dev/studio/result';
const selectedPoseIds = ref<string[]>([]);
const viewingPoseId = ref('A');
const viewingHistoryUrl = ref<string | null>(null);

// --- Pose State Definitions ---
type JobStatus = 'idle' | 'pending' | 'processing' | 'done' | 'error' | 'failed';
interface PoseState {
  id: string;
  name: string;
  type: 'front' | 'back' | 'CUSTOM';
  gender: string;
  status: JobStatus;
  resultUrl: string | null;
  requestId: string | null;
  customPersonUrl: string | null;
  retryCount: number;
  productType: string;
}

const poseStates = reactive<PoseState[]>([]);

const fetchPoses = async () => {
  try {
    const res = await fetch(`${apiBase}/api/studio/samples`);
    if (res.ok) {
      const keys: string[] = await res.json();
      const dynamicPoses: PoseState[] = [];
      
      keys.forEach(key => {
        const filename = key.split('/').pop() || '';
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        const parts = nameWithoutExt.split('-');
        
        if (parts.length >= 3) {
          const gender = parts[0]?.toLowerCase() || 'female';
          const pt = parts[1] || 'base';
          const suffix = parts[2] || '';
          
          const suffixParts = suffix.split('_');
          const direction = suffixParts[0]?.toLowerCase() || 'front';
          const poseId = suffixParts.length > 1 ? suffixParts[1]?.toUpperCase() || 'A' : 'A';
          
          const genderName = gender === 'female' ? '여성' : gender === 'male' ? '남성' : '마네킹';
          
          dynamicPoses.push({
            id: poseId,
            name: `${genderName} ${poseId} (${pt})`,
            type: direction === 'front' ? 'front' : 'back',
            gender: gender,
            status: 'idle',
            resultUrl: null,
            requestId: null,
            customPersonUrl: null,
            retryCount: 0,
            productType: pt
          });
        }
      });

      // Add Custom item
      dynamicPoses.push({ 
        id: 'E', name: '맞춤형', type: 'CUSTOM' as const, gender: 'custom', 
        status: 'idle' as JobStatus, resultUrl: null, requestId: null, 
        customPersonUrl: null, retryCount: 0, productType: 'base' 
      });

      // Update poseStates
      poseStates.splice(0, poseStates.length, ...dynamicPoses);
      
      // Update viewingPoseId if current one is not in the new list
      if (!dynamicPoses.some(p => p.id === viewingPoseId.value && p.gender === currentGender.value)) {
          const firstAvailable = dynamicPoses.find(p => p.gender === currentGender.value);
          if (firstAvailable) viewingPoseId.value = firstAvailable.id;
      }
    }
  } catch (e) {
    console.error('[Studio] Failed to fetch dynamic poses:', e);
  }
};

onMounted(() => {
  fetchPoses();
});

const uniquePoseTabs = computed(() => {
  const ids = Array.from(new Set(poseStates.map(p => p.id))).sort();
  // Ensure 'E' is always at the end if it exists
  const sortedIds = ids.filter(id => id !== 'E');
  if (ids.includes('E')) sortedIds.push('E');
  
  return sortedIds.map(id => ({
    id,
    name: id === 'E' ? '맞춤형' : id
  }));
});

// --- Custom Models State ---
const customModels = ref<{ id: string, url: string, file?: File, s3Key?: string }[]>([]);
const selectedCustomModelId = ref<string | null>(null);
const isCustomModelModalOpen = ref(false);
const modalActivePoseId = ref<string | null>(null);
const modalActiveProductType = ref<string | null>(null);

// --- History State ---
interface HistoryItem {
  poseId: string;
  gender: string;
  url: string;
  requestId: string;
  model?: string;
  aspectRatio?: string;
  imageSize?: string;
  userId?: string;
  sysRegDtm?: string;
  prompt?: string;
  productImageUrl?: string;
  personImageUrl?: string;
}
const cumulativeHistory = ref<HistoryItem[]>([]);

const toastVisible = ref(false);
const toastMsg = ref('');

const alertModal = reactive({
  show: false,
  type: 'info' as 'info' | 'error',
  title: '',
  message: '',
});

const actualImageMeta = reactive({ width: 0, height: 0, sizeKb: 0 });
const isImageViewerOpen = ref(false);
const isExtraZoomed = ref(false);
const zoomOrigin = ref('50% 50%');

const handleZoom = (e: MouseEvent) => {
  if (!isExtraZoomed.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    zoomOrigin.value = `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`;
    isExtraZoomed.value = true;
  } else isExtraZoomed.value = false;
};

watch(isImageViewerOpen, async (val) => {
  if (!val) {
    isExtraZoomed.value = false;
    zoomOrigin.value = '50% 50%';
    actualImageMeta.width = 0;
    actualImageMeta.height = 0;
    actualImageMeta.sizeKb = 0;
  } else {
    const targetUrl = viewingHistoryUrl.value || displayImageUrl.value;
    if (targetUrl) {
      const img = new Image();
      img.onload = () => {
        actualImageMeta.width = img.width;
        actualImageMeta.height = img.height;
      };
      img.src = targetUrl;
      // Actual file size fetch
      try {
        const h = await fetch(targetUrl, { method: 'HEAD' });
        const size = h.headers.get('content-length');
        if (size) actualImageMeta.sizeKb = Math.round(parseInt(size) / 1024);
        else actualImageMeta.sizeKb = -1;
      } catch(e) { actualImageMeta.sizeKb = -1; }
    }
  }
});

const genderTabs = [
  { id: 'female', name: '여성' },
  { id: 'male', name: '남성' },
  { id: 'custom', name: '맞춤형' }
];

const filteredPoses = computed(() => poseStates.filter(p => p.gender === currentGender.value));
const selectedPose = computed(() => filteredPoses.value.find(p => p.id === viewingPoseId.value) || filteredPoses.value[0]);

const historyList = computed(() => {
  const list = cumulativeHistory.value
    .filter(h => h.poseId === viewingPoseId.value)
    .map(h => ({ 
      ...h,
      status: 'done' as JobStatus,
      current: viewingHistoryUrl.value ? h.url === viewingHistoryUrl.value : h.url === displayImageUrl.value,
    }));

  if (selectedPose.value && (selectedPose.value.status === 'pending' || selectedPose.value.status === 'processing')) {
    list.push({
      url: '',
      status: selectedPose.value.status,
      current: false,
      model: selectedModel.value,
      aspectRatio: selectedAspectRatio.value,
      imageSize: selectedQuality.value,
      userId: '',
      sysRegDtm: '-',
      prompt: '',
      poseId: selectedPose.value.id,
      gender: currentGender.value,
      requestId: ''
    });
  }
  return list;
});

const activePoseHistory = computed(() => {
  if (!modalActivePoseId.value || !modalActiveProductType.value) return [];
  const defaultModel = {
    name: '기본 모델',
    url: getSampleImageUrl(modalActivePoseId.value, modalActiveProductType.value),
    isDefault: true
  };
  const history = cumulativeHistory.value
    .filter(h => h.poseId === modalActivePoseId.value && h.gender === currentGender.value)
    .map((h, idx) => ({ name: `생성 결과 ${idx + 1}`, url: h.url, isDefault: false }))
    .reverse();
  return [defaultModel, ...history];
});

const displayImageUrl = computed(() => selectedPose.value?.status === 'done' ? selectedPose.value.resultUrl : null);
const allGenerating = computed(() => poseStates.some(p => p.status === 'pending' || p.status === 'processing'));

const isPoseClickable = (type: string) => {
  if (currentGender.value === 'custom') return (!!topImage.value || !!bottomImage.value) && !!selectedCustomModelId.value;
  return (type === 'front' ? !!topImage.value : !!bottomImage.value);
};
const hasHistoryOrIsDone = (id: string) => { 
  const p = filteredPoses.value.find(x => x.id === id); 
  if (p?.status === 'done' || p?.resultUrl) return true;
  return cumulativeHistory.value.some(h => h.poseId === id); // Removed gender filter
};

const hoveredPoseData = ref<any>(null);
const hoverTooltipStyle = reactive({ top: '0px', left: '0px' });
const setHoveredPose = (e: MouseEvent, p: any) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  hoverTooltipStyle.top = `${rect.top}px`; hoverTooltipStyle.left = `${rect.right + 20}px`;
  hoveredPoseData.value = { ...p, url: p.customPersonUrl || getSampleImageUrl(p.id, p.productType) };
};

const setHoveredCustom = (e: MouseEvent, m: any) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  hoverTooltipStyle.top = `${rect.top}px`; hoverTooltipStyle.left = `${rect.right + 20}px`;
  hoveredPoseData.value = { id: 'custom', name: '맞춤형 모델', type: 'CUSTOM', url: m.url };
};

const clearHoveredPose = () => hoveredPoseData.value = null;

const resizeImage = (file: File, maxDim = 2048): Promise<{ file: File, url: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height *= maxDim / width; width = maxDim; }
          else { width *= maxDim / height; height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve({ file: resizedFile, url: canvas.toDataURL('image/jpeg', 0.9) });
          } else resolve({ file, url: e.target?.result as string });
        }, 'image/jpeg', 0.9);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const handleSingleFileUpload = async (file: File, type: 'top' | 'bottom') => {
  const { file: resizedFile, url } = await resizeImage(file);
  if (type === 'top') { topImage.value = url; selectedFiles.top = resizedFile; }
  else { bottomImage.value = url; selectedFiles.bottom = resizedFile; }
};

const onCustomDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (files) processCustomFiles(Array.from(files));
};

const handleCustomModelUpload = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files) processCustomFiles(Array.from(files));
};

const processCustomFiles = (files: File[]) => {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const id = crypto.randomUUID();
      customModels.value.push({ id, url: ev.target?.result as string, file });
      if (!selectedCustomModelId.value) selectedCustomModelId.value = id;
    };
    reader.readAsDataURL(file);
  });
};

const removeCustomModel = (id: string) => {
  const idx = customModels.value.findIndex(m => m.id === id);
  if (idx > -1) {
    customModels.value.splice(idx, 1);
    if (selectedCustomModelId.value === id) selectedCustomModelId.value = customModels.value[0]?.id || null;
  }
};

const onMainDrop = (e: DragEvent, type: 'top' | 'bottom') => {
  topIsDragging.value = false;
  bottomIsDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) handleSingleFileUpload(file, type);
};

const handleFileUpload = (e: Event, type: 'top' | 'bottom') => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleSingleFileUpload(file, type);
};

const removeImage = (type: 'top' | 'bottom') => { if (type === 'top') { topImage.value = null; selectedFiles.top = null; } else { bottomImage.value = null; selectedFiles.bottom = null; } };
const togglePoseSelection = (uniqueId: string) => {
  const idx = selectedPoseIds.value.indexOf(uniqueId);
  if (idx > -1) selectedPoseIds.value.splice(idx, 1);
  else selectedPoseIds.value.push(uniqueId);
};

const getSampleImageUrl = (poseId: string, pt: string) => {
  const pose = poseStates.find(p => p.id === poseId && p.productType === pt && p.gender === currentGender.value);
  if (!pose) return '';
  const typeStr = pose.type === 'front' ? 'front' : 'rear';
  return `https://ai-fitting-studio-images.s3.ap-northeast-2.amazonaws.com/sample/${currentGender.value}-${pt}-${typeStr}_${poseId.toLowerCase()}.jpg`;
};

const sliderTransform = computed(() => `translateX(${-currentSlideIndex.value * 52 + 25}%)`);
const currentSlideIndex = ref(0);
const isDragging = ref(false);
const isTransitioning = ref(true);
const onDragStart = () => {}; const onDragMove = () => {}; const onDragEnd = () => {};
const prevSlide = () => { if(currentSlideIndex.value > 0) currentSlideIndex.value--; };
const nextSlide = () => { if(currentSlideIndex.value < historyList.value.length - 1) currentSlideIndex.value++; };

const showToast = (msg: string) => { toastMsg.value = msg; toastVisible.value = true; setTimeout(() => toastVisible.value = false, 3000); };
const setAsBaseImage = (url: string) => { const p = poseStates.find(x => x.id === viewingPoseId.value && x.gender === currentGender.value); if(p){ p.customPersonUrl = url; showToast('베이스 이미지로 설정'); } };
const downloadImage = async (url: string) => window.open(url, '_blank');
const selectCustomModel = (url: string) => { 
  const p = poseStates.find(x => 
    x.id === modalActivePoseId.value && 
    x.gender === currentGender.value && 
    x.productType === modalActiveProductType.value
  ); 
  if(p){ 
    p.customPersonUrl = url; 
    isCustomModelModalOpen.value = false; 
  } 
};

const currentMetadata = computed(() => {
  if (viewingHistoryUrl.value) return historyList.value.find(h => h.url === viewingHistoryUrl.value) || null;
  const currentSlide = historyList.value[currentSlideIndex.value];
  if (currentSlide && currentSlide.url) return currentSlide;
  const meta = cumulativeHistory.value.find(h => h.url === selectedPose.value?.resultUrl);
  if (meta) return meta;
  return null;
});

let pollTimer: any = null;
const startPolling = () => { if (!pollTimer) pollTimer = setInterval(fetchJobStatuses, 3000); };
const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } };

const extractS3Key = (url: string | null) => {
  if (!url || !url.startsWith('http')) return url;
  try {
    const path = new URL(url).pathname;
    return path.startsWith('/') ? path.substring(1) : path;
  } catch(e) { return url; }
};

const pollSinglePose = async (pose: PoseState) => {
  if (!pose.requestId) return;
  try {
    const res = await fetch(`${STUDIO_RESULT_URL}?requestId=${pose.requestId}`, {
      headers: { 'x-api-key': apiKey.value }
    });
    if (!res.ok) return;
    const data = await res.json();
    const s = (data.status || '').toUpperCase();

    if (s === 'DONE' || s === 'COMPLETED' || s === 'SUCCESS') {
      const wasNotDone = pose.status !== 'done';
      pose.status = 'done';
      const resultUrl = data.resultUrl || data.resultImageUrl;

      if (wasNotDone && resultUrl) {
        showToast(`${pose.id} 포즈 이미지 생성이 완료되었습니다.`);
        if (currentGender.value === pose.gender) {
          viewingPoseId.value = pose.id;
          viewingHistoryUrl.value = null;
          nextTick(() => {
            currentSlideIndex.value = historyList.value.length - 1;
          });
        }
      }

      if (resultUrl) {
        pose.resultUrl = resultUrl;
        if (!cumulativeHistory.value.find(h => h.requestId === pose.requestId)) {
          cumulativeHistory.value.push({
            poseId: pose.id,
            gender: pose.gender,
            url: resultUrl,
            requestId: pose.requestId!,
            model: data.model || selectedModel.value,
            aspectRatio: data.aspectRatio || selectedAspectRatio.value,
            imageSize: data.imageSize || selectedQuality.value,
            userId: data.userId || '',
            sysRegDtm: data.sysRegDtm || new Date().toISOString(),
            prompt: data.prompt || promptText.value,
            productImageUrl: data.productImageUrl,
            personImageUrl: data.personImageUrl
          });
        }
      }
    } else if (s === 'FAILED' || s === 'ERROR' || s === 'BLOCKED') {
      if (pose.retryCount < 1) {
        pose.retryCount++;
        pose.status = 'pending';
        retrySinglePose(pose);
      } else {
        pose.status = 'error';
        showToast(`${pose.id} 포즈 이미지 생성에 실패했습니다.`);
      }
    } else {
      pose.status = 'processing';
    }
  } catch (e) {
    console.error(`[Studio] Poll error for ${pose.id}:`, e);
  }
};

const fetchJobStatuses = async () => {
  const pendingPoses = poseStates.filter(p => p.requestId && (p.status === 'pending' || p.status === 'processing'));
  if (pendingPoses.length === 0) return stopPolling();

  // Poll each pending pose individually
  await Promise.all(pendingPoses.map(pose => pollSinglePose(pose)));

  if (!allGenerating.value) stopPolling();
};

const executeJobRequest = async (pose: PoseState, fileToUse?: File | null) => {
  pose.status = 'pending';
  const formData = new FormData();
  formData.append('poseGroupId', poseGroupId.value);
  formData.append('slot', pose.id);
  formData.append('gender', currentGender.value === 'custom' ? 'CUSTOM' : currentGender.value);
  formData.append('productType', pose.productType);

  // 1. Determine Person (File or URL)
  let personValue: any = null;
  if (currentGender.value === 'custom') {
    const m = customModels.value.find(m => m.id === selectedCustomModelId.value);
    if (m) {
      if (m.file) {
        personValue = m.file;
      } else if (m.s3Key) {
        personValue = `https://ai-fitting-studio-images.s3.ap-northeast-2.amazonaws.com/${m.s3Key}`;
      }
    }
  } else {
    // If it's a sample model, send the full S3 URL so the backend can download it
    personValue = pose.customPersonUrl || getSampleImageUrl(pose.id, pose.productType);
  }

  if (personValue) {
    formData.append('person', personValue);
  }

  // 2. Determine Product (File)
  const productFile = fileToUse ?? (pose.type === 'front' ? selectedFiles.top : selectedFiles.bottom) ?? selectedFiles.top ?? selectedFiles.bottom;
  if (productFile) {
    formData.append('product', productFile);
  }

  // 3. Other Settings
  formData.append('prompt', promptText.value);
  formData.append('aspectRatio', selectedAspectRatio.value);
  formData.append('imageSize', selectedQuality.value);
  formData.append('model', selectedModel.value);

  console.log('[Studio] Sending Job Request:', Object.fromEntries(formData.entries()));

  try {
    const res = await fetch(STUDIO_UPLOAD_URL, { method: 'POST', body: formData, headers: { 'x-api-key': apiKey.value } });
    if (res.ok) {
      const data = await res.json();
      pose.requestId = data.requestId;
      startPolling();
    } else {
      if (pose.retryCount < 1) {
        pose.retryCount++;
        executeJobRequest(pose, productFile);
      } else {
        pose.status = 'error';
        showToast(`${pose.id} 포즈 이미지 생성에 실패했습니다.`);
      }
    }
  } catch (e) {
    if (pose.retryCount < 1) {
      pose.retryCount++;
      executeJobRequest(pose, productFile);
    } else {
      pose.status = 'error';
      showToast(`${pose.id} 포즈 이미지 생성 중 오류가 발생했습니다.`);
    }
  }
};

const retrySinglePose = async (pose: PoseState) => {
  let fileToUse: File | null = null;
  if (pose.type === 'front') {
    fileToUse = selectedFiles.top;
  } else {
    fileToUse = selectedFiles.bottom;
  }
  if (!fileToUse) {
    fileToUse = selectedFiles.top || selectedFiles.bottom;
  }
  await executeJobRequest(pose, fileToUse);
};

const generateAllPoses = async () => {
  // API Key 체크
  if (!apiKey.value) {
    showApiKeyError.value = true;
    if (apiKeyInput.value) apiKeyInput.value.focus();
    return;
  }

  if (selectedPoseIds.value.length === 0 || (!selectedFiles.top && !selectedFiles.bottom)) {
    showToast('분석할 의류 이미지와 포즈를 선택해주세요.');
    return;
  }

  // 새 그룹 ID 생성
  poseGroupId.value = ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2)) as `${string}-${string}-${string}-${string}-${string}`;

  for (let i = 0; i < selectedPoseIds.value.length; i++) {
    const uniqueId = selectedPoseIds.value[i];
    if (!uniqueId) continue;
    const [id, pt] = uniqueId.split('-');
    if (!id || !pt) continue;
    const pose = filteredPoses.value.find(p => p.id === id && p.productType === pt);
    if (!pose || !isPoseClickable(pose.type)) continue;

    // 첫 번째 포즈인 경우 해당 포즈 탭으로 전환
    if (i === 0) {
      viewingPoseId.value = id;
    }
    pose.retryCount = 0;

    // 포즈 타입에 따라 알맞은 파일 결정
    let fileToUse: File | null = null;
    if (pose.type === 'front') {
      fileToUse = selectedFiles.top;
    } else {
      fileToUse = selectedFiles.bottom;
    }
    if (!fileToUse) {
      fileToUse = selectedFiles.top || selectedFiles.bottom;
    }

    await executeJobRequest(pose, fileToUse);
  }
};

onUnmounted(() => stopPolling());
</script>

<style scoped>
.studio-redesign-container { 
  display: flex; 
  flex-direction: column; 
  height: calc(100vh - 80px);
  min-height: 900px;
  padding: 0; 
  background: transparent; 
  overflow: hidden; 
  gap: 1.5rem; 
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
.config-panel { padding: 1.2rem 1.5rem; display: flex; width: 100%; }
.input-group { width: 100%; }
.input-group label { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--text-muted); }
.required { color: #ef4444; font-size: 0.7rem; font-weight: 700; }
.input-group input { width: 100%; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.8rem; border-radius: 8px; outline: none; transition: var(--transition); font-size: 16px; }
.input-group input.error { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); animation: shake 0.4s cubic-bezier(.36, .07, .19, .97) both; }

@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }

.studio-body-layout { display: flex; flex: 1; gap: 1.5rem; min-height: 0; height: 100%; overflow: hidden; }
.studio-sidebar-v2 { 
  width: 420px; 
  min-width: 420px; 
  background: var(--surface-color); 
  backdrop-filter: blur(12px); 
  border-radius: 24px; 
  border: 1px solid var(--border-color); 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  height: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.04);
}
.sidebar-content-v2 { flex: 1; overflow-y: auto; padding: 1.75rem; display: flex; flex-direction: column; gap: 2.25rem; }
.sidebar-content-v2::-webkit-scrollbar { width: 6px; }
.sidebar-content-v2::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }

.upload-slots-row {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.control-group { display: flex; flex-direction: column; gap: 1.25rem; }
.group-header { display: flex; align-items: center; justify-content: space-between; }
.group-title { font-size: 0.875rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px; }

.upload-area-v2 { 
  flex: 1;
  aspect-ratio: 1/1; 
  background: var(--input-bg); 
  border: 1.5px dashed var(--border-color); 
  border-radius: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  position: relative; 
  overflow: hidden; 
  transition: var(--transition); 
}
.upload-area-v2:hover:not(.is-disabled), .upload-area-v2.dragging { border-color: var(--primary-color); background: var(--surface-color); }
.upload-area-v2.is-disabled { opacity: 0.5; cursor: not-allowed; }

.placeholder-icon { margin-bottom: 8px; color: var(--text-muted); opacity: 0.6; }
.upload-placeholder-v2 { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 4px; 
  color: var(--text-muted); 
  font-size: 0.75rem; 
  font-weight: 600; 
  text-align: center; 
  padding: 0 10px; 
}

.image-preview-v2 { width: 100%; height: 100%; position: relative; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.remove-btn-v2 { position: absolute; top: 10px; right: 10px; width: 26px; height: 26px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }

.pose-tabs-v2 { display: flex; background: var(--input-bg); padding: 4px; border-radius: 14px; gap: 4px; }
.pose-tab { flex: 1; height: 38px; border-radius: 10px; border: none; background: transparent; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
.pose-tab.active { background: var(--bg-color); color: var(--text-main); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.pose-grid-v2 { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 0.5rem; 
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
}
.pose-grid-v2::-webkit-scrollbar { width: 4px; }
.pose-grid-v2::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

.pose-card-v2 { position: relative; }
.disabled-card { opacity: 0.3; cursor: not-allowed; pointer-events: none; filter: grayscale(0.8); transition: all 0.3s ease; }

.pose-thumb-v2 { aspect-ratio: 1/1.4; background: var(--input-bg); border-radius: 8px; overflow: hidden; position: relative; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
.pose-card-v2.active .pose-thumb-v2 { border-color: #5c7cfa; }
.pose-thumb-v2 img { width: 100%; height: 100%; object-fit: cover; }

.model-change-btn { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; font-weight: 700; color: var(--text-main); opacity: 0; transition: all 0.2s; cursor: pointer; z-index: 5; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.pose-card-v2:hover .model-change-btn { opacity: 1; bottom: 12px; }
.model-change-btn:hover:not(:disabled) { background: var(--surface-color); border-color: var(--primary-color); color: var(--primary-color); }
.model-change-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.studio-main-v2 { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.main-layout-v2 { display: flex; flex: 1; gap: 1.5rem; min-height: 0; }
.preview-stage-v2 { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.preview-card-v2 { flex: 1; background: var(--surface-color); backdrop-filter: blur(12px); border-radius: 28px; border: 1px solid var(--border-color); position: relative; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 50px rgba(0,0,0,0.02); }

.slider-header-v2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem 0.5rem;
  z-index: 20;
}
.pose-view-selector-v2 {
  display: flex;
  background: var(--input-bg);
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  border: 1px solid var(--border-color);
}
.view-tab {
  min-width: 36px;
  width: auto;
  padding: 0 10px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;
}
.view-tab:hover:not(:disabled) { background: var(--bg-color); color: var(--text-main); }
.view-tab.active { background: var(--primary-color); color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.view-tab:disabled { opacity: 0.3; cursor: not-allowed; }

.result-image-wrapper { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  position: relative; 
  padding: 1rem; 
  box-sizing: border-box; 
  overflow: visible; 
  min-height: 0;
}
.slider-container-v2 {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  cursor: grab;
  user-select: none;
}
.slider-container-v2.dragging { cursor: grabbing; }

.slider-track-v2 {
  display: flex;
  height: 100%;
  will-change: transform;
}

.slide-item-v2 {
  flex: 0 0 50%;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-inner-wrap { 
  position: relative; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  width: 100%; 
  height: 100%; 
}
.img-relative-box { 
  position: relative; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  padding: 10px;
  box-sizing: border-box;
}
.result-img { 
  display: block; 
  max-width: 100%; 
  max-height: 70vh; 
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.result-hover-actions { position: absolute; top: 1.5rem; right: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; opacity: 0; transform: translateX(10px); transition: all 0.3s; z-index: 10; }
.img-inner-wrap:hover .result-hover-actions { opacity: 1; transform: translateX(0); }
.hover-action-btn { width: 44px; height: 44px; border-radius: 50%; border: none; background: var(--bg-color); color: var(--text-main); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transition: all 0.2s; }
.hover-action-btn:hover { background: var(--primary-color); color: #fff; transform: scale(1.1); }
.btn-label { display: none; }

.sidebar-footer-v2 { padding: 1.75rem; border-top: 1px solid var(--border-color); background: transparent; }
.generation-options-v2 { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
.generation-options-v2.row-layout { display: flex; gap: 0.75rem; }
.popover-wrapper { position: relative; flex: 1; }
.popover-trigger-btn { width: 100%; height: 32px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 9px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: var(--text-main); transition: all 0.23s cubic-bezier(0.4, 0, 0.2, 1); }
.popover-trigger-btn:hover { background: var(--bg-color); border-color: #cbd5e1; }
.popover-trigger-btn.active { background: var(--surface-color); border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }
.popover-trigger-btn.is-disabled { opacity: 0.5; cursor: not-allowed !important; pointer-events: none; }
.generation-options-v2.is-disabled { pointer-events: none; opacity: 0.7; }
.trigger-label { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chevron { color: var(--text-muted); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.popover-trigger-btn.active .chevron { transform: rotate(180deg); color: var(--primary-color); }

.popover-content { position: absolute; bottom: calc(100% + 12px); left: 0; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 20px; padding: 1.25rem; z-index: 100; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.1); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.ratio-popover { width: 440px; right: 0; left: auto; }
.quality-popover { width: 100%; min-width: 140px; padding: 0.75rem; left: 0; }
.popover-header { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); padding: 0 2px; }

.ratio-grid-v2 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.ratio-card-v2 { background: var(--bg-color); border: 1.5px solid transparent; border-radius: 12px; padding: 10px 4px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.ratio-card-v2:hover { background: var(--surface-color); transform: translateY(-2px); }
.ratio-card-v2.active { background: var(--surface-color); border-color: var(--primary-color); }
.ratio-icon-box { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.ratio-shape { background: #cbd5e1; border-radius: 4px; transition: all 0.2s; }
.ratio-card-v2.active .ratio-shape { background: var(--primary-color); }
.auto .ratio-shape { width: 18px; height: 18px; border-radius: 2px; }
.r1x1 .ratio-shape { width: 18px; height: 18px; }
.r3x4 .ratio-shape { width: 15px; height: 20px; }
.r4x3 .ratio-shape { width: 20px; height: 15px; }
.r3x2 .ratio-shape { width: 21px; height: 14px; }
.r2x3 .ratio-shape { width: 14px; height: 21px; }
.ratio-text { font-size: 0.75rem; font-weight: 700; color: var(--text-main); }

.quality-list-v2 { display: flex; flex-direction: column; gap: 2px; }
.quality-option-item { width: 100%; height: 44px; border: none; background: transparent; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font-size: 0.7rem; font-weight: 700; color: var(--text-main); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.quality-option-item:hover { background: var(--bg-color); }
.quality-option-item.active { background: rgba(99, 102, 241, 0.08); color: var(--primary-color); }

.popover-fade-enter-active, .popover-fade-leave-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.popover-fade-enter-from { opacity: 0; transform: translateY(10px) scale(0.95); }
.popover-fade-leave-to { opacity: 0; transform: translateY(5px) scale(0.98); }

.generate-action-btn { width: 100%; height: 54px; background: var(--bg-color); color: var(--text-muted); border-radius: 14px; font-size: 1rem; font-weight: 850; display: flex; align-items: center; justify-content: center; gap: 10px; border: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 25px var(--primary-glow); }
.generate-action-btn:not(:disabled) { background: var(--primary-color); color: #fff; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4); }
.generate-action-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5); }
.generate-action-btn:not(:disabled):active { transform: translateY(0); }
.generate-action-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.required { color: #ef4444; font-size: 0.75rem; margin-left: 8px; font-weight: 500; }

.modern-textarea { width: 100%; height: 100px; border: 1px solid var(--border-color); border-radius: 16px; padding: 14px; font-size: 0.9rem; resize: none; background: var(--input-bg); color: var(--text-main); outline: none; transition: all 0.2s; font-family: inherit; }
.modern-textarea:focus { border-color: var(--primary-color); background: var(--bg-color); }

.alert-overlay-modern { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; }
.alert-content-modern { background: var(--bg-color); color: var(--text-main); width: 400px; padding: 3rem; border-radius: 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.25); border: 1px solid var(--border-color); }
.alert-icon-box { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; }
.alert-icon-box.error { background: #fff1f0; color: #ef4444; }
.alert-icon-box.success { background: #f0fdf4; color: #22c55e; }
.alert-close-btn { width: 100%; height: 52px; border-radius: 16px; background: var(--text-main); color: var(--bg-color); border: none; font-weight: 800; cursor: pointer; font-size: 1rem; }

.modern-toast { position: fixed; bottom: 2.5rem; left: 50%; transform: translateX(-50%); background: var(--text-main); color: var(--bg-color); padding: 14px 28px; border-radius: 100px; display: flex; align-items: center; gap: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.25); z-index: 10001; font-weight: 700; }
.toast-icon { width: 22px; height: 22px; border-radius: 50%; background: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 12px; }

.image-viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer-layout { display: flex; width: 100%; height: 100%; background: var(--bg-color); }
.viewer-close-btn { 
  position: absolute; 
  top: 2rem; 
  right: 2rem; 
  width: 48px; 
  height: 48px; 
  border-radius: 50%; 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  color: #fff; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  z-index: 10003; 
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
}
.viewer-close-btn:hover { background: var(--primary-color); transform: rotate(90deg) scale(1.1); }
.viewer-img { 
  max-width: 90%; 
  max-height: 90%; 
  object-fit: contain; 
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5); 
}
.image-viewer-main { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; background: #000; overflow: hidden; }
.viewer-side-panel { width: 320px; background: var(--surface-color); backdrop-filter: blur(20px); border-left: 1px solid var(--border-color); padding: 2rem; display: flex; flex-direction: column; gap: 2rem; color: var(--text-main); overflow-y: auto; }
.side-panel-header { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 700; color: var(--primary-color); }
.meta-section { display: flex; flex-direction: column; gap: 1rem; }
.meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.meta-item { display: flex; flex-direction: column; gap: 4px; }
.meta-item.full-width { grid-column: span 2; }
.meta-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.meta-value { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
.prompt-display { background: var(--input-bg); border-radius: 12px; padding: 12px; font-size: 0.85rem; line-height: 1.5; color: var(--text-main); border: 1px solid var(--border-color); }

.source-previews-section {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.source-preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.source-preview-item:hover {
  transform: translateY(-2px);
}

.source-preview-item img {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  object-fit: cover;
  border: 1.5px solid var(--border-color);
  background: var(--input-bg);
}

.source-preview-item span {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

.upload-area-v2.dragging { border-color: var(--primary-color); background: var(--surface-color); transform: scale(1.02); }

.custom-upload-full { grid-column: 1 / -1; aspect-ratio: 3/1; border: 2px dashed var(--border-color); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--input-bg); cursor: pointer; transition: var(--transition); }
.custom-upload-full:hover, .custom-upload-full.dragging { border-color: var(--primary-color); background: var(--surface-color); }
.upload-icon-circle { width: 64px; height: 64px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; color: var(--primary-color); margin-bottom: 1rem; }
.upload-msg { font-size: 0.9rem; font-weight: 700; color: var(--text-main); text-align: center; }
.upload-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; margin-bottom: 1rem; }

.custom-model-card { aspect-ratio: 1/1.4; border-radius: 8px; overflow: hidden; position: relative; border: 2px solid transparent; transition: var(--transition); cursor: pointer; background: var(--input-bg); }
.custom-model-card.active { border-color: #5c7cfa; }
.custom-model-img { width: 100%; height: 100%; object-fit: cover; }
.remove-custom-btn { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px); transition: var(--transition); }
.remove-custom-btn:hover { background: #ef4444; transform: scale(1.1); }

.custom-model-add-card { aspect-ratio: 1/1.3; border-radius: 16px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: var(--transition); background: var(--input-bg); }
.custom-model-add-card:hover { border-color: var(--primary-color); color: var(--primary-color); background: var(--surface-color); }

.viewer-img-container { cursor: zoom-in; overflow: hidden; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.viewer-img-container.is-zoomed .viewer-img { transform: scale(2.5); cursor: zoom-out; }

/* Modal & Tooltip (Previously Failed Chunks) */
.custom-model-modal { width: 640px; background: var(--bg-color); border-radius: 32px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.3); border: 1px solid var(--border-color); }
.modal-header-v2 { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--surface-color); }
.modal-header-v2 h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin: 0; }
.modal-close-v2 { background: var(--input-bg); border: none; color: var(--text-muted); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition); }
.modal-close-v2:hover { background: var(--border-color); color: var(--text-main); }
.modal-body-v2 { padding: 2rem; }
.model-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.model-selection-card { cursor: pointer; border-radius: 12px; overflow: hidden; border: 2px solid transparent; transition: var(--transition); background: var(--input-bg); text-align: center; padding-bottom: 10px; }
.model-selection-card:hover { border-color: #5c7cfa; transform: translateY(-4px); }
.model-thumb { aspect-ratio: 1/1.3; overflow: hidden; margin-bottom: 8px; }
.model-thumb img { width: 100%; height: 100%; object-fit: cover; }
.model-name { font-size: 0.8rem; font-weight: 700; color: var(--text-main); }

.pose-preview-tooltip { position: fixed; z-index: 9999; pointer-events: none; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.2)); transform-origin: left center; }
.preview-tooltip-inner { background: var(--bg-color); border-radius: 16px; overflow: hidden; width: 240px; display: flex; flex-direction: column; border: 1px solid var(--border-color); }
.preview-img-box { width: 100%; aspect-ratio: 1/1.4; background: var(--input-bg); overflow: hidden; }
.preview-img-box img { width: 100%; height: 100%; object-fit: cover; }
.preview-info { padding: 1rem; display: flex; flex-direction: column; gap: 2px; }
.preview-info .pose-name { font-size: 0.9rem; font-weight: 800; color: var(--text-main); }
.preview-info .pose-desc { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

.empty-preview-v2 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
.empty-overlay {
  text-align: center;
}
.empty-hint {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-muted);
  opacity: 0.5;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes border-wave-flow {
  0% { background-position: 0% 0, 0% 0; }
  100% { background-position: 0% 0, 200% 0; }
}

.generating-vibe {
  position: relative !important;
  border: 3px solid transparent !important;
  background-image: linear-gradient(var(--bg-color), var(--bg-color)), 
                    linear-gradient(90deg, #5c7cfa, #12b886, #ae3ec9, #5c7cfa) !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  background-size: 100% 100%, 200% 100% !important;
  animation: border-wave-flow 3s linear infinite !important;
  box-shadow: 0 20px 40px rgba(92, 124, 250, 0.15) !important;
}

/* Transitions */
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.2s ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }

.preview-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.preview-pop-enter-from { opacity: 0; transform: translateX(-15px) scale(0.95); }
.preview-pop-leave-active { transition: all 0.2s ease-in; }
.preview-pop-leave-to { opacity: 0; transform: translateX(-10px) scale(0.98); }

.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from { opacity: 0; transform: translate(-50%, 20px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>
