import { Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { verifyAccessToken } from '../models/auth';
import { Request, User } from '../types';

export default async function requireAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization as string;
  try {
    const accessToken = token.split(' ')[1];
    if (!accessToken) {
      res.sendStatus(400);
    } else {
      const jwtVerified = verifyAccessToken(req, accessToken) as JwtPayload;
      if (!jwtVerified) {
        res.sendStatus(401);
      } else {
        req.user = jwtVerified.data as User;
        next();
      }
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
