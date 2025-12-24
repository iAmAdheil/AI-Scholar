import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRouter from './routes/auth.routes';
import chatRouter from './routes/chat.routes';
import Auth from './middlewares/auth.middleware';

import { MONGODB_CONNECTION_STRING, PORT } from './config';

const app = express();
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGODB_CONNECTION_STRING);
}

app.use(cors());
app.use(express.json());
app.get('/', (req, res, next) => {
  res.json({
    msg: 'server up and running!',
  });
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chat', Auth, chatRouter);
app.listen(PORT || 3000, () => {
  console.log(`Listening on port ${PORT || 3000}`);
});
