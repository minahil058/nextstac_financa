import express from 'express';
import * as hrController from '../controllers/hrController.js';

const router = express.Router();

router.get('/employees', hrController.getAllEmployees);
router.get('/employees/:id', hrController.getEmployeeById);
router.post('/employees', hrController.createEmployee);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deleteEmployee);

export default router;
