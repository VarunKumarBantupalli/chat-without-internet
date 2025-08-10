import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true
}));

// Connect to DB
connectDb();

// Routes
app.use('/api/users', userRoutes);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
