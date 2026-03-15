<template>
  <div class="test-container">
    <div class="header-group">
      <h2 class="gradient-text">스튜디오용 피팅</h2>
      <p>전문적인 스튜디오 환경에서 촬영된 고품질 모델 포즈를 사용하여 피팅을 체험해보세요.</p>
    </div>

    <div class="tab-content">
      <StudioFittingUI />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StudioFittingUI from '~/components/StudioFittingUI.vue';
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

.tab-content {
  width: 100%;
}
</style>
