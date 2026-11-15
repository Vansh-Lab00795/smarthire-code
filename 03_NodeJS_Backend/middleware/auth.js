import jwt from 'jsonwebtoken';
import { readData } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required to start the backend.');
}

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readData('users.json');
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found. Authorization denied.' });
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid.' });
  }
}

export { JWT_SECRET };
