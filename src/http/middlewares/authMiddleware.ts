import { RequestHandler } from 'express';
import { ForbiddenError } from '../../errors/ForbiddenError';

export function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

interface AuthMiddlewareOptions {
  apiToken: string;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions): RequestHandler {
  const { apiToken } = options;

  return (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!apiToken || token !== apiToken) {
      next(
        new ForbiddenError('Forbidden', {
          requestId: req.requestId,
          context: {
            path: req.originalUrl,
          },
        }),
      );
      return;
    }

    next();
  };
}
