import express from 'express';
import * as purchasingController from '../controllers/purchasingController.js';

const router = express.Router();

router.get('/vendors', purchasingController.getVendors);
router.post('/vendors', purchasingController.createVendor);
router.put('/vendors/:id', purchasingController.updateVendor);
router.delete('/vendors/:id', purchasingController.deleteVendor);

// Purchase Orders
router.get('/purchase-orders', purchasingController.getPurchaseOrders);
router.post('/purchase-orders', purchasingController.createPurchaseOrder);
router.put('/purchase-orders/:id', purchasingController.updatePurchaseOrder);
router.delete('/purchase-orders/:id', purchasingController.deletePurchaseOrder);

// Bills
router.get('/bills', purchasingController.getBills);
router.post('/bills', purchasingController.createBill);
router.put('/bills/:id', purchasingController.updateBill);
router.delete('/bills/:id', purchasingController.deleteBill);

export default router;
