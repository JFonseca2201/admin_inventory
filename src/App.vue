<script setup>
import { useTheme } from "vuetify";
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@layouts/utils";
import { useNetwork } from "@/composables/useNetwork.js";

const { global } = useTheme();

// ℹ️ Sync current theme with initial loader theme
initCore();
initConfigStore();

const configStore = useConfigStore();
const router = useRouter();
const { isOnline } = useNetwork();

watch(isOnline, (online) => {
  if (!online) {
    router.push("/offline"); // Redirige a la página de desconexión
  }
});
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`"
    >
      <GlobalLoaderWrapper />
      <RouterView />

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
