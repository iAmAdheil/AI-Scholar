import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const genToken: (fid: string) => string | null = (id: string) => {
  try {
    const payload = { fid: id };
    const token = jwt.sign(payload, JWT_SECRET);
    return token;
  } catch (e: any) {
    console.log(e.message || 'token generation failed');
    return null;
  }
};

export const verToken: (tokenVal: string) => { fid: string } | null = (
  tokenVal: string
) => {
  try {
    const token = tokenVal.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { fid: string };
  } catch (e: any) {
    console.log(e.message || 'token verification failed');
    return null;
  }
};
