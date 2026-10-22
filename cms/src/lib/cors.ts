const fallbackOrigin = 'http://localhost:5173'

/**
 * CORS headers for the hand-written API routes.
 * Mirrors the `cors` option in payload.config.ts so the SPA, hosted on
 * another origin, is allowed to read these responses.
 */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin')
  const allowedOrigin = process.env.FRONTEND_URL || fallbackOrigin

  if (!origin || origin !== allowedOrigin) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  }
}

/** Preflight handler for both hand-written and Payload REST API routes. */
export function optionsResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Origin, X-Requested-With, X-Payload-HTTP-Method-Override',
    },
  })
}
