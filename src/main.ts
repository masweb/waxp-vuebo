import CoreuiVue from '@coreui/vue'
import './css/main.scss'

import App from './App.vue'
import { i18n } from '@/i18n/i18n'

const app = createApp(App)
app.use(createPinia())
app.use(CoreuiVue)
app.use(i18n)

app.mount('#app')
