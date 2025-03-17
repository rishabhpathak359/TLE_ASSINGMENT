import express from 'express';
import { contests, searchContests, updateSolution } from '../controllers/contestController.js';

const router = express.Router();
router.get('/getContests' , contests);
router.get('/searchContest' , searchContests);
router.put('/updateSolution/:contestId', updateSolution);
export default router;