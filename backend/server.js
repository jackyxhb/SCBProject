import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import boxesRouter from './routes/boxes.js';
import parcelsRouter from './routes/parcels.js';
import { attachUser } from './lib/auth.js';

dotenv.config();

const app = express();
app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN
  || (process.env.VERCEL_URL && process.env.VERCEL ? `https://${process.env.VERCEL_URL}` : null)
  || process.env.VERCEL_URL
  || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(attachUser);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', apiRouter);
app.use('/api/boxes', boxesRouter);
app.use('/api/parcels', parcelsRouter);

const port = process.env.PORT || 3000;
// Only start a local listener when running the file directly (dev/test), not on Vercel serverless
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`API listening on :${port}`);
  });
}

export default app;
