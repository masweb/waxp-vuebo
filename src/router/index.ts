import { createRouter, createWebHistory } from 'vue-router'
import Nothing from '@/components/Nothing.vue'
import RouterContent from '@/components/editor/RouterContent.vue'

const ROUTE_KEY = 'lastRoute'

export const saveCurrentRoute = () => {
  const path = router.currentRoute.value.path
  if (path && path !== '/') localStorage.setItem(ROUTE_KEY, path)
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Nothing',
      component: Nothing
    }
  ]
})

router.afterEach((to) => {
  if (to.path && to.path !== '/') localStorage.setItem(ROUTE_KEY, to.path)
})

export const clearRoutes = () => {
  const currentRoutes = router.getRoutes()
  currentRoutes.forEach(route => {
    router.removeRoute(route.name)
  })
}

export const loadSiteRoutes = async (routes: Record<string, { path: string; page_id: number }[]>) => {
  clearRoutes()

  for (const locale in routes) {
    routes[locale].forEach(route => {
      router.addRoute({
        path: route.path,
        name: `${locale}-${route.page_id}`,
        component: RouterContent,
        props: { pageId: route.page_id, pagePath: route.path, locale }
      })
    })
  }

  const saved = localStorage.getItem(ROUTE_KEY)
  if (saved) {
    const allPaths = router.getRoutes().map(r => r.path)
    await router.push(allPaths.includes(saved) ? saved : '/').catch(() => router.push('/'))
  } else {
    await router.push('/')
  }
}
