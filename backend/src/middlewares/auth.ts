import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/token';

const auth = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;
  console.log(token);
	if (!token) {
    console.log('Unauthorized no 1');
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const payload = verifyToken(token);
  console.log(payload);
	if (!payload || !payload.fid) {
    console.log('Unauthorized no 2');
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	req.fuserId = payload.fid;
	next();
};

export default auth;
