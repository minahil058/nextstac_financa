import express from 'express';
import * as systemController from '../controllers/systemController.js';

const router = express.Router();

router.get('/logs', systemController.getLogs);
router.get('/company-profile', systemController.getCompanyProfile);

export default router;
