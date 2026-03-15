<template>
  <div class="selection-container">
    <div class="header-group">
      <h2 class="gradient-text">AI 피팅 체험하기</h2>
      <p>원하시는 피팅 방식을 선택해 주세요.</p>
    </div>

    <div class="selection-grid">
      <NuxtLink to="/test/tryon" class="selection-card glass">
        <div class="card-icon">👤</div>
        <h3>나한테 피팅해보기</h3>
        <p>본인의 전신 사진을 업로드하여 직접 옷을 입어보는 경험을 해보세요.</p>
        <div class="card-action">시작하기 →</div>
      </NuxtLink>

      <NuxtLink to="/test/studio" class="selection-card glass">
        <div class="card-icon">📸</div>
        <h3>스튜디오용 피팅</h3>
        <p>프로페셔널한 모델 포즈를 사용하여 고품질의 룩북 이미지를 생성해보세요.</p>
        <div class="card-action">시작하기 →</div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.selection-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 3rem;
  padding: 2rem;
}

.header-group {
  text-align: center;
}

.header-group h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.header-group p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 900px;
}

.selection-card {
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  color: inherit;
}

.selection-card:hover {
  transform: translateY(-10px);
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.card-icon {
  font-size: 4rem;
}

.selection-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
}

.selection-card p {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
  word-break: keep-all;
}

.card-action {
  margin-top: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .selection-grid {
    grid-template-columns: 1fr;
  }
}
</style>
