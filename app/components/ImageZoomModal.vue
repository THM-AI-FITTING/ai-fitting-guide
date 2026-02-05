<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="zoom-modal-backdrop" @click="close">
        <div class="zoom-modal-content" @click.stop>
          <button class="close-btn" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <img :src="imageUrl" class="zoomed-image" alt="Zoomed Image" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  imageUrl: String
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

// Prevent scrolling when modal is open
watch(() => props.show, (newVal) => {
  if (import.meta.client) {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.zoom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.zoom-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 85vh; /* Reduced from 90vh to accommodate close button */
  display: flex;
  justify-content: center;
  align-items: center;
}

.zoomed-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
