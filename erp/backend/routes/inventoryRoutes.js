import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/products', inventoryController.getProducts);
router.post('/products', inventoryController.createProduct);
router.put('/products/:id', inventoryController.updateProduct); // Using PUT/PATCH
router.delete('/products/:id', inventoryController.deleteProduct);

export default router;
