const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, responseController.create);
router.get('/:sessionId', authenticate, responseController.getBySession);

module.exports = router;
