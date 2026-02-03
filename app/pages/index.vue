<template>
  <div class="home-container">
    <section class="hero-section">
      <h1 class="hero-title">패션 AI의 미래를 <br/><span class="gradient-text">직접 경험해보세요</span></h1>
      <p class="hero-subtitle">
        정적인 이미지를 인터랙티브한 패션 경험으로 전환합니다. 
        차세대 플랫폼을 위한 고정밀 AI 피팅 서비스를 만나보세요.
      </p>
      <div class="cta-group">
        <NuxtLink to="/test" class="btn-primary">지금 체험하기</NuxtLink>
        <NuxtLink to="/docs" class="btn-secondary">문서 읽기</NuxtLink>
      </div>
    </section>

    <div class="features-grid">
      <div class="feature-card glass">
        <h3>빠른 처리 속도</h3>
        <p>AWS Lambda와 SQS 기반의 최적화된 파이프라인으로 신속한 결과를 제공합니다.</p>
      </div>
      <div class="feature-card glass">
        <h3>높은 정확도</h3>
        <p>Gemini Vision 모델을 활용하여 놀라울 정도로 사실적인 가상 피팅을 구현합니다.</p>
      </div>
      <div class="feature-card glass">
        <h3>쉬운 통합</h3>
        <p>개발자 경험을 최우선으로 설계된 직관적인 REST API를 제공합니다.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4rem;
}

.hero-section {
  max-width: 800px;
  animation: fadeIn 1s ease-out;
}

.hero-title {
  font-size: 4rem;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 2.5rem;
}

.cta-group {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.btn-secondary {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  font-weight: 600;
  transition: var(--transition);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--primary-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  padding: 2.5rem;
  text-align: left;
  transition: var(--transition);
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.feature-card:hover {
  transform: translateY(-10px);
  border-color: var(--primary-color);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
