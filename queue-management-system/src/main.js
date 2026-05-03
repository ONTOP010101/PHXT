import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'
import * as LucideIcons from 'lucide-vue-next'

const app = createApp(App)
const pinia = createPinia()

// 注册 Lucide 图标组件
app.use({
  install(app) {
    Object.entries(LucideIcons).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
})

app.use(pinia)
app.use(router)
app.mount('#app')