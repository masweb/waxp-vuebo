import { createRouter, createWebHistory } from 'vue-router'
import Nothing from '@/components/Nothing.vue'
import RouterContent from '@/components/editor/RouterContent.vue'

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
  await goToHome()
}

const goToHome = async () => {
  await router.push({ path: '/' })
}
