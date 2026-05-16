import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Express 5 cleanly infers types here natively, no manual annotations needed!
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    workspace: 'masbisa',
    runtime: 'Node.js + TypeScript (Express 5)'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express 5 + TS engine running at http://localhost:${PORT}`);
});
