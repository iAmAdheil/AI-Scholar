import { NextFunction, Request, Response } from 'express';
import { verToken } from '../utils/jwt';

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ msg: 'unauthorized, no token found' });
    return;
  }
  const payload = verToken(token);
  if (!payload || !payload.fid) {
    res.status(401).json({ msg: 'unauthorized, invalid token' });
    return;
  }

  req.fId = payload.fid;
  next();
};

export default auth;
