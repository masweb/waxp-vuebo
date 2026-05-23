export const useDemoMode = () => ({
  isDemo: import.meta.env.VITE_DEMO_MODE === 'true'
})
