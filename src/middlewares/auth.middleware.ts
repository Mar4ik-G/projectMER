import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IGetUserAuthInfoRequest } from '../interfaces/custom';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';

export const protect = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { id: string };
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
