import express from 'express';
import { contests, updateSolution } from '../controllers/contestController.js';

const router = express.Router();
router.get('/getContests' , contests);
router.put('/updateSolution/:contestId', updateSolution);
export default router;