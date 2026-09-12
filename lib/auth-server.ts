import { NextRequest, NextResponse } from 'next/server';

interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
}

interface VerifyAuthResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

// In-memory cache for validated tokens to minimize latency and round-trips
const tokenCache = new Map<string, { user: AuthUser; expiresAt: number }>();
const MAX_CACHE_SIZE = 500;

/**
 * Extracts the Firebase ID token from the request Authorization header or cookies.
 */
export function extractToken(req: NextRequest): string | null {
  // 1. Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Fallback to cookie
  const cookieToken = req.cookies.get('firebase_token')?.value;
  if (cookieToken && cookieToken.trim()) {
    return cookieToken.trim();
  }

  return null;
}

/**
 * Verifies a Firebase ID token on the server using Google Identity Toolkit.
 */
export async function verifyAuth(req: NextRequest): Promise<VerifyAuthResult> {
  const token = extractToken(req);

  if (!token) {
    return {
      authenticated: false,
      error: 'Acesso negado. Token de autenticação não fornecido.',
    };
  }

  // Clean cache if it gets too large
  if (tokenCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    tokenCache.forEach((value, key) => {
      if (value.expiresAt < now) {
        tokenCache.delete(key);
      }
    });
    // If still large, clear oldest
    if (tokenCache.size > MAX_CACHE_SIZE) {
      tokenCache.clear();
    }
  }

  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      authenticated: true,
      user: cached.user,
    };
  }

  // JWT pre-validation (structure and expiration)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { authenticated: false, error: 'Token de autenticação malformado.' };
    }

    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return {
        authenticated: false,
        error: 'Sessão expirada. Por favor, faça login novamente no painel.',
      };
    }

    // Check project ID if present in aud
    const expectedProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    if (expectedProjectId && payload.aud && payload.aud !== expectedProjectId) {
      return {
        authenticated: false,
        error: 'Token inválido para este projeto do Firebase.',
      };
    }
  } catch (err) {
    return { authenticated: false, error: 'Falha ao decodificar token de autenticação.' };
  }

  // Cryptographic verification via Google Identity Toolkit REST API
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return {
      authenticated: false,
      error: 'Servidor não configurado: NEXT_PUBLIC_FIREBASE_API_KEY não definida.',
    };
  }

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: token }),
    });

    const data = await response.json();

    if (!response.ok || !data.users || data.users.length === 0) {
      const apiError = data?.error?.message || 'Token inválido ou revogado';
      return {
        authenticated: false,
        error: `Sessão inválida: ${apiError}. Faça login novamente.`,
      };
    }

    const userData = data.users[0];
    const user: AuthUser = {
      uid: userData.localId,
      email: userData.email,
      displayName: userData.displayName,
    };

    // Cache valid token for 5 minutes
    const ttl = 5 * 60 * 1000;
    tokenCache.set(token, {
      user,
      expiresAt: Date.now() + ttl,
    });

    return {
      authenticated: true,
      user,
    };
  } catch (err: any) {
    console.error('Erro ao verificar autenticação no Firebase:', err);
    return {
      authenticated: false,
      error: 'Erro de comunicação ao verificar credenciais no Firebase.',
    };
  }
}

/**
 * Standard 401 Unauthorized JSON response for protected API routes.
 */
export function unauthorizedResponse(error?: string) {
  return NextResponse.json(
    {
      success: false,
      error: error || 'Acesso não autorizado. Faça login com o Firebase para acessar este recurso.',
    },
    { status: 401 }
  );
}
