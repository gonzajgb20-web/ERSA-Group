const express = require('express');
const router = express.Router();
const { createCambio } = require('../controllers/cambiosController');
const { upload, optimizeImage } = require('../middleware/upload');

router.post('/', upload.single('imagen_comprobante'), optimizeImage, createCambio);

module.exports = router;
