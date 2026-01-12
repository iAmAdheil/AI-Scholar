import Router from 'express';
import { Register } from '../controllers/auth.controller';

const router = Router();

router.post('/login', Register);

export default router;
