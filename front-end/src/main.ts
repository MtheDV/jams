import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Create a new vue instance with our main App component
const app = createApp(App)

// Add our plugins
app.use(createPinia())
app.use(router)

// Add our events for supabase
import './supabase/events'

// Mount the app to begin
app.mount('#app')
