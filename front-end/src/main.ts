import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Set up the supabase based events
import './supabase/events'

app.mount('#app')
