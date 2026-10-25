import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../database';
import { config } from '../config';

const JWT_SECRET = config.jwtSecret;

export interface AuthRequest extends Request {
  userId?: number;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ') && !authHeader.startsWith('Token ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.replace(/^(Bearer |Token )/, '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Staff-only routes: after authMiddleware. The flag is read from the database on every call, so a
// demoted user loses access at once; the token carries only the user id.
export async function requireStaff(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = req.userId ? await prisma.user.findUnique({ where: { id: req.userId }, select: { isStaff: true } }) : null;
    if (!user || !user.isStaff) {
      return res.status(403).json({ error: 'Staff only' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
}
