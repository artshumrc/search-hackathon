const express = require('express');
const router = express.Router();

const apiController = require('../controllers/apiController');

// Set CORS headers and handle preflight requests
router.use((req, res, next) => {
  res.set({
    'Content-type': 'application/json',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers",
  });

  // If this is a preflight, we're done and can send the response with our headers
  if(req.method == 'OPTIONS'){
    return res.status(200).end();
  }
  next();
});

// Handle errors
router.use((err, req, res, next) => {
  if(err) {
    res.status(500).send(JSON.stringify({"code": err.code, "message": err.message}));
    return;
  }
  next(err);
});


router.get('/', apiController.index);
router.post('/loadPassages', apiController.loadPassages);

module.exports = router;
