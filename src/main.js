import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
