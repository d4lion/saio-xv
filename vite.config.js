import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import transactionHandler from './api/transaction.js'
import verifyTurnstileHandler from './api/verify-turnstile.js'

// Helper para envolver middleware express/vercel handler en Vite
const wrapApiHandler = (handler) => async (req, res) => {
  try {
    if (!res.status) {
      res.status = function (code) {
        res.statusCode = code
        return res
      }
    }
    if (!res.json) {
      res.json = function (data) {
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json')
        }
        res.end(JSON.stringify(data))
        return res
      }
    }
    await handler(req, res)
  } catch (err) {
    console.error('Error en middleware dev API:', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: { reason: err.message } }))
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (.env) en process.env para dev local
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/transaction', wrapApiHandler(transactionHandler))
          server.middlewares.use('/api/verify-turnstile', wrapApiHandler(verifyTurnstileHandler))
        },
      },
    ],
    server: {
      allowedHosts: ['b962-190-158-28-67.ngrok-free.app'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Firebase — chunks separados por módulo
            if (id.includes('firebase/app') || id.includes('@firebase/app')) {
              return 'vendor-firebase-app'
            }
            if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
              return 'vendor-firebase-auth'
            }
            if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
              return 'vendor-firebase-firestore'
            }
            if (id.includes('firebase/') || id.includes('@firebase/')) {
              return 'vendor-firebase-misc'
            }
            // Librerías pesadas de UI
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion'
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-recharts'
            }
            if (id.includes('sweetalert2')) {
              return 'vendor-sweetalert'
            }
            // React core
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react'
            }
          },
        },
      },
    },
  }
})
