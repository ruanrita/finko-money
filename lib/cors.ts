import { NextResponse } from "next/server";

/**
 * Headers CORS padrão para API routes
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 horas
};

/**
 * Resposta para requisições OPTIONS (preflight)
 */
export function corsPreflightResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Adiciona headers CORS a uma resposta
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Wrapper para handlers de API que adiciona CORS automaticamente
 */
export function withCors(
  handler: (request: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: Request, ...args: any[]) => {
    // Handle preflight
    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    // Execute handler e adiciona CORS
    const response = await handler(request, ...args);
    return addCorsHeaders(response);
  };
}
