import { Router } from 'express';
import multer from 'multer';
import {
  bulkUploadInventoryCsv,
  createInventory,
  deleteInventory,
  getInventory,
  searchMasterMedications,
  updateInventory
} from '../controllers/inventory.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(authenticate, authorizeRoles('pharmacy'));

router.get('/', getInventory);
router.get('/medications/search', searchMasterMedications);
router.post('/', createInventory);
router.patch('/:id', updateInventory);
router.delete('/:id', deleteInventory);
router.post('/bulk-upload', upload.single('file'), bulkUploadInventoryCsv);

export default router;
