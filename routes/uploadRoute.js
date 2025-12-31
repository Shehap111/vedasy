import express from 'express';
import { upload } from '../config/uploadConfig.js';
import uploadImage from '../controllers/uploadController.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import {verifyAdminOrDoctor} from '../middlewares/verifyAdminOrDoctor.js';

const router = express.Router();

router.post(
  '/upload',
  verifyAdminOrDoctor,
  upload.single('image'),
  uploadImage
);// router.post('/upload-360', verifyAdminOrDoctor, upload.single('image360'), uploadImage);

export default router;

