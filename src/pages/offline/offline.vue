<template>
  <div class="offline-container">
    <VCard class="offline-card" elevation="8">
      <!-- Icono SVG con cambio de color según estado -->
      <div class="icon-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          class="offline-icon"
          :style="{ stroke: onlineStatus ? '#34d399' : '#f87171' }"
        >
          <circle cx="32" cy="32" r="30" stroke-width="4" fill="none" />
          <line x1="20" y1="44" x2="44" y2="20" stroke-width="4" />
        </svg>
      </div>

      <VCardTitle>{{
        onlineStatus ? "¡Conectado!" : "😕 Sin conexión a Internet"
      }}</VCardTitle>
      <VCardText>
        <p v-if="!onlineStatus">
          Parece que has perdido la conexión. Intentando reconectar en
          {{ countdown }} segundos...
        </p>
        <p v-else>La conexión se ha restablecido, redirigiendo al inicio...</p>
      </VCardText>

      <VCardActions v-if="!onlineStatus">
        <VBtn
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="checkConnection"
        >
          Reintentar
        </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const onlineStatus = ref(false);
const countdown = ref(3);
let intervalId = null;

// Función manual para reintentar
function checkConnection() {
  loading.value = true;
  setTimeout(() => {
    if (navigator.onLine) {
      onlineStatus.value = true;
      redirectHome();
    } else {
      alert("Aún no hay conexión 😢");
      loading.value = false;
    }
  }, 1000);
}

// Redirige al index
function redirectHome() {
  setTimeout(() => {
    router.push("/");
  }, 800);
}

// Función que corre cada segundo para reconectar automáticamente
function autoReconnect() {
  intervalId = setInterval(() => {
    if (navigator.onLine) {
      onlineStatus.value = true;
      clearInterval(intervalId);
      redirectHome();
    } else {
      countdown.value--;
      if (countdown.value <= 0) {
        countdown.value = 3;
      }
    }
  }, 1000);
}

onMounted(() => {
  autoReconnect();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
.offline-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  font-family: "Poppins", sans-serif;
  text-align: center;
  padding: 1rem;
}

.offline-card {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.offline-icon {
  width: 100px;
  height: 100px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
}

.v-btn {
  min-width: 120px;
}
</style>
