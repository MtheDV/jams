import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './tailwind.css'

// Add our events for supabase
import './supabase/events'

// Create a new vue instance with our main App component
const app = createApp(App)

// Add our plugins
app.use(router)

// Mount the app to begin
app.mount('#app')
