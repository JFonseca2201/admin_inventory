import { createApp } from "vue";
import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";
import Swal from "sweetalert2";
import directives from "./directives/directives.js";

// Styles
import "@core/scss/template/index.scss";
import "@styles/styles.scss";

const app = createApp(App);

app.config.globalProperties.$swal = Swal;

app.config.globalProperties.$toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  background: "rgba(56, 142, 60, 0.65)",
  color: "#fff",
});

registerPlugins(app);

// Registrar TODAS las directivas del archivo
Object.keys(directives).forEach((name) => {
  app.directive(name, directives[name]);
});

app.mount("#app");
