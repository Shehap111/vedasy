import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);

    let compressedPath = path.join(dirName, `${baseName}-compressed.webp`);
    if (compressedPath === filePath) {
      compressedPath = path.join(dirName, `${baseName}-${Date.now()}.webp`);
    }

    await sharp(filePath)
      .webp({ quality: 85, effort: 4 })
      .toFile(compressedPath);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn('Warning: Failed to delete original image:', err.message);
    }

    // ✅ بناء الرابط النهائي باستخدام البروتوكول الصح
    const relativePath = compressedPath.replace(/\\/g, '/').split('uploads')[1];
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const fileUrl = `${protocol}://${req.get('host')}/uploads${relativePath}`;

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to process image' });
  }
};

export default uploadImage;
