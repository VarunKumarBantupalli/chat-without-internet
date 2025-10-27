import express from 'express';
import authApi from '../middleware/authApi.js';
import requireAdmin from '../middleware/requireAdmin.js';
import { adminGetSystem, adminSetSystem } from '../controllers/adminController.js';

const router = express.Router();

router.use(authApi);
router.use(requireAdmin);

// GET /api/admin/system
router.get('/system', adminGetSystem);

// PUT /api/admin/system  { running: boolean, reason?: string }
router.put('/system', adminSetSystem);

export default router;
