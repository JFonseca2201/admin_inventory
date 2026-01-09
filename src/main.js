import { createApp } from "vue";
import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";
import Swal from "sweetalert2"; // 👈 AÑADIDO

// Styles
import "@core/scss/template/index.scss";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);

// 👉 REGISTRO GLOBAL
app.config.globalProperties.$swal = Swal;

// 👉 CREAR INSTANCIA GLOBAL DE TOAST
app.config.globalProperties.$toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "rgba(56, 142, 60, 0.65)", // verde con transparencia por defecto (puedes cambiar)
  color: "#fff",
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// Register plugins
registerPlugins(app);

// Mount vue app
app.mount("#app");
