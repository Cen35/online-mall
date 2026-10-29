process.env.VERCEL = '1'
const { app } = await import('./index.mjs')

export default function handler(req, res) {
  if (!req.url.startsWith('/api/')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`
  }
  return app(req, res)
}
