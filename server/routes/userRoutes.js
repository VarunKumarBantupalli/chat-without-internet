// server/routes/userRoutes.js
import express from 'express';
import upload from '../middleware/multer.js';
import { createUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', upload.single('image'), createUser);

export default router;
