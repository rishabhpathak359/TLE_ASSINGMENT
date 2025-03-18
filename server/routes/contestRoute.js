import express from 'express';
import { contests, solutions } from '../controllers/contestController.js';

const router = express.Router();
router.get('/getContests' , contests);
router.get('/solutions' , solutions);
// router.get('/searchContest' , searchContests); 
// router.put('/updateSolution/:contestId', updateSolution);
export default router; 