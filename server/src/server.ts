import express from 'express';
import cors from 'cors';
import { connectDB } from './utils/connectDB.js';
import authRoutes from './routes/authRoutes.js';
import animeRoutes from './routes/animeRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('api/auth', authRoutes);
app.use('api/anime', animeRoutes);
app.use('api/recommendations', recommendationRoutes);

// Health check
app.get('api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Not found handler for unknown API routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        path: req.originalUrl,
    });
});

app.use(errorHandler);

await connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});