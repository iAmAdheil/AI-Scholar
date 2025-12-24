import Router from 'express';
import { Register } from '../controllers/auth.controller';

const router = Router();

router.post('/signin', Register);

export default router;
