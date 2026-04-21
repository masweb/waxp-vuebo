import CoreuiVue from '@coreui/vue'
import './css/main.scss'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

import App from './App.vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { i18n } from '@/i18n/i18n'
import { router } from '@/router'

const app = createApp(App)
app.use(createPinia())
app.use(CoreuiVue)
app.use(ContextMenu)
app.use(i18n)
app.use(router)

app.mount('#app')
