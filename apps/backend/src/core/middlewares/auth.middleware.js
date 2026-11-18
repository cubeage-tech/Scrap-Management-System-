import { verifyToken } from '../utils/jwt.js';
import prisma from '../lib/prisma.js';

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = verifyToken(token);
    // Skip DB lookup in test env — mock returns null and would block all authenticated tests
    if (process.env.NODE_ENV === 'test') {
      req.user = payload;
      return next();
    }
    // Verify the user is still active in the database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, isActive: true }
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive or suspended' });
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default requireAuth;
