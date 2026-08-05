const express = require('express');
const router = express.Router();
const { exportExcel } = require('../controllers/exportController');

router.get('/excel', exportExcel);

module.exports = router;
