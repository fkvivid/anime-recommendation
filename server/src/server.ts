import express from 'express';
import cors from 'cors';
import { connectDB } from './utils/connectDB';
import authRoutes from './routes/authRoutes';
import animeRoutes from './routes/animeRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import { errorHandler } from './middleware/errorHandler';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/anime', animeRoutes);
app.use('/recommendations', recommendationRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.use(errorHandler);

await connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});