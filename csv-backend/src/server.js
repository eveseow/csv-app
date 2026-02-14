import express from 'express';
import cors from 'cors';
import csvRoutes from './routes/csv_routes.js';
import { initDatabase } from './models/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/csv', csvRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'OK' });
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();