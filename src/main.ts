import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './styles/global.css'

import App from './App.vue'
import router from './router/router.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
