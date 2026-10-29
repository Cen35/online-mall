import serverless from 'serverless-http'

// Prevent the local development entry point from opening a listening port
// when the module is loaded inside a Netlify serverless function.
process.env.NETLIFY = 'true'
const { app } = await import('../../index.mjs')

const expressHandler = serverless(app)
export const handler = async (event, context) => expressHandler({
  ...event,
  path: event.path?.replace('/.netlify/functions/api', '/api'),
  rawUrl: event.rawUrl?.replace('/.netlify/functions/api', '/api'),
}, context)
