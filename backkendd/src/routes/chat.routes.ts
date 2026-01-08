import { Router } from 'express';
import { GenerateRes, GenerateResV2, GetChats, GetChatById } from '../controllers/chat.controller';

const router = Router();

router.post('/generate', GenerateRes)
router.post('/:cId', GenerateResV2);
router.get('/chats', GetChats);
router.get('/:cId', GetChatById);

export default router;