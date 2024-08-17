import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import userRoutes from './routes/user.route';
import authRoutes from './routes/auth.route';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173'], // List of allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true,
}));

// Connect to the database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
