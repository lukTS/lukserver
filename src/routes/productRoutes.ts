import { Router } from 'express';
import { getProducts, getProductById, getCategories } from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/categories', getCategories);

export default router;
