const express = require('express');
const router = express.Router();
const { getInternos, createInterno, deleteInterno } = require('../controllers/internosController');
const { upload, optimizeImage } = require('../middleware/upload');
const { optionalAuthMiddleware } = require('../middleware/auth');

router.get('/', optionalAuthMiddleware, getInternos);
router.post('/', upload.single('imagen'), optimizeImage, createInterno);
router.delete('/:id', deleteInterno);

module.exports = router;
