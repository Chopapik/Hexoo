import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'hexoo-node-api', ts: Date.now() });
});

// Simple example endpoint
app.get('/api/greeting', (req, res) => {
  const name = (req.query.name as string) || 'friend';
  res.json({ message: `Hello, ${name}!` });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

