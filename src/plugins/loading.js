import { reactive, h } from "vue";
import { VOverlay, VProgressCircular } from "vuetify/components";

export default function (app) {
  const state = reactive({
    visible: false,
  });

  const loading = {
    show() {
      state.visible = true;
    },
    hide() {
      state.visible = false;
    },
  };

  // 👉 Agrega helpers globales
  app.config.globalProperties.$loading = loading;

  // 👉 Componente global del loader
  app.component("GlobalLoaderWrapper", {
    setup() {
      return () =>
        h(
          VOverlay,
          {
            modelValue: state.visible,
            persistent: true,
            opacity: 0.4,
            class: "d-flex align-center justify-center",
          },
          {
            default: () =>
              h(VProgressCircular, {
                indeterminate: true,
                size: 70,
                width: 6,
                color: "primary",
              }),
          },
        );
    },
  });
}
