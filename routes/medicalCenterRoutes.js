import express from 'express';
import {
  createMedicalCenter,
  getMedicalCenters,
  getMedicalCenterById,
  updateMedicalCenter,
  toggleMedicalCenterStatus,
  deleteMedicalCenter,
} from '../controllers/medicalCenterController.js';

const router = express.Router();

router.get('/', getMedicalCenters);
router.get('/:id', getMedicalCenterById);

router.post('/', createMedicalCenter);
router.patch('/:id', updateMedicalCenter);
router.patch('/:id/toggle-status', toggleMedicalCenterStatus);
router.delete('/:id', deleteMedicalCenter);

export default router;
