import express from 'express';
import { contests } from '../controllers/contestController.js';

const router = express.Router();
router.get('/getContests' , contests);
export default router;