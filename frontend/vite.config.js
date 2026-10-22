import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      // Gọi /api/... sẽ được chuyển tới backend Spring Boot (đổi bằng VITE_API_TARGET trong frontend/.env)
      proxy: {
        '/api': env.VITE_API_TARGET || 'http://localhost:8080',
      },
    },
  }
})
