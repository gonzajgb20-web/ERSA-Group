const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).'), false);
    }
  }
});

// Middleware para comprimir y optimizar imágenes con Sharp
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 80 })
      .toFile(outputPath);

    req.file.filename = filename;
    req.file.path = `/uploads/${filename}`;
    next();
  } catch (err) {
    console.error('Error al optimizar imagen con Sharp:', err);
    next(err);
  }
};

module.exports = {
  upload,
  optimizeImage
};
