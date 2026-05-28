<script setup lang="ts">
const { theme } = useTheme()
const auth = useAuthStore()
const nav = navigationStore()
const st = siteStore()
useFavicon()
auth.initializeAuth()

if (!auth.isAuthenticated) {
  nav.setView('login')
} else if (nav.main === 'site') {
  st.restoreSite().then(ok => {
    if (!ok) nav.setView('dashboard')
  })
}

const views: Record<string, Component> = {
  login: defineAsyncComponent(() => import('@/views/auth/LoginView.vue')),
  dashboard: defineAsyncComponent(() => import('@/views/DashBoard.vue')),
  settings: defineAsyncComponent(() => import('@/views/AppSettings.vue')),
  site: defineAsyncComponent(() => import('@/components/editor/SiteEditor.vue'))
}

const currentView = computed(() => views[nav.main])
</script>

<template>
  <ErrorsNotifier />
  <MainBar />
  <div class="main-content">
    <ModalNewBlock />
    <component :is="currentView" />
  </div>
</template>
