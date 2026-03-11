import dotenv from 'dotenv';
// Load environment variables before any application code executes
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Second Brain Backend running heavily on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
});
