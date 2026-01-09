import { reactive, h } from 'vue'
import GlobalLoader from '@/components/GlobalLoader.vue'

export default function (app) {
  const state = reactive({
    visible: false,
  })

  const loading = {
    show() {
      state.visible = true
    },
    hide() {
      state.visible = false
    },
  }

  // 🔥 Disponible en todo: proxy.$loading
  app.config.globalProperties.$loading = loading

  // 🔥 Componente global
  app.component('GlobalLoaderWrapper', {
    setup() {
      return () => (state.visible ? h(GlobalLoader) : null)
    },
  })
}
