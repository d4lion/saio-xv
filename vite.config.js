import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import transactionHandler from './api/transaction.js'

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
        name: 'wompi-api-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/transaction', async (req, res) => {
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

              await transactionHandler(req, res)
            } catch (err) {
              console.error('Error en middleware dev /api/transaction:', err)
              if (!res.headersSent) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: { reason: err.message } }))
              }
            }
          })
        },
      },
    ],
    server: {
      allowedHosts: ['b962-190-158-28-67.ngrok-free.app'],
    },
  }
})
